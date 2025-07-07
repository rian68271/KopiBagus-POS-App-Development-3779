import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, altKey, shiftKey } = event;
      
      for (const shortcut of shortcuts) {
        const matches = 
          shortcut.key === key &&
          !!shortcut.ctrl === ctrlKey &&
          !!shortcut.alt === altKey &&
          !!shortcut.shift === shiftKey;
        
        if (matches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};