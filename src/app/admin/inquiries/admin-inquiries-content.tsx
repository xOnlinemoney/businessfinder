'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Inquiry {
  id: string;
  conversationId: string;
  buyerName: string;
  buyerEmail: string;
  buyerAvatar?: string;
  listingTitle: string;
  listingId: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export default function AdminInquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
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

      // Fetch conversations where admin is a participant
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('created_at', { ascending: false }) as {
          data: Array<{ id: string; participant_1_id: string; participant_2_id: string; listing_id: string | null; created_at: string }> | null;
          error: Error | null
        };

      if (convError || !conversationsData) {
        console.error('Error fetching conversations:', convError);
        setIsLoading(false);
        return;
      }

      // Get buyer IDs and listing IDs
      const buyerIds = conversationsData.map(conv =>
        conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id
      ).filter(Boolean);

      const listingIds = conversationsData
        .map(conv => conv.listing_id)
        .filter((id): id is string => Boolean(id));

      // Fetch buyer profiles
      let buyersMap: Record<string, { id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null }> = {};
      if (buyerIds.length > 0) {
        const { data: buyersData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .in('id', buyerIds) as { data: Array<{ id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null }> | null };

        if (buyersData) {
          buyersMap = buyersData.reduce((acc, buyer) => {
            acc[buyer.id] = buyer;
            return acc;
          }, {} as Record<string, { id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null }>);
        }
      }

      // Fetch listings
      let listingsMap: Record<string, { id: string; title: string }> = {};
      if (listingIds.length > 0) {
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id, title')
          .in('id', listingIds) as { data: Array<{ id: string; title: string }> | null };

        if (listingsData) {
          listingsMap = listingsData.reduce((acc, listing) => {
            acc[listing.id] = listing;
            return acc;
          }, {} as Record<string, { id: string; title: string }>);
        }
      }

      // Get first message from each conversation (the initial inquiry)
      const conversationIds = conversationsData.map(c => c.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true }) as { data: Array<{ id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string }> | null };

      // Group messages by conversation
      const firstMessageByConversation: Record<string, any> = {};
      const hasAdminReply: Record<string, boolean> = {};
      const hasUnread: Record<string, boolean> = {};

      messagesData?.forEach(msg => {
        if (!firstMessageByConversation[msg.conversation_id]) {
          firstMessageByConversation[msg.conversation_id] = msg;
        }
        if (msg.sender_id === user.id) {
          hasAdminReply[msg.conversation_id] = true;
        }
        if (!msg.read && msg.sender_id !== user.id) {
          hasUnread[msg.conversation_id] = true;
        }
      });

      // Build inquiries
      const inquiriesList: Inquiry[] = conversationsData.map(conv => {
        const buyerId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id;
        const buyer = buyersMap[buyerId];
        const listing = conv.listing_id ? listingsMap[conv.listing_id] : null;
        const firstMessage = firstMessageByConversation[conv.id];

        let status: 'unread' | 'read' | 'replied' = 'read';
        if (hasUnread[conv.id]) {
          status = 'unread';
        } else if (hasAdminReply[conv.id]) {
          status = 'replied';
        }

        const buyerName = buyer
          ? `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || buyer.email || 'Unknown'
          : 'Unknown';

        return {
          id: conv.id,
          conversationId: conv.id,
          buyerName: buyerName,
          buyerEmail: buyer?.email || 'Unknown',
          buyerAvatar: buyer?.avatar_url || undefined,
          listingTitle: listing?.title || 'Unknown Listing',
          listingId: conv.listing_id || '',
          message: firstMessage?.content || 'No message',
          createdAt: conv.created_at,
          status,
        };
      });

      setInquiries(inquiriesList);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  });

  const statusCounts = {
    all: inquiries.length,
    unread: inquiries.filter(i => i.status === 'unread').length,
    read: inquiries.filter(i => i.status === 'read').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-900">Inquiries</h1>
            <p className="text-dark-500 text-sm mt-1">
              All listing inquiries from potential buyers
            </p>
          </div>
          <button
            onClick={fetchInquiries}
            className="p-2 text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <Icon icon="solar:refresh-linear" width={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read', 'replied'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={cn(
                'ml-2 px-1.5 py-0.5 rounded-full text-xs',
                filter === f ? 'bg-white/20' : 'bg-dark-200'
              )}>
                {statusCounts[f]}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-dark-200 p-12 text-center">
            <Icon icon="solar:inbox-linear" width={48} className="mx-auto text-dark-300 mb-3" />
            <p className="text-dark-500">No inquiries found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dark-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {inquiry.buyerAvatar ? (
                          <img
                            src={inquiry.buyerAvatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon icon="solar:user-linear" width={16} className="text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-dark-900 text-sm">{inquiry.buyerName}</p>
                          <p className="text-dark-500 text-xs">{inquiry.buyerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/listing/${inquiry.listingId}`}
                        className="text-primary text-sm hover:underline"
                      >
                        {inquiry.listingTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark-600 text-sm truncate max-w-xs">
                        {inquiry.message}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark-500 text-sm whitespace-nowrap">
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        inquiry.status === 'unread' && 'bg-red-100 text-red-700',
                        inquiry.status === 'read' && 'bg-yellow-100 text-yellow-700',
                        inquiry.status === 'replied' && 'bg-green-100 text-green-700'
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          inquiry.status === 'unread' && 'bg-red-500',
                          inquiry.status === 'read' && 'bg-yellow-500',
                          inquiry.status === 'replied' && 'bg-green-500'
                        )} />
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/messages?conversation=${inquiry.conversationId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <Icon icon="solar:chat-round-dots-linear" width={16} />
                        Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
