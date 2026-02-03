import { Metadata } from 'next';
import { AdminTransactionsContent } from './admin-transactions-content';

export const metadata: Metadata = {
  title: 'Transactions | Admin',
  description: 'Manage all transactions on the platform.',
};

export default function AdminTransactionsPage() {
  return <AdminTransactionsContent />;
}
