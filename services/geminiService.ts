import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { LawyerReport, ClientInfo, ReceptionistSettings } from "../types";
import { logger } from "../utils/logger";
import { validateUploadLink, validateCaseSummary, escapeRegex } from "../utils/validators";
import { AudioContextError, ReportGenerationError, APIError, ErrorCode } from "../types/errors";

// --- Audio Utilities ---

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  try {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    if (frameCount === 0) {
      // Return an empty buffer if there's no data to process
      return ctx.createBuffer(numChannels, 0, sampleRate);
    }
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  } catch (error) {
    logger.error('Failed to decode audio data', error instanceof Error ? error : new Error(String(error)), 'decodeAudioData');
    // Return an empty buffer on failure to prevent crashes
    return ctx.createBuffer(numChannels, 0, sampleRate);
  }
}

// --- API Utilities ---

/**
 * Retry logic with exponential backoff
 * FIX: Replaced console.warn/error with structured logging
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        const nextDelay = delay * Math.pow(2, i);
        logger.warn(`API call attempt ${i + 1} failed. Retrying in ${nextDelay}ms...`, error instanceof Error ? error : new Error(String(error)), 'withRetry');
        await new Promise(res => setTimeout(res, nextDelay));
      }
    }
  }
  logger.error('All API retry attempts exhausted', lastError, 'withRetry');
  throw lastError || new APIError(ErrorCode.API_UNAVAILABLE, 'All retry attempts failed');
}


// --- Gemini API ---

/**
 * Generate system instruction for Gemini API
 * FIX: Escapes user-provided settings to prevent prompt injection
 */
export const getSystemInstruction = (settings: ReceptionistSettings) => {
  // Escape template values to prevent prompt injection
  const escapeValue = (val: string): string => val.replace(/\$/g, '\\$').replace(/`/g, '\\`');
  const aiName = escapeValue(settings.aiName);
  const firmName = escapeValue(settings.firmName);
  const tone = escapeValue(settings.tone);
  const languageStyle = escapeValue(settings.languageStyle);
  const firmBio = escapeValue(settings.firmBio);
  const openingLine = escapeValue(settings.openingLine);
  const keywordsList = settings.urgencyKeywords.map(k => `'${k}'`).join(', ');

  return `
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.

You are ${aiName}, a ${tone} AI receptionist for '${firmName}'. Your primary role is to assist potential clients calling after hours. Speak in a ${languageStyle}. Be patient and never interrupt the caller.

**Firm Context & Knowledge Base:**
${firmBio}

**Your interaction MUST follow this exact sequence without deviation:**

1.  **Initial Greeting:** Start the conversation with the exact phrase: "${openingLine}" Do not say anything else until the caller responds.
2.  **Acknowledge Name & Inquire:** Once the caller provides their name, immediately use the \`update_client_info\` tool with their name. Then, greet them using the actual name they provided. Your response should be "Hi [Caller's Name], how may I help you today?", where you replace "[Caller's Name]" with the name the person gave you. You must wait for them to state their name.
3.  **Gather & Summarize Case Details:** Listen actively while the caller explains their situation. Once they have finished, use the \`update_case_details\` tool to save a summary of their issue.
4.  **Inquire About Documents:** After summarizing their case, ask if they have any documents related to their case, such as police reports, medical records, or contracts. If they say yes, ask them to list the documents they have. Use the \`request_documents\` tool to log the documents they mention.
5.  **Information Gathering Sequence:** After you have asked about documents, you MUST gather the remaining information in this specific order:
    a. **Collect Email:** Ask for their email address.
    b. **Confirm Email:** After they provide their email, you MUST spell it back to them for confirmation. For example, if they say 'test@example.com', you must say 'Got it. That's T-E-S-T at example dot com. Is that correct?'. Once confirmed, immediately use the \`update_client_info\` tool with their email.
    c. **Confirm Phone Number:** Ask to confirm if the number they are calling from is the best one to reach them at. If they provide a different number, use the \`update_client_info\` tool with that number.
6.  **Book Appointment:** Once all contact information is gathered, offer to book a free consultation with one of our lawyers. Use the \`book_appointment\` tool to find a suitable time. Suggest a specific time, like "tomorrow at 10 AM".
7.  **Send Confirmation & Closing:** After an appointment is set (or if they decline), inform them that they will receive a confirmation email with a secure link to upload their documents. Use the \`send_follow_up_email\` tool to trigger this. Then, thank them for calling and end the call professionally.

**Critical Task: Urgency Detection**
Your most important task is to identify urgent cases. Listen carefully for keywords like ${keywordsList} or signs of extreme emotional distress (e.g., panic, crying). If you detect any of these, you MUST immediately use the \`flag_case_as_urgent\` tool, providing a brief reason why. This is a priority instruction.`;
};

export const updateClientInfoDeclaration: FunctionDeclaration = {
    name: "update_client_info",
    description: "Updates the client's contact information as it's collected. Use this immediately after confirming a piece of information like their name, email, or phone number.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The client's full name." },
            email: { type: Type.STRING, description: "The client's email address." },
            phone: { type: Type.STRING, description: "The client's phone number." },
        },
    },
};

export const updateCaseDetailsDeclaration: FunctionDeclaration = {
    name: "update_case_details",
    description: "Updates the client's case details. Use this tool after the client has finished explaining their legal situation, before moving on to collect contact information.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A summary of the client's case details provided by them." },
        },
        required: ["summary"],
    },
};

