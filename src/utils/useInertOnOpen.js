import { useEffect } from 'react';

// modalRef: ref to the modal container (the element to focus)
// open: boolean whether modal is open
export default function useInertOnOpen(modalRef, open) {
  useEffect(() => {
    const appRoot = document.getElementById('root');
    const previouslyFocused = document.activeElement;

    if (open) {
      // Move focus into modal
      try {
        if (modalRef && modalRef.current) {
          modalRef.current.setAttribute('tabindex', '-1');
          modalRef.current.focus();
        }
      } catch (e) {
        // ignore
      }

      // Make the rest of the app inert so it's not focusable / interactable
      if (appRoot && appRoot !== modalRef.current) {
        try { appRoot.inert = true; } catch (e) { appRoot.setAttribute('aria-hidden', 'true'); }
      }
    }

    return () => {
      // restore
      if (appRoot) {
        try { appRoot.inert = false; } catch (e) { appRoot.removeAttribute('aria-hidden'); }
      }
      try {
        if (modalRef && modalRef.current) modalRef.current.removeAttribute('tabindex');
      } catch (e) {}
      try { if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus(); } catch (e) {}
    };
  }, [open]);
}
