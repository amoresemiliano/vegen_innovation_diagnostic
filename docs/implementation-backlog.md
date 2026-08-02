# Backlog de Implementación y Epics (Fase 1 a 5)

> [!IMPORTANT]
> Documento de diseño de Fase 0. Su contenido constituye una propuesta inicial y no una arquitectura definitivamente aprobada. La ontología, las ponderaciones, el modelo de datos, el health score, las soluciones asociadas y la migración SQL requieren revisión metodológica y técnica posterior.

Este backlog organiza el trabajo técnico en **Epics** y **User Stories** atómicas, numeradas para seguimiento continuo en Jira/Trello/GitHub Projects y estandarizadas con estimación y criterios de aceptación verificables.

---

## Epic 1: Cimientos de Arquitectura y Calidad (Fase 1 - Sprint Inmediato)
* **Objetivo:** Desacoplar la infraestructura web de cliente de los secretos y accesos inseguros al servidor.

### US-101: Abrazar el cliente Supabase por Alcance (Client vs. Server SSR)
* **Descripción:** Como Arquitecto, quiero separar los clientes Supabase en `lib/supabase/client.ts` (anónimo de navegador) y `lib/supabase/server.ts` (servidor autenticado) para impedir que componentes web tengan acceso indiscriminado a tablas.
* **Criterios de Aceptación:**
  - `client.ts` usa exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `server.ts` utiliza librerías compatibles con Next.js App Router (`@supabase/ssr`) y maneja `SUPABASE_SERVICE_ROLE_KEY` o cookies autenticadas.
  - Ningún componente dentro de `components/` o `app/admin/` importa el cliente de servidor.
* **Estimación:** 3 Puntos ( Medio día).

### US-102: Suite Inicial de Tests Automatizados y Vitest
* **Descripción:** Como Ingeniero Staff, quiero integrar Vitest y TypeScript para validar sin coste de red ni LLM la lógica del motor determinista de scoring.
* **Criterios de Aceptación:**
  - Script `npm test` operativo en `package.json`.
  - Configuración de `vitest.config.ts` y estructura de pruebas en `tests/unit/`.
  - Al menos 1 prueba de cordura de tipados y validación de esquemas ejecutándose verde en CI.
* **Estimación:** 3 Puntos.

### US-103: Migración SQL Aditiva para el Motor V2 (`0001_engine_v2_schema_proposal.sql`)
* **Descripción:** Como Desarrollador, quiero revisar y validar en entorno staging el script SQL de propuesta (`supabase/proposals/0001_engine_v2_schema_proposal.sql`) para nuevas columnas en `sessions`/`framework_logs` y creación de `question_catalog` y `opportunity_candidates`.
* **Criterios de Aceptación:**
  - La ejecución no rompe ninguna fila ni columna existente.
  - El MVP actual sigue iniciando sesiones y guardando logs sin alterarse.
* **Estimación:** 2 Puntos.

---

## Epic 2: Ontología, Catálogos y Datos Maestro (Fase 2)

### US-201: Codificación del Modelo de Dominio en TypeScript (`lib/domain/`)
* **Descripción:** Como Especialista en Sistemas de Diagnóstico, quiero plasmar las 29 dimensiones ontológicas y los 20 frameworks de innovación en tipos inmutables de TS.
* **Criterios de Aceptación:**
  - Archivo `lib/domain/ontology.ts` define tipos literales y descripciones de las 29 dimensiones (ej. `madurez_ia`, `deuda_psicologica`, `capacidades_vrio`).
  - Archivo `lib/domain/frameworks.ts` empareja los 20 marcos estratégicos con sus respectivas dimensiones y ponderaciones de nivel.
* **Estimación:** 5 Puntos.

### US-202: Carga de 100 Preguntas de Catálogo en `question_catalog`
* **Descripción:** Como Especialista de Producto, quiero poblar el catálogo de base de datos con preguntas comportamentales (observables, no prescriptivas) para las 29 dimensiones.
* **Criterios de Aceptación:**
  - Script de seed o archivo JSON/TS verificado importando 100 preguntas.
  - Cada pregunta posee `dimension`, `frameworks`, `cognitive_cost` (1-5), `options` con sus vectores de señal, y condiciones de seguimiento (`follow_up_conditions`).
* **Estimación:** 8 Puntos ( Trabajo intensivo de contenido estratégico y modelado).

---

## Epic 3: Motor de Diagnóstico Híbrido Desacoplado (Fase 3)

