// app/page.tsx
import DiagnosticWizard from '../components/DiagnosticWizard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header estilo Vegen */}
      <nav className="p-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <span className="text-[#003366] font-bold text-xl tracking-tight">VEGEN</span>
          <span className="text-gray-400 font-light text-xl tracking-tight">DIGITAL</span>
        </div>
      </nav>

      <div className="py-12">
        <DiagnosticWizard />
      </div>
    </main>
  );
}
