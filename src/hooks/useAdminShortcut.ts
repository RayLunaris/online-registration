import { useEffect } from 'react';
import { ADMIN_AUTH_CONFIG } from '@/config/authConfig';

interface UseAdminShortcutOptions {
  onTrigger: () => void;
  enabled?: boolean;
}

/**
 * Hook to trigger hidden admin portal actions via keyboard shortcut.
 * Default: Ctrl + Shift + A (Windows/Linux) or Cmd + Shift + A (Mac)
 */
export const useAdminShortcut = ({ onTrigger, enabled = true }: UseAdminShortcutOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is actively typing inside an input field
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isInput) return;

      // Allow shortcut if Ctrl/Cmd + Shift are pressed together with the configured key
      const isModifierActive = (event.ctrlKey || event.metaKey) && event.shiftKey;
      const matchesKey = event.key.toLowerCase() === ADMIN_AUTH_CONFIG.shortcutKey.toLowerCase();

      if (isModifierActive && matchesKey) {
        // Prevent default browser behavior if needed
        event.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTrigger, enabled]);
};
