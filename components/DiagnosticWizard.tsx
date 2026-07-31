// components/DiagnosticWizard.tsx
import React, { useState, useEffect } from 'react';

const DiagnosticWizard = () => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null); // 20, 35, 50
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);

  // Simulación de carga de pregunta (Esto vendrá de OpenAI)
  const currentQuestion = {
    text: "¿Cuál es el mayor cuello de botella en tu operación diaria?",
    options: ["Falta de datos", "Procesos manuales", "Baja conversión", "Sistemas desconectados"],
    framework: "Análisis de Capacidades"
  };

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { q: currentQuestion.text, a: option }];
    setAnswers(newAnswers);
    setStep(step + 1);
    setProgress(((step + 1) / (level || 20)) * 100);
  };

  if (!level) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-3xl font-bold text-[#003366] mb-8">Comienza tu Diagnóstico de Innovación</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[20, 35, 50].map((num) => (
            <button 
              key={num}
              onClick={() => setLevel(num)}
              className="p-8 border-2 border-[#003366] rounded-xl hover:bg-[#003366] hover:text-white transition-all group"
            >
              <span className="text-4xl font-bold block mb-2">{num}</span>
              <span className="text-sm uppercase tracking-widest font-semibold">Preguntas</span>
              <p className="mt-4 text-xs opacity-70 group-hover:opacity-100">
                {num === 20 ? 'Diagnóstico Express' : num === 35 ? 'Análisis Business' : 'Full Transformation'}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div className="bg-[#00A3FF] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentQuestion.framework}</span>
        <h2 className="text-2xl font-medium text-[#003366] mt-4 mb-8 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="space-y-4">
          {currentQuestion.options.map((opt) => (
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
