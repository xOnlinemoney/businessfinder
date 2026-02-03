'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { getSupabaseClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  publishDate: string;
  views: number;
  featured: boolean;
  content?: string;
  excerpt?: string;
  slug?: string;
  featured_image?: string;
}

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'Guides', label: 'Guides' },
  { value: 'Buying', label: 'Buying' },
  { value: 'Selling', label: 'Selling' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Market Insights', label: 'Market Insights' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
];

export function AdminBlogContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    featured_image: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // No Supabase - show empty state
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase.from('blog_posts') as any)
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          category,
          status,
          published_at,
          view_count,
          is_featured,
          featured_image,
          author:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts: BlogPost[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        author: post.author ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() : 'Unknown',
        category: post.category || 'Uncategorized',
        status: post.status || 'draft',
        publishDate: post.published_at || post.created_at,
        views: post.view_count || 0,
        featured: post.is_featured || false,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        featured_image: post.featured_image,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleToggleFeatured = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('blog_posts') as any)
          .update({ is_featured: !post.featured })
          .eq('id', id);
      } catch (error) {
        console.error('Error toggling featured:', error);
      }
    }

    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, featured: !p.featured } : p
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('blog_posts') as any)
          .delete()
          .eq('id', id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }

    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      category: post.category,
      content: post.content || '',
      excerpt: post.excerpt || '',
      status: post.status,
      featured_image: post.featured_image || '',
    });
    setShowEditModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Demo mode - create a local object URL
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, featured_image: localUrl }));
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, featured_image: '' }));
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.category) return;

    setIsSaving(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const { data, error } = await (supabase.from('blog_posts') as any)
          .insert({
            title: formData.title,
            slug,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            status: formData.status,
            author_id: user?.id,
            featured_image: formData.featured_image || null,
            published_at: formData.status === 'published' ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;

        setPosts(prev => [{
          id: data.id,
          title: data.title,
          author: 'You',
          category: data.category,
          status: data.status,
          publishDate: data.published_at || new Date().toISOString(),
          views: 0,
          featured: false,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: data.featured_image,
        }, ...prev]);
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please check if the blog_posts table exists.');
      }
    } else {
      alert('Database not connected. Please configure Supabase to create posts.');
    }

    setIsSaving(false);
    setShowModal(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!selectedPost || !formData.title) return;

    setIsSaving(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        await (supabase.from('blog_posts') as any)
          .update({
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            status: formData.status,
            featured_image: formData.featured_image || null,
            published_at: formData.status === 'published' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPost.id);
      } catch (error) {
        console.error('Error updating post:', error);
      }
    }

    setPosts(prev => prev.map(p =>
      p.id === selectedPost.id
        ? { ...p, title: formData.title, category: formData.category, status: formData.status, content: formData.content, excerpt: formData.excerpt, featured_image: formData.featured_image }
        : p
    ));

    setIsSaving(false);
    setShowEditModal(false);
    setSelectedPost(null);
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', content: '', excerpt: '', status: 'draft', featured_image: '' });
    setIsHtmlMode(false);
  };

  const insertHtmlTag = (tag: string, closeTag?: string) => {
    const openTag = `<${tag}>`;
    const close = closeTag || `</${tag}>`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + openTag + close
    }));
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((acc, p) => acc + p.views, 0),
  };

  // Render the content editor
  const renderContentEditor = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-dark-700">Content</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              isHtmlMode ? 'bg-primary text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}
          >
            <Icon icon="solar:code-linear" className="w-4 h-4 inline mr-1" />
            HTML
          </button>
        </div>
      </div>

      {/* HTML toolbar */}
      {isHtmlMode && (
        <div className="flex flex-wrap gap-1 p-2 bg-dark-50 border border-dark-200 rounded-t-lg border-b-0">
          <button
            type="button"
            onClick={() => insertHtmlTag('h1')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('h2')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('h3')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('p')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('strong')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100 font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('em')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100 italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('u')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100 underline"
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('a href=""')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Link"
          >
            <Icon icon="solar:link-linear" className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('ul')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Unordered List"
          >
            <Icon icon="solar:list-linear" className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('ol')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Ordered List"
          >
            <Icon icon="solar:list-1-linear" className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('li')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="List Item"
          >
            LI
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('blockquote')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Blockquote"
          >
            <Icon icon="solar:quote-down-linear" className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertHtmlTag('img src="" alt=""', '')}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Image"
          >
            <Icon icon="solar:gallery-linear" className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '<br>' }))}
            className="px-2 py-1 text-xs bg-white border border-dark-200 rounded hover:bg-dark-100"
            title="Line Break"
          >
            BR
          </button>
        </div>
      )}

      <textarea
        rows={12}
        placeholder={isHtmlMode ? '<p>Write your HTML content here...</p>' : 'Write your post content...'}
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        className={`w-full px-4 py-3 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
          isHtmlMode ? 'font-mono text-sm bg-dark-50 rounded-t-none' : ''
        }`}
      />

      {isHtmlMode && (
        <p className="text-xs text-dark-500">
          <Icon icon="solar:info-circle-linear" className="w-3 h-3 inline mr-1" />
          HTML mode enabled. Use proper HTML tags for SEO optimization.
        </p>
      )}
    </div>
  );

  // Render the media upload section
  const renderMediaUpload = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-dark-700">Featured Image</label>

      {formData.featured_image ? (
        <div className="relative">
          <img
            src={formData.featured_image}
            alt="Featured"
            className="w-full h-48 object-cover rounded-lg border border-dark-200"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-dark-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          {isUploading ? (
            <>
              <Icon icon="solar:spinner-linear" className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-dark-500">Uploading...</p>
            </>
          ) : (
            <>
              <Icon icon="solar:cloud-upload-linear" className="w-8 h-8 text-dark-400 mb-2" />
              <p className="text-sm text-dark-600 font-medium">Click to upload image</p>
              <p className="text-xs text-dark-400 mt-1">PNG, JPG, WebP up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900">Blog Management</h1>
          <p className="text-sm text-dark-500">Create and manage blog posts</p>
        </div>
        <Button onClick={() => { setShowModal(true); resetForm(); }}>
          <Icon icon="solar:add-circle-linear" width={18} />
          New Post
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon icon="solar:document-text-linear" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.total}</p>
                )}
                <p className="text-sm text-dark-500">Total Posts</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.published}</p>
                )}
                <p className="text-sm text-dark-500">Published</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Icon icon="solar:pen-linear" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.drafts}</p>
                )}
                <p className="text-sm text-dark-500">Drafts</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icon icon="solar:eye-linear" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.totalViews.toLocaleString()}</p>
                )}
                <p className="text-sm text-dark-500">Total Views</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" className="w-5 h-5 text-dark-400" />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-dark-200 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </Card>

        {/* Posts Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Post</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Views</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-20 bg-dark-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-dark-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          {post.featured && (
                            <Icon icon="solar:star-bold" className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <div className="font-medium text-dark-900">{post.title}</div>
                            <div className="text-sm text-dark-500">
                              {post.status === 'scheduled' ? 'Scheduled for ' : ''}
                              {new Date(post.publishDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-dark-100 rounded-full text-sm text-dark-700">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-700">{post.author}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={post.status === 'published' ? 'active' : post.status === 'draft' ? 'draft' : 'pending'} />
                      </td>
                      <td className="px-6 py-4 text-dark-700">{post.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(post.id)}
                            title={post.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Icon
                              icon={post.featured ? 'solar:star-bold' : 'solar:star-linear'}
                              className={`w-4 h-4 ${post.featured ? 'text-yellow-500' : 'text-dark-400'}`}
                            />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Icon icon="solar:pen-linear" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      <Icon icon="solar:document-text-linear" width={32} className="mx-auto mb-2 opacity-50" />
                      <p>No blog posts found</p>
                      <p className="text-sm mt-1">Click "New Post" to create your first blog post</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* New Post Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Post"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Title"
            placeholder="Enter post title..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          />

          {renderMediaUpload()}

          <Textarea
            label="Excerpt (SEO Meta Description)"
            rows={2}
            placeholder="Brief summary of the post for search engines (recommended: 150-160 characters)..."
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          />
          <p className="text-xs text-dark-500 -mt-2">
            {formData.excerpt.length}/160 characters
          </p>

          {renderContentEditor()}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setFormData(prev => ({ ...prev, status: 'draft' })); handleCreate(); }} isLoading={isSaving && formData.status === 'draft'}>
              Save as Draft
            </Button>
            <Button className="flex-1" onClick={() => { setFormData(prev => ({ ...prev, status: 'published' })); handleCreate(); }} isLoading={isSaving && formData.status === 'published'}>
              Publish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedPost(null); }}
        title="Edit Post"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Title"
            placeholder="Enter post title..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
            />
          </div>

          {renderMediaUpload()}

          <Textarea
            label="Excerpt (SEO Meta Description)"
            rows={2}
            placeholder="Brief summary of the post for search engines (recommended: 150-160 characters)..."
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          />
          <p className="text-xs text-dark-500 -mt-2">
            {formData.excerpt.length}/160 characters
          </p>

          {renderContentEditor()}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowEditModal(false); setSelectedPost(null); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdate} isLoading={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
