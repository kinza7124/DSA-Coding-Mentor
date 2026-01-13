
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Attachment, QuizItem, Flashcard, RoadmapStep } from "../types";

/**
 * MASTER PROMPT: Defines the core behavior of the AI.
 * UPDATED: Strictly enforces C++ as the primary language.
 */
const SYSTEM_INSTRUCTION = `You are a Master DSA Mentor and Senior Software Engineer. Your goal is to guide users through Data Structures and Algorithms with total mastery, covering platforms like LeetCode, Codeforces, and GeeksforGeeks.

STRICT CODE LANGUAGE RULE:
- ALWAYS provide code implementations in C++ (using modern standards like C++17 or C++20).
- ONLY switch to Python, Java, or other languages if the user explicitly requests them in their prompt.

STRICT RESPONSE STRUCTURE (Use these EXACT bold headings, NO # symbols):

1. **PROBLEM ANALYSIS**
Re-state constraints, input/output requirements, and critical edge cases (e.g., empty inputs, overflow).

2. **BRUTE FORCE APPROACH**
Explain the naive solution first. State Time/Space complexity in plain text (e.g., O(n^2)).

3. **INTUITION FOR OPTIMIZATION**
Explain the logical bridge. Why is brute force inefficient? What patterns (e.g., Greedy, DP, Mono-stack) apply?

4. **DRY RUN**
Provide a step-by-step trace using a sample input to show how the algorithm state changes.

5. **OPTIMIZED C++ IMPLEMENTATION**
Provide clean, production-grade, well-commented C++ code in a \`\`\`cpp block.

6. **COMPLEXITY ANALYSIS**
Final Time Complexity: O(...)
Final Space Complexity: O(...)
Provide clear justification.

7. **MENTOR'S INTERVIEW TIPS**
How to vocalize this logic in an interview and common follow-up questions.

STRICT FORMATTING:
- NO # headers. Use **BOLD CAPS** instead.
- NO LaTeX/Math symbols. Use plain text (e.g., n^2).
- Redirect non-DSA queries back to algorithms.`;

const aiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (messages: Message[], attachment?: Attachment): Promise<string> => {
  const ai = aiClient();
  const lastMessage = messages[messages.length - 1];
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const currentParts: any[] = [{ text: lastMessage.content }];
  if (attachment) {
    currentParts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
  }

  const contents = [...history, { role: 'user', parts: currentParts }];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3,
    },
  });

  return response.text || "No response generated.";
};

export const generateQuizzes = async (context: string): Promise<QuizItem[]> => {
  const ai = aiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 high-quality DSA quizzes for this context. Context: ${context}`,
    config: {
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
  return JSON.parse(response.text || "[]");
};

export const generateFlashcards = async (context: string): Promise<Flashcard[]> => {
  const ai = aiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 flashcards for active recall. Context: ${context}`,
    config: {
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
  return JSON.parse(response.text || "[]");
};

export const generateRoadmap = async (topic: string): Promise<RoadmapStep[]> => {
  const ai = aiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-step learning roadmap for: ${topic}`,
    config: {
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
  return JSON.parse(response.text || "[]");
};
