import { User, MapMarker } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User; // Assuming the backend returns user details or we decode it
}

export const api = {
    async login(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: errorText || 'Login failed' };
            }

            const data = await response.json();
            // Store token
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Backend now returns User object in TokenResponseDto
            if (data.user) {
                return { success: true, data: data.user };
            }

            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async register(email: string, password: string, username: string): Promise<{ success: boolean; data?: User; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: errorText || 'Registration failed' };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    // --- MARKERS ---
    async getMarkers(userId: string): Promise<{ success: boolean; data?: MapMarker[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Markers/getByUserId?UserId=${userId}`);
            if (!response.ok) {
                return { success: false, error: 'Failed to fetch markers' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async getPublicMarkers(): Promise<{ success: boolean; data?: MapMarker[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Markers/public`);
            if (!response.ok) {
                return { success: false, error: 'Failed to fetch public markers' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async addMarker(marker: any): Promise<{ success: boolean; data?: MapMarker; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Markers/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(marker),
            });
            if (!response.ok) {
                return { success: false, error: 'Failed to add marker' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async updateMarker(marker: MapMarker): Promise<{ success: boolean; data?: MapMarker; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Markers/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(marker),
            });
            if (!response.ok) {
                return { success: false, error: 'Failed to update marker' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async deleteMarker(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Markers/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                return { success: false, error: 'Failed to delete marker' };
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    // --- TAGS ---
    async getPublicTags(): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Tags/public`);
            if (!response.ok) {
                return { success: false, error: 'Failed to fetch public tags' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async getUserTags(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Tags/user/${userId}`);
            if (!response.ok) {
                return { success: false, error: 'Failed to fetch user tags' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async addTag(title: string, color: string, userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Tags/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, visibility: 'public', userId, colorTag: color }), // Default visibility to public
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to add tag' };
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async updateTag(id: string, tagData: { label: string, color: string }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Tags/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, title: tagData.label, visibility: 'public', colorTag: tagData.color }),
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to update tag' };
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async deleteTag(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Tags/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to delete tag' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    // --- COMMENTS ---
    async getComments(markerId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/Comments/marker/${markerId}`);
            if (!response.ok) {
                return { success: false, error: 'Failed to fetch comments' };
            }
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async addComment(markerId: string, content: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ markerId, content }),
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to add comment' };
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to delete comment' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    // --- REPORTS ---
    async getAdminReport(): Promise<{ success: boolean; data?: Blob; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Reports/admin-summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to generate report' };
            }

            const blob = await response.blob();
            return { success: true, data: blob };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    // --- USERS ---
    async getAllUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to fetch users' };
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Failed to delete user' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }
};
