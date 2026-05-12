/**
 * DocumentList Component
 * @module features/admin/presentation/components
 *
 * Clean Architecture: Presentation Layer
 * Follows SRP - delegates UI to specialized components
 */

import React, { useState, useEffect, useCallback } from "react";
import { Document } from "../../domain/entities/Document";
import { PaginatedResult } from "../../domain/repositories/IDocumentRepository";
import { X } from "lucide-react";
import { DocumentCard, DocumentTable } from "./document";
import { useAdmin } from "../AdminContext";
import { ConsoleLogger } from "@core/domain/usecases/Logger";

// Extracted components (SRP)
import DocumentFilters from "./DocumentFilters";
import DocumentPagination from "./DocumentPagination";
import DocumentEmptyState from "./DocumentEmptyState";
import DocumentViewModal from "./DocumentViewModal";
import DocumentCreateModal from "./DocumentCreateModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const logger = new ConsoleLogger("[DocumentList]");

interface DocumentListProps {
  onDocumentChange?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentChange,
}) => {
  const { container, currentUser } = useAdmin();
  const {
    getAllDocumentsUseCase,
    deleteDocumentUseCase,
    updateDocumentUseCase,
    createDocumentUseCase,
  } = container;

  // --- States ---
  const [documents, setDocuments] = useState<PaginatedResult<Document> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Editing & Selection
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedSources, setEditedSources] = useState<string[]>([]);
  const [newSourceInput, setNewSourceInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocument, setNewDocument] = useState({
    content: "",
    source: "",
    metadata: {},
  });
  const [customSource, setCustomSource] = useState("");

  // --- Memoized Load Functions ---
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        source: sourceFilter || undefined,
        searchText: searchText || undefined,
      };
      const result = await getAllDocumentsUseCase.execute(filters, {
        page: currentPage,
        pageSize: 20,
      });
      setDocuments(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los documentos",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getAllDocumentsUseCase, sourceFilter, searchText, currentPage]);

  const loadAvailableSources = useCallback(async () => {
    try {
      const allDocs = await getAllDocumentsUseCase.execute(
        {},
        { page: 1, pageSize: 100 },
      );
      const allSources = new Set<string>();
      allDocs.data.forEach((doc) =>
        doc.source
          .split(",")
          .forEach((s) => s.trim() && allSources.add(s.trim())),
      );
      setAvailableSources(
        Array.from(allSources).sort((a, b) => a.localeCompare(b)),
      );
    } catch (err) {
      logger.error("Failed to load sources", err);
    }
  }, [getAllDocumentsUseCase]);

  // --- Effects ---
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    loadAvailableSources();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (selectedDocument) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDocument]);

  // --- Handlers ---
  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDocuments();
  };

  const handleDeleteRequest = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const doc = documents?.data.find((d) => d.id === id);
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
      setActionError(
        err instanceof Error ? err.message : "Error al eliminar el documento",
      );
      setConfirmDelete(null);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleEditOpen = (doc: Document) => {
    setEditedContent(doc.content);
    setEditedSources(
      doc.source
        ? doc.source
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    );
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedDocument) return;
    setIsSaving(true);
    try {
      const newSource = editedSources.join(", ") || "manual";
      const safeMetadata = selectedDocument.metadata
        ? { ...selectedDocument.metadata }
        : {};
      safeMetadata.source = newSource;

      await updateDocumentUseCase.execute(
        selectedDocument.id,
        editedContent,
        currentUser,
        newSource,
        safeMetadata,
      );

      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
      setSelectedDocument(null);
      setIsEditing(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Error al guardar los cambios",
      );
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const finalSource =
      newDocument.source === "_custom_"
        ? customSource.trim()
        : newDocument.source;
    if (!newDocument.content.trim() || !finalSource) {
      setActionError("El contenido y la fuente son obligatorios");
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    setIsCreating(true);
    try {
      const safeMetadata = { ...newDocument.metadata, source: finalSource };
      await createDocumentUseCase.execute(
        newDocument.content,
        finalSource,
        safeMetadata,
        currentUser,
      );
      setShowCreateModal(false);
      setNewDocument({ content: "", source: "", metadata: {} });
      setCustomSource("");
      await loadDocuments();
      await loadAvailableSources();
      onDocumentChange?.();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Error al crear el documento",
      );
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsCreating(false);
    }
  };

  // --- Tag Logic ---
  const handleAddTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = newSourceInput.trim();
      if (val && !editedSources.includes(val)) {
        setEditedSources([...editedSources, val]);
        setNewSourceInput("");
      }
    }
  };

  const handleManualAddTag = () => {
    const val = newSourceInput.trim();
    if (val && !editedSources.includes(val)) {
      setEditedSources([...editedSources, val]);
      setNewSourceInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedSources((prev) => prev.filter((x) => x !== tagToRemove));
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsEditing(false);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    handleEditOpen(doc);
  };

  // --- Render ---
  if (error) {
    return (
      <div className="p-4 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-[var(--color-error-text)]">
        <p>No se pudieron cargar los documentos. Intenta de nuevo.</p>
      </div>
    );
  }

  const canEdit = currentUser.canPerform("edit");
  const canCreate = currentUser.canPerform("create");

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {actionError && (
        <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-sm text-[var(--color-error-text)] flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-[var(--color-error-text)] hover:opacity-70 ml-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error-text)] rounded"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={!!confirmDelete}
        title={confirmDelete?.title || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Filters */}
      <DocumentFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        availableSources={availableSources}
        onSearch={handleSearch}
        onCreateClick={() => setShowCreateModal(true)}
        canCreate={canCreate}
      />

      {/* Content Display */}
      {isLoading && !documents ? (
        <div
          className="text-center py-20 text-muted animate-pulse"
          role="status"
          aria-live="polite"
        >
          Cargando base de conocimiento...
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {documents?.data.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onView={() => handleViewDocument(doc)}
                onDelete={
                  canEdit ? (e) => handleDeleteRequest(doc.id, e) : undefined
                }
                canEdit={canEdit}
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
                canEdit={canEdit}
              />
            )}
          </div>

          {documents?.data.length === 0 && <DocumentEmptyState />}
        </>
      )}

      {/* Pagination */}
      <DocumentPagination
        currentPage={currentPage}
        totalPages={documents?.totalPages || 1}
        onPageChange={setCurrentPage}
      />

      {/* View/Edit Modal */}
      <DocumentViewModal
        document={selectedDocument}
        isEditing={isEditing}
        editedContent={editedContent}
        editedSources={editedSources}
        newSourceInput={newSourceInput}
        availableSources={availableSources}
        isSaving={isSaving}
        canEdit={canEdit}
        onClose={() => setSelectedDocument(null)}
        onEditOpen={handleEditOpen}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onContentChange={setEditedContent}
        onSourceInputChange={setNewSourceInput}
        onAddTag={handleManualAddTag}
        onRemoveTag={handleRemoveTag}
        onKeyDown={handleAddTagInputKeyDown}
      />

      {/* Create Modal */}
      <DocumentCreateModal
        isOpen={showCreateModal}
        availableSources={availableSources}
        newDocument={newDocument}
        customSource={customSource}
        isCreating={isCreating}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        onDocumentChange={setNewDocument}
        onCustomSourceChange={setCustomSource}
      />
    </div>
  );
};

export default DocumentList;
