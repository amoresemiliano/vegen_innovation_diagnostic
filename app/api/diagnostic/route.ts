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

    CONTEXTO DE SERVICIOS VEGEN:
    - Automatizaciones con IA.
    - Análisis de datos/Dashboards.
    - Desarrollo a medida (CRM, ERP, Apps).
    - Marketing Digital y Estrategia 360.

    REGLA: Si es el final (paso ${level}), genera 3 propuestas de innovación basadas en los servicios de Vegen.
    Si no es el final, genera la siguiente pregunta de selección múltiple (4 opciones) basada en la respuesta anterior para que parezca una charla técnica.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Historial de respuestas: ${JSON.stringify(answers)}. Genera la siguiente pregunta o el resultado final.` }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    return NextResponse.json({ error: 'Error en el motor de diagnóstico' }, { status: 500 });
  }
}
