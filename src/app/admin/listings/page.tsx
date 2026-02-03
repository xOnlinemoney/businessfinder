import { Metadata } from 'next';
import { AdminListingsContent } from './admin-listings-content';

export const metadata: Metadata = {
  title: 'Listings Management | Admin',
  description: 'Manage all business listings on the platform.',
};

export default function AdminListingsPage() {
  return <AdminListingsContent />;
}
