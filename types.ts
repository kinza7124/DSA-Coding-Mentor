
export type Role = 'user' | 'assistant';

export interface Attachment {
  mimeType: string;
  data: string; // base64
  type: 'image' | 'video' | 'pdf';
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  estimatedTime: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachment?: Attachment;
  quizzes?: QuizItem[];
  flashcards?: Flashcard[];
  roadmap?: RoadmapStep[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}
