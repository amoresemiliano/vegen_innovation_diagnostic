# Propuesta de Modelo de Datos y Seguridad (Fase 0 - Motor V2)

> [!IMPORTANT]
> Documento de diseño de Fase 0. Su contenido constituye una propuesta inicial y no una arquitectura definitivamente aprobada. La ontología, las ponderaciones, el modelo de datos, el health score, las soluciones asociadas y la migración SQL requieren revisión metodológica y técnica posterior.

## 1. Análisis de Brecha (Current Schema vs. Target Engine)
El esquema actual (confirmado mediante catálogo de Supabase en `0000_current_schema_snapshot.sql`) contiene cuatro tablas básicas: `leads`, `sessions`, `framework_logs` y `kanban_board`.

Para soportar el Motor Híbrido sin romper transitoriedades ni destruir datos, se propone un modelo de **Evolución No Destructiva**:
1. Mantener intactos los identificadores UUID, claves foráneas y registros históricos existentes.
2. Añadir columnas especializadas (JSONB y tipadas) a `sessions` y `framework_logs` para capturar el estado estructurado, cobertura y telemetría analítica sin perder la respuesta de texto original.
3. Introducir dos nuevas tablas transaccionales y de catálogo: `question_catalog` (biblioteca de preguntas con sus metadatos estratégicos VRIO/UdeSA) y `opportunity_candidates` (para el registro de las 6 a 10 oportunidades intermedias y la evaluación del crítico de calidad).
4. Implementar políticas Row Level Security (RLS) de Mínimo Privilegio.

---

## 2. Propuesta de Estructura SQL de la Migración V2 (`0001_engine_v2_schema_proposal.sql`)

> **AVISO DE SEGURIDAD:** Este diseño se encuentra en el archivo de propuesta `supabase/proposals/0001_engine_v2_schema_proposal.sql`. **NO DEBE EJECUTARSE EN PRODUCCIÓN TODAVÍA** sin tu orden expresa en la Fase 1C.

### A. Nuevas Tablas y Ampliaciones Relacionales

```sql
-- 1. Ampliación No Destructiva sobre public.sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS state_vector jsonb DEFAULT '{}'::jsonb,      -- Hipótesis, señales detectadas y contradicciones
  ADD COLUMN IF NOT EXISTS coverage_map jsonb DEFAULT '{}'::jsonb,      -- Mapeo 0-100% de las 29 dimensiones ontológicas
  ADD COLUMN IF NOT EXISTS health_score_details jsonb DEFAULT '{}'::jsonb, -- Puntajes deterministas por dimensión (VRIO, IA, etc.)
  ADD COLUMN IF NOT EXISTS firmographics_meta jsonb DEFAULT '{}'::jsonb,   -- Tamaño, B2B/B2C, sedes, canales, rol
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress';            -- 'in_progress', 'needs_clarification', 'completed', 'abandoned'

-- 2. Ampliación No Destructiva sobre public.framework_logs
ALTER TABLE public.framework_logs
  ADD COLUMN IF NOT EXISTS dimension_tag text NULL,                     -- Dimensión ontológica de la pregunta (ej. 'madurez_ia')
  ADD COLUMN IF NOT EXISTS question_id uuid NULL,                       -- Referencia opcional al catálogo de preguntas
  ADD COLUMN IF NOT EXISTS extracted_signals jsonb DEFAULT '[]'::jsonb, -- Hechos observables extraídos por IA
  ADD COLUMN IF NOT EXISTS time_spent_sec int4 NULL,                    -- Telemetría de coste cognitivo / tiempo de respuesta
  ADD COLUMN IF NOT EXISTS is_follow_up bool DEFAULT false;             -- Si fue una pregunta de seguimiento por aclaración

-- 3. Nueva Tabla de Catálogo de Preguntas (Metadatos)
CREATE TABLE IF NOT EXISTS public.question_catalog (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    dimension text NOT NULL,                                            -- De las 29 dimensiones de la ontología
    frameworks text[] NOT NULL DEFAULT '{}',                            -- Lista de los 20 frameworks asociados
    target_objective text NOT NULL,                                     -- Objetivo estratégico de la indagación
    diagnostic_levels text[] NOT NULL DEFAULT '{"express","business","transformation"}',
    question_type text NOT NULL DEFAULT 'single_select',                -- 'single_select', 'multi_select', 'scale', 'short_text'
    question_text text NOT NULL,
    options jsonb NOT NULL DEFAULT '[]'::jsonb,                         -- Opciones con sus señales algebraicas emparejadas
    weight numeric(4,2) NOT NULL DEFAULT 1.0,                           -- Peso en el scoring determinista
    redundancy_group text NULL,                                         -- Grupo para prevenir preguntas similares
    follow_up_conditions jsonb NULL,                                    -- Criterio para lanzar repregunta de profundización
    exclusion_conditions jsonb NULL,                                    -- Criterio para omitir (ej. no preguntar por tiendas si es digital puro)
    sensitivity_level int2 NOT NULL DEFAULT 1,                          -- 1: Bajo, 2: Medio, 3: Alto (Financiero/Ego)
    cognitive_cost int2 NOT NULL DEFAULT 1,                             -- Coste mental 1 al 5
    is_active bool NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT question_catalog_pkey PRIMARY KEY (id)
);

-- 4. Nueva Tabla: Candidatos de Oportunidades y Crítico de Calidad
CREATE TABLE IF NOT EXISTS public.opportunity_candidates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    title text NOT NULL,
    category_area text NOT NULL,                                        -- Las 4 áreas del catálogo Vegen
    vegen_capabilities text[] NOT NULL DEFAULT '{}',                    -- Sub-capacidades concretas (ej. 'dashboards', 'api')
    impact_score int2 NOT NULL,                                         -- Puntuaciones 1 a 10
    evidence_score int2 NOT NULL,
    strategic_fit int2 NOT NULL,
    viability_score int2 NOT NULL,
    urgency_score int2 NOT NULL,
    time_to_value int2 NOT NULL,
    risk_level int2 NOT NULL,
    vegen_fit int2 NOT NULL,
    total_weighted_score numeric(6,2) NOT NULL,                         -- Cálculo algebraico ponderado
    critic_verdict text NOT NULL DEFAULT 'pending',                     -- 'approved_quick_win', 'approved_structural', 'approved_transformational', 'rejected_generic', 'rejected_duplicate'
    critic_notes text NULL,                                             -- Razonamiento de por qué el crítico rechazó o aprobó
    proposal_payload jsonb NULL,                                        -- Estructura completa (MVP, indicadores, riesgos, próximo paso)
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT opportunity_candidates_pkey PRIMARY KEY (id)
);

-- Índices de Rendimiento para Analítica y Motor
CREATE INDEX IF NOT EXISTS idx_sessions_status_level ON public.sessions(status, level);
CREATE INDEX IF NOT EXISTS idx_logs_session_dimension ON public.framework_logs(session_id, dimension_tag);
CREATE INDEX IF NOT EXISTS idx_catalog_dimension_active ON public.question_catalog(dimension, is_active);
CREATE INDEX IF NOT EXISTS idx_candidates_session_verdict ON public.opportunity_candidates(session_id, critic_verdict);
```

