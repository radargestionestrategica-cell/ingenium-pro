'use client';
import { useState, useEffect } from 'react';
import { getLang, isRTL, UI, EVENTO_IDIOMA } from '@/lib/i18n';
import { MODULOS_INTRO } from '@/lib/modulos-intro';
import type { Lang } from '@/lib/i18n';

// ═══════════════════════════════════════════════════════════════
//  INTRO POR MÓDULO — INGENIUM PRO v8.1
//  Colapsable. 4 secciones. 8 idiomas. RTL automático.
//  Detecta primer uso del módulo y se abre automáticamente.
// ═══════════════════════════════════════════════════════════════

interface Props { moduloId: string; }

export default function ModuloIntro({ moduloId }: Props) {
  const [lang, setLang]       = useState<Lang>('es');
  const [abierto, setAbierto] = useState(false);
  const [tab, setTab]         = useState<'que_es' | 'calcula' | 'normas' | 'usar'>('que_es');

  const data = MODULOS_INTRO[moduloId];
  if (!data) return null;

  useEffect(() => {
    // Leer idioma actual
    const l = getLang();
    setLang(l);

    // Detectar primer uso del módulo → abrir automáticamente
    const llave = `ingenium_intro_visto_${moduloId}`;
    if (!localStorage.getItem(llave)) {
      setAbierto(true);
      localStorage.setItem(llave, '1');
    }

    // Escuchar cambios de idioma desde SelectorIdioma
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Lang>;
      setLang(ce.detail);
    };
    window.addEventListener(EVENTO_IDIOMA, handler);
    return () => window.removeEventListener(EVENTO_IDIOMA, handler);
  }, [moduloId]);

  const ui   = UI[lang];
  const rtl  = isRTL(lang);
  const dir  = rtl ? 'rtl' : 'ltr';

  // Contenido según idioma
  const titulo    = data.titulo[lang] || data.titulo['es'];
  const que_es    = data.que_es[lang] || data.que_es['es'];
  const calcula   = lang === 'en' ? data.que_calcula_en : data.que_calcula;
  const como_usar = lang === 'en' ? data.como_usar_en   : data.como_usar;
  const c         = data.color;

  const TABS = [
    { id: 'que_es'  as const, label: ui.que_es_lbl,  icon: '💡' },
    { id: 'calcula' as const, label: ui.calcula_lbl, icon: '📐' },
    { id: 'normas'  as const, label: ui.normas_lbl,  icon: '📋' },
    { id: 'usar'    as const, label: ui.usar_lbl,    icon: '🚀' },
  ];

  return (
    <div dir={dir} style={{
      marginBottom: 16,
      border: `1px solid ${c}30`,
      borderRadius: 14,
      overflow: 'hidden',
      background: 'rgba(7,13,26,0.9)',
      fontFamily: rtl ? 'system-ui, Arial, sans-serif' : 'Inter, system-ui, sans-serif',
    }}>

      {/* CABECERA */}
      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', cursor: 'pointer',
          background: `linear-gradient(135deg,${c}18,${c}08)`,
          borderBottom: abierto ? `1px solid ${c}25` : 'none',
          flexDirection: rtl ? 'row-reverse' : 'row',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg,${c},${c}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          {data.icono}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c }}>
            {ui.intro_titulo} — {titulo}
          </div>
          {!abierto && (
            <div style={{ fontSize: 10, color: '#475569' }}>
              {ui.primera_vez}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 10, color: c, fontWeight: 700, flexShrink: 0,
          padding: '3px 10px', borderRadius: 20,
          background: `${c}12`, border: `1px solid ${c}30`,
        }}>
          {abierto ? ui.ocultar : ui.ver}
        </div>
        <div style={{ color: '#475569', fontSize: 12, flexShrink: 0 }}>
          {abierto ? '▲' : '▼'}
        </div>
      </div>

      {/* PANEL */}
      {abierto && (
        <div>
          {/* TABS */}
          <div style={{
            display: 'flex', background: '#0a0f1e',
            borderBottom: `1px solid ${c}18`,
            flexDirection: rtl ? 'row-reverse' : 'row',
          }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '8px 4px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: tab === t.id ? c : '#475569',
                borderBottom: tab === t.id ? `2px solid ${c}` : '2px solid transparent',
                fontSize: 9, fontWeight: tab === t.id ? 700 : 400,
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* CONTENIDO */}
          <div style={{ padding: 16 }} dir={dir}>

            {/* ── QUÉ ES ── */}
            {tab === 'que_es' && (
              <div>
                <div style={{ fontSize: 12, color: '#f1f5f9', lineHeight: 1.7, marginBottom: 10 }}>
                  {que_es}
                </div>
                <div style={{ display: 'inline-block', fontSize: 10, color: c, fontWeight: 700, padding: '3px 10px', background: `${c}12`, border: `1px solid ${c}25`, borderRadius: 20 }}>
                  {ui.objetivo}: {titulo}
                </div>
              </div>
            )}

            {/* ── QUÉ CALCULA ── */}
            {tab === 'calcula' && (
              <div>
                {calcula.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 10px', marginBottom: 6,
                    background: '#0a0f1e', borderRadius: 8,
                    flexDirection: rtl ? 'row-reverse' : 'row',
                  }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${c}20`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: c, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 11, color: '#e2e8f0', lineHeight: 1.5, flex: 1, textAlign: rtl ? 'right' : 'left' }}>
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NORMATIVAS ── */}
            {tab === 'normas' && (
              <div>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 10 }}>
                  {ui.normas_lbl}
                </div>
                {data.normativas.map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', marginBottom: 5,
                    background: '#0a0f1e', borderRadius: 8,
                    border: `1px solid ${c}15`,
                    flexDirection: rtl ? 'row-reverse' : 'row',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', textAlign: rtl ? 'right' : 'left' }}>
                      {n}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 9, color: '#334155', marginTop: 8 }}>
                  Las normativas son internacionales. Los nombres no se traducen.
                </div>
              </div>
            )}

            {/* ── CÓMO USAR ── */}
            {tab === 'usar' && (
              <div>
                {como_usar.map((paso, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 12px', marginBottom: 8,
                    background: `${c}08`, borderRadius: 10,
                    border: `1px solid ${c}18`,
                    flexDirection: rtl ? 'row-reverse' : 'row',
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,${c},${c}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, flex: 1, textAlign: rtl ? 'right' : 'left' }}>
                      {paso}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 