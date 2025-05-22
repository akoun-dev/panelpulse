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
