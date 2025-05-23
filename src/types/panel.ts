export interface PanelSession {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'archived' | 'published'
  duration: number // in minutes
  segments: PanelSegment[]
  createdAt: string
  updatedAt: string
}

export interface PanelSegment {
  name: string
  duration: number // in minutes
  completed: boolean
}

export interface Panelist {
  id: string
  name: string
  role: string
  company: string
  timeAllocated: number // in seconds
  timeUsed: number // in seconds
  status: 'active' | 'inactive'
}

export interface PublicQuestion {
  id: string
  text: string
  author: string
  score: number
  status: 'pending' | 'approved' | 'rejected' | 'answered'
  createdAt: string
}

export interface SharedResource {
  id: string
  name: string
  type: 'pdf' | 'image' | 'document' | 'link'
  description: string
  url: string
}

export interface ModeratorNote {
  id: string
  timestamp: string
  content: string
}
