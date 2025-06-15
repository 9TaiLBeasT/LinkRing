import { useCallback, useRef, useEffect } from "react";

// Debounce hook for performance optimization
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay],
  );
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const lastRun = useRef(Date.now());
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [delay],
  );
}

// Cache utility for API responses
class SimpleCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();

// Error boundary utility
export class ErrorBoundary extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "ErrorBoundary";
  }
}

// Retry utility for failed requests
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries) break;

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i)),
      );
    }
  }

  throw new ErrorBoundary(`Failed after ${maxRetries} retries`, lastError!);
}

// Optimistic update utility
export function createOptimisticUpdate<T>(
  currentData: T[],
  newItem: T,
  idField: keyof T = "id" as keyof T,
) {
  return [newItem, ...currentData];
}

export function removeOptimisticUpdate<T>(
  currentData: T[],
  itemId: any,
  idField: keyof T = "id" as keyof T,
) {
  return currentData.filter((item) => item[idField] !== itemId);
}

// Connection status hook
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Import React for useState
import { useState } from "react";
