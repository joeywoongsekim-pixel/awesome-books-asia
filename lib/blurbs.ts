// M33 — localized book copy. The catalogue data (lib/books.ts) is
// authored in English; this file carries every other language for the
// blurb and the table of contents, which are the two long passages a
// detail page shows. M150 filled in the six locales that were still
// falling back to English.

import type {Book} from './books';

type Copy = Partial<Record<'ko' | 'ja' | 'hi' | 'fil' | 'de' | 'fr' | 'es' | 'pt', string>>;
type List = Partial<Record<'ko' | 'ja' | 'hi' | 'fil' | 'de' | 'fr' | 'es' | 'pt', string[]>>;

const BLURBS: Record<string, Copy> = {
  'ai-token': {
    ko:
      "AI 이용료는 싸 보입니다. 그런데 확인하고 손보는 데 시간이 듭니다. 그래도 이득이라고 할 수 있을까요. AI로 문서와 자료를 만드는 직장인, 그리고 AI·경제학·경영학에 관심 있는 대학생을 위한 입문서입니다. 일 하나를 끝까지 마치는 과정에서 성과의 질, AI에 내는 돈, 사람이 쓰는 시간을 하나씩 가늠합니다. 회사원 다카시와 대학생 쿄코의 이야기, 가까운 예의 도해, 가상의 계산을 통해 “몇 번 만들었는가”와 “쓸 수 있는 결과”를 나누어 봅니다. AI가 문장을 처리하는 단위인 토큰과 요금의 관계를 짚고, 월정액과 종량 요금에 더해 사람이 확인하고 고치는 시간까지 시야에 넣습니다. 여덟 장에 실천 노트와, 힌트·예시 답이 붙은 18개의 과제. 마지막에는 AI를 떠받치는 반도체·전력·데이터센터까지 시야를 넓힙니다.",
    ja:
      "AIの利用料は安く見える。でも、確認と手直しに時間がかかる。それでも、得をしたと言えるだろうか。AIで文書・資料を作る社会人と、AI・経済学・経営学に関心のある大学生へ。一つの仕事を仕上げる過程から、成果の質・AIに払う費用・人が使う時間を見極める入門書です。会社員たかしと大学生きょうこの物語、身近な図解、仮想の計算例を通して、生成した回数と使える成果を分けて考えます。文章を処理する単位「トークン」と料金の関係を押さえ、月額・従量の支払に加えて、人が確かめ、直す時間まで視野に入れます。全八章に実践ノートと、ヒント・解答例付きの18のチャレンジ課題。巻末では、AIを支える半導体・電力・データセンターへと視野を広げます。",
    hi:
      "घंटे के हिसाब से AI सस्ता लगता है — जब तक आप जाँचने और सुधारने का समय न जोड़ें। AI से दस्तावेज़ बनाने वालों के लिए, और अर्थशास्त्र व प्रबंधन के विद्यार्थियों के लिए। यह किताब एक काम को शुरू से अंत तक ले जाती है और पूछती है कि उसकी असली लागत क्या थी: नतीजे की गुणवत्ता, मॉडल को दिया गया पैसा, और इंसान के लगाए घंटे। दफ़्तर में काम करने वाले ताकाशी और छात्रा क्योको के ज़रिए यह अलग करके देखती है कि आपने कितनी बार बनवाया और उसमें से कितना काम आया; बताती है कि टोकन क्या है और बिलिंग उसके पीछे कैसे चलती है; और वह मानवीय समय वापस जोड़ती है जिसका कोई बिल नहीं बनता। आठ अध्याय, अभ्यास नोट, हल सहित अठारह चुनौतियाँ, और अंत में AI के नीचे बिछे चिप, बिजली और डेटा सेंटर पर एक नज़र।",
    fil:
      "Mukhang mura ang AI kada oras — hangga't hindi mo binibilang ang pagsusuri at pagsasaayos. Para sa mga gumagawa ng dokumento gamit ang AI, at para sa mga mag-aaral ng ekonomiks at pamamahala. Sinusundan ng aklat na ito ang isang trabaho mula umpisa hanggang tapos at itinatanong kung magkano talaga ang naging gastos: ang kalidad ng resulta, ang perang ibinayad sa modelo, at ang oras ng tao. Sa pamamagitan nina Takashi, isang empleyado, at Kyoko, isang estudyante, pinaghihiwalay nito kung ilang beses kang bumuo at kung gaano karami ang nagamit mo; ipinapaliwanag kung ano ang token at kung paano sumusunod dito ang siningil; at ibinabalik ang oras ng tao na walang naniningil. Walong kabanata na may practice notes, labingwalong hamon na may sagot, at sa dulo ay ang mga chip, kuryente at data center sa ilalim ng lahat.",
    de:
      "Pro Stunde wirkt KI billig — bis man das Prüfen und Nachbessern mitzählt. Für alle, die mit KI Dokumente erstellen, und für Studierende der Wirtschaft und des Managements. Dieses Buch begleitet eine einzige Arbeit vom Auftrag bis zum Ergebnis und fragt, was sie wirklich gekostet hat: die Qualität des Resultats, das an das Modell gezahlte Geld und die Stunden eines Menschen. Anhand von Takashi, einem Angestellten, und Kyoko, einer Studentin, trennt es, wie oft Sie etwas erzeugt haben, von dem, was Sie davon verwenden konnten; erklärt, was ein Token ist und wie die Abrechnung ihm folgt; und rechnet die menschliche Zeit zurück, die niemand in Rechnung stellt. Acht Kapitel mit Praxisnotizen, achtzehn Aufgaben mit Lösungen und zum Schluss ein Blick auf Chips, Strom und Rechenzentren darunter.",
    fr:
      "À l'heure, l'IA paraît bon marché — jusqu'à ce qu'on compte la vérification et les retouches. Pour celles et ceux qui produisent des documents avec l'IA, et pour les étudiants en économie et en gestion. Ce livre suit un seul travail du brief au résultat et demande ce qu'il a réellement coûté : la qualité du rendu, l'argent versé au modèle et les heures d'une personne. À travers Takashi, employé de bureau, et Kyoko, étudiante, il sépare le nombre de générations de ce qui était réellement utilisable ; explique ce qu'est un token et comment la facturation le suit ; et réintègre le temps humain que personne ne facture. Huit chapitres avec carnets de pratique, dix-huit exercices corrigés, et pour finir un regard sur les puces, l'électricité et les centres de données en dessous.",
    es:
      "Por hora, la IA parece barata — hasta que cuentas la revisión y los arreglos. Para quienes hacen documentos con IA y para estudiantes de economía y gestión. Este libro sigue un solo trabajo desde el encargo hasta el final y pregunta cuánto costó de verdad: la calidad del resultado, el dinero pagado al modelo y las horas de una persona. A través de Takashi, oficinista, y Kyoko, estudiante, separa cuántas veces generaste algo de cuánto pudiste aprovechar; explica qué es un token y cómo la facturación lo sigue; y devuelve a la cuenta el tiempo humano que nadie factura. Ocho capítulos con notas de práctica, dieciocho retos resueltos y, al final, una mirada a los chips, la electricidad y los centros de datos que hay debajo.",
    pt:
      "Por hora, a IA parece barata — até você contar a conferência e os ajustes. Para quem faz documentos com IA e para estudantes de economia e gestão. Este livro acompanha um único trabalho do briefing ao resultado e pergunta quanto ele custou de verdade: a qualidade do resultado, o dinheiro pago ao modelo e as horas de uma pessoa. Por meio de Takashi, funcionário de escritório, e Kyoko, estudante, ele separa quantas vezes você gerou algo de quanto disso deu para usar; explica o que é um token e como a cobrança segue atrás dele; e devolve à conta o tempo humano que ninguém fatura. Oito capítulos com notas de prática, dezoito desafios com respostas e, no fim, um olhar sobre os chips, a energia e os data centers por baixo."
  },
  'ai-answer': {
    ko:
      "AI의 답은 나왔다. 그런데 어디까지 쓸 수 있을까? 보고서와 탐구 활동, 기획 회의에서 \"쓸 수 있는 이유\"를 자기 말로 설명하기 위한 책입니다. 물리학·생명과학·사회 시뮬레이션 이야기에서 출발해, 사람이 더해야 할 세 가지 — 목적을 정하고, 근거로 돌아가는 질문을 갖고, 쓸지 말지를 고르는 일 — 를 도해 80점과 짧은 연습, 두 인물의 이야기 여덟 편으로 익힙니다. 고등학생의 탐구 학습부터 대학 세미나, AI를 일에 쓰려는 직장인까지.",
    ja:
      "AIの答えは出た。では、どこまで使える？ レポートで、探究で、企画会議で、「使える理由」を自分の言葉で説明するための一冊。物理学・生命科学・社会シミュレーションの話から、人間が足す三つのこと — 目的を決める、根拠へ戻る問いを持つ、使い方を選ぶ — を、80点の図版と短い演習、大学生きょうこと社会人たかしの八つの物語で身につけます。高校生の探究学習から大学のゼミ、AIを仕事に使いたい社会人まで。",
    hi:
      "AI ने अपना जवाब दे दिया — अब आप उसे कहाँ तक इस्तेमाल कर सकते हैं? भौतिकी, जीवविज्ञान और सामाजिक सिमुलेशन से चलकर यह सचित्र, कहानी-आधारित किताब वे तीन चीज़ें सिखाती है जो इंसान जोड़ता है: उद्देश्य तय करना, प्रमाण तक लौटना, और नतीजे का क्या करना है यह चुनना। अस्सी चित्र, छोटे अभ्यास, और दो पाठकों के साथ एक बरस चलने वाले आठ प्रसंग। स्कूल की खोजबीन से लेकर विश्वविद्यालय की कक्षा तक, और उन सबके लिए जो AI को काम में लगाना चाहते हैं।",
    fil:
      "Nagbigay na ng sagot ang AI — hanggang saan mo ito magagamit? Isang may-larawang aklat na hinimay sa pamamagitan ng kuwento, mula pisika, agham-buhay at social simulation, upang ituro ang tatlong bagay na idinaragdag ng tao: ang pagtatakda ng layunin, ang pagbabalik sa ebidensiya, at ang pagpili kung paano gagamitin ang resulta. Walumpung larawan, maikling pagsasanay, at walong yugtong sumusunod sa dalawang mambabasa sa loob ng isang taon. Para sa pagsisiyasat sa hayskul, sa seminar sa unibersidad, at sa sinumang gustong gamitin ang AI sa trabaho.",
    de:
      "Die KI hat geantwortet — wie weit können Sie das verwenden? Ein bebildertes, erzählend aufgebautes Lesebuch zur KI-Kompetenz, das sich aus Physik, Lebenswissenschaften und Sozialsimulation speist und die drei Dinge lehrt, die Menschen hinzufügen: den Zweck bestimmen, zur Evidenz zurückgehen und entscheiden, wie das Ergebnis genutzt wird. Achtzig Abbildungen, kurze Übungen und acht Zwischenstücke, die zwei Lesenden durch ein Jahr folgen. Für forschendes Lernen an der Schule, Universitätsseminare und alle, die KI in die Arbeit holen.",
    fr:
      "L'IA a donné sa réponse — jusqu'où pouvez-vous l'utiliser ? Un livre illustré et porté par le récit, nourri de physique, de sciences du vivant et de simulation sociale, qui enseigne les trois choses qu'un humain ajoute : fixer l'objectif, remonter aux preuves et décider de l'usage du résultat. Quatre-vingts figures, de courts exercices et huit intermèdes qui suivent deux lecteurs au fil d'une année. Pour la démarche d'investigation au lycée, les séminaires universitaires et quiconque met l'IA au travail.",
    es:
      "La IA ya dio su respuesta — ¿hasta dónde puedes usarla? Un lector ilustrado y narrado que parte de la física, las ciencias de la vida y la simulación social para enseñar las tres cosas que añade una persona: fijar el propósito, volver a la evidencia y decidir cómo usar el resultado. Ochenta figuras, ejercicios breves y ocho interludios que siguen a dos lectores a lo largo de un año. Para la indagación en secundaria, los seminarios universitarios y cualquiera que ponga la IA a trabajar.",
    pt:
      "A IA já deu sua resposta — até onde você pode usá-la? Um livro ilustrado e conduzido por histórias que parte da física, das ciências da vida e da simulação social para ensinar as três coisas que a pessoa acrescenta: definir o propósito, voltar às evidências e escolher o que fazer com o resultado. Oitenta figuras, exercícios curtos e oito interlúdios que acompanham dois leitores ao longo de um ano. Para a investigação no ensino médio, seminários universitários e quem quer pôr a IA para trabalhar."
  },
  'ai-bible': {
    ko:
      "첫 프롬프트부터 조직의 AI 정책까지, 생성형 AI를 처음부터 끝까지 다루는 안내서입니다. ChatGPT·Claude·Gemini·Copilot을 열두 장에 걸쳐 다루고, 결과를 믿을 수 있게 만드는 검증 습관을 함께 익힙니다.",
    ja:
      "最初のプロンプトから組織のAIポリシーまで、生成AIを最初から最後まで扱う手引きです。ChatGPT・Claude・Gemini・Copilotを十二章で取り上げ、結果を信頼できるものにする検証の習慣を身につけます。",
    hi:
      "जनरेटिव AI की पूरी गाइड — आपके पहले प्रॉम्प्ट से लेकर संगठन की नीति तक। ChatGPT, Claude, Gemini और Copilot पर बारह अध्याय, और वे जाँच की आदतें जो नतीजे को भरोसेमंद बनाए रखती हैं।",
    fil:
      "Ang kumpletong gabay sa generative AI, mula sa unang prompt mo hanggang sa patakaran ng organisasyon. Labindalawang kabanata tungkol sa ChatGPT, Claude, Gemini at Copilot, kasama ang mga gawi sa pagsusuri na nagpapanatiling mapagkakatiwalaan ang resulta.",
    de:
      "Der vollständige Leitfaden zur generativen KI, vom ersten Prompt bis zur Richtlinie im Unternehmen. Zwölf Kapitel zu ChatGPT, Claude, Gemini und Copilot — mit den Prüfgewohnheiten, die das Ergebnis vertrauenswürdig halten.",
    fr:
      "Le guide complet de l'IA générative, de votre premier prompt à la politique d'entreprise. Douze chapitres consacrés à ChatGPT, Claude, Gemini et Copilot, avec les habitudes de vérification qui rendent le résultat fiable.",
    es:
      "La guía completa de la IA generativa, desde tu primer prompt hasta la política de la organización. Doce capítulos sobre ChatGPT, Claude, Gemini y Copilot, con los hábitos de verificación que mantienen fiable el resultado.",
    pt:
      "O guia completo da IA generativa, do seu primeiro prompt à política da organização. Doze capítulos sobre ChatGPT, Claude, Gemini e Copilot, com os hábitos de verificação que mantêm o resultado confiável."
  },
  'quantum-econ': {
    ko:
      "경제가 양자 법칙을 따른다면 어떨까요. 중첩·측정·얽힘을 도구 삼아, 우리가 왜 그것을 선택하는지를 다시 설명하는 새로운 의사결정 경제학입니다. 일본어판 『量子経済学』은 같은 렌즈로 일본은행과 소비세, 팬덤 경제를 들여다봅니다.",
    ja:
      "もし経済が量子の法則に従うとしたら。重ね合わせ・測定・もつれを道具に、なぜ私たちはそれを選ぶのかを説明し直す、意思決定の新しい経済学です。日本語版『量子経済学』は同じレンズで日銀・消費税・推し活を読み解きます。",
    hi:
      "अगर अर्थव्यवस्था क्वांटम नियमों से चले तो? सुपरपोज़िशन, मापन और एंटैंगलमेंट को औज़ार बनाकर यह किताब निर्णय के नए अर्थशास्त्र को समझाती है — आप जो चुनते हैं, वह क्यों चुनते हैं। जापानी संस्करण (量子経済学) इसी नज़र से बैंक ऑफ़ जापान, उपभोग कर और फ़ैन-इकॉनमी को पढ़ता है।",
    fil:
      "Paano kung sumusunod ang ekonomiya sa mga panuntunang quantum? Ang superposition, pagsukat at entanglement bilang gamit sa bagong ekonomiks ng pagpapasya — kung bakit mo pinipili ang pinipili mo. Sa edisyong Hapon (量子経済学), ang parehong lente ay itinutok sa BOJ, buwis sa konsumo at fan economy.",
    de:
      "Was, wenn die Wirtschaft Quantenregeln folgt? Superposition, Messung und Verschränkung als Werkzeugkasten für die neue Ökonomie der Entscheidung — warum Sie wählen, was Sie wählen. Die japanische Ausgabe (量子経済学) legt dieselbe Linse an die Bank of Japan, die Verbrauchsteuer und die Fan-Ökonomie an.",
    fr:
      "Et si l'économie obéissait aux règles quantiques ? Superposition, mesure et intrication comme boîte à outils de la nouvelle économie de la décision — pourquoi vous choisissez ce que vous choisissez. L'édition japonaise (量子経済学) applique la même grille à la Banque du Japon, à la taxe sur la consommation et à l'économie des fans.",
    es:
      "¿Y si la economía obedeciera reglas cuánticas? Superposición, medición y entrelazamiento como caja de herramientas de la nueva economía de la decisión: por qué eliges lo que eliges. La edición japonesa (量子経済学) aplica la misma lente al Banco de Japón, al impuesto al consumo y a la economía de los fans.",
    pt:
      "E se a economia obedecesse a regras quânticas? Superposição, medição e emaranhamento como caixa de ferramentas da nova economia da decisão — por que você escolhe o que escolhe. A edição japonesa (量子経済学) usa a mesma lente para o Banco do Japão, o imposto sobre consumo e a economia de fãs."
  },
  'quantum-econ-uk': {
    ko:
      "『Quantum Economics』의 영국판입니다. 중첩·측정·얽힘을 도구 삼아 우리가 왜 그것을 선택하는지를 다시 설명하는 의사결정 경제학으로, 영국 독자를 위한 사례와 표기를 씁니다. 본문은 영어입니다.",
    ja:
      "『Quantum Economics』の英国版です。重ね合わせ・測定・もつれを道具に、なぜ私たちはそれを選ぶのかを説明し直す意思決定の経済学で、英国の読者に向けた事例と綴りを用いています。本文は英語です。",
    hi:
      "Quantum Economics का ब्रिटिश संस्करण: सुपरपोज़िशन, मापन और एंटैंगलमेंट को औज़ार बनाकर निर्णय का नया अर्थशास्त्र, ब्रिटिश उदाहरणों और वर्तनी के साथ। पाठ अंग्रेज़ी में है।",
    fil:
      "Ang edisyong UK ng Quantum Economics: superposition, pagsukat at entanglement bilang gamit sa bagong ekonomiks ng pagpapasya, may mga halimbawa at ispeling na British. Nasa Ingles ang teksto.",
    de:
      "Die britische Ausgabe von Quantum Economics: Superposition, Messung und Verschränkung als Werkzeugkasten für die neue Ökonomie der Entscheidung, mit britischen Beispielen und britischer Schreibweise. Der Text ist auf Englisch.",
    fr:
      "L'édition britannique de Quantum Economics : superposition, mesure et intrication comme boîte à outils de la nouvelle économie de la décision, avec des exemples et une orthographe britanniques. Le texte est en anglais.",
    es:
      "La edición británica de Quantum Economics: superposición, medición y entrelazamiento como caja de herramientas de la nueva economía de la decisión, con ejemplos y ortografía británicos. El texto está en inglés.",
    pt:
      "A edição britânica de Quantum Economics: superposição, medição e emaranhamento como caixa de ferramentas da nova economia da decisão, com exemplos e grafia britânicos. O texto está em inglês."
  },
  'quantum-econ-in': {
    ko:
      "『Quantum Economics』의 인도판입니다. 중첩·측정·얽힘을 도구 삼아 우리가 왜 그것을 선택하는지를 다시 설명하는 의사결정 경제학으로, 인도의 독자와 시장에 맞춘 사례를 씁니다. 본문은 영어입니다.",
    ja:
      "『Quantum Economics』のインド版です。重ね合わせ・測定・もつれを道具に、なぜ私たちはそれを選ぶのかを説明し直す意思決定の経済学で、インドの読者と市場に合わせた事例を用いています。本文は英語です。",
    hi:
      "Quantum Economics का भारतीय संस्करण: सुपरपोज़िशन, मापन और एंटैंगलमेंट को औज़ार बनाकर निर्णय का नया अर्थशास्त्र, भारतीय पाठकों और बाज़ारों को ध्यान में रखकर। पाठ अंग्रेज़ी में है।",
    fil:
      "Ang edisyong India ng Quantum Economics: superposition, pagsukat at entanglement bilang gamit sa bagong ekonomiks ng pagpapasya, nakaayon sa mga mambabasa at pamilihan sa India. Nasa Ingles ang teksto.",
    de:
      "Die indische Ausgabe von Quantum Economics: Superposition, Messung und Verschränkung als Werkzeugkasten für die neue Ökonomie der Entscheidung, zugeschnitten auf indische Leserinnen, Leser und Märkte. Der Text ist auf Englisch.",
    fr:
      "L'édition indienne de Quantum Economics : superposition, mesure et intrication comme boîte à outils de la nouvelle économie de la décision, pensée pour les lecteurs et les marchés indiens. Le texte est en anglais.",
    es:
      "La edición india de Quantum Economics: superposición, medición y entrelazamiento como caja de herramientas de la nueva economía de la decisión, pensada para lectores y mercados de la India. El texto está en inglés.",
    pt:
      "A edição indiana de Quantum Economics: superposição, medição e emaranhamento como caixa de ferramentas da nova economia da decisão, pensada para leitores e mercados da Índia. O texto está em inglês."
  },
  isekai: {
    ko:
      "교과서 한 권 없이 주도성과 전략, 창업가의 사고를 가르치는 퀘스트형 라이트노벨입니다. 현대의 창업자가 눈을 떠 보니, 정가라는 개념조차 없는 왕국이었습니다.",
    ja:
      "教科書なしで主体性・戦略・起業家の思考を教える、クエスト型ライトノベルです。現代の起業家が目を覚ますと、そこは定価という概念すらない王国でした。",
    hi:
      "एक क्वेस्ट-आधारित लाइट नॉवेल जो पहल, रणनीति और स्टार्टअप सोच सिखाता है — बिना किसी पाठ्यपुस्तक के। आज का एक उद्यमी आँख खोलता है और पाता है कि वह ऐसे राज्य में है जिसने कभी तय क़ीमत का नाम तक नहीं सुना।",
    fil:
      "Isang light novel na hinimay sa mga quest, nagtuturo ng inisyatiba, estratehiya at pag-iisip ng startup nang walang anumang aklat-aralin. Nagising ang isang makabagong negosyante sa isang kahariang hindi pa nakakarinig ng takdang presyo.",
    de:
      "Ein questgetriebener Light Novel, der Eigeninitiative, Strategie und Gründerdenken lehrt — ganz ohne Lehrbuch. Ein heutiger Gründer wacht in einem Königreich auf, das noch nie von einem Festpreis gehört hat.",
    fr:
      "Un light novel construit en quêtes, qui enseigne l'initiative, la stratégie et la pensée entrepreneuriale sans le moindre manuel. Un fondateur d'aujourd'hui se réveille dans un royaume qui n'a jamais entendu parler de prix fixe.",
    es:
      "Una novela ligera hecha de misiones que enseña iniciativa, estrategia y pensamiento emprendedor sin un solo libro de texto. Un fundador de hoy despierta en un reino que nunca ha oído hablar del precio fijo.",
    pt:
      "Uma light novel feita de missões que ensina iniciativa, estratégia e pensamento empreendedor sem nenhum livro didático. Um fundador de hoje acorda num reino que nunca ouviu falar em preço fixo."
  },
  'ninja-cat': {
    ko:
      "쿠로는 마을에서 제일 덜렁대는 닌자 고양이입니다. 임무마다 어긋나는데, 어긋나는 방식이 꼭 아이들이 바라는 쪽입니다. 4~8세를 위한 동물 코미디 그림책으로, 한국어판 『덜렁이 닌자 고양이』와 일본어판 『おっちょこ忍キャット』이 나와 있습니다.",
    ja:
      "クロは村いちばんのおっちょこちょい忍者猫。任務のたびに失敗しますが、その失敗の仕方が、子どもが望むとおりなのです。4〜8歳向けの動物コメディ絵本で、日本語版『おっちょこ忍キャット』と韓国語版が出ています。",
    hi:
      "कुरो एक निंजा बिल्ली है — शायद गाँव की सबसे फूहड़। हर मिशन ठीक उसी तरह बिगड़ता है जैसा आप चाहते हैं। 4–8 साल के बच्चों के लिए चित्रों वाली जानवर-कॉमेडी। कोरियाई (덜렁이 닌자 고양이) और जापानी (おっちょこ忍キャット) में प्रकाशित।",
    fil:
      "Si Kuro ay isang ninja cat — malamang ang pinaka-clumsy sa buong nayon. Bawat misyon ay nasisira nang eksaktong paraang gusto mong masira. Isang picture book na komedya ng hayop para sa edad 4–8. Nalathala sa Koreano (덜렁이 닌자 고양이) at Hapon (おっちょこ忍キャット).",
    de:
      "Kuro ist eine Ninja-Katze — vermutlich die tollpatschigste im Dorf. Jeder Auftrag geht genau so schief, wie man es sich wünscht. Ein Bilderbuch voll Tierkomik für 4- bis 8-Jährige. Erschienen auf Koreanisch (덜렁이 닌자 고양이) und Japanisch (おっちょこ忍キャット).",
    fr:
      "Kuro est un chat ninja — sans doute le plus maladroit du village. Chaque mission rate exactement comme on l'espérait. Un album de comédie animalière pour les 4 à 8 ans. Publié en coréen (덜렁이 닌자 고양이) et en japonais (おっちょこ忍キャット).",
    es:
      "Kuro es un gato ninja — probablemente el más torpe del pueblo. Cada misión sale mal exactamente como uno espera. Un álbum ilustrado de comedia animal para niños de 4 a 8 años. Publicado en coreano (덜렁이 닌자 고양이) y japonés (おっちょこ忍キャット).",
    pt:
      "Kuro é um gato ninja — provavelmente o mais atrapalhado da aldeia. Cada missão dá errado exatamente do jeito que a gente quer. Um livro ilustrado de comédia animal para crianças de 4 a 8 anos. Publicado em coreano (덜렁이 닌자 고양이) e japonês (おっちょこ忍キャット)."
  }
};

