'use client';

import { PageShell } from '@/components/layout/page-shell';
import { MarketplaceContent } from './marketplace-content';

export function MarketplaceWrapper() {
  return (
    <PageShell mainClassName="min-h-screen bg-dark-50 pt-20 lg:pt-0">
      <MarketplaceContent />
    </PageShell>
  );
}

export default MarketplaceWrapper;
