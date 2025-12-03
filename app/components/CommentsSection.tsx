import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { Comment, User } from '../types';

interface CommentsSectionProps {
    markerId: string;
    currentUser: User | null;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ markerId, currentUser }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadComments();
    }, [markerId]);

    const loadComments = async () => {
        setIsLoading(true);
        const res = await api.getComments(markerId);
        if (res.success && res.data) {
            setComments(res.data);
        }
        setIsLoading(false);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        setError(null);
        const res = await api.addComment(markerId, newComment);
        if (res.success && res.data) {
            setComments([res.data, ...comments]);
            setNewComment('');
        } else {
            setError('Failed to add comment');
        }
        setIsSubmitting(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        const res = await api.deleteComment(commentId);
        if (res.success) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Komentarze ({comments.length})
            </h4>

            {/* Comment List */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-4 text-slate-400 text-sm">Ładowanie...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm italic">Brak komentarzy. Bądź pierwszy!</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 rounded-lg p-3 text-sm group relative">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                    <UserIcon size={12} className="text-slate-400" />
                                    {comment.username}
                                </span>
                                <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-slate-600 break-words">{comment.content}</p>

                            {(currentUser?.role === 'admin' || currentUser?.id === comment.userId) && (
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Usuń komentarz"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            {currentUser ? (
                <form onSubmit={handleAddComment} className="relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Napisz komentarz..."
                        className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-1 top-1 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={14} />
                    </button>
                    {error && <p className="text-xs text-red-500 mt-1 ml-2">{error}</p>}
                </form>
            ) : (
                <p className="text-xs text-center text-slate-400">Zaloguj się, aby dodać komentarz</p>
            )}
        </div>
    );
};
