import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import Chat from '../models/chat.js';

let groqClient;
let geminiClient;

const SYSTEM_PROMPT = `You are an expert clinical assessment assistant. Your goal is to maximize diagnostic accuracy without asking endless questions. Follow this strict 3-phase assessment protocol:
1. RED-FLAG CHECK: First, based on the chief complaint, ask 1 highly specific question to rule out dangerous conditions (e.g., check for appendicitis if stomach ache).
2. DIFFERENTIAL DIAGNOSIS: Once immediate red flags are ruled out, ask 1 or 2 targeted follow-up questions to figure out what the actual issue is (e.g., check for acid reflux, food poisoning, or ulcer for a central stomach ache).
3. FINAL VERDICT: Once you have narrowed down the likely specific cause, provide a concise verdict and stop asking questions.

VERDICT FORMAT:
If you are giving a verdict, you MUST use this exact format on a single line:
VERDICT|[URGENCY]|[ISSUE]|[EXPLAINED_SOLUTIONS]|[MEDICINES]|[SUMMARIZED_SYMPTOMS]

- [URGENCY] must be exactly GREEN, YELLOW, or RED.
- [ISSUE] is a short description of what is wrong. You MUST use simple, everyday language (e.g., "Upset stomach" instead of "Dyspepsia"). NO MEDICAL JARGON.
- [EXPLAINED_SOLUTIONS] must be a list of 2-3 detailed, well-explained actionable steps separated by a tilde (~). Explain why each step helps in detail (not just one line).
    - If URGENCY is YELLOW, one of the steps MUST be "Visit a doctor within 24-48 hours if symptoms do not improve."
    - If URGENCY is RED, one of the steps MUST be "Go to the ER or seek immediate medical attention."
- [MEDICINES] must be a list of specific recommended medicines or treatments separated by a tilde (~). Explain briefly what each is for. If no medicines are needed, output "None".
- [SUMMARIZED_SYMPTOMS] must be a brief summary of the user's symptoms as a bulleted list separated by a tilde (~). Format it like "Pain in stomach~Followed by bloating".

Example: VERDICT|YELLOW|Upset stomach|Rest and stay hydrated to allow your digestive system to recover and prevent dehydration.~Eat bland foods like bananas or rice which are easy to digest and won't irritate your stomach.~Visit a doctor within 24-48 hours if symptoms do not improve.|Antacids like Tums or Rolaids to neutralize stomach acid~Pepto-Bismol to coat the stomach and relieve nausea|Ache near ankle~Pain when walking~Swelling observed

STRICT RULES:
- NEVER use complex medical terminology or jargon. Speak to the user like a caring friend.
- NEVER use the phrase "over-the-counter" or "OTC". Just directly name 1-2 common medicine examples (e.g., "Try a pain reliever like Ibuprofen or Tylenol").
- If the user asks a direct, simple informational question (e.g., "what medicine should I take?", "what does this mean?"), just answer them directly and naturally in plain text. DO NOT force a VERDICT format for simple questions.
- Otherwise, you are either asking a targeted question to narrow down symptoms OR giving the final verdict.
- If asking a question or answering a direct question, just output plain text.
- If giving a verdict, ONLY output the VERDICT|... string. Do not add any other text.
- Provide a verdict after a maximum of 3-4 total user turns.`;

const buildPrompt = (message, history, historicalContext = "") => {
    let prompt = SYSTEM_PROMPT;
    
    if (historicalContext) {
        prompt += `\n\n${historicalContext}`;
    }

    prompt += "\n\n";

    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
    }
    prompt += `User: ${message}\nAssistant:`;
    return prompt;
};

const tryGroq = async (message, history, historicalContext = "") => {
    if (!groqClient) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT + (historicalContext ? `\n\n${historicalContext}` : "") }];
    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
        });
    }
    messages.push({ role: 'user', content: message });

    const completion = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 150,
    });

    return completion.choices[0]?.message?.content;
};

const tryGemini = async (message, history, historicalContext = "") => {
    if (!geminiClient) {
        geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    const prompt = buildPrompt(message, history, historicalContext);
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: prompt,
    });

    return response.text;
};

const extractSummaryFromVerdict = (history) => {
    if (!history || history.length === 0) return "";
    const lastBotMsg = [...history].reverse().find(m => m.sender === 'bot' && m.text.includes('VERDICT|'));
    if (lastBotMsg) {
        const parts = lastBotMsg.text.split('|');
        const issue = parts[2] || '';
        const symptoms = parts[5] || '';
        if (issue || symptoms) {
            const cleanSymptoms = symptoms.replace(/~/g, ', ');
            return `User had ${issue}. Reported symptoms: ${cleanSymptoms}.`;
        }
    }
    return "";
};

