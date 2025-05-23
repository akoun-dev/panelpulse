export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  avatar?: string;
}

export interface PreparedQA {
  id: string;
  question: string;
  answer: string;
  panelistId: string;
  panelistName: string;
  isVisible?: boolean;
}

export interface Panelist {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  timeAllocated: number;
  timeUsed?: number;
  status?: 'active' | 'inactive';
}

export interface Panel {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  userRole?: 'moderator' | 'panelist'; // Rôle de l'utilisateur actuel dans ce panel
  panelists?: Panelist[];
  preparedQA?: PreparedQA[];
}

export interface Invitation {
  id: string;
  panelId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  panelTitle?: string;
  panelDate?: string;
  role?: string;
  moderatorName?: string;
}

export interface Question {
  id: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface Speaker {
  id: string;
  name: string;
  timeUsed: number; // temps déjà utilisé (secondes)
  timeAllocated: number; // temps alloué (secondes)
  role?: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  type: 'create' | 'update' | 'delete';
  action: string;
  target: string;
  details?: Record<string, unknown>;
}
