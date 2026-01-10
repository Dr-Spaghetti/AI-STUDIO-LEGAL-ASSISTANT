// ============================================
// Emergency Detection API Endpoint
// ============================================
// Analyzes messages for emergency situations

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Emergency detection patterns (duplicated for serverless function)
type EmergencyType =
  | 'suicide_risk'
  | 'domestic_violence'
  | 'child_abuse'
  | 'immediate_danger'
  | 'medical_emergency'
  | 'elder_abuse';

const EMERGENCY_PATTERNS: Record<EmergencyType, RegExp[]> = {
  suicide_risk: [
    /\b(want(s|ing)?|going) to (kill|end|hurt) (myself|my life)\b/i,
    /\b(suicid(e|al)|self[- ]harm|end it all)\b/i,
    /\b(don'?t want to (live|be here|exist))\b/i,
    /\b(better off (dead|without me))\b/i,
    /\b(no reason to (live|go on))\b/i,
  ],
  domestic_violence: [
    /\b(partner|spouse|husband|wife|boyfriend|girlfriend).*(hit(s|ting)?|beat(s|ing)?|hurt(s|ing)?|abus(e|ing))\b/i,
    /\b(domestic (violence|abuse))\b/i,
    /\b(he|she) (hit|beat|chok|strang|punch|kick)(s|ed|ing)? me\b/i,
    /\bafraid.*(go|come) home\b/i,
  ],
  child_abuse: [
    /\b(child|kid|minor|son|daughter).*(abus(e|ed|ing)|neglect|molest|hurt)\b/i,
    /\b(sexual|physical) abuse.*(child|minor)\b/i,
    /\b(cps|child protective)\b/i,
  ],
  immediate_danger: [
    /\b(someone|he|she|they).*(trying to |going to )?(kill|hurt|attack) me\b/i,
    /\b(in (immediate )?danger)\b/i,
    /\b(need (police|help|911) (now|immediately))\b/i,
    /\b(being (followed|stalked|threatened))\b/i,
  ],
  medical_emergency: [
    /\b(can'?t breathe|difficulty breathing|choking)\b/i,
    /\b(heart attack|stroke|seizure)\b/i,
    /\b(severe (bleeding|pain|injury))\b/i,
    /\b(unconscious|unresponsive)\b/i,
  ],
  elder_abuse: [
    /\b(elder|elderly|senior|parent|grandparent).*(abus(e|ed|ing)|neglect|exploit)\b/i,
    /\b(caregiver|nursing home).*(abus(e|ed|ing)|neglect)\b/i,
  ],
};

const EMERGENCY_RESOURCES: Record<EmergencyType, { name: string; number: string }[]> = {
  suicide_risk: [
    { name: 'National Suicide Prevention Lifeline', number: '988' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
  ],
  domestic_violence: [
    { name: 'National Domestic Violence Hotline', number: '1-800-799-7233' },
  ],
  child_abuse: [
    { name: 'Childhelp National Child Abuse Hotline', number: '1-800-422-4453' },
  ],
  immediate_danger: [
    { name: 'Emergency Services', number: '911' },
  ],
  medical_emergency: [
    { name: 'Emergency Services', number: '911' },
    { name: 'Poison Control', number: '1-800-222-1222' },
  ],
  elder_abuse: [
    { name: 'Eldercare Locator', number: '1-800-677-1116' },
  ],
};

interface RequestBody {
  tenant_id: string;
  lead_id: string;
  message: string;
  lead_name?: string;
  lead_phone?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenant_id, lead_id, message, lead_name, lead_phone }: RequestBody = req.body;

  if (!tenant_id || !lead_id || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Detect emergency
  const matchedPatterns: string[] = [];
  let detectedType: EmergencyType | undefined;
  let highestConfidence = 0;

  for (const [type, patterns] of Object.entries(EMERGENCY_PATTERNS)) {
    let typeMatches = 0;

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        typeMatches++;
        matchedPatterns.push(match[0]);
      }
    }

    if (typeMatches > 0) {
      const confidence = Math.min(typeMatches / 3, 1);
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        detectedType = type as EmergencyType;
      }
    }
  }

  // No emergency detected
  if (!detectedType) {
    return res.status(200).json({
      isEmergency: false,
      confidence: 0,
      matchedPatterns: [],
    });
  }

  // Emergency detected - log to database
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      // Create emergency event
      await fetch(`${SUPABASE_URL}/rest/v1/emergency_events`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          tenant_id,
          lead_id,
          type: detectedType,
          confidence: highestConfidence,
          matched_patterns: matchedPatterns,
          message_content: message.substring(0, 500), // Truncate for storage
          status: 'detected',
        }),
      });

      // Update lead with emergency flag
      await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead_id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          emergency_flag: true,
          updated_at: new Date().toISOString(),
        }),
      });

      // Log to audit
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          tenant_id,
          action: 'emergency_detected',
          entity_type: 'lead',
          entity_id: lead_id,
          details: {
            type: detectedType,
            confidence: highestConfidence,
            matched_patterns: matchedPatterns,
          },
        }),
      });

      // Get tenant notification settings
      const tenantResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/tenants?id=eq.${tenant_id}&select=settings`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );

      const tenants = await tenantResponse.json();
      const tenant = tenants[0];

      // Send webhook notification if configured
      if (tenant?.settings?.emergency_webhook_url) {
        await fetch(tenant.settings.emergency_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'emergency_alert',
            priority: 'critical',
            tenant_id,
            lead_id,
            lead_name,
            lead_phone,
            emergency_type: detectedType,
            confidence: highestConfidence,
            matched_content: matchedPatterns,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => console.error('Webhook notification failed:', err));
      }
    } catch (err) {
      console.error('Failed to log emergency:', err);
    }
  }

  // Return response with resources
  return res.status(200).json({
    isEmergency: true,
    type: detectedType,
    confidence: highestConfidence,
    matchedPatterns,
    priority: 'critical',
    resources: EMERGENCY_RESOURCES[detectedType] || [],
    suggestedResponse: getCrisisResponse(detectedType),
  });
}

function getCrisisResponse(type: EmergencyType): string {
  const responses: Record<EmergencyType, string> = {
    suicide_risk: `I'm very concerned about what you've shared. Your life matters, and there are people who want to help. Please reach out to the National Suicide Prevention Lifeline at 988 - they're available 24/7. If you're in immediate danger, please call 911.`,
    domestic_violence: `I hear you, and I want you to know that you don't deserve to be treated this way. Your safety is the most important thing. The National Domestic Violence Hotline at 1-800-799-7233 has trained advocates available 24/7. If you're in immediate danger, please call 911.`,
    child_abuse: `Thank you for sharing this. Protecting children is very important. If a child is in immediate danger, please call 911. You can also contact the Childhelp National Child Abuse Hotline at 1-800-422-4453 for guidance.`,
    immediate_danger: `Your safety is the priority right now. If you're in immediate danger, please call 911 immediately. Is there somewhere safe you can go right now?`,
    medical_emergency: `This sounds like a medical emergency. Please call 911 immediately for emergency medical services. The dispatcher can provide instructions until help arrives.`,
    elder_abuse: `I'm sorry you're dealing with this situation. You can contact the Eldercare Locator at 1-800-677-1116 to find local resources and support. If there's immediate danger, please call 911.`,
  };

  return responses[type];
}
