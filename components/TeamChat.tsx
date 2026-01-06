import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Send, User, MessageSquare } from 'lucide-react';
import { TeamMember } from '../types';

interface Message {
    id: string;
    plan_id: string;
    user_id: string;
    content: string;
    created_at: string;
    sender_name?: string;
}

interface TeamChatProps {
    planId: string;
    currentUserEmail: string; // Changed from ID to Email for matching
    teamMembers: TeamMember[];
    className?: string;
}

const TeamChat: React.FC<TeamChatProps> = ({ planId, currentUserEmail, teamMembers, className }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch initial messages and subscribe to real-time updates
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('team_messages')
                .select('*')
                .eq('plan_id', planId)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching messages:', error);
            else setMessages(data || []);
            setIsLoading(false);
        };

        fetchMessages();

        const channel = supabase
            .channel(`public:team_messages:plan_id=eq.${planId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `plan_id=eq.${planId}` }, (payload: any) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [planId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        // Try to match sender by email (since we have currentUserEmail)
        const sender = teamMembers.find(m => m.email === currentUserEmail);
        const senderName = sender ? sender.name : 'Unknown';

        // We need user_id for the database. 
        // If we are logged in, supabase.auth.getUser() gives ID.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Should be logged in

        const { error } = await supabase
            .from('team_messages')
            .insert({
                plan_id: planId,
                user_id: user.id,
                content,
                sender_name: senderName
            });

        if (error) {
            console.error('Error sending message:', error);
        }
    };

    const getSenderName = (msgUserId: string, cachedName?: string) => {
        if (cachedName) return cachedName;
        return 'Team Member';
    };

    return (
        <div className={`flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <MessageSquare size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Team Chat</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{teamMembers.length} Members</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs text-slate-500">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map(msg => {
                        const sender = teamMembers.find(m => m.email === currentUserEmail);
                        // Accurate "Me" check requires sender name matching if ID not trusted, or logic:
                        // Ideally we compare msg.user_id with Authenticated User ID.
                        // But here we rely on the prop for rendering.
                        // Let's assume sender_name is unique enough for display or just use alignment.
                        // Re-fetching auth user id in render is bad.
                        // We will rely on sender_name matching current user name if available.
                        const isMe = sender && msg.sender_name === sender.name;

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {isMe ? 'Me' : (msg.sender_name?.[0] || 'U')}
                                    </div>
                                    <div className={`px-3 py-2 rounded-2xl text-xs ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                                <span className="text-[9px] text-slate-400 mt-1 px-1">
                                    {isMe ? 'You' : getSenderName(msg.user_id, msg.sender_name)} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamChat;
