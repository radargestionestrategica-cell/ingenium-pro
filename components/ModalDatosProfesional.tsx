'use client';
import { useState } from 'react';

const BG    = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const BORD  = 'rgba(232,160,32,0.25)';

function ipAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('ip_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface ModalDatosProfesionalProps {
  matriculaInicial?: string;
  dniInicial?:       string;
  onGuardado:        (datos: { matricula: string; dni: string }) => void;
  onCancelar:        () => void;
}

export default function ModalDatosProfesional({
  matriculaInicial = '',
  dniInicial       = '',
  onGuardado,
  onCancelar,
}: ModalDatosProfesionalProps) {
  const [matricula, setMatricula] = useState(matriculaInicial);
  const [dni, setDni]             = useState(dniInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', marginTop: 6,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none',
  };

  const handleGuardar = async () => {
    if (!dni.trim()) {
      setError('El DNI es obligatorio');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const res = await fetch('/api/perfil/actualizar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...ipAuthHeader() },
        body: JSON.stringify({ matricula, dni }),
      });
      if (!res.ok) {
        setError('Error al guardar los datos');
        return;
      }
      onGuardado({ matricula, dni });
    } catch {
      setError('Error de red al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,9,0.92)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: PANEL, border: `1px solid ${BORD}`,
        borderRadius: 20, padding: '32px 28px', fontFamily: 'Inter,system-ui,sans-serif',
      }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9', marginBottom: 6 }}>
          Datos del profesional responsable
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 22 }}>
          Completá tu matrícula y DNI para identificar el reporte
        </div>

        <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
          Matrícula (opcional)
          <input
            type="text" value={matricula} onChange={e => setMatricula(e.target.value)}
            placeholder="MP 12345 / REG-67890" style={inputStyle}
          />
        </label>

        <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginTop: 16 }}>
          DNI / Documento de identidad *
          <input
            type="text" value={dni} onChange={e => setDni(e.target.value)}
            placeholder="12.345.678" style={inputStyle}
          />
        </label>

        {error && (
          <div style={{ marginTop: 14, fontSize: 12, color: '#ef4444' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <button
            onClick={onCancelar}
            disabled={guardando}
            style={{
              flex: 1, padding: '12px 0',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, color: '#94a3b8', fontSize: 13, fontWeight: 700,
              cursor: guardando ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{
              flex: 1, padding: '12px 0',
              background: guardando ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${GOLD},#c47a10)`,
              border: 'none', borderRadius: 12, color: guardando ? '#334155' : BG,
              fontSize: 13, fontWeight: 800, cursor: guardando ? 'not-allowed' : 'pointer',
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
