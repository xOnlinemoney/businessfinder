# BusinessFinder

A premium marketplace for buying and selling profitable online businesses. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Marketplace** - Browse verified business listings with advanced filtering
- **User Dashboard** - Manage listings, track inquiries, and monitor analytics
- **Admin Panel** - Full administrative control over users, listings, and transactions
- **Responsive Design** - Fully responsive across all devices
- **Modern UI** - Clean, professional design with animations and micro-interactions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Iconify
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/businessfinder.git
cd businessfinder
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard pages
│   ├── admin/             # Admin panel pages
│   └── marketplace/       # Marketplace pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── cards/             # Card components
│   └── sections/          # Page sections
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

### Manual Deployment

```bash
npm run build
npm run start
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | GET | Get all listings |
| `/api/listings` | POST | Create a listing |
| `/api/listings/[id]` | GET | Get a single listing |
| `/api/listings/[id]` | PUT | Update a listing |
| `/api/listings/[id]` | DELETE | Delete a listing |
| `/api/auth` | POST | Authentication (login/register) |
| `/api/health` | GET | Health check |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@businessfinder.com or join our Discord community.
