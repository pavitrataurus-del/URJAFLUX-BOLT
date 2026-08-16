import { useState, useEffect } from 'react';
import { commandHistoryManager, CommandHistoryEntry } from './CommandHistoryManager';

export function useCommandHistory() {
  const [undoCount, setUndoCount] = useState<number>(commandHistoryManager.getUndoCount());
  const [redoCount, setRedoCount] = useState<number>(commandHistoryManager.getRedoCount());
  const [historyList, setHistoryList] = useState<CommandHistoryEntry[]>(commandHistoryManager.getHistoryList());
  const [redoList, setRedoList] = useState<CommandHistoryEntry[]>(commandHistoryManager.getRedoList());
  const [isTransactionActive, setIsTransactionActive] = useState<boolean>(commandHistoryManager.isTransactionActive());
  const [activeTransactionName, setActiveTransactionName] = useState<string | null>(commandHistoryManager.getActiveTransactionName());

  useEffect(() => {
    const unsubscribe = commandHistoryManager.subscribe(() => {
      setUndoCount(commandHistoryManager.getUndoCount());
      setRedoCount(commandHistoryManager.getRedoCount());
      setHistoryList(commandHistoryManager.getHistoryList());
      setRedoList(commandHistoryManager.getRedoList());
      setIsTransactionActive(commandHistoryManager.isTransactionActive());
      setActiveTransactionName(commandHistoryManager.getActiveTransactionName());
    });

    return () => unsubscribe();
  }, []);

  return {
    undoCount,
    redoCount,
    historyList,
    redoList,
    canUndo: undoCount > 0,
    canRedo: redoCount > 0,
    isTransactionActive,
    activeTransactionName,
    undo: (context?: any) => commandHistoryManager.undo(context),
    redo: (context?: any) => commandHistoryManager.redo(context),
    selectiveUndo: (commandId: string, context?: any) => commandHistoryManager.selectiveUndo(commandId, context),
    beginTransaction: (name: string) => commandHistoryManager.beginTransaction(name),
    commitTransaction: (context?: any) => commandHistoryManager.commitTransaction(context),
    rollbackTransaction: (context?: any) => commandHistoryManager.rollbackTransaction(context),
    clearHistory: () => commandHistoryManager.clearHistory(),
  };
}
