// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import DiagnosticWizard from '../components/DiagnosticWizard';

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#F8FAFC]">
      {/* Fondo Tecnológico Difuminado */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'blur(4px)'
        }}
      />
      
      {/* Header estilo Vegen */}
      <nav className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Vegen Digital Logo" 
              width={180} 
              height={60} 
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
      </nav>

      <div className="py-12 relative z-10">
        <DiagnosticWizard />
      </div>
    </main>
  );
}
