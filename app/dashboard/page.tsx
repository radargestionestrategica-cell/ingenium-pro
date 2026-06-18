'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import TerminosModalWrapper from '@/components/TerminosModalWrapper';
import { ResultadoProvider, useResultado } from '@/components/ResultadoContexto';
import IAChat from '@/components/IAChat';
import SelectorIdioma from '@/components/SelectorIdioma';
import BienvenidaModal from '@/components/BienvenidaModal';
import ConversorUnidades from '@/components/ConversorUnidades';
import ModuloIntro from '@/components/ModuloIntro';
import DashboardHome from '@/components/DashboardHome';
import ModuloArquitectura from '@/components/ModuloArquitectura';
import ModuloCanerias from '@/components/ModuloCanerias';
import ModuloCivil from '@/components/ModuloCivil';
import ModuloElectricidad from '@/components/ModuloElectricidad';
import ModuloGeotecnia from '@/components/ModuloGeotecnia';
import ModuloHidraulica from '@/components/ModuloHidraulica';
import ModuloMineria from '@/components/ModuloMineria';
import ModuloMMO from '@/components/ModuloMMO';
import ModuloPerforacion from '@/components/ModuloPerforacion';
import ModuloPetroleo from '@/components/ModuloPetroleo';
import ModuloRepresas from '@/components/ModuloRepresas';
import ModuloSoldadura from '@/components/ModuloSoldadura';
import ModuloTermica from '@/components/ModuloTermica';
import ModuloValvulas from '@/components/ModuloValvulas';
import ModuloVialidad from '@/components/ModuloVialidad';

const MODULOS = [
  { id: 'petroleo',     label: 'Petróleo / MAOP',  icon: '🛢️', component: ModuloPetroleo    },
  { id: 'perforacion',  label: 'Perforación',       icon: '⛏️', component: ModuloPerforacion },
  { id: 'hidraulica',   label: 'Hidráulica',        icon: '💧', component: ModuloHidraulica  },
  { id: 'canerias',     label: 'Cañerías',          icon: '🔩', component: ModuloCanerias    },
  { id: 'electricidad', label: 'Electricidad',      icon: '⚡', component: ModuloElectricidad},
  { id: 'geotecnia',    label: 'Geotecnia',         icon: '🌍', component: ModuloGeotecnia   },
  { id: 'soldadura',    label: 'Soldadura',         icon: '🔥', component: ModuloSoldadura   },
  { id: 'mmo',          label: 'MMO',               icon: '🔧', component: ModuloMMO         },
  { id: 'valvulas',     label: 'Válvulas',          icon: '🚿', component: ModuloValvulas    },
  { id: 'civil',        label: 'Civil',             icon: '🏗️', component: ModuloCivil       },
  { id: 'vialidad',     label: 'Vialidad',          icon: '🛣️', component: ModuloVialidad    },
  { id: 'represas',     label: 'Represas',          icon: '🌊', component: ModuloRepresas    },
  { id: 'mineria',      label: 'Minería',           icon: '⛏️', component: ModuloMineria     },
  { id: 'termica',      label: 'Térmica',           icon: '🌡️', component: ModuloTermica     },
  { id: 'arquitectura', label: 'Arquitectura',      icon: '🏛️', component: ModuloArquitectura},
];

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const BG    = '#020609';
const GOLD  = '#E8A020';
const GREEN = '#22c55e';
const PANEL = '#0a0f1e';
const BORD  = 'rgba(232,160,32,0.15)';

