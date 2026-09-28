type Translations = Partial<Record<string, string[]>>;

const D: Record<string, Translations> = {
  // ── Greetings & basics ──
  "olá": { en: ["hello", "hi"], es: ["hola"], fr: ["bonjour", "salut"], de: ["hallo"], hi: ["नमस्ते"], ur: ["سلام"], ar: ["مرحبا"], bn: ["নমস্কার"], zh: ["你好"], ru: ["привет"], uk: ["привіт"], tr: ["merhaba"], pl: ["cześć"], ko: ["안녕하세요"], ja: ["こんにちは"] },
  "adeus": { en: ["goodbye"], es: ["adiós"], fr: ["au revoir"], de: ["auf Wiedersehen"], hi: ["अलविदा"], ur: ["الوداع"], ar: ["وداعا"], bn: ["বিদায়"], zh: ["再见"], ru: ["до свидания"], uk: ["до побачення"], tr: ["hoşça kal"], pl: ["do widzenia"], ko: ["안녕히 가세요"], ja: ["さようなら"] },
  "obrigado": { en: ["thank you", "thanks"], es: ["gracias"], fr: ["merci"], de: ["danke"], hi: ["धन्यवाद", "शुक्रिया"], ur: ["شکریہ"], ar: ["شكرا"], bn: ["ধন্যবাদ"], zh: ["谢谢"], ru: ["спасибо"], uk: ["дякую"], tr: ["teşekkürler"], pl: ["dziękuję"], ko: ["감사합니다"], ja: ["ありがとう"] },
  "obrigada": { en: ["thank you", "thanks"], es: ["gracias"], fr: ["merci"], de: ["danke"], hi: ["धन्यवाद"], ur: ["شکریہ"], ar: ["شكرا"], bn: ["ধন্যবাদ"], zh: ["谢谢"], ru: ["спасибо"], uk: ["дякую"], tr: ["teşekkürler"], pl: ["dziękuję"], ko: ["감사합니다"], ja: ["ありがとう"] },
  "sim": { en: ["yes"], es: ["sí"], fr: ["oui"], de: ["ja"], hi: ["हाँ"], ur: ["ہاں"], ar: ["نعم"], bn: ["হ্যাঁ"], zh: ["是"], ru: ["да"], uk: ["так"], tr: ["evet"], pl: ["tak"], ko: ["네"], ja: ["はい"] },
  "não": { en: ["no", "not"], es: ["no"], fr: ["non", "ne...pas"], de: ["nein", "nicht"], hi: ["नहीं"], ur: ["نہیں"], ar: ["لا"], bn: ["না"], zh: ["不", "没有"], ru: ["нет", "не"], uk: ["ні", "не"], tr: ["hayır", "değil"], pl: ["nie"], ko: ["아니요"], ja: ["いいえ"] },
  "por favor": { en: ["please"], es: ["por favor"], fr: ["s'il vous plaît"], de: ["bitte"], hi: ["कृपया"], ur: ["مہربانی سے"], ar: ["من فضلك"], bn: ["দয়া করে"], zh: ["请"], ru: ["пожалуйста"], uk: ["будь ласка"], tr: ["lütfen"], pl: ["proszę"], ko: ["제발"], ja: ["お願いします"] },
  "desculpe": { en: ["excuse me", "sorry"], es: ["disculpe", "perdón"], fr: ["excusez-moi", "pardon"], de: ["Entschuldigung"], hi: ["माफ़ कीजिए"], ur: ["معاف کیجیے"], ar: ["عفوا"], bn: ["মাফ করবেন"], zh: ["对不起", "不好意思"], ru: ["извините"], uk: ["вибачте"], tr: ["özür dilerim"], pl: ["przepraszam"], ko: ["죄송합니다"], ja: ["すみません"] },

  // ── Pronouns ──
  "eu": { en: ["I"], es: ["yo"], fr: ["je", "moi"], de: ["ich"], hi: ["मैं"], ur: ["میں"], ar: ["أنا"], bn: ["আমি"], zh: ["我"], ru: ["я"], uk: ["я"], tr: ["ben"], pl: ["ja"], ko: ["나", "저"], ja: ["私"] },
  "tu": { en: ["you"], es: ["tú"], fr: ["tu", "toi"], de: ["du"], hi: ["तू", "तुम"], ur: ["تم"], ar: ["أنت"], bn: ["তুমি", "তুই"], zh: ["你"], ru: ["ты"], uk: ["ти"], tr: ["sen"], pl: ["ty"], ko: ["너"], ja: ["あなた", "君"] },
  "ele": { en: ["he", "him"], es: ["él"], fr: ["il", "lui"], de: ["er", "ihn"], hi: ["वह"], ur: ["وہ"], ar: ["هو"], bn: ["সে"], zh: ["他"], ru: ["он"], uk: ["він"], tr: ["o"], pl: ["on"], ko: ["그"], ja: ["彼"] },
  "ela": { en: ["she", "her"], es: ["ella"], fr: ["elle"], de: ["sie", "ihr"], hi: ["वह"], ur: ["وہ"], ar: ["هي"], bn: ["সে"], zh: ["她"], ru: ["она"], uk: ["вона"], tr: ["o"], pl: ["ona"], ko: ["그녀"], ja: ["彼女"] },
  "nós": { en: ["we", "us"], es: ["nosotros"], fr: ["nous"], de: ["wir"], hi: ["हम"], ur: ["ہم"], ar: ["نحن"], bn: ["আমরা"], zh: ["我们"], ru: ["мы"], uk: ["ми"], tr: ["biz"], pl: ["my"], ko: ["우리"], ja: ["私たち"] },
  "eles": { en: ["they", "them"], es: ["ellos"], fr: ["ils", "eux"], de: ["sie"], hi: ["वे"], ur: ["وہ"], ar: ["هم"], bn: ["তারা"], zh: ["他们"], ru: ["они"], uk: ["вони"], tr: ["onlar"], pl: ["oni"], ko: ["그들"], ja: ["彼ら"] },
  "você": { en: ["you"], es: ["usted"], fr: ["vous"], de: ["Sie"], hi: ["आप"], ur: ["آپ"], ar: ["أنت"], bn: ["আপনি"], zh: ["您"], ru: ["вы"], uk: ["ви"], tr: ["siz"], pl: ["pan", "pani"], ko: ["당신"], ja: ["あなた"] },

  // ── Common verbs ──
  "ser": { en: ["to be"], es: ["ser"], fr: ["être"], de: ["sein"], hi: ["होना"], ur: ["ہونا"], ar: ["يكون"], bn: ["হওয়া"], zh: ["是"], ru: ["быть"], uk: ["бути"], tr: ["olmak"], pl: ["być"], ko: ["이다"], ja: ["である"] },
  "estar": { en: ["to be", "to stay"], es: ["estar"], fr: ["être", "se trouver"], de: ["sein", "sich befinden"], hi: ["होना", "रहना"], ur: ["ہونا"], ar: ["يكون"], bn: ["থাকা", "হওয়া"], zh: ["在", "是"], ru: ["быть", "находиться"], uk: ["бути", "перебувати"], tr: ["olmak", "bulunmak"], pl: ["być"], ko: ["있다"], ja: ["いる", "ある"] },
  "ter": { en: ["to have"], es: ["tener"], fr: ["avoir"], de: ["haben"], hi: ["रखना", "होना"], ur: ["رکھنا"], ar: ["يملك"], bn: ["থাকা", "রাখা"], zh: ["有"], ru: ["иметь"], uk: ["мати"], tr: ["sahip olmak"], pl: ["mieć"], ko: ["가지다"], ja: ["持つ"] },
  "ir": { en: ["to go"], es: ["ir"], fr: ["aller"], de: ["gehen"], hi: ["जाना"], ur: ["جانا"], ar: ["يذهب"], bn: ["যাওয়া"], zh: ["去"], ru: ["идти", "ходить"], uk: ["іти", "ходити"], tr: ["gitmek"], pl: ["iść"], ko: ["가다"], ja: ["行く"] },
  "vir": { en: ["to come"], es: ["venir"], fr: ["venir"], de: ["kommen"], hi: ["आना"], ur: ["آنا"], ar: ["يأتي"], bn: ["আসা"], zh: ["来"], ru: ["приходить"], uk: ["приходити"], tr: ["gelmek"], pl: ["przychodzić"], ko: ["오다"], ja: ["来る"] },
  "fazer": { en: ["to do", "to make"], es: ["hacer"], fr: ["faire"], de: ["machen", "tun"], hi: ["करना", "बनाना"], ur: ["کرنا", "بنانا"], ar: ["يفعل", "يصنع"], bn: ["করা", "বানানো"], zh: ["做", "制作"], ru: ["делать"], uk: ["робити"], tr: ["yapmak"], pl: ["robić"], ko: ["하다", "만들다"], ja: ["する", "作る"] },
  "poder": { en: ["to be able to", "can"], es: ["poder"], fr: ["pouvoir"], de: ["können"], hi: ["सकना"], ur: ["سکنا"], ar: ["يستطيع"], bn: ["পারা"], zh: ["能", "可以"], ru: ["мочь"], uk: ["могти"], tr: ["yapabilmek", "-ebilmek"], pl: ["móc"], ko: ["할 수 있다"], ja: ["できる"] },
  "querer": { en: ["to want"], es: ["querer"], fr: ["vouloir"], de: ["wollen", "möchten"], hi: ["चाहना"], ur: ["چاہنا"], ar: ["يريد"], bn: ["চাওয়া"], zh: ["想要"], ru: ["хотеть"], uk: ["хотіти"], tr: ["istemek"], pl: ["chcieć"], ko: ["원하다"], ja: ["欲しい", "したい"] },
  "saber": { en: ["to know", "to know how to"], es: ["saber"], fr: ["savoir"], de: ["wissen", "können"], hi: ["जानना"], ur: ["جاننا"], ar: ["يعرف"], bn: ["জানা"], zh: ["知道", "会"], ru: ["знать", "уметь"], uk: ["знати", "вміти"], tr: ["bilmek"], pl: ["wiedzieć", "umieć"], ko: ["알다"], ja: ["知る", "できる"] },
  "falar": { en: ["to speak", "to talk"], es: ["hablar"], fr: ["parler"], de: ["sprechen", "reden"], hi: ["बोलना"], ur: ["بولنا"], ar: ["يتكلم"], bn: ["বলা", "কথা বলা"], zh: ["说", "讲"], ru: ["говорить"], uk: ["говорити", "розмовляти"], tr: ["konuşmak"], pl: ["mówić"], ko: ["말하다"], ja: ["話す"] },
  "comer": { en: ["to eat"], es: ["comer"], fr: ["manger"], de: ["essen"], hi: ["खाना"], ur: ["کھانا"], ar: ["يأكل"], bn: ["খাওয়া"], zh: ["吃"], ru: ["есть", "кушать"], uk: ["їсти"], tr: ["yemek"], pl: ["jeść"], ko: ["먹다"], ja: ["食べる"] },
  "beber": { en: ["to drink"], es: ["beber"], fr: ["boire"], de: ["trinken"], hi: ["पीना"], ur: ["پینا"], ar: ["يشرب"], bn: ["পান করা"], zh: ["喝"], ru: ["пить"], uk: ["пити"], tr: ["içmek"], pl: ["pić"], ko: ["마시다"], ja: ["飲む"] },
  "dormir": { en: ["to sleep"], es: ["dormir"], fr: ["dormir"], de: ["schlafen"], hi: ["सोना"], ur: ["سونا"], ar: ["ينام"], bn: ["ঘুমানো"], zh: ["睡觉"], ru: ["спать"], uk: ["спати"], tr: ["uyumak"], pl: ["spać"], ko: ["자다"], ja: ["寝る"] },
  "trabalhar": { en: ["to work"], es: ["trabajar"], fr: ["travailler"], de: ["arbeiten"], hi: ["काम करना"], ur: ["کام کرنا"], ar: ["يعمل"], bn: ["কাজ করা"], zh: ["工作"], ru: ["работать"], uk: ["працювати"], tr: ["çalışmak"], pl: ["pracować"], ko: ["일하다"], ja: ["働く"] },
  "estudar": { en: ["to study"], es: ["estudiar"], fr: ["étudier"], de: ["studieren", "lernen"], hi: ["पढ़ना"], ur: ["پڑھنا"], ar: ["يدرس"], bn: ["পড়া"], zh: ["学习"], ru: ["учиться"], uk: ["вчитися"], tr: ["çalışmak", "ders çalışmak"], pl: ["studiować", "uczyć się"], ko: ["공부하다"], ja: ["勉強する"] },
  "gostar": { en: ["to like"], es: ["gustar"], fr: ["aimer"], de: ["mögen", "gefallen"], hi: ["पसंद करना"], ur: ["پسند کرنا"], ar: ["يحب"], bn: ["পছন্দ করা"], zh: ["喜欢"], ru: ["нравиться", "любить"], uk: ["подобатися"], tr: ["sevmek", "hoşlanmak"], pl: ["lubić"], ko: ["좋아하다"], ja: ["好き"] },
  "precisar": { en: ["to need"], es: ["necesitar"], fr: ["avoir besoin de"], de: ["brauchen"], hi: ["ज़रूरत होना"], ur: ["ضرورت ہونا"], ar: ["يحتاج"], bn: ["দরকার হওয়া"], zh: ["需要"], ru: ["нуждаться"], uk: ["потребувати"], tr: ["ihtiyaç duymak"], pl: ["potrzebować"], ko: ["필요하다"], ja: ["必要とする"] },
  "morar": { en: ["to live", "to reside"], es: ["vivir"], fr: ["habiter", "vivre"], de: ["wohnen", "leben"], hi: ["रहना"], ur: ["رہنا"], ar: ["يسكن", "يعيش"], bn: ["থাকা", "বসবাস করা"], zh: ["住"], ru: ["жить"], uk: ["жити", "мешкати"], tr: ["yaşamak", "oturmak"], pl: ["mieszkać"], ko: ["살다"], ja: ["住む"] },
  "dar": { en: ["to give"], es: ["dar"], fr: ["donner"], de: ["geben"], hi: ["देना"], ur: ["دینا"], ar: ["يعطي"], bn: ["দেওয়া"], zh: ["给"], ru: ["давать", "дать"], uk: ["давати"], tr: ["vermek"], pl: ["dawać", "dać"], ko: ["주다"], ja: ["あげる"] },
  "ver": { en: ["to see"], es: ["ver"], fr: ["voir"], de: ["sehen"], hi: ["देखना"], ur: ["دیکھنا"], ar: ["يرى"], bn: ["দেখা"], zh: ["看"], ru: ["видеть", "смотреть"], uk: ["бачити", "дивитися"], tr: ["görmek"], pl: ["widzieć"], ko: ["보다"], ja: ["見る"] },
  "ouvir": { en: ["to hear", "to listen"], es: ["oír", "escuchar"], fr: ["entendre", "écouter"], de: ["hören"], hi: ["सुनना"], ur: ["سننا"], ar: ["يسمع"], bn: ["শোনা"], zh: ["听"], ru: ["слышать", "слушать"], uk: ["чути", "слухати"], tr: ["duymak", "dinlemek"], pl: ["słyszeć", "słuchać"], ko: ["듣다"], ja: ["聞く"] },
  "dizer": { en: ["to say", "to tell"], es: ["decir"], fr: ["dire"], de: ["sagen"], hi: ["कहना", "बताना"], ur: ["کہنا"], ar: ["يقول"], bn: ["বলা"], zh: ["说", "告诉"], ru: ["говорить", "сказать"], uk: ["говорити", "казати"], tr: ["söylemek", "demek"], pl: ["mówić", "powiedzieć"], ko: ["말하다"], ja: ["言う"] },
  "pensar": { en: ["to think"], es: ["pensar"], fr: ["penser"], de: ["denken"], hi: ["सोचना"], ur: ["سوچنا"], ar: ["يفكر"], bn: ["ভাবা", "চিন্তা করা"], zh: ["想", "思考"], ru: ["думать"], uk: ["думати"], tr: ["düşünmek"], pl: ["myśleć"], ko: ["생각하다"], ja: ["考える"] },

  // ── Multi-meaning words ──
  "tempo": { en: ["time", "weather"], es: ["tiempo"], fr: ["temps"], de: ["Zeit", "Wetter"], hi: ["समय", "मौसम"], ur: ["وقت", "موسم"], ar: ["وقت", "طقس"], bn: ["সময়", "আবহাওয়া"], zh: ["时间", "天气"], ru: ["время", "погода"], uk: ["час", "погода"], tr: ["zaman", "hava durumu"], pl: ["czas", "pogoda"], ko: ["시간", "날씨"], ja: ["時間", "天気"] },
  "banco": { en: ["bank", "bench"], es: ["banco"], fr: ["banque", "banc"], de: ["Bank"], hi: ["बैंक", "बेंच"], ur: ["بینک", "بنچ"], ar: ["بنك", "مقعد"], bn: ["ব্যাংক", "বেঞ্চ"], zh: ["银行", "长椅"], ru: ["банк", "скамейка"], uk: ["банк", "лавка"], tr: ["banka", "bank"], pl: ["bank", "ławka"], ko: ["은행", "벤치"], ja: ["銀行", "ベンチ"] },
  "caro": { en: ["expensive", "dear"], es: ["caro", "querido"], fr: ["cher", "chère"], de: ["teuer", "lieb"], hi: ["महँगा", "प्रिय"], ur: ["مہنگا", "عزیز"], ar: ["غالي", "عزيز"], bn: ["দামি", "প্রিয়"], zh: ["贵", "亲爱的"], ru: ["дорогой"], uk: ["дорогий"], tr: ["pahalı", "sevgili"], pl: ["drogi"], ko: ["비싼", "친애하는"], ja: ["高い", "親愛な"] },
  "manga": { en: ["sleeve", "mango"], es: ["manga"], fr: ["manche", "mangue"], de: ["Ärmel", "Mango"], hi: ["आस्तीन", "आम"], ur: ["آستین", "آم"], ar: ["كم", "مانجو"], bn: ["হাতা", "আম"], zh: ["袖子", "芒果"], ru: ["рукав", "манго"], uk: ["рукав", "манго"], tr: ["kol", "mango"], pl: ["rękaw", "mango"], ko: ["소매", "망고"], ja: ["袖", "マンゴー"] },
  "letra": { en: ["letter", "lyrics", "handwriting"], es: ["letra"], fr: ["lettre", "paroles"], de: ["Buchstabe", "Liedtext", "Handschrift"], hi: ["अक्षर", "गीत के बोल"], ur: ["حرف", "گیت کے بول"], ar: ["حرف", "كلمات أغنية"], bn: ["অক্ষর", "গানের কথা"], zh: ["字母", "歌词"], ru: ["буква", "текст песни"], uk: ["літера", "слова пісні"], tr: ["harf", "şarkı sözü"], pl: ["litera", "tekst piosenki"], ko: ["글자", "가사"], ja: ["文字", "歌詞"] },
  "ponto": { en: ["point", "dot", "stitch"], es: ["punto"], fr: ["point"], de: ["Punkt", "Stich"], hi: ["बिंदु", "टाँका"], ur: ["نقطہ", "ٹانکا"], ar: ["نقطة"], bn: ["বিন্দু", "সেলাই"], zh: ["点", "针"], ru: ["точка", "стежок"], uk: ["крапка", "стібок"], tr: ["nokta", "dikiş"], pl: ["punkt", "ścieg"], ko: ["점", "바늘땀"], ja: ["点", "縫い目"] },
  "direito": { en: ["right", "straight", "law"], es: ["derecho"], fr: ["droit"], de: ["Recht", "gerade", "recht"], hi: ["अधिकार", "कानून", "सीधा"], ur: ["حق", "قانون", "سیدھا"], ar: ["حق", "قانون", "مستقيم"], bn: ["অধিকার", "আইন", "সোজা"], zh: ["权利", "法律", "直的"], ru: ["право", "прямой"], uk: ["право", "прямий"], tr: ["hak", "hukuk", "düz"], pl: ["prawo", "prosty"], ko: ["권리", "법", "곧은"], ja: ["権利", "法律", "まっすぐ"] },
  "como": { en: ["how", "like", "as"], es: ["cómo", "como"], fr: ["comment", "comme"], de: ["wie"], hi: ["कैसे", "जैसे"], ur: ["کیسے", "جیسے"], ar: ["كيف", "مثل"], bn: ["কিভাবে", "যেমন"], zh: ["怎么", "像"], ru: ["как"], uk: ["як"], tr: ["nasıl", "gibi"], pl: ["jak"], ko: ["어떻게", "처럼"], ja: ["どう", "のように"] },
  "nada": { en: ["nothing", "anything"], es: ["nada"], fr: ["rien"], de: ["nichts"], hi: ["कुछ नहीं"], ur: ["کچھ نہیں"], ar: ["لا شيء"], bn: ["কিছুই না"], zh: ["什么都没有"], ru: ["ничего"], uk: ["нічого"], tr: ["hiçbir şey"], pl: ["nic"], ko: ["아무것도"], ja: ["何も"] },
  "canto": { en: ["corner", "I sing"], es: ["esquina", "canto"], fr: ["coin", "je chante"], de: ["Ecke", "ich singe"], hi: ["कोना", "मैं गाता हूँ"], ur: ["کونا", "میں گاتا ہوں"], ar: ["زاوية", "أغني"], bn: ["কোণা", "আমি গাই"], zh: ["角落", "我唱"], ru: ["угол", "я пою"], uk: ["кут", "я співаю"], tr: ["köşe", "ben söylerim"], pl: ["kąt", "śpiewam"], ko: ["구석", "나는 노래한다"], ja: ["角", "私は歌う"] },
  "pena": { en: ["feather", "pity", "penalty"], es: ["pena", "pluma"], fr: ["plume", "peine", "pitié"], de: ["Feder", "Strafe", "Schade"], hi: ["पंख", "दया", "दंड"], ur: ["پر", "ترس", "سزا"], ar: ["ريشة", "شفقة", "عقوبة"], bn: ["পালক", "দুঃখ", "শাস্তি"], zh: ["羽毛", "遗憾", "惩罚"], ru: ["перо", "жаль", "наказание"], uk: ["перо", "шкода", "покарання"], tr: ["tüy", "yazık", "ceza"], pl: ["pióro", "szkoda", "kara"], ko: ["깃털", "안타까움", "벌"], ja: ["羽", "残念", "罰"] },
  "são": { en: ["are", "healthy", "saint"], es: ["son", "sano", "san"], fr: ["sont", "sain", "saint"], de: ["sind", "gesund", "heilig"], hi: ["हैं", "स्वस्थ", "संत"], ur: ["ہیں", "صحت مند", "سنت"], ar: ["هم", "صحي", "قديس"], bn: ["হয়", "সুস্থ", "সন্ত"], zh: ["是", "健康的", "圣"], ru: ["являются", "здоровый", "святой"], uk: ["є", "здоровий", "святий"], tr: ["-ler", "sağlıklı", "aziz"], pl: ["są", "zdrowy", "święty"], ko: ["~이다", "건강한", "성인"], ja: ["である", "健康な", "聖"] },
  "segundo": { en: ["second", "according to"], es: ["segundo", "según"], fr: ["deuxième", "selon"], de: ["zweite", "laut", "gemäß"], hi: ["दूसरा", "के अनुसार"], ur: ["دوسرا", "کے مطابق"], ar: ["ثاني", "وفقا ل"], bn: ["দ্বিতীয়", "অনুযায়ী"], zh: ["第二", "根据"], ru: ["второй", "согласно"], uk: ["другий", "згідно з"], tr: ["ikinci", "-e göre"], pl: ["drugi", "według"], ko: ["두 번째", "~에 따르면"], ja: ["2番目", "~によると"] },
  "meio": { en: ["half", "middle", "means", "environment"], es: ["medio"], fr: ["moitié", "milieu", "moyen"], de: ["halb", "Mitte", "Mittel"], hi: ["आधा", "बीच", "माध्यम"], ur: ["آدھا", "بیچ", "ذریعہ"], ar: ["نصف", "وسط", "وسيلة"], bn: ["অর্ধেক", "মাঝখান", "মাধ্যম"], zh: ["半", "中间", "手段"], ru: ["половина", "середина", "средство"], uk: ["половина", "середина", "засіб"], tr: ["yarım", "orta", "araç"], pl: ["pół", "środek", "środki"], ko: ["반", "중간", "수단"], ja: ["半分", "真ん中", "手段"] },
  "conta": { en: ["account", "bill", "count"], es: ["cuenta"], fr: ["compte", "addition"], de: ["Konto", "Rechnung", "Zählung"], hi: ["खाता", "बिल", "गिनती"], ur: ["اکاؤنٹ", "بل", "گنتی"], ar: ["حساب", "فاتورة"], bn: ["হিসাব", "বিল", "গণনা"], zh: ["账户", "账单", "计数"], ru: ["счёт", "аккаунт"], uk: ["рахунок", "аккаунт"], tr: ["hesap", "fatura", "sayı"], pl: ["konto", "rachunek", "liczenie"], ko: ["계좌", "계산서", "세기"], ja: ["口座", "勘定", "数える"] },
  "ficar": { en: ["to stay", "to remain", "to become", "to be located"], es: ["quedarse", "estar", "ponerse"], fr: ["rester", "devenir", "se trouver"], de: ["bleiben", "werden", "sich befinden"], hi: ["रहना", "ठहरना", "हो जाना"], ur: ["رہنا", "ٹھہرنا"], ar: ["يبقى", "يصبح"], bn: ["থাকা", "হওয়া"], zh: ["留下", "变得", "位于"], ru: ["оставаться", "становиться", "находиться"], uk: ["залишатися", "ставати"], tr: ["kalmak", "olmak", "bulunmak"], pl: ["zostać", "pozostać"], ko: ["머무르다", "~이 되다"], ja: ["残る", "~になる"] },
  "rio": { en: ["river", "I laugh"], es: ["río"], fr: ["rivière", "fleuve", "je ris"], de: ["Fluss", "ich lache"], hi: ["नदी", "मैं हँसता हूँ"], ur: ["دریا", "میں ہنستا ہوں"], ar: ["نهر", "أضحك"], bn: ["নদী", "আমি হাসি"], zh: ["河", "我笑"], ru: ["река", "я смеюсь"], uk: ["річка", "я сміюся"], tr: ["nehir", "gülerim"], pl: ["rzeka", "śmieję się"], ko: ["강", "나는 웃는다"], ja: ["川", "私は笑う"] },

  // ── Common nouns ──
  "casa": { en: ["house", "home"], es: ["casa"], fr: ["maison"], de: ["Haus"], hi: ["घर"], ur: ["گھر"], ar: ["بيت", "منزل"], bn: ["বাড়ি", "ঘর"], zh: ["房子", "家"], ru: ["дом"], uk: ["дім", "будинок"], tr: ["ev"], pl: ["dom"], ko: ["집"], ja: ["家"] },
  "rua": { en: ["street", "road"], es: ["calle"], fr: ["rue"], de: ["Straße"], hi: ["सड़क", "गली"], ur: ["سڑک", "گلی"], ar: ["شارع"], bn: ["রাস্তা"], zh: ["街道"], ru: ["улица"], uk: ["вулиця"], tr: ["sokak", "cadde"], pl: ["ulica"], ko: ["거리", "길"], ja: ["通り"] },
  "cidade": { en: ["city", "town"], es: ["ciudad"], fr: ["ville"], de: ["Stadt"], hi: ["शहर"], ur: ["شہر"], ar: ["مدينة"], bn: ["শহর"], zh: ["城市"], ru: ["город"], uk: ["місто"], tr: ["şehir", "kent"], pl: ["miasto"], ko: ["도시"], ja: ["都市", "街"] },
  "país": { en: ["country"], es: ["país"], fr: ["pays"], de: ["Land"], hi: ["देश"], ur: ["ملک"], ar: ["بلد", "دولة"], bn: ["দেশ"], zh: ["国家"], ru: ["страна"], uk: ["країна"], tr: ["ülke"], pl: ["kraj"], ko: ["나라"], ja: ["国"] },
  "pessoa": { en: ["person", "people"], es: ["persona"], fr: ["personne"], de: ["Person", "Mensch"], hi: ["व्यक्ति", "लोग"], ur: ["شخص"], ar: ["شخص"], bn: ["ব্যক্তি", "মানুষ"], zh: ["人"], ru: ["человек"], uk: ["людина"], tr: ["kişi", "insan"], pl: ["osoba", "człowiek"], ko: ["사람"], ja: ["人"] },
  "homem": { en: ["man"], es: ["hombre"], fr: ["homme"], de: ["Mann"], hi: ["आदमी", "पुरुष"], ur: ["آدمی", "مرد"], ar: ["رجل"], bn: ["পুরুষ"], zh: ["男人"], ru: ["мужчина"], uk: ["чоловік"], tr: ["adam", "erkek"], pl: ["mężczyzna"], ko: ["남자"], ja: ["男", "男性"] },
  "mulher": { en: ["woman", "wife"], es: ["mujer"], fr: ["femme"], de: ["Frau"], hi: ["औरत", "पत्नी"], ur: ["عورت", "بیوی"], ar: ["امرأة", "زوجة"], bn: ["মহিলা", "স্ত্রী"], zh: ["女人", "妻子"], ru: ["женщина", "жена"], uk: ["жінка", "дружина"], tr: ["kadın", "eş"], pl: ["kobieta", "żona"], ko: ["여자", "아내"], ja: ["女", "女性", "妻"] },
  "criança": { en: ["child", "kid"], es: ["niño", "niña"], fr: ["enfant"], de: ["Kind"], hi: ["बच्चा"], ur: ["بچہ"], ar: ["طفل"], bn: ["শিশু", "বাচ্চা"], zh: ["孩子", "小孩"], ru: ["ребёнок"], uk: ["дитина"], tr: ["çocuk"], pl: ["dziecko"], ko: ["아이"], ja: ["子供"] },
  "família": { en: ["family"], es: ["familia"], fr: ["famille"], de: ["Familie"], hi: ["परिवार"], ur: ["خاندان"], ar: ["عائلة", "أسرة"], bn: ["পরিবার"], zh: ["家庭"], ru: ["семья"], uk: ["сім'я", "родина"], tr: ["aile"], pl: ["rodzina"], ko: ["가족"], ja: ["家族"] },
  "amigo": { en: ["friend"], es: ["amigo"], fr: ["ami"], de: ["Freund"], hi: ["दोस्त", "मित्र"], ur: ["دوست"], ar: ["صديق"], bn: ["বন্ধু"], zh: ["朋友"], ru: ["друг"], uk: ["друг"], tr: ["arkadaş"], pl: ["przyjaciel"], ko: ["친구"], ja: ["友達"] },
  "nome": { en: ["name"], es: ["nombre"], fr: ["nom", "prénom"], de: ["Name"], hi: ["नाम"], ur: ["نام"], ar: ["اسم"], bn: ["নাম"], zh: ["名字"], ru: ["имя"], uk: ["ім'я"], tr: ["isim", "ad"], pl: ["imię", "nazwa"], ko: ["이름"], ja: ["名前"] },
  "água": { en: ["water"], es: ["agua"], fr: ["eau"], de: ["Wasser"], hi: ["पानी"], ur: ["پانی"], ar: ["ماء"], bn: ["জল", "পানি"], zh: ["水"], ru: ["вода"], uk: ["вода"], tr: ["su"], pl: ["woda"], ko: ["물"], ja: ["水"] },
  "café": { en: ["coffee", "café"], es: ["café"], fr: ["café"], de: ["Kaffee", "Café"], hi: ["कॉफ़ी"], ur: ["کافی"], ar: ["قهوة", "مقهى"], bn: ["কফি"], zh: ["咖啡", "咖啡馆"], ru: ["кофе", "кафе"], uk: ["кава", "кафе"], tr: ["kahve", "kafe"], pl: ["kawa", "kawiarnia"], ko: ["커피", "카페"], ja: ["コーヒー", "カフェ"] },
  "pão": { en: ["bread"], es: ["pan"], fr: ["pain"], de: ["Brot"], hi: ["रोटी"], ur: ["روٹی"], ar: ["خبز"], bn: ["রুটি"], zh: ["面包"], ru: ["хлеб"], uk: ["хліб"], tr: ["ekmek"], pl: ["chleb"], ko: ["빵"], ja: ["パン"] },
  "comida": { en: ["food", "meal"], es: ["comida"], fr: ["nourriture", "repas"], de: ["Essen", "Mahlzeit"], hi: ["खाना", "भोजन"], ur: ["کھانا"], ar: ["طعام", "وجبة"], bn: ["খাবার"], zh: ["食物", "饭"], ru: ["еда", "пища"], uk: ["їжа"], tr: ["yemek", "yiyecek"], pl: ["jedzenie", "posiłek"], ko: ["음식", "식사"], ja: ["食べ物", "食事"] },
  "dinheiro": { en: ["money"], es: ["dinero"], fr: ["argent"], de: ["Geld"], hi: ["पैसा", "धन"], ur: ["پیسے"], ar: ["مال", "نقود"], bn: ["টাকা"], zh: ["钱"], ru: ["деньги"], uk: ["гроші"], tr: ["para"], pl: ["pieniądze"], ko: ["돈"], ja: ["お金"] },
  "trabalho": { en: ["work", "job"], es: ["trabajo"], fr: ["travail"], de: ["Arbeit"], hi: ["काम", "नौकरी"], ur: ["کام", "نوکری"], ar: ["عمل", "وظيفة"], bn: ["কাজ", "চাকরি"], zh: ["工作"], ru: ["работа"], uk: ["робота"], tr: ["iş", "çalışma"], pl: ["praca"], ko: ["일", "직업"], ja: ["仕事"] },
  "escola": { en: ["school"], es: ["escuela"], fr: ["école"], de: ["Schule"], hi: ["स्कूल", "विद्यालय"], ur: ["سکول"], ar: ["مدرسة"], bn: ["স্কুল", "বিদ্যালয়"], zh: ["学校"], ru: ["школа"], uk: ["школа"], tr: ["okul"], pl: ["szkoła"], ko: ["학교"], ja: ["学校"] },
  "livro": { en: ["book"], es: ["libro"], fr: ["livre"], de: ["Buch"], hi: ["किताब"], ur: ["کتاب"], ar: ["كتاب"], bn: ["বই"], zh: ["书"], ru: ["книга"], uk: ["книга", "книжка"], tr: ["kitap"], pl: ["książka"], ko: ["책"], ja: ["本"] },
  "carro": { en: ["car"], es: ["coche", "carro"], fr: ["voiture"], de: ["Auto", "Wagen"], hi: ["गाड़ी", "कार"], ur: ["گاڑی"], ar: ["سيارة"], bn: ["গাড়ি"], zh: ["车", "汽车"], ru: ["машина", "автомобиль"], uk: ["машина", "автомобіль"], tr: ["araba", "otomobil"], pl: ["samochód", "auto"], ko: ["자동차", "차"], ja: ["車"] },
  "gato": { en: ["cat"], es: ["gato"], fr: ["chat"], de: ["Katze"], hi: ["बिल्ली"], ur: ["بلی"], ar: ["قط", "قطة"], bn: ["বিড়াল"], zh: ["猫"], ru: ["кот", "кошка"], uk: ["кіт", "кішка"], tr: ["kedi"], pl: ["kot"], ko: ["고양이"], ja: ["猫"] },
  "cão": { en: ["dog"], es: ["perro"], fr: ["chien"], de: ["Hund"], hi: ["कुत्ता"], ur: ["کتا"], ar: ["كلب"], bn: ["কুকুর"], zh: ["狗"], ru: ["собака", "пёс"], uk: ["собака", "пес"], tr: ["köpek"], pl: ["pies"], ko: ["개"], ja: ["犬"] },
  "sol": { en: ["sun"], es: ["sol"], fr: ["soleil"], de: ["Sonne"], hi: ["सूरज", "धूप"], ur: ["سورج", "دھوپ"], ar: ["شمس"], bn: ["সূর্য", "রোদ"], zh: ["太阳"], ru: ["солнце"], uk: ["сонце"], tr: ["güneş"], pl: ["słońce"], ko: ["태양", "해"], ja: ["太陽"] },
  "lua": { en: ["moon"], es: ["luna"], fr: ["lune"], de: ["Mond"], hi: ["चाँद"], ur: ["چاند"], ar: ["قمر"], bn: ["চাঁদ"], zh: ["月亮"], ru: ["луна"], uk: ["місяць"], tr: ["ay"], pl: ["księżyc"], ko: ["달"], ja: ["月"] },
  "mar": { en: ["sea", "ocean"], es: ["mar"], fr: ["mer"], de: ["Meer", "See"], hi: ["समुद्र", "सागर"], ur: ["سمندر"], ar: ["بحر"], bn: ["সমুদ্র", "সাগর"], zh: ["海", "大海"], ru: ["море"], uk: ["море"], tr: ["deniz"], pl: ["morze"], ko: ["바다"], ja: ["海"] },
  "leite": { en: ["milk"], es: ["leche"], fr: ["lait"], de: ["Milch"], hi: ["दूध"], ur: ["دودھ"], ar: ["حليب", "لبن"], bn: ["দুধ"], zh: ["牛奶"], ru: ["молоко"], uk: ["молоко"], tr: ["süt"], pl: ["mleko"], ko: ["우유"], ja: ["牛乳", "ミルク"] },
  "carne": { en: ["meat"], es: ["carne"], fr: ["viande"], de: ["Fleisch"], hi: ["मांस", "गोश्त"], ur: ["گوشت"], ar: ["لحم"], bn: ["মাংস"], zh: ["肉"], ru: ["мясо"], uk: ["м'ясо"], tr: ["et"], pl: ["mięso"], ko: ["고기"], ja: ["肉"] },
  "peixe": { en: ["fish"], es: ["pez", "pescado"], fr: ["poisson"], de: ["Fisch"], hi: ["मछली"], ur: ["مچھلی"], ar: ["سمك", "سمكة"], bn: ["মাছ"], zh: ["鱼"], ru: ["рыба"], uk: ["риба"], tr: ["balık"], pl: ["ryba"], ko: ["물고기", "생선"], ja: ["魚"] },
  "fruta": { en: ["fruit"], es: ["fruta"], fr: ["fruit"], de: ["Frucht", "Obst"], hi: ["फल"], ur: ["پھل"], ar: ["فاكهة"], bn: ["ফল"], zh: ["水果"], ru: ["фрукт"], uk: ["фрукт"], tr: ["meyve"], pl: ["owoc"], ko: ["과일"], ja: ["果物", "フルーツ"] },
  "arroz": { en: ["rice"], es: ["arroz"], fr: ["riz"], de: ["Reis"], hi: ["चावल"], ur: ["چاول"], ar: ["أرز"], bn: ["ভাত", "চাল"], zh: ["米饭", "米"], ru: ["рис"], uk: ["рис"], tr: ["pirinç", "pilav"], pl: ["ryż"], ko: ["쌀", "밥"], ja: ["米", "ご飯"] },

  // ── Adjectives ──
  "bom": { en: ["good"], es: ["bueno"], fr: ["bon"], de: ["gut"], hi: ["अच्छा"], ur: ["اچھا"], ar: ["جيد"], bn: ["ভালো"], zh: ["好"], ru: ["хороший"], uk: ["хороший", "добрий"], tr: ["iyi"], pl: ["dobry"], ko: ["좋은"], ja: ["良い"] },
  "mau": { en: ["bad", "evil"], es: ["malo"], fr: ["mauvais"], de: ["schlecht", "böse"], hi: ["बुरा"], ur: ["برا"], ar: ["سيء"], bn: ["খারাপ"], zh: ["坏", "不好"], ru: ["плохой"], uk: ["поганий"], tr: ["kötü"], pl: ["zły"], ko: ["나쁜"], ja: ["悪い"] },
  "grande": { en: ["big", "large", "great"], es: ["grande"], fr: ["grand"], de: ["groß"], hi: ["बड़ा"], ur: ["بڑا"], ar: ["كبير"], bn: ["বড়"], zh: ["大"], ru: ["большой"], uk: ["великий"], tr: ["büyük"], pl: ["duży", "wielki"], ko: ["큰"], ja: ["大きい"] },
  "pequeno": { en: ["small", "little"], es: ["pequeño"], fr: ["petit"], de: ["klein"], hi: ["छोटा"], ur: ["چھوٹا"], ar: ["صغير"], bn: ["ছোট"], zh: ["小"], ru: ["маленький"], uk: ["маленький", "малий"], tr: ["küçük"], pl: ["mały"], ko: ["작은"], ja: ["小さい"] },
  "bonito": { en: ["beautiful", "pretty", "handsome"], es: ["bonito", "hermoso"], fr: ["beau", "joli"], de: ["schön", "hübsch"], hi: ["सुंदर", "खूबसूरत"], ur: ["خوبصورت"], ar: ["جميل"], bn: ["সুন্দর"], zh: ["漂亮", "美丽"], ru: ["красивый"], uk: ["гарний", "красивий"], tr: ["güzel", "yakışıklı"], pl: ["ładny", "piękny"], ko: ["아름다운", "예쁜"], ja: ["きれい", "美しい"] },
  "novo": { en: ["new", "young"], es: ["nuevo", "joven"], fr: ["nouveau", "neuf", "jeune"], de: ["neu", "jung"], hi: ["नया", "जवान"], ur: ["نیا", "جوان"], ar: ["جديد", "شاب"], bn: ["নতুন", "তরুণ"], zh: ["新", "年轻"], ru: ["новый", "молодой"], uk: ["новий", "молодий"], tr: ["yeni", "genç"], pl: ["nowy", "młody"], ko: ["새로운", "젊은"], ja: ["新しい", "若い"] },
  "velho": { en: ["old"], es: ["viejo"], fr: ["vieux", "ancien"], de: ["alt"], hi: ["बूढ़ा", "पुराना"], ur: ["بوڑھا", "پرانا"], ar: ["قديم", "كبير في السن"], bn: ["পুরনো", "বৃদ্ধ"], zh: ["旧", "老"], ru: ["старый"], uk: ["старий"], tr: ["eski", "yaşlı"], pl: ["stary"], ko: ["오래된", "늙은"], ja: ["古い", "年老いた"] },
  "quente": { en: ["hot", "warm"], es: ["caliente"], fr: ["chaud"], de: ["heiß", "warm"], hi: ["गर्म"], ur: ["گرم"], ar: ["حار", "ساخن"], bn: ["গরম"], zh: ["热"], ru: ["горячий", "тёплый"], uk: ["гарячий", "теплий"], tr: ["sıcak"], pl: ["gorący", "ciepły"], ko: ["뜨거운", "따뜻한"], ja: ["暑い", "熱い"] },
  "frio": { en: ["cold"], es: ["frío"], fr: ["froid"], de: ["kalt"], hi: ["ठंडा"], ur: ["ٹھنڈا"], ar: ["بارد"], bn: ["ঠান্ডা"], zh: ["冷"], ru: ["холодный"], uk: ["холодний"], tr: ["soğuk"], pl: ["zimny"], ko: ["차가운", "추운"], ja: ["寒い", "冷たい"] },
  "feliz": { en: ["happy"], es: ["feliz"], fr: ["heureux", "content"], de: ["glücklich", "froh"], hi: ["खुश"], ur: ["خوش"], ar: ["سعيد"], bn: ["খুশি", "সুখী"], zh: ["快乐", "幸福"], ru: ["счастливый"], uk: ["щасливий"], tr: ["mutlu"], pl: ["szczęśliwy"], ko: ["행복한"], ja: ["幸せ", "嬉しい"] },
  "triste": { en: ["sad"], es: ["triste"], fr: ["triste"], de: ["traurig"], hi: ["उदास", "दुखी"], ur: ["اداس"], ar: ["حزين"], bn: ["দুঃখী", "মন খারাপ"], zh: ["难过", "悲伤"], ru: ["грустный", "печальный"], uk: ["сумний"], tr: ["üzgün"], pl: ["smutny"], ko: ["슬픈"], ja: ["悲しい"] },
  "chateado": { en: ["annoyed", "upset", "bored"], es: ["molesto", "aburrido"], fr: ["ennuyé", "agacé"], de: ["genervt", "verärgert"], hi: ["नाराज़", "परेशान"], ur: ["ناراض", "پریشان"], ar: ["منزعج", "ضجر"], bn: ["বিরক্ত"], zh: ["烦恼", "无聊"], ru: ["раздражённый"], uk: ["роздратований"], tr: ["sinirli", "sıkılmış"], pl: ["zdenerwowany", "znudzony"], ko: ["짜증난", "지루한"], ja: ["イライラした", "退屈した"] },

  // ── Adverbs & time ──
  "muito": { en: ["very", "much", "a lot"], es: ["muy", "mucho"], fr: ["très", "beaucoup"], de: ["sehr", "viel"], hi: ["बहुत"], ur: ["بہت"], ar: ["كثيرا", "جدا"], bn: ["অনেক", "খুব"], zh: ["很", "非常"], ru: ["очень", "много"], uk: ["дуже", "багато"], tr: ["çok"], pl: ["bardzo", "dużo"], ko: ["매우", "많이"], ja: ["とても", "たくさん"] },
  "pouco": { en: ["little", "few", "a bit"], es: ["poco"], fr: ["peu"], de: ["wenig"], hi: ["थोड़ा", "कम"], ur: ["تھوڑا", "کم"], ar: ["قليل"], bn: ["সামান্য", "কম"], zh: ["少", "一点"], ru: ["мало", "немного"], uk: ["мало", "трохи"], tr: ["az", "biraz"], pl: ["mało", "trochę"], ko: ["조금", "적은"], ja: ["少し", "少ない"] },
  "bem": { en: ["well", "good"], es: ["bien"], fr: ["bien"], de: ["gut", "wohl"], hi: ["अच्छे से", "ठीक"], ur: ["اچھے سے"], ar: ["جيدا", "حسنا"], bn: ["ভালো", "ভালোভাবে"], zh: ["好", "很好"], ru: ["хорошо"], uk: ["добре"], tr: ["iyi"], pl: ["dobrze"], ko: ["잘"], ja: ["よく", "上手に"] },
  "mal": { en: ["badly", "poorly"], es: ["mal"], fr: ["mal"], de: ["schlecht", "schlimm"], hi: ["बुरी तरह"], ur: ["برے طریقے سے"], ar: ["بشكل سيء"], bn: ["খারাপভাবে"], zh: ["不好", "糟糕"], ru: ["плохо"], uk: ["погано"], tr: ["kötü"], pl: ["źle"], ko: ["나쁘게"], ja: ["悪く"] },
  "aqui": { en: ["here"], es: ["aquí"], fr: ["ici"], de: ["hier"], hi: ["यहाँ"], ur: ["یہاں"], ar: ["هنا"], bn: ["এখানে"], zh: ["这里"], ru: ["здесь", "тут"], uk: ["тут", "сюди"], tr: ["burada", "burası"], pl: ["tutaj", "tu"], ko: ["여기"], ja: ["ここ"] },
  "ali": { en: ["there", "over there"], es: ["allí", "ahí"], fr: ["là", "là-bas"], de: ["dort", "da"], hi: ["वहाँ"], ur: ["وہاں"], ar: ["هناك"], bn: ["ওখানে", "সেখানে"], zh: ["那里"], ru: ["там"], uk: ["там"], tr: ["orada", "şurada"], pl: ["tam"], ko: ["거기", "저기"], ja: ["あそこ", "そこ"] },
  "agora": { en: ["now"], es: ["ahora"], fr: ["maintenant"], de: ["jetzt"], hi: ["अब", "अभी"], ur: ["اب", "ابھی"], ar: ["الآن"], bn: ["এখন"], zh: ["现在"], ru: ["сейчас", "теперь"], uk: ["зараз", "тепер"], tr: ["şimdi"], pl: ["teraz"], ko: ["지금"], ja: ["今"] },
  "depois": { en: ["after", "later", "then"], es: ["después"], fr: ["après", "ensuite"], de: ["danach", "später", "nach"], hi: ["बाद में", "फिर"], ur: ["بعد میں", "پھر"], ar: ["بعد", "لاحقا"], bn: ["পরে"], zh: ["之后", "然后"], ru: ["после", "потом"], uk: ["після", "потім"], tr: ["sonra"], pl: ["potem", "później"], ko: ["나중에", "후에"], ja: ["後で", "その後"] },
  "antes": { en: ["before", "earlier"], es: ["antes"], fr: ["avant"], de: ["vor", "vorher"], hi: ["पहले"], ur: ["پہلے"], ar: ["قبل"], bn: ["আগে"], zh: ["之前", "以前"], ru: ["до", "раньше"], uk: ["до", "раніше"], tr: ["önce"], pl: ["przed", "wcześniej"], ko: ["전에"], ja: ["前に"] },
  "sempre": { en: ["always"], es: ["siempre"], fr: ["toujours"], de: ["immer"], hi: ["हमेशा"], ur: ["ہمیشہ"], ar: ["دائما"], bn: ["সবসময়"], zh: ["总是", "一直"], ru: ["всегда"], uk: ["завжди"], tr: ["her zaman"], pl: ["zawsze"], ko: ["항상"], ja: ["いつも"] },
  "nunca": { en: ["never"], es: ["nunca"], fr: ["jamais"], de: ["nie", "niemals"], hi: ["कभी नहीं"], ur: ["کبھی نہیں"], ar: ["أبدا"], bn: ["কখনো না"], zh: ["从不", "永远不"], ru: ["никогда"], uk: ["ніколи"], tr: ["hiçbir zaman", "asla"], pl: ["nigdy"], ko: ["절대"], ja: ["決して"] },
  "também": { en: ["also", "too"], es: ["también"], fr: ["aussi"], de: ["auch"], hi: ["भी"], ur: ["بھی"], ar: ["أيضا"], bn: ["ও", "এছাড়াও"], zh: ["也", "还"], ru: ["тоже", "также"], uk: ["також", "теж"], tr: ["da", "de"], pl: ["też", "również"], ko: ["또한", "~도"], ja: ["も", "また"] },
  "já": { en: ["already", "now"], es: ["ya"], fr: ["déjà"], de: ["schon", "bereits"], hi: ["पहले से", "अब"], ur: ["پہلے سے"], ar: ["بالفعل"], bn: ["ইতিমধ্যে"], zh: ["已经"], ru: ["уже"], uk: ["вже"], tr: ["zaten", "çoktan"], pl: ["już"], ko: ["이미", "벌써"], ja: ["もう", "すでに"] },
  "ainda": { en: ["still", "yet"], es: ["todavía", "aún"], fr: ["encore"], de: ["noch", "immer noch"], hi: ["अभी भी"], ur: ["ابھی بھی"], ar: ["لا يزال", "بعد"], bn: ["এখনও"], zh: ["还", "仍然"], ru: ["ещё", "всё ещё"], uk: ["ще", "досі"], tr: ["hâlâ", "henüz"], pl: ["jeszcze", "wciąż"], ko: ["아직"], ja: ["まだ"] },
  "hoje": { en: ["today"], es: ["hoy"], fr: ["aujourd'hui"], de: ["heute"], hi: ["आज"], ur: ["آج"], ar: ["اليوم"], bn: ["আজ"], zh: ["今天"], ru: ["сегодня"], uk: ["сьогодні"], tr: ["bugün"], pl: ["dzisiaj", "dziś"], ko: ["오늘"], ja: ["今日"] },
  "amanhã": { en: ["tomorrow"], es: ["mañana"], fr: ["demain"], de: ["morgen"], hi: ["कल"], ur: ["کل"], ar: ["غدا"], bn: ["আগামীকাল"], zh: ["明天"], ru: ["завтра"], uk: ["завтра"], tr: ["yarın"], pl: ["jutro"], ko: ["내일"], ja: ["明日"] },
  "ontem": { en: ["yesterday"], es: ["ayer"], fr: ["hier"], de: ["gestern"], hi: ["कल"], ur: ["کل"], ar: ["أمس"], bn: ["গতকাল"], zh: ["昨天"], ru: ["вчера"], uk: ["вчора"], tr: ["dün"], pl: ["wczoraj"], ko: ["어제"], ja: ["昨日"] },

  // ── Question words ──
  "que": { en: ["what", "that", "which"], es: ["qué", "que"], fr: ["que", "quoi"], de: ["was", "dass", "welche"], hi: ["क्या", "कि", "जो"], ur: ["کیا", "کہ", "جو"], ar: ["ما", "ماذا", "أن"], bn: ["কী", "যে"], zh: ["什么", "哪个"], ru: ["что", "который"], uk: ["що", "який"], tr: ["ne", "ki"], pl: ["co", "że", "który"], ko: ["무엇", "어떤"], ja: ["何", "どの"] },
  "quem": { en: ["who", "whom"], es: ["quién"], fr: ["qui"], de: ["wer", "wen"], hi: ["कौन", "किसे"], ur: ["کون", "کسے"], ar: ["من"], bn: ["কে", "কাকে"], zh: ["谁"], ru: ["кто", "кого"], uk: ["хто", "кого"], tr: ["kim", "kimi"], pl: ["kto", "kogo"], ko: ["누구"], ja: ["誰"] },
  "onde": { en: ["where"], es: ["dónde"], fr: ["où"], de: ["wo"], hi: ["कहाँ"], ur: ["کہاں"], ar: ["أين"], bn: ["কোথায়"], zh: ["哪里", "在哪"], ru: ["где"], uk: ["де"], tr: ["nerede", "nereye"], pl: ["gdzie"], ko: ["어디"], ja: ["どこ"] },
  "quando": { en: ["when"], es: ["cuándo"], fr: ["quand"], de: ["wann"], hi: ["कब"], ur: ["کب"], ar: ["متى"], bn: ["কখন"], zh: ["什么时候", "何时"], ru: ["когда"], uk: ["коли"], tr: ["ne zaman"], pl: ["kiedy"], ko: ["언제"], ja: ["いつ"] },
  "porque": { en: ["because", "why"], es: ["porque", "por qué"], fr: ["parce que", "pourquoi"], de: ["weil", "warum"], hi: ["क्योंकि", "क्यों"], ur: ["کیونکہ", "کیوں"], ar: ["لأن", "لماذا"], bn: ["কারণ", "কেন"], zh: ["因为", "为什么"], ru: ["потому что", "почему"], uk: ["тому що", "чому"], tr: ["çünkü", "neden"], pl: ["bo", "dlatego", "dlaczego"], ko: ["왜", "왜냐하면"], ja: ["なぜ", "だから"] },
  "quanto": { en: ["how much", "how many"], es: ["cuánto"], fr: ["combien"], de: ["wie viel", "wie viele"], hi: ["कितना"], ur: ["کتنا"], ar: ["كم"], bn: ["কতটা", "কত"], zh: ["多少"], ru: ["сколько"], uk: ["скільки"], tr: ["ne kadar", "kaç"], pl: ["ile"], ko: ["얼마나", "몇"], ja: ["いくら", "いくつ"] },

  // ── Prepositions & articles ──
  "de": { en: ["of", "from"], es: ["de"], fr: ["de"], de: ["von", "aus"], hi: ["का", "से"], ur: ["کا", "سے"], ar: ["من"], bn: ["এর", "থেকে"], zh: ["的", "从"], ru: ["из", "от"], uk: ["з", "від"], tr: ["-nın", "-den"], pl: ["z", "od"], ko: ["~의", "~에서"], ja: ["の", "から"] },
  "em": { en: ["in", "on", "at"], es: ["en"], fr: ["en", "dans"], de: ["in", "an", "auf"], hi: ["में", "पर"], ur: ["میں", "پر"], ar: ["في", "على"], bn: ["মধ্যে", "তে"], zh: ["在"], ru: ["в", "на"], uk: ["в", "на"], tr: ["-de", "-da"], pl: ["w", "na"], ko: ["~에", "~에서"], ja: ["に", "で"] },
  "para": { en: ["for", "to"], es: ["para"], fr: ["pour"], de: ["für", "nach", "zu"], hi: ["के लिए"], ur: ["کے لیے"], ar: ["إلى", "من أجل"], bn: ["জন্য", "জন্যে"], zh: ["为了", "到"], ru: ["для", "к"], uk: ["для", "до"], tr: ["için", "-e"], pl: ["dla", "do"], ko: ["~을 위해", "~에게"], ja: ["ために", "へ"] },
  "por": { en: ["for", "by", "through", "per"], es: ["por"], fr: ["par", "pour"], de: ["für", "durch", "pro"], hi: ["द्वारा", "के लिए", "से"], ur: ["کے ذریعے", "کے لیے"], ar: ["بواسطة", "من أجل"], bn: ["দ্বারা", "জন্য"], zh: ["由", "通过", "为了"], ru: ["за", "через", "по"], uk: ["за", "через", "по"], tr: ["için", "tarafından"], pl: ["za", "przez", "po"], ko: ["~를 위해", "~에 의해"], ja: ["によって", "を通して"] },
  "com": { en: ["with"], es: ["con"], fr: ["avec"], de: ["mit"], hi: ["के साथ"], ur: ["کے ساتھ"], ar: ["مع"], bn: ["সাথে", "সঙ্গে"], zh: ["和", "跟"], ru: ["с", "со"], uk: ["з", "із"], tr: ["ile", "-la"], pl: ["z"], ko: ["~와", "~과"], ja: ["と", "で"] },
  "sem": { en: ["without"], es: ["sin"], fr: ["sans"], de: ["ohne"], hi: ["बिना"], ur: ["بغیر", "بنا"], ar: ["بدون"], bn: ["ছাড়া", "বিনা"], zh: ["没有", "不"], ru: ["без"], uk: ["без"], tr: ["olmadan", "-sız"], pl: ["bez"], ko: ["~없이"], ja: ["なしで"] },

  // ── Numbers ──
  "um": { en: ["one", "a"], es: ["uno", "un"], fr: ["un"], de: ["eins", "ein"], hi: ["एक"], ur: ["ایک"], ar: ["واحد"], bn: ["এক"], zh: ["一"], ru: ["один"], uk: ["один"], tr: ["bir"], pl: ["jeden"], ko: ["하나", "일"], ja: ["一", "1つ"] },
  "dois": { en: ["two"], es: ["dos"], fr: ["deux"], de: ["zwei"], hi: ["दो"], ur: ["دو"], ar: ["اثنان"], bn: ["দুই"], zh: ["二", "两"], ru: ["два"], uk: ["два"], tr: ["iki"], pl: ["dwa"], ko: ["둘", "이"], ja: ["二"] },
  "três": { en: ["three"], es: ["tres"], fr: ["trois"], de: ["drei"], hi: ["तीन"], ur: ["تین"], ar: ["ثلاثة"], bn: ["তিন"], zh: ["三"], ru: ["три"], uk: ["три"], tr: ["üç"], pl: ["trzy"], ko: ["셋", "삼"], ja: ["三"] },

  // ── Colors ──
  "branco": { en: ["white"], es: ["blanco"], fr: ["blanc"], de: ["weiß"], hi: ["सफ़ेद"], ur: ["سفید"], ar: ["أبيض"], bn: ["সাদা"], zh: ["白"], ru: ["белый"], uk: ["білий"], tr: ["beyaz"], pl: ["biały"], ko: ["흰색", "하얀"], ja: ["白い"] },
  "preto": { en: ["black"], es: ["negro"], fr: ["noir"], de: ["schwarz"], hi: ["काला"], ur: ["کالا"], ar: ["أسود"], bn: ["কালো"], zh: ["黑"], ru: ["чёрный"], uk: ["чорний"], tr: ["siyah"], pl: ["czarny"], ko: ["검정", "까만"], ja: ["黒い"] },
  "vermelho": { en: ["red"], es: ["rojo"], fr: ["rouge"], de: ["rot"], hi: ["लाल"], ur: ["لال"], ar: ["أحمر"], bn: ["লাল"], zh: ["红"], ru: ["красный"], uk: ["червоний"], tr: ["kırmızı"], pl: ["czerwony"], ko: ["빨간"], ja: ["赤い"] },
  "azul": { en: ["blue"], es: ["azul"], fr: ["bleu"], de: ["blau"], hi: ["नीला"], ur: ["نیلا"], ar: ["أزرق"], bn: ["নীল"], zh: ["蓝"], ru: ["синий", "голубой"], uk: ["синій", "блакитний"], tr: ["mavi"], pl: ["niebieski"], ko: ["파란"], ja: ["青い"] },
  "verde": { en: ["green"], es: ["verde"], fr: ["vert"], de: ["grün"], hi: ["हरा"], ur: ["ہرا"], ar: ["أخضر"], bn: ["সবুজ"], zh: ["绿"], ru: ["зелёный"], uk: ["зелений"], tr: ["yeşil"], pl: ["zielony"], ko: ["초록"], ja: ["緑"] },
  "amarelo": { en: ["yellow"], es: ["amarillo"], fr: ["jaune"], de: ["gelb"], hi: ["पीला"], ur: ["پیلا"], ar: ["أصفر"], bn: ["হলুদ"], zh: ["黄"], ru: ["жёлтый"], uk: ["жовтий"], tr: ["sarı"], pl: ["żółty"], ko: ["노란"], ja: ["黄色い"] },

  // ── Feminine forms ──
  "boa": { en: ["good"], es: ["buena"], fr: ["bonne"], de: ["gut"], hi: ["अच्छी"], ur: ["اچھی"], ar: ["جيدة"], bn: ["ভালো"], zh: ["好"], ru: ["хорошая"], uk: ["хороша", "добра"], tr: ["iyi"], pl: ["dobra"], ko: ["좋은"], ja: ["良い"] },
  "má": { en: ["bad", "evil"], es: ["mala"], fr: ["mauvaise"], de: ["schlecht", "böse"], hi: ["बुरी"], ur: ["بری"], ar: ["سيئة"], bn: ["খারাপ"], zh: ["坏"], ru: ["плохая"], uk: ["погана"], tr: ["kötü"], pl: ["zła"], ko: ["나쁜"], ja: ["悪い"] },
  "bonita": { en: ["beautiful", "pretty"], es: ["bonita", "hermosa"], fr: ["belle", "jolie"], de: ["schön", "hübsch"], hi: ["सुंदर", "खूबसूरत"], ur: ["خوبصورت"], ar: ["جميلة"], bn: ["সুন্দর"], zh: ["漂亮", "美丽"], ru: ["красивая"], uk: ["гарна", "красива"], tr: ["güzel"], pl: ["ładna", "piękna"], ko: ["아름다운", "예쁜"], ja: ["きれい", "美しい"] },
  "nova": { en: ["new", "young"], es: ["nueva", "joven"], fr: ["nouvelle", "neuve", "jeune"], de: ["neu", "jung"], hi: ["नई", "जवान"], ur: ["نئی", "جوان"], ar: ["جديدة", "شابة"], bn: ["নতুন", "তরুণ"], zh: ["新", "年轻"], ru: ["новая", "молодая"], uk: ["нова", "молода"], tr: ["yeni", "genç"], pl: ["nowa", "młoda"], ko: ["새로운", "젊은"], ja: ["新しい", "若い"] },
  "velha": { en: ["old"], es: ["vieja"], fr: ["vieille", "ancienne"], de: ["alt"], hi: ["बूढ़ी", "पुरानी"], ur: ["بوڑھی", "پرانی"], ar: ["قديمة", "كبيرة في السن"], bn: ["পুরনো", "বৃদ্ধ"], zh: ["旧", "老"], ru: ["старая"], uk: ["стара"], tr: ["eski", "yaşlı"], pl: ["stara"], ko: ["오래된", "늙은"], ja: ["古い", "年老いた"] },
  "pequena": { en: ["small", "little"], es: ["pequeña"], fr: ["petite"], de: ["klein"], hi: ["छोटी"], ur: ["چھوٹی"], ar: ["صغيرة"], bn: ["ছোট"], zh: ["小"], ru: ["маленькая"], uk: ["маленька", "мала"], tr: ["küçük"], pl: ["mała"], ko: ["작은"], ja: ["小さい"] },
  "fria": { en: ["cold"], es: ["fría"], fr: ["froide"], de: ["kalt"], hi: ["ठंडी"], ur: ["ٹھنڈی"], ar: ["باردة"], bn: ["ঠান্ডা"], zh: ["冷"], ru: ["холодная"], uk: ["холодна"], tr: ["soğuk"], pl: ["zimna"], ko: ["차가운", "추운"], ja: ["寒い", "冷たい"] },
  "branca": { en: ["white"], es: ["blanca"], fr: ["blanche"], de: ["weiß"], hi: ["सफ़ेद"], ur: ["سفید"], ar: ["بيضاء"], bn: ["সাদা"], zh: ["白"], ru: ["белая"], uk: ["біла"], tr: ["beyaz"], pl: ["biała"], ko: ["흰색", "하얀"], ja: ["白い"] },
  "preta": { en: ["black"], es: ["negra"], fr: ["noire"], de: ["schwarz"], hi: ["काली"], ur: ["کالی"], ar: ["سوداء"], bn: ["কালো"], zh: ["黑"], ru: ["чёрная"], uk: ["чорна"], tr: ["siyah"], pl: ["czarna"], ko: ["검정", "까만"], ja: ["黒い"] },
  "vermelha": { en: ["red"], es: ["roja"], fr: ["rouge"], de: ["rot"], hi: ["लाल"], ur: ["لال"], ar: ["حمراء"], bn: ["লাল"], zh: ["红"], ru: ["красная"], uk: ["червона"], tr: ["kırmızı"], pl: ["czerwona"], ko: ["빨간"], ja: ["赤い"] },
  "amarela": { en: ["yellow"], es: ["amarilla"], fr: ["jaune"], de: ["gelb"], hi: ["पीली"], ur: ["پیلی"], ar: ["صفراء"], bn: ["হলুদ"], zh: ["黄"], ru: ["жёлтая"], uk: ["жовта"], tr: ["sarı"], pl: ["żółta"], ko: ["노란"], ja: ["黄色い"] },
  "cara": { en: ["expensive", "dear", "face"], es: ["cara", "querida"], fr: ["chère", "visage"], de: ["teuer", "lieb", "Gesicht"], hi: ["महँगी", "प्रिय", "चेहरा"], ur: ["مہنگی", "عزیز", "چہرہ"], ar: ["غالية", "عزيزة", "وجه"], bn: ["দামি", "প্রিয়", "মুখ"], zh: ["贵", "亲爱的", "脸"], ru: ["дорогая", "лицо"], uk: ["дорога", "обличчя"], tr: ["pahalı", "sevgili", "yüz"], pl: ["droga", "twarz"], ko: ["비싼", "친애하는", "얼굴"], ja: ["高い", "親愛な", "顔"] },
  "amiga": { en: ["friend"], es: ["amiga"], fr: ["amie"], de: ["Freundin"], hi: ["सहेली", "दोस्त"], ur: ["سہیلی", "دوست"], ar: ["صديقة"], bn: ["বান্ধবী"], zh: ["朋友"], ru: ["подруга"], uk: ["подруга"], tr: ["arkadaş"], pl: ["przyjaciółka"], ko: ["친구"], ja: ["友達"] },
  "gata": { en: ["cat"], es: ["gata"], fr: ["chatte"], de: ["Katze"], hi: ["बिल्ली"], ur: ["بلی"], ar: ["قطة"], bn: ["বিড়াল"], zh: ["猫"], ru: ["кошка"], uk: ["кішка"], tr: ["kedi"], pl: ["kotka"], ko: ["고양이"], ja: ["猫"] },
  "chateada": { en: ["annoyed", "upset", "bored"], es: ["molesta", "aburrida"], fr: ["ennuyée", "agacée"], de: ["genervt", "verärgert"], hi: ["नाराज़", "परेशान"], ur: ["ناراض", "پریشان"], ar: ["منزعجة", "ضجرة"], bn: ["বিরক্ত"], zh: ["烦恼", "无聊"], ru: ["раздражённая"], uk: ["роздратована"], tr: ["sinirli", "sıkılmış"], pl: ["zdenerwowana", "znudzona"], ko: ["짜증난", "지루한"], ja: ["イライラした", "退屈した"] },

  // ── PT-EU specifics ──
  "bica": { en: ["espresso", "tap", "faucet"], es: ["café expreso", "grifo"], fr: ["expresso", "robinet"], de: ["Espresso", "Wasserhahn"], hi: ["एस्प्रेसो"], ur: ["ایسپریسو"], ar: ["إسبريسو"], bn: ["এস্প্রেসো"], zh: ["浓缩咖啡"], ru: ["эспрессо"], uk: ["еспресо"], tr: ["espresso"], pl: ["espresso"], ko: ["에스프레소"], ja: ["エスプレッソ"] },
  "fixe": { en: ["cool", "great", "awesome"], es: ["genial", "guay"], fr: ["cool", "chouette"], de: ["cool", "toll"], hi: ["बढ़िया"], ur: ["زبردست"], ar: ["رائع"], bn: ["দারুণ"], zh: ["酷", "棒"], ru: ["круто", "здорово"], uk: ["круто"], tr: ["harika"], pl: ["fajnie", "super"], ko: ["멋진"], ja: ["かっこいい", "すごい"] },
  "autocarro": { en: ["bus"], es: ["autobús"], fr: ["bus", "autobus"], de: ["Bus"], hi: ["बस"], ur: ["بس"], ar: ["حافلة"], bn: ["বাস"], zh: ["公共汽车", "巴士"], ru: ["автобус"], uk: ["автобус"], tr: ["otobüs"], pl: ["autobus"], ko: ["버스"], ja: ["バス"] },
  "telemóvel": { en: ["mobile phone", "cell phone"], es: ["teléfono móvil"], fr: ["téléphone portable"], de: ["Handy", "Mobiltelefon"], hi: ["मोबाइल फ़ोन"], ur: ["موبائل فون"], ar: ["هاتف محمول"], bn: ["মোবাইল ফোন"], zh: ["手机"], ru: ["мобильный телефон"], uk: ["мобільний телефон"], tr: ["cep telefonu"], pl: ["telefon komórkowy"], ko: ["휴대폰"], ja: ["携帯電話"] },
  "pequeno-almoço": { en: ["breakfast"], es: ["desayuno"], fr: ["petit-déjeuner"], de: ["Frühstück"], hi: ["नाश्ता"], ur: ["ناشتا"], ar: ["فطور"], bn: ["নাস্তা", "সকালের খাবার"], zh: ["早餐"], ru: ["завтрак"], uk: ["сніданок"], tr: ["kahvaltı"], pl: ["śniadanie"], ko: ["아침 식사"], ja: ["朝食"] },

  // ── Common sentence words ──
  "dia": { en: ["day"], es: ["día"], fr: ["jour", "journée"], de: ["Tag"], hi: ["दिन"], ur: ["دن"], ar: ["يوم"], bn: ["দিন"], zh: ["天", "日"], ru: ["день"], uk: ["день"], tr: ["gün"], pl: ["dzień"], ko: ["날", "일"], ja: ["日"] },
  "noite": { en: ["night", "evening"], es: ["noche"], fr: ["nuit", "soir"], de: ["Nacht", "Abend"], hi: ["रात", "शाम"], ur: ["رات", "شام"], ar: ["ليل", "ليلة"], bn: ["রাত", "সন্ধ্যা"], zh: ["夜晚", "晚上"], ru: ["ночь", "вечер"], uk: ["ніч", "вечір"], tr: ["gece", "akşam"], pl: ["noc", "wieczór"], ko: ["밤", "저녁"], ja: ["夜"] },
  "tarde": { en: ["afternoon", "late"], es: ["tarde"], fr: ["après-midi", "tard"], de: ["Nachmittag", "spät"], hi: ["दोपहर", "देर"], ur: ["دوپہر", "دیر"], ar: ["بعد الظهر", "متأخر"], bn: ["বিকেল", "দেরি"], zh: ["下午", "迟"], ru: ["полдень", "поздно"], uk: ["полудень", "пізно"], tr: ["öğleden sonra", "geç"], pl: ["popołudnie", "późno"], ko: ["오후", "늦은"], ja: ["午後", "遅い"] },
  "manhã": { en: ["morning"], es: ["mañana"], fr: ["matin", "matinée"], de: ["Morgen", "Vormittag"], hi: ["सुबह"], ur: ["صبح"], ar: ["صباح"], bn: ["সকাল"], zh: ["早上", "上午"], ru: ["утро"], uk: ["ранок"], tr: ["sabah"], pl: ["rano", "poranek"], ko: ["아침"], ja: ["朝"] },
  "hora": { en: ["hour", "time"], es: ["hora"], fr: ["heure"], de: ["Stunde", "Uhrzeit"], hi: ["घंटा", "समय"], ur: ["گھنٹہ", "وقت"], ar: ["ساعة"], bn: ["ঘণ্টা", "সময়"], zh: ["小时", "时间"], ru: ["час", "время"], uk: ["година", "час"], tr: ["saat"], pl: ["godzina"], ko: ["시간"], ja: ["時間"] },
  "ano": { en: ["year"], es: ["año"], fr: ["an", "année"], de: ["Jahr"], hi: ["साल", "वर्ष"], ur: ["سال"], ar: ["سنة", "عام"], bn: ["বছর"], zh: ["年"], ru: ["год"], uk: ["рік"], tr: ["yıl", "sene"], pl: ["rok"], ko: ["해", "년"], ja: ["年"] },
  "vida": { en: ["life"], es: ["vida"], fr: ["vie"], de: ["Leben"], hi: ["ज़िंदगी", "जीवन"], ur: ["زندگی"], ar: ["حياة"], bn: ["জীবন"], zh: ["生活", "生命"], ru: ["жизнь"], uk: ["життя"], tr: ["hayat", "yaşam"], pl: ["życie"], ko: ["삶", "인생"], ja: ["人生", "生活"] },
  "coisa": { en: ["thing"], es: ["cosa"], fr: ["chose"], de: ["Ding", "Sache"], hi: ["चीज़"], ur: ["چیز"], ar: ["شيء"], bn: ["জিনিস"], zh: ["东西", "事情"], ru: ["вещь"], uk: ["річ"], tr: ["şey"], pl: ["rzecz"], ko: ["것", "물건"], ja: ["物", "もの"] },
  "lugar": { en: ["place", "spot"], es: ["lugar"], fr: ["lieu", "place", "endroit"], de: ["Ort", "Platz", "Stelle"], hi: ["जगह", "स्थान"], ur: ["جگہ"], ar: ["مكان"], bn: ["জায়গা", "স্থান"], zh: ["地方", "地点"], ru: ["место"], uk: ["місце"], tr: ["yer"], pl: ["miejsce"], ko: ["장소", "곳"], ja: ["場所"] },
  "porta": { en: ["door", "gate"], es: ["puerta"], fr: ["porte"], de: ["Tür", "Tor"], hi: ["दरवाज़ा"], ur: ["دروازہ"], ar: ["باب"], bn: ["দরজা"], zh: ["门"], ru: ["дверь"], uk: ["двері"], tr: ["kapı"], pl: ["drzwi"], ko: ["문"], ja: ["ドア", "門"] },
  "janela": { en: ["window"], es: ["ventana"], fr: ["fenêtre"], de: ["Fenster"], hi: ["खिड़की"], ur: ["کھڑکی"], ar: ["نافذة"], bn: ["জানালা"], zh: ["窗户"], ru: ["окно"], uk: ["вікно"], tr: ["pencere"], pl: ["okno"], ko: ["창문"], ja: ["窓"] },
};

