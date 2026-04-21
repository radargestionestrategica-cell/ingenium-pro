'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MODULOS = [
  { id: 'petroleo', label: 'Petróleo & Gas', icon: '⛽', desc: 'MAOP, presión, tuberías', norma: 'ASME B31.8 · API 5L', color: '#f59e0b' },
  { id: 'hidraulica', label: 'Hidráulica', icon: '💧', desc: 'Acueductos, golpe de ariete, pérdidas', norma: 'AWWA · Darcy-Weisbach', color: '#3b82f6' },
  { id: 'perforacion', label: 'Perforación', icon: '🔩', desc: 'Fluidos, presiones, BHA', norma: 'API RP 13D · API RP 7G', color: '#8b5cf6' },
  { id: 'mineria', label: 'Minería', icon: '⛏️', desc: 'Ventilación, estabilidad, voladuras', norma: 'MSHA · ISO 12715', color: '#ef4444' },
  { id: 'civil', label: 'Ingeniería Civil', icon: '🏗️', desc: 'Estructuras, cimentaciones, cargas', norma: 'ACI 318 · AISC 360', color: '#10b981' },
  { id: 'geotecnia', label: 'Geotecnia', icon: '🪨', desc: 'Taludes, portante, consolidación', norma: 'Bishop · Meyerhof', color: '#6366f1' },
  { id: 'vialidad', label: 'Vialidad', icon: '🛣️', desc: 'Pavimentos, curvas, drenaje', norma: 'AASHTO · INVIAS', color: '#f97316' },
  { id: 'represas', label: 'Represas', icon: '🌊', desc: 'Presas, vertederos, filtraciones', norma: 'USACE · ICOLD', color: '#06b6d4' },
  { id: 'termica', label: 'Térmica', icon: '🔥', desc: 'Dilatación, intercambiadores, vapor', norma: 'ASME B31.3 · TEMA', color: '#ec4899' },
  { id: 'arquitectura', label: 'Arquitectura Técnica', icon: '📐', desc: 'Cargas, iluminación, acústica', norma: 'CIRSOC · ACI 318', color: '#84cc16' },
];

interface Usuario {
  nombre: string;
  empresa: string;
  plan: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [horaActual, setHoraActual] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ip_user');
    if (!stored) { router.push('/Login'); return; }
    setUsuario(JSON.parse(stored));
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const fecha = ahora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    setHoraActual(`${fecha} · ${hora}`);
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem('ip_token');
    localStorage.removeItem('ip_user');
    router.push('/Login');
  };

  if (!usuario) return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6366f1', fontSize: 14 }}>Cargando INGENIUM PRO...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a 0%,#0d1b2a 100%)', fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <div style={{
        background: 'rgba(15,23,42,0.98)', borderBottom: '1px solid rgba(99,102,241,0.2)',
        padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: '#6366f1', fontWeight: 800 }}>◈ INGENIUM PRO</div>
          <div style={{ width: 1, height: 20, background: 'rgba(99,102,241,0.3)' }} />
          <div style={{ fontSize: 11, color: '#475569' }}>v8.0 · Plataforma de Ingeniería Técnica de Precisión</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{usuario.nombre}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{usuario.empresa}</div>
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: usuario.plan === 'trial' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
            border: `1px solid ${usuario.plan === 'trial' ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.4)'}`,
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            color: usuario.plan === 'trial' ? '#f59e0b' : '#6366f1',
            textTransform: 'uppercase' as const,
          }}>
            {usuario.plan}
          </div>
          <button onClick={cerrarSesion} style={{
            padding: '7px 16px', background: 'transparent',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
            color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>
            Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: '48px 40px', maxWidth: 1400, margin: '0 auto' }}>

        {/* BIENVENIDA */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#475569', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>
            {horaActual}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
            Bienvenido, {usuario.nombre.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: 15, color: '#475569' }}>
            Seleccioná un módulo de ingeniería para comenzar tu análisis técnico.
          </div>
        </div>

        {/* ACCESO RÁPIDO AL CHAT */}
        <div onClick={() => router.push('/')} style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16,
          padding: '24px 32px', marginBottom: 48, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
              🤖 Asistente IA de Ingeniería
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Consultá cualquier cálculo técnico en lenguaje natural — ASME · API · ISO · AWWA
            </div>
          </div>
          <div style={{ fontSize: 24, color: '#6366f1' }}>→</div>
        </div>

        {/* MÓDULOS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#475569', letterSpacing: 2, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase' as const }}>
            Módulos Técnicos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {MODULOS.map(mod => (
              <div key={mod.id}
                onClick={() => router.push(`/?modulo=${mod.id}`)}
                style={{
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 16, padding: 24, cursor: 'pointer',
                  position: 'relative' as const, overflow: 'hidden' as const,
                }}>
                <div style={{
                  position: 'absolute' as const, top: 0, left: 0, right: 0, height: 3,
                  background: mod.color, borderRadius: '16px 16px 0 0',
                }} />
                <div style={{ fontSize: 28, marginBottom: 12 }}>{mod.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{mod.label}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{mod.desc}</div>
                <div style={{
                  display: 'inline-block', padding: '3px 10px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 20, fontSize: 10, color: '#6366f1', fontWeight: 600,
                }}>
                  {mod.norma}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PIE */}
        <div style={{ marginTop: 64, textAlign: 'center', borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: 32 }}>
          <div style={{ fontSize: 10, color: '#1e293b', letterSpacing: 1 }}>
            INGENIUM PRO v8.0 · ASME · API · ISO · AWWA · AASHTO · USACE · ICOLD · ACI · AISC
          </div>
          <div style={{ fontSize: 10, color: '#1e293b', marginTop: 4 }}>
            © 2026 INGENIUM PRO — Todos los derechos reservados
          </div>
        </div>
      </div>
    </div>
  );
}