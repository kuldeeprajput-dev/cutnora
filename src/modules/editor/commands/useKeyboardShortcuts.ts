import { useEffect } from 'react';
import { COMMAND_REGISTRY } from './command-registry';

export function useKeyboardShortcuts(onOpenHelpModal?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Fullscreen preview owns playback keys and must not run editing commands.
      if (document.getElementById('stage-fullscreen-container')?.dataset.fullscreen === 'true') return;
      // 1. Skip shortcuts when user is typing in interactive form elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        // Only block if the element is an actual text-entry field
        const isTextEntry =
          (tagName === 'input' && (target as HTMLInputElement).type !== 'range' && (target as HTMLInputElement).type !== 'checkbox' && (target as HTMLInputElement).type !== 'radio') ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable ||
          target.closest('[contenteditable="true"]') !== null ||
          target.closest('.editing-inline') !== null;

        if (isTextEntry) return;
        // Preserve native button activation, including the inspector docking toggle.
        if (target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      }

      // 2. Normalize pressed key combination
      const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      for (const cmd of COMMAND_REGISTRY) {
        if (cmd.isEnabled && !cmd.isEnabled()) continue;

        if (matchesShortcut(e, cmd.shortcut, modKey)) {
          // Prevent browser default (scroll on Space/arrows, button click on Space, etc.)
          e.preventDefault();
          // Stop propagation so no other listener re-handles this key
          e.stopPropagation();
          if (cmd.id === 'help.shortcuts' && onOpenHelpModal) {
            onOpenHelpModal();
          } else {
            cmd.execute();
          }
          break;
        }
      }
    };

    // Use capture phase so we intercept Space/Arrow keys BEFORE the browser
    // scrolls the page or activates a focused button/link.
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onOpenHelpModal]);
}

function matchesShortcut(e: KeyboardEvent, shortcutStr: string, modKey: boolean): boolean {
  const parts = shortcutStr.split('+');
  const hasMod = parts.includes('Mod');
  const hasShift = parts.includes('Shift');
  const hasAlt = parts.includes('Alt');
  const keyPart = parts[parts.length - 1];

  // Modifiers check
  if (hasMod && !modKey) return false;
  if (!hasMod && (e.ctrlKey || e.metaKey)) return false;
  if (hasAlt && !e.altKey) return false;
  if (!hasAlt && e.altKey) return false;

  const key = e.key;

  // Zoom In: matches Shift + +, Shift + =, or direct + / = / numpad
  if (shortcutStr === 'Shift+Plus') {
    return (
      !modKey &&
      !e.altKey &&
      (key === '+' || key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd')
    );
  }

  // Zoom Out: matches Shift + -, or direct - / _ / numpad
  if (shortcutStr === 'Shift+Minus') {
    return (
      !modKey &&
      !e.altKey &&
      (key === '-' || key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract')
    );
  }

  if (hasShift && !e.shiftKey) return false;
  if (!hasShift && e.shiftKey && keyPart !== '?' && keyPart !== 'Plus') return false;

  switch (keyPart) {
    case 'Space':
      return key === ' ' || key === 'Spacebar';
    case 'ArrowLeft':
      return key === 'ArrowLeft';
    case 'ArrowRight':
      return key === 'ArrowRight';
    case 'ArrowUp':
      return key === 'ArrowUp';
    case 'ArrowDown':
      return key === 'ArrowDown';
    case 'Home':
      return key === 'Home';
    case 'End':
      return key === 'End';
    case 'Delete':
      return key === 'Delete' || key === 'Backspace';
    case 'Escape':
      return key === 'Escape';
    case '[':
      return key === '[';
    case ']':
      return key === ']';
    case 'Plus':
      return key === '+' || key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd';
    case 'Minus':
      return key === '-' || key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract';
    case '?':
      return key === '?';
    default:
      // e.key for digits with Shift held gives symbols (!, @, #…) — fall back to e.code
      if (/^\d$/.test(keyPart)) {
        return e.code === `Digit${keyPart}`;
      }
      return key.toLowerCase() === keyPart.toLowerCase();
  }
}