const GP: Record<string, { g: "m" | "f"; alt: string }> = {
  "bom": { g: "m", alt: "boa" },
  "boa": { g: "f", alt: "bom" },
  "mau": { g: "m", alt: "má" },
  "má": { g: "f", alt: "mau" },
  "bonito": { g: "m", alt: "bonita" },
  "bonita": { g: "f", alt: "bonito" },
  "novo": { g: "m", alt: "nova" },
  "nova": { g: "f", alt: "novo" },
  "velho": { g: "m", alt: "velha" },
  "velha": { g: "f", alt: "velho" },
  "pequeno": { g: "m", alt: "pequena" },
  "pequena": { g: "f", alt: "pequeno" },
  "frio": { g: "m", alt: "fria" },
  "fria": { g: "f", alt: "frio" },
  "branco": { g: "m", alt: "branca" },
  "branca": { g: "f", alt: "branco" },
  "preto": { g: "m", alt: "preta" },
  "preta": { g: "f", alt: "preto" },
  "vermelho": { g: "m", alt: "vermelha" },
  "vermelha": { g: "f", alt: "vermelho" },
  "amarelo": { g: "m", alt: "amarela" },
  "amarela": { g: "f", alt: "amarelo" },
  "caro": { g: "m", alt: "cara" },
  "cara": { g: "f", alt: "caro" },
  "obrigado": { g: "m", alt: "obrigada" },
  "obrigada": { g: "f", alt: "obrigado" },
  "chateado": { g: "m", alt: "chateada" },
  "chateada": { g: "f", alt: "chateado" },
  "amigo": { g: "m", alt: "amiga" },
  "amiga": { g: "f", alt: "amigo" },
  "gato": { g: "m", alt: "gata" },
  "gata": { g: "f", alt: "gato" },
};

