import { MapMarker, User, ApiResponse, EmojiType, Visibility, TagDefinition, UserRole } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Helper keys for LocalStorage
const STORAGE_KEYS = {
  MARKERS: 'emojimap_markers_v1',
  USERS: 'emojimap_users_v1',
  TAGS: 'emojimap_tags_v1'
};

// Helper to load from storage
const loadFromStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    const parsed = JSON.parse(item);
    // Extra safety check for null/undefined results from parsing
    return parsed === null ? defaultVal : parsed;
  } catch (e) {
    console.error("Error loading from LS", e);
    return defaultVal;
  }
};

// Helper to save to storage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to LS", e);
  }
};

// Initial Data
const DEFAULT_MARKERS: MapMarker[] = [
  {
    id: '1',
    lat: 52.237049,
    lng: 21.017532,
    emoji: EmojiType.COFFEE,
    title: 'Najlepsza Kawa',
    description: 'Tu serwują świetne espresso!',
    tags: ['kawa', 'centrum'],
    userId: 'demo-user',
    username: 'BaristaJan',
    createdAt: new Date(),
    visibility: Visibility.PUBLIC
  }
];

// Initial Tags
const DEFAULT_TAGS: TagDefinition[] = [
  { id: 't1', label: 'kawa', scope: Visibility.PUBLIC, ownerId: 'system' },
  { id: 't2', label: 'jedzenie', scope: Visibility.PUBLIC, ownerId: 'system' },
  { id: 't3', label: 'widok', scope: Visibility.PUBLIC, ownerId: 'system' },
  { id: 't4', label: 'praca', scope: Visibility.PUBLIC, ownerId: 'system' },
  { id: 't5', label: 'randka', scope: Visibility.PUBLIC, ownerId: 'system' }
];

// In-memory cache backed by LocalStorage
// Added safety check: if loaded markers/tags are not arrays, fallback to defaults
let markersData = loadFromStorage(STORAGE_KEYS.MARKERS, DEFAULT_MARKERS);
let markers: MapMarker[] = Array.isArray(markersData) ? markersData : DEFAULT_MARKERS;

let tagsData = loadFromStorage(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
let tags: TagDefinition[] = Array.isArray(tagsData) ? tagsData : DEFAULT_TAGS;

// Mock Users Database (Simulated)
let users: User[] = [
  { id: 'admin-id', username: 'Administrator', email: 'admin@example.com', role: 'admin' },
  { id: 'demo-user', username: 'BaristaJan', email: 'jan@example.com', role: 'user' }
];


// Fix Date objects after parsing JSON and ensure tags exist
markers = markers.map(m => ({
  ...m,
  createdAt: new Date(m.createdAt),
  tags: Array.isArray(m.tags) ? m.tags : []
}));

// Mock delays to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockApi = {
  async login(email: string): Promise<ApiResponse<User>> {
    await delay(500);

    // Check if user exists in mock DB or create temporary one
    let user = users.find(u => u.email === email);

    if (!user) {
      // Special rule: admin@example.com is always admin
      const role: UserRole = email === 'admin@example.com' ? 'admin' : 'user';
      const id = 'user-' + btoa(email).substring(0, 10);

      user = {
        id: id,
        username: email.split('@')[0],
        email: email,
        role: role
      };
      users.push(user);
    }

    return {
      success: true,
      data: user
    };
  },

  async register(email: string, password: string, username: string): Promise<ApiResponse<User>> {
    await delay(600);
    const id = 'user-' + uuidv4();
    const newUser: User = {
      id,
      username,
      email,
      role: 'user'
    };
    users.push(newUser);
    return {
      success: true,
      data: newUser
    };
  },

  async updateUser(userId: string, newUsername: string): Promise<ApiResponse<User>> {
    await delay(400);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].username = newUsername;
    }

    markers = markers.map(m =>
      m.userId === userId ? { ...m, username: newUsername } : m
    );
    saveToStorage(STORAGE_KEYS.MARKERS, markers);

    return {
      success: true,
      data: {
        id: userId,
        username: newUsername,
        email: 'updated@example.com',
        role: 'user' // Simplification
      }
    };
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    await delay(500);
    markers = markers.filter(m => m.userId !== userId);
    saveToStorage(STORAGE_KEYS.MARKERS, markers);
    users = users.filter(u => u.id !== userId);
    return { success: true };
  },

  // --- ADMIN METHODS ---
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    await delay(300);
    return { success: true, data: users };
  },

  // --- MARKERS ---

  async getMarkers(): Promise<ApiResponse<MapMarker[]>> {
    await delay(300);
    const currentMarkers = markers.map(m => ({
      ...m,
      createdAt: new Date(m.createdAt),
      tags: Array.isArray(m.tags) ? m.tags : []
    }));
    return {
      success: true,
      data: currentMarkers
    };
  },

  async addMarker(marker: Omit<MapMarker, 'id' | 'createdAt'>): Promise<ApiResponse<MapMarker>> {
    await delay(400);
    const newMarker: MapMarker = {
      ...marker,
      id: uuidv4(),
      createdAt: new Date(),
      tags: marker.tags || []
    };
    markers.push(newMarker);
    saveToStorage(STORAGE_KEYS.MARKERS, markers);
    return {
      success: true,
      data: newMarker
    };
  },

  async updateMarker(marker: MapMarker): Promise<ApiResponse<MapMarker>> {
    await delay(400);
    const index = markers.findIndex(m => m.id === marker.id);
    if (index !== -1) {
      markers[index] = { ...marker };
      saveToStorage(STORAGE_KEYS.MARKERS, markers);
      return {
        success: true,
        data: markers[index]
      };
    }
    return { success: false, error: 'Nie znaleziono punktu do edycji.' };
  },

  async deleteMarker(id: string): Promise<ApiResponse<void>> {
    await delay(300);
    const initialLength = markers.length;
    markers = markers.filter(m => m.id !== id);

    if (markers.length < initialLength) {
      saveToStorage(STORAGE_KEYS.MARKERS, markers);
      return { success: true };
    }
    return { success: false, error: 'Nie znaleziono punktu.' };
  },

  // --- TAGS ---

  async getTags(): Promise<ApiResponse<TagDefinition[]>> {
    await delay(200);
    return { success: true, data: tags };
  },

  async addTag(label: string, scope: Visibility, ownerId: string): Promise<ApiResponse<TagDefinition>> {
    await delay(300);

    const exists = tags.some(t => t.label.toLowerCase() === label.toLowerCase() && (t.scope === Visibility.PUBLIC || t.ownerId === ownerId));
    if (exists) {
      return { success: false, error: 'Taki tag już istnieje.' };
    }

    const newTag: TagDefinition = {
      id: uuidv4(),
      label: label.toLowerCase(),
      scope,
      ownerId
    };
    tags.push(newTag);
    saveToStorage(STORAGE_KEYS.TAGS, tags);
    return { success: true, data: newTag };
  },

  async updateTag(tagId: string, updates: Partial<TagDefinition>): Promise<ApiResponse<TagDefinition>> {
    await delay(300);
    const index = tags.findIndex(t => t.id === tagId);
    if (index !== -1) {
      tags[index] = { ...tags[index], ...updates };
      saveToStorage(STORAGE_KEYS.TAGS, tags);
      return { success: true, data: tags[index] };
    }
    return { success: false, error: 'Nie znaleziono taga.' };
  },

  async deleteTag(tagId: string): Promise<ApiResponse<void>> {
    await delay(300);
    tags = tags.filter(t => t.id !== tagId);
    saveToStorage(STORAGE_KEYS.TAGS, tags);
    return { success: true };
  }
};