---

## 3. Estrategia de Seguridad y Políticas RLS (Mínimo Privilegio)

En el esquema actual RLS está deshabilitado. La activación en V2 se hará bajo el siguiente contrato estricto de seguridad:

```sql
-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_candidates ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Seguridad de Mínimo Privilegio

-- A) LEADS & KANBAN: Exclusivo para Administradores Autenticados en Supabase Auth
-- Nadie desde internet (anon) puede consultar ni escribir el CRM directamente sin pasar por backend seguro.
CREATE POLICY admin_all_leads ON public.leads
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@vegendigital.com'));

CREATE POLICY admin_all_kanban ON public.kanban_board
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@vegendigital.com'));

-- B) QUESTION CATALOG: Lectura pública (anónimo) para consultar preguntas, modificación solo Admin.
CREATE POLICY anon_read_catalog ON public.question_catalog
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- C) SESSIONS & LOGS & CANDIDates: Aislamiento por Token de Sesión
-- Permitir al cliente crear sesiones, pero solo modificar o leer su propia sesión activa
CREATE POLICY anon_create_session ON public.sessions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY anon_read_own_session ON public.sessions
  FOR SELECT TO anon
  USING (id::text = current_setting('request.headers')::json->>'x-session-id');

-- El backend de Next.js (Server Actions) utilizará transacciones validadas al finalizar el diagnóstico
-- para enlazar el lead con la sesión de forma atómica.
```

---

## 4. Plan de Rollback y Tolerancia a Fallos
* Al no eliminar ninguna columna ni tabla del MVP en este diseño (`leads.nombre`, `sessions.proposals`, etc.), el código anterior podrá seguir funcionando ininterrumpidamente durante la transición.
* Si durante las pruebas en un entorno de staging la migración `0001_engine_v2_target_schema.sql` presentara fricciones, el script de rollback consistirá en un simple `DROP TABLE IF EXISTS opportunity_candidates, question_catalog; ALTER TABLE sessions DROP COLUMN state_vector...`, devolviendo la base de datos a la fotografía exacta capturada en el Baseline de la Fase 0 sin alterar un solo dato de cliente.
