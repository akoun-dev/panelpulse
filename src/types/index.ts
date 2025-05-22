export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  avatar?: string;
}

export interface Panel {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Invitation {
  id: string;
  panelId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
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
