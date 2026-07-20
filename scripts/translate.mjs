#!/usr/bin/env node
/**
 * Generates messages/ko.json and messages/ja.json from messages/en.json.
 *
 * English (messages/en.json) is the single authored source. KO/JA are committed
 * artifacts, not build-time output — regenerate them on demand with
 * `npm run i18n`, review the diff, and commit. The production build never runs
 * this script (deterministic builds, no API key on Vercel, no per-deploy cost).
 *
 * Translation strategy:
 *   1. scripts/translation-cache.json is a committed cache keyed by the exact
 *      English source string. Cache hits are reused verbatim, so re-running only
 *      sends strings that are new or changed since the last run.
 *   2. Cache misses are translated with the Anthropic API (claude-sonnet-4-6)
 *      when ANTHROPIC_API_KEY is set; results are written back to the cache.
 *   3. Without a key, misses fall back to the English string and warn (they are
 *      not silently dropped).
 *
 * Modes:
 *   node scripts/translate.mjs           Generate ko.json / ja.json (+ update cache)
 *   node scripts/translate.mjs --check   No API, no writes; exit 1 if any string
 *                                        would fall back to English (for pre-commit).
 */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '..', 'messages');
const cachePath = join(__dirname, 'translation-cache.json');

const TARGETS = ['ko', 'ja'];
const LOCALE_NAMES = {ko: 'Korean', ja: 'Japanese'};
const MODEL = 'claude-sonnet-4-6';

const CHECK = process.argv.includes('--check');

// ── Load source + cache ────────────────────────────────────────────────────
const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));

const cache = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, 'utf8'))
  : {};
for (const locale of TARGETS) cache[locale] ||= {};

// Every unique string in en.json, in first-seen order.
const sourceStrings = [];
const seen = new Set();
(function collect(node) {
  if (typeof node === 'string') {
    if (!seen.has(node)) {
      seen.add(node);
      sourceStrings.push(node);
    }
  } else if (Array.isArray(node)) {
    node.forEach(collect);
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(collect);
  }
})(en);

// ── Translate cache misses via the Anthropic API ────────────────────────────
async function translateBatch(strings, locale) {
  const {default: Anthropic} = await import('@anthropic-ai/sdk');
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const language = LOCALE_NAMES[locale];

  const system =
    `You are a professional software-UI localiser translating from British English into ${language}.\n` +
    `Rules:\n` +
    `- Return ONLY a JSON array of translated strings, in the same order as the input. No markdown, no commentary.\n` +
    `- Keep brand names untranslated: AwesomeBooks, Awesome AI Asia, PDF, EPUB.\n` +
    `- Preserve any HTML tags such as <em>...</em> exactly; translate only the text inside them.\n` +
    `- Where language names appear as a middot/comma-separated list (e.g. "English · 한국어 · 日本語"), leave them as-is.\n` +
    `- Use natural, concise wording appropriate for buttons, labels and marketing copy.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system,
    messages: [{role: 'user', content: JSON.stringify(strings, null, 2)}]
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
    // Strip a ```json … ``` fence if the model added one.
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Model did not return valid JSON for ${locale}: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error(
      `Model returned ${Array.isArray(parsed) ? parsed.length : 'non-array'} items for ${locale}, expected ${strings.length}`
    );
  }
  return parsed;
}

// ── Resolve every target locale ─────────────────────────────────────────────
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
let cacheDirty = false;
const fellBack = {}; // locale -> [strings]

for (const locale of TARGETS) {
  const misses = sourceStrings.filter((s) => !(s in cache[locale]));

  if (misses.length && !CHECK && hasKey) {
    console.log(`[translate] ${locale}: translating ${misses.length} new string(s) via ${MODEL}…`);
    const translations = await translateBatch(misses, locale);
    misses.forEach((src, i) => {
      cache[locale][src] = translations[i];
    });
    cacheDirty = true;
  }

  fellBack[locale] = sourceStrings.filter((s) => !(s in cache[locale]));
}

// ── Persist the cache (skip in --check) ─────────────────────────────────────
if (cacheDirty && !CHECK) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n', 'utf8');
}

// ── --check: fail if anything would fall back to English ────────────────────
if (CHECK) {
  const offenders = TARGETS.filter((l) => fellBack[l].length);
  if (offenders.length) {
    for (const locale of offenders) {
      console.error(`[i18n:check] ${locale}: ${fellBack[locale].length} untranslated string(s):`);
      for (const s of fellBack[locale]) console.error(`  · ${s}`);
    }
    console.error('\nRun `npm run i18n` to translate them, then commit ko.json / ja.json.');
    process.exit(1);
  }
  console.log('[i18n:check] All strings translated for every locale.');
  process.exit(0);
}

// ── Emit ko.json / ja.json from the cache (English fallback for misses) ──────
function build(node, locale) {
  if (typeof node === 'string') {
    return cache[locale][node] ?? node;
  }
  if (Array.isArray(node)) return node.map((n) => build(n, locale));
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = build(v, locale);
  return out;
}

for (const locale of TARGETS) {
  const translated = build(en, locale);
  writeFileSync(
    join(messagesDir, `${locale}.json`),
    JSON.stringify(translated, null, 2) + '\n',
    'utf8'
  );
  const missing = sourceStrings.filter((s) => !(s in cache[locale]));
  if (missing.length) {
    const reason = hasKey ? 'not translated' : 'no ANTHROPIC_API_KEY — cache miss';
    console.warn(`[translate] ${locale}: ${missing.length} string(s) fell back to English (${reason}):`);
    for (const m of missing) console.warn(`  · ${m}`);
  } else {
    console.log(`[translate] ${locale}: all strings resolved from cache/API.`);
  }
}
