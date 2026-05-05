import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'INGENIUM PRO — Plataforma de Ingeniería Industrial';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#020609',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid decorativo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(232,160,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Logo Omega */}
        <div style={{
          fontSize: 110, color: '#E8A020',
          fontWeight: 900, lineHeight: 1,
          textShadow: '0 0 60px rgba(232,160,32,0.5)',
          display: 'flex',
        }}>
          Ω
        </div>

        {/* Título */}
        <div style={{
          fontSize: 64, color: '#f1f5f9',
          fontWeight: 900, letterSpacing: 8,
          marginTop: 12, display: 'flex',
        }}>
          INGENIUM PRO
        </div>

        {/* Subtítulo */}
        <div style={{
          fontSize: 22, color: '#E8A020',
          letterSpacing: 5, fontWeight: 700,
          marginTop: 10, display: 'flex',
        }}>
          PLATAFORMA TÉCNICA PROFESIONAL
        </div>

        {/* Tags normativos */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 32,
        }}>
          {['ASME B31.8', 'API 6D', 'ISO', 'IEC', '15 MÓDULOS'].map(tag => (
            <div
              key={tag}
              style={{
                padding: '8px 18px',
                background: 'rgba(232,160,32,0.10)',
                border: '1px solid rgba(232,160,32,0.3)',
                borderRadius: 8,
                fontSize: 15, color: '#E8A020',
                fontWeight: 700, letterSpacing: 1,
                display: 'flex',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: 36,
          fontSize: 16, color: '#334155',
          letterSpacing: 2, display: 'flex',
        }}>
          ingeniumpro.store
        </div>
      </div>
    ),
    { ...size },
  );
}
