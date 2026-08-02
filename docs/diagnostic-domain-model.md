# Modelo de Dominio Diagnóstico y Ontología (Fase 0 - Vegen Digital)

> [!IMPORTANT]
> Documento de diseño de Fase 0. Su contenido constituye una propuesta inicial y no una arquitectura definitivamente aprobada. La ontología, las ponderaciones, el modelo de datos, el health score, las soluciones asociadas y la migración SQL requieren revisión metodológica y técnica posterior.

## 1. Arquitectura de Ontología Compartida (Las 29 Dimensiones)
Para evitar que los 20 marcos estratégicos de UdeSA y Vegen se conviertan en 20 cuestionarios inconexos, el sistema establece una **Ontología de 29 Dimensiones Empresariales**. 
Cadas respuesta del usuario alimenta uno o más vectores de esta ontología, generando una representación 360º de la organización.

| Grupo Conceptual | Dimensiones Ontológicas | Descripción del Vector de Estado |
| :--- | :--- | :--- |
| **I. Estrategia y Valor** | 1. Claridad estratégica<br>2. Aspiración y prioridades<br>3. Foco de mercado<br>4. Diferenciación<br>5. Creación de valor<br>6. Captura de valor<br>7. Portafolio y prioridades | Evalúa la coherencia entre la misión, las elecciones de dónde jugar/cómo ganar (Cascada Estratégica), y si la empresa monetiza eficientemente (DAP vs. DAV). |
| **II. Procesos y Capacidades** | 8. Procesos críticos<br>9. Dependencia de personas<br>10. Conocimiento tácito<br>11. Capacidades VRIO<br>12. Sistema de valor interno | Identifica cuellos de botella del fundador, falta de documentación de procesos (caso Vegen SL) y evaluación de qué activos son valiosos, raros e inimitables. |
| **III. Datos y Tecnología** | 13. Fragmentación de datos<br>14. Visibilidad gerencial<br>15. Madurez tecnológica<br>16. Integración de sistemas<br>17. Potencial de automatización<br>18. Preparación para IA | Mide el grado de silos operacionales, uso de Excel vs. Dashboards integrados (BI), y disponibilidad de infraestructura y datos para implementar IA sin riesgo. |
| **IV. Mercado y Comercial** | 19. Madurez comercial<br>20. Madurez de marketing<br>21. Riesgo de sustitución<br>22. Riesgo de cadena de valor<br>23. Activos complementarios | Analiza la efectividad del embudo de ventas, captación digital, presencia omnicanal y el grado de exposición a disrupción desde la oferta y la demanda. |
| **V. Cultura y Ecosistema** | 24. Capacidad de cambio<br>25. Cultura de innovación<br>26. Deuda psicológica<br>27. Colaboración<br>28. Ecosistema<br>29. Oportunidad de plataforma<br>30. Capacidad de experimentación (Value Lab) | Mide la seguridad psicológica de Pisano, el riesgo de desgaste y desmotivación del personal al introducir IA, y el potencial de abrir el modelo hacia plataformas o alianzas abiertas. |

---

## 2. Mapeo Relacional: Los 20 Frameworks Estratégicos vs. Ontología

Cada marco estratégico se conecta directamente con dimensiones específicas de la ontología, sirviendo como regla de validación o fuente de hipótesis:

1. **Creación y Captura de Valor:** -> *Creación de valor (5), Captura de valor (6)*. (Mide excedente del consumidor DAP y margen DAV).
2. **Tipos de Innovación (Oslo):** -> *Diferenciación (4), Procesos críticos (8), Madurez de marketing (20), Sistema de valor interno (12)*.
3. **Knowledge Brokers (Bohr/Pasteur/Edison):** -> *Ecosistema (28), Colaboración (27), Cultura de innovación (25)*.
4. **Cinco Verdades para una Cultura de Innovación:** -> *Cultura de innovación (25), Capacidad de cambio (24), Capacidad de experimentación (30)*.
5. **Creatividad Individual y Grupal:** -> *Conocimiento tácito (10), Cultura de innovación (25)*.
6. **Cuatro Respuestas a la Disrupción:** -> *Riesgo de sustitución (21), Claridad estratégica (1), Portafolio (7)*. (Matriz: Doblar apuesta, Contraatacar, Replegarse, Migrar).
7. **Disrupción de la IA en la Industria (Birkinshaw):** -> *Preparación para IA (18), Riesgo de cadena de valor (22), Activos complementarios (23)*. (Las 10 preguntas y score 0-14).
8. **Seis Dimensiones de Deuda Psicológica:** -> *Deuda psicológica (26), Capacidad de cambio (24)*. (Mide pérdida de autonomía, offloading cognitivo y temor a reemplazo).
9. **Portafolio de Innovaciones:** -> *Portafolio y prioridades (7), Foco de mercado (3)*. (Regla 60% Core / 20% Adyacente / 20% Transformacional).
10. **Nueve Factores del Momento Óptimo de Entrada:** -> *Madurez comercial (19), Madurez tecnológica (15), Activos complementarios (23)*. (Pioneros vs Seguidores).
11. **Colaborar o No Colaborar:** -> *Colaboración (27), Ecosistema (28), Capacidades VRIO (11)*. (Matriz Velocidad/Coste/Control).
12. **Tipos de Innovación Abierta:** -> *Ecosistema (28), Colaboración (27)*. (Torneos, Comunidades, Concursos de selección vs Cerrada).
13. **Capacidades VRIO:** -> *Capacidades VRIO (11), Diferenciación (4), Conocimiento tácito (10)*. (Valioso, Raro, Inimitable, Organizado).
14. **Sistema de Valor Interno:** -> *Sistema de valor interno (12), Procesos críticos (8), Integración de sistemas (16)*. (Cadena de valor interconectada).
15. **Coopetencia:** -> *Ecosistema (28), Colaboración (27)*. (Alianzas con competidores para expandir el mercado antes de dividirlo).
16. **Cascada Estratégica (Lafley & Martin):** -> *Claridad estratégica (1), Aspiración (2), Foco de mercado (3), Diferenciación (4), Capacidades (11)*.
17. **Resumen Estratégico y Canasta de Innovación:** -> *Portafolio (7), Claridad estratégica (1)*. (Proyectos de ruptura vs soporte).
18. **Emprendimiento Innovador:** -> *Diferenciación (4), Foco de mercado (3)*. (Propiedad intelectual vs disrupción arquitectónica).
19. **Value Lab:** -> *Capacidad de experimentación (30), Creación de valor (5)*. (Pruebas empíricas con baja inversión de capital).
20. **Cuatro Oportunidades de Crecimiento de Plataforma:** -> *Oportunidad de plataforma (29), Ecosistema (28), Integración (16)*. (Orquestación multilateral, escalado selectivo como Vegen HORECA).

