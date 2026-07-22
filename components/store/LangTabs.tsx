'use client';

import {useState} from 'react';
import type {Lang} from '../../lib/books';

// Edition names render in their own language on every locale, as in the
// prototype. Real per-edition content arrives with M5's book_editions.
const LABELS: Record<Lang, string> = {
  EN: 'English',
  KO: '한국어',
  JA: '日本語'
};

export default function LangTabs({langs}: {langs: Lang[]}) {
  const [active, setActive] = useState(0);

  return (
    <div className="d-langs">
      {langs.map((lang, i) => (
        <button
          type="button"
          key={lang}
          className={i === active ? 'd-lang on' : 'd-lang'}
          onClick={() => setActive(i)}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
