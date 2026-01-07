import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Send, Check, CheckCheck, Loader, Image as ImageIcon, X } from 'lucide-react';
import { TeamMember } from '../types';

interface Message {
    id: string;
    plan_id: string;
    user_id: string;
    content: string;
    created_at: string;
    sender_name?: string;
    edited_at?: string;
    is_deleted?: boolean;
    reply_to_id?: string;
    read_status?: {
        total_members: number;
        read_count: number;
        delivered_count: number;
    };
}

interface TypingUser {
    user_id: string;
    user_name: string;
}

interface TeamChatWindowProps {
    planId: string;
    teamName: string;
    currentUserEmail: string;
    teamMembers: TeamMember[];
    className?: string;
}

const TeamChatWindow: React.FC<TeamChatWindowProps> = ({
    planId,
    teamName,
    currentUserEmail,
    teamMembers,
    className
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchMessages();
        subscribeToMessages();
        subscribeToTyping();
        markMessagesAsRead();

        return () => {
            // Cleanup subscriptions
            supabase.removeAllChannels();
        };
    }, [planId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setCurrentUserId(user.id);

            const { data, error } = await supabase
                .from('team_messages')
                .select(`
          *,
          message_read_status (
            user_id,
            read_at,
            delivered_at
          )
        `)
                .eq('plan_id', planId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Calculate read status for each message
            const messagesWithStatus = (data || []).map(msg => {
                const readStatuses = msg.message_read_status || [];
                const totalMembers = teamMembers.length;
                const readCount = readStatuses.filter((s: any) => s.read_at !== null).length;
                const deliveredCount = readStatuses.filter((s: any) => s.delivered_at !== null).length;

                return {
                    ...msg,
                    read_status: {
                        total_members: totalMembers,
                        read_count: readCount,
                        delivered_count: deliveredCount
                    }
                };
            });

            setMessages(messagesWithStatus);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`team_messages:${planId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'team_messages',
                    filter: `plan_id=eq.${planId}`
                },
                (payload: any) => {
                    const newMsg = {
                        ...payload.new,
                        read_status: {
                            total_members: teamMembers.length,
                            read_count: 0,
                            delivered_count: 0
                        }
                    };
                    setMessages(prev => [...prev, newMsg]);

                    // Auto-mark as read if window is active
                    if (document.hasFocus()) {
                        markMessageAsRead(newMsg.id);
                    }
                }
            )
            .subscribe();
    };

    const subscribeToTyping = () => {
        const channel = supabase
            .channel(`typing:${planId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'typing_indicators',
                    filter: `plan_id=eq.${planId}`
                },
                (payload: any) => {
                    if (payload.new && payload.new.is_typing && payload.new.user_id !== currentUserId) {
                        setTypingUsers(prev => {
                            const exists = prev.find(u => u.user_id === payload.new.user_id);
                            if (exists) return prev;
                            return [...prev, {
                                user_id: payload.new.user_id,
                                user_name: payload.new.user_name || 'Someone'
                            }];
                        });

                        // Auto-remove after 3 seconds
                        setTimeout(() => {
                            setTypingUsers(prev => prev.filter(u => u.user_id !== payload.new.user_id));
                        }, 3000);
                    } else if (payload.new && !payload.new.is_typing) {
                        setTypingUsers(prev => prev.filter(u => u.user_id !== payload.new.user_id));
                    }
                }
            )
            .subscribe();
    };

    const markMessagesAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.rpc('mark_messages_read', {
                p_plan_id: planId,
                p_user_id: user.id
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const markMessageAsRead = async (messageId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('message_read_status')
                .upsert({
                    message_id: messageId,
                    user_id: user.id,
                    read_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleTyping = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const sender = teamMembers.find(m => m.email === currentUserEmail);
            const userName = sender?.name || 'Someone';

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set typing indicator
            await supabase
                .from('typing_indicators')
                .upsert({
                    plan_id: planId,
                    user_id: user.id,
                    user_name: userName,
                    is_typing: true,
                    updated_at: new Date().toISOString()
                });

            // Auto-clear after 3 seconds
            typingTimeoutRef.current = setTimeout(async () => {
                await supabase
                    .from('typing_indicators')
                    .upsert({
                        plan_id: planId,
                        user_id: user.id,
                        user_name: userName,
                        is_typing: false,
                        updated_at: new Date().toISOString()
                    });
            }, 3000);
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const sender = teamMembers.find(m => m.email === currentUserEmail);
            const senderName = sender?.name || 'Unknown';

            const { error } = await supabase
                .from('team_messages')
                .insert({
                    plan_id: planId,
                    user_id: user.id,
                    content,
                    sender_name: senderName
                });

            if (error) throw error;

            // Clear typing indicator
            await supabase
                .from('typing_indicators')
                .upsert({
                    plan_id: planId,
                    user_id: user.id,
                    user_name: senderName,
                    is_typing: false,
                    updated_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(content); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };

    const getReadReceiptIcon = (msg: Message) => {
        if (msg.user_id !== currentUserId) return null;

        const { read_count, delivered_count, total_members } = msg.read_status || { read_count: 0, delivered_count: 0, total_members: 0 };

        if (read_count > 0) {
            return <CheckCheck size={14} className="text-blue-400" />;
        } else if (delivered_count > 0) {
            return <CheckCheck size={14} className="text-slate-500" />;
        } else {
            return <Check size={14} className="text-slate-500" />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className={`bg-[#06080f] flex items-center justify-center ${className}`}>
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className={`bg-[#06080f] flex flex-col h-full ${className}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Send size={28} className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No messages yet</p>
                        <p className="text-slate-600 text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isMe
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-300'
                                        }`}>
                                        {isMe ? 'Me' : (msg.sender_name?.[0] || 'U')}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-[1.01] ${isMe
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-500/20'
                                        : 'bg-[#0b0f1a] border border-white/10 text-slate-200 rounded-bl-none shadow-black/40'
                                        }`}>
                                        {!isMe && (
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-400">{msg.sender_name}</p>
                                        )}
                                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                                    </div>
                                </div>

                                {/* Timestamp & Read Receipt */}
                                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="text-[10px] text-slate-600 font-medium">
                                        {formatTimestamp(msg.created_at)}
                                    </span>
                                    {getReadReceiptIcon(msg)}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium ml-2">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {typingUsers.map(u => u.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0b0f1a]/50 border-t border-white/5 backdrop-blur-sm">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#06080f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-black uppercase italic text-xs tracking-widest"
                    >
                        {isSending ? (
                            <Loader size={18} className="animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline">Send</span>
                                <Send size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamChatWindow;