export const requestDocumentsDeclaration: FunctionDeclaration = {
    name: "request_documents",
    description: "Logs the list of documents the client has available for their case. Use this after the client lists the documents they possess.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            documents: {
                type: Type.ARRAY,
                description: "An array of document names mentioned by the client (e.g., ['Police Report', 'Medical Bills']).",
                items: { type: Type.STRING }
            },
        },
        required: ["documents"],
    },
};


export const flagCaseAsUrgentDeclaration: FunctionDeclaration = {
    name: "flag_case_as_urgent",
    description: "Flags the case as urgent for immediate attorney review. Use this IMMEDIATELY if the caller mentions a deadline, court date, statute of limitations, has been arrested, or seems extremely distressed.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            reason: { type: Type.STRING, description: "A brief explanation for why the case is urgent (e.g., 'Upcoming court date mentioned')." },
        },
        required: ["reason"],
    },
};

export const bookAppointmentDeclaration: FunctionDeclaration = {
    name: "book_appointment",
    description: "Books a new client consultation. Use this to schedule an appointment when the user agrees to a time.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING, description: "The client's full name." },
            dateTime: { type: Type.STRING, description: "The appointment date and time in ISO 8601 format." },
        },
        required: ["fullName", "dateTime"],
    },
};

export const sendFollowUpEmailDeclaration: FunctionDeclaration = {
    name: "send_follow_up_email",
    description: "Sends a follow-up email to the client after the conversation is complete.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING, description: "The client's full name." },
            email: { type: Type.STRING, description: "The client's email address." },
        },
        required: ["fullName", "email"],
    },
};

/**
 * Generate comprehensive lawyer report from call transcript
 * FIX: Added input validation and proper error handling
 */
export async function generateLawyerReport(clientInfo: Partial<ClientInfo>, transcript: string, isUrgent: boolean, urgencyReason: string): Promise<LawyerReport> {
    // Validate inputs
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
        throw new ReportGenerationError('Transcript is required and cannot be empty');
    }

    if (!process.env.API_KEY) {
        throw new APIError(ErrorCode.API_KEY_MISSING, 'API key is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Generate secure upload link with validation
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 12);
    const secureUploadLink = `https://tedlaw.secure-uploads.com/${timestamp}-${randomStr}`;

    // Validate upload link
    const uploadValidation = validateUploadLink(secureUploadLink);
    if (!uploadValidation.valid) {
        throw new ReportGenerationError(`Invalid upload link generated: ${uploadValidation.error}`);
    }

    const prompt = `You are a legal analyst AI. Based on the provided new client intake information and the full conversation transcript, generate a confidential internal report for the lead attorney. Fill out all the fields in the requested JSON schema.

Here is the data:
Client Info: ${JSON.stringify(clientInfo)}
Secure Document Upload Link Generated for Client: ${secureUploadLink}
Conversation Transcript:
${transcript}
${isUrgent ? `\nCRITICAL ALERT: This case was flagged as URGENT during the call for the following reason: "${urgencyReason}". Ensure your assessment and the 'urgencyLevel' field reflect this. The urgencyLevel MUST be 'High'.` : ''}`;

    const lawyerReportSchema = {
      type: Type.OBJECT,
      properties: {
          clientDetails: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
              },
              required: ['name', 'email', 'phone']
          },
          caseSummary: {
              type: Type.STRING,
              description: "A concise summary of the client's legal issue."
          },
          initialAssessment: {
              type: Type.STRING,
              description: "An initial assessment of the case, including potential ROI and the area of law. Example: 'Case appears to be a standard slip-and-fall personal injury claim. With potential damages estimated around $50,000 and a standard 33% contingency fee, the potential revenue is ~$16,500. ROI is high given the straightforward nature.' Should be formatted as markdown."
          },
          actionableNextSteps: {
              type: Type.STRING,
              description: "The next immediate actions for the legal team, formatted as a markdown list."
          },
          urgencyLevel: {
              type: Type.STRING,
              description: "The urgency level of the case. Must be one of 'High', 'Medium', or 'Low'."
          },
          documentCollection: {
              type: Type.OBJECT,
              properties: {
                  documentsRequested: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                  },
                  uploadLink: { type: Type.STRING }
              },
              required: ['documentsRequested', 'uploadLink']
          }
      },
      required: ['clientDetails', 'caseSummary', 'initialAssessment', 'actionableNextSteps', 'urgencyLevel', 'documentCollection']
    };

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: lawyerReportSchema,
            }
        });
        const reportText = response.text.trim();
        if (!reportText) {
            throw new Error("Received an empty response from the report generation model.");
        }
        return JSON.parse(reportText) as LawyerReport;
    });
}

export async function generateFollowUpActions(lawyerReport: LawyerReport): Promise<GenerateContentResponse> {
    if (!process.env.API_KEY) {
        throw new Error("API key not found");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert paralegal. Based on the following internal lawyer report JSON object, suggest 3-5 concrete, actionable follow-up steps for the legal team. Frame these as a checklist in markdown. Make them concise and clear.

**Lawyer Report Data:**
${JSON.stringify(lawyerReport, null, 2)}

**Suggested Follow-up Actions:**`;
    
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        if (!response.text) {
            throw new Error("Received an empty response from the follow-up actions model.");
        }
        return response;
    });
}