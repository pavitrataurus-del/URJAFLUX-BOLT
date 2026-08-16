import { useState, useEffect, useCallback } from 'react';
import { IngestionQueueItem, VaultSystemMetrics, FileValidationResult } from '../types/ingestion.types';
import { importManager } from '../services/ImportManager';

export function useKnowledgeIngestionQueue() {
  const [queue, setQueue] = useState<readonly IngestionQueueItem[]>(() => importManager.getQueue());
  const [metrics, setMetrics] = useState<VaultSystemMetrics>(() => importManager.getVaultMetrics());

  useEffect(() => {
    const unsubscribe = importManager.subscribe((updatedQueue, updatedMetrics) => {
      setQueue(updatedQueue);
      setMetrics(updatedMetrics);
    });
    return () => unsubscribe();
  }, []);

  const uploadFiles = useCallback((files: FileList | File[]) => {
    return importManager.addFilesToQueue(files);
  }, []);

  const pauseQueue = useCallback(() => {
    importManager.pauseQueue();
  }, []);

  const resumeQueue = useCallback(() => {
    importManager.resumeQueue();
  }, []);

  const cancelItem = useCallback((itemId: string) => {
    importManager.cancelItem(itemId);
  }, []);

  const retryItem = useCallback((itemId: string) => {
    importManager.retryItem(itemId);
  }, []);

  const clearCompleted = useCallback(() => {
    importManager.clearCompleted();
  }, []);

  return {
    queue,
    metrics,
    uploadFiles,
    pauseQueue,
    resumeQueue,
    cancelItem,
    retryItem,
    clearCompleted
  };
}
