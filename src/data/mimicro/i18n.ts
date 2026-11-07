/**
 * Idiomas de las páginas legales de MiMicro: los mismos 8 de las apps
 * (Localizable.xcstrings en iOS, values-* en Android). El inglés es la versión
 * que vale; el resto son traducciones de cortesía.
 *
 * El texto legal vive en terms.<lang>.json / privacy.<lang>.json; aquí solo
 * van los textos fijos de la página.
 */
export const LANGS = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja', 'ru'] as const;
export type LegalLang = (typeof LANGS)[number];
export const DOC_KEYS = ['terms', 'privacy'] as const;
export type DocKey = (typeof DOC_KEYS)[number];

export interface LegalDoc {
  effective: string;
  intro: string;
  sections: { id: string; title: string; html: string }[];
}

const files = import.meta.glob<LegalDoc>('./*.json', { eager: true, import: 'default' });
export const getDoc = (doc: DocKey, lang: LegalLang): LegalDoc => files[`./${doc}.${lang}.json`];

/** /mimicro/terms/ para inglés (la URL que ya usan las apps), /mimicro/es/terms/ para el resto. */
export const legalPath = (doc: DocKey, lang: LegalLang) => `/mimicro/${lang === 'en' ? '' : `${lang}/`}${doc}/`;

interface UI {
  /** Nombre de la app como lo muestra el sistema: MiMicro solo en español (CFBundleDisplayName / app_name). */
  brand: string;
  name: string;
  title: Record<DocKey, string>;
  tab: Record<DocKey, string>;
  nav: string;
  toc: string;
  effective: string;
  skip: string;
  askTitle: string;
  askText: string;
  askBtn: string;
  madeBy: string;
  generated: string;
  language: string;
  courtesy: string;
  readEnglish: string;
  description: (title: string, date: string) => string;
}

