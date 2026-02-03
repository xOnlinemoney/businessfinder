import { Metadata } from 'next';
import { InquiriesContent } from './inquiries-content';

export const metadata: Metadata = {
  title: 'Inquiries',
  description: 'Manage buyer inquiries for your business listings.',
};

export default function InquiriesPage() {
  return <InquiriesContent />;
}
