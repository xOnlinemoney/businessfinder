import { Metadata } from 'next';
import { AdminUsersContent } from './admin-users-content';

export const metadata: Metadata = {
  title: 'Users Management | Admin',
  description: 'Manage users on the platform.',
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
