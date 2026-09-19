// Local book data for M2–M4. Moves to Supabase (books + book_editions) in M5.
// Content is authored English, faithful to docs/prototype.html — the UI chrome
// around it is translated via next-intl; editions per locale arrive with M5.

export type Lang = "EN" | "KO" | "JA";
/* The house's shelf, as the publisher defines it. Twelve subjects; a book
   belongs to exactly one. Order is the order they are shown in. */
export type Category =
  | "AI"
  | "ECON"
  | "BIZ"
  | "PICTURE"
  | "ELEM"
  | "SECOND"
  | "HIGHER"
  | "SPORT"
  | "FICTION"
  | "WELLNESS"
  | "ART"
  | "TRAVEL";

export const CATEGORIES: Category[] = [
  "AI",
  "ECON",
  "BIZ",
  "PICTURE",
  "ELEM",
  "SECOND",
  "HIGHER",
  "SPORT",
  "FICTION",
  "WELLNESS",
  "ART",
  "TRAVEL"
];

/** i18n key under `store` for each subject's name. */
export const CAT_KEY: Record<Category, string> = {
  AI: "catAI",
  ECON: "catECON",
  BIZ: "catBIZ",
  PICTURE: "catPICTURE",
  ELEM: "catELEM",
  SECOND: "catSECOND",
  HIGHER: "catHIGHER",
  SPORT: "catSPORT",
  FICTION: "catFICTION",
  WELLNESS: "catWELLNESS",
  ART: "catART",
  TRAVEL: "catTRAVEL"
};
export type Cover = "c1" | "c2" | "c3" | "c4" | "c5" | "c6";

export type Spread = {
  ch?: string; // running chapter label (Space Mono)
  h?: string; // heading, may contain <br>
  x: string; // body HTML (<p>, <b>)
  fig?: { i: string; t: string }; // inline figure: emoji + caption (may contain <br>)
};

export type Book = {
  id: string;
  ic: string;
  cover: Cover;
  title: string;
  author: string;
  cat: Category;
  catLabel: string;
  price: number; // 0 means subscription-only
  langs: Lang[];
  isNew: boolean;
  level: number;
  kids?: boolean;
  angle: string; // how this book frames "the same idea" — used by the AI panel
  blurb: string;
  pages: number;
  published: string;
  img?: string; // real cover in /public/covers
  toc: string[];
  sp: Spread[];
};

