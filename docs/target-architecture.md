# Arquitectura Objetivo: Motor Híbrido de Diagnóstico Vegen V2

> [!IMPORTANT]
> Documento de diseño de Fase 0. Su contenido constituye una propuesta inicial y no una arquitectura definitivamente aprobada. La ontología, las ponderaciones, el modelo de datos, el health score, las soluciones asociadas y la migración SQL requieren revisión metodológica y técnica posterior.

## 1. Visión y Principio Fundamental de Diseño
La arquitectura objetivo transforma Vegen Innovation Diagnostic de un prototipo guiado por un único prompt de IA en un **Motor Híbrido de Inteligencia de Negocio y Transformación Digital**.

> **PRINCIPIO FUNDAMENTAL:** No existirá jamás un único prompt gigantesco que ejecute el flujo en un solo paso. La inteligencia artificial debe orquestarse como un conjunto de módulos especializados combinados con lógica determinista y una metodología estratégica estrictamente codificada en el servidor.

---

## 2. Desacoplamiento en 9 Capas Especializadas

```
                                    [ Cliente Web (UI React / Next.js) ]
                                                    │
                                                    ▼ (HTTPS / API Routes Seguras)
                                     ┌──────────────────────────────┐
                                     │  Capa de Control & Auth RLS   │
                                     └──────────────┬───────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             ▼                                      ▼                                      ▼
┌─────────────────────────┐            ┌─────────────────────────┐            ┌─────────────────────────┐
│ 1. Estado de Sesión     │            │ 2. Interpretación de    │            │ 3. Selección de         │
│ (Hipótesis, Señales,    │◄───────────┤    Respuestas (IA LLM)  │            │    Preguntas (Catálogo  │
│  Cobertura, Ontología)  │            │ (Extracción de Hechos)  │            │    + Metadatos VRIO)    │
└────────────┬────────────┘            └─────────────────────────┘            └────────────▲────────────┘
             │                                                                             │
             ├──────────────────────────────────────┐                                      │
             ▼                                      ▼                                      │
┌─────────────────────────┐            ┌─────────────────────────┐                         │
│ 4. Scoring Determinista │            │ 5. Generación de        │                         │
│ (Funciones Puras /      │            │    Oportunidades        │                         │
│  Vector de Madurez)     │            │    (6 a 10 Candidatas)  │                         │
└────────────┬────────────┘            └────────────┬────────────┘                         │
             │                                      │                                      │
             │                                      ▼                                      │
             │                         ┌─────────────────────────┐                         │
             │                         │ 6. Crítico de Calidad   │ ──(Si falla, regenera)──┘
             │                         │ (Filtro Anti-Genéricos) │
             │                         └────────────┬────────────┘
             │                                      │
             ▼                                      ▼
┌─────────────────────────┐            ┌─────────────────────────┐            ┌─────────────────────────┐
│ 8. Analítica de Mercado │            │ 7. Producción del       │            │ 9. Captura Comercial    │
│ (Dashboard Inteligente  │◄───────────┤    Informe (PDF /       │───────────►│ (Consentimiento,       │
│  & Trazabilidad ML)     │            │    Síntesis 3 Propuestas│            │  Firmografía & CRM)     │
└─────────────────────────┘            └─────────────────────────┘            └─────────────────────────┘
```

### Descripción Detallada de las 9 Capas
1. **Estado de Sesión (Session State Manager):** Almacena un estado estructurado (`HypothesesState`, `SignalsDetected`, `CoverageMap`, `ContradictionMatrix`) en lugar de texto plano. Sabe en todo momento qué dimensiones de los 20 frameworks se han evaluado con suficiencia estadística y cuáles requieren profundización.
2. **Interpretación de Respuestas (Response Interpreter):** Un agente LLM especializado en extraer señales, hechos observables y detectar contradicciones (ej. *"Dice tener alta madurez digital pero en la pregunta 4 declaró que su facturación depende de plantillas Excel manuales"*). No genera preguntas ni propuestas; solo interpreta hechos al vector de estado.
3. **Selección de Preguntas (Question Selector):** Motor híbrido que consulta un catálogo de preguntas pre-aprobadas y codificadas con metadatos de los 20 frameworks de UdeSA/Vegen. Selecciona la pregunta más óptima en función de las brechas de cobertura, el coste cognitivo y el grupo de redundancia.
4. **Scoring Determinista (Deterministic Scoring Engine):** Funciones puras de TypeScript (`lib/engine/scoring.ts`). No depende de alucinaciones de IA. Toma el vector de señales y calcula métricas claras por dimensión (ej. `madurez_ia`, `eficiencia_operativa`, `deuda_psicologica`, `riesgo_disrupcion`), generando el *Health Score* verificable.
5. **Generación de Oportunidades (Opportunity Generator):** Cuando se alcanza la cobertura o el tope del contrato de profundidad, un módulo toma el Catálogo Modular de Soluciones Vegen y genera un pool preliminar de 6 a 10 oportunidades candidatas contextualizadas.
6. **Crítico de Calidad (Quality Critic & Evaluator):** Un módulo evaluador (IA + reglas estrictas) inspecciona las 6-10 candidatas, rechaza aquellas genéricas, duplicadas, sin evidencia empírica suficiente o inviables, y selecciona las **3 propuestas finales diferenciadas**: una de valor rápido (Quick Win), una estructural y una transformacional.
7. **Producción del Informe (Report Producer):** Compila la síntesis estructurada del diagnóstico para su validación o corrección por parte de la PyME, y prepara la salida para la renderización de reportes (web, PDF de alta definición o envío por correo/WhatsApp).
8. **Analítica de Mercado (Market & Commercial Analytics):** Almacena en la base de datos no solo respuestas, sino vectores de demanda, mapeo de fricciones y telemetría por industria (HORECA, Decoración, Retail), transformando el dashboard administrativo en una consola de inteligencia competitiva para Vegen Digital.
9. **Captura Comercial (Commercial Lead Processing):** Solicita datos firmográficos y personales únicamente tras demostrar valor (al mostrar el resumen conclusivo), integrándose de forma segura con el CRM (tabla `leads` y `kanban_board`) mediante transacciones de servidor protegidas.

