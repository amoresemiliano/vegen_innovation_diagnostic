import "./globals.css";

export const metadata = {
  title: "Vegen Innovation Diagnostic",
  description: "Herramienta de diagnóstico estratégico para PyMEs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
