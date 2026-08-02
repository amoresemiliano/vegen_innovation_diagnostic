# Documentación de Arquitectura Actual (Fase 0 - MVP de Vegen Innovation Diagnostic)

## 1. Resumen Ejecutivo de la Arquitectura Existente
El sistema actual funciona como una aplicación de página única (SPA) embebida en Next.js 14.2.5 (App Router), con un backend Serverless limitado y acoplamiento directo entre la interfaz del cliente de React y la base de datos Supabase (PostgreSQL). 

La arquitectura actual responde a un patrón de **Prototipo Rápido (MVP)** donde la velocidad de experimentación inicial prevaleció sobre el aislamiento de dominios, la seguridad de datos al nivel de servidor y la trazabilidad algorítmica del diagnóstico de innovación.

---

## 2. Diagrama del Flujo de Datos y Componentes (MVP)

```
[ Navegador del Usuario ]
       │
       ├─► (Client Component) DiagnosticWizard.tsx
       │         │
       │         ├─► [ Supabase DB Direct Query ] ──(Insert sessions & framework_logs)──► [ Supabase DB ]
       │         │                                                                       (RLS Deshabilitado)
       │         │
       │         └─► (HTTP POST JSON) ──► [ /api/diagnostic (Route Handler) ]
       │                                         │
       │                                         └─► [ OpenAI GPT-4o ]
       │                                             (Prompt Gigantesco Todo-en-Uno)
       │
       └─► (Client Component) app/admin/dashboard/page.tsx
                 │
                 └─► [ Supabase DB Direct Query ] ──(Select * from leads, sessions, logs)──► [ Supabase DB ]
```

---

## 3. Análisis Crítico por Componente

### 3.1. Frontend y Experiencia de Usuario (`DiagnosticWizard.tsx`)
* **Sobrecarga de Responsabilidades:** El archivo supera las 520 líneas y mezcla la gestión del estado de React (`step`, `answers`, `level`), la presentación visual (UI/Tailwind), el renderizado condicional de etapas (Selección de nivel, Formulario de Contexto, Cuestionario, Formulario de Captura Comercial y Vista de Resultados) y la invocación de llamadas a la base de datos de producción.
* **Persistencia Directa desde Cliente:** Al iniciarse una sesión o enviarse una respuesta, el cliente emite llamadas asíncronas `supabase.from('sessions').insert(...)` y `supabase.from('framework_logs').insert(...)`.
* **Ruptura del Principio de Encapsulamiento:** No existe una capa de servicio (`DiagnosticService`) ni repositorios abstractos. Cualquier cambio en la estructura de base de datos rompe de inmediato el componente visual.

### 3.2. Motor de IA en Backend (`app/api/diagnostic/route.ts`)
* **Patrón de Prompt Monolítico:** El endpoint ejecuta una llamada directa a `openai.chat.completions.create` usando el modelo `gpt-4o` en modo `json_object`. El `systemPrompt` intenta realizar 6 funciones concurrentes:
  1. Entrevistador empático.
  2. Evaluador ontológico del sector empresarial.
  3. Generador de opciones de selección múltiple.
  4. Selector de área o framework.
  5. Prescriptor de soluciones Vegen Digital (al llegar al tope de preguntas).
  6. Calculador de métrica de salud digital (`health_score`).
* **Scoring No Metodológico:** El sistema carece de una función de puntuación matemática o determinista. El propio prompt indica literamente al LLM: `"health_score": 65 // Un puntaje inventado de salud digital del 1 al 100`. Esto implica que dos empresas idénticas con respuestas idénticas pueden obtener puntuaciones arbitrariamente diferentes.
* **Memoria No Estructurada:** El estado de la sesión que se transmite al LLM en cada iteración es un volcado de texto plano en JSON (`JSON.stringify(answers)`). A medida que avanza la sesión en niveles profundos (*Transformation*, 50 preguntas), el LLM sufre deterioro de atención (*context window drift*), ocasionando que re-pregunten conceptos ya explicados y arrojando recomendaciones genéricas.

### 3.3. Sistema Administrativo (`app/admin/dashboard/page.tsx`)
* **Dashboard Monolítico de Cliente:** Construido con `"use client"`, realiza peticiones directas para descargar masivamente todos los registros de `leads`, `sessions` y `framework_logs`, ejecutando agrupaciones y "joins" relacionales en la memoria del navegador de forma costosa.
* **Exportación a PDF Aislada:** Emplea `html2pdf.js` manipulando el DOM inyectando cadenas de texto sin plantilla reutilizable y sin servidor de renderizado dedicado.

---

## 4. Auditoría de Seguridad y Base de Datos (Supabase)
Tras inspeccionar los datos confirmados del catálogo oficial de PostgreSQL en Supabase, se identifican las siguientes vulnerabilidades y riesgos técnicos inmediatos:

1. **Row Level Security (RLS) Deshabilitado:**
   * Las cuatro tablas core (`public.leads`, `public.sessions`, `public.framework_logs`, `public.kanban_board`) tienen RLS completamente desactivado (`ENABLE ROW LEVEL SECURITY` no está activo y `pg_policies` devuelve 0 filas).
   * **Riesgo Crítico:** Al utilizar la clave anónima (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) en el frontend web, la API REST PostgREST de Supabase acepta cualquier operación CRUD sin validación de identidad. Un tercero podría realizar un GET a `https://[id].supabase.co/rest/v1/leads` y exfiltrar el CRM completo o alterar historiales de diagnóstico.
2. **Inexistencia de Validación de Payloads:**
   * Al no utilizar esquemas de validación de servidor (como Zod o io-ts), el cliente puede enviar JSON malformado a `sessions.business_context` o a la API de diagnóstico, causando excepciones no controladas o envenenamiento de datos de sesión.
3. **Falta de Integridad Referencial Estricta:**
   * En `sessions`, la relación con `leads` tiene `ON DELETE SET NULL`, lo cual es aceptable, pero en la práctica las sesiones nacen huérfanas (`lead_id = NULL`) y su posterior enlace depende exclusivamente de que el cliente web logre finalizar sin interrupciones de red al completar el formulario final.

---

## 5. Deuda Técnica y Conclusiones del MVP
El MVP actual demostró la viabilidad comercial y el atractivo de utilizar IA para generar propuestas estratégicas en el sector PyME/HORECA de Vegen Digital. Sin embargo, su arquitectura ha tocado techo:
* No permite auditar la calidad pedagógica y metodológica de las preguntas formuladas.
* No rastrea hipótesis de innovación ni contradicciones en el discurso del empresario.
* Presenta una exposición grave de seguridad de datos por diseño (RLS desactivado y queries directas al cliente).
* Requiere una evolución urgente hacia una **Arquitectura de Motor Híbrido Desacoplado**, la cual se describe en `target-architecture.md`.
