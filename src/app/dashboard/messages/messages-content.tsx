'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender: 'me' | 'them';
  message: string;
  time: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  recipientId: string;
  contact: {
    name: string;
    avatar: string;
    role: string;
    online: boolean;
  };
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    recipientId: 'user-1',
    contact: { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Your Advisor', online: true },
    lastMessage: 'Great news! I have a qualified buyer interested in your SaaS listing.',
    time: '2 min ago',
    unread: 2,
    messages: [
      { id: '1', sender: 'them', message: 'Hi! I\'ve been reviewing your listing and have some great news.', time: '9:30 AM', status: 'read' },
      { id: '2', sender: 'me', message: 'Hi Sarah! What\'s the update?', time: '9:35 AM', status: 'read' },
      { id: '3', sender: 'them', message: 'We have a qualified buyer who has shown strong interest in your SaaS business.', time: '9:40 AM', status: 'read' },
      { id: '4', sender: 'them', message: 'They have proof of funds and are ready to move quickly.', time: '9:41 AM', status: 'read' },
      { id: '5', sender: 'them', message: 'Great news! I have a qualified buyer interested in your SaaS listing.', time: '10:00 AM', status: 'delivered' },
    ],
  },
  {
    id: '2',
    recipientId: 'user-2',
    contact: { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=11', role: 'Buyer', online: false },
    lastMessage: 'Thank you for the additional information. I would like to schedule a call.',
    time: '1 hour ago',
    unread: 1,
    messages: [
      { id: '1', sender: 'them', message: 'Hi! I noticed you have a great SaaS business listed. I have a few questions about the technology stack.', time: '10:30 AM', status: 'read' },
      { id: '2', sender: 'me', message: 'Hello! Thank you for your interest. The platform is built on React and Node.js with PostgreSQL as the database. Happy to provide more details.', time: '10:35 AM', status: 'read' },
      { id: '3', sender: 'them', message: 'Thank you for the additional information. I would like to schedule a call.', time: '10:45 AM', status: 'delivered' },
    ],
  },
];

