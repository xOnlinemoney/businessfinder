'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  action: string;
  icon: string;
  color: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'offer',
    title: 'New Offer Received',
    message: 'Michael Chen submitted an offer of $2.65M for Marketing Automation SaaS',
    time: '5 minutes ago',
    read: false,
    action: '/dashboard/offers',
    icon: 'solar:dollar-bold',
    color: 'emerald',
  },
  {
    id: '2',
    type: 'inquiry',
    title: 'New Inquiry',
    message: 'Sarah Williams is interested in E-Commerce Fashion Brand and has questions',
    time: '1 hour ago',
    read: false,
    action: '/dashboard/inquiries',
    icon: 'solar:chat-round-dots-bold',
    color: 'primary',
  },
  {
    id: '3',
    type: 'nda',
    title: 'NDA Signed',
    message: 'David Park signed the NDA for Marketing Automation SaaS',
    time: '3 hours ago',
    read: false,
    action: '/dashboard/ndas',
    icon: 'solar:shield-check-bold',
    color: 'purple',
  },
  {
    id: '4',
    type: 'view',
    title: 'Listing Milestone',
    message: 'Your listing "Marketing Automation SaaS" reached 1,000 views!',
    time: '1 day ago',
    read: true,
    action: '/dashboard/analytics',
    icon: 'solar:eye-bold',
    color: 'amber',
  },
  {
    id: '5',
    type: 'message',
    title: 'New Message',
    message: 'Your advisor Sarah Mitchell sent you a message about your listing',
    time: '1 day ago',
    read: true,
    action: '/dashboard/messages',
    icon: 'solar:letter-bold',
    color: 'primary',
  },
];

const filterOptions = [
  { id: 'all', label: 'All', icon: 'solar:inbox-bold' },
  { id: 'unread', label: 'Unread', icon: 'solar:notification-unread-bold' },
  { id: 'offers', label: 'Offers', icon: 'solar:dollar-bold' },
  { id: 'inquiries', label: 'Inquiries', icon: 'solar:chat-round-dots-bold' },
  { id: 'messages', label: 'Messages', icon: 'solar:letter-bold' },
];

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'offer':
    case 'offer_update': return 'solar:dollar-bold';
    case 'inquiry':
    case 'inquiry_reply': return 'solar:chat-round-dots-bold';
    case 'message': return 'solar:letter-bold';
    case 'nda': return 'solar:shield-check-bold';
    case 'view': return 'solar:eye-bold';
    default: return 'solar:bell-bold';
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'offer':
    case 'offer_update': return 'emerald';
    case 'inquiry':
    case 'inquiry_reply':
    case 'message': return 'primary';
    case 'nda': return 'purple';
    case 'view': return 'amber';
    default: return 'primary';
  }
};

const getNotificationTitle = (type: string): string => {
  switch (type) {
    case 'offer': return 'New Offer Received';
    case 'offer_update': return 'Offer Updated';
    case 'inquiry': return 'New Inquiry';
    case 'inquiry_reply': return 'Inquiry Reply';
    case 'message': return 'New Message';
    case 'nda': return 'NDA Signed';
    case 'view': return 'Listing Milestone';
    default: return 'Notification';
  }
};

const getNotificationAction = (type: string): string => {
  switch (type) {
    case 'offer':
    case 'offer_update': return '/dashboard/offers';
    case 'inquiry':
    case 'inquiry_reply': return '/dashboard/inquiries';
    case 'message': return '/dashboard/messages';
    case 'nda': return '/dashboard/ndas';
    case 'view': return '/dashboard/analytics';
    default: return '/dashboard';
  }
};

export function NotificationsContent() {
  const [filter, setFilter] = useState('all');
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - use mock data
        setNotificationsList(mockNotifications);
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNotificationsList([]);
          setIsLoading(false);
          return;
        }

        // Fetch notifications for this user
        const { data, error } = await (supabase.from('notifications') as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedNotifications: Notification[] = (data || []).map((n: any) => ({
          id: n.id,
          type: n.type || 'system',
          title: getNotificationTitle(n.type),
          message: n.message || '',
          time: formatRelativeTime(n.created_at),
          read: n.is_read || false,
          action: getNotificationAction(n.type),
          icon: getNotificationIcon(n.type),
          color: getNotificationColor(n.type),
        }));

        setNotificationsList(formattedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationsList(mockNotifications);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notificationsList.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'offers') return n.type === 'offer' || n.type === 'offer_update';
    if (filter === 'inquiries') return n.type === 'inquiry' || n.type === 'inquiry_reply';
    if (filter === 'messages') return n.type === 'message';
    return true;
  });

  const markAsRead = async (id: string) => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('notifications') as any)
          .update({ is_read: true })
          .eq('id', id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    setNotificationsList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        }
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }

    setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-dark-900 tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-primary rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Icon icon="solar:check-read-linear" width={18} />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Icon icon="solar:settings-linear" width={18} />
            Settings
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                filter === option.id
                  ? 'bg-primary text-white'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              )}
            >
              <Icon icon={option.icon} width={16} />
              {option.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-dark-100 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-dark-100 rounded mb-2" />
                    <div className="h-4 w-full bg-dark-100 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-dark-100 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.action}
                onClick={() => markAsRead(notification.id)}
              >
                <Card
                  className={cn(
                    'flex items-start gap-4 hover:border-primary/30 transition-colors cursor-pointer',
                    !notification.read && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    notification.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                    notification.color === 'primary' && 'bg-primary/10 text-primary',
                    notification.color === 'purple' && 'bg-purple-100 text-purple-600',
                    notification.color === 'amber' && 'bg-amber-100 text-amber-600'
                  )}>
                    <Icon icon={notification.icon} width={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={cn(
                        'font-semibold',
                        notification.read ? 'text-dark-700' : 'text-dark-900'
                      )}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-dark-400 whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className={cn(
                      'text-sm',
                      notification.read ? 'text-dark-500' : 'text-dark-600'
                    )}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Icon icon="solar:bell-off-linear" width={48} className="text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 mb-2">No notifications</h3>
            <p className="text-dark-500">You're all caught up! Check back later for updates.</p>
          </Card>
        )}
      </main>
    </div>
  );
}

export default NotificationsContent;
