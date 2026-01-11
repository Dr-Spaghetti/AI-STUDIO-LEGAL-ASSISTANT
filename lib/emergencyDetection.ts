// ============================================
// Emergency Detection System
// ============================================
// Detects crisis situations and triggers appropriate responses

// ============================================
// TYPES
// ============================================

export type EmergencyType =
  | 'suicide_risk'
  | 'domestic_violence'
  | 'child_abuse'
  | 'immediate_danger'
  | 'medical_emergency'
  | 'elder_abuse';

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  type?: EmergencyType;
  confidence: number; // 0-1
  matchedPatterns: string[];
  suggestedAction: EmergencyAction;
  resources: EmergencyResource[];
}

export interface EmergencyAction {
  type: 'alert_staff' | 'provide_resources' | 'escalate_immediately' | 'continue_monitoring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface EmergencyResource {
  name: string;
  number: string;
  description: string;
  available24x7: boolean;
}

export interface EmergencyEvent {
  id: string;
  tenant_id: string;
  lead_id: string;
  type: EmergencyType;
  confidence: number;
  matched_patterns: string[];
  message_content: string;
  status: 'detected' | 'acknowledged' | 'resolved' | 'escalated';
  created_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  notes?: string;
}

// ============================================
// DETECTION PATTERNS
// ============================================

const EMERGENCY_PATTERNS: Record<EmergencyType, RegExp[]> = {
  suicide_risk: [
    /\b(want(s|ing)?|going) to (kill|end|hurt) (myself|my life)\b/i,
    /\b(suicid(e|al)|self[- ]harm|end it all)\b/i,
    /\b(don'?t want to (live|be here|exist))\b/i,
    /\b(better off (dead|without me))\b/i,
    /\b(no reason to (live|go on))\b/i,
    /\b(plan(ning)? to (die|kill myself))\b/i,
    /\b(goodbye|final message|last words)\b/i,
    /\b(overdose|pills|jump|hang(ing)?)\b/i,
  ],
  domestic_violence: [
    /\b(partner|spouse|husband|wife|boyfriend|girlfriend).*(hit(s|ting)?|beat(s|ing)?|hurt(s|ing)?|abus(e|ing)|attack(s|ing)?)\b/i,
    /\b(domestic (violence|abuse))\b/i,
    /\b(he|she) (hit|beat|chok|strang|punch|kick)(s|ed|ing)? me\b/i,
    /\bafraid.*(go|come) home\b/i,
    /\b(threaten(s|ed|ing)?|scared for) my (life|safety)\b/i,
    /\brestrain(ing)? order\b/i,
    /\b(physical|emotional|verbal) abuse\b/i,
  ],
  child_abuse: [
    /\b(child|kid|minor|son|daughter).*(abus(e|ed|ing)|neglect|molest|hurt|hit|beat)\b/i,
    /\b(abus(e|ed|ing)|neglect|molest|hurt).*(child|kid|minor|son|daughter)\b/i,
    /\b(sexual|physical) abuse.*(child|minor)\b/i,
    /\b(cps|child protective)\b/i,
    /\b(inappropriate|touch|molest).*(child|kid|minor)\b/i,
  ],
  immediate_danger: [
    /\b(someone|he|she|they).*(trying to |going to |wants to )?(kill|hurt|attack|harm) me\b/i,
    /\b(in (immediate )?danger)\b/i,
    /\b(need (police|help|911) (now|immediately|right now))\b/i,
    /\b(being (followed|stalked|threatened))\b/i,
    /\b(gun|weapon|knife).*(pointing|threatening|aimed)\b/i,
    /\b(break(ing)? in(to)?|intruder|home invasion)\b/i,
  ],
  medical_emergency: [
    /\b(can'?t breathe|difficulty breathing|choking)\b/i,
    /\b(heart attack|stroke|seizure)\b/i,
    /\b(severe (bleeding|pain|injury))\b/i,
    /\b(unconscious|unresponsive|not breathing)\b/i,
    /\b(overdos(e|ing)|poison(ed|ing)?)\b/i,
    /\b(need (ambulance|emt|paramedic))\b/i,
  ],
  elder_abuse: [
    /\b(elder|elderly|senior|parent|grandparent).*(abus(e|ed|ing)|neglect|exploit|mistreat)\b/i,
    /\b(caregiver|nursing home).*(abus(e|ed|ing)|neglect|steal)\b/i,
    /\b(financial (exploitation|abuse)).*(elder|senior|parent)\b/i,
    /\b(taking (money|assets) from).*(elder|parent|grandparent)\b/i,
  ],
};

// Priority levels for each emergency type
const EMERGENCY_PRIORITIES: Record<EmergencyType, 'high' | 'critical'> = {
  suicide_risk: 'critical',
  domestic_violence: 'critical',
  child_abuse: 'critical',
  immediate_danger: 'critical',
  medical_emergency: 'critical',
  elder_abuse: 'high',
};

// ============================================
// RESOURCES
// ============================================

const EMERGENCY_RESOURCES: Record<EmergencyType, EmergencyResource[]> = {
  suicide_risk: [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: 'Free, confidential support for people in distress',
      available24x7: true,
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free crisis counseling via text message',
      available24x7: true,
    },
    {
      name: 'Veterans Crisis Line',
      number: '988 (Press 1)',
      description: 'Support for veterans and their families',
      available24x7: true,
    },
  ],
  domestic_violence: [
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: 'Support, resources, and safety planning',
      available24x7: true,
    },
    {
      name: 'National Dating Abuse Helpline',
      number: '1-866-331-9474',
      description: 'Support for young people in abusive relationships',
      available24x7: true,
    },
  ],
  child_abuse: [
    {
      name: 'Childhelp National Child Abuse Hotline',
      number: '1-800-422-4453',
      description: 'Crisis intervention and support',
      available24x7: true,
    },
    {
      name: 'Child Protective Services',
      number: 'Varies by state',
      description: 'Report suspected child abuse or neglect',
      available24x7: true,
    },
  ],
  immediate_danger: [
    {
      name: 'Emergency Services',
      number: '911',
      description: 'Police, fire, and medical emergencies',
      available24x7: true,
    },
  ],
  medical_emergency: [
    {
      name: 'Emergency Services',
      number: '911',
      description: 'Request ambulance and emergency medical care',
      available24x7: true,
    },
    {
      name: 'Poison Control',
      number: '1-800-222-1222',
      description: 'Immediate help for poisoning emergencies',
      available24x7: true,
    },
  ],
  elder_abuse: [
    {
      name: 'Eldercare Locator',
      number: '1-800-677-1116',
      description: 'Connect to local elder abuse resources',
      available24x7: false,
    },
    {
      name: 'Adult Protective Services',
      number: 'Varies by state',
      description: 'Report suspected elder abuse or neglect',
      available24x7: true,
    },
  ],
};

