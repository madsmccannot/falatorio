import { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import {
  createPlacementState,
  recordPlacementResponse,
  getPlacementResult,
  type PlacementQuestion,
} from "@falatorio/core/lesson";
import { getString, setString, KEYS } from "@/lib/storage";
import { trackFunnelPlacementStart, trackFunnelPlacementResult, trackScreenView } from "@/lib/analytics";
import type { L1Code, CEFRLevel } from "@falatorio/core";

type DisplayQuestion = PlacementQuestion & {
  prompt: string;
  options: string[];
  correct: number;
};

type QuestionDef = {
  id: string;
  difficulty: number;
  cefrTarget: CEFRLevel;
  correct: number;
  prompts: Record<L1Code, string>;
  opts: Record<L1Code, string[]>;
};

const PT_ONLY: Record<L1Code, string[]> = {
  en: ["falar", "falo", "fala", "falei"],
  es: ["falar", "falo", "fala", "falei"],
  fr: ["falar", "falo", "fala", "falei"],
  hi: ["falar", "falo", "fala", "falei"],
  ur: ["falar", "falo", "fala", "falei"],
  ar: ["falar", "falo", "fala", "falei"],
  bn: ["falar", "falo", "fala", "falei"],
  de: ["falar", "falo", "fala", "falei"],
  zh: ["falar", "falo", "fala", "falei"],
  ru: ["falar", "falo", "fala", "falei"],
  uk: ["falar", "falo", "fala", "falei"],
  tr: ["falar", "falo", "fala", "falei"],
  pl: ["falar", "falo", "fala", "falei"],
  ko: ["falar", "falo", "fala", "falei"],
  ja: ["falar", "falo", "fala", "falei"],
};

const PT_PHONE: Record<L1Code, string[]> = {
  en: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  es: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  fr: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  hi: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  ur: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  ar: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  bn: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  de: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  zh: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  ru: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  uk: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  tr: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  pl: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  ko: ["Celular", "Telemóvel", "Móvel", "Portátil"],
  ja: ["Celular", "Telemóvel", "Móvel", "Portátil"],
};

const QUESTION_BANK: QuestionDef[] = [
  {
    id: "1", difficulty: 1, cefrTarget: "A1", correct: 0,
    prompts: {
      en: "How do you say 'hello' in Portuguese?",
      es: "¿Cómo se dice 'hola' en portugués?",
      fr: "Comment dit-on « bonjour » en portugais ?",
      hi: "पुर्तगाली में 'hello' कैसे कहते हैं?",
      ur: "پرتگالی میں 'hello' کیسه کہته ہیں؟",
      ar: "كيف تقول 'مرحبا' بالبرتغالية؟",
      bn: "পর্তুগিজে 'hello' কীভাবে বলে?",
      de: "Wie sagt man 'Hallo' auf Portugiesisch?",
      zh: "葡萄牙语中‘你好’怎么说？",
      ru: "Как сказать «привет» на португальском?",
      uk: "Як сказати «привіт» португальською?",
      tr: "Portekizce'de 'merhaba' nasıl söylenir?",
      pl: "Jak się mówi 'cześć' po portugalsku?",
      ko: "포르투갈어로 '안녕'을 어떻게 말하나요?",
      ja: "ポルトガル語で「こんにちは」は何と言いますか？",
    },
    opts: {
      en: ["Olá", "Hola", "Bonjour", "Ciao"],
      es: ["Olá", "Hola", "Bonjour", "Ciao"],
      fr: ["Olá", "Hola", "Bonjour", "Ciao"],
      hi: ["Olá", "Hola", "Bonjour", "Ciao"],
      ur: ["Olá", "Hola", "Bonjour", "Ciao"],
      ar: ["Olá", "Hola", "Bonjour", "Ciao"],
      bn: ["Olá", "Hola", "Bonjour", "Ciao"],
      de: ["Olá", "Hola", "Bonjour", "Ciao"],
      zh: ["Olá", "Hola", "Bonjour", "Ciao"],
      ru: ["Olá", "Hola", "Bonjour", "Ciao"],
      uk: ["Olá", "Hola", "Bonjour", "Ciao"],
      tr: ["Olá", "Hola", "Bonjour", "Ciao"],
      pl: ["Olá", "Hola", "Bonjour", "Ciao"],
      ko: ["Olá", "Hola", "Bonjour", "Ciao"],
      ja: ["Olá", "Hola", "Bonjour", "Ciao"],
    },
  },
  {
    id: "2", difficulty: 1, cefrTarget: "A1", correct: 2,
    prompts: {
      en: "What does 'obrigado' mean?",
      es: "¿Qué significa 'obrigado'?",
      fr: "Que signifie « obrigado » ?",
      hi: "'obrigado' का क्या मतलब है?",
      ur: "'obrigado' کا کیا مطلب ہوتا ہے؟",
      ar: "ما معنى 'obrigado'؟",
      bn: "'obrigado' মানে কী?",
      de: "Was bedeutet 'obrigado'?",
      zh: "'obrigado' 是什么意思？",
      ru: "Что означает 'obrigado'?",
      uk: "Що означає 'obrigado'?",
      tr: "'obrigado' ne anlama gelir?",
      pl: "Co oznacza 'obrigado'?",
      ko: "'obrigado'는 무슨 뜻인가요?",
      ja: "'obrigado' の意味は？",
    },
    opts: {
      en: ["Goodbye", "Please", "Thank you", "Sorry"],
      es: ["Adiós", "Por favor", "Gracias", "Perdón"],
      fr: ["Au revoir", "S'il vous plaît", "Merci", "Pardon"],
      hi: ["अलविदा", "कृपया", "धन्यवाद", "माफ़ी"],
      ur: ["الوداع", "براہ کرم", "شکریہ", "معافی"],
      ar: ["وداعاً", "من فضلك", "شكراً", "آسف"],
      bn: ["বিদায়", "অনুগ্রহ", "ধন্যবাদ", "দুঃখিত"],
      de: ["Tschüss", "Bitte", "Danke", "Entschuldigung"],
      zh: ["再见", "请", "谢谢", "抱歉"],
      ru: ["До свидания", "Пожалуйста", "Спасибо", "Извините"],
      uk: ["До побачення", "Будь ласка", "Дякую", "Вибачте"],
      tr: ["Hoşça kalın", "Lütfen", "Teşekkür ederim", "Özür dilerim"],
      pl: ["Do widzenia", "Proszę", "Dziękuję", "Przepraszam"],
      ko: ["안녕히 가세요", "부탁합니다", "감사합니다", "죄송합니다"],
      ja: ["さようなら", "お願いします", "ありがとう", "ごめんなさい"],
    },
  },
  {
    id: "3", difficulty: 2, cefrTarget: "A2", correct: 1,
    prompts: {
      en: "Choose the correct: 'Eu ___ português.'",
      es: "Elige la correcta: 'Eu ___ português.'",
      fr: "Choisis la bonne réponse : 'Eu ___ português.'",
      hi: "सही विकल्प चुनें: 'Eu ___ português.'",
      ur: "صحیح انتخاب کریں: 'Eu ___ português.'",
      ar: "اختر الصحيح: 'Eu ___ português.'",
      bn: "সঠিক উত্তর বেছে নিন: 'Eu ___ português.'",
      de: "Wähle die richtige Form: 'Eu ___ português.'",
      zh: "选择正确的: 'Eu ___ português.'",
      ru: "Выберите правильное: 'Eu ___ português.'",
      uk: "Оберіть правильне: 'Eu ___ português.'",
      tr: "Doğru olanı seçin: 'Eu ___ português.'",
      pl: "Wybierz poprawną formę: 'Eu ___ português.'",
      ko: "올바른 것을 고르세요: 'Eu ___ português.'",
      ja: "正しいものを選んでください: 'Eu ___ português.'",
    },
    opts: PT_ONLY,
  },
  {
    id: "4", difficulty: 2, cefrTarget: "A2", correct: 2,
    prompts: {
      en: "'Autocarro' means:",
      es: "'Autocarro' significa:",
      fr: "« Autocarro » signifie :",
      hi: "'Autocarro' का मतलब है:",
      ur: "'Autocarro' کا مطلب ہے:",
      ar: "'Autocarro' يعني:",
      bn: "'Autocarro' মানে:",
      de: "'Autocarro' bedeutet:",
      zh: "'Autocarro' 的意思是：",
      ru: "'Autocarro' означает:",
      uk: "'Autocarro' означає:",
      tr: "'Autocarro' anlamı:",
      pl: "'Autocarro' oznacza:",
      ko: "'Autocarro'의 뜻:",
      ja: "'Autocarro' の意味:",
    },
    opts: {
      en: ["Car", "Train", "Bus", "Airplane"],
      es: ["Coche", "Tren", "Autobús", "Avión"],
      fr: ["Voiture", "Train", "Bus", "Avion"],
      hi: ["कार", "ट्रेन", "बस", "हवाई जहाज़"],
      ur: ["گاڑی", "ٹرین", "بس", "ہوائی جہاز"],
      ar: ["سيارة", "قطار", "حافلة", "طائرة"],
      bn: ["গাড়ি", "ট্রেন", "বাস", "বিমান"],
      de: ["Auto", "Zug", "Bus", "Flugzeug"],
      zh: ["汽车", "火车", "公共汽车", "飞机"],
      ru: ["Машина", "Поезд", "Автобус", "Самолёт"],
      uk: ["Авто", "Потяг", "Автобус", "Літак"],
      tr: ["Araba", "Tren", "Otobüs", "Uçak"],
      pl: ["Samochód", "Pociąg", "Autobus", "Samolot"],
      ko: ["자동차", "기차", "버스", "비행기"],
      ja: ["車", "電車", "バス", "飛行機"],
    },
  },
  {
    id: "5", difficulty: 3, cefrTarget: "B1", correct: 1,
    prompts: {
      en: "'Estou a fazer' is equivalent to:",
      es: "'Estou a fazer' equivale a:",
      fr: "« Estou a fazer » équivaut à :",
      hi: "'Estou a fazer' का अर्थ है:",
      ur: "'Estou a fazer' کا مطلب ہے:",
      ar: "'Estou a fazer' يعادل:",
      bn: "'Estou a fazer' এর সমতুল্য:",
      de: "'Estou a fazer' entspricht:",
      zh: "'Estou a fazer' 等同于：",
      ru: "'Estou a fazer' эквивалентно:",
      uk: "'Estou a fazer' еквівалентно:",
      tr: "'Estou a fazer' şuna eşdeğerdir:",
      pl: "'Estou a fazer' odpowiada:",
      ko: "'Estou a fazer'는 다음과 같습니다:",
      ja: "'Estou a fazer' は次のどれに相当しますか:",
    },
    opts: {
      en: ["I was doing", "I am doing", "I will do", "I did"],
      es: ["Estaba haciendo", "Estoy haciendo", "Voy a hacer", "Hice"],
      fr: ["Je faisais", "Je suis en train de faire", "Je vais faire", "J'ai fait"],
      hi: ["मैं कर रहा था", "मैं कर रहा हूँ", "मैं करूँगा", "मैंने किया"],
      ur: ["میں کر رہا تھا", "میں کر رہا ہوں", "میں کروں گا", "میں نه کیا"],
      ar: ["كنت أفعل", "أنا أفعل الآن", "سأفعل", "فعلت"],
      bn: ["আমি করছিলাম", "আমি করছি", "আমি করব", "আমি করেছি"],
      de: ["Ich machte", "Ich mache gerade", "Ich werde machen", "Ich habe gemacht"],
      zh: ["我当时在做", "我正在做", "我将要做", "我做了"],
      ru: ["Я делал", "Я делаю", "Я буду делать", "Я сделал"],
      uk: ["Я робив", "Я роблю", "Я зроблю", "Я зробив"],
      tr: ["Yapıyordum", "Yapıyorum", "Yapacağım", "Yaptım"],
      pl: ["Robiłem", "Robię", "Zrobię", "Zrobiłem"],
      ko: ["하고 있었다", "하고 있다", "할 것이다", "했다"],
      ja: ["していた", "している", "するつもり", "した"],
    },
  },
  {
    id: "6", difficulty: 3, cefrTarget: "B1", correct: 1,
    prompts: {
      en: "Which is PT-EU for 'mobile phone'?",
      es: "¿Cuál es la forma PT-EU de 'teléfono móvil'?",
      fr: "Quel est le mot PT-EU pour « téléphone portable » ?",
      hi: "'mobile phone' के लिए PT-EU शब्द कौन सा है?",
      ur: "'mobile phone' کے لیے PT-EU لفظ کیا ہے؟",
      ar: "ما الكلمة في PT-EU لـ'هاتف محمول'؟",
      bn: "'mobile phone'-এর জন্য PT-EU শব্দ কোনটি?",
      de: "Welches ist das PT-EU-Wort für 'Handy'?",
      zh: "PT-EU中'手机'是哪个词？",
      ru: "Какое слово в PT-EU означает 'мобильный телефон'?",
      uk: "Яке слово в PT-EU означає 'мобільний телефон'?",
      tr: "PT-EU'da 'cep telefonu' hangi kelimedir?",
      pl: "Które to słowo PT-EU na 'telefon komórkowy'?",
      ko: "PT-EU에서 '휴대폰'은 어떤 단어인가요?",
      ja: "PT-EUで「携帯電話」はどれですか？",
    },
    opts: PT_PHONE,
  },
  {
    id: "7", difficulty: 4, cefrTarget: "B2", correct: 2,
    prompts: {
      en: "'Oxalá que ele venha' uses which mood?",
      es: "'Ójalá que ele venha' usa el modo:",
      fr: "« Oxalá que ele venha » utilise quel mode ?",
      hi: "'Oxalá que ele venha' किस व्याकरणिक भाव का उपयोग करता है?",
      ur: "'Oxalá que ele venha' کون سا mood استعمال کرتا ہے؟",
      ar: "'Oxalá que ele venha' يستخدم أي صيغة؟",
      bn: "'Oxalá que ele venha' কোন mood ব্যবহার করে?",
      de: "'Oxalá que ele venha' verwendet welchen Modus?",
      zh: "'Oxalá que ele venha' 使用哪种语气？",
      ru: "'Oxalá que ele venha' использует какое наклонение?",
      uk: "'Oxalá que ele venha' використовує який спосіб?",
      tr: "'Oxalá que ele venha' hangi kipi kullanır?",
      pl: "'Oxalá que ele venha' używa jakiego trybu?",
      ko: "'Oxalá que ele venha'는 어떤 서법을 사용하나요?",
      ja: "'Oxalá que ele venha' はどの法を使っていますか？",
    },
    opts: {
      en: ["Indicative", "Conditional", "Subjunctive", "Imperative"],
      es: ["Indicativo", "Condicional", "Subjuntivo", "Imperativo"],
      fr: ["Indicatif", "Conditionnel", "Subjonctif", "Impératif"],
      hi: ["Indicative", "Conditional", "Subjunctive", "Imperative"],
      ur: ["Indicative", "Conditional", "Subjunctive", "Imperative"],
      ar: ["إخباري", "شرطي", "شكلي", "أمري"],
      bn: ["Indicative", "Conditional", "Subjunctive", "Imperative"],
      de: ["Indikativ", "Konditional", "Konjunktiv", "Imperativ"],
      zh: ["陈述式", "条件式", "虚拟式", "命令式"],
      ru: ["Изъявительное", "Условное", "Сослагательное", "Повелительное"],
      uk: ["Дійсний", "Умовний", "Умовний спосіб", "Наказовий"],
      tr: ["Haber kipi", "Koşul kipi", "İstek kipi", "Emir kipi"],
      pl: ["Oznajmujący", "Warunkowy", "Łączący", "Rozkazujący"],
      ko: ["직설법", "조건법", "접속법", "명령법"],
      ja: ["直説法", "条件法", "接続法", "命令法"],
    },
  },
  {
    id: "8", difficulty: 4, cefrTarget: "B2", correct: 1,
    prompts: {
      en: "'Desenrascar-se' best translates to:",
      es: "'Desenrascar-se' se traduce mejor como:",
      fr: "« Desenrascar-se » se traduit au mieux par :",
      hi: "'Desenrascar-se' का सबसे अच्छा अनुवाद है:",
      ur: "'Desenrascar-se' کا بہترین ترجمہ ہے:",
      ar: "أفضل ترجمة لـ'Desenrascar-se':",
      bn: "'Desenrascar-se'-এর সবচেয়ে ভালো অনুবাদ:",
      de: "'Desenrascar-se' übersetzt sich am besten als:",
      zh: "'Desenrascar-se' 最佳翻译为：",
      ru: "'Desenrascar-se' лучше всего переводится как:",
      uk: "'Desenrascar-se' найкраще перекладається як:",
      tr: "'Desenrascar-se' en iyi şöyle çevrilir:",
      pl: "'Desenrascar-se' najlepiej tłumaczy się jako:",
      ko: "'Desenrascar-se'의 가장 적합한 번역:",
      ja: "'Desenrascar-se' の最も適切な訳:",
    },
    opts: {
      en: ["To give up", "To figure it out", "To complain", "To run away"],
      es: ["Rendirse", "Apañárselas", "Quejarse", "Huir"],
      fr: ["Abandonner", "Se débrouiller", "Se plaindre", "S'enfuir"],
      hi: ["हार मानना", "जुगाड़ निकालना", "शिकायत करना", "भाग जाना"],
      ur: ["ہار ماننا", "جہاڑ لگانا", "شکایت کرنا", "بھاگ جانا"],
      ar: ["الاستسلام", "تدبر الأمر", "الشكوى", "الهرب"],
      bn: ["হার মানা", "মেনেজ করা", "অভিযোগ করা", "পালিয়ে যাওয়া"],
      de: ["Aufgeben", "Sich durchschlagen", "Sich beschweren", "Weglaufen"],
      zh: ["放弃", "想办法解决", "抱怨", "逃跑"],
      ru: ["Сдаться", "Разобраться", "Жаловаться", "Убежать"],
      uk: ["Здатися", "Викрутитися", "Скаржитися", "Втікати"],
      tr: ["Vazgeçmek", "Çözüm bulmak", "Şikâyet etmek", "Kaçmak"],
      pl: ["Poddać się", "Dać sobie radę", "Narzekać", "Uciec"],
      ko: ["포기하다", "어떻게든 해결하다", "불평하다", "도망치다"],
      ja: ["諸める", "なんとかする", "不平を言う", "逃げる"],
    },
  },
  {
    id: "9", difficulty: 5, cefrTarget: "C1", correct: 2,
    prompts: {
      en: "'Dir-lhe-ia' is an example of:",
      es: "'Dir-lhe-ia' es un ejemplo de:",
      fr: "« Dir-lhe-ia » est un exemple de :",
      hi: "'Dir-lhe-ia' एक उदाहरण है:",
      ur: "'Dir-lhe-ia' کی مثال ہے:",
      ar: "'Dir-lhe-ia' مثال على:",
      bn: "'Dir-lhe-ia' এর উদাহরণ:",
      de: "'Dir-lhe-ia' ist ein Beispiel für:",
      zh: "'Dir-lhe-ia' 是以下哪种的例子？",
      ru: "'Dir-lhe-ia' — это пример:",
      uk: "'Dir-lhe-ia' — це приклад:",
      tr: "'Dir-lhe-ia' şunun bir örneğidir:",
      pl: "'Dir-lhe-ia' to przykład:",
      ko: "'Dir-lhe-ia'는 다음의 예입니다:",
      ja: "'Dir-lhe-ia' は次の例です:",
    },
    opts: {
      en: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"],
      es: ["Énclisis", "Proclisis", "Mesóclisis", "Aféresis"],
      fr: ["Enclise", "Proclise", "Mésoclise", "Aphérèse"],
      hi: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"],
      ur: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"],
      ar: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"],
      bn: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"],
      de: ["Enklise", "Proklise", "Mesoklise", "Aphärese"],
      zh: ["后附", "前附", "中置", "词首省略"],
      ru: ["Энклиза", "Проклиза", "Мезоклиза", "Афереза"],
      uk: ["Енкліза", "Прокліза", "Мезокліза", "Афереза"],
      tr: ["Enkliz", "Prokliz", "Mezokliz", "Aferez"],
      pl: ["Enkliza", "Prokliza", "Mezokliza", "Afereza"],
      ko: ["후치", "전치", "중치", "어두생략"],
      ja: ["後接", "前接", "中間接辞", "語頭音消失"],
    },
  },
  {
    id: "10", difficulty: 5, cefrTarget: "C1", correct: 3,
    prompts: {
      en: "'Pôr-do-sol' — the verb 'pôr' is:",
      es: "'Pôr-do-sol' — el verbo 'pôr' es:",
      fr: "« Pôr-do-sol » — le verbe « pôr » est :",
      hi: "'Pôr-do-sol' — क्रिया 'pôr' है:",
      ur: "'Pôr-do-sol' — فعل 'pôr' ہے:",
      ar: "'Pôr-do-sol' — الفعل 'pôr':",
      bn: "'Pôr-do-sol' — ক্রিয়া 'pôr' হলো:",
      de: "'Pôr-do-sol' — das Verb 'pôr' ist:",
      zh: "'Pôr-do-sol' — 动词 'pôr' 是：",
      ru: "'Pôr-do-sol' — глагол 'pôr':",
      uk: "'Pôr-do-sol' — дієслово 'pôr':",
      tr: "'Pôr-do-sol' — fiil 'pôr':",
      pl: "'Pôr-do-sol' — czasownik 'pôr' jest:",
      ko: "'Pôr-do-sol' — 동사 'pôr'는:",
      ja: "'Pôr-do-sol' — 動詞 'pôr' は:",
    },
    opts: {
      en: ["Regular -ar", "Regular -er", "Regular -ir", "Irregular"],
      es: ["Regular -ar", "Regular -er", "Regular -ir", "Irregular"],
      fr: ["Régulier -ar", "Régulier -er", "Régulier -ir", "Irrégulier"],
      hi: ["नियमित -ar", "नियमित -er", "नियमित -ir", "अनियमित"],
      ur: ["باقاعدہ -ar", "باقاعدہ -er", "باقاعدہ -ir", "بے قاعدہ"],
      ar: ["منتظم -ar", "منتظم -er", "منتظم -ir", "شاذ"],
      bn: ["নিয়মিত -ar", "নিয়মিত -er", "নিয়মিত -ir", "অনিয়মিত"],
      de: ["Regelmäßig -ar", "Regelmäßig -er", "Regelmäßig -ir", "Unregelmäßig"],
      zh: ["规则 -ar", "规则 -er", "规则 -ir", "不规则"],
      ru: ["Правильный -ar", "Правильный -er", "Правильный -ir", "Неправильный"],
      uk: ["Правильний -ar", "Правильний -er", "Правильний -ir", "Неправильний"],
      tr: ["Düzenli -ar", "Düzenli -er", "Düzenli -ir", "Düzensiz"],
      pl: ["Regularny -ar", "Regularny -er", "Regularny -ir", "Nieregularny"],
      ko: ["규칙 -ar", "규칙 -er", "규칙 -ir", "불규칙"],
      ja: ["規則 -ar", "規則 -er", "規則 -ir", "不規則"],
    },
  },
];

const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function cefrIndex(level: CEFRLevel): number {
  return CEFR_ORDER.indexOf(level);
}

function buildQuestions(l1: L1Code, maxLevel: CEFRLevel): DisplayQuestion[] {
  const maxIdx = cefrIndex(maxLevel);
  const cap = Math.min(maxIdx + 1, CEFR_ORDER.length - 1);
  const maxCefr = CEFR_ORDER[cap]!;

  return QUESTION_BANK
    .filter((q) => cefrIndex(q.cefrTarget) <= cefrIndex(maxCefr))
    .map((q) => ({
      id: q.id,
      difficulty: q.difficulty,
      cefrTarget: q.cefrTarget,
      prompt: q.prompts[l1],
      options: q.opts[l1],
      correct: q.correct,
    }));
}

export default function PlacementTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const l1 = (getString(KEYS.SELECTED_L1) ?? "en") as L1Code;
  const selectedLevel = (getString(KEYS.SELECTED_LEVEL) ?? "A1") as CEFRLevel;

  const questions = useMemo(() => buildQuestions(l1, selectedLevel), [l1, selectedLevel]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    trackScreenView("placement_test");
    trackFunnelPlacementStart();
  }, []);

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;

  const finishTest = useCallback(() => {
    setShowResult(true);
  }, []);

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || !question) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(index);

    const isCorrect = index === question.correct;
    setAnswers((prev) => [...prev, isCorrect]);

    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        finishTest();
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      }
    }, 800);
  };

  const handleBack = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    setString(KEYS.PLACEMENT_LEVEL, selectedLevel);
    router.push("/onboarding/plan");
  };

  if (totalQuestions === 0) {
    setString(KEYS.PLACEMENT_LEVEL, selectedLevel);
    router.replace("/onboarding/plan");
    return null;
  }

  if (showResult) {
    const correctCount = answers.filter(Boolean).length;
    let state = createPlacementState(questions, l1);
    for (let i = 0; i < answers.length; i++) {
      const q = questions[i]!;
      state = recordPlacementResponse(state, q.id, answers[i]!, q.difficulty);
    }
    const result = getPlacementResult(state);
    setString(KEYS.PLACEMENT_LEVEL, result.cefrLevel);
    trackFunnelPlacementResult(result.cefrLevel, result.accuracy, result.questionsAnswered);

    return (
      <View style={[shared.screen, local.resultContainer, { paddingTop: insets.top + spacing["5xl"] }]}>
        <Text style={[local.resultLevel, { color: theme.isDark ? colors.primary[400] : colors.primary[600] }]}>
          {result.cefrLevel}
        </Text>
        <Text style={[local.resultTitle, { color: theme.text }]}>{t("onboarding.result_title")}</Text>
        <Text style={[local.resultSubtitle, { color: theme.textMuted }]}>
          {t("onboarding.result_text", { correct: correctCount, total: answers.length, level: result.cefrLevel })}
        </Text>
        <Button
          title={t("onboarding.choose_plan")}
          onPress={() => router.push("/onboarding/plan")}
          size="lg"
          style={local.resultButton}
        />
      </View>
    );
  }

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <View style={local.topRow}>
        <Pressable onPress={handleBack} hitSlop={12} style={local.closeButton}>
          <Text style={[local.closeText, { color: theme.textSecondary }]}>X</Text>
        </Pressable>
        <View style={[local.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[local.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={[local.progressText, { color: theme.textMuted }]}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      {question && (
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(200)}
          style={local.questionContainer}
        >
          <Text style={[local.question, { color: theme.text }]}>{question.prompt}</Text>

          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correct;
            const showFeedback = selectedOption !== null;

            return (
              <Pressable
                key={index}
                onPress={() => handleSelectOption(index)}
                disabled={selectedOption !== null}
                style={[
                  shared.optionCardVertical,
                  showFeedback && isCorrect && { borderColor: colors.primary[600], backgroundColor: theme.optionSelectedBg },
                  showFeedback && isSelected && !isCorrect && { borderColor: colors.accent[500], backgroundColor: theme.isDark ? "#2D1111" : colors.accent[50] },
                ]}
              >
                <Text style={[shared.optionLabel, { fontWeight: "500" }, showFeedback && isCorrect && shared.optionLabelSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <Modal visible={showExitModal} transparent animationType="fade" onRequestClose={() => setShowExitModal(false)}>
        <Pressable style={local.modalOverlay} onPress={() => setShowExitModal(false)}>
          <Pressable style={[local.modalContent, { backgroundColor: theme.bgElevated }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[local.modalTitle, { color: theme.text }]}>{t("onboarding.exit_test_title")}</Text>
            <Text style={[local.modalDesc, { color: theme.textSecondary }]}>{t("onboarding.exit_test_desc")}</Text>
            <View style={local.modalButtons}>
              <Button
                title={t("onboarding.exit_test_stay")}
                onPress={() => setShowExitModal(false)}
                size="lg"
                style={local.modalBtn}
              />
              <Button
                title={t("onboarding.exit_test_leave")}
                onPress={handleExitConfirm}
                variant="outline"
                size="lg"
                style={local.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const local = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing["2xl"],
    lineHeight: 28,
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultLevel: {
    fontSize: 56,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing["3xl"],
  },
  resultButton: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: radii.xl,
    padding: spacing["2xl"],
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalDesc: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    gap: spacing.sm,
  },
  modalBtn: {
    width: "100%",
  },
});
