'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';

// P&L Data Types
interface PnLRow {
  month: string;
  year: number;
  dateKey: string; // For merging multiple files (e.g., "January-2024")
  revenue: number;
  cogs: number;
  grossProfit: number;
  marketing: number;
  operatingExpenses: number;
  netProfit: number;
}

interface ColumnMapping {
  date: string;
  revenue: string;
  cogs: string;
  grossProfit: string;
  marketing: string;
  operatingExpenses: string;
  netProfit: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'sales' | 'marketing' | 'expenses' | 'complete';
  rowCount: number;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  lastSync?: string;
}

// Expected column fields for mapping
const expectedFields = [
  { key: 'date', label: 'Date', required: true },
  { key: 'revenue', label: 'Revenue / Sales', required: false },
  { key: 'cogs', label: 'Cost of Goods Sold (COGS)', required: false },
  { key: 'grossProfit', label: 'Gross Profit', required: false },
  { key: 'marketing', label: 'Marketing / Advertising', required: false },
  { key: 'operatingExpenses', label: 'Operating Expenses', required: false },
  { key: 'netProfit', label: 'Net Profit / Net Income', required: false },
];

// Available integrations
const availableIntegrations: Integration[] = [
  { id: 'shopify', name: 'Shopify', icon: 'simple-icons:shopify', description: 'Connect your Shopify store to automatically import sales data', connected: false },
  { id: 'stripe', name: 'Stripe', icon: 'simple-icons:stripe', description: 'Import payment and revenue data from your Stripe account', connected: false },
  { id: 'quickbooks', name: 'QuickBooks', icon: 'simple-icons:quickbooks', description: 'Sync your QuickBooks accounting data', connected: false },
  { id: 'xero', name: 'Xero', icon: 'simple-icons:xero', description: 'Connect your Xero accounting software', connected: false },
  { id: 'woocommerce', name: 'WooCommerce', icon: 'simple-icons:woocommerce', description: 'Import sales from your WooCommerce store', connected: false },
  { id: 'square', name: 'Square', icon: 'simple-icons:square', description: 'Sync payment data from Square', connected: false },
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Mock listing data
const listingsData: Record<string, {
  id: string;
  title: string;
  type: string;
  status: string;
  askingPrice: number;
  revenue: number;
  profit: number;
  description: string;
  highlights: string[];
  employees: number;
  established: string;
  location: string;
  reason: string;
}> = {
  'BL-2847': {
    id: 'BL-2847',
    title: 'Marketing Automation SaaS Platform',
    type: 'saas',
    status: 'active',
    askingPrice: 2800000,
    revenue: 720000,
    profit: 360000,
    description: 'A profitable marketing automation platform with 2,500+ paying customers and strong MRR growth. The business has been operating for 5 years with a dedicated team of 8.',
    highlights: [
      '95% gross margins',
      '2,500+ active customers',
      '15% MoM growth',
      'Fully remote team of 8',
      'Strong brand recognition',
    ],
    employees: 8,
    established: '2019',
    location: 'United States',
    reason: 'Focusing on new ventures',
  },
  'BL-2103': {
    id: 'BL-2103',
    title: 'E-Commerce Fashion Brand',
    type: 'ecommerce',
    status: 'active',
    askingPrice: 1500000,
    revenue: 850000,
    profit: 280000,
    description: 'Established fashion e-commerce brand with a loyal customer base and strong social media presence. Operates primarily through Shopify with wholesale partnerships.',
    highlights: [
      '35% profit margins',
      '150K+ email subscribers',
      'Strong Instagram presence (200K followers)',
      'Wholesale partnerships',
      'Repeat customer rate of 40%',
    ],
    employees: 5,
    established: '2018',
    location: 'United States',
    reason: 'Retirement',
  },
  'BL-1892': {
    id: 'BL-1892',
    title: 'Content Website Portfolio',
    type: 'content',
    status: 'pending',
    askingPrice: 450000,
    revenue: 180000,
    profit: 120000,
    description: 'Portfolio of 5 content websites in the finance and technology niches. All sites are monetized through display advertising and affiliate marketing.',
    highlights: [
      '66% profit margins',
      '500K monthly pageviews',
      'Diversified traffic sources',
      'Passive income model',
      'Established backlink profiles',
    ],
    employees: 2,
    established: '2020',
    location: 'Remote',
    reason: 'Consolidating portfolio',
  },
  'BL-1654': {
    id: 'BL-1654',
    title: 'Mobile App - Fitness Tracking',
    type: 'mobile-app',
    status: 'draft',
    askingPrice: 750000,
    revenue: 320000,
    profit: 180000,
    description: 'iOS and Android fitness tracking app with 50,000+ active users. Features workout tracking, nutrition logging, and social features.',
    highlights: [
      '56% profit margins',
      '50K+ active users',
      '4.7 star rating',
      'Cross-platform (iOS/Android)',
      'Strong user retention',
    ],
    employees: 3,
    established: '2021',
    location: 'Canada',
    reason: 'New opportunity',
  },
};

const businessTypeOptions = [
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'content', label: 'Content/Media' },
  { value: 'agency', label: 'Agency' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'other', label: 'Other' },
];

