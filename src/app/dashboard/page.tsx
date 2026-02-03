import { Metadata } from 'next';
import { DashboardContent } from './dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your listings, track performance, and connect with buyers.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
