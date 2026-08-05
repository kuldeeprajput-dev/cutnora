import { useEffect } from 'react';
import { COMMAND_REGISTRY } from './command-registry';

export function useKeyboardShortcuts(onOpenHelpModal?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Skip shortcuts when user is typing in interactive form elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        const isEditable =
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable ||
          target.closest('[contenteditable="true"]') !== null ||
          target.closest('.editing-inline') !== null;

        if (isEditable) return;
      }

      // 2. Normalize pressed key combination
      const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      for (const cmd of COMMAND_REGISTRY) {
        if (cmd.isEnabled && !cmd.isEnabled()) continue;

        if (matchesShortcut(e, cmd.shortcut, modKey)) {
          e.preventDefault();
          if (cmd.id === 'help.shortcuts' && onOpenHelpModal) {
            onOpenHelpModal();
          } else {
            cmd.execute();
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenHelpModal]);
}

function matchesShortcut(e: KeyboardEvent, shortcutStr: string, modKey: boolean): boolean {
  const parts = shortcutStr.split('+');
  const hasMod = parts.includes('Mod');
  const hasShift = parts.includes('Shift');
  const hasAlt = parts.includes('Alt');
  const keyPart = parts[parts.length - 1];

  if (hasMod && !modKey) return false;
  if (!hasMod && (e.ctrlKey || e.metaKey)) return false;
  if (hasShift && !e.shiftKey) return false;
  if (!hasShift && e.shiftKey && keyPart !== '?' && keyPart !== 'Plus') return false;
  if (hasAlt && !e.altKey) return false;

  const key = e.key;

  switch (keyPart) {
    case 'Space':
      return key === ' ' || key === 'Spacebar';
    case 'ArrowLeft':
      return key === 'ArrowLeft';
    case 'ArrowRight':
      return key === 'ArrowRight';
    case 'Home':
      return key === 'Home';
    case 'End':
      return key === 'End';
    case 'Delete':
      return key === 'Delete' || key === 'Backspace';
    case 'Escape':
      return key === 'Escape';
    case 'Plus':
      return key === '+' || key === '=';
    case 'Minus':
      return key === '-' || key === '_';
    case '?':
      return key === '?';
    default:
      return key.toLowerCase() === keyPart.toLowerCase();
  }
}
