/**
 * Stats Dashboard Component
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Dashboard con estadísticas del sistema RAG.
 */

import React, { useState, useEffect } from 'react';
import { GetDocumentStatsUseCase, DocumentStats } from '../../domain/usecases/GetDocumentStatsUseCase';
import { FileText } from 'lucide-react';
import { ConsoleLogger } from '@core/domain/usecases/Logger';

const logger = new ConsoleLogger('[StatsDashboard]');

interface StatsDashboardProps {
  getStatsUseCase: GetDocumentStatsUseCase;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = React.memo(({ getStatsUseCase }) => {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getStatsUseCase.execute();
        setStats(result);
      } catch (err) {
        logger.error('Failed to load stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" role="status" aria-live="polite">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 animate-pulse">
            <div className="h-4 w-24 bg-[var(--color-border)] rounded mb-3" />
            <div className="h-8 w-16 bg-[var(--color-border)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Documents */}
      <div className="bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1">Total Documentos</p>
            <p className="text-3xl font-bold text-default">{stats.totalDocuments}</p>
          </div>
          <div className="text-[var(--color-icon-blue)]" aria-hidden="true">
            <FileText className="w-9 h-9" />
          </div>
        </div>
      </div>

      {/* By Source */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
        <p className="text-sm text-muted mb-3">Documentos por Fuente</p>
        <div className="space-y-2">
          {Object.entries(stats.bySource)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => (
              <div key={source} className="flex items-center justify-between text-sm">
                <span className="text-default capitalize">{source}</span>
                <span className="text-default font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});
StatsDashboard.displayName = 'StatsDashboard';
