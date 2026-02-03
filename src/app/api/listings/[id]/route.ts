import { NextResponse } from 'next/server';

// Mock data - same as parent route
const listings = [
  {
    id: '1',
    title: 'Profitable B2B SaaS - Marketing Automation Platform',
    description: 'Established marketing automation SaaS with strong MRR and low churn. This platform has been growing steadily for the past 3 years with minimal owner involvement required.',
    category: 'saas',
    businessModel: 'subscription',
    askingPrice: 2500000,
    revenue: 840000,
    profit: 420000,
    margin: 50,
    multiple: 5.95,
    location: 'United States',
    established: 2019,
    employees: '5-10',
    ownerHours: '10-20',
    monthlyVisitors: 45000,
    customers: 850,
    mrr: 70000,
    churnRate: 2.1,
    ltv: 3200,
    cac: 280,
    isVerified: true,
    isConfidential: false,
    ndaRequired: true,
    status: 'active',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    trafficSources: [
      { source: 'Organic', percentage: 45 },
      { source: 'Paid', percentage: 30 },
      { source: 'Direct', percentage: 15 },
      { source: 'Referral', percentage: 10 },
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 65000 },
      { month: 'Feb', revenue: 68000 },
      { month: 'Mar', revenue: 70000 },
      { month: 'Apr', revenue: 72000 },
      { month: 'May', revenue: 75000 },
      { month: 'Jun', revenue: 78000 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'seller-1',
    seller: {
      name: 'John S.',
      avatar: 'https://i.pravatar.cc/150?img=11',
      verified: true,
      responseTime: '< 24 hours',
    },
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const listing = listings.find((l) => l.id === params.id);

  if (!listing) {
    return NextResponse.json(
      { success: false, error: 'Listing not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: listing,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const listingIndex = listings.findIndex((l) => l.id === params.id);

    if (listingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Update listing
    listings[listingIndex] = {
      ...listings[listingIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: listings[listingIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const listingIndex = listings.findIndex((l) => l.id === params.id);

  if (listingIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Listing not found' },
      { status: 404 }
    );
  }

  // Remove listing (in production, you might soft delete)
  const deleted = listings.splice(listingIndex, 1)[0];

  return NextResponse.json({
    success: true,
    data: deleted,
    message: 'Listing deleted successfully',
  });
}
