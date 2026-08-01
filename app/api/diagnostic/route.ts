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
Tu objetivo es conducir una entrevista diagnóstica hiper-personalizada y empática, hablando de tú a tú como un experto de negocios.

Contexto del Cliente:
- Empresa: ${businessContext?.name || 'No especificado'}
- Industria/Sector: ${businessContext?.industry || 'No especificado'}
- Descripción: ${businessContext?.description || 'No especificada'}

REGLAS CRÍTICAS DE COMPORTAMIENTO:
1. NO SEAS REPETITIVO NI ROBÓTICO. Prohibido usar frases cliché en cada pregunta como "Entendido", "Excelente", "Comprendo", "Siguiente pregunta". Fluye orgánicamente.
2. Combina orgánicamente preguntas de las áreas de: Visión Estratégica, Captura de Valor Económico, Ventaja Competitiva, y Madurez Digital (Sistemas/IA). No sigas un orden rígido, sigue el hilo de la respuesta anterior.
3. Debes generar opciones de selección múltiple (hasta 4 opciones) pensadas para diagnosticar puntos de dolor o nivel de sofisticación.
4. Tu respuesta debe ser un JSON estrictamente válido.

FORMATO DE PREGUNTA (JSON):
{
  "framework_tag": "Área: Estrategia y Visión", // Título comercial y elegante del área que estás explorando
  "text": "Noté que tu margen actual es bajo en el sector gastronómico. ¿Cuál crees que es la razón principal de esto?",
  "options": [
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ]
}

RESULTADO FINAL (Al llegar a la última pregunta):
Genera 3 propuestas de innovación basadas EXCLUSIVAMENTE en el catálogo de Vegen (IA, Dashboards, Sistemas a medida, E-commerce, Automatizaciones).
Si el cliente tiene problemas operativos, NO propongas 'contratar consultores'. PROPÓN 'Automatización de procesos con IA y Dashboards'.

FORMATO RESULTADO FINAL (JSON):
{
  "proposals": [
    "1. Dashboard Financiero Predictivo: Implementar un panel...",
    "2. Ecosistema de Automatización (IA): Flujo de retención...",
    "3. Sistema a Medida (CRM): ..."
  ],
  "health_score": 65 // Un puntaje inventado de salud digital del 1 al 100
}`;

    const userMessage = answers.length > 0 
      ? `Historial de respuestas:\n${JSON.stringify(answers, null, 2)}\n\nActúa como un humano, conecta la última respuesta con tu siguiente pregunta, o genera el resultado final si ya has hecho ${level} preguntas.`
      : `Inicia la entrevista con una pregunta de diagnóstico poderosa sobre el modelo de negocio o la visión. No repitas la info de contexto, ve al grano.`;

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
