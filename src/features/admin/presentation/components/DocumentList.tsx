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
import { AdminUser } from '../../domain/entities/AdminUser';
import { PaginatedResult } from '../../domain/repositories/IDocumentRepository';

interface DocumentListProps {
  getAllDocumentsUseCase: GetAllDocumentsUseCase;
  deleteDocumentUseCase: DeleteDocumentUseCase;
  currentUser: AdminUser;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  getAllDocumentsUseCase,
  deleteDocumentUseCase,
  currentUser,
}) => {
  const [documents, setDocuments] = useState<PaginatedResult<Document> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const loadDocuments = async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sourceFilter]);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocumentUseCase.execute(documentId, currentUser);
      await loadDocuments(); // Reload list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document');
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
                <option value="qribar_product">QRIBAR Product</option>
                <option value="nfc_reviews_product">NFC Reviews Product</option>
                <option value="automation_product">Automation Product</option>
                <option value="company_philosophy">Company Philosophy</option>
                <option value="contact_info">Contact Info</option>
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
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Embedding
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
              <tr key={doc.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                  {doc.getContentPreview(100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                    {doc.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {doc.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {doc.hasEmbedding() ? (
                    <span className="text-green-400">✓ Yes</span>
                  ) : (
                    <span className="text-yellow-400">✗ No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {doc.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {currentUser.canPerform('delete') && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-400 hover:text-red-300 focus:outline-none"
                    >
                      Delete
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
    </div>
  );
};
