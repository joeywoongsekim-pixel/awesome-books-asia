// Local book data for M2–M4. Moves to Supabase (books + book_editions) in M5.
// Content is authored English, faithful to docs/prototype.html — the UI chrome
// around it is translated via next-intl; editions per locale arrive with M5.

export type Lang = "EN" | "KO" | "JA";
/* The house's shelf, as the publisher defines it. Twelve subjects; a book
   stands under one and may answer to others. Order is the order they are
   shown in. */
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

/** English subject names, for the structured data search engines read. */
export const CAT_EN: Record<Category, string> = {
  AI: "AI & Technology",
  ECON: "Economics",
  BIZ: "Business",
  PICTURE: "Picture books",
  ELEM: "Primary education",
  SECOND: "Secondary education",
  HIGHER: "Higher & adult education",
  SPORT: "Sport",
  FICTION: "Fiction",
  WELLNESS: "Wellness",
  ART: "Art",
  TRAVEL: "Travel"
};

/** Every subject a book answers to, its own first. */
export function catsOf(book: {cat: Category; also?: Category[]}): Category[] {
  return [book.cat, ...(book.also ?? [])];
}
export type Cover = "c1" | "c2" | "c3" | "c4" | "c5" | "c6";

export type Spread = {
  ch?: string; // running chapter label (Space Mono)
  h?: string; // heading, may contain <br>
  x: string; // body HTML (<p>, <b>)
  fig?: { i: string; t: string }; // inline figure: emoji + caption (may contain <br>)
};

export type Book = {
  id: string;
  /* Which book this is an edition of. Editions are separate entries with
     separate pages, because they are separate books — the Japanese
     Quantum Economics is "for Japan" and runs 369 pages to the English
     278 — and this is the thread that lets one find the others. A work
     with a single edition may leave it out. */
  work?: string;
  ic: string;
  cover: Cover;
  title: string;
  author: string;
  cat: Category;
  /* A book rarely sits in exactly one subject. `cat` is where it lives —
     the shelf row it stands on — and `also` holds the rest, so the store
     filter turns it up under every subject it really belongs to while it
     still stands in one place on the shelf. */
  also?: Category[];
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
  /* M169 — the day this book's sample may be opened in our own reader,
     as YYYY-MM-DD. A title in KDP Select / Kindle Unlimited may not be
     distributed digitally anywhere else for ninety days, and this site's
     reader is anywhere else. Its page, cover, blurb and retailer links
     are not distribution and stay up from the first day; only reading it
     here waits.

     Left out, there is nothing to wait for — which is every book that
     never went into KDP Select.

     This governs the sample in `sp` below and the button that opens it.
     The finished ebook is chapters in the database, held back by
     books.reader_from and checked inside get_book_content, where nobody
     holding the anon key can call around it. Two dates because the two
     bodies of text live in two places; both are set when a book is
     registered. */
  readerFrom?: string;
  toc: string[];
  sp: Spread[];
};