export const BOOKS: Book[] = [
  {
    id: "ai-answer",
    img: '/covers/ai-answer-ja.jpg',
    ic: "🔎",
    cover: "c2",
    title: "AIの答えに、人間は何を足すのか",
    author: "Akira Murata",
    cat: "AI",
    catLabel: "AI & Technology",
    price: 0,
    langs: ["JA", "EN"],
    isNew: true,
    level: 2,
    angle: "as three human additions — purpose, evidence, and the decision to use",
    blurb:
      "AI has given its answer — now how far can you use it? A visual, story-led AI-literacy reader that draws on physics, life science and social simulation to teach the three things people add: setting the purpose, tracing the evidence, and choosing how to use the result. Eighty figures, short exercises, and eight interludes following two readers through a Japanese year. For high-school inquiry, university seminars, and anyone putting AI to work.",
    pages: 337,
    published: "2026-09",
    toc: [],
    sp: [],
  },
  {
    id: "ai-bible",
    img: '/covers/ai-bible.jpg',
    ic: "🧠",
    cover: "c1",
    title: "Awesome AI Bible 2026",
    author: "Akira Murata",
    cat: "AI",
    catLabel: "AI & Technology",
    price: 12,
    langs: ["EN", "KO", "JA"],
    isNew: true,
    level: 2,
    angle:
      "as a five-part work order — role, context, task, format, constraint",
    blurb:
      "The complete guide to generative AI, from your first prompt to organisational policy. Twelve chapters covering ChatGPT, Claude, Gemini and Copilot, with the verification habits that keep the output trustworthy.",
    pages: 549,
    published: "2026-02",
    toc: [
      "What generative AI actually is",
      "Choosing between the tools",
      "The structure of a prompt",
      "Why the same prompt differs",
      "Verification and hallucination",
      "Putting it to work",
      "Where not to delegate",
    ],
    sp: [
      {
        ch: "Chapter 03 · Structure of a prompt",
        h: "A good prompt<br>has structure",
        x: `<p>What you send a generative model isn't really a question. It is closer to a <b>work order</b>.</p><p>Role, context, task, format, constraint — the more of these you supply, the less your results vary from one run to the next.</p>`,
      },
      {
        fig: {
          i: "🧩",
          t: "The five parts<br>Role · Context · Task · Format · Constraint",
        },
        x: `<p>The part beginners leave out most often is format. Ask a model to "tidy this up" and you get a different shape every time. Say "a table, three columns, forty characters per cell" and the output becomes repeatable.</p><p>Repeatability is what moves prompting from a hobby into work.</p>`,
      },
      {
        ch: "Chapter 03 · Structure of a prompt",
        h: "Is more context<br>always better?",
        x: `<p>A common mistake. Context is about <b>density, not volume</b>. Pile on unrelated background and the model loses the thread.</p><p>Delete one sentence at a time and watch for the point where the answer gets worse. That is the fastest way to find the floor.</p>`,
      },
      {
        fig: {
          i: "⚖️",
          t: "Context density test<br>If deleting it changes nothing, delete it",
        },
        x: `<p>The principle is identical to briefing a person. Three decision criteria beat the entire project history.</p><p>Much of AI literacy turns out to be <b>the craft of delegation</b>.</p>`,
      },
      {
        ch: "Chapter 04 · Tool differences",
        h: "Same prompt,<br>different answers",
        x: `<p>ChatGPT, Claude, Gemini and Copilot respond differently to identical input, because their training and alignment differ.</p><p>So when you switch tools, <b>port the prompt as well</b>. Pasting it across unchanged usually costs you quality.</p>`,
      },
      {
        fig: {
          i: "🔧",
          t: "Porting checklist<br>Length · format instruction · example count",
        },
        x: `<p>In practice: fix three reference prompts — summarise, classify, generate — and run them identically on any new tool. The gap between results is your evidence for choosing.</p>`,
      },
    ],
  },
  {
    id: "quantum-econ",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications",
    author: "Akira Murata",
    cat: "ECON",
    catLabel: "Economics",
    price: 12,
    langs: ["EN", "JA"],
    isNew: true,
    level: 4,
    angle:
      "as measurement — a price is not discovered, it is collapsed by the act of asking",
    blurb:
      "What if the economy obeys quantum rules? Superposition, measurement and entanglement as a working toolkit for the new economics of decision-making — why you choose what you choose. The Japanese edition (量子経済学) applies the same lens to the BOJ, consumption tax and fan economies.",
    pages: 342,
    published: "2026-08",
    toc: [
      "Why classical models miss",
      "Choice as superposition",
      "Price as measurement",
      "Entangled markets",
      "Tunnelling and innovation",
      "Policy in a quantum economy",
    ],
    sp: [
      {
        ch: "Chapter 2 · Choice as superposition",
        h: "You did not have<br>a preference yet",
        x: `<p>Classical economics assumes your preference existed before the question. Watch real buyers and you see something stranger: until the moment of asking, the preference is <b>genuinely undecided</b>.</p><p>The question does not reveal the answer. It creates it.</p>`,
      },
      {
        fig: {
          i: "⚛️",
          t: "The survey effect<br>Asking about a purchase changes the purchase",
        },
        x: `<p>This is why A/B tests disagree with interviews, and why both disagree with the till. Each is a different measurement, and each collapses the customer differently.</p>`,
      },
      {
        ch: "Chapter 3 · Price as measurement",
        h: "A price is<br>an experiment",
        x: `<p>Post a price and you have not described the market — you have <b>intervened in it</b>. The order book an instant later is the result of your experiment, not a photograph of what was already there.</p>`,
      },
      {
        fig: { i: "📉", t: "Implication<br>There is no observer-free price" },
        x: `<p>The practical toolkit follows: run price changes as designed experiments, expect the measurement to disturb the system, and never reuse an observation as if the system had not moved.</p>`,
      },
    ],
  },
  {
    id: "quantum-econ-uk",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications (UK Edition)",
    author: "Akira Murata",
    cat: "ECON",
    catLabel: "Economics",
    price: 0,
    langs: ["EN"],
    isNew: false,
    level: 4,
    angle: "as measurement — a price is not discovered, it is collapsed by the act of asking",
    blurb:
      "The UK edition of Quantum Economics: superposition, measurement and entanglement as a working toolkit for the new economics of decision-making, with British examples and spelling.",
    pages: 283,
    published: "2026-08",
    toc: [],
    sp: [],
  },
  {
    id: "quantum-econ-in",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications (India Edition)",
    author: "Akira Murata",
    cat: "ECON",
    catLabel: "Economics",
    price: 0,
    langs: ["EN"],
    isNew: false,
    level: 4,
    angle: "as measurement — a price is not discovered, it is collapsed by the act of asking",
    blurb:
      "The India edition of Quantum Economics: superposition, measurement and entanglement as a working toolkit for the new economics of decision-making, framed for Indian readers and markets.",
    pages: 283,
    published: "2026-08",
    toc: [],
    sp: [],
  },
  {
    id: "isekai",
    img: '/covers/isekai.jpg',
    ic: "🚀",
    cover: "c2",
    title: "An Introduction to ISEKAI Entrepreneurship",
    author: "Lyra Mizuki · Orion Carter",
    cat: "BIZ",
    catLabel: "Business × Isekai Fantasy",
    price: 9,
    langs: ["EN", "KO", "JA"],
    isNew: true,
    level: 3,
    angle:
      "as negotiation — getting what you need from someone who does not share your assumptions",
    blurb:
      "A quest-driven light novel that teaches initiative, strategy and startup thinking without a textbook in sight. A modern founder wakes up in a kingdom that has never heard of a fixed price.",
    pages: 312,
    published: "2025-07",
    toc: [
      "Summoned",
      "The first customer",
      "The guild war",
      "Expansion",
      "The winter",
      "Return",
    ],
    sp: [
      {
        ch: "Chapter 1 · Summoned",
        h: "The kingdom had<br>no market",
        x: `<p>When I opened my eyes I was standing in the middle of an unfamiliar square. People held goods and shouted at one another, but <b>nothing carried a price</b>.</p><p>"Does this country not have fixed prices?" The merchant looked back at me. "What is a fixed price?"</p>`,
      },
      {
        fig: { i: "⚔️", t: "Quest 01<br>Design a way to discover price" },
        x: `<p>If every trade requires haggling, then every trade is expensive. I suspected this was why the kingdom was poor.</p>`,
      },
      {
        ch: "Chapter 2 · The first customer",
        h: "Sell it before<br>you build it",
        x: `<p>I had made nothing yet. Instead I went to the square and <b>asked twenty people</b> what they would pay to know the price of bread in advance.</p><p>Seventeen laughed. Three asked a serious follow-up question. Those three became my first customers.</p>`,
      },
      {
        fig: {
          i: "🍞",
          t: "Quest 02<br>Take three pre-orders before you build",
        },
        x: `<p>The first thing a venture proves is not the product. It is that <b>someone will pay</b>. Seventeen refusals were not failure; they were the data.</p>`,
      },
      {
        ch: "Chapter 3 · The guild war",
        h: "A competitor<br>appeared",
        x: `<p>Once my price list spread, the merchants' guild moved. They posted <b>lower prices than mine</b> — plainly at a loss.</p><p>I did not lower mine. I added a delivery guarantee instead.</p>`,
      },
      {
        fig: {
          i: "🛡️",
          t: "Quest 03<br>Find the axis where price is not the fight",
        },
        x: `<p>Fight on price and the deeper pocket wins. A game you cannot win is a game whose <b>rules you must change</b>. That is what positioning means.</p>`,
      },
    ],
  },
  {
    id: "ninja-cat",
    img: '/covers/ninja-cat.jpg',
    ic: "🐱",
    cover: "c5",
    title: "Clumsy Ninja Cat Kuro",
    author: "Fumi Yamaneko · Orion Carter",
    cat: "PICTURE",
    catLabel: "Picture book · Animal Comedy",
    price: 7,
    langs: ["KO", "JA"],
    isNew: false,
    level: 1,
    kids: true,
    angle: "as a comedy about trying again after every spectacular failure",
    blurb:
      "Kuro is a ninja cat — probably the clumsiest one in the village. Every mission goes wrong in exactly the way you hope it will. A picture-book animal comedy for ages 4–8. Published in Korean (덜렁이 닌자 고양이) and Japanese (おっちょこ忍キャット).",
    pages: 44,
    published: "2025-07",
    toc: [
      "The village",
      "The rooftop test",
      "The dropped shuriken",
      "The great chase",
      "Kuro tries again",
    ],
    sp: [
      {
        ch: "1 · The village",
        h: "A ninja must<br>be silent",
        x: `<p>Every cat in the village could cross a roof without a sound.</p><p>Kuro could too — right up until the <b>last tile</b>.</p>`,
      },
      {
        fig: { i: "🐾", t: "Look closely<br>Which tile is about to slip?" },
        x: `<p>CRASH. The elders sighed. The pigeons applauded.</p>`,
      },
      {
        ch: "2 · The rooftop test",
        h: "The test had<br>three rules",
        x: `<p>Silent feet. Steady tail. <b>No snacks</b> on a mission.</p><p>Kuro broke the third rule before the test began.</p>`,
      },
      {
        fig: {
          i: "🍡",
          t: "Talk about it<br>Which rule would be hardest for you?",
        },
        x: `<p>To be fair, the dango stand was directly on the way.</p>`,
      },
      {
        ch: "5 · Kuro tries again",
        h: "Clumsy is not<br>the same as giving up",
        x: `<p>"You fell nine times," said the elder. "And climbed up ten," said Kuro, dusting off his paws.</p><p>That, said the elder, is <b>the whole art</b>.</p>`,
      },
      {
        fig: {
          i: "🥷",
          t: "For grown-ups<br>Praise the tenth climb, not the missing falls",
        },
        x: `<p>That night Kuro crossed the roof. Almost silently. Almost.</p>`,
      },
    ],
  },
];

