import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad — INGENIUM PRO',
  description: 'Política de privacidad y tratamiento de datos personales de INGENIUM PRO.',
};

const BG   = '#020609';
const PANEL = '#0a0f1e';
const GOLD  = '#E8A020';
const GRAY  = '#64748b';
const BORD  = 'rgba(232,160,32,0.15)';

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f1f5f9', fontFamily: 'Inter,sans-serif' }}>

      <header style={{ background: PANEL, borderBottom: `1px solid ${BORD}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>INGENIUM PRO</span>
          <span style={{ color: GOLD, fontSize: 22, fontWeight: 300 }}>Ω</span>
        </a>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>
            Documento Legal · Versión 1.0 · Vigencia: 5 de mayo de 2026
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>
          <div style={{ fontSize: 13, color: GRAY }}>
            INGENIUM PRO Ω — RADAR Gestión Estratégica · Responsable: Silvana Belén Colombo
          </div>
        </div>

        {[
          {
            n: '1', t: 'Responsable del tratamiento',
            c: 'RADAR Gestión Estratégica, con dominio ingeniumpro.store, es responsable del tratamiento de los datos personales recopilados a través de la plataforma INGENIUM PRO. Contacto: radargestionestrategica@gmail.com',
          },
          {
            n: '2', t: 'Datos que recopilamos',
            c: 'Recopilamos los siguientes datos al registrarse: nombre completo, dirección de correo electrónico, empresa u organización, país, matrícula profesional (opcional) y DNI/documento de identidad (opcional). También recopilamos datos de uso: cálculos realizados, módulos utilizados, fecha y hora de acceso, y dirección IP para control de acceso y límite de solicitudes.',
          },
          {
            n: '3', t: 'Finalidad del tratamiento',
            c: 'Los datos se utilizan para: (a) proveer acceso a los módulos de cálculo de la plataforma, (b) generar reportes técnicos personalizados con datos del profesional, (c) verificar la integridad de los cálculos mediante QR, (d) controlar el uso dentro de los límites del plan contratado, (e) comunicar actualizaciones del servicio.',
          },
          {
            n: '4', t: 'Base legal del tratamiento',
            c: 'El tratamiento se basa en el consentimiento explícito del usuario al aceptar estos términos durante el registro, y en la ejecución del contrato de servicio. Aplica la Ley 25.326 de Protección de Datos Personales (Argentina) y, para usuarios en la Unión Europea, el Reglamento (UE) 2016/679 (GDPR).',
          },
          {
            n: '5', t: 'Almacenamiento y seguridad',
            c: 'Los datos se almacenan en bases de datos PostgreSQL con acceso restringido. Las contraseñas se almacenan con hashing bcrypt (costo 12) — nunca en texto plano. Las comunicaciones se cifran mediante TLS/HTTPS. Los tokens de sesión usan HMAC-SHA256 y se almacenan como cookies HttpOnly.',
          },
          {
            n: '6', t: 'Compartición de datos',
            c: 'No vendemos ni cedemos datos personales a terceros con fines comerciales. Los datos pueden ser procesados por proveedores de infraestructura (hosting, base de datos) bajo acuerdos de confidencialidad. El asistente de IA utiliza la API de Anthropic (Claude); los mensajes enviados al asistente pueden incluir parámetros técnicos del cálculo activo, sin datos de identificación personal.',
          },
          {
            n: '7', t: 'Derechos del usuario (ARCO)',
            c: 'El usuario tiene derecho a: Acceder a sus datos personales, Rectificarlos si son incorrectos, Cancelarlos (solicitar eliminación), Oponerse al tratamiento. Para ejercer estos derechos, enviar solicitud a radargestionestrategica@gmail.com con asunto "Derecho ARCO" e identificación del titular. El plazo de respuesta es de 30 días hábiles.',
          },
          {
            n: '8', t: 'Retención de datos',
            c: 'Los datos de cuenta se retienen mientras la cuenta esté activa. Los cálculos históricos se retienen por 2 años desde su creación para garantizar la verificabilidad de los reportes. Tras la baja de cuenta, los datos se eliminan en 30 días, excepto los requeridos por obligaciones legales.',
          },
          {
            n: '9', t: 'Cookies',
            c: 'Utilizamos cookies técnicas necesarias para el funcionamiento de la plataforma: cookie de sesión (ip_auth, HttpOnly, SameSite=Lax, duración 3 días) y almacenamiento local para preferencias de interfaz. No utilizamos cookies de rastreo ni publicidad.',
          },
          {
            n: '10', t: 'Modificaciones',
            c: 'Nos reservamos el derecho de actualizar esta política. Los cambios significativos serán comunicados por email o mediante aviso en la plataforma. La versión vigente siempre estará disponible en ingeniumpro.store/privacidad.',
          },
        ].map(({ n, t, c }) => (
          <div key={n} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${GOLD},#c47a10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#020609', flexShrink: 0 }}>
                {n}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f1f5f9' }}>{t}</h2>
            </div>
            <p style={{ paddingLeft: 40, fontSize: 13, color: '#94a3b8', lineHeight: 1.8, margin: 0 }}>{c}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.06)`, textAlign: 'center', color: GRAY, fontSize: 11 }}>
          <div>INGENIUM PRO v8.1 · RADAR Gestión Estratégica · Silvana Belén Colombo</div>
          <div style={{ marginTop: 4 }}>ingeniumpro.store · radargestionestrategica@gmail.com · © 2026</div>
          <div style={{ marginTop: 8 }}>
            <a href="/terminos" style={{ color: GOLD, textDecoration: 'none', marginRight: 16 }}>Términos y Condiciones</a>
            <a href="/" style={{ color: GOLD, textDecoration: 'none' }}>← Inicio</a>
          </div>
        </div>
      </div>
    </div>
  );
}
