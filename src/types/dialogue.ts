export interface DialogueRoom {
  id: number;
  title: string;
  question: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  status: 'OPEN' | 'CLOSED';
  participantCount: number;
  messageCount: number;
}

export interface DialogueMessage {
  id: number;
  content: string;
  authorEmail: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  isExpertMessage: boolean;
}

export interface DialogueParticipant {
  id: number;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
  isExpert: boolean;
}

export interface CreateDialogueRoomRequest {
  title: string;
  question: string;
  isPublic: boolean;
}

export interface UpdateDialogueRoomStatusRequest {
  status: 'OPEN' | 'CLOSED';
}

export interface CreateDialogueMessageRequest {
  content: string;
  authorEmail: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isExpertMessage: boolean;
}


