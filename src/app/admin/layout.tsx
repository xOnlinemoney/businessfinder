import { Metadata } from 'next';
import { AdminLayoutClient } from './admin-layout-client';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | BusinessFinder Admin',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
