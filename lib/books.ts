// Local book data for M2–M4. Moves to Supabase (books + book_editions) in M5.
// Content is authored English, faithful to docs/prototype.html — the UI chrome
// around it is translated via next-intl; editions per locale arrive with M5.

export type Lang = "EN" | "KO" | "JA";
export type Category = "AI" | "EDU" | "KIDS" | "BIZ";
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
    id: "ai-bible",
    img: '/covers/ai-bible.jpg',
    ic: "🧠",
    cover: "c1",
    title: "Awesome AI Bible 2026",
    author: "Murata Akira",
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
    pages: 583,
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
    cat: "BIZ",
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
    cat: "KIDS",
    catLabel: "Children · Animal Comedy",
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