---

## 3. Propuesta de Estructura de Directorios Objetivo (Clean Modular Tree)

Para erradicar el acoplamiento actual y cumplir los estándares de ingeniería de Vegen Digital (aislamiento modular), el proyecto migrará progresivamente al siguiente árbol de directorios:

```
vegen_innovation_diagnostic/
├── app/                        # Next.js App Router (Rutas de Interfaz y API)
│   ├── api/                    # Endpoints Seguros del Backend
│   │   ├── session/            # Gestión de Sesión e Inicio
│   │   ├── step/               # Procesamiento de Respuesta y Siguiente Pregunta
│   │   ├── conclude/           # Generación de Propuestas y Crítico de Calidad
│   │   └── lead/               # Captura segura de prospectos
│   ├── admin/                  # Dashboard (Protegido por Middleware Auth)
│   └── page.tsx                # Landing Page Principal
├── components/                 # Componentes React (Presentación pura)
│   ├── diagnostic/             # Subcomponentes del Wizard (QuestionCard, OptionSelector, Progress)
│   ├── proposals/              # Visualización de Oportunidades y Resultados
│   └── admin/                  # Componentes de UI para el Dashboard Kanban & Métricas
├── lib/                        # Capa Core y Lógica de Negocio (Backend / Frontend neutral)
│   ├── domain/                 # Definiciones Ontológicas y Frameworks
│   │   ├── ontology.ts         # Las 29 Dimensiones Empresariales
│   │   ├── frameworks.ts       # Mapeo de los 20 Frameworks Estratégicos
│   │   └── catalog.ts          # Catálogo Modular Vegen (Las 4 Áreas Core)
│   ├── engine/                 # Motor Híbrido de Diagnóstico
│   │   ├── state.ts            # Gestor del Estado de Sesión e Hipótesis
│   │   ├── selector.ts         # Selección Adaptativa de Preguntas (Anti-redundancia)
│   │   ├── scoring.ts          # Funciones Puras Deterministas de Puntuación
│   │   └── critic.ts           # Crítico y Evaluador de Calidad de Propuestas
│   ├── ai/                     # Integraciones LLM Aisladas
│   │   ├── client.ts           # Cliente OpenAI (Lazy Init / Safe Env)
│   │   ├── prompts/            # Plantillas Modulares Especificadas por Agente
│   │   └── parser.ts           # Extracción y Validación de Salidas Estructuradas JSON
│   ├── repositories/           # Capa de Acceso a Datos (Abstracting Supabase)
│   │   ├── sessions.ts         # Operaciones seguras sobre sesiones y logs
│   │   ├── leads.ts            # Operaciones de CRM y Kanban
│   │   └── catalog.ts          # Repositorio de lecturas de preguntas y soluciones
│   ├── schemas/                # Validación Estricta (Zod Payloads)
│   │   ├── diagnostic.ts       # Esquemas para DTOs de peticiones/respuestas
│   │   └── database.ts         # Tipado estrito inferido para tablas de Supabase
│   └── supabase/               # Configuración de Clientes
│       ├── client.ts           # Cliente Browser Anónmo (RLS Restrito)
│       └── server.ts           # Cliente Servidor (Auth/Service Role controlado)
├── supabase/                   # Gestión de Esquemas de Base de Datos
│   ├── baseline/               # Fotografía Documental (0000_current_schema_snapshot.sql)
│   └── migrations/             # Scripts SQL Reversibles Versionados (0001_v2_engine.sql)
├── tests/                      # Suite de Calidad (Pruebas Automatizadas)
│   ├── unit/                   # Pruebas de Funciones Puras (scoring.ts, selector.ts)
│   ├── integration/            # Pruebas de APIs y Flujos con Datos Seed
│   └── fixtures/               # Datos de prueba (PyME Gastronómica, Retail, etc.)
└── docs/                       # Documentación Técnica Formal (Fase 0 y posteriores)
```

---

## 4. Estrategia de Seguridad, RLS y Autenticación
* **Aislamiento del Navegador:** El navegador (Client Components) únicamente tendrá permiso RLS de lectura/escritura sobre el registro de sesión que está respondiendo en ese instante (mediante un token de sesión anónimo encriptado en cookie o JWT del servidor). Jamás se ejecutarán queries `select('*')` masivas desde el cliente web.
* **Mínimo Privilegio (RLS):** Las tablas `leads`, `kanban_board` y lecturas agregadas de `framework_logs` estarán protegidas con políticas de seguridad a nivel de fila (`ENABLE ROW LEVEL SECURITY`) restringidas a usuarios autenticados con rol administrativo (`auth.uid() IN (SELECT user_id FROM admin_users)`).
* **Service Role Restrito:** La clave `SUPABASE_SERVICE_ROLE_KEY` quedará absolutamente prohibida en el código cliente y no será el comodín para evitar escribir buenas políticas RLS en el dashboard. Su uso se restringirá exclusivamente al entorno de servidor backend (`app/api/`) para transacciones internas de consolidación del motor y telemetría analítica.
