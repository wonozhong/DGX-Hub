export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'employee' | 'manager' | 'admin';
  department: string | null;
  phone_number?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  creator_id: string;
  assignee_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  creator_id: string;
  channel: string;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
