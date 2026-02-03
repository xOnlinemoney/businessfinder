import { Metadata } from 'next';
import { SellContent } from './sell-content';

export const metadata: Metadata = {
  title: 'Sell Your Online Business | List Your SaaS, eCommerce, or App',
  description: 'List your online business for sale and connect with qualified buyers. Sell your SaaS, eCommerce store, mobile app, or digital business quickly and securely.',
  keywords: [
    'sell my business',
    'list business for sale',
    'sell SaaS',
    'sell eCommerce store',
    'sell app',
    'business valuation',
    'sell online business',
  ],
  openGraph: {
    title: 'Sell Your Online Business for Maximum Value | BusinessFinder',
    description: 'Join 2,500+ founders who sold their businesses for 15-40% above market value. Get your free valuation today.',
    type: 'website',
  },
  alternates: {
    canonical: '/sell',
  },
};

export default function SellPage() {
  return <SellContent />;
}
