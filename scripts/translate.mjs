#!/usr/bin/env node
/**
 * Generates messages/ko.json and messages/ja.json from messages/en.json.
 *
 * English (messages/en.json) is the single authored source. KO/JA are OUTPUTS
 * of this script and must never be hand-edited — edit en.json (or the memory
 * below) and re-run `npm run i18n:generate`.
 *
 * Translation strategy, in order of preference:
 *   1. If ANTHROPIC_API_KEY is set, translate via the model (TODO: wire client).
 *   2. Otherwise use the bundled translation memory below.
 *   3. Fall back to the English string and warn (so nothing is silently missing).
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '..', 'messages');

const TARGETS = ['ko', 'ja'];

// Translation memory keyed by the exact English source string.
// Brand names (AwesomeBooks, Awesome AI Asia, PDF, EPUB) are intentionally kept.
const MEMORY = {
  ko: {
    'AwesomeBooks — Read the whole desk': 'AwesomeBooks — 책상 전체를 읽다',
    'Spread four books at once, turn pages the way paper turns, and ask an AI that reads your whole desk. Opens in your browser.':
      '네 권의 책을 한 번에 펼치고, 종이가 넘어가듯 페이지를 넘기며, 책상 전체를 읽는 AI에게 질문하세요. 브라우저에서 바로 열립니다.',
    AwesomeBooks: 'AwesomeBooks',
    'Digital Library · Asia': '디지털 라이브러리 · 아시아',
    Home: '홈',
    Bookstore: '서점',
    'The Reader': '리더',
    Plans: '요금제',
    'My Library': '내 서재',
    English: '한국어',
    'Start reading': '읽기 시작',
    'New reader · now live': '새로운 리더 · 지금 출시',
    'Read the whole <em>desk</em>, not just one book':
      '한 권이 아니라 <em>책상 전체</em>를 읽으세요',
    'Spread four books at once. Turn pages the way paper turns. Then ask the AI a question that cuts across all of them — no app to install, it opens in your browser.':
      '네 권의 책을 한 번에 펼치세요. 종이가 넘어가는 방식 그대로 페이지를 넘기세요. 그런 다음 네 권 모두를 가로지르는 질문을 AI에게 던지세요 — 설치할 앱은 없습니다. 브라우저에서 열립니다.',
    'PDF + EPUB · English · 한국어 · 日本語 · on any device':
      'PDF + EPUB · English · 한국어 · 日本語 · 모든 기기에서',
    'Try the reader': '리더 체험하기',
    'Browse the library': '라이브러리 둘러보기',
    'Milestone 1 — shell and routing. The live desk, book grid and reader arrive in later milestones.':
      '마일스톤 1 — 셸과 라우팅. 라이브 데스크, 책 그리드, 리더는 이후 마일스톤에서 추가됩니다.',
    'Stories Without Borders': '경계 없는 이야기',
    'A digital publishing platform connecting readers across Asia with good books — in English, Korean and Japanese.':
      '좋은 책으로 아시아 전역의 독자를 잇는 디지털 출판 플랫폼 — 영어, 한국어, 일본어로.',
    Library: '라이브러리',
    'All books': '모든 책',
    'AI & Tech': 'AI & 기술',
    "Children's books": '어린이책',
    Education: '교육',
    'New releases': '신간',
    Account: '계정',
    'Sign up': '회원가입',
    'Log in': '로그인',
    'Manage subscription': '구독 관리',
    'Redeem coupon': '쿠폰 등록',
    Company: '회사',
    'About us': '회사 소개',
    Partnerships: '제휴',
    Contact: '문의',
    FAQ: '자주 묻는 질문',
    'Refund policy': '환불 정책',
    '© 2026 AwesomeBooks.asia — Connected to Awesome AI Asia':
      '© 2026 AwesomeBooks.asia — Awesome AI Asia와 연결됨'
  },
  ja: {
    'AwesomeBooks — Read the whole desk': 'AwesomeBooks — 机全体を読む',
    'Spread four books at once, turn pages the way paper turns, and ask an AI that reads your whole desk. Opens in your browser.':
      '4冊の本を一度に広げ、紙がめくれるようにページをめくり、机全体を読むAIに質問できます。ブラウザですぐに開きます。',
    AwesomeBooks: 'AwesomeBooks',
    'Digital Library · Asia': 'デジタルライブラリー · アジア',
    Home: 'ホーム',
    Bookstore: '書店',
    'The Reader': 'リーダー',
    Plans: 'プラン',
    'My Library': 'マイライブラリー',
    English: '日本語',
    'Start reading': '読み始める',
    'New reader · now live': '新しいリーダー · 公開中',
    'Read the whole <em>desk</em>, not just one book':
      '一冊ではなく<em>机全体</em>を読む',
    'Spread four books at once. Turn pages the way paper turns. Then ask the AI a question that cuts across all of them — no app to install, it opens in your browser.':
      '4冊の本を一度に広げましょう。紙がめくれるようにページをめくりましょう。そして4冊すべてを横断する質問をAIに投げかけてください — インストールするアプリはありません。ブラウザで開きます。',
    'PDF + EPUB · English · 한국어 · 日本語 · on any device':
      'PDF + EPUB · English · 한국어 · 日本語 · あらゆるデバイスで',
    'Try the reader': 'リーダーを試す',
    'Browse the library': 'ライブラリーを見る',
    'Milestone 1 — shell and routing. The live desk, book grid and reader arrive in later milestones.':
      'マイルストーン1 — シェルとルーティング。ライブデスク、書籍グリッド、リーダーは後のマイルストーンで追加されます。',
    'Stories Without Borders': 'ボーダーレスなストーリー',
    'A digital publishing platform connecting readers across Asia with good books — in English, Korean and Japanese.':
      '良い本でアジア全域の読者をつなぐデジタル出版プラットフォーム — 英語、韓国語、日本語で。',
    Library: 'ライブラリー',
    'All books': 'すべての本',
    'AI & Tech': 'AI & テック',
    "Children's books": '児童書',
    Education: '教育',
    'New releases': '新刊',
    Account: 'アカウント',
    'Sign up': '新規登録',
    'Log in': 'ログイン',
    'Manage subscription': 'サブスクの管理',
    'Redeem coupon': 'クーポンを使う',
    Company: '会社',
    'About us': '会社概要',
    Partnerships: 'パートナーシップ',
    Contact: 'お問い合わせ',
    FAQ: 'よくある質問',
    'Refund policy': '返金ポリシー',
    '© 2026 AwesomeBooks.asia — Connected to Awesome AI Asia':
      '© 2026 AwesomeBooks.asia — Awesome AI Asia と連携'
  }
};

function translateValue(value, locale, missing) {
  const hit = MEMORY[locale][value];
  if (hit !== undefined) return hit;
  missing.push(value);
  return value; // fall back to English, never drop a key
}

function walk(node, locale, missing) {
  if (typeof node === 'string') return translateValue(node, locale, missing);
  if (Array.isArray(node)) return node.map((n) => walk(n, locale, missing));
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = walk(v, locale, missing);
  return out;
}

const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));

for (const locale of TARGETS) {
  const missing = [];
  const translated = walk(en, locale, missing);
  writeFileSync(
    join(messagesDir, `${locale}.json`),
    JSON.stringify(translated, null, 2) + '\n',
    'utf8'
  );
  if (missing.length) {
    console.warn(
      `[translate] ${locale}: ${missing.length} string(s) fell back to English:`
    );
    for (const m of missing) console.warn(`  · ${m}`);
  } else {
    console.log(`[translate] ${locale}: all strings translated.`);
  }
}
