'use client';

// DashboardHome — pantalla de bienvenida cuando ningún módulo está activo

const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const CYAN  = '#38bdf8';
const PANEL = '#0a0f1e';

const ACCESOS = [
  { id:'petroleo',     label:'Petróleo / MAOP',       icon:'🛢️', color: GOLD,    norma:'ASME B31.8 · API 5L' },
  { id:'perforacion',  label:'Perforación',            icon:'⛏️', color: GOLD,    norma:'API RP 13D · API RP 7G' },
  { id:'hidraulica',   label:'Hidráulica',             icon:'💧', color: CYAN,    norma:'AWWA M11 · ASME B31.3' },
  { id:'canerias',     label:'Cañerías & Integridad',  icon:'🔩', color: GREEN,   norma:'ASME B31.8 · API 579' },
  { id:'electricidad', label:'Electricidad',           icon:'⚡', color:'#facc15',norma:'NEC 2023 · IEC 60228' },
  { id:'soldadura',    label:'Soldadura',              icon:'🔥', color:'#f97316',norma:'AWS D1.1 · ASME Sec.IX' },
  { id:'represas',     label:'Represas',               icon:'🌊', color: CYAN,    norma:'USACE EM · ICOLD' },
  { id:'vialidad',     label:'Vialidad',               icon:'🛣️', color:'#64748b',norma:'AASHTO 93 · HEC-22' },
  { id:'mmo',          label:'MMO',                   icon:'🔧', color:'#a78bfa',norma:'CIRSOC 201 · ACI 318' },
  { id:'valvulas',     label:'Válvulas Industriales',  icon:'⚙️', color: GREEN,   norma:'ASME B16.34 · ISA 75.01' },
  { id:'civil',        label:'Civil',                 icon:'🏗️', color:'#94a3b8',norma:'AISC 360 · ACI 318-19' },
  { id:'arquitectura', label:'Arquitectura',           icon:'🏛️', color:'#e879f9',norma:'ASCE 7-22 · CIRSOC 103' },
  { id:'mineria',      label:'Minería',               icon:'⛏️', color:'#fb923c',norma:'Bieniawski 89 · MSHA' },
  { id:'termica',      label:'Térmica',               icon:'🌡️', color:'#f87171',norma:'TEMA · ASME Sec.VIII' },
  { id:'geotecnia',    label:'Geotecnia',             icon:'🌍', color:'#a3e635',norma:'Meyerhof · Bishop 55' },
];

const CAPACIDADES = [
  { icon:'📐', titulo:'15 módulos técnicos', desc:'Petróleo · Electricidad · Civil · Minería · Represas · Soldadura y más' },
  { icon:'📋', titulo:'130+ normativas',      desc:'ASME · API · IEC · NACE · AISC · ACI · AASHTO · AWS · USACE' },
  { icon:'📤', titulo:'4 formatos de exportación', desc:'PDF profesional · Excel editable · DXF para CAD · QR de trazabilidad' },
  { icon:'🤖', titulo:'Auditoría IA',         desc:'La IA revisa resultados, detecta inconsistencias y marca puntos críticos' },
];

interface Props {
  onSelectModulo: (id: string) => void;
}

export default function DashboardHome({ onSelectModulo }: Props) {
  return (
    <div style={{ padding:'32px 28px', maxWidth:1080, margin:'0 auto' }}>

      {/* BIENVENIDA */}
      <div style={{
        background:'linear-gradient(135deg,rgba(232,160,32,.07),rgba(34,197,94,.04))',
        border:'1px solid rgba(232,160,32,.18)',
        borderRadius:20,
        padding:'28px 32px',
        marginBottom:28,
        position:'relative',
        overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, right:0, width:320, height:200, background:'radial-gradient(ellipse at 80% 20%,rgba(232,160,32,.08),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ fontSize:11, color:GOLD, fontWeight:900, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>INGENIUM PRO v8.1</div>
            <div style={{ fontSize:22, fontWeight:950, color:'#f1f5f9', marginBottom:8, letterSpacing:-.5, lineHeight:1.15 }}>
              Plataforma de cálculo técnico<br />
              <span style={{ color:GOLD }}>con trazabilidad profesional</span>
            </div>
            <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.75 }}>
              Seleccioná un módulo del panel izquierdo o desde los accesos rápidos para comenzar.
              Cada cálculo incluye normativa aplicada, exportación PDF/Excel/DXF y verificación QR.
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, flexShrink:0 }}>
            {[
              { val:'15',   lbl:'Módulos activos', color:GOLD  },
              { val:'130+', lbl:'Normativas',       color:CYAN  },
              { val:'DXF',  lbl:'Exporta a CAD',    color:GREEN },
              { val:'IA',   lbl:'Auditoría técnica', color:'#e879f9' },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} style={{ background:'rgba(0,0,0,.35)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'12px 16px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:950, color, fontFamily:'ui-monospace,SFMono-Regular,monospace', lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:10, color:'#475569', marginTop:5, fontWeight:600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAPACIDADES */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:28 }}>
        {CAPACIDADES.map(({ icon, titulo, desc }) => (
          <div key={titulo} style={{ background:PANEL, border:'1px solid rgba(255,255,255,.06)', borderRadius:14, padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:4 }}>{titulo}</div>
              <div style={{ fontSize:11, color:'#64748b', lineHeight:1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div style={{ marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ fontSize:11, color:GREEN, fontWeight:900, letterSpacing:2, textTransform:'uppercase' }}>Acceso rápido a módulos</div>
          <div style={{ flex:1, height:1, background:'rgba(34,197,94,.12)' }} />
          <div style={{ fontSize:10, color:'#334155', fontWeight:600 }}>15 módulos disponibles</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
          {ACCESOS.map(({ id, label, icon, color, norma }) => (
            <button
              key={id}
              onClick={() => onSelectModulo(id)}
              style={{
                background:PANEL,
                border:`1px solid rgba(255,255,255,.055)`,
                borderLeft:`3px solid ${color}`,
                borderRadius:12,
                padding:'14px 16px',
                display:'flex',
                alignItems:'center',
                gap:12,
                cursor:'pointer',
                textAlign:'left',
                transition:'transform .15s,box-shadow .15s,border-color .15s',
                width:'100%',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 24px rgba(0,0,0,.35)`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(255,255,255,.055)`;
                (e.currentTarget as HTMLButtonElement).style.borderLeftColor = color;
              }}
            >
              <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:10, color:'#475569', fontFamily:'ui-monospace,SFMono-Regular,monospace', fontWeight:700 }}>{norma}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:14, color:color, opacity:.6, flexShrink:0 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div style={{ marginTop:28, padding:'14px 20px', background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.04)', borderRadius:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <span style={{ fontSize:10, color:'#1e3a5f', fontFamily:'ui-monospace,SFMono-Regular,monospace', fontWeight:700, letterSpacing:1 }}>INGENIUM PRO v8.1</span>
        <span style={{ fontSize:10, color:'#1e3a5f' }}>·</span>
        <span style={{ fontSize:10, color:'#1e3a5f' }}>Exportación PDF · XLSX · DXF · QR</span>
        <span style={{ fontSize:10, color:'#1e3a5f' }}>·</span>
        <span style={{ fontSize:10, color:'#1e3a5f' }}>Auditoría IA integrada</span>
        <span style={{ fontSize:10, color:'#1e3a5f', marginLeft:'auto' }}>RADAR Gestión Estratégica © 2026</span>
      </div>
    </div>
  );
}
