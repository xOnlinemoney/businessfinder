import { Metadata } from 'next';
import { OffersReceivedContent } from './offers-content';

export const metadata: Metadata = {
  title: 'Offers Received',
  description: 'View and manage offers received on your business listings.',
};

export default function OffersReceivedPage() {
  return <OffersReceivedContent />;
}
