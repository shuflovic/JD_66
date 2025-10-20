import { useState, useEffect, useCallback, useRef } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Use a ref to track if this is the initial mount
  const initialMount = useRef(true);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Use callback to avoid re-creating the function on every render
  const setValue = useCallback((value: React.SetStateAction<T>) => {
    try {
      setStoredValue(prevValue => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key]);

  // Sync with localStorage on mount (after initial render)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage;
