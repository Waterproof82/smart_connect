import React, { useState, useEffect, useCallback } from 'react';
import { Document } from '../../domain/entities/Document';
import { PaginatedResult } from '../../domain/repositories/IDocumentRepository';
import { Search, Filter, Plus, Database, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { SourceTag, DocumentCard, DocumentTable } from './document';
import { useAdmin } from '../AdminContext';
import { ConsoleLogger } from '@core/domain/usecases/Logger';

const logger = new ConsoleLogger('[DocumentList]');

interface DocumentListProps {
  onDocumentChange?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentChange,
}) => {
  const { container, currentUser } = useAdmin();
  const { getAllDocumentsUseCase, deleteDocumentUseCase, updateDocumentUseCase, createDocumentUseCase } = container;
  // --- States ---
  const [documents, setDocuments] = useState<PaginatedResult<Document> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Editing & Selection
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSources, setEditedSources] = useState<string[]>([]); // State for editing tags
  const [newSourceInput, setNewSourceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocument, setNewDocument] = useState({ content: '', source: '', metadata: {} });
  const [customSource, setCustomSource] = useState('');

  // --- Memoized Load Functions (Fixes useEffect dependencies) ---
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = { source: sourceFilter || undefined, searchText: searchText || undefined };
      const result = await getAllDocumentsUseCase.execute(filters, { page: currentPage, pageSize: 20 });
      setDocuments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [getAllDocumentsUseCase, sourceFilter, searchText, currentPage]);

  const loadAvailableSources = useCallback(async () => {
    try {
      const allDocs = await getAllDocumentsUseCase.execute({}, { page: 1, pageSize: 100 });
      const allSources = new Set<string>();
      allDocs.data.forEach(doc => doc.source.split(',').forEach(s => s.trim() && allSources.add(s.trim())));
      setAvailableSources(Array.from(allSources).sort((a, b) => a.localeCompare(b)));
    } catch (err) {
      logger.error('Failed to load sources', err);
    }
  }, [getAllDocumentsUseCase]);

  // --- Effects ---
  useEffect(() => { loadDocuments(); }, [loadDocuments]);
  useEffect(() => { loadAvailableSources(); }, [loadAvailableSources]);
  
  useEffect(() => {
    if (selectedDocument) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedDocument]);

  // --- Logic Handlers ---

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDocuments();
  };

  const handleDeleteRequest = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const doc = documents?.data.find(d => d.id === id);
    setConfirmDelete({ id, title: doc?.content.slice(0, 50) || id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDocumentUseCase.execute(confirmDelete.id, currentUser);
      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
      if (selectedDocument?.id === confirmDelete.id) setSelectedDocument(null);
      setConfirmDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete');
      setConfirmDelete(null);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleEditOpen = (doc: Document) => {
    setEditedContent(doc.content);
    setEditedSources(doc.source ? doc.source.split(',').map(s => s.trim()).filter(Boolean) : []);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedDocument) return;
    setIsSaving(true);
    try {
      const newSource = editedSources.join(', ') || 'manual';
      let safeMetadata = selectedDocument.metadata ? { ...selectedDocument.metadata } : {};
      safeMetadata.source = newSource;

      await updateDocumentUseCase.execute(selectedDocument.id, editedContent, currentUser, newSource, safeMetadata);
      
      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
      setSelectedDocument(null);
      setIsEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Update failed');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const finalSource = newDocument.source === '_custom_' ? customSource.trim() : newDocument.source;
    if (!newDocument.content.trim() || !finalSource) {
      setActionError('Content and Source are required');
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    setIsCreating(true);
    try {
      let safeMetadata = { ...newDocument.metadata, source: finalSource };
      await createDocumentUseCase.execute(newDocument.content, finalSource, safeMetadata, currentUser);
      setShowCreateModal(false);
      setNewDocument({ content: '', source: '', metadata: {} });
      setCustomSource('');
      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Create failed');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsCreating(false);
    }
  };

  // --- Tag Logic Helpers ---
  const handleAddTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = newSourceInput.trim();
      if (val && !editedSources.includes(val)) {
        setEditedSources([...editedSources, val]);
        setNewSourceInput('');
      }
    }
  };

  const handleManualAddTag = () => {
    const val = newSourceInput.trim();
    if (val && !editedSources.includes(val)) {
      setEditedSources([...editedSources, val]);
      setNewSourceInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedSources(prev => prev.filter(x => x !== tagToRemove));
  };

  // Handler para ver documento
  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsEditing(false);
  };
  // Handler para editar documento
  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    handleEditOpen(doc);
  };

  // --- Render ---

  if (error) return <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-400">{error}</div>;

  return (
    <div className="space-y-6">

      {/* Error Banner */}
      {actionError && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-sm text-red-400 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300 ml-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded" type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h4 className="text-lg font-bold text-default mb-2">Delete Document?</h4>
            <p className="text-sm text-muted mb-6">
              This will permanently delete &quot;{confirmDelete.title}...&quot;. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg" type="button">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 text-white rounded-lg" type="button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[var(--color-bg-alt)]/50 p-4 rounded-xl border border-[var(--color-border)]">
        <form onSubmit={handleSearch} className="w-full md:w-auto flex flex-col md:flex-row gap-3 flex-1 max-w-3xl">
          <div className="relative w-full md:w-48">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
               <Filter className="w-4 h-4" />
             </div>
             <label htmlFor="sourceFilter" className="sr-only">Filter by Source</label>
             <select
               id="sourceFilter"
               value={sourceFilter}
               onChange={(e) => setSourceFilter(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
             >
               <option value="">All Sources</option>
               {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          
          <div className="flex gap-2 w-full md:flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <Search className="w-4 h-4" />
              </div>
              <label htmlFor="searchInput" className="sr-only">Search Content</label>
              <input
                id="searchInput"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] text-[var(--color-on-accent)] rounded-lg transition-colors">
              Go
            </button>
          </div>
        </form>

        {currentUser.canPerform('create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-green-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        )}
      </div>

      {/* Content Display */}
      {isLoading && !documents ? (
        <div className="text-center py-20 text-muted animate-pulse" role="status" aria-live="polite">Loading knowledge base...</div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {documents?.data.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onView={() => handleViewDocument(doc)}
                onDelete={currentUser.canPerform('edit') ? (e) => handleDeleteRequest(doc.id, e) : undefined}
                canEdit={currentUser.canPerform('edit')}
              />
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            {documents?.data && (
              <DocumentTable
                documents={documents.data}
                onView={handleViewDocument}
                onEdit={handleEditDocument}
                onDelete={handleDeleteRequest}
                canEdit={currentUser.canPerform('edit')}
              />
            )}
          </div>

          {documents?.data.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 text-muted border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-alt)]/30">
               <Database className="w-12 h-12 mb-4 opacity-50" />
               <p>No documents found matching your criteria.</p>
             </div>
          )}
        </>
      )}

      {/* Pagination */}
      {documents && documents.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <span className="text-sm text-muted hidden sm:block">
            Page {currentPage} of {documents.totalPages}
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="sm:hidden text-sm text-muted flex items-center">{currentPage} / {documents.totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(documents.totalPages, p + 1))}
              disabled={currentPage === documents.totalPages}
              className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              type="button"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Cerrar modal"
            tabIndex={0}
            onClick={() => setSelectedDocument(null)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setSelectedDocument(null);
            }}
            style={{ cursor: 'pointer' }}
          />
          <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-[var(--color-border)] flex flex-col max-w-4xl shadow-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-default flex items-center gap-2">
                {isEditing ? 'Edit Document' : 'Document Details'}
              </h3>
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="p-2 hover:bg-[var(--color-surface)] rounded-lg text-muted hover:text-[var(--color-text)]"
                aria-label="Close modal"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
               {isEditing ? (
                 <div className="space-y-4">
                   <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                     <label htmlFor="edit-tags-input" className="text-xs font-medium text-muted uppercase mb-2 block">Sources</label>
                     <div className="flex flex-wrap gap-2 mb-2">
                       {editedSources.map(s => (
                         <SourceTag 
                            key={s} 
                            source={s} 
                            onRemove={() => handleRemoveTag(s)} 
                         />
                       ))}
                     </div>
                     <div className="flex gap-2">
                       {/* Dropdown for Sources using Datalist */}
                       <input 
                         id="edit-tags-input"
                         type="text" 
                         list="available-sources-list"
                         className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm text-default focus:ring-1 focus:ring-[var(--color-primary)]"
                         placeholder="Select or type tag..."
                         value={newSourceInput}
                         onChange={(e) => setNewSourceInput(e.target.value)}
                         onKeyDown={handleAddTagInputKeyDown}
                       />
                       <datalist id="available-sources-list">
                         {availableSources.map(source => (
                           <option key={source} value={source} />
                         ))}
                       </datalist>
                       
                       <button 
                         onClick={handleManualAddTag}
                         className="px-3 py-1 bg-[var(--color-surface)] text-default text-xs rounded hover:bg-[var(--color-border)]"
                         type="button"
                       >
                         Add
                       </button>
                     </div>
                   </div>
                   <label htmlFor="edit-content-area" className="sr-only">Document Content</label>
                   <textarea
                     id="edit-content-area"
                     value={editedContent}
                     onChange={(e) => setEditedContent(e.target.value)}
                     className="w-full h-[50vh] sm:h-[400px] bg-[var(--color-bg-alt)] text-default p-4 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                   />
                 </div>
               ) : (
                 <>
                   <div className="flex flex-wrap gap-2">
                     {selectedDocument.source.split(',').map(s => <SourceTag key={s} source={s} />)}
                   </div>
                   <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                     <pre className="text-sm text-default whitespace-pre-wrap font-mono leading-relaxed break-words">
                       {selectedDocument.content}
                     </pre>
                   </div>
                   <div className="text-xs text-muted pt-2 border-t border-[var(--color-border)]">
                      ID: {selectedDocument.id} • Created: {selectedDocument.createdAt.toLocaleString()}
                   </div>
                 </>
               )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 flex justify-end gap-3 sticky bottom-0">
               {isEditing ? (
                 <>
                   <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-4 py-2 text-default hover:text-[var(--color-text)]"
                      disabled={isSaving}
                      type="button"
                   >
                      Cancel
                   </button>
                    <button 
                       onClick={handleSave} 
                       disabled={isSaving} 
                       className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                       type="button"
                    >
                     {isSaving ? 'Saving...' : 'Save Changes'}
                   </button>
                 </>
               ) : (
                 <>
                   {currentUser.canPerform('update') && (
                     <button 
                        onClick={() => handleEditOpen(selectedDocument)} 
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)]"
                        type="button"
                     >
                       <Edit2 className="w-4 h-4" /> Edit
                     </button>
                   )}
                   <button 
                      onClick={() => setSelectedDocument(null)} 
                      className="px-4 py-2 bg-[var(--color-surface)] text-default rounded-lg hover:bg-[var(--color-border)]"
                      type="button"
                   >
                      Close
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer" onClick={() => setShowCreateModal(false)} />
           <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl border border-[var(--color-border)] flex flex-col max-w-4xl">
              <div className="flex justify-between p-5 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-default">New Document</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1" aria-label="Close modal" type="button"><X className="w-6 h-6"/></button>
              </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Source Selection */}
                <div>
                   <label htmlFor="create-source-select" className="block text-sm font-medium text-muted mb-2">Source</label>
                   <select
                      id="create-source-select"
                      value={newDocument.source}
                      onChange={(e) => setNewDocument({...newDocument, source: e.target.value})}
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default focus:ring-2 focus:ring-[var(--color-primary)]"
                   >
                      <option value="">Select Source</option>
                      {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="_custom_">+ Custom Source</option>
                   </select>
                   {newDocument.source === '_custom_' && (
                      <div className="mt-2">
                        <label htmlFor="custom-source-input" className="sr-only">Custom Source Name</label>
                        <input 
                          id="custom-source-input"
                          type="text" 
                          placeholder="Enter source name..." 
                          className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default"
                          value={customSource}
                          onChange={e => setCustomSource(e.target.value)}
                        />
                      </div>
                   )}
                </div>
                {/* Content Input */}
                <div>
                   <label htmlFor="create-content-area" className="block text-sm font-medium text-muted mb-2">Content</label>
                   <textarea
                      id="create-content-area"
                      className="w-full h-64 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-4 text-default font-mono text-sm focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Paste content here..."
                      value={newDocument.content}
                      onChange={e => setNewDocument({...newDocument, content: e.target.value})}
                   />
                </div>
             </div>
              <div className="p-5 border-t border-[var(--color-border)] flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg" type="button">Cancel</button>
                <button 
                  onClick={handleCreate} 
                  disabled={isCreating} 
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 text-white rounded-lg font-medium disabled:opacity-50"
                  type="button"
                >
                  {isCreating ? 'Creating...' : 'Create Document'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};