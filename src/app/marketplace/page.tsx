import { Metadata } from 'next';
import { MarketplaceWrapper } from './marketplace-wrapper';

export const metadata: Metadata = {
  title: 'Browse Businesses for Sale | SaaS, eCommerce, Apps',
  description: 'Explore hundreds of online businesses for sale. Filter by industry, revenue, price, and more. Find your next SaaS, eCommerce, or app acquisition.',
  keywords: [
    'businesses for sale',
    'SaaS companies for sale',
    'eCommerce stores for sale',
    'apps for sale',
    'online business marketplace',
    'buy business',
  ],
  alternates: {
    canonical: '/marketplace',
  },
};

export default function MarketplacePage() {
  return <MarketplaceWrapper />;
}
