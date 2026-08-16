import { useState, useEffect } from 'react';
import { VaultSystemMetrics } from '../types/ingestion.types';
import { importManager } from '../services/ImportManager';

export function useKnowledgeVaultMetrics() {
  const [metrics, setMetrics] = useState<VaultSystemMetrics>(() => importManager.getVaultMetrics());

  useEffect(() => {
    const unsubscribe = importManager.subscribe((_, updatedMetrics) => {
      setMetrics(updatedMetrics);
    });
    return () => unsubscribe();
  }, []);

  return metrics;
}
