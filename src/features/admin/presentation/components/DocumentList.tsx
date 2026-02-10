/**
 * Document List Component
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Componente que muestra la lista de documentos RAG.
 */

import React, { useState, useEffect } from 'react';
import { Document } from '../../domain/entities/Document';
import { GetAllDocumentsUseCase } from '../../domain/usecases/GetAllDocumentsUseCase';
import { DeleteDocumentUseCase } from '../../domain/usecases/DeleteDocumentUseCase';
import { Trash2 } from 'lucide-react';
import { UpdateDocumentUseCase } from '../../domain/usecases/UpdateDocumentUseCase';
import { CreateDocumentUseCase } from '../../domain/usecases/CreateDocumentUseCase';
import { AdminUser } from '../../domain/entities/AdminUser';
import { PaginatedResult } from '../../domain/repositories/IDocumentRepository';

// Generate consistent and distinct color for each source
const getSourceColor = (source: string): string => {
  // DJB2 hash algorithm for better distribution
  let hash = 5381;
  for (let i = 0; i < source.length; i++) {
    // Use codePointAt for better Unicode support
    const code = source.codePointAt(i) ?? 0;
    hash = ((hash << 5) + hash) + code;
  }
  
  // Use multiple hash transformations for better color separation
  const hue = (hash % 360 + 360) % 360;
  const sat = 65 + ((hash >> 8) % 15); // 65-80%
  const light = 50 + ((hash >> 16) % 10); // 50-60%
  
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

interface DocumentListProps {
  getAllDocumentsUseCase: GetAllDocumentsUseCase;
  deleteDocumentUseCase: DeleteDocumentUseCase;
  updateDocumentUseCase: UpdateDocumentUseCase;
  createDocumentUseCase: CreateDocumentUseCase;
  currentUser: AdminUser;
  onDocumentChange?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  getAllDocumentsUseCase,
  deleteDocumentUseCase,
  updateDocumentUseCase,
  createDocumentUseCase,
  currentUser,
  onDocumentChange,
}) => {
  const [documents, setDocuments] = useState<PaginatedResult<Document> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSources, setEditedSources] = useState<string[]>([]);
  const [newSourceInput, setNewSourceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  type NewDocument = {
    content: string;
    source: string;
    metadata: Record<string, unknown>;
  };
  const [newDocument, setNewDocument] = useState<NewDocument>({
    content: '',
    source: '',
    metadata: {},
  });
  
  // Available options for dropdowns
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState('');

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDocument) {
        setSelectedDocument(null);
        setIsEditing(false);
        setEditedContent('');
      }
    };

    if (selectedDocument) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedDocument]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        source: sourceFilter || undefined,
        searchText: searchText || undefined,
      };

      // Only allow console.warn/error for debugging

      const result = await getAllDocumentsUseCase.execute(filters, {
        page: currentPage,
        pageSize: 20,
      });

      setDocuments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSources = async () => {
    try {
      // Load ALL documents without filters to get all available sources
      const allDocs = await getAllDocumentsUseCase.execute({}, {
        page: 1,
        pageSize: 100, // Maximum allowed by use case
      });

      const allSources = new Set<string>();
      allDocs.data.forEach(doc => {
        // Split by comma to handle multi-source documents
        doc.source.split(',').forEach(s => {
          const trimmed = s.trim();
          if (trimmed) {
            allSources.add(trimmed);
          }
        });
      });

      const sourcesArray = Array.from(allSources).sort((a, b) => a.localeCompare(b));
      setAvailableSources(sourcesArray);
    } catch (err) {
      console.error('❌ Failed to load available sources:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sourceFilter]);

  // Load available sources once on mount
  useEffect(() => {
    loadAvailableSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocumentUseCase.execute(String(documentId), currentUser);
      await loadDocuments(); // Reload list
      await loadAvailableSources(); // Reload sources for dropdown
      onDocumentChange?.(); // Refresh stats
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleEdit = () => {
    if (selectedDocument) {
      setEditedContent(selectedDocument.content);
      // Parse sources from comma-separated string (support for multi-source)
      const sources = selectedDocument.source 
        ? selectedDocument.source.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      setEditedSources(sources);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      // Join all sources with comma (multi-source support)
      const newSource = editedSources.length > 0 
        ? editedSources.join(', ') 
        : undefined;

      // --- Robust metadata: siempre debe incluir source ---
      let safeMetadata = selectedDocument.metadata ? { ...selectedDocument.metadata } : {};
      if (newSource) {
        safeMetadata.source = newSource;
      } else if (!safeMetadata.source) {
        safeMetadata.source = 'manual';
      }

      await updateDocumentUseCase.execute(
        String(selectedDocument.id),
        editedContent,
        currentUser,
        newSource,
        safeMetadata
      );

      // Reload list AND close modal to force fresh data on next open
      await loadDocuments();
      await loadAvailableSources(); // Reload sources for dropdown
      onDocumentChange?.(); // Refresh stats
      setSelectedDocument(null);
      setIsEditing(false);
      setEditedContent('');
      setEditedSources([]);
      setNewSourceInput('');
    } catch (err) {
      console.error('❌ Save failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to update document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
    setEditedSources([]);
    setNewSourceInput('');
  };

  const handleAddSource = () => {
    const trimmed = newSourceInput.trim().toLowerCase();
    if (trimmed && !editedSources.includes(trimmed)) {
      setEditedSources([...editedSources, trimmed]);
      setNewSourceInput('');
    }
  };

  const handleRemoveSource = (sourceToRemove: string) => {
    setEditedSources(editedSources.filter(s => s !== sourceToRemove));
  };

  const handleCreate = async () => {
    // Determine final source
    const finalSource = newDocument.source === '_custom_' ? customSource.trim() : newDocument.source;

    // Validation
    if (!newDocument.content.trim()) {
      alert('Content is required');
      return;
    }
    if (!finalSource) {
      alert('Source is required. Please select or enter a source.');
      return;
    }

    setIsCreating(true);
    try {
      // --- Robust metadata: siempre debe incluir source ---
      let safeMetadata = newDocument.metadata ? { ...newDocument.metadata } : {};
      safeMetadata.source = finalSource;

      await createDocumentUseCase.execute(
        newDocument.content,
        finalSource,
        safeMetadata,
        currentUser
      );

      // Reset form and close modal
      setShowCreateModal(false);
      setNewDocument({ content: '', source: '', metadata: {} });
      setCustomSource('');
      
      // Reload documents
      await loadDocuments();
      await loadAvailableSources(); // Reload sources for dropdown
      onDocumentChange?.(); // Refresh stats
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDocuments();
  };

  if (isLoading && !documents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-900/20 border border-red-500 p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        {currentUser.canPerform('create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <span className="text-xl">+</span>
            <span>Create New Document</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <select
                id="source-filter"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                {availableSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="search-text" className="block text-sm font-medium text-gray-300 mb-2">
                Search Content
              </label>
              <div className="flex gap-2">
                <input
                  id="search-text"
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search in content..."
                  className="flex-1 px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Content Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {documents?.data.map((doc) => (
              <tr key={doc.id ?? doc.content} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="text-left hover:text-blue-400 transition-colors cursor-pointer w-full truncate"
                    title="Click to view full content"
                  >
                    {doc.getContentPreview(100)}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex flex-wrap gap-1">
                    {doc.source.split(',').map((s) => {
                      const trimmed = s.trim();
                      const color = getSourceColor(trimmed);
                      return (
                        <span 
                          key={trimmed}
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1.5px solid ${color}`
                          }}
                        >
                          {trimmed}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {doc.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {currentUser.canPerform('edit') && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-400 hover:text-red-300 focus:outline-none flex items-center justify-center mx-auto"
                      title="Delete document"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {documents?.data.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No documents found
          </div>
        )}
      </div>

      {/* Pagination */}
      {documents && documents.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {documents.data.length} of {documents.total} documents
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-400">
              Page {currentPage} of {documents.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(documents.totalPages, p + 1))}
              disabled={currentPage === documents.totalPages}
              className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal for Full Content */}
      {selectedDocument && (
        <dialog
          open
          aria-labelledby="modal-title"
          className="fixed inset-0 bg-transparent backdrop:bg-black/80 backdrop:backdrop-blur-sm flex items-center justify-center z-50 p-4 max-w-none w-full h-full"
        >
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h3 id="modal-title" className="text-xl font-bold text-white">Document Content</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDocument.source.split(',').map((s) => {
                    const trimmed = s.trim();
                    const color = getSourceColor(trimmed);
                    return (
                      <span 
                        key={trimmed}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          border: `1.5px solid ${color}`
                        }}
                      >
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {isEditing ? (
                <div className="flex flex-col h-full gap-4">
                  {/* Source Tags Editor */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <span>Sources (Tags)</span>
                      {/* Associate label with input for accessibility */}
                      <label htmlFor="edit-sources-input" className="sr-only">Edit sources for document</label>
                    </label>
                    
                    {/* Current Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editedSources.map((source) => {
                        const color = getSourceColor(source);
                        return (
                          <span
                            key={source}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                              border: `1.5px solid ${color}`
                            }}
                          >
                            {source}
                            <button
                              onClick={() => handleRemoveSource(source)}
                              className="hover:text-red-400 transition-colors ml-1"
                              type="button"
                              style={{ color: color }}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                      {editedSources.length === 0 && (
                        <span className="text-gray-500 text-sm italic">No sources assigned</span>
                      )}
                    </div>

                    {/* Add New Source */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          id="edit-sources-input"
                          type="text"
                          list="sources-datalist"
                          value={newSourceInput}
                          onChange={(e) => setNewSourceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSource();
                            }
                          }}
                          placeholder="Type or select source..."
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSaving}
                          aria-label="Add source tag"
                        />
                        <datalist id="sources-datalist">
                          {availableSources.map(source => (
                            <option key={source} value={source} />
                          ))}
                        </datalist>
                      </div>
                      <button
                        onClick={handleAddSource}
                        disabled={!newSourceInput.trim() || isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        type="button"
                      >
                        Add
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      💡 Available sources: {availableSources.join(', ') || 'loading...'}
                    </p>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="flex-1 min-h-[300px] bg-gray-800 text-gray-300 rounded-md p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
              ) : (
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedDocument.content}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-gray-800/50">
              <div className="text-xs text-gray-400">
                Created: {selectedDocument.createdAt.toLocaleDateString()} {selectedDocument.createdAt.toLocaleTimeString()}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editedContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    {currentUser.canPerform('update') && (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <dialog
          open
          aria-modal="true"
          className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex items-center justify-center p-4"
        >
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-xl font-bold text-white">Create New Document</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDocument({ content: '', source: '', metadata: {} });
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Source Dropdown/Input */}
              <div>
                <label htmlFor="doc-source" className="block text-sm font-medium text-gray-300 mb-2">
                  Source <span className="text-red-400">*</span>
                </label>
                <select
                  id="doc-source"
                  value={newDocument.source}
                  onChange={(e) => setNewDocument({ ...newDocument, source: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreating}
                >
                  <option value="">-- Select Source --</option>
                  {availableSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                  <option value="_custom_">➕ Create New Source</option>
                </select>
                
                {/* Custom Source Input */}
                {newDocument.source === '_custom_' && (
                  <input
                    type="text"
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    placeholder="Enter new source name (e.g., contact_info)"
                    className="w-full px-4 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
                  />
                )}
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="doc-content" className="block text-sm font-medium text-gray-300 mb-2">
                  Content <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-500 ml-2">(max 10,000 characters)</span>
                </label>
                <textarea
                  id="doc-content"
                  value={newDocument.content}
                  onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the document content here..."
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {newDocument.content.length} / 10,000 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  ℹ️ <strong>Auto-Embedding:</strong> A 768-dimension vector embedding will be automatically generated using Gemini API.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDocument({ content: '', source: '', metadata: {} });
                  setCustomSource('');
                }}
                disabled={isCreating}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  !newDocument.content.trim() || 
                  !newDocument.source || 
                  (newDocument.source === '_custom_' && !customSource.trim()) ||
                  isCreating
                }
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};
