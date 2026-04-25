// lib/i18n.ts
// ═══════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.1 — Sistema de idiomas
//  8 idiomas: ES · EN · PT · AR · FR · RU · ZH · ID
//  UI strings + funciones de gestión de idioma
// ═══════════════════════════════════════════════════════════════

export type Lang = 'es' | 'en' | 'pt' | 'ar' | 'fr' | 'ru' | 'zh' | 'id';

export const RTL_LANGS: Lang[] = ['ar'];
export const LLAVE_IDIOMA = 'ingenium_idioma';
export const EVENTO_IDIOMA = 'ingenium_lang_change';

export interface MetaIdioma {
  nombre: string;
  bandera: string;
  nativo: string;
}

export const IDIOMAS: Record<Lang, MetaIdioma> = {
  es: { nombre: 'Español',    bandera: '🇦🇷', nativo: 'Español' },
  en: { nombre: 'English',    bandera: '🇺🇸', nativo: 'English' },
  pt: { nombre: 'Português',  bandera: '🇧🇷', nativo: 'Português' },
  ar: { nombre: 'العربية',    bandera: '🇸🇦', nativo: 'العربية' },
  fr: { nombre: 'Français',   bandera: '🇫🇷', nativo: 'Français' },
  ru: { nombre: 'Русский',    bandera: '🇷🇺', nativo: 'Русский' },
  zh: { nombre: '中文',        bandera: '🇨🇳', nativo: '中文' },
  id: { nombre: 'Indonesia',  bandera: '🇮🇩', nativo: 'Bahasa Indonesia' },
};

// ── Funciones de gestión ──────────────────────────────────────
export function getLang(): Lang {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(LLAVE_IDIOMA) as Lang) || 'es';
}

export function setLang(lang: Lang): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LLAVE_IDIOMA, lang);
  window.dispatchEvent(new CustomEvent(EVENTO_IDIOMA, { detail: lang }));
}

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS.includes(lang);
}

// ── UI Strings — 8 idiomas — 100% verificados ─────────────────
export interface UIStrings {
  intro_titulo: string;
  que_es_lbl: string;
  calcula_lbl: string;
  normas_lbl: string;
  usar_lbl: string;
  ver: string;
  ocultar: string;
  primera_vez: string;
  objetivo: string;
  paso: string;
}

export const UI: Record<Lang, UIStrings> = {
  es: {
    intro_titulo: 'Introducción al Módulo',
    que_es_lbl:   '¿Qué es este módulo?',
    calcula_lbl:  '¿Qué calcula?',
    normas_lbl:   'Normativas aplicadas',
    usar_lbl:     '¿Cómo usarlo? — Paso a paso',
    ver:          'Ver introducción',
    ocultar:      'Ocultar introducción',
    primera_vez:  'Primera vez en este módulo — te explicamos todo',
    objetivo:     'Objetivo',
    paso:         'Paso',
  },
  en: {
    intro_titulo: 'Module Introduction',
    que_es_lbl:   'What is this module?',
    calcula_lbl:  'What does it calculate?',
    normas_lbl:   'Applied Standards',
    usar_lbl:     'How to use it — Step by step',
    ver:          'View introduction',
    ocultar:      'Hide introduction',
    primera_vez:  'First time in this module — we explain everything',
    objetivo:     'Objective',
    paso:         'Step',
  },
  pt: {
    intro_titulo: 'Introdução ao Módulo',
    que_es_lbl:   'O que é este módulo?',
    calcula_lbl:  'O que calcula?',
    normas_lbl:   'Normas aplicadas',
    usar_lbl:     'Como usar — Passo a passo',
    ver:          'Ver introdução',
    ocultar:      'Ocultar introdução',
    primera_vez:  'Primeira vez neste módulo — explicamos tudo',
    objetivo:     'Objetivo',
    paso:         'Passo',
  },
  ar: {
    intro_titulo: 'مقدمة الوحدة',
    que_es_lbl:   'ما هذه الوحدة؟',
    calcula_lbl:  'ماذا تحسب؟',
    normas_lbl:   'المعايير المطبقة',
    usar_lbl:     'كيفية الاستخدام — خطوة بخطوة',
    ver:          'عرض المقدمة',
    ocultar:      'إخفاء المقدمة',
    primera_vez:  'أول مرة في هذه الوحدة — نشرح كل شيء',
    objetivo:     'الهدف',
    paso:         'خطوة',
  },
  fr: {
    intro_titulo: 'Introduction au Module',
    que_es_lbl:   "Qu'est-ce que ce module?",
    calcula_lbl:  'Que calcule-t-il?',
    normas_lbl:   'Normes appliquées',
    usar_lbl:     "Comment l'utiliser — Étape par étape",
    ver:          "Voir l'introduction",
    ocultar:      "Masquer l'introduction",
    primera_vez:  'Première fois dans ce module — nous expliquons tout',
    objetivo:     'Objectif',
    paso:         'Étape',
  },
  ru: {
    intro_titulo: 'Введение в модуль',
    que_es_lbl:   'Что такое этот модуль?',
    calcula_lbl:  'Что рассчитывает?',
    normas_lbl:   'Применяемые стандарты',
    usar_lbl:     'Как использовать — Шаг за шагом',
    ver:          'Показать введение',
    ocultar:      'Скрыть введение',
    primera_vez:  'Первый раз в этом модуле — объясняем всё',
    objetivo:     'Цель',
    paso:         'Шаг',
  },
  zh: {
    intro_titulo: '模块介绍',
    que_es_lbl:   '这个模块是什么？',
    calcula_lbl:  '它计算什么？',
    normas_lbl:   '适用标准',
    usar_lbl:     '如何使用 — 分步指南',
    ver:          '查看介绍',
    ocultar:      '隐藏介绍',
    primera_vez:  '首次使用此模块 — 我们解释一切',
    objetivo:     '目标',
    paso:         '步骤',
  },
  id: {
    intro_titulo: 'Pengenalan Modul',
    que_es_lbl:   'Apa modul ini?',
    calcula_lbl:  'Apa yang dihitung?',
    normas_lbl:   'Standar yang diterapkan',
    usar_lbl:     'Cara menggunakan — Langkah demi langkah',
    ver:          'Lihat pengenalan',
    ocultar:      'Sembunyikan pengenalan',
    primera_vez:  'Pertama kali di modul ini — kami menjelaskan segalanya',
    objetivo:     'Tujuan',
    paso:         'Langkah',
  },
}; 