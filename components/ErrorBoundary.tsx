'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  modulo?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 48, textAlign: 'center',
          color: '#f1f5f9', fontFamily: 'Inter,sans-serif',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f97316' }}>
            Error en {this.props.modulo ?? 'módulo'}
          </div>
          <div style={{
            fontSize: 12, color: '#64748b', marginBottom: 28,
            maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.6,
          }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '10px 28px', border: 'none', borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#4338ca)',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
