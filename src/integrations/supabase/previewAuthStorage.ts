/**
 * Auth storage implementation using browser localStorage
 */
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  
  return {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
  };
}