// Componente interno que usa el contexto
function Dashboard() {
  const router = useRouter();
  const [moduloActivo, setModuloActivo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [conversorOpen, setConversorOpen] = useState(false);
  const { datos, limpiar } = useResultado();
  const [consultasIa, setConsultasIa] = useState<{ usadas: number; tope: number; restantes: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('/api/consultas-ia', { credentials: 'include', headers: ipAuthHeader() })
      .then(res => res.ok ? res.json() : null)
      .then(json => { if (json?.ok) setConsultasIa(json); })
      .catch(() => {});
  }, []);

  const cerrarSesion = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('ip_token');
    localStorage.removeItem('ip_usuario');
    localStorage.removeItem('ip_terminos_aceptados');
    router.replace('/Login');
  };

  const ModuloActual = moduloActivo
    ? MODULOS.find(m => m.id === moduloActivo)?.component ?? null
    : null;

  // Limpiar resultado al cambiar de módulo
  const cambiarModulo = (id: string | null) => {
    limpiar();
    setModuloActivo(id);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column' }}>

      <BienvenidaModal />
      <TerminosModalWrapper />

      {/* HEADER */}
      <header style={{ height: 56, background: PANEL, borderBottom: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>☰</button>
        <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>INGENIUM PRO</span>
        <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        {moduloActivo && (
          <>
            <span style={{ color: '#334155', fontSize: 14 }}>›</span>
            <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>
              {MODULOS.find(m => m.id === moduloActivo)?.icon}{' '}
              {MODULOS.find(m => m.id === moduloActivo)?.label}
            </span>
          </>
        )}
        <div style={{ flex: 1 }} />
        {consultasIa && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: consultasIa.restantes < 10 ? '#ef4444' : '#64748b',
          }}>
            Consultas IA: {consultasIa.usadas} de {consultasIa.tope} usadas este mes (se renuevan cada mes, no se acumulan)
          </span>
        )}
        <button onClick={() => setConversorOpen(o => !o)} style={{ background: conversorOpen ? 'rgba(34,197,94,0.15)' : 'none', border: `1px solid ${conversorOpen ? GREEN : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, color: GREEN, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '6px 12px' }}>⇄ CONVERSOR</button>
        <a href="/planes" style={{ background: `linear-gradient(135deg,${GOLD},#c47a10)`, borderRadius: 8, color: BG, fontSize: 12, fontWeight: 800, padding: '6px 14px', textDecoration: 'none' }}>★ PLANES</a>
        <SelectorIdioma />
        <button
          onClick={cerrarSesion}
          style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', flexShrink: 0 }}
        >
          ↩ SALIR
        </button>
      </header>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* BACKDROP — solo mobile, cierra el menú al tocar afuera */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }}
          />
        )}

        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside style={isMobile
            ? { width: 220, background: PANEL, borderRight: `1px solid ${BORD}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', position: 'fixed', top: 56, bottom: 0, left: 0, zIndex: 50 }
            : { width: 220, background: PANEL, borderRight: `1px solid ${BORD}`, overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px' }
          }>
            <button onClick={() => cambiarModulo(null)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: moduloActivo === null ? 'rgba(232,160,32,0.12)' : 'transparent', color: moduloActivo === null ? GOLD : '#64748b', fontSize: 13, fontWeight: moduloActivo === null ? 700 : 400, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span>🏠</span> Inicio
            </button>
            <div style={{ height: 1, background: BORD, margin: '6px 4px' }} />
            {MODULOS.map(m => (
              <button key={m.id} onClick={() => cambiarModulo(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', borderLeft: moduloActivo === m.id ? `3px solid ${GREEN}` : '3px solid transparent', background: moduloActivo === m.id ? 'rgba(34,197,94,0.12)' : 'transparent', color: moduloActivo === m.id ? GREEN : '#94a3b8', fontSize: 12, fontWeight: moduloActivo === m.id ? 700 : 400, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <span style={{ flexShrink: 0 }}>{m.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
              </button>
            ))}
            <div style={{ height: 1, background: BORD, margin: '6px 4px' }} />
            <button onClick={() => router.push('/cruce')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${GOLD}`, background: 'rgba(232,160,32,0.12)', color: GOLD, fontSize: 12, fontWeight: 800, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ flexShrink: 0 }}>🧠</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Inteligencia Cruzada</span>
            </button>
            <button onClick={() => router.push('/historial')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${GOLD}`, background: 'rgba(232,160,32,0.12)', color: GOLD, fontSize: 12, fontWeight: 800, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ flexShrink: 0 }}>📋</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mis Cálculos Guardados</span>
            </button>
            <div style={{ marginTop: 'auto', padding: '12px 8px 4px', borderTop: `1px solid ${BORD}` }}>
              <div style={{ fontSize: 9, color: '#1e3a5f', textAlign: 'center', letterSpacing: 1 }}>INGENIUM PRO v8.1 · RADAR © 2026</div>
            </div>
          </aside>
        )}

        {/* CONTENIDO */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {ModuloActual
            ? (
              <ErrorBoundary modulo={MODULOS.find(m => m.id === moduloActivo)?.label}>
                <ModuloIntro moduloId={moduloActivo!} />
                <ModuloActual />
              </ErrorBoundary>
            )
            : <DashboardHome onSelectModulo={cambiarModulo} />
          }

          {/* IA — aparece automáticamente al calcular */}
          {datos && moduloActivo && (
            <div style={{ padding: '0 24px 24px' }}>
              <IAChat
                key={`${datos.tipo}-${datos.moduloId ?? ''}-${Object.keys(datos.resultado).length}`}
                datos={datos}
              />
            </div>
          )}
        </main>

        {/* CONVERSOR */}
        {conversorOpen && (
          <aside style={{ width: 360, background: PANEL, borderLeft: `1px solid ${BORD}`, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>⇄ CONVERSOR DE UNIDADES</span>
              <button onClick={() => setConversorOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <ConversorUnidades />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ResultadoProvider>
      <Dashboard />
    </ResultadoProvider>
  );
} 