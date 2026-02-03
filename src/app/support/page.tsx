import { Metadata } from 'next';
import { SupportContent } from './support-content';

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Get help with buying or selling businesses. Contact your advisor, browse FAQs, and access resources.',
};

export default function SupportPage() {
  return <SupportContent />;
}
