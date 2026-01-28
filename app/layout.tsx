import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Importamos los estilos globales que están en app/globals.css

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HappyTails AI',
  description: 'Gestiona a tus mascotas con HappyTails AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}