function buildReverse(l1: string): Record<string, string[]> {
  const rev: Record<string, string[]> = {};
  for (const [pt, translations] of Object.entries(D)) {
    const l1Translations = translations[l1];
    if (!l1Translations) continue;
    for (const t of l1Translations) {
      const key = t.toLowerCase();
      const existing = rev[key];
      if (existing) {
        if (!existing.includes(pt)) existing.push(pt);
      } else {
        rev[key] = [pt];
      }
    }
  }
  return rev;
}

const reverseCache = new Map<string, Record<string, string[]>>();

function getReverse(l1: string): Record<string, string[]> {
  let cached = reverseCache.get(l1);
  if (!cached) {
    cached = buildReverse(l1);
    reverseCache.set(l1, cached);
  }
  return cached;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:'"()«»“”‘’¿¡]/g, "");
}

export function lookupPtToL1(word: string, l1: string): string[] {
  const key = normalize(word);
  const entry = D[key];
  if (!entry) return [];
  return entry[l1] ?? entry["en"] ?? [];
}

export function lookupL1ToPt(word: string, l1: string): string[] {
  const rev = getReverse(l1);
  const key = normalize(word);
  return rev[key] ?? [];
}

export function lookupGenderPair(word: string): { g: "m" | "f"; alt: string } | null {
  return GP[normalize(word)] ?? null;
}
