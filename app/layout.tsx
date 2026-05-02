import './globals.css';
import TerminosModalWrapper from '@/components/TerminosModalWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <TerminosModalWrapper />
        {children}
      </body>
    </html>
  );
}