// ============================================
// DETECTION FUNCTIONS
// ============================================

/**
 * Analyze text for emergency situations
 */
export function detectEmergency(text: string): EmergencyDetectionResult {
  const matchedPatterns: string[] = [];
  let detectedType: EmergencyType | undefined;
  let highestConfidence = 0;

  // Check each emergency type
  for (const [type, patterns] of Object.entries(EMERGENCY_PATTERNS)) {
    let typeMatches = 0;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        typeMatches++;
        matchedPatterns.push(match[0]);
      }
    }

    if (typeMatches > 0) {
      // Calculate confidence based on number of pattern matches
      const confidence = Math.min(typeMatches / 3, 1); // Max out at 3 matches

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        detectedType = type as EmergencyType;
      }
    }
  }

  // No emergency detected
  if (!detectedType) {
    return {
      isEmergency: false,
      confidence: 0,
      matchedPatterns: [],
      suggestedAction: {
        type: 'continue_monitoring',
        priority: 'low',
        message: 'No emergency indicators detected',
      },
      resources: [],
    };
  }

  // Emergency detected
  const priority = EMERGENCY_PRIORITIES[detectedType];

  return {
    isEmergency: true,
    type: detectedType,
    confidence: highestConfidence,
    matchedPatterns,
    suggestedAction: {
      type: priority === 'critical' ? 'escalate_immediately' : 'alert_staff',
      priority,
      message: getEmergencyMessage(detectedType),
    },
    resources: EMERGENCY_RESOURCES[detectedType] || [],
  };
}

/**
 * Get user-facing message for emergency type
 */
