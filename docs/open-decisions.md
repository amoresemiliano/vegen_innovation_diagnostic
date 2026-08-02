# Registro Formal de Decisiones Abiertas (Open Decisions Register)

> [!IMPORTANT]
> **ESTADO DE DISEÑO DE FASE 0 - PROPUESTA PRELIMINAR**
> Documento de diseño de Fase 0. Su contenido constituye una propuesta inicial y no una arquitectura definitivamente aprobada. La ontología, las ponderaciones, el modelo de datos, el health score, las soluciones asociadas y la migración SQL requieren revisión metodológica y técnica posterior.

Este documento cataloga y centraliza las determinaciones metodológicas, algorítmicas, normativas y de modelo de datos que quedan conscientemente abiertas al finalizar la Fase 0 de Vegen Innovation Diagnostic. Ninguna de estas decisiones deberá forzarse de manera prematura ni cerrarse sin la validación explicativa humana requerida.

---

## OD-001: Arquitectura del Score (Health Score Global vs. Perfil Multidimensional)
* **Descripción:** Decidir si el motor debe seguir comunicando un puntaje agregado de salud digital del 1 al 100 (*Health Score*) al finalizar el diagnóstico, o si debe reemplazarse por un perfil o radar multidimensional desacoplado sin un promedio global engañoso.
* **Estado:** `open`
* **Fase Prevista:** Fase 3 (Motor de Scoring Determinista).
* **Riesgo de Decidirla Prematuramente:** Fijar un score único puede simplificar excesivamente la realidad de la PyME (ej. tener 90 en Marketing y 10 en Seguridad arrojando un "50 Aceptable"), mientras que eliminarlo por completo podría reducir la fricción de enganche o competitividad en la venta comercial preliminar.
* **Evidencia Necesaria para Resolverla:** Análisis de conversión A/B o feedback directo del equipo comercial de Vegen Digital tras simular cierres de preventa usando reportes con nota global frente a reportes de tela de araña multidimensional sin promedio universal.

---

## OD-002: Revisión y Validación de la Ontología de 29 Dimensiones
* **Descripción:** Revisar y aprobar una por una las 29 dimensiones ontológicas propuestas, así como sus definiciones formales, los niveles mínimos de activación (*Express*, *Business*, *Transformation*) y su mapeo explícito hacia los 20 frameworks de la Universidad de San Andrés y Vegen.
* **Estado:** `open`
* **Fase Prevista:** Fase 2 (Codificación Ontológica y Catálogo de Preguntas).
* **Riesgo de Decidirla Prematuramente:** Codificar una ontología desbalanceada en el servidor podría generar huecos ciegos en la indagación o redundancias que provoquen fatiga cognitiva de los usuarios.
* **Evidencia Necesaria para Resolverla:** Sesión de revisión metodológica de Vegen Digital con el equipo de estrategia, contrastando las 29 dimensiones contra diagnósticos reales anteriores para confirmar que no falte ni sobre ninguna variable diagnóstica crítica.

---

## OD-003: Alineamiento Exhaustivo con el Catálogo Comercial Real de Vegen
* **Descripción:** Validar que cada una de las sub-capacidades y soluciones sugeridas por el motor en las matrices de oportunidades (ej. *Dashboards Gerenciales*, *Sistemas y Desarrollo*, *Mkt Digital Performance*, *IA RAG Interna*) permanezcan fielmente reflejadas en el portafolio comercial activo de Vegen Digital SL.
* **Estado:** `open`
* **Fase Prevista:** Fase 4 (Catálogo Vegen y Módulo Crítico de Propuestas).
* **Riesgo de Decidirla Prematuramente:** Sugerir en la interfaz una tecnología o servicio que Vegen no comercializa en la actualidad debilitaría la efectividad de la reunión comercial posterior o crearía falsas expectativas en el cliente, cometiendo el error del MVP heredado.
* **Evidencia Necesaria para Resolverla:** Matriz homologada firmada por la dirección comercial de Vegen Digital delimitando los servicios transaccionables, precios estimados, plazos (*Time-to-Value*) y requerimientos mínimos pre-venta para cada línea de servicio.