---

## 3. Contratos de Profundidad por Nivel
Los niveles no son bucles rígidos de cantidad, sino **contratos de profundidad y cobertura ontológica**. El motor podrá terminar el test anticipadamente si la evidencia estadística es contundente, o solicitar 2 a 3 preguntas adicionales (máximo) si una dimensión crítica queda indeterminada.

### A. Nivel Express (~20 Preguntas)
* **Objetivo:** Detectar 1 o 2 dolores prioritarios (cuellos de botella, pérdidas de margen) y entregar soluciones inmediatas de alto impacto.
* **Cobertura Mínima Obligatoria (8 Dimensiones):** Aspiración (2), Foco de mercado (3), Procesos críticos (8), Fragmentación de datos (13), Integración de sistemas (16), Potencial de automatización (17), Madurez comercial (19) y Capacidad de cambio (24).
* **Parada Anticipada:** Si en el paso 16 ya hay 85% de confianza en 2 brechas operativas críticas y datos claros de sistemas, se puede cerrar la sesión.

### B. Nivel Business (~35 Preguntas)
* **Objetivo:** Comprender la interacción estructural entre estrategia de crecimiento, arquitectura operativa y madurez digital.
* **Añade al Express (8 Dimensiones):** Capacidades VRIO (11), Creación/Captura de valor (5, 6), Portafolio (7), Colaboración (27), Diferenciación (4), Visibilidad gerencial (14) y Madurez de marketing (20).

### C. Nivel Transformation (~50 Preguntas)
* **Objetivo:** Auditoría corporativa 360º del modelo de negocio, preparación humana y técnica para Inteligencia Artificial y salto de escala en el mercado.
* **Añade al Business (13 Dimensiones):** Disrupción IA (18, 21), Deuda psicológica (26), Cultura de innovación (25), Coopetencia y Ecosistema (28), Innovación abierta (27), Oportunidad de Plataforma (29), Momento de entrada (15) y Value Lab (30).

---

## 4. Filosofía de Preguntas: Hechos Observables vs. Prescripción

> **REGLA DE ORO ONTOLÓGICA:** La pregunta jamás debe obligar al empresario a diagnosticar su propia empresa ni a diseñar la solución técnica.

| ❌ Pregunta Prohibida (Prescriptiva / Superficial) | ✔️ Pregunta Correcta (Hecho Observable / Comportamental) |
| :--- | :--- |
| "¿Qué tecnología o software consideras que necesitas implementar para vender más?" | "Cuando un nuevo potencial cliente contacta a tu empresa, ¿dónde queda registrado su historial de seguimiento actualmente?" |
| "¿Cómo crees que tu empresa debería innovar frente a la Inteligencia Artificial?" | "En tu equipo de administración o servicio al cliente, ¿cuántas horas por semana estimas que se invierten transcribiendo datos o copiando información repetitiva?" |
| "¿Cuál consideras que es el problema con tus costos operativos?" | "Si mañana tus proveedores aumentan sus precios un 10%, ¿cuánto tiempo demorarías en enterarte y ver su impacto exacto en el margen de tu producto principal?" |
| "¿Tienes una cultura que tolera el fracaso?" | "Cuando un líder o empleado propone una idea que se prueba y finalmente no genera ventas, ¿qué ocurre habitualmente en la organización?" |
