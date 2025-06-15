import { useState, useCallback } from "react";

interface OptimisticState<T> {
  data: T[];
  pending: Set<string>;
  errors: Map<string, string>;
}

export function useOptimisticUpdates<T extends { id: string }>(
  initialData: T[] = [],
) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    pending: new Set(),
    errors: new Map(),
  });

  const addOptimistic = useCallback((item: T) => {
    setState((prev) => ({
      ...prev,
      data: [item, ...prev.data],
      pending: new Set([...prev.pending, item.id]),
      errors: new Map([...prev.errors].filter(([id]) => id !== item.id)),
    }));
  }, []);

  const confirmOptimistic = useCallback((tempId: string, realItem: T) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.map((item) => (item.id === tempId ? realItem : item)),
      pending: new Set([...prev.pending].filter((id) => id !== tempId)),
    }));
  }, []);

  const revertOptimistic = useCallback((id: string, error?: string) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((item) => item.id !== id),
      pending: new Set(
        [...prev.pending].filter((pendingId) => pendingId !== id),
      ),
      errors: error ? new Map([...prev.errors, [id, error]]) : prev.errors,
    }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((item) => item.id !== id),
      pending: new Set(
        [...prev.pending].filter((pendingId) => pendingId !== id),
      ),
      errors: new Map([...prev.errors].filter(([errorId]) => errorId !== id)),
    }));
  }, []);

  const setData = useCallback((data: T[]) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: new Map(),
    }));
  }, []);

  return {
    data: state.data,
    pending: state.pending,
    errors: state.errors,
    addOptimistic,
    confirmOptimistic,
    revertOptimistic,
    updateItem,
    removeItem,
    setData,
    clearErrors,
    isPending: (id: string) => state.pending.has(id),
    getError: (id: string) => state.errors.get(id),
  };
}
