import { GoogleGenAI, Type } from "@google/genai";
import { Message, Attachment, QuizItem, Flashcard, RoadmapStep } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the SDK once
const genAI = new GoogleGenAI(API_KEY);

/**
 * MASTER PROMPT: Defines the core behavior of the AI.
 */
const SYSTEM_INSTRUCTION = `You are a Master DSA Mentor and Senior Software Engineer. Your goal is to guide users through Data Structures and Algorithms with total mastery, covering platforms like LeetCode, Codeforces, and GeeksforGeeks.

STRICT CODE LANGUAGE RULE:
- ALWAYS provide code implementations in C++ (using modern standards like C++17 or C++20).
- ONLY switch to Python, Java, or other languages if the user explicitly requests them in their prompt.

STRICT RESPONSE STRUCTURE (Use these EXACT bold headings, NO # symbols):

1. **PROBLEM ANALYSIS**
2. **BRUTE FORCE APPROACH**
3. **INTUITION FOR OPTIMIZATION**
4. **DRY RUN**
5. **OPTIMIZED C++ IMPLEMENTATION**
6. **COMPLEXITY ANALYSIS**
7. **MENTOR'S INTERVIEW TIPS**

STRICT FORMATTING:
- NO # headers. Use **BOLD CAPS** instead.
- NO LaTeX/Math symbols. Use plain text (e.g., n^2).
- Redirect non-DSA queries back to algorithms.`;

export const sendMessageToGemini = async (messages: Message[], attachment?: Attachment): Promise<string> => {
  // Use 1.5-pro for the main tutor for higher reasoning quality
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  const lastMessage = messages[messages.length - 1];
  
  // Prepare history (excluding current message)
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const chat = model.startChat({ history });

  const currentParts: any[] = [{ text: lastMessage.content }];
  
  if (attachment) {
    currentParts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
  }

  const result = await chat.sendMessage(currentParts);
  const response = await result.response;
  return response.text();
};

export const generateQuizzes = async (context: string): Promise<QuizItem[]> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  const response = await model.generateContent(`Generate 3 high-quality DSA quizzes for this context. Context: ${context}`);
  return JSON.parse(response.response.text() || "[]");
};

export const generateFlashcards = async (context: string): Promise<Flashcard[]> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });

  const response = await model.generateContent(`Generate 5 flashcards for active recall. Context: ${context}`);
  return JSON.parse(response.response.text() || "[]");
};

export const generateRoadmap = async (topic: string): Promise<RoadmapStep[]> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedTime: { type: Type.STRING }
          },
          required: ["title", "description", "estimatedTime"]
        }
      }
    }
  });

  const response = await model.generateContent(`Generate a 5-step learning roadmap for: ${topic}`);
  return JSON.parse(response.response.text() || "[]");
};
