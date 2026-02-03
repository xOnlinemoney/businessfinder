import { Metadata } from 'next';
import { ResourcesContent } from './resources-content';

export const metadata: Metadata = {
  title: 'Resources & Guides for Business Buyers and Sellers',
  description: 'Expert guides, due diligence checklists, valuation tools, and resources for buying and selling online businesses. Learn from successful acquisitions.',
  keywords: [
    'business acquisition guide',
    'due diligence checklist',
    'business valuation',
    'sell business guide',
    'buy business tips',
    'acquisition templates',
    'LOI template',
    'NDA template',
  ],
  alternates: {
    canonical: '/resources',
  },
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
