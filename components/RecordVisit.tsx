'use client';

import {useEffect} from 'react';

// Drops the visited slug at the head of the recently-viewed list.
export default function RecordVisit({slug}: {slug: string}) {
  useEffect(() => {
    try {
      const key = 'aba-recent';
      const current: string[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      const next = [slug, ...current.filter((s) => s !== slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* private mode etc. — non-essential */
    }
  }, [slug]);
  return null;
}
