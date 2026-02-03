'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

// All business niches (matching onboarding)
const businessTypeOptions = [
  { value: '', label: 'Select a business type' },
  { value: 'saas', label: 'SaaS (Software as a Service)' },
  { value: 'ecommerce', label: 'E-commerce / D2C' },
  { value: 'content', label: 'Content / Media / Blog' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'agency', label: 'Agency / Service' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'newsletter', label: 'Newsletter / Community' },
  { value: 'affiliate', label: 'Affiliate Marketing' },
  { value: 'info-product', label: 'Info Products / Courses' },
  { value: 'other', label: 'Other' },
];

// P&L Data Types
interface PnLRow {
  month: string;
  year: number;
  dateKey: string;
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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const tabs = [
  { id: 'basics', label: 'Basic Info', icon: 'solar:document-text-linear' },
  { id: 'financials', label: 'Financials', icon: 'solar:chart-linear' },
  { id: 'details', label: 'Details', icon: 'solar:info-circle-linear' },
  { id: 'media', label: 'Media', icon: 'solar:gallery-linear' },
];

export default function NewListingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);

  // Form state - all blank
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    askingPrice: '',
    revenue: '',
    profit: '',
    description: '',
    highlights: '',
    employees: '',
    established: '',
    location: '',
    reason: '',
    website: '',
    // New fields
    customers: '',
    churnRate: '',
    annualGrowth: '',
    techStack: '',
    competitors: '',
    businessModel: '',
    askingPriceReasoning: '',
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

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        router.push('/auth/signin');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUserId(user.id);
    };

    checkAuth();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
          else if (h.includes('cogs') || h.includes('cost of goods') || h.includes('cost of sales')) autoMapping.cogs = header;
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

    const hasDataField = columnMapping.revenue || columnMapping.marketing || columnMapping.netProfit || columnMapping.cogs || columnMapping.operatingExpenses;
    if (!columnMapping.date || !hasDataField) {
      setImportError('Please map the Date field and at least one data field (Revenue, Marketing, COGS, etc.)');
      setIsImporting(false);
      return;
    }

    const hasYearInData = checkYearInData();
    if (!hasYearInData && !manualYear) {
      setShowYearInput(true);
      setImportError('Year not found in date column. Please enter the year for this data.');
      setIsImporting(false);
      return;
    }

    try {
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

      await new Promise(resolve => setTimeout(resolve, 500));

      const mergedData = mergeFinancialData(pnlData, newData);
      setPnlData(mergedData);

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

    existing.forEach(row => {
      dataMap.set(row.dateKey, { ...row });
    });

    newData.forEach(row => {
      const existing = dataMap.get(row.dateKey);
      if (existing) {
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

  // Group P&L data by year for display
  const getYearlySummary = () => {
    const summary: Record<number, { revenue: number; profit: number; marketing: number; cogs: number; months: number }> = {};
    pnlData.forEach(row => {
      if (!summary[row.year]) {
        summary[row.year] = { revenue: 0, profit: 0, marketing: 0, cogs: 0, months: 0 };
      }
      summary[row.year].revenue += row.revenue;
      summary[row.year].profit += row.netProfit;
      summary[row.year].marketing += row.marketing;
      summary[row.year].cogs += row.cogs;
      summary[row.year].months += 1;
    });
    return Object.entries(summary).sort(([a], [b]) => parseInt(b) - parseInt(a));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Business title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Business type is required';
    }
    if (!formData.askingPrice || parseInt(formData.askingPrice) <= 0) {
      newErrors.askingPrice = 'Asking price is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Business description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!userId) return;

    setIsSaving(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsSaving(false);
      return;
    }

    try {
      const listingData = {
        seller_id: userId,
        title: formData.title || 'Untitled Listing',
        business_type: formData.type || null,
        asking_price: parseInt(formData.askingPrice) || 0,
        annual_revenue: parseInt(formData.revenue) || 0,
        annual_profit: parseInt(formData.profit) || 0,
        description: formData.description || null,
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        employee_count: parseInt(formData.employees) || 0,
        year_established: formData.established || null,
        location: formData.location || null,
        reason_for_selling: formData.reason || null,
        website_url: formData.website || null,
        // New fields
        customers: formData.customers || null,
        churn_rate: formData.churnRate || null,
        annual_growth: formData.annualGrowth || null,
        tech_stack: formData.techStack || null,
        competitors: formData.competitors || null,
        business_model: formData.businessModel || null,
        asking_price_reasoning: formData.askingPriceReasoning || null,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (draftId) {
        // Update existing draft
        const { error } = await (supabase.from('listings') as any)
          .update(listingData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await (supabase.from('listings') as any)
          .insert({
            ...listingData,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setDraftId(data.id);
        }
      }

      // Save P&L data if exists
      if (pnlData.length > 0 && (draftId || true)) {
        const listingId = draftId;
        if (listingId) {
          // Delete existing financials for this listing
          await (supabase.from('listing_financials') as any)
            .delete()
            .eq('listing_id', listingId);

          // Insert new financials
          const financialRecords = pnlData.map(row => ({
            listing_id: listingId,
            month: monthNames.indexOf(row.month) + 1,
            year: row.year,
            date_key: row.dateKey,
            revenue: row.revenue,
            cogs: row.cogs,
            gross_profit: row.grossProfit,
            marketing: row.marketing,
            operating_expenses: row.operatingExpenses,
            net_profit: row.netProfit,
            source: 'csv_upload',
            verified: false,
          }));

          await (supabase.from('listing_financials') as any)
            .insert(financialRecords);
        }
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }

    setIsSaving(false);
  };

  const handleSubmitForReview = async () => {
    if (!validateForm()) {
      if (errors.title || errors.type || errors.description) {
        setActiveTab('basics');
      } else if (errors.askingPrice) {
        setActiveTab('financials');
      }
      return;
    }

    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsSubmitting(false);
      return;
    }

    try {
      const listingData = {
        seller_id: userId,
        title: formData.title,
        business_type: formData.type,
        asking_price: parseInt(formData.askingPrice) || 0,
        annual_revenue: parseInt(formData.revenue) || 0,
        annual_profit: parseInt(formData.profit) || 0,
        description: formData.description,
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        employee_count: parseInt(formData.employees) || 0,
        year_established: formData.established || null,
        location: formData.location || null,
        reason_for_selling: formData.reason || null,
        website_url: formData.website || null,
        // New fields
        customers: formData.customers || null,
        churn_rate: formData.churnRate || null,
        annual_growth: formData.annualGrowth || null,
        tech_stack: formData.techStack || null,
        competitors: formData.competitors || null,
        business_model: formData.businessModel || null,
        asking_price_reasoning: formData.askingPriceReasoning || null,
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      };

      let listingId = draftId;

      if (draftId) {
        // Update existing draft to pending_review
        const { error } = await (supabase.from('listings') as any)
          .update(listingData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // Create new listing as pending_review
        const { data, error } = await (supabase.from('listings') as any)
          .insert({
            ...listingData,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        listingId = data?.id;
      }

      // Save P&L data
      if (pnlData.length > 0 && listingId) {
        await (supabase.from('listing_financials') as any)
          .delete()
          .eq('listing_id', listingId);

        const financialRecords = pnlData.map(row => ({
          listing_id: listingId,
          month: monthNames.indexOf(row.month) + 1,
          year: row.year,
          date_key: row.dateKey,
          revenue: row.revenue,
          cogs: row.cogs,
          gross_profit: row.grossProfit,
          marketing: row.marketing,
          operating_expenses: row.operatingExpenses,
          net_profit: row.netProfit,
          source: 'csv_upload',
          verified: false,
        }));

        await (supabase.from('listing_financials') as any)
          .insert(financialRecords);
      }

      setShowSubmitModal(false);
      router.push('/dashboard/listings?submitted=true');
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert('Failed to submit listing. Please try again.');
    }

    setIsSubmitting(false);
  };

  const isFormValid = formData.title && formData.type && formData.askingPrice && formData.description;

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar />

      <div className="lg:ml-72">
        {/* Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/listings" className="text-dark-500 hover:text-dark-700">
              <Icon icon="solar:arrow-left-linear" width={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-dark-900 tracking-tight">List Your Business</h1>
              <p className="text-sm text-dark-500">
                {draftId ? 'Editing draft' : 'Create a new listing'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                <Icon icon="solar:check-circle-bold" width={18} />
                <span className="text-sm font-medium">Draft saved!</span>
              </div>
            )}
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
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
            <Button
              variant="primary"
              onClick={handleSubmitForReview}
              disabled={isSaving || !isFormValid}
            >
              <Icon icon="solar:send-linear" width={18} />
              Submit for Review
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1200px] mx-auto">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Icon icon="solar:info-circle-bold" className="text-blue-600 shrink-0 mt-0.5" width={20} />
            <div>
              <p className="font-medium text-blue-800">How listing works</p>
              <p className="text-sm text-blue-700 mt-1">
                After you submit your listing, our team will review it within 24-48 hours.
                Once approved, your business will appear on our marketplace and buyers can start making inquiries.
                You can save as draft anytime and come back to continue editing.
              </p>
            </div>
          </div>

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
                  <div>
                    <Input
                      label="Business Title *"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g., Profitable SaaS Platform with 1000+ Customers"
                      hint="This is the first thing buyers will see. Make it descriptive and compelling."
                      error={errors.title}
                    />
                  </div>
                  <div>
                    <Select
                      label="Business Type *"
                      options={businessTypeOptions}
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      error={errors.type}
                    />
                  </div>
                  <div>
                    <Textarea
                      label="Business Description *"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={6}
                      placeholder="Describe your business, its history, operations, and what makes it unique..."
                      hint="Be detailed but concise. Highlight what makes your business valuable."
                      error={errors.description}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Key Highlights</h3>
                <Textarea
                  label="Business Highlights"
                  value={formData.highlights}
                  onChange={(e) => handleChange('highlights', e.target.value)}
                  rows={5}
                  placeholder="Enter each highlight on a new line, e.g.:
• 95% gross margins
• 2,500+ active customers
• Fully remote team
• Strong brand recognition"
                  hint="List the key selling points of your business (one per line)"
                />
              </Card>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* P&L Upload Section */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-dark-900">Import P&L Statement</h3>
                    <p className="text-sm text-dark-500 mt-1">Upload your financial data (CSV) - supports multiple years and files</p>
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
                        Upload additional data (different years, marketing costs, etc.) to merge with existing data
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
                        Drop your P&L files here or click to upload
                      </p>
                      <p className="text-sm text-dark-400 mb-4">CSV files • Upload multiple files to merge data across years</p>
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
                  <p className="font-medium mb-2">We&apos;ll extract these columns from your P&L:</p>
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
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">COGS</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Marketing</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Net Profit</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Margin</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-dark-600">Months</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getYearlySummary().map(([year, data]) => (
                          <tr key={year} className="border-b border-dark-100 hover:bg-dark-50">
                            <td className="py-3 px-4 font-medium text-dark-900">{year}</td>
                            <td className="py-3 px-4 text-right text-dark-900">{formatCurrency(data.revenue)}</td>
                            <td className="py-3 px-4 text-right text-red-600">{data.cogs > 0 ? formatCurrency(data.cogs) : '-'}</td>
                            <td className="py-3 px-4 text-right text-orange-600">{data.marketing > 0 ? formatCurrency(data.marketing) : '-'}</td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatCurrency(data.profit)}</td>
                            <td className="py-3 px-4 text-right text-dark-600">
                              {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
                            </td>
                            <td className="py-3 px-4 text-right text-dark-500">{data.months}</td>
                          </tr>
                        ))}
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
                    label="Asking Price *"
                    type="text"
                    value={formData.askingPrice}
                    onChange={(e) => handleChange('askingPrice', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    icon={<span className="text-dark-400">$</span>}
                    error={errors.askingPrice}
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
                <h3 className="font-bold text-dark-900 mb-4">Financial Preview</h3>
                <div className="bg-dark-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Asking Price</p>
                      <p className="text-xl font-bold text-dark-900">
                        {formData.askingPrice ? formatCurrency(parseInt(formData.askingPrice)) : '$0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Annual Revenue</p>
                      <p className="text-xl font-bold text-dark-900">
                        {formData.revenue ? formatCurrency(parseInt(formData.revenue)) : '$0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 mb-1">Annual Profit</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formData.profit ? formatCurrency(parseInt(formData.profit)) : '$0'}
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
                    placeholder="e.g., 2020"
                  />
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., United States"
                  />
                  <Input
                    label="Website URL"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    hint="Will be kept confidential until buyer signs NDA"
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Growth & Metrics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input
                    label="Customer Count"
                    value={formData.customers}
                    onChange={(e) => handleChange('customers', e.target.value)}
                    placeholder="e.g., 500+ or 100-500"
                    hint="Active customers or users"
                  />
                  <Input
                    label="Annual Growth Rate"
                    value={formData.annualGrowth}
                    onChange={(e) => handleChange('annualGrowth', e.target.value)}
                    placeholder="e.g., 25%"
                    hint="Year-over-year growth"
                  />
                  <Input
                    label="Churn Rate"
                    value={formData.churnRate}
                    onChange={(e) => handleChange('churnRate', e.target.value)}
                    placeholder="e.g., 3-5%"
                    hint="Monthly or annual churn"
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Business Model & Technology</h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Business Model"
                      value={formData.businessModel}
                      onChange={(e) => handleChange('businessModel', e.target.value)}
                      placeholder="e.g., B2B SaaS, D2C Subscription, Marketplace"
                      hint="How does the business make money?"
                    />
                    <Input
                      label="Tech Stack"
                      value={formData.techStack}
                      onChange={(e) => handleChange('techStack', e.target.value)}
                      placeholder="e.g., React, Node.js, PostgreSQL, AWS"
                      hint="Main technologies used (comma-separated)"
                    />
                  </div>
                  <Input
                    label="Competitors"
                    value={formData.competitors}
                    onChange={(e) => handleChange('competitors', e.target.value)}
                    placeholder="e.g., Company A, Company B, Company C"
                    hint="Main competitors in the market (comma-separated)"
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-dark-900 mb-6">Valuation & Selling</h3>
                <div className="space-y-6">
                  <Textarea
                    label="Asking Price Reasoning"
                    value={formData.askingPriceReasoning}
                    onChange={(e) => handleChange('askingPriceReasoning', e.target.value)}
                    rows={4}
                    placeholder="Explain why you're asking this price. Include factors like growth potential, recurring revenue, market position, competitive advantages..."
                    hint="Help buyers understand the value. Be specific about multiples, comparables, or unique factors."
                  />
                  <Textarea
                    label="Reason for Selling"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    rows={3}
                    placeholder="e.g., Focusing on new ventures, retirement, partnership opportunity..."
                    hint="Be honest about why you're selling. Buyers appreciate transparency."
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
                <p className="text-sm text-dark-500 mt-4">
                  Add screenshots of your dashboard, analytics, or product. This helps buyers understand your business better.
                </p>
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
            <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving} className="flex-1">
              Save Draft
            </Button>
            <Button variant="primary" onClick={handleSubmitForReview} disabled={isSaving || !isFormValid} className="flex-1">
              Submit
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
              disabled={isImporting || !columnMapping.date || (showYearInput && !manualYear)}
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
                  <th className="px-4 py-3 text-right font-semibold text-red-600">COGS</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Gross Profit</th>
                  <th className="px-4 py-3 text-right font-semibold text-orange-600">Marketing</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Op. Expenses</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-600">Net Profit</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-600">Margin</th>
                </tr>
              </thead>
              <tbody>
                {pnlData.map((row, idx) => (
                  <tr key={idx} className="border-t border-dark-100 hover:bg-dark-50">
                    <td className="px-4 py-3 font-medium text-dark-900">{row.month}</td>
                    <td className="px-4 py-3 text-dark-600">{row.year}</td>
                    <td className="px-4 py-3 text-right text-dark-900">{row.revenue > 0 ? formatCurrency(row.revenue) : '-'}</td>
                    <td className="px-4 py-3 text-right text-red-600">{row.cogs > 0 ? formatCurrency(row.cogs) : '-'}</td>
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
                  <td className="px-4 py-3 text-right text-red-600">
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

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Listing for Review"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon icon="solar:document-text-bold" className="text-primary" width={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-dark-900">{formData.title || 'Your Listing'}</h3>
              <p className="text-sm text-dark-500">{businessTypeOptions.find(o => o.value === formData.type)?.label}</p>
            </div>
            <p className="text-xl font-bold text-dark-900">
              {formData.askingPrice ? formatCurrency(parseInt(formData.askingPrice)) : '$0'}
            </p>
          </div>

          {pnlData.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={18} />
              <span className="text-sm text-emerald-700">
                {pnlData.length} months of P&L data attached
              </span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-dark-900">What happens next?</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-dark-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
                Our team reviews your listing within 24-48 hours
              </div>
              <div className="flex items-center gap-3 text-sm text-dark-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</div>
                You&apos;ll receive an email when your listing is approved
              </div>
              <div className="flex items-center gap-3 text-sm text-dark-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
                Your business goes live on our marketplace
              </div>
              <div className="flex items-center gap-3 text-sm text-dark-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">4</div>
                Buyers can view your listing and send inquiries
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <Icon icon="solar:info-circle-bold" className="inline-block mr-1" width={16} />
              You can still edit your listing after submission. Any changes will be reviewed before going live.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="secondary" className="flex-1" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={confirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" width={18} />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon icon="solar:send-bold" width={18} />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
