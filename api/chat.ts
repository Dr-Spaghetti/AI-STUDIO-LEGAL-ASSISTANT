// ============================================
// Vercel Serverless Function - AI Chat
// ============================================
// This moves AI API calls server-side to:
// 1. Protect API keys from client exposure
// 2. Enable proper audit logging
// 3. Support emergency detection
// 4. Generate structured lead output

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  tenantId: string;
  conversationId?: string;
  leadId?: string;
  jurisdictionState?: string;
}

interface ChatResponse {
  message: string;
  emergency?: {
    detected: boolean;
    type?: string;
    severity?: 'critical' | 'high' | 'medium';
  };
  leadUpdate?: {
    contact?: Record<string, unknown>;
    case?: Record<string, unknown>;
    qualification?: Record<string, unknown>;
  };
  suggestedNextStep?: string;
}

// Emergency detection keywords and patterns
const EMERGENCY_PATTERNS = {
  suicide: [
    /\b(suicide|suicidal|kill myself|end my life|want to die|better off dead)\b/i,
    /\b(self[- ]?harm|hurt myself|cutting myself)\b/i,
  ],
  domestic_violence: [
    /\b(hitting me|beat me|abusing me|domestic violence|abusive (partner|spouse|husband|wife))\b/i,
    /\b(he('s| is) hurting me|she('s| is) hurting me|scared for my life)\b/i,
  ],
  child_abuse: [
    /\b(child abuse|hurting (my |the )?child|molest|abusing (my |the )?kid)\b/i,
  ],
  immediate_danger: [
    /\b(in danger|help me now|emergency|someone is here|breaking in)\b/i,
    /\b(being followed|stalker is here|armed)\b/i,
  ],
  medical: [
    /\b(can't breathe|heart attack|overdose|bleeding out)\b/i,
  ],
};

function detectEmergency(text: string): { detected: boolean; type?: string; severity?: 'critical' | 'high' | 'medium' } {
  for (const [type, patterns] of Object.entries(EMERGENCY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return {
          detected: true,
          type,
          severity: type === 'suicide' || type === 'immediate_danger' ? 'critical' : 'high',
        };
      }
    }
  }
  return { detected: false };
}

// System prompt for legal intake
function getSystemPrompt(tenantConfig?: Record<string, unknown>, jurisdictionState?: string): string {
  const firmName = (tenantConfig?.name as string) || 'the law firm';
  const practiceAreas = (tenantConfig?.practice_areas as string[]) || ['Personal Injury', 'Family Law', 'Criminal Defense'];
  const tone = (tenantConfig?.tone as string) || 'professional';

  const toneInstructions = {
    professional: 'Maintain a professional, courteous demeanor. Be thorough but efficient.',
    friendly: 'Be warm and approachable while remaining professional. Show empathy.',
    formal: 'Use formal language and maintain a structured, business-like approach.',
  };

  return `You are an AI legal intake assistant for ${firmName}. Your role is to gather information about potential clients' legal matters.

IMPORTANT GUIDELINES:
1. You are NOT a lawyer and cannot provide legal advice
2. No attorney-client relationship is formed through this conversation
3. Gather: name, contact info, case type, incident details, urgency
4. Be empathetic but focused on gathering relevant information
5. If someone appears to be in crisis or danger, acknowledge their situation and provide crisis resources

PRACTICE AREAS: ${practiceAreas.join(', ')}

TONE: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}

${jurisdictionState ? `JURISDICTION: The caller is located in ${jurisdictionState}. Be aware of state-specific considerations.` : ''}

STRUCTURE YOUR INFORMATION GATHERING:
1. Understand the nature of their legal issue
2. Get basic contact information (name, phone, email)
3. Gather case-specific details (dates, parties involved, documents)
4. Assess urgency and any time-sensitive matters (statutes of limitations)
5. Explain next steps (attorney review, callback timeframe)

If you detect an emergency situation:
- Acknowledge their distress
- Provide relevant crisis resources (911 for emergencies, 988 for mental health crisis)
- Do not continue with normal intake until safety is addressed`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, tenantId, conversationId, leadId, jurisdictionState } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // Check for emergency in the latest user message
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    let emergencyInfo = { detected: false };

    if (latestUserMessage) {
      emergencyInfo = detectEmergency(latestUserMessage.content);
    }

    // Build messages for Gemini
    const systemPrompt = getSystemPrompt(undefined, jurisdictionState);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            ...messages.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
          ],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      res.status(500).json({ error: 'AI service error' });
      return;
    }

    const geminiData = await geminiResponse.json();
    const assistantMessage =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I'm having trouble processing your request. Please try again.";

    // Build response
    const response: ChatResponse = {
      message: assistantMessage,
    };

    // Include emergency info if detected
    if (emergencyInfo.detected) {
      response.emergency = emergencyInfo as ChatResponse['emergency'];

      // Prepend emergency resources to message
      const emergencyPrefix = `
**IMPORTANT**: I'm concerned about your safety.

If you're in immediate danger, please call **911**.
For mental health crisis support, call **988** (Suicide & Crisis Lifeline).
For domestic violence support, call **1-800-799-7233** (National DV Hotline).

---

`;
      response.message = emergencyPrefix + assistantMessage;
    }

    // Log the interaction (would go to Supabase in production)
    console.log('Chat interaction:', {
      tenantId,
      conversationId,
      leadId,
      messageCount: messages.length,
      emergencyDetected: emergencyInfo.detected,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Chat handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
