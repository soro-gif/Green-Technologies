import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component automatically scrolls the window to the top (or to anchor hash)
 * whenever the user navigates to a new page or changes routes.
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small timeout to allow DOM to render if navigating from another route
      setTimeout(() => {
        const elem = document.querySelector(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);
      return;
    }

    // Always scroll to top immediately on page change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, search, hash]);

  return null;
}
