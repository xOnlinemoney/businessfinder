'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

// Types
interface Listing {
  id: string;
  title: string;
  seller_id: string;
  seller_name?: string;
  asking_price: number;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  requires_nda: boolean;
  views_count: number;
  created_at: string;
  business_type: string;
  category_id?: string;
  description?: string;
  revenue_monthly?: number;
  profit_monthly?: number;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  featured: number;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
];

const businessTypes = [
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'app', label: 'Mobile App' },
  { value: 'content', label: 'Content & Media' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
];

export function AdminListingsContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pending: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_type: 'saas',
    asking_price: '',
    revenue_monthly: '',
    profit_monthly: '',
    status: 'draft',
    is_featured: false,
    requires_nda: false,
    is_verified: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: 0 });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importComplete, setImportComplete] = useState(false);
  const importAbortRef = useRef(false);

  // Column mapping state
  const [showMappingStep, setShowMappingStep] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Expected fields for import
  const expectedFields = [
    { key: 'title', label: 'Title', required: true },
    { key: 'asking_price', label: 'Asking Price', required: true },
    { key: 'business_type', label: 'Business Type', required: false },
    { key: 'description', label: 'Description', required: false },
    { key: 'annual_revenue', label: 'Annual Revenue', required: false },
    { key: 'annual_profit', label: 'Annual Profit', required: false },
    { key: 'highlights', label: 'Highlights', required: false },
    { key: 'employee_count', label: 'Employee Count', required: false },
    { key: 'year_established', label: 'Year Established', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'reason_for_selling', label: 'Reason for Selling', required: false },
    { key: 'website_url', label: 'Website URL', required: false },
    { key: 'seller_email', label: 'Seller Email', required: false },
    { key: 'customers', label: 'Customers', required: false },
    { key: 'churn_rate', label: 'Churn Rate', required: false },
    { key: 'annual_growth', label: 'Annual Growth', required: false },
    { key: 'tech_stack', label: 'Tech Stack', required: false },
    { key: 'competitors', label: 'Competitors', required: false },
    { key: 'business_model', label: 'Business Model', required: false },
    { key: 'asking_price_reasoning', label: 'Asking Price Reasoning', required: false },
    { key: 'source_url', label: 'Source URL', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'is_featured', label: 'Is Featured', required: false },
    { key: 'requires_nda', label: 'Requires NDA', required: false },
    { key: 'is_verified', label: 'Is Verified', required: false },
  ];

  // Fetch listings from database
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Use mock data if Supabase not configured
      setListings([
        { id: 'Kj8mNp2xQr4vL1', title: 'Marketing Automation SaaS', seller_id: '1', seller_name: 'John Smith', asking_price: 2800000, status: 'active', is_verified: true, is_featured: true, requires_nda: true, views_count: 1247, created_at: '2024-01-01', business_type: 'saas' },
        { id: 'Ht5wYz9aKm3nB7', title: 'E-Commerce Fashion Brand', seller_id: '2', seller_name: 'Emily Davis', asking_price: 1500000, status: 'pending_review', is_verified: false, is_featured: false, requires_nda: false, views_count: 0, created_at: '2024-01-14', business_type: 'ecommerce' },
        { id: 'Pq6cDf8gRs2jX4', title: 'Content Website Portfolio', seller_id: '3', seller_name: 'Mike Wilson', asking_price: 450000, status: 'active', is_verified: true, is_featured: false, requires_nda: true, views_count: 856, created_at: '2023-12-15', business_type: 'content' },
      ]);
      setStats({ total: 3, active: 2, pending: 1, featured: 1 });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:seller_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedListings = (data || []).map((listing: any) => ({
        ...listing,
        seller_name: listing.profiles?.full_name || 'Unknown',
      }));

      setListings(formattedListings);

      // Calculate stats
      const total = formattedListings.length;
      const active = formattedListings.filter((l: Listing) => l.status === 'active').length;
      const pending = formattedListings.filter((l: Listing) => l.status === 'pending_review').length;
      const featured = formattedListings.filter((l: Listing) => l.is_featured).length;

      setStats({ total, active, pending, featured });
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <StatusBadge status="success">Active</StatusBadge>;
      case 'pending_review': return <StatusBadge status="warning">Pending</StatusBadge>;
      case 'draft': return <StatusBadge status="default">Draft</StatusBadge>;
      case 'rejected': return <StatusBadge status="danger">Rejected</StatusBadge>;
      case 'sold': return <StatusBadge status="info">Sold</StatusBadge>;
      default: return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  // Handle add listing
  const handleAddListing = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      alert('Database not connected');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await (supabase.from('listings') as any).insert({
        title: formData.title,
        description: formData.description,
        business_type: formData.business_type,
        asking_price: parseFloat(formData.asking_price) || 0,
        revenue_monthly: parseFloat(formData.revenue_monthly) || null,
        profit_monthly: parseFloat(formData.profit_monthly) || null,
        status: formData.status,
        is_featured: formData.is_featured,
        requires_nda: formData.requires_nda,
        is_verified: formData.is_verified,
        seller_id: userData.user?.id,
      });

      if (error) throw error;

      setShowAddModal(false);
      resetForm();
      fetchListings();
    } catch (error) {
      console.error('Error adding listing:', error);
      alert('Error adding listing');
    }
  };

  // Handle edit listing
  const handleEditListing = async () => {
    if (!selectedListing) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert('Database not connected');
      return;
    }

    try {
      const { error } = await (supabase.from('listings') as any)
        .update({
          title: formData.title,
          description: formData.description,
          business_type: formData.business_type,
          asking_price: parseFloat(formData.asking_price) || 0,
          revenue_monthly: parseFloat(formData.revenue_monthly) || null,
          profit_monthly: parseFloat(formData.profit_monthly) || null,
          status: formData.status,
          is_featured: formData.is_featured,
          requires_nda: formData.requires_nda,
          is_verified: formData.is_verified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedListing(null);
      resetForm();
      fetchListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing');
    }
  };

  // Parse entire CSV content handling multi-line quoted fields
  const parseCSV = (content: string): { headers: string[], rows: string[][] } => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote ("") - add single quote and skip next char
          currentField += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
        // End of row (not inside quotes)
        if (char === '\r') i++; // Skip \n in \r\n
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\r' && !inQuotes) {
        // Handle standalone \r as newline
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Don't forget the last field and row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow);
      }
    }

    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    return { headers, rows: dataRows };
  };

  // Parse CSV line (legacy - for simple single-line parsing)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Auto-detect column mappings based on header names
  const autoDetectMappings = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};

    headers.forEach(header => {
      const h = header.toLowerCase().trim();

      // Try exact matches first
      const exactMatch = expectedFields.find(f => f.key === h);
      if (exactMatch) {
        mapping[exactMatch.key] = header;
        return;
      }

      // Try fuzzy matching
      if (h.includes('title') || h.includes('name') || h.includes('business name')) mapping['title'] = header;
      else if (h.includes('asking') || h.includes('price') || h.includes('listing price')) mapping['asking_price'] = header;
      else if (h.includes('type') || h.includes('category') || h.includes('niche')) mapping['business_type'] = header;
      else if (h.includes('description') || h.includes('about') || h.includes('summary')) mapping['description'] = header;
      else if (h.includes('revenue') && !h.includes('profit')) mapping['annual_revenue'] = header;
      else if (h.includes('profit') || h.includes('earnings') || h.includes('income')) mapping['annual_profit'] = header;
      else if (h.includes('highlight') || h.includes('feature') || h.includes('selling point')) mapping['highlights'] = header;
      else if (h.includes('employee') || h.includes('team size') || h.includes('staff')) mapping['employee_count'] = header;
      else if (h.includes('established') || h.includes('founded') || h.includes('year')) mapping['year_established'] = header;
      else if (h.includes('location') || h.includes('country') || h.includes('region')) mapping['location'] = header;
      else if (h.includes('reason') || h.includes('selling')) mapping['reason_for_selling'] = header;
      else if (h.includes('website') || h.includes('url') || h.includes('domain')) mapping['website_url'] = header;
      else if (h.includes('seller') && h.includes('email')) mapping['seller_email'] = header;
      else if (h.includes('customer') || h.includes('user') || h.includes('client')) mapping['customers'] = header;
      else if (h.includes('churn')) mapping['churn_rate'] = header;
      else if (h.includes('growth')) mapping['annual_growth'] = header;
      else if (h.includes('tech') || h.includes('stack') || h.includes('technology')) mapping['tech_stack'] = header;
      else if (h.includes('competitor')) mapping['competitors'] = header;
      else if (h.includes('model') && !h.includes('business_model')) mapping['business_model'] = header;
      else if (h.includes('reasoning') || h.includes('valuation') || h.includes('justification')) mapping['asking_price_reasoning'] = header;
      else if (h.includes('source')) mapping['source_url'] = header;
      else if (h === 'status') mapping['status'] = header;
      else if (h.includes('featured')) mapping['is_featured'] = header;
      else if (h.includes('nda')) mapping['requires_nda'] = header;
      else if (h.includes('verified')) mapping['is_verified'] = header;
    });

    return mapping;
  };

  // Handle CSV file selection - show mapping step
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setImportErrors([]);
    setImportComplete(false);
    importAbortRef.current = false;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;

        // Use the new parser that handles multi-line quoted fields
        const { headers, rows } = parseCSV(text);

        // Clean up headers (remove quotes)
        const cleanHeaders = headers.map(h => h.replace(/"/g, '').trim());

        // Filter out empty rows
        const validRows = rows.filter(row => row.length >= 2 && row.some(cell => cell.trim()));

        console.log(`Parsed CSV: ${cleanHeaders.length} columns, ${validRows.length} data rows`);
        console.log('Headers:', cleanHeaders);
        console.log('First row sample:', validRows[0]?.slice(0, 5));

        setParsedHeaders(cleanHeaders);
        setParsedData(validRows);

        // Auto-detect mappings
        const autoMappings = autoDetectMappings(cleanHeaders);
        setColumnMapping(autoMappings);

        // Show mapping step
        setShowMappingStep(true);
      } catch (error: any) {
        console.error('Error parsing CSV:', error);
        setImportErrors([`Error parsing file: ${error.message || 'Unknown error'}`]);
      }
    };
    reader.readAsText(file);
  };

  // Start the actual import after mapping is confirmed
  const startImport = async () => {
    // Validate required fields are mapped
    const missingRequired = expectedFields
      .filter(f => f.required && !columnMapping[f.key])
      .map(f => f.label);

    if (missingRequired.length > 0) {
      setImportErrors([`Please map required fields: ${missingRequired.join(', ')}`]);
      return;
    }

    setShowMappingStep(false);
    setIsImporting(true);
    setImportProgress({ current: 0, total: 0, errors: 0 });
    setImportErrors([]);

    try {
      const headers = parsedHeaders;

      const supabase = getSupabaseClient();
      if (!supabase) {
        setImportErrors(['Database not connected']);
        setIsImporting(false);
        return;
      }

      // Get admin user for seller_id fallback
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const adminId = adminUser?.id;

      // Get all profiles to map seller emails
      const { data: profiles } = await (supabase.from('profiles') as any)
        .select('id, email');
      const emailToId: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        emailToId[p.email?.toLowerCase()] = p.id;
      });

      // Helper function to get value from row using column mapping
      const getMappedValue = (row: string[], fieldKey: string): string => {
        const csvColumn = columnMapping[fieldKey];
        if (!csvColumn) return '';
        const colIndex = headers.indexOf(csvColumn);
        if (colIndex === -1) return '';
        return row[colIndex]?.replace(/^"|"$/g, '').trim() || '';
      };

      // Parse all listings using the column mapping
      const listings: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        if (row.length < 2) continue;

        const listing: any = {
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Helper to parse currency/number values (handles decimals like "217000.0")
        const parseNumber = (value: string): number => {
          if (!value) return 0;
          // Remove currency symbols and commas, but keep decimal point
          const cleaned = value.replace(/[$,]/g, '').trim();
          // Parse as float first to handle decimals, then round to integer
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : Math.round(num);
        };

        // Map each field using the column mapping
        listing.title = getMappedValue(row, 'title');
        listing.description = getMappedValue(row, 'description') || null;
        listing.business_type = getMappedValue(row, 'business_type') || 'other';

        listing.asking_price = parseNumber(getMappedValue(row, 'asking_price'));
        listing.annual_revenue = parseNumber(getMappedValue(row, 'annual_revenue'));
        listing.annual_profit = parseNumber(getMappedValue(row, 'annual_profit'));

        const highlights = getMappedValue(row, 'highlights');
        listing.highlights = highlights ? highlights.split('|').map((h: string) => h.trim()) : [];

        const employees = getMappedValue(row, 'employee_count');
        listing.employee_count = parseInt(employees) || 0;

        listing.year_established = getMappedValue(row, 'year_established') || null;
        listing.location = getMappedValue(row, 'location') || null;
        listing.reason_for_selling = getMappedValue(row, 'reason_for_selling') || null;
        listing.website_url = getMappedValue(row, 'website_url') || null;

        // Handle seller email
        const sellerEmail = getMappedValue(row, 'seller_email');
        if (sellerEmail) {
          const sellerId = emailToId[sellerEmail.toLowerCase()];
          if (sellerId) {
            listing.seller_id = sellerId;
          }
        }

        // Handle status
        const status = getMappedValue(row, 'status');
        if (['draft', 'pending_review', 'active', 'rejected', 'sold'].includes(status)) {
          listing.status = status;
        }

        // Handle boolean fields
        const featured = getMappedValue(row, 'is_featured');
        listing.is_featured = featured.toLowerCase() === 'true';

        const nda = getMappedValue(row, 'requires_nda');
        listing.requires_nda = nda.toLowerCase() === 'true';

        const verified = getMappedValue(row, 'is_verified');
        listing.is_verified = verified.toLowerCase() === 'true';

        // New fields
        listing.customers = getMappedValue(row, 'customers') || null;
        listing.churn_rate = getMappedValue(row, 'churn_rate') || null;
        listing.annual_growth = getMappedValue(row, 'annual_growth') || null;
        listing.tech_stack = getMappedValue(row, 'tech_stack') || null;
        listing.competitors = getMappedValue(row, 'competitors') || null;
        listing.business_model = getMappedValue(row, 'business_model') || null;
        listing.asking_price_reasoning = getMappedValue(row, 'asking_price_reasoning') || null;
        listing.source_url = getMappedValue(row, 'source_url') || null;

        // Set seller_id to admin if not specified
        if (!listing.seller_id) {
          listing.seller_id = adminId;
        }

        // Set published_at for active listings
        if (listing.status === 'active') {
          listing.published_at = new Date().toISOString();
        }

        // Validate required fields
        if (!listing.title || !listing.asking_price) {
          errors.push(`Row ${i + 2}: Missing required fields (title or asking_price)`);
          continue;
        }

        listings.push({ ...listing, rowNumber: i + 2 });
      }

      if (listings.length === 0) {
        setImportErrors(['No valid listings found in CSV. Make sure title and asking_price columns are mapped and have data.']);
        setIsImporting(false);
        return;
      }

      // Update total count
      setImportProgress(prev => ({ ...prev, total: listings.length }));

      // Import listings one by one for progress tracking
      let successCount = 0;
      let errorCount = errors.length;

      for (let i = 0; i < listings.length; i++) {
        // Check if aborted
        if (importAbortRef.current) {
          errors.push('Import cancelled by user');
          break;
        }

        const { rowNumber, ...listingData } = listings[i];

        try {
          const { error } = await (supabase.from('listings') as any).insert(listingData);

          if (error) {
            errors.push(`Row ${rowNumber}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err: any) {
          errors.push(`Row ${rowNumber}: ${err.message || 'Unknown error'}`);
          errorCount++;
        }

        // Update progress
        setImportProgress({
          current: i + 1,
          total: listings.length,
          errors: errorCount,
        });

        // Small delay to prevent overwhelming the database and allow UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportErrors(errors);
      setImportComplete(true);
      setIsImporting(false);

      // Refresh listings after import
      if (successCount > 0) {
        fetchListings();
      }
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      setImportErrors([`Error processing file: ${error.message || 'Unknown error'}`]);
      setIsImporting(false);
    }
  };

  // Cancel import
  const handleCancelImport = () => {
    importAbortRef.current = true;
  };

  // Reset import modal
  const resetImportModal = () => {
    setIsImporting(false);
    setImportProgress({ current: 0, total: 0, errors: 0 });
    setImportErrors([]);
    setImportComplete(false);
    setShowMappingStep(false);
    setParsedHeaders([]);
    setParsedData([]);
    setColumnMapping({});
    importAbortRef.current = false;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle column mapping change
  const handleMappingChange = (fieldKey: string, csvColumn: string) => {
    setColumnMapping(prev => {
      const newMapping = { ...prev };
      if (csvColumn) {
        newMapping[fieldKey] = csvColumn;
      } else {
        delete newMapping[fieldKey];
      }
      return newMapping;
    });
  };

  // Open edit modal with listing data
  const openEditModal = (listing: Listing) => {
    setSelectedListing(listing);
    setFormData({
      title: listing.title,
      description: listing.description || '',
      business_type: listing.business_type,
      asking_price: listing.asking_price.toString(),
      revenue_monthly: listing.revenue_monthly?.toString() || '',
      profit_monthly: listing.profit_monthly?.toString() || '',
      status: listing.status,
      is_featured: listing.is_featured,
      requires_nda: listing.requires_nda,
      is_verified: listing.is_verified,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      business_type: 'saas',
      asking_price: '',
      revenue_monthly: '',
      profit_monthly: '',
      status: 'draft',
      is_featured: false,
      requires_nda: false,
      is_verified: false,
    });
  };

  // Approve/Reject listing
  const handleStatusChange = async (listingId: string, newStatus: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await (supabase.from('listings') as any)
        .update({
          status: newStatus,
          published_at: newStatus === 'active' ? new Date().toISOString() : null,
        })
        .eq('id', listingId);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const statsDisplay = [
    { label: 'Total Listings', value: stats.total, icon: 'solar:layers-bold', color: 'primary' },
    { label: 'Active', value: stats.active, icon: 'solar:check-circle-bold', color: 'emerald' },
    { label: 'Pending Review', value: stats.pending, icon: 'solar:clock-circle-bold', color: 'amber' },
    { label: 'Featured', value: stats.featured, icon: 'solar:star-bold', color: 'purple' },
  ];

  return (
    <>
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900">Listings Management</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowUploadModal(true)}>
            <Icon icon="solar:upload-linear" width={18} />
            Import CSV
          </Button>
          <Link href="/admin/listings/new">
            <Button variant="primary" size="sm">
              <Icon icon="solar:add-circle-linear" width={18} />
              Add Listing
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsDisplay.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                stat.color === 'primary' && 'bg-primary/10 text-primary',
                stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                stat.color === 'amber' && 'bg-amber-100 text-amber-600',
                stat.color === 'purple' && 'bg-purple-100 text-purple-600'
              )}>
                <Icon icon={stat.icon} width={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                <p className="text-sm text-dark-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" width={18} />}
              />
            </div>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </Card>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Listing</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Seller</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Price</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">NDA</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Views</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Created</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-dark-500">Loading...</td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-dark-500">No listings found</td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-dark-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-dark-900">{listing.title}</p>
                            <p className="text-xs text-dark-500">#{listing.id.slice(0, 8)}</p>
                          </div>
                          {listing.is_featured && (
                            <Icon icon="solar:star-bold" className="text-amber-500" width={16} />
                          )}
                          {listing.is_verified && (
                            <Icon icon="solar:verified-check-bold" className="text-primary" width={16} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-dark-600">{listing.seller_name}</td>
                      <td className="py-4 px-4 text-right font-semibold text-dark-900">{formatCurrency(listing.asking_price)}</td>
                      <td className="py-4 px-4 text-center">{getStatusBadge(listing.status)}</td>
                      <td className="py-4 px-4 text-center">
                        {listing.requires_nda ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Required</span>
                        ) : (
                          <span className="text-xs text-dark-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right text-dark-600">{listing.views_count.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-dark-500 text-sm">{formatDate(listing.created_at)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View listing */}
                          <Link href={`/listing/${listing.id}`} target="_blank">
                            <Button variant="ghost" size="sm" title="View Listing">
                              <Icon icon="solar:eye-linear" width={16} />
                            </Button>
                          </Link>
                          {/* Edit listing */}
                          <Button variant="ghost" size="sm" title="Edit Listing" onClick={() => openEditModal(listing)}>
                            <Icon icon="solar:pen-linear" width={16} />
                          </Button>
                          {/* Approve/Reject for pending */}
                          {listing.status === 'pending_review' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600"
                                title="Approve"
                                onClick={() => handleStatusChange(listing.id, 'active')}
                              >
                                <Icon icon="solar:check-circle-linear" width={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                title="Reject"
                                onClick={() => handleStatusChange(listing.id, 'rejected')}
                              >
                                <Icon icon="solar:close-circle-linear" width={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900">Add New Listing</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <Icon icon="solar:close-circle-linear" width={24} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the business..."
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Business Type *</label>
                  <Select
                    options={businessTypes}
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                  <Select
                    options={statusOptions.filter(s => s.value !== 'all')}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Asking Price *</label>
                  <Input
                    type="number"
                    value={formData.asking_price}
                    onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Monthly Revenue</label>
                  <Input
                    type="number"
                    value={formData.revenue_monthly}
                    onChange={(e) => setFormData({ ...formData, revenue_monthly: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Monthly Profit</label>
                  <Input
                    type="number"
                    value={formData.profit_monthly}
                    onChange={(e) => setFormData({ ...formData, profit_monthly: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Featured Listing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_nda}
                    onChange={(e) => setFormData({ ...formData, requires_nda: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Requires NDA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Verified</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-dark-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddListing}>Add Listing</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {showEditModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900">Edit Listing</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <Icon icon="solar:close-circle-linear" width={24} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the business..."
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Business Type *</label>
                  <Select
                    options={businessTypes}
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                  <Select
                    options={statusOptions.filter(s => s.value !== 'all')}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Asking Price *</label>
                  <Input
                    type="number"
                    value={formData.asking_price}
                    onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Monthly Revenue</label>
                  <Input
                    type="number"
                    value={formData.revenue_monthly}
                    onChange={(e) => setFormData({ ...formData, revenue_monthly: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Monthly Profit</label>
                  <Input
                    type="number"
                    value={formData.profit_monthly}
                    onChange={(e) => setFormData({ ...formData, profit_monthly: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Featured Listing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_nda}
                    onChange={(e) => setFormData({ ...formData, requires_nda: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Requires NDA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-dark-700">Verified</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-dark-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleEditListing}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={cn(
            "bg-white rounded-xl m-4 max-h-[90vh] overflow-y-auto",
            showMappingStep ? "w-full max-w-4xl" : "w-full max-w-2xl"
          )}>
            <div className="p-6 border-b border-dark-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-dark-900">
                {isImporting ? 'Importing Listings...' : importComplete ? 'Import Complete' : showMappingStep ? 'Map Your Columns' : 'Import Listings from CSV'}
              </h2>
              {!isImporting && (
                <Button variant="ghost" size="sm" onClick={() => { setShowUploadModal(false); resetImportModal(); }}>
                  <Icon icon="solar:close-circle-linear" width={24} />
                </Button>
              )}
            </div>

            <div className="p-6">
              {/* Column Mapping Step */}
              {showMappingStep && !isImporting && !importComplete ? (
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Icon icon="solar:file-text-bold" className="text-primary" width={24} />
                      <div>
                        <p className="font-medium text-dark-900">File Loaded</p>
                        <p className="text-sm text-dark-500">{parsedData.length} rows found • {parsedHeaders.length} columns detected</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={resetImportModal}>
                      <Icon icon="solar:refresh-linear" width={16} />
                      Choose Different File
                    </Button>
                  </div>

                  {/* Data Preview */}
                  <div className="border border-dark-200 rounded-xl overflow-hidden">
                    <div className="bg-dark-50 px-4 py-3 border-b border-dark-200">
                      <p className="font-medium text-dark-900">Data Preview (First 5 Rows)</p>
                    </div>
                    <div className="overflow-x-auto max-h-40">
                      <table className="w-full text-xs">
                        <thead className="bg-dark-50 sticky top-0">
                          <tr>
                            {parsedHeaders.map((header, idx) => (
                              <th key={idx} className="px-3 py-2 text-left font-medium text-dark-600 whitespace-nowrap border-b border-dark-200">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-dark-100">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-2 text-dark-700 whitespace-nowrap max-w-[200px] truncate">
                                  {cell?.replace(/^"|"$/g, '') || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Column Mapping */}
                  <div className="border border-dark-200 rounded-xl overflow-hidden">
                    <div className="bg-dark-50 px-4 py-3 border-b border-dark-200">
                      <p className="font-medium text-dark-900">Map Columns</p>
                      <p className="text-sm text-dark-500 mt-1">Match your CSV columns to the system fields</p>
                    </div>
                    <div className="p-4 grid md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                      {expectedFields.map(field => (
                        <div key={field.key} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-dark-700 mb-1">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              value={columnMapping[field.key] || ''}
                              onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            >
                              <option value="">-- Not mapped --</option>
                              {parsedHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </select>
                          </div>
                          {columnMapping[field.key] && (
                            <Icon icon="solar:check-circle-bold" className="text-emerald-500 shrink-0" width={20} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mapping Summary */}
                  <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-dark-600">
                        <span className="font-medium text-dark-900">{Object.keys(columnMapping).length}</span> columns mapped
                      </span>
                      <span className="text-dark-400">•</span>
                      <span className="text-dark-600">
                        <span className="font-medium text-dark-900">{parsedData.length}</span> rows to import
                      </span>
                    </div>
                    {expectedFields.filter(f => f.required && !columnMapping[f.key]).length > 0 && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <Icon icon="solar:danger-circle-linear" width={14} />
                        Missing required fields
                      </span>
                    )}
                  </div>

                  {/* Error Messages */}
                  {importErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                      <Icon icon="solar:danger-circle-bold" width={16} />
                      {importErrors[0]}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-200">
                    <Button variant="secondary" className="flex-1" onClick={resetImportModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={startImport}
                      disabled={expectedFields.filter(f => f.required && !columnMapping[f.key]).length > 0}
                    >
                      <Icon icon="solar:import-linear" width={18} />
                      Start Import ({parsedData.length} listings)
                    </Button>
                  </div>
                </div>
              ) : (isImporting || importComplete) ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-dark-900">
                        {importComplete ? 'Import finished' : 'Importing listings...'}
                      </span>
                      <span className="text-dark-600">
                        {importProgress.current} / {importProgress.total}
                      </span>
                    </div>
                    <div className="h-3 bg-dark-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          importComplete ? (importProgress.errors > 0 ? "bg-amber-500" : "bg-emerald-500") : "bg-primary"
                        )}
                        style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-dark-500">
                      <span>
                        {isImporting && importProgress.total > 0 && (
                          <>Est. time remaining: {Math.ceil((importProgress.total - importProgress.current) * 0.15)}s</>
                        )}
                      </span>
                      {importProgress.errors > 0 && (
                        <span className="text-red-600">{importProgress.errors} errors</span>
                      )}
                    </div>
                  </div>

                  {/* Status Message */}
                  {importComplete && (
                    <div className={cn(
                      "p-4 rounded-xl flex items-start gap-3",
                      importProgress.errors === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
                    )}>
                      <Icon
                        icon={importProgress.errors === 0 ? "solar:check-circle-bold" : "solar:danger-triangle-bold"}
                        className={importProgress.errors === 0 ? "text-emerald-600" : "text-amber-600"}
                        width={24}
                      />
                      <div>
                        <p className={cn(
                          "font-medium",
                          importProgress.errors === 0 ? "text-emerald-800" : "text-amber-800"
                        )}>
                          {importProgress.current - importProgress.errors} listings imported successfully
                        </p>
                        {importProgress.errors > 0 && (
                          <p className="text-sm text-amber-700 mt-1">
                            {importProgress.errors} listings failed to import
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Log */}
                  {importErrors.length > 0 && (
                    <div className="border border-dark-200 rounded-xl overflow-hidden">
                      <div className="bg-dark-50 px-4 py-2 border-b border-dark-200">
                        <p className="text-sm font-medium text-dark-700">Import Errors ({importErrors.length})</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-4 space-y-2">
                        {importErrors.map((error, idx) => (
                          <div key={idx} className="text-sm text-red-600 flex items-start gap-2">
                            <Icon icon="solar:danger-circle-linear" className="shrink-0 mt-0.5" width={14} />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-200">
                    {isImporting ? (
                      <Button variant="danger" className="flex-1" onClick={handleCancelImport}>
                        <Icon icon="solar:stop-circle-linear" width={18} />
                        Cancel Import
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" className="flex-1" onClick={resetImportModal}>
                          <Icon icon="solar:upload-linear" width={18} />
                          Import Another File
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={() => { setShowUploadModal(false); resetImportModal(); }}>
                          <Icon icon="solar:check-circle-bold" width={18} />
                          Done
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Background Processing Notice */}
                  {isImporting && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                      <Icon icon="solar:info-circle-bold" width={16} />
                      <span>You can leave this screen and the import will continue in the background.</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Upload View */
                <div className="space-y-6">
                  {/* Download Template Button */}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div>
                      <p className="font-medium text-dark-900">Download CSV Template</p>
                      <p className="text-sm text-dark-500 mt-1">Get a template with all supported fields and sample data</p>
                    </div>
                    <a href="/templates/listings-import-template.csv" download>
                      <Button variant="secondary" size="sm">
                        <Icon icon="solar:download-linear" width={18} />
                        Download Template
                      </Button>
                    </a>
                  </div>

                  {/* Upload Area */}
                  <div
                    className="border-2 border-dashed border-dark-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon icon="solar:upload-bold" width={48} className="mx-auto text-dark-400 mb-4" />
                    <p className="text-dark-600 mb-2 font-medium">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-dark-400 mb-4">Supports .csv files up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                    <Button variant="primary">
                      <Icon icon="solar:folder-open-linear" width={18} />
                      Select File
                    </Button>
                  </div>

                  {/* Column Reference */}
                  <div className="border border-dark-200 rounded-xl overflow-hidden">
                    <div className="bg-dark-50 px-4 py-3 border-b border-dark-200">
                      <p className="font-medium text-dark-900">Supported Columns</p>
                    </div>
                    <div className="p-4">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-dark-800 mb-2">Required:</p>
                          <ul className="space-y-1 text-dark-600">
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <code className="bg-dark-100 px-1 rounded">title</code> - Business name
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <code className="bg-dark-100 px-1 rounded">asking_price</code> - Price in dollars
                            </li>
                          </ul>
                          <p className="font-medium text-dark-800 mb-2 mt-4">Basic Info:</p>
                          <ul className="space-y-1 text-dark-600">
                            <li><code className="bg-dark-100 px-1 rounded text-xs">business_type</code> - saas, ecommerce, etc.</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">annual_revenue</code> - Yearly revenue</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">annual_profit</code> - Yearly profit</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">description</code> - Business description</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">highlights</code> - Key points (use | separator)</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">seller_email</code> - Assign to seller</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-dark-800 mb-2">Metrics & Details:</p>
                          <ul className="space-y-1 text-dark-600">
                            <li><code className="bg-dark-100 px-1 rounded text-xs">customers</code> - Customer count (e.g., 500+)</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">churn_rate</code> - Churn % (e.g., 3-5%)</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">annual_growth</code> - YoY growth (e.g., 25%)</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">tech_stack</code> - Technologies used</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">competitors</code> - Named competitors</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">business_model</code> - B2B, B2C, SaaS, etc.</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">asking_price_reasoning</code> - Valuation justification</li>
                          </ul>
                          <p className="font-medium text-dark-800 mb-2 mt-4">Admin Fields:</p>
                          <ul className="space-y-1 text-dark-600">
                            <li><code className="bg-dark-100 px-1 rounded text-xs">status</code> - draft, active, pending_review</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">is_featured</code> - true/false</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">requires_nda</code> - true/false</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">is_verified</code> - true/false</li>
                            <li><code className="bg-dark-100 px-1 rounded text-xs">source_url</code> - Original listing source</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminListingsContent;
