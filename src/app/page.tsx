import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero';
import { FeaturedListings } from '@/components/sections/featured-listings';
import { HowItWorks } from '@/components/sections/how-it-works';
import { StatsSection } from '@/components/sections/stats';
import { CTASection } from '@/components/sections/cta';

export const metadata: Metadata = {
  title: 'BusinessFinder - Buy and Sell Online Businesses | SaaS, eCommerce, Apps',
  description: 'Discover the best marketplace to buy and sell online businesses. Find verified SaaS, eCommerce stores, mobile apps, and digital businesses for acquisition.',
  keywords: [
    'buy online business',
    'sell online business',
    'business acquisition',
    'SaaS for sale',
    'eCommerce business for sale',
    'app for sale',
    'business marketplace',
    'acquire business',
  ],
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedListings />
        <HowItWorks />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
