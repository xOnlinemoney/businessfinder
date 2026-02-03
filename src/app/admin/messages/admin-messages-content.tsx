'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    business_type?: string | null;
    category?: string | null;
  } | null;
  buyer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url?: string | null;
  } | null;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export default function AdminMessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // Define types for Supabase responses
      type ConversationRow = { id: string; participant_1_id: string; participant_2_id: string; listing_id: string | null; created_at: string; updated_at: string };
      type ProfileRow = { id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null };
      type ListingRow = { id: string; title: string; business_type: string | null; category: string | null };
      type MessageRow = { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string };

      // Fetch conversations where admin is a participant
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false }) as { data: ConversationRow[] | null; error: Error | null };

      if (convError) {
        console.error('Error fetching conversations:', convError);
        setIsLoading(false);
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Get all unique buyer IDs (the other participant)
      const buyerIds = conversationsData.map(conv =>
        conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id
      ).filter(Boolean);

      // Get listing IDs
      const listingIds = conversationsData
        .map(conv => conv.listing_id)
        .filter((id): id is string => Boolean(id));

      // Fetch buyer profiles
      let buyersMap: Record<string, ProfileRow> = {};
      if (buyerIds.length > 0) {
        const { data: buyersData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .in('id', buyerIds) as { data: ProfileRow[] | null };

        if (buyersData) {
          buyersMap = buyersData.reduce((acc, buyer) => {
            acc[buyer.id] = buyer;
            return acc;
          }, {} as Record<string, ProfileRow>);
        }
      }

      // Fetch listings
      let listingsMap: Record<string, ListingRow> = {};
      if (listingIds.length > 0) {
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id, title, business_type, category')
          .in('id', listingIds) as { data: ListingRow[] | null };

        if (listingsData) {
          listingsMap = listingsData.reduce((acc, listing) => {
            acc[listing.id] = listing;
            return acc;
          }, {} as Record<string, ListingRow>);
        }
      }

      // Fetch messages for each conversation
      const conversationIds = conversationsData.map(c => c.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false }) as { data: MessageRow[] | null };

      // Group messages by conversation and calculate unread count
      const messagesByConversation: Record<string, Message[]> = {};
      const unreadByConversation: Record<string, number> = {};

      messagesData?.forEach(msg => {
        if (!messagesByConversation[msg.conversation_id]) {
          messagesByConversation[msg.conversation_id] = [];
          unreadByConversation[msg.conversation_id] = 0;
        }
        messagesByConversation[msg.conversation_id].push(msg);
        // Count unread messages sent TO admin (not FROM admin)
        if (!msg.read && msg.sender_id !== user.id) {
          unreadByConversation[msg.conversation_id]++;
        }
      });

      // Build full conversation objects
      const fullConversations: Conversation[] = conversationsData.map(conv => {
        const buyerId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id;
        const convMessages = messagesByConversation[conv.id] || [];

        return {
          ...conv,
          buyer: buyersMap[buyerId] || null,
          listing: conv.listing_id ? listingsMap[conv.listing_id] : null,
          messages: convMessages,
          lastMessage: convMessages[0] || null,
          unreadCount: unreadByConversation[conv.id] || 0,
        };
      });

      setConversations(fullConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);

    const supabase = getSupabaseClient();
    if (!supabase || !currentUserId) return;

    // Fetch all messages for this conversation
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true }) as { data: Message[] | null };

    if (messagesData) {
      setMessages(messagesData);

      // Mark messages as read
      const unreadIds = messagesData
        .filter(m => !m.read && m.sender_id !== currentUserId)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);

        // Update local state
        setConversations(prev => prev.map(c =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    setIsSending(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsSending(false);
      return;
    }

    try {
      // Insert the message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: messageData, error } = await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          content: newMessage.trim(),
          read: false,
        })
        .select()
        .single() as { data: Message | null; error: Error | null };

      if (error || !messageData) throw error;

      // Update conversation's updated_at
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      // Update local state
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      // Update conversation list
      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: messageData, updated_at: new Date().toISOString() }
          : c
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Icon icon="solar:spinner-linear" className="animate-spin text-primary" width={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-dark-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900">Messages</h1>
            <p className="text-dark-500 text-sm mt-1">
              {totalUnread > 0
                ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`
                : 'All conversations with buyers'}
            </p>
          </div>
          <button
            onClick={fetchConversations}
            className="p-2 text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <Icon icon="solar:refresh-linear" width={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-dark-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dark-200">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                width={18}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-dark-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <Icon icon="solar:chat-round-dots-linear" width={48} className="mx-auto text-dark-300 mb-3" />
                <p className="text-dark-500 text-sm">No conversations yet</p>
                <p className="text-dark-400 text-xs mt-1">Messages from buyers will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-100">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-dark-50 transition-colors',
                      selectedConversation?.id === conversation.id && 'bg-primary/5 border-l-2 border-primary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {conversation.buyer?.avatar_url ? (
                          <img
                            src={conversation.buyer.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon icon="solar:user-linear" width={20} className="text-primary" />
                          </div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={cn(
                            'font-medium text-dark-900 truncate',
                            conversation.unreadCount > 0 && 'font-semibold'
                          )}>
                            {conversation.buyer
                              ? `${conversation.buyer.first_name || ''} ${conversation.buyer.last_name || ''}`.trim() || conversation.buyer.email
                              : 'Unknown User'}
                          </span>
                          <span className="text-xs text-dark-400 whitespace-nowrap">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        {conversation.listing && (
                          <p className="text-xs text-primary mb-1 truncate">
                            Re: {conversation.listing.title}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className={cn(
                            'text-sm truncate',
                            conversation.unreadCount > 0 ? 'text-dark-700 font-medium' : 'text-dark-500'
                          )}>
                            {conversation.lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-dark-50">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="bg-white border-b border-dark-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  {selectedConversation.buyer?.avatar_url ? (
                    <img
                      src={selectedConversation.buyer.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon icon="solar:user-linear" width={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-dark-900">
                      {selectedConversation.buyer
                        ? `${selectedConversation.buyer.first_name || ''} ${selectedConversation.buyer.last_name || ''}`.trim() || selectedConversation.buyer.email
                        : 'Unknown User'}
                    </h2>
                    {selectedConversation.listing && (
                      <p className="text-sm text-dark-500">
                        Interested in: <span className="text-primary">{selectedConversation.listing.title}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-3',
                          isOwn
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-white text-dark-900 rounded-bl-md shadow-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={cn(
                          'text-[11px] mt-1',
                          isOwn ? 'text-white/70' : 'text-dark-400'
                        )}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-dark-200 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your reply..."
                      rows={1}
                      className="w-full px-4 py-3 bg-dark-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? (
                      <Icon icon="solar:spinner-linear" className="animate-spin" width={20} />
                    ) : (
                      <Icon icon="solar:plain-2-bold" width={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon icon="solar:chat-round-dots-linear" width={64} className="mx-auto text-dark-300 mb-4" />
                <h3 className="text-lg font-medium text-dark-700 mb-2">Select a conversation</h3>
                <p className="text-dark-500 text-sm">Choose from your existing conversations<br />to view and respond to messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