// Titles with built-in sample spreads — the only ones the demo desk
// (home MiniDesk, legacy Reader, AI panel) can show.
export const DEMO_BOOKS = BOOKS.filter((b) => b.sp.length > 0);

/* ── Homepage shelf tabs ──────────────────────────────────────────────────
   신간 is derived from the catalogue's own publication dates, so it is
   always true. The other two cannot be derived from anything here: there is
   no sales data in the repo and no forthcoming titles, and neither is
   something to guess at on a public page. Fill these in and the tabs appear
   — the shelf renders only the tabs that have books. */
/** A book on the shelf, optionally a particular language edition of it.
    `title` is only set where the house has given us that edition's own
    title — otherwise the base title shows with an edition label, rather
    than a translated one being invented here. */
export type Pick = {id: string; lang?: Lang; title?: string};

/** The 신간 row, in order. Curated: the house decides what is current. */
export const NEW_RELEASES: Pick[] = [
  {id: 'ai-answer'},
  // The English edition, on amazon.in as the India Special Edition. It was
  // kept off this shelf while there was no /covers/ai-answer-en.jpg, since
  // it would have stood here under the Japanese cover — two identical
  // spines, which is why the UK edition was pulled. Its own jacket is on
  // file now, so it stands.
  {id: 'ai-answer', lang: 'EN', title: 'What Do Humans Add to AI’s Answers?'},
  {id: 'quantum-econ-in'},
  {id: 'quantum-econ', lang: 'JA', title: '量子経済学'}
  // The UK edition is out: every English edition of Quantum Economics —
  // base, UK and India — is published under the same cover art, so two of
  // them side by side read as the same book printed twice. India stays as
  // the edition released today. A fourth pick can go here once there is
  // one with cover art of its own.
];

