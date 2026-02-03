import { Metadata } from 'next';
import { AnalyticsContent } from './analytics-content';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Track performance metrics for your business listings.',
};

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
