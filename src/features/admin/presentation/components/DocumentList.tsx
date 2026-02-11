import React, { useState, useEffect, useCallback } from 'react';
import { Document } from '../../domain/entities/Document';
import { GetAllDocumentsUseCase } from '../../domain/usecases/GetAllDocumentsUseCase';
import { DeleteDocumentUseCase } from '../../domain/usecases/DeleteDocumentUseCase';
import { UpdateDocumentUseCase } from '../../domain/usecases/UpdateDocumentUseCase';
import { CreateDocumentUseCase } from '../../domain/usecases/CreateDocumentUseCase';
import { AdminUser } from '../../domain/entities/AdminUser';
import { PaginatedResult } from '../../domain/repositories/IDocumentRepository';
import { Trash2, Edit2, Search, Filter, Plus, X, Calendar, Database, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Utility: Color Generator ---
const getSourceColor = (source: string): string => {
  let hash = 5381;
  for (let i = 0; i < source.length; i++) {
    const code = source.codePointAt(i) ?? 0;
    hash = ((hash << 5) + hash) + code;
  }
  const hue = (hash % 360 + 360) % 360;
  const sat = 65 + ((hash >> 8) % 15);
  const light = 50 + ((hash >> 16) % 10);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

// --- Sub-Component: Source Tag ---
const SourceTag: React.FC<{ source: string; onRemove?: () => void }> = ({ source, onRemove }) => {
  const trimmed = source.trim();
  const color = getSourceColor(trimmed);
  return (
    <span 
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1 mb-1"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      {trimmed}
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:text-white focus:outline-none cursor-pointer"
          type="button"
          aria-label={`Remove tag ${trimmed}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
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
      console.error('Failed to load sources', err);
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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocumentUseCase.execute(id, currentUser);
      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
      if (selectedDocument?.id === id) setSelectedDocument(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
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
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const finalSource = newDocument.source === '_custom_' ? customSource.trim() : newDocument.source;
    if (!newDocument.content.trim() || !finalSource) return alert('Content and Source are required');

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
      alert(err instanceof Error ? err.message : 'Create failed');
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

  // Helper to render Mobile Card (reduces nesting)
  const renderMobileCard = (doc: Document) => (
    <div 
      key={doc.id} 
      className="relative bg-gray-900 border border-gray-800 rounded-xl p-4 active:scale-[0.99] transition-transform outline-none focus:ring-2 focus:ring-blue-500"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="View details"
        onClick={() => { setSelectedDocument(doc); setIsEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedDocument(doc);
            setIsEditing(false);
          }
        }}
        tabIndex={0}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {doc.source.split(',').slice(0, 2).map(s => <SourceTag key={s} source={s} />)}
          {doc.source.split(',').length > 2 && <span className="text-xs text-gray-500 self-center">+more</span>}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
          <Calendar className="w-3 h-3" />
          {doc.createdAt.toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
        {doc.content}
      </p>

      <div className="flex justify-between items-center border-t border-gray-800 pt-3 mt-2">
         <span className="text-xs text-blue-400 font-medium">Tap to view details</span>
         {currentUser.canPerform('edit') && (
           <button 
             onClick={(e) => handleDelete(doc.id, e)}
             className="p-2 text-red-400 bg-red-900/10 rounded-lg hover:bg-red-900/30 z-10"
             aria-label="Delete document"
             type="button"
           >
             <Trash2 className="w-4 h-4" />
           </button>
         )}
      </div>
    </div>
  );

  // --- Render ---

  if (error) return <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <form onSubmit={handleSearch} className="w-full md:w-auto flex flex-col md:flex-row gap-3 flex-1 max-w-3xl">
          <div className="relative w-full md:w-48">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
               <Filter className="w-4 h-4" />
             </div>
             <label htmlFor="sourceFilter" className="sr-only">Filter by Source</label>
             <select
               id="sourceFilter"
               value={sourceFilter}
               onChange={(e) => setSourceFilter(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 appearance-none"
             >
               <option value="">All Sources</option>
               {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          
          <div className="flex gap-2 w-full md:flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <label htmlFor="searchInput" className="sr-only">Search Content</label>
              <input
                id="searchInput"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading knowledge base...</div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {documents?.data.map(renderMobileCard)}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Content Preview</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {documents?.data.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                      <button 
                        onClick={() => { setSelectedDocument(doc); setIsEditing(false); }} 
                        className="text-left hover:text-blue-400 transition-colors line-clamp-2 w-full"
                      >
                        {doc.getContentPreview(120)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {doc.source.split(',').map(s => <SourceTag key={s} source={s} />)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedDocument(doc); handleEditOpen(doc); }} 
                          className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded" 
                          aria-label="Edit document"
                          type="button"
                        >
                           <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser.canPerform('edit') && (
                          <button 
                            onClick={(e) => handleDelete(doc.id, e)} 
                            className="p-1.5 text-red-400 hover:bg-red-900/30 rounded" 
                            aria-label="Delete document"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {documents?.data.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
               <Database className="w-12 h-12 mb-4 opacity-50" />
               <p>No documents found matching your criteria.</p>
             </div>
          )}
        </>
      )}

      {/* Pagination */}
      {documents && documents.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <span className="text-sm text-gray-500 hidden sm:block">
            Page {currentPage} of {documents.totalPages}
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="sm:hidden text-sm text-gray-400 flex items-center">{currentPage} / {documents.totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(documents.totalPages, p + 1))}
              disabled={currentPage === documents.totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
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
          <div className="relative bg-gray-900 w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-gray-800 flex flex-col max-w-4xl shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {isEditing ? 'Edit Document' : 'Document Details'}
              </h3>
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white" 
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
                   <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                     <label htmlFor="edit-tags-input" className="text-xs font-medium text-gray-400 uppercase mb-2 block">Sources</label>
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
                         className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500"
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
                         className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
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
                     className="w-full h-[50vh] sm:h-[400px] bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                 </div>
               ) : (
                 <>
                   <div className="flex flex-wrap gap-2">
                     {selectedDocument.source.split(',').map(s => <SourceTag key={s} source={s} />)}
                   </div>
                   <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800">
                     <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed break-words">
                       {selectedDocument.content}
                     </pre>
                   </div>
                   <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                      ID: {selectedDocument.id} • Created: {selectedDocument.createdAt.toLocaleString()}
                   </div>
                 </>
               )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/95 flex justify-end gap-3 sticky bottom-0">
               {isEditing ? (
                 <>
                   <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-4 py-2 text-gray-300 hover:text-white" 
                      disabled={isSaving}
                      type="button"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
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
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                        type="button"
                     >
                       <Edit2 className="w-4 h-4" /> Edit
                     </button>
                   )}
                   <button 
                      onClick={() => setSelectedDocument(null)} 
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative bg-gray-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl border border-gray-800 flex flex-col max-w-4xl">
             <div className="flex justify-between p-5 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">New Document</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white" aria-label="Close modal" type="button"><X className="w-6 h-6"/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Source Selection */}
                <div>
                   <label htmlFor="create-source-select" className="block text-sm font-medium text-gray-400 mb-2">Source</label>
                   <select 
                      id="create-source-select"
                      value={newDocument.source}
                      onChange={(e) => setNewDocument({...newDocument, source: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
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
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                          value={customSource}
                          onChange={e => setCustomSource(e.target.value)}
                        />
                      </div>
                   )}
                </div>
                {/* Content Input */}
                <div>
                   <label htmlFor="create-content-area" className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                   <textarea 
                      id="create-content-area"
                      className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste content here..."
                      value={newDocument.content}
                      onChange={e => setNewDocument({...newDocument, content: e.target.value})}
                   />
                </div>
             </div>
             <div className="p-5 border-t border-gray-800 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-gray-300 hover:bg-gray-800 rounded-lg" type="button">Cancel</button>
                <button 
                  onClick={handleCreate} 
                  disabled={isCreating} 
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
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