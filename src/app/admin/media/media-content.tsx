'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

const mockMedia: MediaFile[] = [
  {
    id: 'MED-001',
    name: 'techflow-dashboard.png',
    type: 'image',
    size: '2.4 MB',
    uploadedAt: '2024-01-28',
    uploadedBy: 'John Smith',
    url: '/images/placeholder-1.jpg',
  },
  {
    id: 'MED-002',
    name: 'ecommerce-analytics.png',
    type: 'image',
    size: '1.8 MB',
    uploadedAt: '2024-01-27',
    uploadedBy: 'Sarah Johnson',
    url: '/images/placeholder-2.jpg',
  },
  {
    id: 'MED-003',
    name: 'financial-report-2023.pdf',
    type: 'document',
    size: '4.2 MB',
    uploadedAt: '2024-01-26',
    uploadedBy: 'Mike Williams',
    url: '/documents/report.pdf',
  },
  {
    id: 'MED-004',
    name: 'business-overview.mp4',
    type: 'video',
    size: '45.8 MB',
    uploadedAt: '2024-01-25',
    uploadedBy: 'Emily Chen',
    url: '/videos/overview.mp4',
  },
  {
    id: 'MED-005',
    name: 'team-photo.jpg',
    type: 'image',
    size: '3.1 MB',
    uploadedAt: '2024-01-24',
    uploadedBy: 'David Brown',
    url: '/images/placeholder-3.jpg',
  },
  {
    id: 'MED-006',
    name: 'due-diligence-checklist.pdf',
    type: 'document',
    size: '856 KB',
    uploadedAt: '2024-01-23',
    uploadedBy: 'Admin',
    url: '/documents/checklist.pdf',
  },
];

export function MediaContent() {
  const [media, setMedia] = useState(mockMedia);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMedia = media.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return 'mdi:image';
      case 'document': return 'mdi:file-document';
      case 'video': return 'mdi:video';
      default: return 'mdi:file';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-600';
      case 'document': return 'bg-red-100 text-red-600';
      case 'video': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const stats = {
    total: media.length,
    images: media.filter(m => m.type === 'image').length,
    documents: media.filter(m => m.type === 'document').length,
    videos: media.filter(m => m.type === 'video').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-dark">Media Library</h1>
              <p className="text-gray-600 mt-1">Manage all uploaded files and images</p>
            </div>
            <Button onClick={() => setShowUploadModal(true)}>
              <Icon icon="mdi:upload" className="w-5 h-5 mr-2" />
              Upload Files
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon icon="mdi:folder" className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Files</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon icon="mdi:image" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.images}</p>
                  <p className="text-sm text-gray-500">Images</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Icon icon="mdi:file-document" className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.documents}</p>
                  <p className="text-sm text-gray-500">Documents</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Icon icon="mdi:video" className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.videos}</p>
                  <p className="text-sm text-gray-500">Videos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Icon icon="mdi:magnify" className="w-5 h-5 text-gray-400" />}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="video">Videos</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
                >
                  <Icon icon="mdi:view-grid" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
                >
                  <Icon icon="mdi:view-list" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Media Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredMedia.map((file) => (
                <Card key={file.id} className="overflow-hidden group cursor-pointer" onClick={() => {
                  setSelectedMedia(file);
                  setShowPreviewModal(true);
                }}>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {file.type === 'image' ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-lg ${getTypeColor(file.type)} flex items-center justify-center`}>
                        <Icon icon={getTypeIcon(file.type)} className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Icon icon="mdi:eye" className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}>
                        <Icon icon="mdi:delete" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-dark text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">File</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded By</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMedia.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${getTypeColor(file.type)} flex items-center justify-center`}>
                              <Icon icon={getTypeIcon(file.type)} className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-dark">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 capitalize">{file.type}</td>
                        <td className="px-6 py-4 text-gray-600">{file.size}</td>
                        <td className="px-6 py-4 text-gray-600">{file.uploadedBy}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedMedia(file);
                              setShowPreviewModal(true);
                            }}>
                              <Icon icon="mdi:eye" className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Icon icon="mdi:download" className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)}>
                              <Icon icon="mdi:delete" className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Files"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Icon icon="mdi:cloud-upload" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-dark font-medium mb-2">Drag and drop files here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button variant="secondary">
              Browse Files
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Supported formats: JPG, PNG, PDF, MP4 (Max 50MB)
          </p>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedMedia?.name || 'Preview'}
        size="lg"
      >
        {selectedMedia && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
                  <Icon icon="mdi:image" className="w-16 h-16 text-gray-400" />
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-lg ${getTypeColor(selectedMedia.type)} flex items-center justify-center`}>
                  <Icon icon={getTypeIcon(selectedMedia.type)} className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500">File Size</label>
                <p className="text-dark">{selectedMedia.size}</p>
              </div>
              <div>
                <label className="text-gray-500">Type</label>
                <p className="text-dark capitalize">{selectedMedia.type}</p>
              </div>
              <div>
                <label className="text-gray-500">Uploaded By</label>
                <p className="text-dark">{selectedMedia.uploadedBy}</p>
              </div>
              <div>
                <label className="text-gray-500">Upload Date</label>
                <p className="text-dark">{new Date(selectedMedia.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" className="flex-1">
                <Icon icon="mdi:download" className="w-5 h-5 mr-2" />
                Download
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => {
                handleDelete(selectedMedia.id);
                setShowPreviewModal(false);
              }}>
                <Icon icon="mdi:delete" className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
