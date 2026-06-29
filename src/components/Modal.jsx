// Accessible modal shell: portal + focus trap + Esc + backdrop close +
// background scroll lock + focus restore. Presentation only — the caller
// supplies the dialog contents and wires aria-labelledby via `titleId`.
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function Modal({ titleId, onClose, children }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    previouslyFocused.current = document.activeElement;

    // Move focus into the dialog (first control, else the dialog itself).
    const focusables = dialog.querySelectorAll(FOCUSABLE);
    (focusables[0] ?? dialog).focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Trap focus within the dialog.
      const items = dialog.querySelectorAll(FOCUSABLE);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Lock background scroll while open, reserving the scrollbar's width so
    // hiding overflow doesn't reflow the page sideways. Modern engines handle
    // this via `scrollbar-gutter: stable` (see index.css); this is the
    // cross-browser fallback for engines without it.
    //
    // We measure the width the lock actually reclaims (clientWidth before vs.
    // after hiding overflow) rather than innerWidth - clientWidth: with a
    // stable gutter the latter reports the gutter width even when no scrollbar
    // is visible, which would over-pad. The delta is 0 when the gutter is
    // stable and equals the scrollbar width otherwise.
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const widthBefore = document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    const scrollbarWidth = document.documentElement.clientWidth - widthBefore;
    if (scrollbarWidth > 0) {
      const currentPadding =
        parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      // Return focus to whatever opened the dialog (the card).
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      // mousedown (not click) so a drag that ends outside doesn't close it
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
