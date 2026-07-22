// Local book data for M2–M4. Moves to Supabase (books + book_editions) in M5.
// Content is authored English, faithful to docs/prototype.html — the UI chrome
// around it is translated via next-intl; editions per locale arrive with M5.

export type Lang = 'EN' | 'KO' | 'JA';
export type Category = 'AI' | 'EDU' | 'KIDS';
export type Cover = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';

export type Spread = {
  ch?: string; // running chapter label (Space Mono)
  h?: string; // heading, may contain <br>
  x: string; // body HTML (<p>, <b>)
  fig?: {i: string; t: string}; // inline figure: emoji + caption (may contain <br>)
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
  toc: string[];
  sp: Spread[];
};

export const BOOKS: Book[] = [
  {
    id: 'ai-bible',
    ic: '🧠',
    cover: 'c1',
    title: 'Awesome AI Bible 2026',
    author: 'Murata Akira',
    cat: 'AI',
    catLabel: 'AI & Technology',
    price: 12,
    langs: ['EN', 'KO', 'JA'],
    isNew: true,
    level: 2,
    angle: 'as a five-part work order — role, context, task, format, constraint',
    blurb:
      'The complete guide to generative AI, from your first prompt to organisational policy. Twelve chapters covering ChatGPT, Claude, Gemini and Copilot, with the verification habits that keep the output trustworthy.',
    pages: 583,
    published: '2026-02',
    toc: [
      'What generative AI actually is',
      'Choosing between the tools',
      'The structure of a prompt',
      'Why the same prompt differs',
      'Verification and hallucination',
      'Putting it to work',
      'Where not to delegate'
    ],
    sp: [
      {
        ch: 'Chapter 03 · Structure of a prompt',
        h: 'A good prompt<br>has structure',
        x: `<p>What you send a generative model isn't really a question. It is closer to a <b>work order</b>.</p><p>Role, context, task, format, constraint — the more of these you supply, the less your results vary from one run to the next.</p>`
      },
      {
        fig: {i: '🧩', t: 'The five parts<br>Role · Context · Task · Format · Constraint'},
        x: `<p>The part beginners leave out most often is format. Ask a model to "tidy this up" and you get a different shape every time. Say "a table, three columns, forty characters per cell" and the output becomes repeatable.</p><p>Repeatability is what moves prompting from a hobby into work.</p>`
      },
      {
        ch: 'Chapter 03 · Structure of a prompt',
        h: 'Is more context<br>always better?',
        x: `<p>A common mistake. Context is about <b>density, not volume</b>. Pile on unrelated background and the model loses the thread.</p><p>Delete one sentence at a time and watch for the point where the answer gets worse. That is the fastest way to find the floor.</p>`
      },
      {
        fig: {i: '⚖️', t: 'Context density test<br>If deleting it changes nothing, delete it'},
        x: `<p>The principle is identical to briefing a person. Three decision criteria beat the entire project history.</p><p>Much of AI literacy turns out to be <b>the craft of delegation</b>.</p>`
      },
      {
        ch: 'Chapter 04 · Tool differences',
        h: 'Same prompt,<br>different answers',
        x: `<p>ChatGPT, Claude, Gemini and Copilot respond differently to identical input, because their training and alignment differ.</p><p>So when you switch tools, <b>port the prompt as well</b>. Pasting it across unchanged usually costs you quality.</p>`
      },
      {
        fig: {i: '🔧', t: 'Porting checklist<br>Length · format instruction · example count'},
        x: `<p>In practice: fix three reference prompts — summarise, classify, generate — and run them identically on any new tool. The gap between results is your evidence for choosing.</p>`
      }
    ]
  },
  {
    id: 'isekai',
    ic: '🚀',
    cover: 'c2',
    title: 'Isekai Entrepreneurship',
    author: 'Business × Fantasy Light Novel',
    cat: 'EDU',
    catLabel: 'Education · Isekai',
    price: 9,
    langs: ['EN', 'KO'],
    isNew: true,
    level: 3,
    angle: 'as negotiation — getting what you need from someone who does not share your assumptions',
    blurb:
      'A quest-driven light novel that teaches initiative, strategy and startup thinking without a textbook in sight. A modern founder wakes up in a kingdom that has never heard of a fixed price.',
    pages: 312,
    published: '2025-07',
    toc: ['Summoned', 'The first customer', 'The guild war', 'Expansion', 'The winter', 'Return'],
    sp: [
      {
        ch: 'Chapter 1 · Summoned',
        h: 'The kingdom had<br>no market',
        x: `<p>When I opened my eyes I was standing in the middle of an unfamiliar square. People held goods and shouted at one another, but <b>nothing carried a price</b>.</p><p>"Does this country not have fixed prices?" The merchant looked back at me. "What is a fixed price?"</p>`
      },
      {
        fig: {i: '⚔️', t: 'Quest 01<br>Design a way to discover price'},
        x: `<p>If every trade requires haggling, then every trade is expensive. I suspected this was why the kingdom was poor.</p>`
      },
      {
        ch: 'Chapter 2 · The first customer',
        h: 'Sell it before<br>you build it',
        x: `<p>I had made nothing yet. Instead I went to the square and <b>asked twenty people</b> what they would pay to know the price of bread in advance.</p><p>Seventeen laughed. Three asked a serious follow-up question. Those three became my first customers.</p>`
      },
      {
        fig: {i: '🍞', t: 'Quest 02<br>Take three pre-orders before you build'},
        x: `<p>The first thing a venture proves is not the product. It is that <b>someone will pay</b>. Seventeen refusals were not failure; they were the data.</p>`
      },
      {
        ch: 'Chapter 3 · The guild war',
        h: 'A competitor<br>appeared',
        x: `<p>Once my price list spread, the merchants' guild moved. They posted <b>lower prices than mine</b> — plainly at a loss.</p><p>I did not lower mine. I added a delivery guarantee instead.</p>`
      },
      {
        fig: {i: '🛡️', t: 'Quest 03<br>Find the axis where price is not the fight'},
        x: `<p>Fight on price and the deeper pocket wins. A game you cannot win is a game whose <b>rules you must change</b>. That is what positioning means.</p>`
      }
    ]
  },
  {
    id: 'unplugged',
    ic: '🧒',
    cover: 'c3',
    title: 'Unplugged Coding for Kids',
    author: 'AI Literacy Series',
    cat: 'KIDS',
    catLabel: 'Children · Picture Book',
    price: 8,
    langs: ['EN', 'KO'],
    isNew: false,
    level: 1,
    kids: true,
    angle: 'as saying things in order, out loud, with no computer in the room',
    blurb:
      'Six lessons that teach sequence, loops, conditions and debugging using nothing but paper and colouring pencils. Written for ages 7–10 and for the adults teaching them.',
    pages: 96,
    published: '2025-01',
    toc: [
      'What a computer really is',
      'Saying it in order',
      'Doing it again',
      'What if',
      'Getting it wrong is fine',
      'Making friends with AI'
    ],
    sp: [
      {
        ch: 'Lesson 2 · Saying it in order',
        h: 'How to talk<br>to a computer',
        x: `<p>Computers are very clever, but they <b>cannot guess what you mean</b>. You have to tell them one step at a time.</p><p>Say "make me a sandwich" and a computer does nothing. Take out the bread, spread the jam, put the other slice on top — now it can follow.</p>`
      },
      {
        fig: {i: '🥪', t: 'Sandwich activity<br>The teacher becomes the robot'},
        x: `<p>The children laugh their way through this one. When the teacher rubs the whole jar across the bread without opening it, they spot <b>the missing step</b> immediately.</p>`
      },
      {
        ch: 'Lesson 3 · Doing it again',
        h: 'Asking for the same<br>thing many times',
        x: `<p>"Three steps forward, three steps forward, three steps forward." That takes a while to say. <b>"Three steps forward, four times"</b> is shorter.</p><p>Grown-ups call this a loop.</p>`
      },
      {
        fig: {i: '🔁', t: 'Loops with your body<br>Four claps, twice, held on a card'},
        x: `<p>Draw arrows on paper cards and bundle them with a loop card. The children understand code by <b>holding it in their hands</b>.</p>`
      },
      {
        ch: 'Lesson 5 · Getting it wrong',
        h: 'Fixing it is<br>the lesson',
        x: `<p>Programmers get it wrong every single day. Finding the wrong part and fixing it is called <b>debugging</b>.</p><p>What matters is not avoiding mistakes. It is being able to find where the mistake is.</p>`
      },
      {
        fig: {i: '🐛', t: 'Bug hunt<br>Fix a card sequence that was shuffled on purpose'},
        x: `<p>The real aim of this lesson is not coding. It is <b>a classroom where being wrong is safe</b>.</p>`
      }
    ]
  },
  {
    id: 'sme-ai',
    ic: '💡',
    cover: 'c4',
    title: 'AI for Small Business',
    author: 'Awesome AI Series',
    cat: 'AI',
    catLabel: 'SME · Productivity',
    price: 14,
    langs: ['EN', 'JA'],
    isNew: false,
    level: 3,
    angle: 'as an operations problem — which repeated task to hand over first',
    blurb:
      'Reclaim thirty minutes a day. A practical programme for small teams adopting AI one task at a time, with the arithmetic to show whether it actually paid off.',
    pages: 214,
    published: '2025-11',
    toc: [
      'Where the time actually goes',
      'Your first automation',
      'Writing and email',
      'Data and reports',
      'Customer conversations',
      'What it costs to run'
    ],
    sp: [
      {
        ch: 'Chapter 02 · First automation',
        h: 'Start with one<br>repeated task',
        x: `<p>AI adoption usually fails because a team tries to change everything. The ones that succeed begin with <b>a single repeated task</b>.</p><p>Meeting notes, first-draft email, sorting enquiries — daily, and harmless if it goes wrong.</p>`
      },
      {
        fig: {i: '⏱️', t: 'First candidate test<br>Daily · low risk · fixed format'},
        x: `<p>Only move on after one clear success. Trust inside an organisation is built from <b>repeated wins</b>, not speed.</p>`
      },
      {
        ch: 'Chapter 01 · Where time goes',
        h: 'The thirty-minute<br>audit',
        x: `<p>For one week, write down every task that took under fifteen minutes and happened more than three times.</p><p>That list, not your instinct, tells you <b>where the hours are going</b>.</p>`
      },
      {
        fig: {i: '📋', t: 'The audit sheet<br>Task · frequency · minutes · risk if wrong'},
        x: `<p>Most teams are surprised. The expensive work is rarely the work that feels expensive.</p>`
      },
      {
        ch: 'Chapter 06 · Costs',
        h: 'When not<br>to automate',
        x: `<p>If a task happens twice a month and takes four minutes, automating it will cost more than it saves — <b>for years</b>.</p><p>Enthusiasm is not a business case.</p>`
      },
      {
        fig: {i: '🧮', t: 'Break-even<br>Setup hours ÷ minutes saved per month'},
        x: `<p>Run the arithmetic before the pilot, not after it. The number is usually decisive.</p>`
      }
    ]
  },
  {
    id: 'little-robot',
    ic: '🌏',
    cover: 'c5',
    title: "Little Robot's Big Day",
    author: 'Picture Book Series',
    cat: 'KIDS',
    catLabel: 'Children · Story',
    price: 7,
    langs: ['KO', 'JA'],
    isNew: false,
    level: 1,
    kids: true,
    angle: 'as a story about asking for help when you do not know what to do',
    blurb:
      'A small robot leaves the workshop for the first time and learns that asking for help is not a malfunction. For ages 4–7, with a gentle note for grown-ups at the back.',
    pages: 48,
    published: '2025-01',
    toc: ['The workshop', 'The wide road', 'The lost cat', 'Asking for help', 'Going home'],
    sp: [
      {
        ch: '1 · The workshop',
        h: 'The door<br>was open',
        x: `<p>Every morning the little robot swept the same floor. Every morning the door stayed shut.</p><p>Then one morning it <b>was not shut</b>.</p>`
      },
      {
        fig: {i: '🚪', t: 'Look closely<br>What can you see through the door?'},
        x: `<p>Outside there was a smell the robot had no word for. It was rain on warm stone.</p>`
      },
      {
        ch: '2 · The wide road',
        h: 'The road was<br>very wide',
        x: `<p>The robot had been built to sweep one room. The road was <b>much bigger than one room</b>.</p><p>Its wheels wobbled. It sat down on the kerb.</p>`
      },
      {
        fig: {i: '🛣️', t: 'Talk about it<br>When did something feel too big for you?'},
        x: `<p>A pigeon landed beside it and did not say anything useful at all.</p>`
      },
      {
        ch: '4 · Asking for help',
        h: 'Asking is not<br>the same as breaking',
        x: `<p>"I do not know the way," said the little robot. It had never said that out loud before.</p><p>The girl with the red umbrella said, "That's alright. <b>I do.</b>"</p>`
      },
      {
        fig: {i: '☂️', t: 'For grown-ups<br>Naming what you do not know is a skill'},
        x: `<p>They walked back together, and the robot's wheels did not wobble once.</p>`
      }
    ]
  },
  {
    id: 'prompt-guide',
    ic: '📝',
    cover: 'c6',
    title: 'Prompt Engineering Guide',
    author: 'Practical AI Series',
    cat: 'EDU',
    catLabel: 'Education',
    price: 0,
    langs: ['EN', 'KO', 'JA'],
    isNew: false,
    level: 2,
    angle: 'as seven tested patterns you select between, like choosing a tool',
    blurb:
      'Seven tested patterns, a regression-test method for prompts, and templates you can copy straight into work. Written for teams who need the same answer twice.',
    pages: 168,
    published: '2025-09',
    toc: [
      'Why patterns beat cleverness',
      'The seven patterns',
      'Testing a prompt',
      'Managing prompts as assets',
      'Anti-patterns',
      'Appendix: templates'
    ],
    sp: [
      {
        ch: 'Part 02 · Patterns',
        h: 'Seven patterns that<br>hold up at work',
        x: `<p>Prompting is not an art, it is <b>engineering</b>. A small set of patterns has been tested to death and most real tasks reduce to one of them.</p><p>Few-shot, chain-of-thought, role-play, template-fill, critique-revise, decomposition, self-consistency.</p>`
      },
      {
        fig: {i: '🗂️', t: 'Choosing a pattern<br>Ambiguity of task × rigidity of output'},
        x: `<p>Vague tasks want decomposition; rigid output wants a template. Mix them later — validate one at a time first.</p>`
      },
      {
        ch: 'Part 02 · Patterns',
        h: 'Few-shot:<br>the power of examples',
        x: `<p>Two worked examples will often beat ten lines of careful explanation, because the model is built for <b>pattern inference</b>.</p><p>But the examples must be in exactly the output shape you want. Describe them in prose and the effect halves.</p>`
      },
      {
        fig: {i: '🎯', t: 'Example count trial<br>The jump is 0-shot to 2-shot'},
        x: `<p>Past three examples the gains fall away sharply. <b>Two is usually the best value.</b></p>`
      },
      {
        ch: 'Part 05 · Anti-patterns',
        h: 'Things that<br>do nothing',
        x: `<p>"Do your best." "Like an expert." "Be creative." These <b>emotional modifiers</b> produce no measurable improvement.</p><p>Give a criterion instead: forty characters per item, include a source URL.</p>`
      },
      {
        fig: {i: '🚫', t: 'Empty words<br>Best · perfect · expert · creative'},
        x: `<p>An instruction you cannot measure <b>is not an instruction</b>. Keeping only this rule already lifts prompt quality noticeably.</p>`
      }
    ]
  }
];
