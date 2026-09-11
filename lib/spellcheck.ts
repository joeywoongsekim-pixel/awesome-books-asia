// M31 — spelling & typo detection for the pre-publish check.
// English gets a real Hunspell dictionary (nspell, loaded on demand from
// /dict). Korean and Japanese get curated confusable lists — the mistakes
// people actually make — because morphological spell checking for those
// languages can't run honestly in the browser. Everything else is
// language-neutral: repeated words, doubled spaces, unmatched pairs.
// All findings are warnings; the author decides.

export type SpellIssue =
  | {kind: 'misspelled'; words: string[]}
  | {kind: 'confusable'; bad: string; good: string}
  | {kind: 'repeat'; word: string}
  | {kind: 'doubleSpace'}
  | {kind: 'spaceBeforePunct'}
  | {kind: 'unmatchedPairs'};

// ── curated confusables ────────────────────────────────────────────────
// Only pairs that are wrong in (nearly) every context — no guesses.
const KO_CONFUSABLES: Array<[string, string]> = [
  ['어의없', '어이없'],
  ['웬지', '왠지'],
  ['왠만', '웬만'],
  ['왠일', '웬일'],
  ['되요', '돼요'],
  ['됬', '됐'],
  ['몇일', '며칠'],
  ['금새 ', '금세 '],
  ['오랫만', '오랜만'],
  ['희안하', '희한하'],
  ['어떻해', '어떡해'],
  ['통채로', '통째로'],
  ['제작년', '재작년'],
  ['건들이', '건드리']
];

const JA_CONFUSABLES: Array<[string, string]> = [
  ['こんにちわ', 'こんにちは'],
  ['こんばんわ', 'こんばんは'],
  ['ふいんき', 'ふんいき'],
  ['いちよう', 'いちおう'],
  ['シュミレーション', 'シミュレーション'],
  ['うる覚え', 'うろ覚え'],
  ['永遠と', '延々と']
];

// ── the shared, language-neutral checks ────────────────────────────────
export function universalIssues(text: string): SpellIssue[] {
  const out: SpellIssue[] = [];
  // the same space-separated token twice in a row ("the the", "정말 정말"
  // is stylistic — require length ≥ 2 and skip pure numbers)
  const rep = text.match(/(^|\s)([^\s\d]{2,})\s+\2(?=\s|$|[.,!?])/iu);
  if (rep) out.push({kind: 'repeat', word: rep[2]});
  if (/ {2,}/.test(text)) out.push({kind: 'doubleSpace'});
  if (/[A-Za-z] +[,.!?;:](?=\s|$)/.test(text)) out.push({kind: 'spaceBeforePunct'});
  const pairs: Array<[string, string]> = [['(', ')'], ['[', ']'], ['「', '」'], ['『', '』'], ['“', '”']];
  for (const [a, b] of pairs) {
    if ((text.split(a).length - 1) !== (text.split(b).length - 1)) {
      out.push({kind: 'unmatchedPairs'});
      break;
    }
  }
  return out;
}

export function confusableIssues(text: string, locale: string): SpellIssue[] {
  const list = locale === 'ko' ? KO_CONFUSABLES : locale === 'ja' ? JA_CONFUSABLES : [];
  const out: SpellIssue[] = [];
  for (const [bad, good] of list) {
    if (text.includes(bad)) out.push({kind: 'confusable', bad: bad.trim(), good: good.trim()});
  }
  return out;
}

// ── English dictionary (Hunspell via nspell, cached module-wide) ───────
type Dict = {correct: (w: string) => boolean; suggest: (w: string) => string[]};
let dictPromise: Promise<Dict | null> | null = null;

function loadEnDict(): Promise<Dict | null> {
  dictPromise ??= (async () => {
    try {
      const [nspellMod, aff, dic] = await Promise.all([
        import('nspell'),
        fetch('/dict/en.aff').then((r) => r.text()),
        fetch('/dict/en.dic').then((r) => r.text())
      ]);
      return nspellMod.default(aff, dic) as Dict;
    } catch {
      return null;
    }
  })();
  return dictPromise;
}

// Conservative tokenizer: lowercase alphabetic words only. Capitalised
// words (names), ALLCAPS, and anything with digits or apostrophes beyond
// simple contractions are skipped to keep false positives near zero.
export async function misspelledWords(text: string, cap = 8): Promise<string[]> {
  const dict = await loadEnDict();
  if (!dict) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of text.matchAll(/(^|[^A-Za-z'-])([a-z][a-z']{2,})(?=$|[^A-Za-z'-])/g)) {
    const w = m[2].replace(/'+$/, '');
    if (w.length < 3 || seen.has(w)) continue;
    seen.add(w);
    if (!dict.correct(w)) {
      const sug = dict.suggest(w)[0];
      out.push(sug ? `${w} → ${sug}` : w);
      if (out.length >= cap) break;
    }
  }
  return out;
}
