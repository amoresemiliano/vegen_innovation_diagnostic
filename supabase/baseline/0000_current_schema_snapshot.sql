-- ==============================================================================
-- BASELINE DOCUMENTAL DE ESTRUCTURA ACTUAL DE SUPABASE (FASE 0 - SNAPSHOT)
-- ==============================================================================
-- IMPORTANTE:
-- 1. Este archivo es una FOTOGRAFÍA REPRODUCIBLE del estado actual (Baseline).
-- 2. NO ES UNA MIGRACIÓN que deba ejecutarse automáticamente sobre producción.
-- 3. Documenta la estructura real obtenida del catálogo (information_schema,
--    pg_indexes, pg_policies, pg_class) de Supabase en agosto de 2026.
-- 4. Actualmente ROW LEVEL SECURITY (RLS) ESTÁ DESHABILITADO en todas las tablas
--    y no existen políticas ni triggers en el esquema public.
-- 5. No aplicar sobre la base de datos existente sin revisión previa.
-- ==============================================================================

-- Extensiones y esquema: PostgreSQL gestionado por Supabase (uuid en gen_random_uuid())
CREATE SCHEMA IF NOT EXISTS public;

-- ------------------------------------------------------------------------------
-- 1. TABLA public.leads
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL,
    nombre text NULL,
    empresa text NULL,
    email text NULL,
    whatsapp text NULL,
    ubicacion text NULL DEFAULT 'España',
    status text NULL DEFAULT '1_nuevo',
    industria text NULL,
    CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- Índice unique sobre email (permite múltiples NULL según estándar PostgreSQL)
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_key ON public.leads USING btree (email);

-- ESTADO RLS CONFIRMADO: Deshabilitado (Sin políticas)
-- ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY; -- (Desactivado actualmente)


-- ------------------------------------------------------------------------------
-- 2. TABLA public.sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lead_id uuid NULL,
    level int4 NOT NULL,
    business_context jsonb NULL,
    progress_step int4 NULL DEFAULT 0,
    is_completed bool NULL DEFAULT false,
    proposals jsonb NULL,
    created_at timestamptz NULL,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessions_lead_id_fkey FOREIGN KEY (lead_id) 
        REFERENCES public.leads(id) ON UPDATE NO ACTION ON DELETE SET NULL
);

-- ESTADO RLS CONFIRMADO: Deshabilitado (Sin políticas, sin índice explícito en lead_id)


-- ------------------------------------------------------------------------------
-- 3. TABLA public.framework_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.framework_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NULL,
    step_number int4 NOT NULL,
    framework_tag text NOT NULL,
    question_text text NOT NULL,
    answer_text text NOT NULL,
    score_vector jsonb NULL,
    created_at timestamptz NULL,
    CONSTRAINT framework_logs_pkey PRIMARY KEY (id),
    CONSTRAINT framework_logs_session_id_fkey FOREIGN KEY (session_id) 
        REFERENCES public.sessions(id) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- ESTADO RLS CONFIRMADO: Deshabilitado (Sin políticas, sin restricción unique sobre session_id + step_number)


-- ------------------------------------------------------------------------------
-- 4. TABLA public.kanban_board
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kanban_board (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lead_id uuid NULL,
    status text NULL DEFAULT '1_nuevo',
    last_interaction timestamptz NULL,
    CONSTRAINT kanban_board_pkey PRIMARY KEY (id),
    CONSTRAINT kanban_board_lead_id_fkey FOREIGN KEY (lead_id) 
        REFERENCES public.leads(id) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- ESTADO RLS CONFIRMADO: Deshabilitado (Sin políticas)


-- ==============================================================================
-- RESUMEN DE SEGURIDAD Y DEUDA TÉCNICA VERIFICADA AL CREAR ESTE SNAPSHOT:
-- * RLS deshabilitado en leads, sessions, framework_logs y kanban_board.
-- * No se registraron triggers vigentes ni restricciones CHECK.
-- * Toda alteración futura a este esquema se gestionará en /supabase/migrations/
-- ==============================================================================