/** The 베스트셀러 row, in order. */
export const BESTSELLERS: Pick[] = [
  {id: 'ai-bible', lang: 'EN'},
  {id: 'ai-bible', lang: 'JA'},
  {id: 'isekai', lang: 'KO'},
  {id: 'isekai', lang: 'EN'}
];

/* A book that is not written yet is not a catalogue entry. It has a title
   and, where the house has said so, an author — no cover, no blurb, no page
   count, no ISBN. Giving it a Book would mean inventing all of those, so it
   gets a type of its own and the shelf stands it as a blank jacket. */
export type Forthcoming = {
  title: string;
  author?: string;
  illustrator?: string;
  translator?: string;
  /** Cover art, once there is any. Until then the shelf sets a blank one. */
  cover?: string;
};

/** The 커밍순 row, in order. */
export const COMING_SOON: Forthcoming[] = [
  {title: 'Economics of AI Token', author: 'Akira Murata', cover: '/covers/soon-ai-token.jpg'},
  /* A coming-of-age novel. Students from Hawaii, Japan, Korea, the US,
     Australia, Mexico and Brazil meet at a high school on O'ahu's North
     Shore and start a band.

     The band is a mixed one, not a row of national instruments. A few
     things came from home, but what it plays is what happens when the
     cultures are in the same room — We Are the World, as the house
     describes it. The first version of this note had them each bring an
     instrument from their own country, which made the wrong book.

     Halley Brooks is one of the house's invented authors, like Lyra
     Mizuki and Orion Carter — and, like them, named for something in the
     sky. All of this is recorded here because a forthcoming title has no
     blurb field, and the last time the premise lived only in a chat log
     it was lost and took an author with it. */
  {
    title: 'North Shore',
    author: 'Halley Brooks',
    illustrator: 'Orion Carter',
    translator: 'Joey W. Kim',
    cover: '/covers/soon-north-shore.jpg'
  },
  {title: 'Introduction to Cricket', author: 'Joey W. Kim', cover: '/covers/soon-cricket.jpg'},
  {title: 'Introduction to Rugby', author: 'Joey W. Kim', cover: '/covers/soon-rugby.jpg'}
];

