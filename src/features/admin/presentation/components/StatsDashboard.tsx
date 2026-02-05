/**
 * Stats Dashboard Component
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Dashboard con estadísticas del sistema RAG.
 */

import React, { useState, useEffect } from 'react';
import { GetDocumentStatsUseCase, DocumentStats } from '../../domain/usecases/GetDocumentStatsUseCase';

interface StatsDashboardProps {
  getStatsUseCase: GetDocumentStatsUseCase;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ getStatsUseCase }) => {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getStatsUseCase.execute();
        setStats(result);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Documents */}
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Documents</p>
            <p className="text-3xl font-bold text-white">{stats.totalDocuments}</p>
          </div>
          <div className="text-blue-400 text-4xl">📄</div>
        </div>
      </div>

      {/* By Source */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
        <p className="text-sm text-gray-400 mb-3">Documents by Source</p>
        <div className="space-y-2">
          {Object.entries(stats.bySource).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between text-sm">
              <span className="text-gray-300 capitalize">{source}</span>
              <span className="text-white font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