export const BOOKS: Book[] = [
  /* Published 19 September 2026 on Amazon Japan, in Japanese. It stood in
     COMING_SOON as "Economics of AI Token" until this morning.

     It lives on the AI shelf — what it teaches is how to use a model well
     enough to know what a piece of work cost you — and it answers to the
     economics filter too, which is the other half of its title. */
  {
    id: "ai-token",
    work: "ai-token",
    img: '/covers/ai-token-ja.jpg',
    ic: "🪙",
    cover: "c4",
    title: "AIトークン経済入門",
    author: "Akira Murata",
    cat: "AI",
    also: ["ECON"],
    price: 0,
    langs: ["JA"],
    isNew: true,
    level: 2,
    angle: "as a unit cost — what one finished piece of work takes in money, time and checking",
    blurb:
      "AI looks cheap by the hour, until you count the checking and the fixing. For people who make documents with AI, and for students of economics and management, this reader follows one piece of work from brief to finished and asks what it actually cost: the quality of the result, the money paid to the model, and the hours a person spent. Through Takashi, an office worker, and Kyoko, a student, it separates how many times you generated something from how much of it you could use, explains what a token is and how billing follows it, and adds back the human time nobody invoices. Eight chapters with practice notes, eighteen graded challenges with worked answers, and a closing look at the chips, power and data centres underneath.",
    pages: 409,
    published: "2026-09",
    toc: [],
    sp: [],
  },
  /* Published 20 September 2026, the day the India launch opens. The
     English India Special Edition of the AI token book, and a separate
     entry rather than an EN edition of ai-token because it is a different
     book: 384 pages against 409, the worked examples moved to Indian
     college and early-workplace scenarios, and eighteen India exercises
     that the Japanese edition does not carry. Same shelf as its sibling —
     what it teaches is what a finished piece of work cost — and the same
     answer to the economics filter. */
  {
    id: "ai-token-in",
    work: "ai-token",
    img: '/covers/ai-token-in.jpg',
    ic: "🪙",
    cover: "c4",
    title: "The AI Token Economy: Making Better Decisions about Quality, Cost and Time (India Special Edition)",
    author: "Akira Murata",
    cat: "AI",
    also: ["ECON"],
    price: 0,
    langs: ["EN"],
    isNew: true,
    level: 2,
    /* Enrolled in KDP Select, so the ebook cannot be read here until the
       ninety days are up. Counted from publication on 20 September.
       Remove this line if the title was never enrolled. */
    readerFrom: "2026-12-19",
    angle: "as a unit cost — what one finished piece of work takes in money, time and checking",
    blurb:
      "An AI draft arrives in seconds; knowing whether it is ready to submit, share or use takes judgement. The India Special Edition of The AI Token Economy, written for college projects, internships and a first job. Follow Takashi and Kyoko through an illustrated story set in Japan, then work the same ideas through Indian college and early-workplace scenarios: setting acceptance criteria and checking a draft against its sources, understanding tokens and usage charges without mistaking a low price for a useful result, recording the checking time and the failed attempts nobody invoices, and deciding what to delegate, who checks it and when to stop. Nine practice notebooks, eighteen chapter challenges and eighteen India exercises, with hints and worked answers. No economics, no programming and no paid AI account needed — the exercises work on paper.",
    pages: 384,
    published: "2026-09",
    toc: [],
    sp: [],
  },
  {
    id: "ai-answer",
    work: "ai-answer",
    img: '/covers/ai-answer-ja.jpg',
    ic: "🔎",
    cover: "c2",
    title: "AIの答えに、人間は何を足すのか",
    author: "Akira Murata",
    cat: "AI",
    /* It is taught as well as read: the book names high-school inquiry and
       university seminars alongside the working reader, so it answers to
       both teaching shelves, and to 경영 for the people bringing it to
       work. */
    also: ["BIZ", "SECOND", "HIGHER"],
    price: 0,
    langs: ["JA"],
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
    work: "ai-bible",
    img: '/covers/ai-bible.jpg',
    ic: "🧠",
    cover: "c1",
    title: "Awesome AI Bible 2026: The Complete Guide to Mastering Generative AI from Zero",
    author: "Akira Murata",
    cat: "AI",
    price: 12,
    langs: ["EN"],
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
    work: "quantum-econ",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications",
    author: "Akira Murata",
    cat: "ECON",
    price: 12,
    langs: ["EN"],
    isNew: true,
    level: 4,
    angle:
      "as measurement — a price is not discovered, it is collapsed by the act of asking",
    blurb:
      "What if the economy obeys quantum rules? Superposition, measurement and entanglement as a working toolkit for the new economics of decision-making — why you choose what you choose. The Japanese edition (量子経済学) applies the same lens to the BOJ, consumption tax and fan economies.",
    pages: 278,
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
    work: "quantum-econ",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications (UK Edition)",
    author: "Akira Murata",
    cat: "ECON",
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
    work: "quantum-econ",
    img: '/covers/quantum-econ.jpg',
    ic: "⚛️",
    cover: "c4",
    title: "Quantum Economics: Foundations and Applications (India Edition)",
    author: "Akira Murata",
    cat: "ECON",
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
    work: "isekai",
    img: '/covers/isekai.jpg',
    ic: "🚀",
    cover: "c2",
    title: "An Introduction to ISEKAI Entrepreneurship: Business × Isekai Fantasy",
    author: "Lyra Mizuki · Orion Carter",
    cat: "BIZ",
    also: ["FICTION"], // the title already says both: it is a light novel
    price: 9,
    langs: ["EN"],
    isNew: true,
    level: 3,
    angle:
      "as negotiation — getting what you need from someone who does not share your assumptions",
    blurb:
      "A quest-driven light novel that teaches initiative, strategy and startup thinking without a textbook in sight. A modern founder wakes up in a kingdom that has never heard of a fixed price.",
    pages: 377,
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
    work: "ninja-cat",
    img: '/covers/ninja-cat.jpg',
    ic: "🐱",
    cover: "c5",
    title: "おっちょこ忍キャット クロの巻",
    author: "Fumi Yamaneko · Orion Carter",
    cat: "PICTURE",
    price: 7,
    langs: ["JA"],
    isNew: false,
    level: 1,
    kids: true,
    angle: "as a comedy about trying again after every spectacular failure",
    blurb:
      "Kuro is a ninja cat — probably the clumsiest one in the village. Every mission goes wrong in exactly the way you hope it will. A picture-book animal comedy for ages 4–8. Published in Korean (덜렁이 닌자 고양이) and Japanese (おっちょこ忍キャット).",
    pages: 116,
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
  /* The India Special Edition in English, and a different book from the
     Japanese one: 303 pages against 337, rupee equivalents beside the
     yen, and practice tasks of its own. */
  {
    id: "ai-answer-in",
    work: "ai-answer",
    img: '/covers/ai-answer-en.jpg',
    ic: "\ud83d\udd0e",
    cover: "c2",
    title: "What Do Humans Add to AI\u2019s Answers?: Understanding and Judgement through Physics, Life Science and Social Simulation (India Special Edition)",
    author: "Akira Murata",
    cat: "AI",
    also: ["BIZ", "SECOND", "HIGHER"],
    price: 0,
    langs: ["EN"],
    isNew: true,
    level: 2,
    angle: "as three human additions \u2014 purpose, evidence, and the decision to use",
    blurb:
      "AI can give you an answer \u2014 can you explain why you would use it? A polished paragraph, a confident prediction, a persuasive chart: each can look convincing before its evidence has been checked. This illustrated India Special Edition helps you ask what was predicted, what was explained, what was checked, and what the answer will be used for. Written for senior secondary students, university learners and AI-curious professionals, it explores physics, life science and virtual societies in accessible British English, assuming no programming and no advanced physics. Practise finding a clear question, tracing claims to sources, spotting misleading numbers and separating a simulation from evidence about real people, then bring those habits to an assignment, a group project or a workplace proposal. Eight chapters of practice tasks with hints and answer keys; explanations of Japanese terms and dated rupee equivalents beside the yen support Indian readers while keeping the book\u2019s Japanese setting. Between chapters, Kyoko and Takashi carry a year in Japan from one spring to the next.",
    pages: 303,
    published: "2026-09",
    toc: [],
    sp: [],
  },
  /* "For Japan": 369 pages to the English 278, with two chapters the
     English does not have \u2014 the Bank of Japan, and the consumption
     tax that splits one rice ball into two rates \u2014 and every example
     rebuilt around Japanese life. */
  {
    id: "quantum-econ-ja",
    work: "quantum-econ",
    img: '/covers/quantum-econ-ja.jpg',
    ic: "\u269b\ufe0f",
    cover: "c4",
    title: "\u91cf\u5b50\u7d4c\u6e08\u5b66\uff1a\u57fa\u790e\u3068\u65e5\u672c\u3078\u306e\u5fdc\u7528",
    author: "Akira Murata",
    cat: "ECON",
    price: 12,
    langs: ["JA"],
    isNew: true,
    level: 4,
    angle: "as measurement \u2014 a price is not discovered, it is collapsed by the act of asking",
    blurb:
      "The Japanese edition, built entirely on Japanese examples. Change the order of the questions and the survey answers change; one sentence from the Governor of the Bank of Japan moves the market in minutes; put two good reasons side by side and the sign-up rate falls. Four tools \u2014 superposition, measurement, interference and entanglement \u2014 make everyday puzzles legible, and two chapters belong to this edition alone: the Bank of Japan\u2019s policy meeting read as a measurement taken on the market, and the consumption tax that charges 8% to eat in and 10% to take away the same rice ball. Twelve chapters in all, with convenience stores, gacha probability disclosures, Mercari pricing, NISA and the economics of fandom. Each chapter carries review questions, with model answers at the back, and the mathematics starts from high school and moves one step at a time.",
    pages: 369,
    published: "2026-08",
    toc: [],
    sp: [],
  },
  /* 583 pages to the English 549, organised for study and job-hunting in
     Japan down to a chapter on career strategy. */
  {
    id: "ai-bible-ja",
    work: "ai-bible",
    img: '/covers/ai-bible-ja.jpg',
    ic: "\ud83e\udde0",
    cover: "c1",
    title: "Awesome AI Bible 2026\uff1a\u751f\u6210AI\u5b8c\u5168\u30ac\u30a4\u30c9",
    author: "Akira Murata",
    cat: "AI",
    price: 12,
    langs: ["JA"],
    isNew: true,
    level: 2,
    angle: "as a five-part work order \u2014 role, context, task, format, constraint",
    blurb:
      "The Japanese edition, written for study and job-hunting in Japan. Twelve chapters and a summing-up cover ChatGPT, Gemini, Claude, Copilot and Perplexity from no knowledge at all; every chapter carries a three-minute challenge you can try while reading. The CO-STAR framework for professional prompting, a five-step workflow for reports and dissertations, five rules for using AI ethically, and a chapter on career strategy from job-hunting to what comes after. For undergraduates and postgraduates using AI on coursework and applications, for secondary and vocational students building AI literacy early, and for people one to three years into work.",
    pages: 583,
    published: "2026-02",
    toc: [],
    sp: [],
  },
  {
    id: "isekai-ko",
    work: "isekai",
    img: '/covers/isekai-ko.jpg',
    ic: "\ud83d\ude80",
    cover: "c2",
    title: "\uc774\uc138\uacc4 \uc5d4\ud130\ud504\ub9ac\ub108\uc2ed \uc785\ubb38",
    author: "Lyra Mizuki \u00b7 Orion Carter",
    cat: "BIZ",
    also: ["FICTION"],
    price: 9,
    langs: ["KO"],
    isNew: true,
    level: 3,
    angle:
      "as negotiation \u2014 getting what you need from someone who does not share your assumptions",
    blurb:
      "The Korean edition, 314 pages. The school library after class became a gateway to another world. High school students Yuu and Aki were supposed to be working on their entrepreneurship assignment when a flash of light carried them into a ruined place where magic and the remnants of civilisation sit side by side. Their only tools are the seven habits they learned in class and their own willingness to act.",
    pages: 314,
    published: "2025-07",
    toc: [],
    sp: [],
  },
  {
    id: "isekai-ja",
    work: "isekai",
    img: '/covers/isekai-ja.jpg',
    ic: "\ud83d\ude80",
    cover: "c2",
    title: "\u7570\u4e16\u754c\u30a2\u30f3\u30c8\u30ec\u30d7\u30ec\u30ca\u30fc\u30b7\u30c3\u30d7\u5165\u9580",
    author: "Lyra Mizuki \u00b7 Orion Carter",
    cat: "BIZ",
    also: ["FICTION"],
    price: 9,
    langs: ["JA"],
    isNew: true,
    level: 3,
    angle:
      "as negotiation \u2014 getting what you need from someone who does not share your assumptions",
    blurb:
      "The Japanese edition, 221 pages. The school library after class became a gateway to another world. High school students Yuu and Aki were supposed to be working on their entrepreneurship assignment when a flash of light carried them into a ruined place where magic and the remnants of civilisation sit side by side. Their only tools are the seven habits they learned in class and their own willingness to act.",
    pages: 221,
    published: "2025-07",
    toc: [],
    sp: [],
  },
  {
    id: "ninja-cat-ko",
    work: "ninja-cat",
    img: '/covers/ninja-cat-ko.jpg',
    ic: "\ud83d\udc31",
    cover: "c5",
    title: "덜렁이 닌자 고양이 쿠로편",
    author: "Fumi Yamaneko",
    cat: "PICTURE",
    price: 7,
    langs: ["KO"],
    isNew: false,
    kids: true,
    level: 1,
    angle: "as practice \u2014 the same mistake, made smaller each time",
    blurb:
      "The Korean edition, 141 pages. The village\u2019s clumsiest ninja cat fails every mission in the best possible way, and learns something from each of them.",
    pages: 141,
    published: "2025-07",
    toc: [],
    sp: [],
  },
];

// Titles with built-in sample spreads — the only ones the demo desk
// (the legacy Reader and the AI panel) can show.
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
  {id: 'ai-token'},
  {id: 'ai-token-in'},
  {id: 'ai-answer'},
  {id: 'ai-answer-in'},
  {id: 'quantum-econ-in'}
  /* Editions are entries now, so a pick is just an id: the jacket, the
     title and the page all follow from it. The UK edition stays off —
     base, UK and India are published under one cover, and two of them
     side by side read as the same book printed twice. */
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


/**
 * Whether this book may be opened in our reader yet.
 *
 * No date means yes. A date that has passed means yes. Comparing whole
 * days rather than instants, because `readerFrom` is a calendar day the
 * exclusivity ends on, and a book should open at the start of that day
 * wherever the reader happens to be standing.
 */
export function readerOpen(book: {readerFrom?: string}, now = new Date()): boolean {
  if (!book.readerFrom) return true;
  return now.toISOString().slice(0, 10) >= book.readerFrom;
}

/** The jacket of one edition. An entry is one edition, so this is its own. */
export function coverFor(id: string): string | undefined {
  return BOOKS.find((b) => b.id === id)?.img;
}

/**
 * Every edition of the same book, in catalogue order, this one included.
 *
 * Editions are separate entries with separate pages, because they are
 * separate books; this is the thread that lets a reader on one find the
 * others rather than having to go looking.
 */
export function editionsOf(book: Book): Book[] {
  if (!book.work) return [book];
  return BOOKS.filter((b) => b.work === book.work);
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
