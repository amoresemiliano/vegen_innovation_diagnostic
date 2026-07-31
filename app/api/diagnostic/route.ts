import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { answers, level, currentStep } = await req.json();

    // System Prompt Maestro que integra los frameworks de la materia
    const systemPrompt = `Eres un Consultor Senior de Vegen Digital SL.
    Tu objetivo es realizar un diagnóstico estratégico para una PyME en España.
    
    FRAMEWORKS A USAR:
    1. Cascada Estratégica (Aspiración, Dónde jugar, Cómo ganar).
    2. Creación y Captura de Valor (DAP, Precio, Costo).
    3. Análisis de Capacidades VRIO.

    CONTEXTO DE SERVICIOS VEGEN (Muro de Contención):
    - Automatizaciones con IA.
    - Análisis de datos/Dashboards.
    - Desarrollo a medida (CRM, ERP, Apps).
    - Marketing Digital y Estrategia 360.

    REGLAS DE SALIDA DEBE SER ESTRICTAMENTE UN JSON:
    Si NO es el final del diagnóstico, genera la siguiente pregunta en este formato JSON:
    {
      "text": "Tu pregunta aquí...",
      "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      "framework": "Nombre del Framework Analizado"
    }
    
    Si es el final (paso ${level}), genera 3 propuestas de innovación basadas EXCLUSIVAMENTE en los servicios de Vegen, en este formato JSON:
    {
      "proposals": ["Propuesta 1", "Propuesta 2", "Propuesta 3"],
      "framework": "RESULTADO FINAL"
    }

    Recuerda: la pregunta debe parecer una charla técnica pero accesible, basándose en la última respuesta del cliente (si la hay).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Historial de respuestas: ${JSON.stringify(answers)}. Genera la siguiente pregunta o el resultado final (JSON).` }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || '{}'));
  } catch (error) {
    return NextResponse.json({ error: 'Error en el motor de diagnóstico' }, { status: 500 });
  }
}

