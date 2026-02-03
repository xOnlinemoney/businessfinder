import { Metadata } from 'next';
import { MyListingsContent } from './my-listings-content';

export const metadata: Metadata = {
  title: 'My Listings',
  description: 'Manage your business listings.',
};

export default function MyListingsPage() {
  return <MyListingsContent />;
}
