export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export enum EmojiType {
  SMILE = '😀',
  HEART = '❤️',
  FOOD = '🍔',
  PARTY = '🎉',
  NATURE = '🌲',
  DANGER = '⚠️',
  HOME = '🏠',
  WORK = '💼',
  GYM = '💪',
  COFFEE = '☕',
  MUSEUM = '🏛️'
}

export enum Visibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private'
}

export interface TagDefinition {
  id: string;
  label: string;
  scope: Visibility;
  ownerId: string;
  color: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  emoji: EmojiType;
  title: string;
  description: string;
  tags: string[];
  userId: string;
  username?: string;
  createdAt: Date;
  visibility: Visibility;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Helper to simulate ASP.NET backend response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string; // ISO string
  userId: string;
  username: string;
  markerId: string;
}