function getEmergencyMessage(type: EmergencyType): string {
  const messages: Record<EmergencyType, string> = {
    suicide_risk:
      'This person may be experiencing thoughts of self-harm. Immediate intervention recommended.',
    domestic_violence:
      'Potential domestic violence situation detected. Safety planning resources should be provided.',
    child_abuse:
      'Possible child abuse or neglect indicated. Mandatory reporting may be required.',
    immediate_danger:
      'Person appears to be in immediate physical danger. Consider contacting emergency services.',
    medical_emergency:
      'Medical emergency indicators detected. Emergency medical services may be needed.',
    elder_abuse:
      'Potential elder abuse or exploitation detected. Adult Protective Services may need to be contacted.',
  };

  return messages[type];
}

/**
 * Generate empathetic response for crisis situations
 */
export function generateCrisisResponse(type: EmergencyType): string {
  const responses: Record<EmergencyType, string> = {
    suicide_risk: `I'm very concerned about what you've shared. Your life matters, and there are people who want to help. Please reach out to the National Suicide Prevention Lifeline at 988 - they're available 24/7 and can provide immediate support. If you're in immediate danger, please call 911. I'm here to listen, but trained crisis counselors can provide the specialized help you deserve right now.`,

    domestic_violence: `I hear you, and I want you to know that you don't deserve to be treated this way. Your safety is the most important thing right now. The National Domestic Violence Hotline at 1-800-799-7233 has trained advocates available 24/7 who can help you create a safety plan. If you're in immediate danger, please call 911. You're not alone in this.`,

    child_abuse: `Thank you for sharing this. Protecting children is incredibly important, and you're doing the right thing by speaking up. If a child is in immediate danger, please call 911. You can also contact the Childhelp National Child Abuse Hotline at 1-800-422-4453 for guidance. Would you like help finding your local Child Protective Services number?`,

    immediate_danger: `Your safety is the priority right now. If you're in immediate danger, please call 911 immediately. Stay on the line with the dispatcher and follow their instructions. If you can safely move to a secure location, please do so. Is there somewhere safe you can go right now?`,

    medical_emergency: `This sounds like a medical emergency. Please call 911 immediately for emergency medical services. If someone is with you, have them call while you stay with the person who needs help. The dispatcher can provide instructions until help arrives. Please don't delay - call 911 now.`,

    elder_abuse: `I'm sorry you're dealing with this situation. Elder abuse is serious and help is available. You can contact the Eldercare Locator at 1-800-677-1116 to find local resources and support. If there's immediate danger, please call 911. Would you like help finding Adult Protective Services in your area?`,
  };

  return responses[type];
}

/**
 * Format emergency resources for display
 */
export function formatResourcesForDisplay(resources: EmergencyResource[]): string {
  return resources
    .map((r) => `${r.name}: ${r.number}${r.available24x7 ? ' (24/7)' : ''}\n${r.description}`)
    .join('\n\n');
}

// ============================================
// WEBHOOK NOTIFICATION
// ============================================

export interface EmergencyNotification {
  tenant_id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  emergency_type: EmergencyType;
  confidence: number;
  matched_content: string[];
  timestamp: string;
}

/**
 * Send emergency notification to configured webhook
 */
export async function sendEmergencyNotification(
  webhookUrl: string,
  notification: EmergencyNotification
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'emergency_alert',
        priority: 'critical',
        ...notification,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send emergency notification:', error);
    return false;
  }
}

/**
 * Send SMS alert to on-call staff
 */
export async function sendEmergencySMSAlert(
  twilioClient: { sendSMS: (to: string, body: string) => Promise<{ success: boolean }> },
  phoneNumber: string,
  notification: EmergencyNotification
): Promise<boolean> {
  const message = `🚨 EMERGENCY ALERT\n\nType: ${notification.emergency_type.replace(/_/g, ' ').toUpperCase()}\nLead: ${notification.lead_name}\nPhone: ${notification.lead_phone}\nConfidence: ${Math.round(notification.confidence * 100)}%\n\nImmediate attention required.`;

  try {
    const result = await twilioClient.sendSMS(phoneNumber, message);
    return result.success;
  } catch (error) {
    console.error('Failed to send emergency SMS:', error);
    return false;
  }
}