---

## OD-004: Grado de Normalización SQL (Tablas Relacionales vs. Columnas JSONB)
* **Descripción:** Decidir definitivamente qué entidades analíticas, temporales y transaccionales del motor deben materializarse en tablas relacionales formales con claves foráneas en PostgreSQL y cuáles deben conservarse como documentos dentro de columnas `JSONB`.
* **Estado:** `open`
* **Fase Prevista:** Fase 1C (Revisión y Aprobación de la Migración SQL).
* **Riesgo de Decidirla Prematuramente:** Sobrenormalizar en decenas de tablas saturará la latencia y las transacciones sin servidor (*Serverless*) en Next.js; subnormalizar masivamente en JSONB impedirá búsquedas eficaces en el CRM comercial del Dashboard o degradará la integridad referencial.
* **Evidencia Necesaria para Resolverla:** Peticiones de consulta (*queries*) reales especificadas por el tablero administrativo; evaluación de planes de ejecución (`EXPLAIN ANALYZE`) comparando filtrado JSONB mediante índice GIN contra uniones (`JOIN`) en tablas normalizadas.

---

## OD-005: Trazabilidad Formal Extensiva (Respuesta ➔ Señal ➔ Evidencia ➔ Hipótesis ➔ Decisión)
* **Descripción:** Diseñar el modelo relacional y de estructuras algebraicas que blinde la trazabilidad auditable de punta a punta: cómo una respuesta original genera una señal inferida, qué frase literal constituye la evidencia, qué hipótesis o contradicción detona y por qué el motor decidió lanzar la siguiente pregunta o propuesta.
* **Estado:** `open`
* **Fase Prevista:** Fase 3 (Motor Híbrido Desacoplado y Módulo de Estado).
* **Riesgo de Decidirla Prematuramente:** Implementar un esquema inflexible antes de ensayar el analizador de prompts (*Interpreter*) podría encarecer excesivamente el costo computacional o de tokens en la extracción continua por OpenAI.
* **Evidencia Necesaria para Resolverla:** Prototipo funcional y test de integración en Vitest con 5 transcripcones simuladas de entrevistas completas demostrando la reconstrucción del árbol de decisiones del motor de forma determinista y sin ambigüedad.

---

## OD-006: Consentimiento Legal (GDPR/LSSI) y Segregación de Entidades
* **Descripción:** Diseñar la arquitectura normativa de cumplimiento legal europea (GDPR / LSSI), definiendo la separación física o lógica entre los datos descriptivos de la empresa (*firmographies*), la identidad civil del contacto (*PII: email, teléfono, nombre*) y los datos anónimos de la sesión de diagnóstico, incorporando traza explícita de aceptación de términos y versiones del aviso de privacidad.
* **Estado:** `open`
* **Fase Prevista:** Fase 1C (Preparación DDL del esquema) y Fase 5 (Cierre RLS).
* **Riesgo de Decidirla Prematuramente:** Mezclar indiscriminadamente datos personales del empresario con datos estratégicos del negocio sin marcas temporales ni consentimiento versionado viola el principio de minimización y expone a Vegen a riesgos de cumplimiento ante auditorías de protección de datos.
* **Evidencia Necesaria para Resolverla:** Validación jurídica del texto de consentimiento informático y prueba arquitectónica en el DDL de tablas separando `companies`, `contacts` y `consent_logs` sin alterar la UX web.

---

