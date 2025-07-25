export interface Question {
  id: number;
  title: string;
  content: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category1: string;
  category2: string;
  filePath?: string;
  status: 'OPEN' | 'CLOSED';
  viewCount: number;
  answerCount: number;
  isPublic: boolean;
}

export interface Answer {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFormData {
  title: string;
  content: string;
  tags: string[];
  category1: string;
  category2: string;
  isPublic: boolean;
}

export interface AnswerFormData {
  content: string;
} 