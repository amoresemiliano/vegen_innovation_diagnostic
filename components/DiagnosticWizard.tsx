// components/DiagnosticWizard.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, Rocket, Building2, ChevronRight, Activity, TrendingUp, Laptop, BrainCircuit } from 'lucide-react';

const DiagnosticWizard = () => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null); // 20, 35, 50
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customAnswer, setCustomAnswer] = useState("");
  const [businessContext, setBusinessContext] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadData, setLeadData] = useState({ nombre: '', email: '', whatsapp: '' });
  const [apiError, setApiError] = useState(null);

  const fetchNextQuestion = async (currentAnswers, context = businessContext) => {
    setLoading(true);
    setApiError(null);
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
        setApiError("Hubo un retraso de red con la Inteligencia Artificial. Por favor, intenta enviar de nuevo.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setApiError("Fallo de conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ya no hacemos fetch aquí automáticamente al setear el nivel, 
    // esperamos a que el usuario complete el contexto.
  }, [level]);

  const handleAnswerSubmit = async () => {
    let combinedAnswer = selectedOptions.join(", ");
    if (customAnswer.trim()) {
      combinedAnswer += (combinedAnswer ? " | " : "") + customAnswer.trim();
    }
    if (!combinedAnswer) return;

    const questionText = currentQuestion.text;
    const frameworkTag = currentQuestion.framework_tag || 'General';
    
    const newAnswers = [...answers, { q: questionText, a: combinedAnswer }];
    setAnswers(newAnswers);
    setSelectedOptions([]);
    setCustomAnswer("");
    
    // Guardar log atómico para ML
    if (sessionId) {
      await supabase.from('framework_logs').insert([{
        session_id: sessionId,
        step_number: step + 1,
        framework_tag: frameworkTag,
        question_text: questionText,
        answer_text: combinedAnswer
      }]);
    }

    setStep(step + 1);
    setProgress(((step + 1) / (level || 20)) * 100);
    
    if (!isFinished) {
      fetchNextQuestion(newAnswers);
    }
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const startDiagnostic = async (e) => {
    e.preventDefault();
    const context = { name: companyName, industry: companyIndustry, location: companyLocation, description: companyDesc };
    setBusinessContext(context);
    
    try {
      // 1. Crear la Sesión en Supabase
      const { data: sessionData, error } = await supabase
        .from('sessions')
        .insert([{
          level: level,
          business_context: context
        }])
        .select()
        .single();
        
      if (!error && sessionData) {
        setSessionId(sessionData.id);
      }
    } catch (err) {
      console.error("Error creando sesión:", err);
    }

    fetchNextQuestion([], context);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    handleAnswerSubmit();
  };

  if (!level) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center max-w-6xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 text-[#10B981] font-bold text-sm mb-6">
          <BrainCircuit className="w-4 h-4" />
          <span>Vegen AI Diagnostic Engine</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111827] mb-6 tracking-tight">
          Descubre el Potencial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#F97316]">Oculto</span> de tu Empresa
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl leading-relaxed">
          Nuestro algoritmo impulsado por Inteligencia Artificial evaluará tu modelo de negocio en tiempo real. 
          Al finalizar, recibirás <span className="font-bold text-[#10B981]">3 propuestas estratégicas de innovación sin costo</span>, listas para implementar.
        </p>
        <p className="text-md font-medium text-gray-400 mb-12 uppercase tracking-widest">
          Selecciona la profundidad del análisis
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
          {/* Card Nivel 1 */}
          <button onClick={() => setLevel(20)} className="group relative bg-white p-8 border border-gray-100 rounded-3xl hover:border-[#10B981]/50 hover:shadow-2xl hover:shadow-[#10B981]/10 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#10B981]/10 transition-colors">
              <Zap className="w-8 h-8 text-gray-400 group-hover:text-[#10B981] transition-colors" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nivel 1</div>
            <h3 className="text-2xl font-black text-[#111827] mb-4">Express</h3>
            <p className="text-gray-500 mb-8 flex-grow text-sm leading-relaxed">
              Auditoría rápida de tus procesos actuales. Ideal para detectar cuellos de botella urgentes e ineficiencias operativas.
            </p>
            <div className="w-full py-4 rounded-xl bg-gray-50 text-[#111827] font-bold group-hover:bg-[#111827] group-hover:text-white transition-all flex items-center justify-center gap-2">
              20 Preguntas
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
          
          {/* Card Nivel 2 */}
          <button onClick={() => setLevel(35)} className="group relative bg-white p-8 border-2 border-[#111827] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-2 mt-4 md:mt-0">
            <div className="absolute -top-4 bg-[#10B981] text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recomendado
            </div>
            <div className="w-16 h-16 bg-[#111827] rounded-2xl flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
              <Rocket className="w-8 h-8 text-[#10B981]" />
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-widest mb-2">Nivel 2</div>
            <h3 className="text-2xl font-black text-[#111827] mb-4">Business</h3>
            <p className="text-gray-600 mb-8 flex-grow text-sm leading-relaxed font-medium">
              Análisis profundo de tu estrategia y propuesta de valor. Perfecto para empresas en crecimiento buscando escalar agresivamente.
            </p>
            <div className="w-full py-4 rounded-xl bg-[#111827] text-white font-bold group-hover:bg-[#10B981] transition-colors shadow-md flex items-center justify-center gap-2">
              35 Preguntas
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card Nivel 3 */}
          <button onClick={() => setLevel(50)} className="group relative bg-white p-8 border border-gray-100 rounded-3xl hover:border-[#F97316]/50 hover:shadow-2xl hover:shadow-[#F97316]/10 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#F97316]/10 transition-colors">
              <Building2 className="w-8 h-8 text-gray-400 group-hover:text-[#F97316] transition-colors" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nivel 3</div>
            <h3 className="text-2xl font-black text-[#111827] mb-4">Transformation</h3>
            <p className="text-gray-500 mb-8 flex-grow text-sm leading-relaxed">
              Evaluación exhaustiva 360º de capacidades, tecnología y automatización. Visión corporativa total para reestructurar el modelo.
            </p>
            <div className="w-full py-4 rounded-xl bg-gray-50 text-[#111827] font-bold group-hover:bg-[#111827] group-hover:text-white transition-all flex items-center justify-center gap-2">
              50 Preguntas
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (!businessContext) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[75vh] animate-fade-in">
        <h2 className="text-3xl font-bold text-[#111827] mb-6 text-center">Cuéntanos sobre tu negocio</h2>
        <p className="text-gray-600 mb-8 text-center">Para que nuestra IA pueda hacerte las preguntas correctas, necesitamos un poco de contexto inicial.</p>
        
        <form 
          className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          onSubmit={startDiagnostic}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Nombre de tu Empresa / Proyecto</label>
              <input name="name" required type="text" onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej. El Criollo Taquería" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#111827] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">¿En qué sector o industria te encuentras?</label>
              <input name="industry" required type="text" onChange={(e) => setCompanyIndustry(e.target.value)} placeholder="Ej. Gastronomía / Restaurante" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#111827] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Ubicación (Ciudad / País)</label>
              <input name="location" required type="text" onChange={(e) => setCompanyLocation(e.target.value)} placeholder="Ej. Madrid, España" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#111827] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Breve descripción de lo que hacen (Opcional)</label>
              <textarea name="description" onChange={(e) => setCompanyDesc(e.target.value)} placeholder="Ej. Vendemos comida mexicana auténtica con entregas a domicilio..." rows={3} className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#111827] outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#111827] text-white py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors mt-4">
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
      // Check if lead exists to avoid unique constraint / upsert issues
      let lead;
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', leadData.email)
        .single();

      if (existingLead) {
        const { data: updatedLead, error: updateError } = await supabase
          .from('leads')
          .update({
            nombre: leadData.nombre,
            empresa: businessContext.name,
            whatsapp: leadData.whatsapp,
            industria: businessContext.industry,
            ubicacion: businessContext.location,
            status: '1_nuevo'
          })
          .eq('id', existingLead.id)
          .select()
          .single();
        if (updateError) throw updateError;
        lead = updatedLead;
      } else {
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert([{
            nombre: leadData.nombre,
            empresa: businessContext.name,
            email: leadData.email,
            whatsapp: leadData.whatsapp,
            industria: businessContext.industry,
            ubicacion: businessContext.location,
            status: '1_nuevo'
          }])
          .select()
          .single();
        if (insertError) throw insertError;
        lead = newLead;
      }

      if (sessionId) {
        await supabase
          .from('sessions')
          .update({
            lead_id: lead.id,
            is_completed: true,
            proposals: currentQuestion.proposals
          })
          .eq('id', sessionId);
      }

      setLeadSuccess(true);
    } catch (error: any) {
      console.error('Error guardando en Supabase:', error);
      alert(`Error DB: ${error.message || JSON.stringify(error)}`);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (isFinished && currentQuestion?.proposals) {
    const isBlurred = !leadSuccess;

    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in pb-20">
        <div className="text-center mb-10">
          <div className="inline-block bg-[#111827] text-white px-4 py-1 rounded-full text-sm font-bold mb-4 shadow-lg shadow-[#10B981]/20">
            Score de Salud Estratégica: {currentQuestion.health_score || '72'}/100
          </div>
          <h2 className="text-4xl font-bold text-[#111827] mb-4">¡Diagnóstico Completado!</h2>
          <p className="text-lg text-gray-600">Hemos detectado 3 oportunidades clave de crecimiento e innovación para {businessContext?.name}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
          {currentQuestion.proposals.map((proposal, idx) => {
            const [title, ...descParts] = proposal.split(':');
            const desc = descParts.join(':');
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#111827]/10 h-full flex flex-col relative overflow-hidden">
                <div className="text-3xl mb-4 text-[#10B981] font-black">0{idx + 1}</div>
                <h3 className="text-xl font-bold text-[#111827] mb-3 leading-tight">{title || proposal}</h3>
                
                {desc && (
                  <p className={`text-gray-600 text-sm leading-relaxed transition-all duration-500 ${isBlurred ? 'blur-[6px] select-none' : ''}`}>
                    {desc}
                  </p>
                )}
                
                {isBlurred && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6">
                    <span className="text-[#111827] font-bold text-sm bg-white/90 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      Bloqueado
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showLeadForm && !leadSuccess && (
          <div className="text-center bg-gradient-to-br from-[#111827] to-[#002244] rounded-2xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#10B981] rounded-full blur-3xl opacity-20"></div>
            <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Desbloquea tu Estrategia</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg relative z-10">Para ver el detalle de implementación de estas 3 propuestas y recibir el PDF completo, ingresa tus datos a continuación sin compromiso.</p>
            <button 
              onClick={() => setShowLeadForm(true)}
              className="bg-[#10B981] text-white px-10 py-5 rounded-xl font-black text-lg hover:bg-blue-400 hover:scale-105 transition-all shadow-xl shadow-[#10B981]/30 relative z-10"
            >
              Desbloquear Informe Completo
            </button>
          </div>
        )}

        {showLeadForm && !leadSuccess && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-[#111827] mb-6 text-center">¿Dónde te lo enviamos?</h3>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-1">Nombre Completo</label>
                <input required type="text" value={leadData.nombre} onChange={e => setLeadData({...leadData, nombre: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#111827] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-1">Correo Electrónico</label>
                <input required type="email" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#111827] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-1">WhatsApp (Opcional)</label>
                <input type="tel" value={leadData.whatsapp} onChange={e => setLeadData({...leadData, whatsapp: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#111827] outline-none" />
              </div>
              <button type="submit" disabled={submittingLead} className="w-full bg-[#10B981] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors mt-2 disabled:opacity-50">
                {submittingLead ? 'Enviando...' : 'Obtener Informe Completo'}
              </button>
            </form>
          </div>
        )}

        {leadSuccess && (
          <div className="text-center bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 animate-fade-in max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-4xl font-black text-[#111827] mb-4">¡Estrategia Desbloqueada!</h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Tu informe detallado está en camino. Mientras tanto, ya puedes leer el resumen completo de las propuestas arriba.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href={`https://wa.me/34617741199?text=Hola%20Vegen,%20acabo%20de%20terminar%20mi%20diagnóstico%20para%20${encodeURIComponent(businessContext?.name || 'mi empresa')}.%20Me%20gustaría%20profundizar%20en%20las%20propuestas.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1da851] transition-transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Hablar por WhatsApp
              </a>
              <a 
                href="mailto:info@vegendigital.com"
                className="inline-flex items-center gap-3 bg-[#111827] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#002244] transition-transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Enviar Email
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading || (!currentQuestion && !apiError)) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#111827] font-medium">Analizando respuestas y generando la siguiente pregunta...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
           <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops, algo salió mal</h2>
        <p className="text-gray-600 mb-6">{apiError}</p>
        <button 
          onClick={() => fetchNextQuestion(answers)}
          className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#002244] transition-colors"
        >
          Reintentar Conexión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">
            <span>Diagnóstico en curso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#10B981] h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Burbuja del Consultor IA */}
        <div className="flex gap-4 sm:gap-6 mb-8">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#111827] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex-1 relative">
            <div className="absolute -left-3 top-0 w-4 h-4 bg-white border-l border-b border-gray-100 transform rotate-45"></div>
            {currentQuestion.framework_tag && (
              <span className="inline-block text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded mb-3">
                {currentQuestion.framework_tag}
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-medium text-[#111827] leading-relaxed">
              {currentQuestion.text}
            </h3>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 pl-0 sm:pl-16">
          {currentQuestion.options?.map((opt) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleOptionToggle(opt)}
                className={`w-full text-left p-5 rounded-xl border transition-colors flex items-center gap-3 ${
                  isSelected ? 'border-[#10B981] bg-green-50' : 'border-gray-200 hover:border-[#F97316] hover:bg-orange-50'
                }`}
              >
                <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-300'}`}>
                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
          <p className="text-sm text-gray-500 mb-3 font-medium">¿Deseas agregar más detalles? Escribe tu propia respuesta (Opcional):</p>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <textarea 
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Ej: Quiero pasar de 29k a 40k de ventas y mejorar mi retención..."
              rows={2}
              className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none transition-all resize-none"
            />
            <button 
              onClick={handleAnswerSubmit}
              disabled={selectedOptions.length === 0 && !customAnswer.trim()}
              className="bg-[#111827] text-white px-8 h-[74px] rounded-xl font-bold hover:bg-[#F97316] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              Siguiente
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      </div>
  );
};

export default DiagnosticWizard;
