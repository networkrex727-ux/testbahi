const AI_PROXY_URL = "/api/ai/proxy";
const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";

export const AVAILABLE_MODELS = [
  "google/gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-5-sonnet"
];

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export const chatWithAI = async (messages: ChatMessage[], model: string = DEFAULT_MODEL) => {
  try {
    const response = await fetch(AI_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    return data.content || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    throw new Error(`AI Chat Error: ${error.message}`);
  }
};

export const analyzeImage = async (base64Image: string, planDetails: string, validRecipients: string[] = ["Sahid Anime 4 You", "SK HAMJA", "btthhindidubmasala@okicici"]) => {
  const recipientsList = validRecipients.join(", ");
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const prompt = `
    You are an intelligent assistant for SahidAnime.
    Today's Date: ${currentDate}
    Current Time: ${currentTime}

    Your task is to analyze the provided image. 
    
    1. If the image is a **Payment Screenshot** (UPI, Bank Transfer, etc.):
       - Extraction: Extract amount, UTR/Transaction ID, and recipient name.
       - Verification: BE EXTREMELY LENIENT. If it looks like a payment screenshot, APPROVE IT.
       - CRITICAL: If the amount is ₹50, ₹100, or ₹800, approve it immediately for the respective plan.
       - CRITICAL: Even if the recipient name or UTR is slightly different or hard to read, APPROVE IT if it looks like a real payment.
       - CRITICAL: DO NOT check the date or time.
       - Respond with type: "PAYMENT".
       - If verified, tell them: "✅ Payment Verified! Aapka coupon code generate ho gaya hai. Isko redeem page par use karein: [Link to Redeem]"

    2. If the user says something like "Mujhe plan chahie", "I need a plan", "Plans dikhao", etc.:
       - List all available plans ONLY in INR (₹):
         * Garib Pro Max: ₹50
         * VIP: ₹100
         * Yearly: ₹800
       - DO NOT mention Dollars ($) or any other currency unless specifically asked.
       - Tell them to pay the exact amount in INR (₹) to one of the UPI IDs and send the screenshot here.

    3. If the image is **NOT a payment screenshot** (e.g., a selfie, a landscape, a meme, anime art, etc.):
       - Analyze what is in the image.
       - Respond with type: "GENERAL".

    Respond ONLY with a JSON object:
    {
      "type": "PAYMENT" | "GENERAL",
      "paymentInfo": {
        "status": "APPROVED" | "PARTIAL" | "REJECTED",
        "utr": "extracted_utr_or_null",
        "battery": "extracted_battery_percentage_or_null",
        "amount": number,
        "recipient": "extracted_name",
        "reason": "Reason if REJECTED or PARTIAL (in Hinglish style - Hindi/English mix). Be clear that we only accept INR (₹)."
      },
      "generalInfo": {
        "description": "A brief description of what you see in the image (in Hinglish style)",
        "reaction": "A friendly reaction or comment about the image (in Hinglish style)"
      }
    }
    
    Be extremely strict with payments. If you are unsure if it's a payment, mark it as GENERAL.
  `;

  try {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ];

    const response = await fetch(AI_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": DEFAULT_MODEL,
        "messages": messages
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    return data.content || data.text || (typeof data === 'string' ? data : "REJECTED: Could not analyze image.");
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error(`AI Analysis Error: ${error.message}`);
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const response = await fetch("/api/ai/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`TTS Error: ${response.status}`);
    }

    const data = await response.json();
    return data.audio;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
};
