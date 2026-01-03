import { GoogleGenAI, Chat } from "@google/genai";
import { AppMode, Message } from "../types";
import { storageService } from "./storageService";

// Helper to get the AI instance.
// STRICT RULE: Only use process.env.API_KEY. Admin config cannot override strict env security.
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key eksik. Lütfen .env dosyasını kontrol edin.");
  }
  
  return new GoogleGenAI({ apiKey: apiKey });
};

// Now retrieves the prompt from the "Database" (LocalStorage) managed by Admin Panel
export const getSystemInstruction = (mode: AppMode): string => {
  const config = storageService.getConfig();
  const prompts = config.systemPrompts;
  
  // Base guardrail to ensure safety even if admin deletes everything
  const safetyBase = "ÖNEMLİ: Sen bir Yapay Zeka Yazarsın. Sadece yazarlık ve yaratıcılık ile ilgili konularda yardımcı ol.";

  let instruction = "";

  switch (mode) {
    case AppMode.BOOK:
      instruction = prompts.book;
      break;
    case AppMode.SCRIPT:
      instruction = prompts.script;
      break;
    case AppMode.CHAT:
    default:
      instruction = prompts.chat;
      break;
  }

  // Fallback if empty
  if (!instruction || instruction.length < 10) {
     return `${safetyBase} Lütfen kullanıcıya hikaye yazımında yardımcı ol.`;
  }

  return `${safetyBase}\n\n${instruction}`;
};

export const createChatSession = (mode: AppMode, history: Message[]) => {
  const ai = getAIInstance();
  const historyFormatted = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const chat: Chat = ai.chats.create({
    model: 'gemini-3-pro-preview', // High quality for writing
    config: {
      // Dynamic Instruction from DB
      systemInstruction: getSystemInstruction(mode),
      temperature: 0.8, // Slightly higher creativity for fiction
    },
    history: historyFormatted
  });
  
  return chat;
};

export const optimizePrompt = async (rawInput: string, type: string): Promise<string> => {
  const ai = getAIInstance();
  
  const prompt = `Aşağıdaki ham kullanıcı fikrini, bir Yapay Zeka modeline verilmek üzere MÜKEMMEL, DETAYLI ve PROFESYONEL bir 'System Instruction' veya 'Prompt'a dönüştür.
  
  Hedef: Bu prompt kullanıldığında yapay zeka en iyi hikayeyi/senaryoyu yazmalı.
  
  İçerik Türü: ${type}
  Kullanıcı Fikri: ${rawInput}
  
  Oluşturacağın prompt şunları içermeli:
  1. Rol Ataması (Persona)
  2. Görev Tanımı (Task)
  3. Bağlam ve Detaylar (Context)
  4. Ton ve Stil Yönergeleri (Tone & Style)
  5. Format Kısıtlamaları
  
  Lütfen çıktıda sadece oluşturduğun PROMPT metnini ver, başka bir açıklama yapma.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: {
      temperature: 0.7,
      systemInstruction: "Sen uzman bir Prompt Mühendisi ve Yaratıcı Yazarlık Koçusun. Görevin basit fikirleri, LLM'ler için optimize edilmiş yüksek kaliteli girdilere dönüştürmektir."
    }
  });

  return response.text || "Prompt oluşturulamadı.";
};

export const generateVideo = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation.error) {
    throw new Error((operation.error as any).message);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Video URI bulunamadı.");
  }

  return videoUri;
};

export const openKeySelection = async () => {
  const win = window as any;
  if (win.aistudio) {
    await win.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio client not available in this environment.");
  }
};