import { useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction } from 'react';

export interface UseFormAutoSaveOptions<T> {
  debounceMs?: number;
  enabled?: boolean;
  onRestored?: (restoredData: T) => void;
}

export interface UseFormAutoSaveReturn<T> {
  formData: T;
  setFormData: Dispatch<SetStateAction<T>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: (customValues?: T) => void;
  clearDraft: () => void;
  discardDraft: () => void;
  saveNow: () => void;
  hasSavedDraft: boolean;
  lastSavedTime: Date | null;
  isSaving: boolean;
}

/**
 * Custom React Hook that automatically persists form progress to localStorage,
 * preventing data loss on accidental page reloads, tab closure, or network drops.
 *
 * @param storageKey Unique key for storing the form state in localStorage
 * @param initialValues Default initial values of the form
 * @param options Configuration options (debounce delay, enabled flag, restored callback)
 */
export function useFormAutoSave<T extends Record<string, any>>(
  storageKey: string,
  initialValues: T,
  options: UseFormAutoSaveOptions<T> = {}
): UseFormAutoSaveReturn<T> {
  const { debounceMs = 500, enabled = true, onRestored } = options;

  const [formData, setFormData] = useState<T>(() => {
    if (!enabled) return initialValues;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...initialValues, ...parsed };
        }
      }
    } catch (e) {
      console.warn(`[useFormAutoSave] Error loading draft for "${storageKey}":`, e);
    }
    return initialValues;
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    if (!enabled) return false;
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  });

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    try {
      const timeStr = localStorage.getItem(`${storageKey}_timestamp`);
      return timeStr ? new Date(timeStr) : null;
    } catch {
      return null;
    }
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const initialValuesRef = useRef<T>(initialValues);

  // Update initialValuesRef when initialValues change
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  // Check and trigger onRestored on initial mount if draft existed
  useEffect(() => {
    if (enabled && hasSavedDraft && onRestored) {
      onRestored(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage with debounce
  useEffect(() => {
    if (!enabled) return;

    // Skip the very first mount execution to prevent immediately re-saving initial state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsSaving(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(formData));
        const now = new Date();
        localStorage.setItem(`${storageKey}_timestamp`, now.toISOString());
        setLastSavedTime(now);
        setHasSavedDraft(true);
      } catch (err) {
        console.error(`[useFormAutoSave] Failed to save draft for "${storageKey}":`, err);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, storageKey, debounceMs, enabled]);

  // Update a single field cleanly
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Clears draft from localStorage without resetting state
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      setHasSavedDraft(false);
      setLastSavedTime(null);
    } catch (err) {
      console.error(`[useFormAutoSave] Failed to clear draft for "${storageKey}":`, err);
    }
  }, [storageKey]);

  // Discards draft and resets form to initial state
  const discardDraft = useCallback(() => {
    clearDraft();
    setFormData(initialValuesRef.current);
  }, [clearDraft]);

  // Resets form state and clears draft storage
  const resetForm = useCallback(
    (customValues?: T) => {
      clearDraft();
      setFormData(customValues || initialValuesRef.current);
    },
    [clearDraft]
  );

  // Immediate save
  const saveNow = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      const now = new Date();
      localStorage.setItem(`${storageKey}_timestamp`, now.toISOString());
      setLastSavedTime(now);
      setHasSavedDraft(true);
      setIsSaving(false);
    } catch (err) {
      console.error(`[useFormAutoSave] Failed to force save draft:`, err);
    }
  }, [storageKey, formData]);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    clearDraft,
    discardDraft,
    saveNow,
    hasSavedDraft,
    lastSavedTime,
    isSaving
  };
}
