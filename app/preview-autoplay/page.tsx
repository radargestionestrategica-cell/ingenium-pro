// app/preview-autoplay/page.tsx
// Pagina temporal de verificacion — solo renderiza DemoMAOPAutoplay para revisar
// el loop en produccion antes de conectarlo a la landing real.
// No esta en el sitemap ni enlazada desde ninguna pagina visible.
// Estilos .preview-* propios: los de app/page.tsx solo se inyectan cuando esa
// pagina renderiza, asi que se replican aqui (mismo patron: <style> plano,
// sin styled-jsx real — este proyecto no usa <style jsx>, solo <style>{`...`}</style>).

import type { Metadata } from 'next';
import DemoMAOPAutoplay from '@/components/DemoMAOPAutoplay';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GOLD2 = '#c47a10';
const GREEN = '#22c55e';
const CYAN  = '#38bdf8';
const GRAY  = '#64748b';
const WHITE = '#f1f5f9';

export default function PreviewAutoplayPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '48px 24px', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div className="preview-wrap" aria-label="Preview DemoMAOPAutoplay">
        <div className="preview-bar">
          <div className="preview-dot" style={{ background: '#ef4444' }} />
          <div className="preview-dot" style={{ background: '#f59e0b' }} />
          <div className="preview-dot" style={{ background: '#22c55e' }} />
          <span className="preview-title">Preview — DemoMAOPAutoplay</span>
        </div>
        <div className="preview-content">
          <div className="preview-module-header">
            <div className="preview-icon">🛢️</div>
            <div>
              <div className="preview-module-title">Presión máxima admisible — MAOP</div>
              <div className="preview-module-norm">ASME B31.8-2022 · API 5L · Factor de diseño E×T×F</div>
            </div>
          </div>
          <DemoMAOPAutoplay />
        </div>
      </div>

      <style>{`
        .preview-wrap{background:${PANEL};border:1px solid rgba(232,160,32,.18);border-radius:22px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.55);max-width:900px;margin:0 auto}
        .preview-bar{background:#030812;border-bottom:1px solid rgba(255,255,255,.06);padding:12px 18px;display:flex;align-items:center;gap:8px}
        .preview-dot{width:10px;height:10px;border-radius:999px}
        .preview-title{font-size:11px;color:${GRAY};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-left:10px;letter-spacing:.5px}
        .preview-content{padding:24px}
        .preview-module-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .preview-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,${GOLD},${GOLD2});display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .preview-module-title{font-size:18px;font-weight:900;color:${WHITE}}
        .preview-module-norm{font-size:11px;color:${GRAY};margin-top:2px}
        .preview-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        .preview-field{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 12px}
        .preview-field-lbl{font-size:9px;color:${GRAY};text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px;font-weight:700}
        .preview-field-val{font-size:14px;color:${WHITE};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700}
        .preview-btn{background:linear-gradient(135deg,${GOLD},${GOLD2});border-radius:8px;padding:10px 20px;font-size:12px;font-weight:800;color:${BG};width:100%;text-align:center;margin-bottom:16px}
        .preview-results{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .preview-res-card{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px;text-align:center}
        .preview-res-lbl{font-size:9px;color:${GRAY};text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
        .preview-res-val{font-size:16px;font-weight:900;color:${GREEN};font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .preview-res-sub{font-size:9px;color:rgba(34,197,94,.5);margin-top:2px}
        .preview-export-row{display:flex;gap:8px;margin-top:12px}
        .preview-exp-btn{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;font-size:10px;font-weight:800;color:${GRAY};text-align:center}
        .preview-exp-btn.pdf{border-color:rgba(239,68,68,.3);color:#f87171;background:rgba(239,68,68,.05)}
        .preview-exp-btn.xls{border-color:rgba(34,197,94,.3);color:${GREEN};background:rgba(34,197,94,.05)}
        .preview-exp-btn.dxf{border-color:rgba(56,189,248,.3);color:${CYAN};background:rgba(56,189,248,.05)}
        .preview-exp-btn.qr{border-color:rgba(232,160,32,.3);color:${GOLD};background:rgba(232,160,32,.05)}
        .preview-norm-tag{background:rgba(0,0,0,.5);border:1px solid rgba(232,160,32,.2);border-radius:6px;padding:6px 10px;font-size:9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(232,160,32,.6);margin-top:10px;font-weight:700}
      `}</style>
    </div>
  );
}