export function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const filteredConversations = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setConversations(mockConversations);
        setSelectedConversationId(mockConversations[0]?.id || null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setConversations(mockConversations);
          setSelectedConversationId(mockConversations[0]?.id || null);
          setIsLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        // Fetch conversations where user is a participant
        const { data: conversationsData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (convError) {
          console.error('Error fetching conversations:', convError);
          setConversations([]);
          setIsLoading(false);
          return;
        }

        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setIsLoading(false);
          return;
        }

        // Get all participant IDs to fetch profiles
        const participantIds = new Set<string>();
        conversationsData.forEach((conv: any) => {
          participantIds.add(conv.participant_1_id);
          participantIds.add(conv.participant_2_id);
        });

        // Fetch profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', Array.from(participantIds));

        const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

        // Fetch messages for all conversations
        const conversationIds = conversationsData.map((c: any) => c.id);
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: true });

        // Group messages by conversation
        const messagesMap = new Map<string, any[]>();
        (messagesData || []).forEach((msg: any) => {
          if (!messagesMap.has(msg.conversation_id)) {
            messagesMap.set(msg.conversation_id, []);
          }
          messagesMap.get(msg.conversation_id)!.push(msg);
        });

        // Build conversation objects
        const formattedConversations: Conversation[] = conversationsData.map((conv: any) => {
          const otherUserId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id;
          const otherUser = profilesMap.get(otherUserId);
          const convMessages = messagesMap.get(conv.id) || [];

          // Count unread messages (messages from other user that are not read)
          const unreadCount = convMessages.filter(
            (m: any) => m.sender_id !== user.id && m.status !== 'read'
          ).length;

          return {
            id: conv.id,
            recipientId: otherUserId,
            contact: {
              name: otherUser?.full_name || otherUser?.email?.split('@')[0] || 'Unknown User',
              avatar: otherUser?.avatar_url || '',
              role: conv.subject || 'Inquiry',
              online: false,
            },
            lastMessage: conv.last_message_preview || convMessages[convMessages.length - 1]?.content || '',
            time: formatRelativeTime(conv.last_message_at || conv.created_at),
            unread: conv.participant_1_id === user.id ? conv.participant_1_unread : conv.participant_2_unread,
            messages: convMessages.map((msg: any) => ({
              id: msg.id,
              sender: msg.sender_id === user.id ? 'me' as const : 'them' as const,
              message: msg.content,
              time: formatTime(msg.created_at),
              status: msg.status || 'delivered',
            })),
          };
        });

        setConversations(formattedConversations);
        if (formattedConversations.length > 0) {
          setSelectedConversationId(formattedConversations[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    const markAsRead = async () => {
      if (!selectedConversation || selectedConversation.unread === 0) return;

      const supabase = getSupabaseClient();
      if (!supabase || !currentUserId) return;

      try {
        // Update messages to read
        await (supabase.from('messages') as any)
          .update({ status: 'read' })
          .eq('conversation_id', selectedConversation.id)
          .neq('sender_id', currentUserId);

        // Reset unread count on conversation
        const { data: convData } = await supabase
          .from('conversations')
          .select('participant_1_id')
          .eq('id', selectedConversation.id)
          .single() as { data: { participant_1_id: string } | null };

        if (convData) {
          const updateField = convData.participant_1_id === currentUserId
            ? 'participant_1_unread'
            : 'participant_2_unread';

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('conversations')
            .update({ [updateField]: 0 })
            .eq('id', selectedConversation.id);
        }

        // Update local state
        setConversations(prev => prev.map(c =>
          c.id === selectedConversationId ? { ...c, unread: 0 } : c
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [selectedConversationId, currentUserId]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      message: messageText,
      time: getCurrentTime(),
      status: 'sending',
    };

    // Add message to conversation optimistically
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: messageText,
          time: 'Just now',
        };
      }
      return conv;
    }));

    const supabase = getSupabaseClient();

    if (supabase && currentUserId) {
      try {
        const { error } = await (supabase.from('messages') as any).insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          content: messageText,
        });

        if (error) throw error;

        // Update message status to sent
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === newMsg.id ? { ...msg, status: 'sent' as const } : msg
              ),
            };
          }
          return conv;
        }));

        // Simulate delivery
        await new Promise(resolve => setTimeout(resolve, 500));

        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === newMsg.id ? { ...msg, status: 'delivered' as const } : msg
              ),
            };
          }
          return conv;
        }));

      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      // Demo mode - simulate sending
      await new Promise(resolve => setTimeout(resolve, 800));
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === newMsg.id ? { ...msg, status: 'delivered' as const } : msg
            ),
          };
        }
        return conv;
      }));
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversationId(conv.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-dark-200 bg-white flex flex-col">
        <div className="p-4 border-b border-dark-200">
          <h1 className="text-lg font-bold text-dark-900 mb-4">Messages</h1>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Icon icon="solar:magnifer-linear" width={18} />}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-dark-50 transition-colors text-left border-b border-dark-100',
                  selectedConversationId === conversation.id && 'bg-primary/5 border-l-4 border-l-primary'
                )}
              >
                <div className="relative shrink-0">
                  {conversation.contact.avatar ? (
                    <img
                      src={conversation.contact.avatar}
                      alt={conversation.contact.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon icon="solar:user-bold" width={24} className="text-primary" />
                    </div>
                  )}
                  {conversation.contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-dark-900 truncate">{conversation.contact.name}</h3>
                    <span className="text-xs text-dark-400">{conversation.time}</span>
                  </div>
                  <p className="text-xs text-dark-500 mb-1">{conversation.contact.role}</p>
                  <p className="text-sm text-dark-600 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <Icon icon="solar:chat-round-dots-linear" width={48} className="text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No conversations yet</h3>
              <p className="text-sm text-dark-500">Messages from buyers and advisors will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-dark-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-dark-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.contact.avatar ? (
                  <img
                    src={selectedConversation.contact.avatar}
                    alt={selectedConversation.contact.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="solar:user-bold" width={20} className="text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-dark-900">{selectedConversation.contact.name}</h2>
                  <p className="text-xs text-dark-500 flex items-center gap-1">
                    {selectedConversation.contact.online && (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Online
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Icon icon="solar:phone-linear" width={18} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon icon="solar:videocamera-linear" width={18} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'me' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-md px-4 py-3 rounded-2xl',
                      message.sender === 'me'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-dark-900 rounded-bl-none shadow-sm'
                    )}
                  >
                    <p className="text-sm">{message.message}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      message.sender === 'me' ? 'justify-end' : ''
                    )}>
                      <p className={cn(
                        'text-xs',
                        message.sender === 'me' ? 'text-blue-100' : 'text-dark-400'
                      )}>
                        {message.time}
                      </p>
                      {message.sender === 'me' && message.status && (
                        <span className="text-blue-100">
                          {message.status === 'sending' && (
                            <Icon icon="mdi:clock-outline" width={12} />
                          )}
                          {message.status === 'sent' && (
                            <Icon icon="mdi:check" width={12} />
                          )}
                          {message.status === 'delivered' && (
                            <Icon icon="mdi:check-all" width={12} />
                          )}
                          {message.status === 'read' && (
                            <Icon icon="mdi:check-all" width={12} className="text-blue-200" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-dark-200">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Icon icon="solar:paperclip-linear" width={20} />
                </Button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSending}
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <Icon icon="mdi:loading" className="animate-spin" width={18} />
                  ) : (
                    <Icon icon="solar:plain-bold" width={18} />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="solar:chat-round-dots-linear" width={64} className="text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">Select a conversation</h3>
              <p className="text-sm text-dark-500">Choose a conversation from the list to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesContent;
