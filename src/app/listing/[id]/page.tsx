import { Metadata } from 'next';
import { ListingDetailContent } from './listing-detail-content';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In production, fetch listing data here
  return {
    title: `Listing #${params.id} | BusinessFinder`,
    description: 'View detailed information about this business listing including financials, metrics, and acquisition details.',
  };
}

export default function ListingDetailPage({ params }: Props) {
  return <ListingDetailContent id={params.id} />;
}