## OD-007: Supervisión y Revisión Humana en el Dashboard (*Human-in-the-Loop*)
* **Descripción:** Diseñar el circuito donde un especialista o account manager de Vegen Digital interviene en el Dashboard administrativo para revisar, validar, calibrar o enriquecer una oportunidad propuesta por la IA antes de presentársela formalmente al cliente o generar el PDF definitivo de venta.
* **Estado:** `open`
* **Fase Prevista:** Fase 4 (Crítico de Calidad) y Fase 5 (Consola Analítica y CRM).
* **Riesgo de Decidirla Prematuramente:** Imponer aprobación humana obligatoria en tiempo real paralizaría el autoservicio instantáneo de la PyME en la web; ignorar por completo la supervisión impedirá el aprendizaje supervisado y la corrección de errores algorítmicos crónicos.
* **Evidencia Necesaria para Resolverla:** Definición procedimental del flujo comercial post-diagnóstico (ej: diagnóstico automático instantáneo en web con descargo preliminar, pero generación de propuesta técnica definitiva condicionada a firma digital del consultor de Vegen en el CRM).

---

## OD-008: Calibración Metodológica de Pesos, Coberturas y Suficiencia
* **Descripción:** Definir la matemática exacta que regirá la suficiencia estadística por dimensión, fijando en qué porcentaje del mapa de cobertura (`coverage_map`) se considera que el motor tiene certeza para dejar de indagar ese pilar, y cuál es la ponderación de las preguntas según su coste cognitivo.
* **Estado:** `open`
* **Fase Prevista:** Fase 3 (Motor Determinista de Scoring y Selector Adaptativo).
* **Riesgo de Decidirla Prematuramente:** Fijar umbrales irreales (ej. exigir 100% de cobertura en todo) alargará artificialmente las entrevistas provocando abandonos masivos; umbrales excesivamente bajos generarán diagnósticos superficiales idénticos a los de la V1.
* **Evidencia Necesaria para Resolverla:** Simulación Monte Carlo o corridas analíticas sobre el motor en pruebas local para observar la longitud promedio y calidad de salida de cuestionarios bajo diferentes umbrales (ej: 75% para Express vs. 90% para Transformation).

---

## OD-009: Políticas de Versionado Metodológico, Prompts, Modelos y Catálogos
* **Descripción:** Establecer la estrategia de inmutabilidad y versionado concurrente que permita coexistir diagnósticos generados con esquemas pasados (ej. `v1.0-mvp`, `v2.0-2026`) y diferentes motores LLM (ej. `gpt-4o`, `claude-3-5-sonnet`) sin corromper el cálculo de históricos ni el análisis evolutivo del mercado.
* **Estado:** `open`
* **Fase Prevista:** Fase 1B (Tipos de Dominio) y Fase 2 (Catálogo de Preguntas).
* **Riesgo de Decidirla Prematuramente:** Sobreescribir catálogos en caliente corrompería la interpretación de logs antiguos en `framework_logs`; un sistema de control de versiones excesivamente complejo ralentizaría el ritmo de despliegue continuo en Vercel.
* **Evidencia Necesaria para Resolverla:** Diseño de tablas de base con marca semántica explícita (`methodology_version`, `prompt_version`, `model_name`) verificado en un test de regresión que compare una sesión antigua con la versión más reciente del motor sin que varíe el resultado archivado.

---

## OD-010: Diseño Estricto de Seguridad (RLS, Auth y Acceso Anónmo) Previo a Producción
* **Descripción:** Diseñar y certificar las políticas *Row Level Security* (RLS) de Mínimo Privilegio sobre cada tabla de Supabase, determinando el mecanismo de aislamiento para transacciones de clientes anónimos en web (que completan el test en vivo) y la autenticación basada en claims o JWT de rol para la consola administrativa CRM de Vegen.
* **Estado:** `open`
* **Fase Prevista:** Fase 1A (Abstracción de clientes Supabase) y Fase 5 (Activación RLS en Producción).
* **Riesgo de Decidirla Prematuramente:** Activar RLS en caliente con reglas erróneas bloquearía la entrada de nuevos prospectos comerciales en internet o causaría denegaciones de servicio al intentar el guardado del progreso del test de innovación en curso.
* **Evidencia Necesaria para Resolverla:** Auditoría completa de peticiones HTTP en servidor vs. cliente, acompañada de pruebas de intrusión y verificación automatizada (utilizando roles emulados `anon` y `authenticated`) garantizando que ningún usuario externo pueda leer la lista `leads` o `sessions` ajenas bajo ninguna circunstancia.
