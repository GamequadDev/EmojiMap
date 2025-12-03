import React, { useState, useEffect, useRef } from 'react';
import { MapPin, LogIn, Sparkles, Globe, Users, Info, X, Navigation, Code, Layers, Cpu, Plus, User as UserIcon, Edit2, Trash2, Lock, Link as LinkIcon, Eye, Share2, Check, LogOut, UserCog, UserX, Settings, AlertCircle, Hash, Tag, Filter, EyeOff, Save, Shield, ShieldAlert, Activity, Database, MessageSquare, FileText } from 'lucide-react';
import MapLeaflet from './components/MapLeaflet';
import { CommentsSection } from './components/CommentsSection';
import AuthModal from './components/AuthModal';
import EmojiPicker from './components/EmojiPicker';
import { MockApi } from './services/mockBackend';
import { api } from './services/api';
import { User, MapMarker, EmojiType, Visibility, TagDefinition } from './types';
import { resolveEmoji } from './utils';

type Tab = 'map' | 'tags' | 'community' | 'about' | 'admin';

function App() {
  // App State
  const [user, setUser] = useState<User | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [definedTags, setDefinedTags] = useState<TagDefinition[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For Admin Panel
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);

  // User Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Tag Management State (Tags Tab - Creation)
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue

  // Tag Management State (Tags Tab - Editing)
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#3b82f6');

  // Map Filter State
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]); // array of tag labels

  // New/Edit Marker State
  const [tempMarkerLocation, setTempMarkerLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType>(EmojiType.SMILE);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDesc, setMarkerDesc] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState<Visibility>(Visibility.PUBLIC);

  // Marker Tags State (Selection in Modal)
  const [markerSelectedTags, setMarkerSelectedTags] = useState<string[]>([]); // array of tag labels

  // Map View State
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  // Load initial data
  const refreshTags = async () => {
    // Fetch Tags from Real API
    const publicTagsRes = await api.getPublicTags();
    let fetchedTags: TagDefinition[] = [];

    if (publicTagsRes.success && publicTagsRes.data) {
      const mappedPublicTags = publicTagsRes.data.map((t: any) => ({
        id: t.id || t.Id,
        label: t.title || t.Title, // Map Title from DTO to label
        scope: (t.visibility || t.Visibility) as Visibility,
        ownerId: t.userId || t.UserId,
        color: t.colorTag || t.ColorTag || '#3b82f6'
      }));
      fetchedTags = [...fetchedTags, ...mappedPublicTags];
    }

    if (user) {
      const userTagsRes = await api.getUserTags(user.id);
      if (userTagsRes.success && userTagsRes.data) {
        const mappedUserTags = userTagsRes.data.map((t: any) => ({
          id: t.id || t.Id,
          label: t.title || t.Title,
          scope: (t.visibility || t.Visibility) as Visibility,
          ownerId: t.userId || t.UserId,
          color: t.colorTag || t.ColorTag || '#3b82f6'
        }));
        // Avoid duplicates if any
        const existingIds = new Set(fetchedTags.map(t => t.id));
        mappedUserTags.forEach(t => {
          if (!existingIds.has(t.id)) {
            fetchedTags.push(t);
          }
        });
      }
    }
    setDefinedTags(fetchedTags);
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const [userMarkersRes, publicMarkersRes] = await Promise.all([
          api.getMarkers(user.id),
          api.getPublicMarkers()
        ]);

        let combinedMarkers: MapMarker[] = [];

        if (userMarkersRes.success && userMarkersRes.data) {
          combinedMarkers = [...userMarkersRes.data];
        }

        if (publicMarkersRes.success && publicMarkersRes.data) {
          const existingIds = new Set(combinedMarkers.map(m => m.id));
          publicMarkersRes.data.forEach(m => {
            if (!existingIds.has(m.id)) {
              combinedMarkers.push(m);
            }
          });
        }
        setMarkers(combinedMarkers);
      } else {
        const markersRes = await api.getPublicMarkers();
        if (markersRes.success && markersRes.data) {
          setMarkers(markersRes.data);
        }
      }

    };

    loadData();
    refreshTags();
  }, [user]);

  // Load Admin Data when tab is active
  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'admin') {
      const fetchAdminData = async () => {
        const usersRes = await api.getAllUsers();
        if (usersRes.success && usersRes.data) {
          setAllUsers(usersRes.data);
        }
      };
      fetchAdminData();
    }
  }, [activeTab, user]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsUserMenuOpen(false);
    setActiveTab('map');
    setToastMessage({ text: "Wylogowano pomyślnie", type: 'success' });
    setEditingTagId(null);
  };

  const handleChangeUsername = async () => {
    if (!user) return;
    const newName = window.prompt("Wprowadź nową nazwę użytkownika:", user.username);

    if (newName && newName.trim() !== "" && newName !== user.username) {
      const response = await MockApi.updateUser(user.id, newName);
      if (response.success && response.data) {
        const updatedUser = { ...user, username: newName };
        setUser(updatedUser);
        setMarkers(prev => prev.map(m => m.userId === user.id ? { ...m, username: newName } : m));
        setToastMessage({ text: "Nazwa użytkownika zmieniona!", type: 'success' });
        setIsUserMenuOpen(false);
      } else {
        setToastMessage({ text: "Błąd podczas zmiany nazwy.", type: 'error' });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm("Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.");
    if (confirmed) {
      const response = await MockApi.deleteUser(user.id);
      if (response.success) {
        setMarkers(prev => prev.filter(m => m.userId !== user.id));
        setUser(null);
        setIsUserMenuOpen(false);
        setToastMessage({ text: "Konto zostało usunięte.", type: 'success' });
      } else {
        setToastMessage({ text: "Nie udało się usunąć konta.", type: 'error' });
      }
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAdminDeleteUser = async (userId: string) => {
    if (!confirm("ADMIN: Czy na pewno usunąć tego użytkownika i wszystkie jego dane?")) return;
    const response = await api.deleteUser(userId);
    if (response.success) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setMarkers(prev => prev.filter(m => m.userId !== userId)); // Refresh local markers
      setToastMessage({ text: "Użytkownik usunięty przez Admina", type: 'success' });
    }
  };

  const handleAdminDeleteMarker = async (markerId: string) => {
    if (!confirm("ADMIN: Usunąć ten punkt?")) return;
    const response = await api.deleteMarker(markerId);
    if (response.success) {
      setMarkers(prev => prev.filter(m => m.id !== markerId));
      await refreshTags(); // Refresh tags as trigger might have deleted some
      setToastMessage({ text: "Punkt usunięty przez Admina", type: 'success' });
    }
  };

  const handleAdminDeleteTag = async (tagId: string) => {
    if (!confirm("ADMIN: Usunąć ten tag definitywnie?")) return;
    const response = await api.deleteTag(tagId);
    if (response.success) {
      const tagToDelete = definedTags.find(t => t.id === tagId);
      setDefinedTags(prev => prev.filter(t => t.id !== tagId));

      if (tagToDelete) {
        setMarkers(prev => prev.map(m => ({
          ...m,
          tags: m.tags.filter(t => t !== tagToDelete.label)
        })));
      }
      setToastMessage({ text: "Tag usunięty przez Admina", type: 'success' });
    }
  };

  // --- MARKER CRUD ---

  const handleMapClick = (lat: number, lng: number) => {
    setTempMarkerLocation({ lat, lng });
    setPendingLocation(null);
  };

  const handleConfirmTempLocation = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (tempMarkerLocation) {
      setPendingLocation(tempMarkerLocation);
      setEditingMarkerId(null);
      setMarkerTitle('');
      setMarkerDesc('');
      setSelectedEmoji(EmojiType.SMILE);
      setSelectedVisibility(Visibility.PUBLIC);
      setMarkerSelectedTags([]);
    }
  };

  const handleEditClick = (marker: MapMarker) => {
    if (!user || user.id !== marker.userId) return;

    setEditingMarkerId(marker.id);
    setPendingLocation({ lat: marker.lat, lng: marker.lng });
    setTempMarkerLocation(null);
    setSelectedEmoji(marker.emoji);
    setMarkerTitle(marker.title);
    setMarkerDesc(marker.description);
    setSelectedVisibility(marker.visibility);
    setMarkerSelectedTags(marker.tags || []);
  };

  const handleDeleteClick = async (markerId: string) => {
    if (!user) return;
    if (!confirm("Czy na pewno chcesz usunąć ten punkt?")) return;

    const response = await api.deleteMarker(markerId);
    if (response.success) {
      setMarkers(prev => prev.filter(m => m.id !== markerId));
      await refreshTags(); // Refresh tags as trigger might have deleted some
      setToastMessage({ text: "Punkt usunięty", type: 'success' });
    } else {
      setToastMessage({ text: response.error || "Nie udało się usunąć punktu.", type: 'error' });
    }
  };

  const handleShareClick = (markerId: string) => {
    const link = `${window.location.origin}?marker=${markerId}`;
    navigator.clipboard.writeText(link).then(() => {
      setToastMessage({ text: "Link skopiowany do schowka!", type: 'success' });
    });
  };

  const handleSaveMarker = async () => {
    if (!pendingLocation || !user) return;

    if (editingMarkerId) {
      const existingMarker = markers.find(m => m.id === editingMarkerId);
      if (!existingMarker) return;

      const updatedMarker: MapMarker = {
        ...existingMarker,
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        emoji: selectedEmoji,
        title: markerTitle || 'Bez tytułu',
        description: markerDesc || 'Brak opisu',
        visibility: selectedVisibility,
        tags: markerSelectedTags
      };

      const response = await api.updateMarker(updatedMarker);
      if (response.success && response.data) {
        const updatedMarkerData = {
          ...response.data,
          id: response.data.id || (response.data as any).Id
        };
        setMarkers(prev => prev.map(m => m.id === editingMarkerId ? updatedMarkerData : m));
        handleCancelMarker();
        setToastMessage({ text: "Zmiany zapisane", type: 'success' });
      }
    } else {
      const newMarkerData = {
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        emoji: selectedEmoji,
        title: markerTitle || 'Bez tytułu',
        description: markerDesc || 'Brak opisu',
        tags: markerSelectedTags,
        userId: user.id,
        username: user.username,
        visibility: selectedVisibility
      };

      const response = await api.addMarker(newMarkerData);
      if (response.success && response.data) {
        const newMarkerData = {
          ...response.data,
          id: response.data.id || (response.data as any).Id
        };
        setMarkers(prev => [...prev, newMarkerData]);
        handleCancelMarker();
        setToastMessage({ text: "Dodano nowy punkt!", type: 'success' });
      }
    }
  };

  const handleCancelMarker = () => {
    setPendingLocation(null);
    setTempMarkerLocation(null);
    setEditingMarkerId(null);
    setMarkerTitle('');
    setMarkerDesc('');
    setSelectedVisibility(Visibility.PUBLIC);
    setMarkerSelectedTags([]);
  };

  // --- TAG MANAGEMENT (For Tags Tab) ---

  const handleCreateTag = async () => {
    if (!user) {
      setToastMessage({ text: "Niezalogowany użytkownik nie może utworzyć tagu", type: 'error' });
      return;
    }
    if (!newTagName.trim()) return;
    const response = await api.addTag(newTagName.trim(), newTagColor, user.id);
    if (response.success && response.data) {
      const newTag: TagDefinition = {
        id: response.data.id || response.data.Id,
        label: response.data.title || response.data.Title,
        scope: (response.data.visibility || response.data.Visibility) as Visibility,
        ownerId: response.data.userId || response.data.UserId,
        color: response.data.colorTag || response.data.ColorTag || newTagColor
      };
      setDefinedTags(prev => [...prev, newTag]);
      setNewTagName('');
      setToastMessage({ text: "Tag utworzony", type: 'success' });
    } else {
      setToastMessage({ text: response.error || "Błąd tworzenia taga", type: 'error' });
    }
  };

  const handleStartEditTag = (tag: TagDefinition) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.label);
    setEditTagColor(tag.color);
  };

  const handleCancelEditTag = () => {
    setEditingTagId(null);
    setEditTagName('');
  };

  const handleUpdateTag = async () => {
    if (!user || !editingTagId || !editTagName.trim()) return;

    const response = await api.updateTag(editingTagId, {
      label: editTagName.trim(),
      color: editTagColor
    });

    if (response.success && response.data) {
      const updatedTag: TagDefinition = {
        id: response.data.id || response.data.Id,
        label: response.data.title || response.data.Title,
        scope: (response.data.visibility || response.data.Visibility) as Visibility,
        ownerId: response.data.userId || response.data.UserId,
        color: response.data.colorTag || response.data.ColorTag || editTagColor
      };
      setDefinedTags(prev => prev.map(t => t.id === editingTagId ? updatedTag : t));

      // Update markers that use this tag
      const oldTag = definedTags.find(t => t.id === editingTagId);
      if (oldTag) {
        setMarkers(prev => prev.map(m => {
          if (m.tags.includes(oldTag.label)) {
            return {
              ...m,
              tags: m.tags.map(t => t === oldTag.label ? updatedTag.label : t)
            };
          }
          return m;
        }));
      }
      handleCancelEditTag();
      setToastMessage({ text: "Tag zaktualizowany", type: 'success' });
    } else {
      setToastMessage({ text: response.error || "Błąd edycji", type: 'error' });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!user) return;
    if (!confirm("Czy na pewno chcesz usunąć ten tag?")) return;

    const response = await api.deleteTag(tagId);
    if (response.success) {
      const tagToDelete = definedTags.find(t => t.id === tagId);
      setDefinedTags(prev => prev.filter(t => t.id !== tagId));

      if (tagToDelete) {
        setMarkers(prev => prev.map(m => ({
          ...m,
          tags: m.tags.filter(t => t !== tagToDelete.label)
        })));
      }
      setToastMessage({ text: "Tag usunięty", type: 'success' });
    }
  };

  // --- TAG FILTERING & SELECTION LOGIC ---

  // 1. Get tags available to the current user (Public + My Private)
  const getAvailableTags = () => {
    return definedTags.filter(tag => {
      if (tag.scope === Visibility.PUBLIC) return true;
      if (user && tag.ownerId === user.id) return true;
      return false;
    });
  };

  const availableTags = getAvailableTags();

  // 2. Logic for Filter under Map
  const toggleFilterTag = (label: string) => {
    if (selectedFilterTags.includes(label)) {
      setSelectedFilterTags(prev => prev.filter(t => t !== label));
    } else {
      setSelectedFilterTags(prev => [...prev, label]);
    }
  };

  // 3. Logic for Marker Modal Selection
  const toggleMarkerTag = (label: string) => {
    if (markerSelectedTags.includes(label)) {
      setMarkerSelectedTags(prev => prev.filter(t => t !== label));
    } else {
      setMarkerSelectedTags(prev => [...prev, label]);
    }
  };

  // 4. Apply Filters to Markers
  const getVisibleMarkers = () => {
    return markers.filter(m => {
      // Visibility Check
      let hasAccess = false;
      if (m.visibility === Visibility.PUBLIC) hasAccess = true;
      else if (user && m.userId === user.id) hasAccess = true;
      // Admin sees everything
      if (user && user.role === 'admin') hasAccess = true;

      if (!hasAccess) return false;

      // Tag Filter Check
      if (selectedFilterTags.length > 0) {
        // OR Logic (Match ANY selected tag)
        const hasMatchingTag = m.tags.some(t => selectedFilterTags.includes(t));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  };

  const visibleMarkers = getVisibleMarkers();

  // Helper Helpers
  const getScopeIcon = (scope: Visibility) => {
    switch (scope) {
      case Visibility.PUBLIC: return <Globe size={14} />;
      case Visibility.PRIVATE: return <Lock size={14} />;
      case Visibility.UNLISTED: return <LinkIcon size={14} />;
    }
  };

  const handleCommunityMarkerClick = (marker: MapMarker) => {
    setMapCenter({ lat: marker.lat, lng: marker.lng });
    setMapZoom(15);
    setActiveTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">

      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-xl z-[2000] flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300 ${toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} className="text-green-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Emoji<span className="text-blue-600">Map</span></h1>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
            <button onClick={() => setActiveTab('map')} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'map' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}>
              <Globe size={18} /> <span className="hidden lg:inline">Mapa</span>
            </button>
            <button onClick={() => setActiveTab('tags')} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'tags' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}>
              <Tag size={18} /> <span className="hidden lg:inline">Tagi</span>
            </button>
            <button onClick={() => setActiveTab('community')} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'community' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}>
              <Users size={18} /> <span className="hidden lg:inline">Społeczność</span>
            </button>
            <button onClick={() => setActiveTab('about')} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}>
              <Info size={18} /> <span className="hidden lg:inline">O projekcie</span>
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'admin' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-red-500'}`}>
                <Shield size={18} /> <span className="hidden lg:inline">Panel Admina</span>
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 pl-4 border-l border-slate-200 transition-opacity hover:opacity-80 outline-none">
                  <div className={`w-9 h-9 border-2 border-white shadow-sm rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gradient-to-tr from-blue-100 to-indigo-100 text-indigo-600'}`}>
                    {user.username && user.username.length > 0 ? user.username[0].toUpperCase() : '?'}
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        Zalogowany jako
                        {user.role === 'admin' && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>}
                      </p>
                      <p className="font-bold text-slate-800 truncate">{user.username}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={handleChangeUsername} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"><UserCog size={16} /> Zmień nazwę</button>
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"><LogOut size={16} /> Wyloguj się</button>
                    </div>
                    <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                      <button onClick={handleDeleteAccount} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><UserX size={16} /> Usuń konto</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all transform hover:scale-105">
                <LogIn size={16} /> <span className="hidden sm:inline">Zaloguj się</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* VIEW: MAP */}
        {activeTab === 'map' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-200 h-[60vh] min-h-[450px] relative z-0 group mx-auto max-w-5xl mb-6">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <MapLeaflet
                  markers={visibleMarkers}
                  currentUser={user}
                  onAddMarkerRequest={handleMapClick}
                  onEditMarker={handleEditClick}
                  onDeleteMarker={handleDeleteClick}
                  onShareMarker={handleShareClick}
                  tempMarkerPosition={tempMarkerLocation}
                  onConfirmLocation={handleConfirmTempLocation}
                  center={mapCenter}
                  zoom={mapZoom}
                />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium shadow-xl border border-slate-200 z-[400] text-slate-600 pointer-events-none flex items-center gap-3 whitespace-nowrap">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Navigation size={16} className="text-blue-600" />
                  </div>
                  Kliknij mapę aby dodać punkt, a następnie zatwierdź ikonę.
                </div>
              </div>
            </div>

            {/* FILTER SECTION UNDER MAP */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                      <Filter size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">Filtruj Mapę</h2>
                      <p className="text-xs text-slate-500">Wybierz tagi, które chcesz zobaczyć</p>
                    </div>
                  </div>
                  {selectedFilterTags.length > 0 && (
                    <button onClick={() => setSelectedFilterTags([])} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1">
                      <X size={14} /> Wyczyść
                    </button>
                  )}
                </div>
                <div className="p-6 bg-white">
                  {availableTags.length === 0 ? (
                    <div className="text-center text-slate-400 py-4 text-sm">
                      Brak zdefiniowanych tagów. Przejdź do zakładki "Tagi" aby je utworzyć.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {availableTags.map(tag => {
                        const isActive = selectedFilterTags.includes(tag.label);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleFilterTag(tag.label)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 shadow-sm`}
                            style={{
                              backgroundColor: isActive ? tag.color : 'white',
                              borderColor: tag.color,
                              color: isActive ? 'white' : tag.color
                            }}
                          >
                            {getScopeIcon(tag.scope)}
                            {tag.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TAGS MANAGEMENT */}
        {activeTab === 'tags' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-800">Zarządzanie Tagami</h2>
                  <p className="text-sm text-slate-500">Tutaj tworzysz i modyfikujesz definicje tagów.</p>
                </div>
              </div>

              <div className="p-8">
                {/* Creator Form */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={18} /> Utwórz nowy tag</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Nowy tag..."
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="h-10 w-10 rounded-lg cursor-pointer border border-slate-300 p-1 bg-white"
                        title="Wybierz kolor"
                      />
                      <button
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Dodaj
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 ml-1">
                    <Globe size={10} className="inline mr-1" /> Publiczne widzą wszyscy.
                  </p>
                </div>

                {/* List of Existing Tags */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 mb-2">Twoje i Publiczne Tagi</h3>
                  {availableTags.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">Brak tagów. Stwórz pierwszy powyżej!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableTags.map(tag => {
                        const isOwner = user && tag.ownerId === user.id;
                        const isEditing = editingTagId === tag.id;

                        return (
                          <div key={tag.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                            {isEditing ? (
                              // EDIT MODE
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editTagName}
                                  onChange={(e) => setEditTagName(e.target.value)}
                                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 flex-1"
                                  placeholder="Nazwa taga"
                                />
                                <input
                                  type="color"
                                  value={editTagColor}
                                  onChange={(e) => setEditTagColor(e.target.value)}
                                  className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                  title="Wybierz kolor"
                                />
                                <button type="button" onClick={handleUpdateTag} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center" title="Zapisz">
                                  <Save size={16} className="pointer-events-none" />
                                </button>
                                <button type="button" onClick={handleCancelEditTag} className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 flex items-center justify-center" title="Anuluj">
                                  <X size={16} className="pointer-events-none" />
                                </button>
                              </div>
                            ) : (
                              // DISPLAY MODE
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-6 h-6 rounded-full shadow-sm border border-slate-200"
                                    style={{ backgroundColor: tag.color }}
                                    title="Kolor taga"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-800">{tag.label}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{tag.scope}</p>
                                  </div>
                                </div>
                                {isOwner && (
                                  <div className="flex gap-1">
                                    <button type="button" onClick={() => handleStartEditTag(tag)} className="text-slate-300 hover:text-blue-500 p-2 transition-colors rounded-full hover:bg-blue-50 flex items-center justify-center">
                                      <Edit2 size={16} className="pointer-events-none" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTag(tag.id);
                                      }}
                                      className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50 flex items-center justify-center"
                                    >
                                      <Trash2 size={16} className="pointer-events-none" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: COMMUNITY */}
        {
          activeTab === 'community' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                  <div>
                    <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
                      <Sparkles className="text-yellow-500 fill-yellow-500" />
                      Tablica Społeczności
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {selectedFilterTags.length > 0
                        ? `Filtrowanie po: ${selectedFilterTags.join(', ')}`
                        : 'Wszystkie wpisy'}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {visibleMarkers.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={32} className="opacity-30" />
                      </div>
                      <p className="font-medium text-lg">Brak znaczników</p>
                    </div>
                  ) : (
                    <>
                      {/* My Markers Section */}
                      {user && visibleMarkers.some(m => m.userId === user.id) && (
                        <div className="space-y-4">
                          <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                            <UserIcon size={20} className="text-blue-500" /> Twoje wpisy
                          </h3>
                          {visibleMarkers
                            .filter(m => m.userId === user.id)
                            .slice().reverse()
                            .map(marker => (
                              <div key={marker.id} onClick={() => handleCommunityMarkerClick(marker)} className={`cursor-pointer bg-white border ${marker.visibility === Visibility.PRIVATE ? 'border-slate-200 bg-slate-50/50' : 'border-blue-100 bg-blue-50/10'} rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
                                <div className="flex items-start gap-4">
                                  <div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl border border-slate-100 shadow-inner">
                                    {resolveEmoji(marker.emoji)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-lg text-slate-800 truncate flex items-center gap-2">
                                          {marker.title}
                                          {marker.visibility === Visibility.PRIVATE && <Lock size={14} className="text-slate-400" />}
                                          {marker.visibility === Visibility.UNLISTED && <LinkIcon size={14} className="text-slate-400" />}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1 text-slate-500">
                                          <UserIcon size={12} />
                                          <span className="text-xs font-medium text-slate-600">Ty</span>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-3 leading-relaxed">{marker.description}</p>
                                    {marker.tags && marker.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {marker.tags.map((tag, i) => (
                                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Comments Toggle & Section */}
                                <div className="mt-3 flex justify-end border-t border-slate-50 pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedComments(expandedComments === marker.id ? null : marker.id);
                                    }}
                                    className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                  >
                                    <MessageSquare size={14} />
                                    {expandedComments === marker.id ? 'Ukryj komentarze' : 'Pokaż komentarze'}
                                  </button>
                                </div>

                                {expandedComments === marker.id && (
                                  <div onClick={e => e.stopPropagation()}>
                                    <CommentsSection markerId={marker.id} currentUser={user} />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Divider if both exist */}
                      {user && visibleMarkers.some(m => m.userId === user.id) && visibleMarkers.some(m => m.userId !== user.id) && (
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-sm text-slate-400 font-medium">Społeczność</span>
                          </div>
                        </div>
                      )}

                      {/* Community Markers Section */}
                      {visibleMarkers.some(m => !user || m.userId !== user.id) && (
                        <div className="space-y-4">
                          {user && (
                            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                              <Globe size={20} className="text-indigo-500" /> Społeczność
                            </h3>
                          )}
                          {visibleMarkers
                            .filter(m => !user || m.userId !== user.id)
                            .slice().reverse()
                            .map(marker => (
                              <div key={marker.id} onClick={() => handleCommunityMarkerClick(marker)} className={`cursor-pointer bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
                                <div className="flex items-start gap-4">
                                  <div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl border border-slate-100 shadow-inner">
                                    {resolveEmoji(marker.emoji)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-lg text-slate-800 truncate flex items-center gap-2">
                                          {marker.title}
                                          {marker.visibility === Visibility.PRIVATE && <Lock size={14} className="text-slate-400" />}
                                          {marker.visibility === Visibility.UNLISTED && <LinkIcon size={14} className="text-slate-400" />}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1 text-slate-500">
                                          <UserIcon size={12} />
                                          <span className="text-xs font-medium text-slate-600">{marker.username || 'Anonim'}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-3 leading-relaxed">{marker.description}</p>
                                    {marker.tags && marker.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {marker.tags.map((tag, i) => (
                                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Comments Toggle & Section */}
                                <div className="mt-3 flex justify-end border-t border-slate-50 pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedComments(expandedComments === marker.id ? null : marker.id);
                                    }}
                                    className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                  >
                                    <MessageSquare size={14} />
                                    {expandedComments === marker.id ? 'Ukryj komentarze' : 'Pokaż komentarze'}
                                  </button>
                                </div>

                                {expandedComments === marker.id && (
                                  <div onClick={e => e.stopPropagation()}>
                                    <CommentsSection markerId={marker.id} currentUser={user} />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* VIEW: ADMIN PANEL */}
        {
          activeTab === 'admin' && user?.role === 'admin' && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

              {/* Admin Header & Actions */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Panel Administratora</h2>
                <button
                  onClick={async () => {
                    setToastMessage({ text: "Generowanie raportu...", type: 'success' });
                    const response = await api.getAdminReport();
                    if (response.success && response.data) {
                      const url = window.URL.createObjectURL(response.data);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `emojimap_report_${new Date().toISOString().slice(0, 10)}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      setToastMessage({ text: "Raport pobrany!", type: 'success' });
                    } else {
                      setToastMessage({ text: "Błąd generowania raportu", type: 'error' });
                    }
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                >
                  <FileText size={18} />
                  Generuj Raport
                </button>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase">Użytkownicy</p>
                    <p className="text-3xl font-bold text-slate-800">{allUsers.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase">Punkty na mapie</p>
                    <p className="text-3xl font-bold text-slate-800">{markers.length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full text-green-600"><MapPin size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase">Zdefiniowane Tagi</p>
                    <p className="text-3xl font-bold text-slate-800">{definedTags.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Hash size={24} /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* User Management */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><ShieldAlert size={20} /></div>
                    <h2 className="font-bold text-lg text-slate-800">Zarządzanie Użytkownikami</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                          <th className="px-4 py-3">Użytkownik</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Rola</th>
                          <th className="px-4 py-3 text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map(u => (
                          <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{u.username}</td>
                            <td className="px-4 py-3 text-slate-500">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleAdminDeleteUser(u.id)}
                                  className="text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                  Usuń
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tag Management */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Database size={20} /></div>
                    <h2 className="font-bold text-lg text-slate-800">Wszystkie Tagi (Global)</h2>
                  </div>
                  <div className="p-4 max-h-[300px] overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {definedTags.map(tag => (
                        <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group">
                          <span className="text-sm font-bold text-slate-700">{tag.label}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{tag.scope}</span>
                          <button
                            onClick={() => handleAdminDeleteTag(tag.id)}
                            className="ml-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Marker Management */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Layers size={20} /></div>
                  <h2 className="font-bold text-lg text-slate-800">Ostatnie Punkty (Wymuś usunięcie)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">Emoji</th>
                        <th className="px-4 py-3">Tytuł</th>
                        <th className="px-4 py-3">Autor</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3 text-right">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markers.slice().reverse().map(m => (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-lg">{resolveEmoji(m.emoji)}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
                          <td className="px-4 py-3 text-slate-500">{m.username || 'Anonim'}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleAdminDeleteMarker(m.id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors"
                              title="Usuń punkt"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        }

        {/* VIEW: ABOUT */}
        {
          activeTab === 'about' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h2 className="text-2xl font-bold mb-4">O projekcie</h2>
                <p className="text-slate-600">EmojiMap to interaktywna mapa społecznościowa. Mapa pozwala na tworzenie i edycję punktów, które są reprezentowane przez emoji. Mapa jest interaktywna, co oznacza, że można ją przeglądać i edytować w czasie rzeczywistym.</p>
              </div>
            </div>
          )
        }

      </main >

      {/* MODAL: ADD/EDIT MARKER */}
      {
        pendingLocation && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-lg">
                  {editingMarkerId ? <Edit2 size={20} className="text-blue-200" /> : <Plus size={20} className="text-blue-200" />}
                  {editingMarkerId ? 'Edytuj punkt' : 'Dodaj nowy punkt'}
                </h2>
                <button onClick={handleCancelMarker} className="hover:bg-blue-500 p-1.5 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-center">
                  <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 text-blue-700 text-xs font-mono flex items-center gap-2">
                    <Globe size={12} /> {pendingLocation.lat.toFixed(5)}, {pendingLocation.lng.toFixed(5)}
                  </div>
                </div>

                <div>
                  <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wybierz reakcję</label>
                  <div className="bg-slate-50 rounded-xl border border-slate-100">
                    <EmojiPicker selected={selectedEmoji} onSelect={setSelectedEmoji} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Widoczność Punktu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[Visibility.PUBLIC, Visibility.PRIVATE].map(v => (
                      <button
                        key={v}
                        onClick={() => setSelectedVisibility(v)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${selectedVisibility === v ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                      >
                        {getScopeIcon(v)}
                        <span className="mt-1 uppercase">{v}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tytuł</label>
                    <input type="text" value={markerTitle} onChange={(e) => setMarkerTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nazwa miejsca..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opis</label>
                    <textarea value={markerDesc} onChange={(e) => setMarkerDesc(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Opis..." />
                  </div>

                  {/* UPDATED TAG SELECTOR IN MODAL - NO INPUT, ONLY SELECT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wybierz Tagi</label>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 min-h-[80px]">
                      {availableTags.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Brak dostępnych tagów. Utwórz je w zakładce "Tagi".</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(tag => {
                            const isSelected = markerSelectedTags.includes(tag.label);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => toggleMarkerTag(tag.label)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                  }`}
                              >
                                {isSelected && <Check size={10} />}
                                {tag.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">Kliknij, aby wybrać lub odznaczyć.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-4">
                <button onClick={handleCancelMarker} className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold">Anuluj</button>
                <button onClick={handleSaveMarker} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  {editingMarkerId ? <Edit2 size={18} /> : <MapPin size={18} />}
                  {editingMarkerId ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </div >
  );
}

export default App;