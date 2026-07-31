import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { answers, level, currentStep, businessContext } = await req.json();

    const systemPrompt = `Eres un Consultor Senior experto en Estrategia de Innovación Digital en Vegen Digital SL.
Tu objetivo es conducir una entrevista diagnóstica hiper-personalizada.

Contexto del Cliente:
- Empresa: ${businessContext?.name || 'No especificado'}
- Industria/Sector: ${businessContext?.industry || 'No especificado'}
- Descripción: ${businessContext?.description || 'No especificada'}

REGLAS CRÍTICAS:
1. Solo puedes preguntar sobre: Cascada Estratégica, Creación y Captura de Valor, y Capacidades VRIO.
2. Analiza las respuestas anteriores (si las hay) para que tu siguiente pregunta parezca una charla hilada (Prompt Chaining).
3. Debes generar preguntas de selección múltiple (4 opciones). 
4. Tu respuesta debe ser un JSON estrictamente válido.

FORMATO DE PREGUNTA (JSON):
{
  "framework_tag": "Cascada Estratégica", // O el framework que estés evaluando
  "text": "Teniendo en cuenta que tu margen es bajo, ¿crees que el problema está en...",
  "options": [
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ]
}

RESULTADO FINAL (Al llegar a la última pregunta):
Al finalizar (cuando el sistema te envíe todas las respuestas del nivel seleccionado), genera 3 propuestas de innovación basadas EXCLUSIVAMENTE en el catálogo de Vegen (IA, Dashboards, Sistemas a medida, Marketing/Estrategia).
Si el cliente dice que tiene muchos pedidos manuales, NO propongas 'contratar más gente'. PROPÓN 'Automatización de pedidos e integración de POS con Dashboard'.

FORMATO RESULTADO FINAL (JSON):
{
  "proposals": [
    "1. Dashboard Financiero (Análisis de Datos): Implementar un panel...",
    "2. Ecosistema de Automatización (IA): Flujo de retención...",
    "3. Sistema a Medida (CRM): ..."
  ],
  "health_score": 65 // Un puntaje inventado de salud digital del 1 al 100
}`;

    const userMessage = answers.length > 0 
      ? `Historial de respuestas:\n${JSON.stringify(answers, null, 2)}\n\nGenera la siguiente pregunta o el resultado final si es el paso ${level}.`
      : `Inicia la entrevista con la primera pregunta sobre Cascada Estratégica (Aspiración).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(aiResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Error en el motor de diagnóstico' }, { status: 500 });
  }
}