export const UI: Record<LegalLang, UI> = {
  en: {
    brand: 'MyMicro',
    name: 'English',
    title: { terms: 'Terms & Conditions', privacy: 'Privacy Policy' },
    tab: { terms: 'Terms', privacy: 'Privacy' },
    nav: 'Legal documents',
    toc: 'On this page',
    effective: 'Effective',
    skip: 'Skip to content',
    askTitle: 'Questions about this?',
    askText: 'Write to Leonardo Mogiano, who builds MyMicro.',
    askBtn: 'Email us',
    madeBy: 'Made by',
    generated: 'Originally generated with',
    language: 'Language',
    courtesy: '',
    readEnglish: '',
    description: (t, d) => `${t} for MyMicro, the bus app for Santa Cruz de la Sierra. Effective ${d}.`,
  },
  es: {
    brand: 'MiMicro',
    name: 'Español',
    title: { terms: 'Términos y condiciones', privacy: 'Política de privacidad' },
    tab: { terms: 'Términos', privacy: 'Privacidad' },
    nav: 'Documentos legales',
    toc: 'En esta página',
    effective: 'Vigente desde',
    skip: 'Saltar al contenido',
    askTitle: '¿Tienes preguntas?',
    askText: 'Escríbele a Leonardo Mogiano, quien hace MiMicro.',
    askBtn: 'Escríbenos',
    madeBy: 'Hecho por',
    generated: 'Generado originalmente con',
    language: 'Idioma',
    courtesy: 'Traducción de cortesía. Si hay diferencias, prevalece la versión en inglés.',
    readEnglish: 'Ver en inglés',
    description: (t, d) => `${t} de MiMicro, la app de micros de Santa Cruz de la Sierra. Vigente desde el ${d}.`,
  },
  pt: {
    brand: 'MyMicro',
    name: 'Português',
    title: { terms: 'Termos e Condições', privacy: 'Política de Privacidade' },
    tab: { terms: 'Termos', privacy: 'Privacidade' },
    nav: 'Documentos legais',
    toc: 'Nesta página',
    effective: 'Em vigor desde',
    skip: 'Pular para o conteúdo',
    askTitle: 'Dúvidas sobre isto?',
    askText: 'Escreva para Leonardo Mogiano, criador do MyMicro.',
    askBtn: 'Enviar e-mail',
    madeBy: 'Feito por',
    generated: 'Gerado originalmente com',
    language: 'Idioma',
    courtesy: 'Tradução de cortesia. Em caso de divergência, prevalece a versão em inglês.',
    readEnglish: 'Ver em inglês',
    description: (t, d) => `${t} do MyMicro, o app de ônibus de Santa Cruz de la Sierra. Em vigor desde ${d}.`,
  },
  fr: {
    brand: 'MyMicro',
    name: 'Français',
    title: { terms: 'Conditions générales', privacy: 'Politique de confidentialité' },
    tab: { terms: 'Conditions', privacy: 'Confidentialité' },
    nav: 'Documents juridiques',
    toc: 'Sur cette page',
    effective: 'En vigueur depuis le',
    skip: 'Aller au contenu',
    askTitle: 'Une question ?',
    askText: 'Écrivez à Leonardo Mogiano, qui développe MyMicro.',
    askBtn: 'Nous écrire',
    madeBy: 'Créé par',
    generated: 'Généré à l’origine avec',
    language: 'Langue',
    courtesy: 'Traduction de courtoisie. En cas de divergence, la version anglaise prévaut.',
    readEnglish: 'Voir en anglais',
    description: (t, d) => `${t} de MyMicro, l’application de bus de Santa Cruz de la Sierra. En vigueur depuis le ${d}.`,
  },
  de: {
    brand: 'MyMicro',
    name: 'Deutsch',
    title: { terms: 'Nutzungsbedingungen', privacy: 'Datenschutzerklärung' },
    tab: { terms: 'Bedingungen', privacy: 'Datenschutz' },
    nav: 'Rechtliche Dokumente',
    toc: 'Auf dieser Seite',
    effective: 'Gültig ab',
    skip: 'Zum Inhalt springen',
    askTitle: 'Fragen dazu?',
    askText: 'Schreiben Sie an Leonardo Mogiano, der MyMicro entwickelt.',
    askBtn: 'E-Mail senden',
    madeBy: 'Erstellt von',
    generated: 'Ursprünglich erstellt mit',
    language: 'Sprache',
    courtesy: 'Unverbindliche Übersetzung. Bei Abweichungen gilt die englische Fassung.',
    readEnglish: 'Englische Fassung',
    description: (t, d) => `${t} von MyMicro, der Bus-App für Santa Cruz de la Sierra. Gültig ab ${d}.`,
  },
  it: {
    brand: 'MyMicro',
    name: 'Italiano',
    title: { terms: 'Termini e condizioni', privacy: 'Informativa sulla privacy' },
    tab: { terms: 'Termini', privacy: 'Privacy' },
    nav: 'Documenti legali',
    toc: 'In questa pagina',
    effective: 'In vigore dal',
    skip: 'Vai al contenuto',
    askTitle: 'Domande?',
    askText: 'Scrivi a Leonardo Mogiano, che sviluppa MyMicro.',
    askBtn: 'Scrivici',
    madeBy: 'Realizzato da',
    generated: 'Generato originariamente con',
    language: 'Lingua',
    courtesy: 'Traduzione di cortesia. In caso di discrepanze prevale la versione inglese.',
    readEnglish: 'Vedi in inglese',
    description: (t, d) => `${t} di MyMicro, l’app degli autobus di Santa Cruz de la Sierra. In vigore dal ${d}.`,
  },
  ja: {
    brand: 'MyMicro',
    name: '日本語',
    title: { terms: '利用規約', privacy: 'プライバシーポリシー' },
    tab: { terms: '利用規約', privacy: 'プライバシー' },
    nav: '法的文書',
    toc: 'このページの内容',
    effective: '施行日',
    skip: '本文へスキップ',
    askTitle: 'ご質問はありますか？',
    askText: 'MyMicro の開発者 Leonardo Mogiano までご連絡ください。',
    askBtn: 'メールで問い合わせる',
    madeBy: '制作',
    generated: '原文の作成ツール：',
    language: '言語',
    courtesy: '参考訳です。内容に相違がある場合は英語版が優先されます。',
    readEnglish: '英語版を見る',
    description: (t, d) => `MyMicro（サンタクルス・デ・ラ・シエラのバスアプリ）の${t}。施行日：${d}。`,
  },
  ru: {
    brand: 'MyMicro',
    name: 'Русский',
    title: { terms: 'Условия использования', privacy: 'Политика конфиденциальности' },
    tab: { terms: 'Условия', privacy: 'Конфиденциальность' },
    nav: 'Юридические документы',
    toc: 'На этой странице',
    effective: 'Действует с',
    skip: 'Перейти к содержанию',
    askTitle: 'Есть вопросы?',
    askText: 'Напишите Leonardo Mogiano, разработчику MyMicro.',
    askBtn: 'Написать нам',
    madeBy: 'Автор',
    generated: 'Изначально создано с помощью',
    language: 'Язык',
    courtesy: 'Перевод для удобства. При расхождениях преимущественную силу имеет английская версия.',
    readEnglish: 'Английская версия',
    description: (t, d) => `${t} MyMicro — приложения для автобусов Санта-Крус-де-ла-Сьерры. Действует с ${d}.`,
  },
};
