-- ==============================================================================
-- DRAFT / PROPOSAL - NO APPROVED - DO NOT EXECUTE
-- ==============================================================================
-- IMPORTANTE:
-- 1. Este archivo contiene un modelo incompleto sujeto a revisión (DRAFT / PROPOSAL).
-- 2. NO APPROVED - DO NOT EXECUTE por Supabase CLI, consolas ni otras herramientas.
-- 3. No representa todavía el esquema definitivo para la plataforma Vegen Digital.
-- 4. No incluye todavía todas las entidades requeridas (ej. revisión humana, GDPR, versión de prompt/metodología).
-- 5. No debe moverse a la carpeta supabase/migrations hasta superar satisfactoriamente la Fase 1C.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AMPLIACIONES NO DESTRUCTIVAS EN TABLAS EXISTENTES (PROPUESTA)
-- ------------------------------------------------------------------------------

-- Tabla public.sessions: Añadir vectores de estado y metadatos de ontología
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS state_vector jsonb DEFAULT '{}'::jsonb,      -- Hipótesis, señales detectadas y contradicciones
  ADD COLUMN IF NOT EXISTS coverage_map jsonb DEFAULT '{}'::jsonb,      -- Mapeo 0-100% de las 29 dimensiones ontológicas
  ADD COLUMN IF NOT EXISTS health_score_details jsonb DEFAULT '{}'::jsonb, -- Puntajes deterministas por dimensión (VRIO, IA, etc.)
  ADD COLUMN IF NOT EXISTS firmographics_meta jsonb DEFAULT '{}'::jsonb,   -- Tamaño, B2B/B2C, sedes, canales, rol
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress';            -- 'in_progress', 'needs_clarification', 'completed', 'abandoned'

-- Tabla public.framework_logs: Enriquecer con telemetría y metadatos ontológicos
ALTER TABLE public.framework_logs
  ADD COLUMN IF NOT EXISTS dimension_tag text NULL,                     -- Dimensión ontológica (ej. 'madurez_ia', 'capacidades_vrio')
  ADD COLUMN IF NOT EXISTS question_id uuid NULL,                       -- Referencia al catálogo de preguntas
  ADD COLUMN IF NOT EXISTS extracted_signals jsonb DEFAULT '[]'::jsonb, -- Hechos observables extraídos de la respuesta
  ADD COLUMN IF NOT EXISTS time_spent_sec int4 NULL,                    -- Telemetría de coste cognitivo / tiempo en responder
  ADD COLUMN IF NOT EXISTS is_follow_up bool DEFAULT false;             -- Si fue una pregunta de seguimiento por aclaración


-- ------------------------------------------------------------------------------
-- 2. NUEVAS TABLAS DE CATÁLOGO Y EVALUACIÓN ESTRATÉGICA (PROPUESTA)
-- ------------------------------------------------------------------------------

-- Catálogo Maestro de Preguntas Comportamentales y su Ponderación
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

-- Candidatos de Oportunidades y Resultados del Crítico de Calidad (8 Criterios)
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


-- ------------------------------------------------------------------------------
-- 3. ÍNDICES DE RENDIMIENTO Y OPTIMIZACIÓN EN SERVICIO
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sessions_status_level ON public.sessions(status, level);
CREATE INDEX IF NOT EXISTS idx_logs_session_dimension ON public.framework_logs(session_id, dimension_tag);
CREATE INDEX IF NOT EXISTS idx_catalog_dimension_active ON public.question_catalog(dimension, is_active);
CREATE INDEX IF NOT EXISTS idx_candidates_session_verdict ON public.opportunity_candidates(session_id, critic_verdict);


-- ==============================================================================
-- 4. ESTRATEGIA DE POLÍTICAS ROW LEVEL SECURITY (RLS) - PREPARADO PARA FASE 5
-- ==============================================================================
-- Nota: En cumplimiento con el mandato de Fase 0, NO ACTIVAMOS RLS aquí ni se ejecuta.
-- Estas instrucciones quedan como especificación ejecutable sujeta a revisión:
--
-- ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.framework_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.kanban_board ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.question_catalog ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.opportunity_candidates ENABLE ROW LEVEL SECURITY;
-- ==============================================================================
