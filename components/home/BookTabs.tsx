'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS} from '../../lib/books';
import BookCard from '../BookCard';

// §9.5 — tabbed book grid. Tabs reuse existing strings: new releases /
// most popular / all books.
type TabKey = 'new' | 'popular' | 'all';

const TAB_BOOKS: Record<TabKey, () => typeof BOOKS> = {
  new: () => [...BOOKS.filter((b) => b.isNew), ...BOOKS.filter((b) => !b.isNew)].slice(0, 4),
  popular: () => [...BOOKS].sort((a, b) => (b.price ?? 20) - (a.price ?? 20)).slice(0, 4),
  all: () => BOOKS
};

export default function BookTabs() {
  const t = useTranslations();
  const [tab, setTab] = useState<TabKey>('new');

  const tabs: {key: TabKey; label: string}[] = [
    {key: 'new', label: t('footer.libraryLinks.new')},
    {key: 'popular', label: t('plans.monthly.tag')},
    {key: 'all', label: t('footer.libraryLinks.all')}
  ];

  return (
    <section className="sec" id="books">
      <div className="sec-in">
        <div className="books-head">
          <div>
            <div className="eyebrow">{t('books.eyebrow')}</div>
            <h2 className="h2">{t('books.title')}</h2>
          </div>
          <Link href="/books" className="viewall">
            {t('books.viewAll')}
          </Link>
        </div>
        <div className="btabs" role="tablist">
          {tabs.map(({key, label}) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`btab ${tab === key ? 'on' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="bgrid">
          {TAB_BOOKS[tab]().map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