export const generateChatResponse = async (req, res) => {
    const { message, history } = req.body;
    const emergencyKeywords = [
  "chest pain",
  "can't breathe",
  "difficulty breathing",
  "seizure",
  "unconscious",
  "stroke",
  "heavy bleeding",
  "heart attack"
];
const isEmergency = emergencyKeywords.some(keyword =>
   message.toLowerCase().includes(keyword)
);

if (isEmergency) {
   return res.json({
      reply:
      "Your symptoms may require immediate medical attention. Please go to the nearest hospital or call emergency services immediately.",
      source: "emergency_override"
   });
}

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        let historicalContext = "";
        if (req.user?._id) {
            const pastChats = await Chat.find({ 
                userId: req.user._id, 
                summary: { $ne: "" } 
            })
            .sort({ updatedAt: -1 })
            .limit(3);

            if (pastChats.length > 0) {
                historicalContext = "--- RECENT PAST ASSESSMENTS ---\n" + 
                    pastChats.map(c => `[Past Session]: ${c.summary}`).join('\n') + 
                    "\nCheck if current symptoms are connected to these past issues.";
            }
        }

        console.log('[Chat] Trying Groq (primary)...');
        const reply = await tryGroq(message, history, historicalContext);
        console.log('[Chat] Groq succeeded.');
        return res.json({ reply, source: 'groq' });
    } catch (groqError) {
        console.warn(`[Chat] Groq failed (${groqError?.status || groqError?.message}). Falling back to Gemini...`);
    }

    try {
        let historicalContext = "";
        if (req.user?._id) {
            const pastChats = await Chat.find({ userId: req.user._id, summary: { $ne: "" } })
                .sort({ updatedAt: -1 })
                .limit(3);
            if (pastChats.length > 0) {
                historicalContext = "--- RECENT PAST ASSESSMENTS ---\n" + 
                    pastChats.map(c => `[Past Session]: ${c.summary}`).join('\n') + 
                    "\nCheck if current symptoms are connected to these past issues.";
            }
        }
        const reply = await tryGemini(message, history, historicalContext);
        console.log('[Chat] Gemini fallback succeeded.');
        return res.json({ reply, source: 'gemini' });
    } catch (geminiError) {
        console.error('[Chat] Both APIs failed.', geminiError);
        const status = geminiError?.status || 500;
        return res.status(status).json({
            error: status === 429
                ? 'All AI services are currently rate-limited. Please wait a minute and try again.'
                : 'Failed to generate a response. Please try again shortly.',
        });
    }
};

export const getRecentChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id })
                                .sort({ updatedAt: -1 })
                                .select('-messages'); // Don't send full messages array for list
        res.json(chats);
    } catch (error) {
        console.error("Error fetching recent chats:", error);
        res.status(500).json({ error: "Failed to fetch recent chats" });
    }
};

export const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
        if (!chat) return res.status(404).json({ error: "Chat not found" });
        res.json(chat);
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
};

export const saveChat = async (req, res) => {
    try {
        const { chatId, history } = req.body;
        
        if (!history || history.length === 0) {
            return res.status(400).json({ error: "History is required" });
        }

        let chat;
        const summary = extractSummaryFromVerdict(history);

        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
            if (!chat) return res.status(404).json({ error: "Chat not found" });
            chat.messages = history;
            if (summary) chat.summary = summary;
            await chat.save();
        } else {
            // Generate a simple title from the first user message
            const firstMsg = history.find(m => m.sender === 'user')?.text || "New Assessment";
            // take first 30 chars
            const title = firstMsg.length > 30 ? firstMsg.substring(0, 30) + "..." : firstMsg;
            
            chat = new Chat({
                userId: req.user._id,
                title: title,
                summary: summary,
                messages: history
            });
            await chat.save();
        }
        res.json({ success: true, chatId: chat._id, title: chat.title });
    } catch (error) {
        console.error("Error saving chat:", error);
        res.status(500).json({ error: "Failed to save chat" });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!chat) return res.status(404).json({ error: "Chat not found" });
        res.json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Failed to delete chat" });
    }
};

export const getRecentHistory = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const chats = await Chat.find({ 
            userId: req.user._id,
            updatedAt: { $gte: thirtyDaysAgo }
        })
        .sort({ updatedAt: -1 });
        
        res.json(chats);
    } catch (error) {
        console.error("Error fetching 30-day history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

