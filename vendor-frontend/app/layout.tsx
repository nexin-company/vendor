import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Permit - Sistema de Gestión RBAC',
  description:
    'Sistema completo de gestión de permisos basado en roles (RBAC). Administra usuarios, roles, recursos y permisos de forma eficiente.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