/** The cover art that exists per language, by the files in /public/covers. */
const COVERS: Record<string, Partial<Record<Lang, string>>> = {
  'ai-answer': {JA: '/covers/ai-answer-ja.jpg', EN: '/covers/ai-answer-en.jpg'},
  'ai-bible': {EN: '/covers/ai-bible.jpg', JA: '/covers/ai-bible-ja.jpg'},
  'quantum-econ': {EN: '/covers/quantum-econ.jpg', JA: '/covers/quantum-econ-ja.jpg'},
  'quantum-econ-uk': {EN: '/covers/quantum-econ.jpg'},
  'quantum-econ-in': {EN: '/covers/quantum-econ.jpg'},
  isekai: {EN: '/covers/isekai.jpg', KO: '/covers/isekai-ko.jpg', JA: '/covers/isekai-ja.jpg'},
  'ninja-cat': {EN: '/covers/ninja-cat.jpg', KO: '/covers/ninja-cat-ko.jpg'}
};

export function coverFor(id: string, lang?: Lang): string | undefined {
  const set = COVERS[id];
  return (lang && set?.[lang]) || BOOKS.find((b) => b.id === id)?.img;
}

/** Newest first, regional twins folded into one entry. */
export function newestBooks(n: number): Book[] {
  const seen = new Set<string>();
  return [...BOOKS]
    .sort((a, b) => b.published.localeCompare(a.published))
    .sort((a, b) => a.id.length - b.id.length) // prefer the base edition
    .sort((a, b) => b.published.localeCompare(a.published))
    .filter((b) => {
      const base = b.id.replace(/-(uk|in)$/, '');
      if (seen.has(base)) return false;
      seen.add(base);
      return true;
    })
    .slice(0, n);
}

export const byId = (id: string) => BOOKS.find((b) => b.id === id);
