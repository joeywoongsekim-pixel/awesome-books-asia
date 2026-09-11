'use client';

import {useEffect} from 'react';

// M27b — site-wide artwork protection. Right-click and drag are blocked on
// every image (covers, posters, artwork) so they can't be saved or dragged
// out from any page. Text and links keep their normal context menus for
// ordinary browsing; the readers run the stricter full guard on top.
export default function SiteGuard() {
  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest('img, picture, svg, [data-protect]')) {
        e.preventDefault();
      }
    };
    const onDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement | null)?.closest('img, picture, svg')) e.preventDefault();
    };
    document.addEventListener('contextmenu', onCtx);
    document.addEventListener('dragstart', onDrag);
    return () => {
      document.removeEventListener('contextmenu', onCtx);
      document.removeEventListener('dragstart', onDrag);
    };
  }, []);
  return null;
}
