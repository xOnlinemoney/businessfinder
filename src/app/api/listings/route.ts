import { NextResponse } from 'next/server';

// Mock data - in production this would come from a database
const listings = [
  {
    id: '1',
    title: 'Profitable B2B SaaS - Marketing Automation Platform',
    description: 'Established marketing automation SaaS with strong MRR and low churn.',
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
    isVerified: true,
    isConfidential: false,
    ndaRequired: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'seller-1',
  },
  {
    id: '2',
    title: 'D2C E-commerce Brand - Health & Wellness Supplements',
    description: 'Fast-growing health supplements brand with strong customer loyalty.',
    category: 'ecommerce',
    businessModel: 'one-time',
    askingPrice: 1200000,
    revenue: 1800000,
    profit: 320000,
    margin: 18,
    multiple: 3.75,
    location: 'United States',
    established: 2020,
    employees: '1-5',
    ownerHours: '20-40',
    monthlyVisitors: 120000,
    customers: 15000,
    isVerified: true,
    isConfidential: false,
    ndaRequired: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'seller-2',
  },
  {
    id: '3',
    title: 'Content Site Portfolio - Finance & Investing Niche',
    description: 'Portfolio of 5 finance content sites with strong organic traffic.',
    category: 'content',
    businessModel: 'advertising',
    askingPrice: 450000,
    revenue: 180000,
    profit: 145000,
    margin: 81,
    multiple: 3.1,
    location: 'Remote',
    established: 2018,
    employees: 'just-me',
    ownerHours: '5-10',
    monthlyVisitors: 850000,
    isVerified: true,
    isConfidential: true,
    ndaRequired: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'seller-3',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let filteredListings = [...listings];

  // Apply filters
  if (category && category !== 'all') {
    filteredListings = filteredListings.filter((l) => l.category === category);
  }
  if (status) {
    filteredListings = filteredListings.filter((l) => l.status === status);
  }
  if (minPrice) {
    filteredListings = filteredListings.filter((l) => l.askingPrice >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredListings = filteredListings.filter((l) => l.askingPrice <= parseInt(maxPrice));
  }

  return NextResponse.json({
    success: true,
    data: filteredListings,
    total: filteredListings.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'category', 'askingPrice', 'revenue', 'profit'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new listing
    const newListing = {
      id: `${Date.now()}`,
      ...body,
      status: 'pending',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, save to database
    listings.push(newListing);

    return NextResponse.json(
      { success: true, data: newListing },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
