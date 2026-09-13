// M33 — localized book introductions. The catalogue data (lib/books.ts)
// is authored in English; these are the Korean and Japanese versions
// shown on the homepage hero and the detail pages. Other locales read
// the English blurb.

import type {Book} from './books';

type Tri = {ko: string; ja: string};

const BLURBS: Record<string, Tri> = {
  'ai-bible': {
    ko: '첫 프롬프트부터 조직의 AI 정책까지, 생성형 AI를 처음부터 끝까지 다루는 안내서입니다. ChatGPT·Claude·Gemini·Copilot을 열두 장에 걸쳐 다루고, 결과를 믿을 수 있게 만드는 검증 습관을 함께 익힙니다.',
    ja: '最初のプロンプトから組織のAIポリシーまで、生成AIを最初から最後まで扱う手引きです。ChatGPT・Claude・Gemini・Copilotを十二章で取り上げ、結果を信頼できるものにする検証の習慣を身につけます。'
  },
  'quantum-econ': {
    ko: '경제가 양자 법칙을 따른다면 어떨까요. 중첩·측정·얽힘을 도구 삼아, 우리가 왜 그것을 선택하는지를 다시 설명하는 새로운 의사결정 경제학입니다. 일본어판 『量子経済学』은 같은 렌즈로 일본은행과 소비세, 팬덤 경제를 들여다봅니다.',
    ja: 'もし経済が量子の法則に従うとしたら。重ね合わせ・測定・もつれを道具に、なぜ私たちはそれを選ぶのかを説明し直す、意思決定の新しい経済学です。日本語版『量子経済学』は同じレンズで日銀・消費税・推し活を読み解きます。'
  },
  isekai: {
    ko: '교과서 한 권 없이 주도성과 전략, 창업가의 사고를 가르치는 퀘스트형 라이트노벨입니다. 현대의 창업자가 눈을 떠 보니, 정가라는 개념조차 없는 왕국이었습니다.',
    ja: '教科書なしで主体性・戦略・起業家の思考を教える、クエスト型ライトノベルです。現代の起業家が目を覚ますと、そこは定価という概念すらない王国でした。'
  },
  'ninja-cat': {
    ko: '쿠로는 마을에서 제일 덜렁대는 닌자 고양이입니다. 임무마다 어긋나는데, 어긋나는 방식이 꼭 아이들이 바라는 쪽입니다. 4~8세를 위한 동물 코미디 그림책으로, 한국어판 『덜렁이 닌자 고양이』와 일본어판 『おっちょこ忍キャット』이 나와 있습니다.',
    ja: 'クロは村いちばんのおっちょこちょい忍者猫。任務のたびに失敗しますが、その失敗の仕方が、子どもが望むとおりなのです。4〜8歳向けの動物コメディ絵本で、日本語版『おっちょこ忍キャット』と韓国語版が出ています。'
  }
};

export function blurbOf(book: Book, locale: string): string {
  const t = BLURBS[book.id];
  if (locale === 'ko' && t?.ko) return t.ko;
  if (locale === 'ja' && t?.ja) return t.ja;
  return book.blurb;
}
