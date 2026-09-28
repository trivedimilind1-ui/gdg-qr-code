import { useState, useEffect, useCallback } from 'react';

/**
 * Robust typed hook for interacting with window.localStorage with safety guards.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Read initial value safely
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((current) => {
          const newValue = value instanceof Function ? value(current) : value;

          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(key, JSON.stringify(newValue));
              // Dispatch storage event so other tabs or listeners sync
              window.dispatchEvent(new StorageEvent('storage', { key }));
            } catch (storageError) {
              console.warn(`LocalStorage quota exceeded or unavailable for "${key}":`, storageError);
            }
          }

          return newValue;
        });
      } catch (error) {
        console.warn(`Error setting state for "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue]);

  return [storedValue, setValue];
}
