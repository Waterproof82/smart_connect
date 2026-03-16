import React, { useState, useEffect, useCallback, useRef } from 'react';
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
      setError(err instanceof Error ? err.message : 'Error al cargar documentos');
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
    const hasModal = selectedDocument || showCreateModal;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedDocument, showCreateModal]);

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
      setActionError(err instanceof Error ? err.message : 'Error al eliminar');
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
      setActionError(err instanceof Error ? err.message : 'Error al actualizar');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const finalSource = newDocument.source === '_custom_' ? customSource.trim() : newDocument.source;
    if (!newDocument.content.trim() || !finalSource) {
      setActionError('Contenido y Fuente son obligatorios');
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
      setActionError(err instanceof Error ? err.message : 'Error al crear');
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

  if (error) return <div className="p-4 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded text-[var(--color-error-text)]">{error}</div>;

  return (
    <div className="space-y-6">

      {/* Error Banner */}
      {actionError && (
        <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-sm text-[var(--color-error-text)] flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-[var(--color-error-text)] hover:text-white ml-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error-text)] rounded" type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirmar eliminación"
          aria-describedby="delete-dialog-desc"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setConfirmDelete(null);
            if (e.key === 'Tab') {
              const dialog = e.currentTarget.querySelector('[data-delete-dialog]') as HTMLElement;
              if (!dialog) return;
              const focusable = dialog.querySelectorAll<HTMLElement>('button');
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }}
        >
          <button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Cancelar eliminación" onClick={() => setConfirmDelete(null)} />
          <div data-delete-dialog className="relative bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-6 max-w-sm w-full shadow-2xl" ref={(el) => { if (el) { const btn = el.querySelector<HTMLElement>('button'); btn?.focus(); } }}>
            <h4 className="text-lg font-bold text-default mb-2">¿Eliminar Documento?</h4>
            <p id="delete-dialog-desc" className="text-sm text-muted mb-6">
              Se eliminará permanentemente &quot;{confirmDelete.title}...&quot;. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg" type="button">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-[var(--color-error-text)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error-text)] text-white rounded-lg" type="button">Eliminar</button>
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
             <label htmlFor="sourceFilter" className="sr-only">Filtrar por Fuente</label>
             <select
               id="sourceFilter"
               value={sourceFilter}
               onChange={(e) => setSourceFilter(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--focus-ring)] appearance-none"
             >
               <option value="">Todas las Fuentes</option>
               {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          
          <div className="flex gap-2 w-full md:flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <Search className="w-4 h-4" />
              </div>
              <label htmlFor="searchInput" className="sr-only">Buscar Contenido</label>
              <input
                id="searchInput"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar contenido..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-sm text-default focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] text-white rounded-lg transition-colors">
              Buscar
            </button>
          </div>
        </form>

        {currentUser.canPerform('create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-[var(--color-success-text)] hover:opacity-90 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Documento</span>
          </button>
        )}
      </div>

      {/* Content Display */}
      {isLoading && !documents ? (
        <div className="text-center py-20 text-muted animate-pulse" role="status" aria-live="polite">Cargando base de conocimiento...</div>
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
               <p>No se encontraron documentos con los criterios seleccionados.</p>
             </div>
          )}
        </>
      )}

      {/* Pagination */}
      {documents && documents.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <span className="text-sm text-muted hidden sm:block">
            Página {currentPage} de {documents.totalPages}
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="sm:hidden text-sm text-muted flex items-center">{currentPage} / {documents.totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(documents.totalPages, p + 1))}
              disabled={currentPage === documents.totalPages}
              className="px-4 py-2 bg-[var(--color-bg-alt)] text-default rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              type="button"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
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
          <div className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-xl sm:border border-[var(--color-border)] flex flex-col max-w-4xl shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/95 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-default flex items-center gap-2">
                {isEditing ? 'Editar Documento' : 'Detalles del Documento'}
              </h3>
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="p-2 hover:bg-[var(--color-surface)] rounded-lg text-muted hover:text-[var(--color-text)]"
                aria-label="Cerrar modal"
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
                     <label htmlFor="edit-tags-input" className="text-xs font-medium text-muted uppercase mb-2 block">Fuentes</label>
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
                         className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm text-default focus:ring-1 focus:ring-[var(--focus-ring)]"
                         placeholder="Seleccionar o escribir etiqueta..."
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
                         Agregar
                       </button>
                     </div>
                   </div>
                   <label htmlFor="edit-content-area" className="sr-only">Contenido del documento</label>
                   <textarea
                     id="edit-content-area"
                     value={editedContent}
                     onChange={(e) => setEditedContent(e.target.value)}
                     className="w-full h-[50vh] sm:h-[400px] bg-[var(--color-bg-alt)] text-default p-4 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-[var(--focus-ring)] outline-none"
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
                      ID: {selectedDocument.id} • Creado: {selectedDocument.createdAt.toLocaleString('es-AR')}
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
                      Cancelar
                   </button>
                   <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                      type="button"
                   >
                     {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
                       <Edit2 className="w-4 h-4" /> Editar
                     </button>
                   )}
                   <button 
                      onClick={() => setSelectedDocument(null)} 
                      className="px-4 py-2 bg-[var(--color-surface)] text-default rounded-lg hover:bg-[var(--color-border)]"
                      type="button"
                   >
                      Cerrar
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Crear nuevo documento"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowCreateModal(false);
            if (e.key === 'Tab') {
              const dialog = e.currentTarget.querySelector('[data-create-dialog]') as HTMLElement;
              if (!dialog) return;
              const focusable = dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }}
        >
          <button type="button" className="absolute inset-0 bg-black/90 backdrop-blur-sm" aria-label="Cerrar modal" onClick={() => setShowCreateModal(false)} />
           <div data-create-dialog className="relative bg-[var(--color-bg-alt)] w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl border border-[var(--color-border)] flex flex-col max-w-4xl" ref={(el) => { if (el) { const btn = el.querySelector<HTMLElement>('button, select, input'); btn?.focus(); } }}>
              <div className="flex justify-between p-5 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-default">Nuevo Documento</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg p-1" aria-label="Cerrar modal" type="button"><X className="w-6 h-6"/></button>
              </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Source Selection */}
                <div>
                   <label htmlFor="create-source-select" className="block text-sm font-medium text-muted mb-2">Fuente</label>
                   <select
                      id="create-source-select"
                      value={newDocument.source}
                      onChange={(e) => setNewDocument({...newDocument, source: e.target.value})}
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default focus:ring-2 focus:ring-[var(--focus-ring)]"
                   >
                      <option value="">Seleccionar Fuente</option>
                      {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="_custom_">+ Fuente Personalizada</option>
                   </select>
                   {newDocument.source === '_custom_' && (
                      <div className="mt-2">
                        <label htmlFor="custom-source-input" className="sr-only">Nombre de fuente personalizada</label>
                        <input 
                          id="custom-source-input"
                          type="text" 
                          placeholder="Nombre de la fuente..." 
                          className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-default"
                          value={customSource}
                          onChange={e => setCustomSource(e.target.value)}
                        />
                      </div>
                   )}
                </div>
                {/* Content Input */}
                <div>
                   <label htmlFor="create-content-area" className="block text-sm font-medium text-muted mb-2">Contenido</label>
                   <textarea
                      id="create-content-area"
                      className="w-full h-64 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-4 text-default font-mono text-sm focus:ring-2 focus:ring-[var(--focus-ring)]"
                      placeholder="Pegar contenido aquí..."
                      value={newDocument.content}
                      onChange={e => setNewDocument({...newDocument, content: e.target.value})}
                   />
                </div>
             </div>
              <div className="p-5 border-t border-[var(--color-border)] flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg" type="button">Cancelar</button>
                <button 
                  onClick={handleCreate} 
                  disabled={isCreating} 
                  className="px-5 py-2.5 bg-[var(--color-success-text)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-success-text)] text-white rounded-lg font-medium disabled:opacity-50"
                  type="button"
                >
                  {isCreating ? 'Creando...' : 'Crear Documento'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};