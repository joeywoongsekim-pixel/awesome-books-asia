import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {routing} from '../../../../i18n/routing';
import ContactForm from '../../../../components/ContactForm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'contact'});
  return {title: `${t('title')} — Awesome Books Asia`, description: t('lead')};
}

export default async function ContactPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <section className="sec">
      <div className="sec-in ct">
        <div className="eyebrow mid">{t('eyebrow')}</div>
        <h1 className="h2">{t('title')}</h1>
        <p className="lead" style={{margin: '0 auto 34px'}}>
          {t('lead')}
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