### US-301: Gestor de Estado y Cobertura (`lib/engine/state.ts`)
* **Descripción:** Como Ingeniero Backend, quiero que cada sesión calcule su porcentaje de cobertura ontológica y detecte contradicciones sin llamar a OpenAI.
* **Criterios de Aceptación:**
  - Función `updateSessionState(session, newLog)` actualiza `coverage_map` en tiempo real.
  - Alerta de Parada Anticipada si en nivel *Express* se alcanza una confianza >85% en las 8 dimensiones críticas al superar la pregunta 15.
* **Estimación:** 5 Puntos.

### US-302: Motor Determinista de Scoring (`lib/engine/scoring.ts`)
* **Descripción:** Como Arquitecto de Producto, quiero reemplazar el score inventado de IA por un motor de puntuación de 1 a 100 100% auditable y determinista.
* **Criterios de Aceptación:**
  - El cálculo combina las notas ponderadas de las dimensiones VRIO, Digital, IA, Operativa y Cultura.
  - Pruebas unitarias en Vitest demuestran que 3 empresas simuladas con mismas respuestas reciben el mismo puntaje exacto al centavo.
* **Estimación:** 5 Puntos.

### US-303: Selector Adaptativo de Preguntas Anti-Redundancia
* **Descripción:** Como Desarrollador, quiero un módulo de selección de preguntas que evite preguntas repetitivas o del mismo grupo de redundancia.
* **Criterios de Aceptación:**
  - El selector lee de `question_catalog` descartando preguntas del mismo `redundancy_group` ya respondidas.
  - Prioriza dimensiones con menor porcentaje de cobertura en `coverage_map`.
* **Estimación:** 5 Puntos.

---

## Epic 4: Catálogo Vegen, Oportunidades y Crítico (Fase 4)

### US-401: Generador de Candidatas y Motor de Evaluación (8 Criterios)
* **Descripción:** Como Especialista Estratégico, quiero que la IA proponga 6 a 10 ideas preliminares y el backend las califique por impacto, viabilidad, riesgo y Vegen fit.
* **Criterios de Aceptación:**
  - Las oportunidades candidatas se guardan temporal o transaccionalmente en `opportunity_candidates`.
  - Cada candidato recibe puntuación numérica en los 8 ejes del pliegos y un score total ponderado.
* **Estimación:** 5 Puntos.

### US-402: Crítico de Calidad y Filtro Anti-Genéricos (`lib/engine/critic.ts`)
* **Descripción:** Como Product Owner de Vegen, quiero un evaluador que rechace automáticamente propuestas superficiales o repetidas y seleccione las 3 mejores con diversidad estratégica.
* **Criterios de Aceptación:**
  - El crítico verifica que haya 1 Quick Win (bajo riesgo/TTV rápido), 1 Estructual (procesos/Sistemas VRIO) y 1 Transformational (IA/Plataformas/Value Lab).
  - Rechaza y solicita re-evaluación al LLM si el título o contenido carece de mención explícita al contexto o sector del cliente.
* **Estimación:** 5 Puntos.

---

## Epic 5: Seguridad, RLS y Consola Competitiva (Fase 5)

### US-501: Cierre de Seguridad y Políticas RLS en Supabase
* **Descripción:** Como Responsable de Seguridad, quiero activar `ENABLE ROW LEVEL SECURITY` en producción en todas las tablas para bloquear accesos anónimos ilícitos al CRM.
* **Criterios de Aceptación:**
  - Tablas `leads` y `kanban_board` rechazan cualquier `SELECT`/`INSERT` directo desde clientes anónimos (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - Las interacciones comerciales desde la UI transitan por un endpoint seguro de servidor (`app/api/lead`) o Server Actions autenticadas.
* **Estimación:** 3 Puntos.

### US-502: Dashboard Analítico de Inteligencia de Mercado (Next.js Server Component)
* **Descripción:** Como Director Comercial de Vegen, quiero un tablero Kanban y Analítico que no se descargue a memoria en cliente, sino que se procese de forma ultra-rápida y segura en el servidor.
* **Criterios de Aceptación:**
  - Refactor de `app/admin/dashboard/page.tsx` hacia Server Component con autenticación administrativa de Supabase Auth.
  - Módulo visual que agrega y compara qué áreas estratégicas de Vegen (Sistemas, Mkt, Data, IA) son más demandadas por sector industrial.
* **Estimación:** 5 Puntos.
