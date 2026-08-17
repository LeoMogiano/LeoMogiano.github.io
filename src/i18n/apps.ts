import type { Lang } from './types';

/**
 * Los textos de cada app, por idioma. Viven aparte de src/data/apps.ts porque
 * eso son datos (número, nombre, año, icono) y esto es contenido traducible.
 * La clave es el `num` de la app.
 */
export interface AppCopy {
  tag: string;
  role: string;
  short: string;
  desc: string;
}

export const appCopy: Record<Lang, Record<string, AppCopy>> = {
  es: {
    '01': {
      tag: "Fintech · Flutter",
      role: "Tech Lead",
      short: "Wallet con IA, cashback y compras. Arquitectura modular y pagos en tiempo real.",
      desc: "Wallet fintech con asistente IA, cashback y compras dentro de la app. Trabajé la arquitectura modular, el flujo de pagos y el sistema de diseño.",
    },
    '02': {
      tag: "Wallet · Flutter",
      role: "Mobile Dev",
      short: "Validación de documentos con la sensación de un pase del Wallet de iOS.",
      desc: "Validación de documentos con la fluidez de un pase del Wallet de iOS: escaneo, verificación y credenciales que viven en el teléfono.",
    },
    '03': {
      tag: "Eventos · Flutter",
      role: "Mobile Dev",
      short: "Control de acceso para eventos corporativos: QR, aforo y staff en vivo.",
      desc: "Herramienta de control de acceso para eventos corporativos. Lectura de QR offline, aforo en vivo y roles de staff.",
    },
    '04': {
      tag: "Financiera · Flutter",
      role: "Mobile Dev",
      short: "App de la financiera digital: onboarding, créditos y pagos.",
      desc: "App de la financiera digital Presto: onboarding con validación de identidad, solicitud de créditos y pagos.",
    },
    '05': {
      tag: "Android · Offline",
      role: "Solo dev",
      short: "Herramientas PDF 100% offline: comprimir, imágenes ↔ PDF.",
      desc: "Suite de herramientas PDF que funciona sin internet: comprimir, convertir imágenes a PDF y de vuelta. Proyecto propio en Play Store.",
    },
  },
  en: {
    '01': {
      tag: "Fintech · Flutter",
      role: "Tech Lead",
      short: "AI wallet with cashback and in-app shopping. Modular architecture, real-time payments.",
      desc: "Fintech wallet with an AI assistant, cashback and in-app shopping. I owned the modular architecture, the payments flow and the design system.",
    },
    '02': {
      tag: "Wallet · Flutter",
      role: "Mobile Dev",
      short: "Document validation that feels like an iOS Wallet pass.",
      desc: "Document validation with the fluidity of an iOS Wallet pass: scanning, verification and credentials that live on the phone.",
    },
    '03': {
      tag: "Events · Flutter",
      role: "Mobile Dev",
      short: "Access control for corporate events: QR, capacity and live staff.",
      desc: "Access-control tool for corporate events. Offline QR scanning, live capacity and staff roles.",
    },
    '04': {
      tag: "Lending · Flutter",
      role: "Mobile Dev",
      short: "The digital lender's app: onboarding, loans and payments.",
      desc: "App for the digital lender Presto: onboarding with identity validation, loan requests and payments.",
    },
    '05': {
      tag: "Android · Offline",
      role: "Solo dev",
      short: "100% offline PDF tools: compress, images ↔ PDF.",
      desc: "A PDF toolkit that works with no internet: compress, convert images to PDF and back. Personal project, live on the Play Store.",
    },
  },
  ja: {
    '01': {
      tag: "フィンテック · Flutter",
      role: "テックリード",
      short: "AI搭載ウォレット。キャッシュバック、アプリ内ショッピング、リアルタイム決済。",
      desc: "AIアシスタント、キャッシュバック、アプリ内ショッピングを備えたフィンテックウォレット。モジュラーアーキテクチャ、決済フロー、デザインシステムを担当。",
    },
    '02': {
      tag: "ウォレット · Flutter",
      role: "モバイル開発",
      short: "iOSウォレットのパスのような感覚の書類認証。",
      desc: "iOSウォレットのパスのような滑らかさで書類を認証。スキャン、検証、そして端末の中に収まるクレデンシャル。",
    },
    '03': {
      tag: "イベント · Flutter",
      role: "モバイル開発",
      short: "法人イベントの入場管理：QR、入場者数、スタッフ権限。",
      desc: "法人イベント向けの入場管理ツール。オフラインQR読み取り、リアルタイムの入場者数、スタッフ権限の管理。",
    },
    '04': {
      tag: "金融 · Flutter",
      role: "モバイル開発",
      short: "デジタル金融アプリ：オンボーディング、ローン、支払い。",
      desc: "デジタル金融サービス Presto のアプリ。本人確認付きオンボーディング、ローン申請、支払い。",
    },
    '05': {
      tag: "Android · オフライン",
      role: "個人開発",
      short: "完全オフラインのPDFツール：圧縮、画像 ↔ PDF。",
      desc: "インターネット不要のPDFツール群。圧縮、画像からPDFへの変換とその逆。Play Store で公開中の個人プロジェクト。",
    },
  },
};