export function blurbOf(book: Book, locale: string): string {
  return BLURBS[book.id]?.[locale as keyof Copy] ?? book.blurb;
}

/* The contents list, which is catalogue data and therefore English. Four
   books carry one; a reader on a translated page was looking at English
   chapter titles under a translated heading. */
const TOCS: Record<string, List> = {
  'ai-bible': {
    ko: [
      "생성형 AI란 무엇인가",
      "도구를 고르는 법",
      "프롬프트의 구조",
      "같은 프롬프트, 다른 답",
      "검증과 환각",
      "일에 쓰기",
      "맡기지 말아야 할 것"
    ],
    ja: [
      "生成AIとは何か",
      "ツールの選び方",
      "プロンプトの構造",
      "同じプロンプト、違う答え",
      "検証とハルシネーション",
      "仕事で使う",
      "任せてはいけないこと"
    ],
    hi: [
      "जनरेटिव AI असल में है क्या",
      "औज़ार कैसे चुनें",
      "प्रॉम्प्ट की बनावट",
      "एक ही प्रॉम्प्ट, अलग जवाब",
      "जाँच और मतिभ्रम",
      "काम में लगाना",
      "क्या नहीं सौंपना है"
    ],
    fil: [
      "Ano talaga ang generative AI",
      "Pagpili sa mga kasangkapan",
      "Ang hugis ng isang prompt",
      "Bakit nagkakaiba ang parehong prompt",
      "Pagsusuri at halusinasyon",
      "Paggamit nito sa trabaho",
      "Ano ang hindi dapat ipaubaya"
    ],
    de: [
      "Was generative KI wirklich ist",
      "Die Wahl zwischen den Werkzeugen",
      "Der Aufbau eines Prompts",
      "Warum derselbe Prompt anders ausfällt",
      "Prüfung und Halluzination",
      "KI in die Arbeit holen",
      "Was man nicht delegiert"
    ],
    fr: [
      "Ce qu'est vraiment l'IA générative",
      "Choisir entre les outils",
      "La structure d'un prompt",
      "Pourquoi le même prompt varie",
      "Vérification et hallucination",
      "La mettre au travail",
      "Ce qu’il ne faut pas déléguer"
    ],
    es: [
      "Qué es realmente la IA generativa",
      "Elegir entre las herramientas",
      "La estructura de un prompt",
      "Por qué el mismo prompt varía",
      "Verificación y alucinación",
      "Ponerla a trabajar",
      "Lo que no se delega"
    ],
    pt: [
      "O que é de fato a IA generativa",
      "Escolher entre as ferramentas",
      "A estrutura de um prompt",
      "Por que o mesmo prompt varia",
      "Verificação e alucinação",
      "Pôr a IA para trabalhar",
      "O que não se delega"
    ]
  },
  'quantum-econ': {
    ko: [
      "고전 모형이 놓치는 것",
      "중첩으로서의 선택",
      "측정으로서의 가격",
      "얽힌 시장",
      "터널링과 혁신",
      "양자 경제의 정책"
    ],
    ja: [
      "古典モデルが取りこぼすもの",
      "重ね合わせとしての選択",
      "測定としての価格",
      "もつれ合う市場",
      "トンネル効果とイノベーション",
      "量子経済の政策"
    ],
    hi: [
      "शास्त्रीय मॉडल क्या चूक जाते हैं",
      "सुपरपोज़िशन के रूप में चुनाव",
      "मापन के रूप में क़ीमत",
      "उलझे हुए बाज़ार",
      "टनलिंग और नवाचार",
      "क्वांटम अर्थव्यवस्था में नीति"
    ],
    fil: [
      "Ang hindi naaabot ng klasikong modelo",
      "Ang pagpili bilang superposition",
      "Ang presyo bilang pagsukat",
      "Magkaugnay na pamilihan",
      "Tunneling at inobasyon",
      "Patakaran sa quantum na ekonomiya"
    ],
    de: [
      "Was klassische Modelle verfehlen",
      "Die Wahl als Superposition",
      "Der Preis als Messung",
      "Verschränkte Märkte",
      "Tunneleffekt und Innovation",
      "Politik in einer Quantenökonomie"
    ],
    fr: [
      "Ce que les modèles classiques manquent",
      "Le choix comme superposition",
      "Le prix comme mesure",
      "Marchés intriqués",
      "Effet tunnel et innovation",
      "La politique en économie quantique"
    ],
    es: [
      "Lo que los modelos clásicos no ven",
      "La elección como superposición",
      "El precio como medición",
      "Mercados entrelazados",
      "Efecto túnel e innovación",
      "Política en una economía cuántica"
    ],
    pt: [
      "O que os modelos clássicos não veem",
      "A escolha como superposição",
      "O preço como medição",
      "Mercados emaranhados",
      "Tunelamento e inovação",
      "Política numa economia quântica"
    ]
  },
  isekai: {
    ko: [
      "소환",
      "첫 손님",
      "길드 전쟁",
      "확장",
      "겨울",
      "귀환"
    ],
    ja: [
      "召喚",
      "最初のお客",
      "ギルド戦争",
      "拡大",
      "冬",
      "帰還"
    ],
    hi: [
      "बुलावा",
      "पहला ग्राहक",
      "गिल्ड युद्ध",
      "विस्तार",
      "वह सर्दी",
      "वापसी"
    ],
    fil: [
      "Ang pagtawag",
      "Ang unang suki",
      "Ang digmaan ng guild",
      "Paglawak",
      "Ang taglamig",
      "Ang pagbabalik"
    ],
    de: [
      "Gerufen",
      "Der erste Kunde",
      "Der Gildenkrieg",
      "Expansion",
      "Der Winter",
      "Rückkehr"
    ],
    fr: [
      "Convoqué",
      "Le premier client",
      "La guerre des guildes",
      "Expansion",
      "L'hiver",
      "Retour"
    ],
    es: [
      "Convocado",
      "El primer cliente",
      "La guerra de los gremios",
      "Expansión",
      "El invierno",
      "Regreso"
    ],
    pt: [
      "Convocado",
      "O primeiro cliente",
      "A guerra das guildas",
      "Expansão",
      "O inverno",
      "Retorno"
    ]
  },
  'ninja-cat': {
    ko: [
      "마을",
      "지붕 시험",
      "떨어뜨린 수리검",
      "대추격",
      "쿠로, 다시 한번"
    ],
    ja: [
      "村",
      "屋根の試験",
      "落とした手裏剣",
      "大追跡",
      "クロ、もういちど"
    ],
    hi: [
      "गाँव",
      "छत वाली परीक्षा",
      "गिरा हुआ शुरिकेन",
      "बड़ा पीछा",
      "कुरो फिर से कोशिश करता है"
    ],
    fil: [
      "Ang nayon",
      "Ang pagsubok sa bubungan",
      "Ang nalaglag na shuriken",
      "Ang malaking habulan",
      "Susubok ulit si Kuro"
    ],
    de: [
      "Das Dorf",
      "Die Prüfung auf dem Dach",
      "Der fallen gelassene Shuriken",
      "Die große Verfolgung",
      "Kuro versucht es noch einmal"
    ],
    fr: [
      "Le village",
      "L'épreuve du toit",
      "Le shuriken tombé",
      "La grande poursuite",
      "Kuro réessaie"
    ],
    es: [
      "El pueblo",
      "La prueba del tejado",
      "El shuriken caído",
      "La gran persecución",
      "Kuro lo intenta otra vez"
    ],
    pt: [
      "A aldeia",
      "A prova do telhado",
      "O shuriken caído",
      "A grande perseguição",
      "Kuro tenta de novo"
    ]
  }
};

export function tocOf(book: Book, locale: string): string[] {
  return TOCS[book.id]?.[locale as keyof List] ?? book.toc;
}
