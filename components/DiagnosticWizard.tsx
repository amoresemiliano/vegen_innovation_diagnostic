// components/DiagnosticWizard.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DiagnosticWizard = () => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null); // 20, 35, 50
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [customAnswer, setCustomAnswer] = useState("");
  const [businessContext, setBusinessContext] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadData, setLeadData] = useState({ nombre: '', email: '', whatsapp: '' });

  const fetchNextQuestion = async (currentAnswers, context = businessContext) => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: currentAnswers, level, businessContext: context })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.proposals) {
          setIsFinished(true);
        }
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
    // Ya no hacemos fetch aquí automáticamente al setear el nivel, 
    // esperamos a que el usuario complete el contexto.
  }, [level]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { q: currentQuestion.text, a: option }];
    setAnswers(newAnswers);
    setStep(step + 1);
    setProgress(((step + 1) / (level || 20)) * 100);
    
    // Si la API ya nos devolvió propuestas, ignoramos esto,
    // pero si aún faltan pasos, vamos a la siguiente.
    if (!isFinished) {
      fetchNextQuestion(newAnswers);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customAnswer.trim() === "") return;
    handleAnswer(customAnswer);
    setCustomAnswer("");
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

  if (!businessContext) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[75vh] animate-fade-in">
        <h2 className="text-3xl font-bold text-[#003366] mb-6 text-center">Cuéntanos sobre tu negocio</h2>
        <p className="text-gray-600 mb-8 text-center">Para que nuestra IA pueda hacerte las preguntas correctas, necesitamos un poco de contexto inicial.</p>
        
        <form 
          className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const context = {
              name: formData.get('name'),
              industry: formData.get('industry'),
              description: formData.get('description')
            };
            setBusinessContext(context);
            fetchNextQuestion([], context);
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#003366] mb-2">Nombre de tu Empresa / Proyecto</label>
              <input name="name" required type="text" placeholder="Ej. El Criollo Taquería" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#003366] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003366] mb-2">¿En qué sector o industria te encuentras?</label>
              <input name="industry" required type="text" placeholder="Ej. Gastronomía / Restaurante" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#003366] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003366] mb-2">Breve descripción de lo que hacen (Opcional)</label>
              <textarea name="description" placeholder="Ej. Vendemos comida mexicana auténtica con entregas a domicilio..." rows="3" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#003366] outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors mt-4">
              Comenzar Diagnóstico
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      // 1. Guardar el Lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([{
          nombre: leadData.nombre,
          empresa: businessContext.name,
          email: leadData.email,
          whatsapp: leadData.whatsapp,
        }])
        .select()
        .single();

      if (leadError) throw leadError;

      // 2. Guardar el Diagnóstico
      const { error: diagError } = await supabase
        .from('diagnostics')
        .insert([{
          lead_id: lead.id,
          level: level,
          raw_responses: answers,
          proposals: currentQuestion.proposals
        }]);

      if (diagError) throw diagError;

      setLeadSuccess(true);
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
      alert('Hubo un error al enviar tus datos. Por favor, intenta nuevamente.');
    } finally {
      setSubmittingLead(false);
    }
  };

  if (isFinished && currentQuestion?.proposals) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#003366] mb-4">¡Diagnóstico Completado!</h2>
          <p className="text-lg text-gray-600">Hemos detectado 3 oportunidades clave de crecimiento e innovación para {businessContext?.name}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {currentQuestion.proposals.map((proposal, idx) => {
            const [title, ...descParts] = proposal.split(':');
            const desc = descParts.join(':');
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#003366]/10 hover:shadow-lg transition-all">
                <div className="text-3xl mb-4 text-[#00A3FF]">0{idx + 1}</div>
                <h3 className="text-xl font-bold text-[#003366] mb-3 leading-tight">{title || proposal}</h3>
                {desc && <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>}
              </div>
            );
          })}
        </div>

        {!showLeadForm && !leadSuccess && (
          <div className="text-center bg-[#003366]/5 rounded-2xl p-8 border border-[#003366]/10">
            <h3 className="text-2xl font-bold text-[#003366] mb-4">¿Quieres profundizar en estas estrategias?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Solicita tu informe ampliado y descubre cómo implementar estas soluciones en tu empresa sin compromisos.</p>
            <button 
              onClick={() => setShowLeadForm(true)}
              className="bg-[#003366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors"
            >
              Recibir Informe Detallado
            </button>
          </div>
        )}

        {showLeadForm && !leadSuccess && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-[#003366] mb-6 text-center">¿Dónde te lo enviamos?</h3>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#003366] mb-1">Nombre Completo</label>
                <input required type="text" value={leadData.nombre} onChange={e => setLeadData({...leadData, nombre: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003366] mb-1">Correo Electrónico</label>
                <input required type="email" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003366] mb-1">WhatsApp (Opcional)</label>
                <input type="tel" value={leadData.whatsapp} onChange={e => setLeadData({...leadData, whatsapp: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#003366] outline-none" />
              </div>
              <button type="submit" disabled={submittingLead} className="w-full bg-[#00A3FF] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors mt-2 disabled:opacity-50">
                {submittingLead ? 'Enviando...' : 'Obtener Informe Completo'}
              </button>
            </form>
          </div>
        )}

        {leadSuccess && (
          <div className="text-center bg-green-50 rounded-2xl p-10 border border-green-200 animate-fade-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-3xl font-bold text-[#003366] mb-4">¡Todo listo!</h3>
            <p className="text-gray-700 text-lg">Tu solicitud ha sido registrada correctamente. Un consultor experto de Vegen Digital se pondrá en contacto contigo muy pronto para revisar tu informe detallado.</p>
          </div>
        )}
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

        <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
          <p className="text-sm text-gray-500 mb-3 font-medium">¿Ninguna opción encaja exactamente? Escribe tu propia respuesta:</p>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Ej: Quiero pasar de 29k a 40k de ventas..."
              className="flex-grow p-4 rounded-xl border border-gray-200 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!customAnswer.trim()}
              className="bg-[#003366] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;
