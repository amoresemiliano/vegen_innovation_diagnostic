// components/DiagnosticWizard.tsx
"use client";
import React, { useState, useEffect } from 'react';

const DiagnosticWizard = () => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null); // 20, 35, 50
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const fetchNextQuestion = async (currentAnswers) => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: currentAnswers, level })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion(data);
      } else {
        console.error("Error al obtener la pregunta");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (level) {
      fetchNextQuestion([]);
    }
  }, [level]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { q: currentQuestion.text, a: option }];
    setAnswers(newAnswers);
    setStep(step + 1);
    setProgress(((step + 1) / (level || 20)) * 100);
    
    if (step + 1 < level) {
      fetchNextQuestion(newAnswers);
    } else {
      // Diagnóstico completado
      setCurrentQuestion(null);
      // Aquí se podría redirigir o mostrar un componente de resultados
    }
  };

  if (!level) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-6 tracking-tight">
          Descubre el Potencial Oculto de tu Empresa
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl leading-relaxed">
          Nuestro Diagnóstico de Innovación impulsado por Inteligencia Artificial evaluará tu modelo de negocio en tiempo real. 
          Al finalizar, recibirás <span className="font-semibold text-[#00A3FF]">3 propuestas estratégicas de innovación sin costo</span>, adaptadas a tus necesidades.
        </p>
        <p className="text-md text-gray-500 mb-12">
          Selecciona la profundidad del análisis para comenzar.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Card Nivel 1 */}
          <button onClick={() => setLevel(20)} className="group relative bg-white p-8 border border-gray-200 rounded-2xl hover:border-[#003366] hover:shadow-xl transition-all flex flex-col items-center text-center overflow-hidden">
            <div className="text-sm font-bold text-[#00A3FF] uppercase tracking-widest mb-4">Nivel 1</div>
            <h3 className="text-2xl font-bold text-[#003366] mb-2">Express</h3>
            <div className="text-8xl font-extrabold text-gray-50 group-hover:text-blue-50 absolute -top-4 -right-4 -z-10 transition-colors opacity-60">20</div>
            <p className="text-gray-500 mb-8 flex-grow text-sm leading-relaxed">
              Auditoría rápida de tus procesos actuales. Ideal para detectar cuellos de botella urgentes e ineficiencias.
            </p>
            <div className="w-full py-3 rounded-xl bg-gray-50 text-[#003366] font-semibold group-hover:bg-[#003366] group-hover:text-white transition-colors">
              Iniciar Express (20 Preguntas)
            </div>
          </button>
          
          {/* Card Nivel 2 */}
          <button onClick={() => setLevel(35)} className="group relative bg-white p-8 border-2 border-[#003366] rounded-2xl hover:shadow-2xl transition-all flex flex-col items-center text-center transform hover:-translate-y-1 overflow-hidden z-10">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#00A3FF]"></div>
            <div className="absolute -top-3 bg-[#00A3FF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recomendado
            </div>
            <div className="text-sm font-bold text-[#00A3FF] uppercase tracking-widest mb-4 mt-2">Nivel 2</div>
            <h3 className="text-2xl font-bold text-[#003366] mb-2">Business</h3>
            <div className="text-8xl font-extrabold text-gray-50 group-hover:text-blue-50 absolute -top-4 -right-4 -z-10 transition-colors opacity-60">35</div>
            <p className="text-gray-500 mb-8 flex-grow text-sm leading-relaxed">
              Análisis profundo de tu estrategia y propuesta de valor. Perfecto para empresas en crecimiento buscando escalar.
            </p>
            <div className="w-full py-3 rounded-xl bg-[#003366] text-white font-semibold group-hover:bg-[#002244] transition-colors shadow-md">
              Iniciar Business (35 Preguntas)
            </div>
          </button>

          {/* Card Nivel 3 */}
          <button onClick={() => setLevel(50)} className="group relative bg-white p-8 border border-gray-200 rounded-2xl hover:border-[#003366] hover:shadow-xl transition-all flex flex-col items-center text-center overflow-hidden">
            <div className="text-sm font-bold text-[#00A3FF] uppercase tracking-widest mb-4">Nivel 3</div>
            <h3 className="text-2xl font-bold text-[#003366] mb-2">Full Transformation</h3>
            <div className="text-8xl font-extrabold text-gray-50 group-hover:text-blue-50 absolute -top-4 -right-4 -z-10 transition-colors opacity-60">50</div>
            <p className="text-gray-500 mb-8 flex-grow text-sm leading-relaxed">
              Evaluación exhaustiva 360º de capacidades, tecnología y automatización. Visión corporativa total.
            </p>
            <div className="w-full py-3 rounded-xl bg-gray-50 text-[#003366] font-semibold group-hover:bg-[#003366] group-hover:text-white transition-colors">
              Iniciar Full (50 Preguntas)
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (loading || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#003366] font-medium">Analizando respuestas y generando la siguiente pregunta...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div className="bg-[#00A3FF] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentQuestion.framework || 'DIAGNÓSTICO'}</span>
        <h2 className="text-2xl font-medium text-[#003366] mt-4 mb-8 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="space-y-4">
          {currentQuestion.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-[#003366] hover:bg-blue-50 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;