const tabs = [
  { id: 'basics', label: 'Basic Info', icon: 'solar:document-text-linear' },
  { id: 'financials', label: 'Financials', icon: 'solar:chart-linear' },
  { id: 'details', label: 'Details', icon: 'solar:info-circle-linear' },
  { id: 'media', label: 'Media', icon: 'solar:gallery-linear' },
];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const listing = listingsData[listingId] || listingsData['BL-2847'];

  const [activeTab, setActiveTab] = useState('basics');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: listing.title,
    type: listing.type,
    askingPrice: listing.askingPrice.toString(),
    revenue: listing.revenue.toString(),
    profit: listing.profit.toString(),
    description: listing.description,
    highlights: listing.highlights.join('\n'),
    employees: listing.employees.toString(),
    established: listing.established,
    location: listing.location,
    reason: listing.reason,
  });

  // P&L Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showImportedDataModal, setShowImportedDataModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: '',
    revenue: '',
    cogs: '',
    grossProfit: '',
    marketing: '',
    operatingExpenses: '',
    netProfit: '',
  });
  const [pnlData, setPnlData] = useState<PnLRow[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [manualYear, setManualYear] = useState<string>('');
  const [showYearInput, setShowYearInput] = useState(false);

  // Integration state
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Parse CSV content
  const parseCSV = (content: string): { headers: string[], data: string[][] } => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(line => {
      const matches = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      return matches.map(cell => cell.trim().replace(/^"|"$/g, ''));
    });
    return { headers, data };
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      if (file.name.endsWith('.csv')) {
        const { headers, data } = parseCSV(content);
        setParsedHeaders(headers);
        setParsedData(data);

        // Auto-detect column mappings
        const autoMapping: ColumnMapping = {
          date: '',
          revenue: '',
          cogs: '',
          grossProfit: '',
          marketing: '',
          operatingExpenses: '',
          netProfit: '',
        };

        headers.forEach(header => {
          const h = header.toLowerCase();
          if (h.includes('date') || h.includes('month') || h.includes('period')) autoMapping.date = header;
          else if (h.includes('revenue') || h.includes('sales') || (h.includes('income') && !h.includes('net'))) autoMapping.revenue = header;
          else if (h.includes('cogs') || h.includes('cost of goods')) autoMapping.cogs = header;
          else if (h.includes('gross profit') || h.includes('gross margin')) autoMapping.grossProfit = header;
          else if (h.includes('marketing') || h.includes('advertising') || h.includes('ads') || h.includes('ad spend')) autoMapping.marketing = header;
          else if (h.includes('operating') || h.includes('opex') || (h.includes('expenses') && !h.includes('marketing'))) autoMapping.operatingExpenses = header;
          else if (h.includes('net profit') || h.includes('net income') || h.includes('bottom line')) autoMapping.netProfit = header;
        });

        setColumnMapping(autoMapping);
        setManualYear('');
        setShowYearInput(false);
        setShowMappingModal(true);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For XLSX files, we'll show a message to use CSV for now
        // In a real app, you'd use a library like xlsx
        setImportError('For best results, please save your Excel file as CSV and upload again.');
      }
    };

    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file);
    } else {
      setImportError('Please upload a CSV or Excel file');
    }
  };

  // Handle column mapping change
  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: value }));
  };

  // Parse date string to extract month and year
  const parseDateString = (dateStr: string): { month: string; year: number | null } => {
    if (!dateStr) return { month: '', year: null };

    // Try common date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, Month YYYY, etc.
    const dateFormats = [
      // Full dates: 2/10/2025, 02/10/2025, 2-10-2025
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // ISO format: 2025-02-10
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
      // Month Year: February 2025, Feb 2025
      /^([A-Za-z]+)\s*(\d{4})$/,
      // Year-Month: 2025-02, 2025/02
      /^(\d{4})[\/\-](\d{1,2})$/,
      // Month/Year: 02/2025, 2/2025
      /^(\d{1,2})[\/\-](\d{4})$/,
    ];

    // Try MM/DD/YYYY or DD/MM/YYYY format
    let match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const monthNum = parseInt(match[1]);
      return { month: monthNames[monthNum - 1] || '', year: parseInt(match[3]) };
    }

    // Try ISO format YYYY-MM-DD
    match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      const monthNum = parseInt(match[2]);
      return { month: monthNames[monthNum - 1] || '', year: parseInt(match[1]) };
    }

    // Try Month Year format (February 2025, Feb 2025)
    match = dateStr.match(/^([A-Za-z]+)\s*(\d{4})$/);
    if (match) {
      return { month: match[1], year: parseInt(match[2]) };
    }

    // Try YYYY-MM format
    match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})$/);
    if (match) {
      const monthNum = parseInt(match[2]);
      return { month: monthNames[monthNum - 1] || '', year: parseInt(match[1]) };
    }

    // Try MM/YYYY format
    match = dateStr.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const monthNum = parseInt(match[1]);
      return { month: monthNames[monthNum - 1] || '', year: parseInt(match[2]) };
    }

    // Just month name without year
    const monthMatch = dateStr.match(/^([A-Za-z]+)$/);
    if (monthMatch) {
      return { month: monthMatch[1], year: null };
    }

    return { month: dateStr, year: null };
  };

  // Check if year can be extracted from date column
  const checkYearInData = (): boolean => {
    if (!columnMapping.date || parsedData.length === 0) return false;

    const dateIdx = parsedHeaders.indexOf(columnMapping.date);
    if (dateIdx === -1) return false;

    // Check first few rows for year
    for (let i = 0; i < Math.min(3, parsedData.length); i++) {
      const dateVal = parsedData[i][dateIdx];
      const { year } = parseDateString(dateVal);
      if (year && year > 1900 && year < 2100) {
        return true;
      }
    }
    return false;
  };

  // Import the mapped data
  const handleImportData = async () => {
    setIsImporting(true);
    setImportError('');

    // Validate required mappings - at least date and one data field
    const hasDataField = columnMapping.revenue || columnMapping.marketing || columnMapping.netProfit || columnMapping.cogs || columnMapping.operatingExpenses;
    if (!columnMapping.date || !hasDataField) {
      setImportError('Please map the Date field and at least one data field (Revenue, Marketing, etc.)');
      setIsImporting(false);
      return;
    }

    // Check if we need year input
    const hasYearInData = checkYearInData();
    if (!hasYearInData && !manualYear) {
      setShowYearInput(true);
      setImportError('Year not found in date column. Please enter the year for this data.');
      setIsImporting(false);
      return;
    }

    try {
      // Process the data
      const newData: PnLRow[] = parsedData.map(row => {
        const getIndex = (field: string) => parsedHeaders.indexOf(field);
        const getValue = (field: string) => {
          const idx = getIndex(field);
          if (idx === -1) return 0;
          const val = row[idx]?.replace(/[$,]/g, '') || '0';
          return parseFloat(val) || 0;
        };
        const getStringValue = (field: string) => {
          const idx = getIndex(field);
          return idx !== -1 ? row[idx] || '' : '';
        };

        // Parse date to get month and year
        const dateValue = getStringValue(columnMapping.date);
        const { month, year: parsedYear } = parseDateString(dateValue);
        const year = parsedYear || parseInt(manualYear) || new Date().getFullYear();
        const dateKey = `${month}-${year}`;

        return {
          month,
          year,
          dateKey,
          revenue: columnMapping.revenue ? getValue(columnMapping.revenue) : 0,
          cogs: columnMapping.cogs ? getValue(columnMapping.cogs) : 0,
          grossProfit: columnMapping.grossProfit ? getValue(columnMapping.grossProfit) : 0,
          marketing: columnMapping.marketing ? getValue(columnMapping.marketing) : 0,
          operatingExpenses: columnMapping.operatingExpenses ? getValue(columnMapping.operatingExpenses) : 0,
          netProfit: columnMapping.netProfit ? getValue(columnMapping.netProfit) : 0,
        };
      }).filter(row => row.month);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Merge with existing data (if multiple files uploaded)
      const mergedData = mergeFinancialData(pnlData, newData);
      setPnlData(mergedData);

      // Track uploaded file
      const fileType = determineFileType(columnMapping);
      setUploadedFiles(prev => [...prev, {
        id: Date.now().toString(),
        name: uploadedFile?.name || 'Unknown',
        type: fileType,
        rowCount: newData.length,
      }]);

      // Calculate totals and update form data
      const totalRevenue = mergedData.reduce((sum, row) => sum + row.revenue, 0);
      const totalProfit = mergedData.reduce((sum, row) => sum + row.netProfit, 0);

      setFormData(prev => ({
        ...prev,
        revenue: Math.round(totalRevenue).toString(),
        profit: Math.round(totalProfit).toString(),
      }));

      setShowMappingModal(false);
      setShowImportedDataModal(true);
    } catch (error) {
      setImportError('Error processing file. Please check the format and try again.');
    }

    setIsImporting(false);
  };

  // Merge financial data from multiple files by date
  const mergeFinancialData = (existing: PnLRow[], newData: PnLRow[]): PnLRow[] => {
    const dataMap = new Map<string, PnLRow>();

    // Add existing data
    existing.forEach(row => {
      dataMap.set(row.dateKey, { ...row });
    });

    // Merge new data
    newData.forEach(row => {
      const existing = dataMap.get(row.dateKey);
      if (existing) {
        // Merge - add non-zero values
        dataMap.set(row.dateKey, {
          ...existing,
          revenue: existing.revenue || row.revenue,
          cogs: existing.cogs || row.cogs,
          grossProfit: existing.grossProfit || row.grossProfit,
          marketing: existing.marketing || row.marketing,
          operatingExpenses: existing.operatingExpenses || row.operatingExpenses,
          netProfit: existing.netProfit || row.netProfit,
        });
      } else {
        dataMap.set(row.dateKey, row);
      }
    });

    // Sort by date (year, then month)
    return Array.from(dataMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });
  };

  // Determine file type based on mapped columns
  const determineFileType = (mapping: ColumnMapping): 'sales' | 'marketing' | 'expenses' | 'complete' => {
    const hasRevenue = !!mapping.revenue;
    const hasMarketing = !!mapping.marketing;
    const hasExpenses = !!mapping.operatingExpenses || !!mapping.cogs;
    const hasProfit = !!mapping.netProfit;

    if (hasRevenue && hasMarketing && hasProfit) return 'complete';
    if (hasMarketing && !hasRevenue) return 'marketing';
    if (hasExpenses && !hasRevenue) return 'expenses';
    return 'sales';
  };

  // Handle integration connection
  const handleConnectIntegration = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConnecting(true);

    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIntegrations(prev => prev.map(i =>
      i.id === integration.id
        ? { ...i, connected: true, lastSync: new Date().toLocaleDateString() }
        : i
    ));

    // Set verification status to pending when integration is connected
    setVerificationStatus('pending');
    setIsConnecting(false);
    setShowIntegrationModal(false);
  };

  // Disconnect integration
  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === integrationId
        ? { ...i, connected: false, lastSync: undefined }
        : i
    ));

    // Check if any integrations are still connected
    const stillConnected = integrations.filter(i => i.id !== integrationId && i.connected);
    if (stillConnected.length === 0) {
      setVerificationStatus('none');
    }
  };

  // Group P&L data by year for display
  const getYearlySummary = () => {
    const summary: Record<number, { revenue: number; profit: number; months: number }> = {};
    pnlData.forEach(row => {
      if (!summary[row.year]) {
        summary[row.year] = { revenue: 0, profit: 0, months: 0 };
      }
      summary[row.year].revenue += row.revenue;
      summary[row.year].profit += row.netProfit;
      summary[row.year].months += 1;
    });
    return Object.entries(summary).sort(([a], [b]) => parseInt(b) - parseInt(a));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    router.push(`/dashboard/listings/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar />

      <div className="lg:ml-72">
        {/* Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/listings/${listingId}`} className="text-dark-500 hover:text-dark-700">
              <Icon icon="solar:arrow-left-linear" width={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-dark-900 tracking-tight">Edit Listing</h1>
              <p className="text-sm text-dark-500">#{listing.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                <Icon icon="solar:check-circle-bold" width={18} />
                <span className="text-sm font-medium">Changes saved!</span>
              </div>
            )}
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" width={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-linear" width={18} />
                  Save Draft
                </>
              )}
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={isSaving}>
              <Icon icon="solar:upload-linear" width={18} />
              Publish Changes
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1200px] mx-auto">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-dark-100 rounded-xl mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-white text-dark-900 shadow-sm'
                    : 'text-dark-600 hover:text-dark-900'
                )}
              >
                <Icon icon={tab.icon} width={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Basic Information</h3>
                <div className="space-y-6">
                  <Input
                    label="Business Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a descriptive title for your business"
                    hint="This is the first thing buyers will see. Make it descriptive and compelling."
                  />
                  <Select
                    label="Business Type"
                    options={businessTypeOptions}
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  />
                  <Textarea
                    label="Business Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    placeholder="Describe your business, its history, operations, and what makes it unique..."
                    hint="Be detailed but concise. Highlight what makes your business valuable."
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Key Highlights</h3>
                <Textarea
                  label="Business Highlights"
                  value={formData.highlights}
                  onChange={(e) => handleChange('highlights', e.target.value)}
                  rows={5}
                  placeholder="Enter each highlight on a new line..."
                  hint="List the key selling points of your business (one per line)"
                />
              </Card>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              {verificationStatus !== 'none' && (
                <div className={cn(
                  "rounded-xl p-4 flex items-center justify-between",
                  verificationStatus === 'verified' ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      verificationStatus === 'verified' ? "bg-emerald-100" : "bg-blue-100"
                    )}>
                      <Icon
                        icon={verificationStatus === 'verified' ? "solar:verified-check-bold" : "solar:clock-circle-bold"}
                        className={verificationStatus === 'verified' ? "text-emerald-600" : "text-blue-600"}
                        width={24}
                      />
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        verificationStatus === 'verified' ? "text-emerald-800" : "text-blue-800"
                      )}>
                        {verificationStatus === 'verified' ? 'Verified Financials' : 'Verification Pending'}
                      </p>
                      <p className={cn(
                        "text-sm",
                        verificationStatus === 'verified' ? "text-emerald-600" : "text-blue-600"
                      )}>
                        {verificationStatus === 'verified'
                          ? 'Your financial data has been verified by our team'
                          : 'Your data is connected and pending team review'
                        }
                      </p>
                    </div>
                  </div>
                  {verificationStatus === 'verified' && (
                    <Badge variant="success" className="text-sm">
                      <Icon icon="solar:shield-check-bold" width={16} className="mr-1" />
                      Verified P&L
                    </Badge>
                  )}
                </div>
              )}

              {/* Connect Data Sources */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-dark-900">Connect Data Sources</h3>
                    <p className="text-sm text-dark-500 mt-1">Connect your accounts for automatic data import and verification</p>
                  </div>
                  {integrations.some(i => i.connected) && (
                    <Badge variant="default" className="bg-blue-100 text-blue-700">
                      <Icon icon="solar:link-bold" width={14} className="mr-1" />
                      {integrations.filter(i => i.connected).length} Connected
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {integrations.slice(0, 6).map(integration => (
                    <div
                      key={integration.id}
                      className={cn(
                        "border rounded-xl p-4 transition-all",
                        integration.connected
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-dark-200 hover:border-primary/50 cursor-pointer"
                      )}
                      onClick={() => !integration.connected && setShowIntegrationModal(true) && setSelectedIntegration(integration)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            integration.connected ? "bg-emerald-100" : "bg-dark-100"
                          )}>
                            <Icon
                              icon={integration.icon}
                              width={24}
                              className={integration.connected ? "text-emerald-600" : "text-dark-600"}
                            />
                          </div>
                          <span className="font-medium text-dark-900">{integration.name}</span>
                        </div>
                        {integration.connected && (
                          <Icon icon="solar:check-circle-bold" className="text-emerald-500" width={20} />
                        )}
                      </div>
                      {integration.connected ? (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-emerald-600">Last synced: {integration.lastSync}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDisconnectIntegration(integration.id); }}
                            className="text-xs text-dark-500 hover:text-red-600"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-dark-500">{integration.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-dark-400 mt-4 flex items-center gap-1">
                  <Icon icon="solar:shield-check-linear" width={14} />
                  Connected accounts enable &quot;Verified P&L&quot; badge after team review
                </p>
              </Card>

              {/* P&L Upload Section */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-dark-900">Import Financial Documents</h3>
                    <p className="text-sm text-dark-500 mt-1">Upload multiple files (sales, marketing, expenses) - we&apos;ll merge by date</p>
                  </div>
                  {pnlData.length > 0 && (
                    <Badge variant="success">
                      <Icon icon="solar:check-circle-bold" width={14} className="mr-1" />
                      {pnlData.length} months imported
                    </Badge>
                  )}
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:file-text-bold" className="text-primary" width={20} />
                          <div>
                            <p className="text-sm font-medium text-dark-900">{file.name}</p>
                            <p className="text-xs text-dark-500">{file.rowCount} rows • {file.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                          className="text-dark-400 hover:text-red-500"
                        >
                          <Icon icon="solar:trash-bin-minimalistic-linear" width={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                    pnlData.length > 0 ? "border-emerald-300 bg-emerald-50/50" : "border-dark-200 hover:border-primary/50"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />

                  {pnlData.length > 0 ? (
                    <>
                      <Icon icon="solar:add-circle-bold" className="text-emerald-500 mx-auto mb-4" width={48} />
                      <p className="text-emerald-700 font-medium mb-2">Add Another File</p>
                      <p className="text-sm text-emerald-600 mb-4">
                        Upload additional data (marketing, expenses, etc.) to merge with existing data
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setShowImportedDataModal(true); }}>
                          <Icon icon="solar:eye-linear" width={16} />
                          View All Data
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Icon icon="solar:upload-linear" width={16} />
                          Add File
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:upload-minimalistic-linear" className="text-dark-300 mx-auto mb-4" width={48} />
                      <p className="text-dark-600 font-medium mb-2">
                        Drop your financial files here or click to upload
                      </p>
                      <p className="text-sm text-dark-400 mb-4">CSV or Excel files • Upload multiple files to merge data by date</p>
                      <Button variant="secondary">
                        <Icon icon="solar:upload-linear" width={18} />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>

                {importError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <Icon icon="solar:danger-circle-bold" width={18} />
                    {importError}
                  </div>
                )}

                <div className="mt-4 text-sm text-dark-500">
                  <p className="font-medium mb-2">Supported columns (upload separate files if needed):</p>
                  <div className="flex flex-wrap gap-2">
                    {expectedFields.map(field => (
                      <span key={field.key} className={cn(
                        "px-2 py-1 rounded text-xs",
                        field.required ? "bg-primary/10 text-primary" : "bg-dark-100 text-dark-600"
                      )}>
                        {field.label} {field.required && '*'}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Yearly Summary (if P&L imported) */}
              {pnlData.length > 0 && (
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Yearly Financial Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">Year</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Revenue</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Marketing</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Net Profit</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Margin</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Months</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getYearlySummary().map(([year, data]) => {
                          const yearData = pnlData.filter(r => r.year === parseInt(year));
                          const totalMarketing = yearData.reduce((sum, row) => sum + row.marketing, 0);
                          return (
                            <tr key={year} className="border-b border-dark-100 hover:bg-dark-50">
                              <td className="py-3 px-4 font-medium text-dark-900">{year}</td>
                              <td className="py-3 px-4 text-right text-dark-900">{formatCurrency(data.revenue)}</td>
                              <td className="py-3 px-4 text-right text-orange-600">{totalMarketing > 0 ? formatCurrency(totalMarketing) : '-'}</td>
                              <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatCurrency(data.profit)}</td>
                              <td className="py-3 px-4 text-right text-dark-600">
                                {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
                              </td>
                              <td className="py-3 px-4 text-right text-dark-500">{data.months}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Manual Entry */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Financial Information</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input
                    label="Asking Price"
                    type="text"
                    value={formData.askingPrice}
                    onChange={(e) => handleChange('askingPrice', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    icon={<span className="text-dark-400">$</span>}
                  />
                  <Input
                    label="Annual Revenue"
                    type="text"
                    value={formData.revenue}
                    onChange={(e) => handleChange('revenue', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    icon={<span className="text-dark-400">$</span>}
                    hint={pnlData.length > 0 ? "Auto-calculated from P&L" : undefined}
                  />
                  <Input
                    label="Annual Profit"
                    type="text"
                    value={formData.profit}
                    onChange={(e) => handleChange('profit', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    icon={<span className="text-dark-400">$</span>}
                    hint={pnlData.length > 0 ? "Auto-calculated from P&L" : undefined}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Financial Summary</h3>
                <div className="bg-dark-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Asking Price</p>
                      <p className="text-xl font-bold text-dark-900">
                        {formatCurrency(parseInt(formData.askingPrice) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Annual Revenue</p>
                      <p className="text-xl font-bold text-dark-900">
                        {formatCurrency(parseInt(formData.revenue) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Annual Profit</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(parseInt(formData.profit) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Multiple</p>
                      <p className="text-xl font-bold text-primary">
                        {parseInt(formData.profit) > 0
                          ? (parseInt(formData.askingPrice) / parseInt(formData.profit)).toFixed(1)
                          : '0'}x
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Icon icon="solar:info-circle-bold" className="text-amber-600 shrink-0 mt-0.5" width={20} />
                <div>
                  <p className="text-sm font-medium text-amber-800">Get Verified Status</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Connect your Shopify, Stripe, or accounting software to get a &quot;Verified P&L&quot; badge. This increases buyer trust and can lead to faster sales.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Business Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Number of Employees"
                    type="number"
                    value={formData.employees}
                    onChange={(e) => handleChange('employees', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Year Established"
                    type="text"
                    value={formData.established}
                    onChange={(e) => handleChange('established', e.target.value)}
                    placeholder="YYYY"
                  />
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., United States"
                  />
                  <Input
                    label="Reason for Selling"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    placeholder="e.g., Focusing on new ventures"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Images & Screenshots</h3>
                <div className="border-2 border-dashed border-dark-200 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Icon icon="solar:cloud-upload-linear" className="text-dark-300 mx-auto mb-4" width={48} />
                  <p className="text-dark-600 font-medium mb-2">Drop images here or click to upload</p>
                  <p className="text-sm text-dark-400">PNG, JPG up to 10MB each</p>
                  <Button variant="secondary" className="mt-4">
                    <Icon icon="solar:upload-linear" width={18} />
                    Choose Files
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Documents</h3>
                <div className="border-2 border-dashed border-dark-200 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Icon icon="solar:document-add-linear" className="text-dark-300 mx-auto mb-4" width={48} />
                  <p className="text-dark-600 font-medium mb-2">Upload supporting documents</p>
                  <p className="text-sm text-dark-400">PDF, DOC, XLS up to 25MB each</p>
                  <Button variant="secondary" className="mt-4">
                    <Icon icon="solar:upload-linear" width={18} />
                    Choose Files
                  </Button>
                </div>
                <p className="text-sm text-dark-500 mt-4">
                  <Icon icon="solar:lock-linear" className="inline-block mr-1" width={14} />
                  Documents will only be shared with verified buyers who sign an NDA.
                </p>
              </Card>
            </div>
          )}

          {/* Mobile Save Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark-200 p-4 flex gap-3">
            <Button variant="secondary" onClick={handleSave} disabled={isSaving} className="flex-1">
              Save Draft
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={isSaving} className="flex-1">
              Publish
            </Button>
          </div>
        </main>
      </div>

      {/* Column Mapping Modal */}
      <Modal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title="Map Your P&L Columns"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Icon icon="solar:file-text-bold" width={20} />
              <span className="font-medium">{uploadedFile?.name}</span>
            </div>
            <p className="text-sm text-dark-600">
              We found {parsedHeaders.length} columns and {parsedData.length} rows of data.
              Please match your columns to our expected fields.
            </p>
          </div>

          {/* Preview of first few rows */}
          {parsedData.length > 0 && (
            <div className="overflow-x-auto max-h-32 border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-dark-50 sticky top-0">
                  <tr>
                    {parsedHeaders.map((header, idx) => (
                      <th key={idx} className="px-3 py-2 text-left font-medium text-dark-600 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 3).map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-t border-dark-100">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-dark-700 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Column Mappings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-dark-900">Match Columns</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {expectedFields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    value={columnMapping[field.key as keyof ColumnMapping]}
                    onChange={(e) => handleMappingChange(field.key as keyof ColumnMapping, e.target.value)}
                  >
                    <option value="">-- Select column --</option>
                    {parsedHeaders.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Year Input (shown when year not found in data) */}
          {showYearInput && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon icon="solar:calendar-bold" className="text-amber-600 mt-0.5" width={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Year not found in your date column
                  </p>
                  <p className="text-sm text-amber-700 mb-3">
                    Please enter the year this financial data is from:
                  </p>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    className="max-w-[150px]"
                  />
                </div>
              </div>
            </div>
          )}

          {importError && !showYearInput && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <Icon icon="solar:danger-circle-bold" width={18} />
              {importError}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="secondary" className="flex-1" onClick={() => setShowMappingModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleImportData}
              disabled={isImporting || !columnMapping.date || !columnMapping.revenue || !columnMapping.netProfit || (showYearInput && !manualYear)}
            >
              {isImporting ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" width={18} />
                  Importing...
                </>
              ) : (
                <>
                  <Icon icon="solar:import-linear" width={18} />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Imported Data Modal */}
      <Modal
        isOpen={showImportedDataModal}
        onClose={() => setShowImportedDataModal(false)}
        title="Imported P&L Data"
        size="full"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={24} />
              </div>
              <div>
                <p className="font-semibold text-dark-900">{pnlData.length} Months Imported</p>
                <p className="text-sm text-dark-500">
                  From {pnlData[0]?.month} {pnlData[0]?.year} to {pnlData[pnlData.length - 1]?.month} {pnlData[pnlData.length - 1]?.year}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-500">Total Revenue</p>
              <p className="text-xl font-bold text-dark-900">
                {formatCurrency(pnlData.reduce((sum, row) => sum + row.revenue, 0))}
              </p>
            </div>
          </div>

          {/* Monthly Data Table */}
          <div className="overflow-x-auto max-h-[400px] border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark-600">Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-600">Year</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">COGS</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Gross Profit</th>
                  <th className="px-4 py-3 text-right font-semibold text-orange-600">Marketing</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Op. Expenses</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Net Profit</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Margin</th>
                </tr>
              </thead>
              <tbody>
                {pnlData.map((row, idx) => (
                  <tr key={idx} className="border-t border-dark-100 hover:bg-dark-50">
                    <td className="px-4 py-3 font-medium text-dark-900">{row.month}</td>
                    <td className="px-4 py-3 text-dark-600">{row.year}</td>
                    <td className="px-4 py-3 text-right text-dark-900">{row.revenue > 0 ? formatCurrency(row.revenue) : '-'}</td>
                    <td className="px-4 py-3 text-right text-dark-600">{row.cogs > 0 ? formatCurrency(row.cogs) : '-'}</td>
                    <td className="px-4 py-3 text-right text-dark-600">{row.grossProfit > 0 ? formatCurrency(row.grossProfit) : '-'}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{row.marketing > 0 ? formatCurrency(row.marketing) : '-'}</td>
                    <td className="px-4 py-3 text-right text-dark-600">{row.operatingExpenses > 0 ? formatCurrency(row.operatingExpenses) : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{row.netProfit > 0 ? formatCurrency(row.netProfit) : '-'}</td>
                    <td className="px-4 py-3 text-right text-dark-500">
                      {row.revenue > 0 ? ((row.netProfit / row.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-dark-100 font-semibold">
                <tr>
                  <td className="px-4 py-3 text-dark-900" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right text-dark-900">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.revenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-600">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.cogs, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-600">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.grossProfit, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.marketing, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-600">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.operatingExpenses, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600">
                    {formatCurrency(pnlData.reduce((sum, row) => sum + row.netProfit, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-500">
                    {pnlData.reduce((sum, row) => sum + row.revenue, 0) > 0
                      ? ((pnlData.reduce((sum, row) => sum + row.netProfit, 0) / pnlData.reduce((sum, row) => sum + row.revenue, 0)) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => { setPnlData([]); setUploadedFiles([]); setShowImportedDataModal(false); fileInputRef.current?.click(); }}>
              <Icon icon="solar:refresh-linear" width={18} />
              Start Over
            </Button>
            <Button variant="secondary" onClick={() => { setShowImportedDataModal(false); fileInputRef.current?.click(); }}>
              <Icon icon="solar:add-circle-linear" width={18} />
              Add More Data
            </Button>
            <Button variant="primary" className="ml-auto" onClick={() => setShowImportedDataModal(false)}>
              <Icon icon="solar:check-circle-bold" width={18} />
              Confirm & Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Integration Connection Modal */}
      <Modal
        isOpen={showIntegrationModal}
        onClose={() => { setShowIntegrationModal(false); setSelectedIntegration(null); }}
        title="Connect Integration"
        size="md"
      >
        <div className="space-y-6">
          {selectedIntegration && (
            <>
              <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Icon icon={selectedIntegration.icon} width={40} className="text-dark-700" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900 text-lg">{selectedIntegration.name}</h3>
                  <p className="text-sm text-dark-500">{selectedIntegration.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-dark-900">What you&apos;ll get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" className="text-emerald-500" width={18} />
                    Automatic revenue and sales data import
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" className="text-emerald-500" width={18} />
                    Real-time data synchronization
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" className="text-emerald-500" width={18} />
                    &quot;Verified P&L&quot; badge eligibility
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" className="text-emerald-500" width={18} />
                    Increased buyer trust and faster sales
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Icon icon="solar:shield-check-bold" className="inline-block mr-1" width={16} />
                  Your data is encrypted and secure. We only access read-only financial data.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="secondary" className="flex-1" onClick={() => setShowIntegrationModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => selectedIntegration && handleConnectIntegration(selectedIntegration)}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Icon icon="mdi:loading" className="animate-spin" width={18} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:link-bold" width={18} />
                      Connect {selectedIntegration.name}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {!selectedIntegration && (
            <div className="space-y-4">
              <p className="text-dark-600">Select an integration to connect:</p>
              <div className="grid gap-3">
                {integrations.filter(i => !i.connected).map(integration => (
                  <button
                    key={integration.id}
                    onClick={() => setSelectedIntegration(integration)}
                    className="flex items-center gap-4 p-4 border border-dark-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-dark-100 rounded-lg flex items-center justify-center">
                      <Icon icon={integration.icon} width={28} className="text-dark-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark-900">{integration.name}</p>
                      <p className="text-xs text-dark-500">{integration.description}</p>
                    </div>
                    <Icon icon="solar:arrow-right-linear" className="text-dark-400" width={20} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
