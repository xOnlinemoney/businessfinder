import { Metadata } from 'next';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'View and manage your conversations.',
};

export default function MessagesPage() {
  return <MessagesContent />;
}
