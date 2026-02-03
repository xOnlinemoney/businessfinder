import { Metadata } from 'next';
import { NotificationsContent } from './notifications-content';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View all your notifications and alerts.',
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
