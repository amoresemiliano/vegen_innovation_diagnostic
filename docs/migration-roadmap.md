# Hoja de Ruta de Migración (Migration Roadmap V2)

## 1. Estrategia de Transición Sin Cierre de Operaciones (Zero-Downtime)
La migración de la aplicación web Vegen Innovation Diagnostic al Motor Híbrido V2 se ejecutará siguiendo el patrón **Strangler Fig (Higuera Estranguladora)** y el principio de **Migración No Destructiva** de Vegen Digital.

En ningún momento se detendrá el servicio web ni se alterará abruptamente el flujo que hoy utilizan las PyMEs o el equipo comercial en la calle.

```
[ Estado Actual: Monolito MVP (V1) ] 
       │
       ▼  (Fase 1 & 2: Cimientos, Base de Datos Aditiva y Repositorios)
[ Estado Coeficiente: V1 Activo + Infraestructura V2 en Paralelo ] 
       │
       ▼  (Fase 3 & 4: Activación Modular de Motor por Feature Flag)
[ Estado de Convivencia: Motor V2 para nuevas sesiones / V1 de solo lectura ] 
       │
       ▼  (Fase 5: Corte Definitivo, Cierre RLS y Dashboard Competitivo)
[ Estado Objetivo: Motor Híbrido Desacoplado 100% Operativo ]
```

---

## 2. Planificación en 5 Fases Secuenciales

### Fase 1: Cimientos Arquitectónicos y Quick Wins (Siguiente Paso Inmediato)
* **Objetivo:** Preparar el repositorio para desarrollo modular continuo sin deudas de infraestructura.
* **Entregables:**
  1. Inicialización formal de ESLint (aplicada preliminarmente en Fase 0).
  2. Implementación de capa de abstracción de clientes Supabase (`lib/supabase/client.ts` y `lib/supabase/server.ts`).
  3. Estructuración del árbol de carpetas por dominios (`lib/domain/`, `lib/engine/`, `lib/repositories/`, `lib/schemas/`).
  4. Ejecución controlada en entorno de pruebas de la migración `0001_engine_v2_schema_proposal.sql` (columnas aditivas y nuevas tablas).
  5. Configuración de infraestructura de pruebas unitarias y de integración (Vitest / Jest con TypeScript).

### Fase 2: Codificación Ontológica y Catálogo de Preguntas
* **Objetivo:** Trasplantar el conocimiento estratégico de los 20 frameworks de UdeSA/Vegen Digital a estructuras de datos transaccionables en servidor.
* **Entregables:**
  1. Codificación en TypeScript y Seed SQL de las **29 Dimensiones Ontológicas** (`lib/domain/ontology.ts`).
  2. Carga en la tabla `question_catalog` de las primeras 100 preguntas comportamentales pre-aprobadas (sin prescripción ni alucinación), categorizadas por dimensión, coste cognitivo y señales de evidencia.
  3. Implementación del Repositorio de Catálogos (`lib/repositories/catalog.ts`) protegido por esquemas de validación Zod.

### Fase 3: Implementación del Motor Híbrido (Inteligencia Desacoplada)
* **Objetivo:** Reemplazar el prompt monolítico de `app/api/diagnostic/route.ts` por un flujo modular en etapas.
* **Entregables:**
  1. **Gestor de Estado y Cobertura (`lib/engine/state.ts`):** Seguimiento del mapa 0-100% por dimensión e identificación de contradicciones.
  2. **Selector de Preguntas (`lib/engine/selector.ts`):** Algoritmo adaptativo que escoge preguntas del catálogo sin redundancia.
  3. **Scoring Determinista (`lib/engine/scoring.ts`):** Reemplazo definitivo del score inventado ("65") por una función pura demostrable basada en vectores VRIO, IA, Deuda Psicológica y Eficiencia Operativa.
  4. **Interpretador de Respuestas LLM (`lib/ai/prompts/interpreter.ts`):** Prompt acotado única y estrictamente a extraer hechos y señales algebraicas de respuestas libres.
  5. Pruebas unitarias al 100% sobre el motor matemático de scoring.

### Fase 4: Catálogo de Soluciones Vegen, Crítico de Calidad y Síntesis
* **Objetivo:** Asegurar que las 3 propuestas entregadas al empresario sean impactantes, veraces, ejecutables y vinculadas directamente al portafolio real de Vegen Digital SL.
* **Entregables:**
  1. Codificación del Catálogo de Soluciones Vegen y sus capacidades (`Sistemas y Desarrollo`, `Marketing Digital`, `Data & Analítica`, `Inteligencia Artificial`).
  2. Implementación del **Generador de Oportunidades Candidatas** (pool de 6 a 10 propuestas puntuadas por 8 criterios: impacto, evidencia, encaje, viabilidad, urgencia, TTV, riesgo y Vegen fit).
  3. Implementación del **Crítico de Calidad (`lib/engine/critic.ts`)**: Agente evaluador que rechaza propuestas genéricas ("hacer un dashboard", "hacer marketing") y fuerza re-generación con especificidad de industria.
  4. Flujo de Síntesis Previa: Pantalla de confirmación del empresario antes de solicitar el formulario final de contacto.

### Fase 5: Seguridad Estricta (RLS) y Consola de Inteligencia de Mercado
* **Objetivo:** Cierre absoluto de seguridad del CRM e Inteligencia Comercial avanzada en el Dashboard.
* **Entregables:**
  1. Migración del Dashboard (`app/admin/dashboard`) a Server Components autenticados de Next.js, eliminando queries directas al navegador.
  2. Activación definitiva en producción de **Row Level Security (RLS)** en Supabase, revocando permisos públicos en `leads` y `kanban_board`.
  3. Evolución del Kanban para mostrar vectores de fricción y demanda por industria (HORECA vs Retail) basados en la ontología V2.
  4. Retirada de código heredado de la V1 y limpieza final (*Decommissioning*).
