import { useState, useCallback } from "react";

export interface SelectionState {
  selectedId: string | null;
  hoveredId: string | null;
  isEditing: boolean;
}

export function useSelectionEngine() {
  const [selection, setSelection] = useState<SelectionState>({
    selectedId: null,
    hoveredId: null,
    isEditing: false
  });

  const select = useCallback((id: string | null) => {
    setSelection(prev => ({ ...prev, selectedId: id }));
  }, []);

  const hover = useCallback((id: string | null) => {
    setSelection(prev => ({ ...prev, hoveredId: id }));
  }, []);

  const setEditing = useCallback((isEditing: boolean) => {
    setSelection(prev => ({ ...prev, isEditing }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ selectedId: null, hoveredId: null, isEditing: false });
  }, []);

  return {
    selection,
    select,
    hover,
    setEditing,
    clearSelection
  };
}
