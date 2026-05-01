import './globals.css';
import TerminosModal from '@/components/TerminosModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <TerminosModal />
        {children}
      </body>
    </html>
  );
}