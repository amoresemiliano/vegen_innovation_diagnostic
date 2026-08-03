# Documentación Arquitectónica: Fase 1A – Contrato de Entorno e Inicialización Diferida de Supabase

## 1. Problema Original
Durante la evaluación estática del build en Next.js 14 (`npm run build`), el sistema fallaba de forma sistemática y abortaba la generación del árbol estático (prerenderizado de las páginas `/` y `/admin/dashboard`) con el error críptico y bloqueante:
```
Error: supabaseUrl is required
```
Este fallo se debía a que el cliente web intentaba instanciarse y conectarse (eager instantiation) al momento mismo de evaluarse los archivos durante la importación estática en el servidor de compilación o en entornos de CI/CD desatendidos sin variables locales cargadas en memoria.

---

## 2. Arquitectura Anterior (Monolítica y Eager)
* **Archivo Único de Conexión:** `lib/supabase.ts`.
* **Comportamiento Eager (Ansioso):** Al importar `lib/supabase.ts` en cualquier componente (`DiagnosticWizard.tsx`, `page.tsx`), se ejecutaba inmediatamente en el scope global del módulo:
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```
* **Consecuencia Destructiva:** Si las variables de entorno no estaban presentes (fase de construcción desatendida o entorno no configurado), se pasaban cadenas vacías `''` como fallback al constructor del SDK, el cual arrojaba una excepción irrecuperable que rompía el compilador de Next.js y no diferenciaba entre ausencia legítima de datos y mala configuración en tiempo de ejecución.

---

## 3. Arquitectura Nueva (Desacoplada y Lazy)
La nueva estructura distribuye responsabilidades cumpliendo el principio de Mínimo Privilegio y segregación estricta entre cliente y servidor:

```
lib/
├── env/
│   ├── errors.ts   # Error tipado EnvironmentConfigurationError y helpers seguros sin secretos
│   ├── public.ts   # Contrato estricto y validadores para variables públicas (Navegador/SSR)
│   ├── server.ts   # Contrato estricto protegido por 'server-only' para variables privadas (OpenAI)
│   └── index.ts    # Barrel de agregación exclusivamente público (no reexporta módulos de servidor)
└── supabase/
    ├── config.ts   # Adaptador de configuración segura para Supabase (Navegador)
    ├── client.ts   # Fábrica del cliente en navegador con Patrón Singleton e inicialización diferida (Lazy)
    └── index.ts    # Re-exportaciones públicas del módulo
```

### Aislamiento Estructural de Seguridad:
* **Protección `server-only`:** El módulo `lib/env/server.ts` incorpora como primera línea de código la instrucción `import 'server-only';`, garantizando a nivel del compilador de Next.js que cualquier intento accidental de importación desde un Client Component abortará el build inmediatamente.
* **Barrel Exclusivamente Público (`lib/env/index.ts`):** Se eliminó arbitrariamente la re-exportación `export * from './server';` del índice para impedir que el empaquetado Webpack del cliente evalúe módulos o contratos del backend.

---

## 4. Eliminación del Shim con Proxy y Migración Directa
* **Evaluación y Descarte del Proxy:** Durante la revisión de arquitectura pre-commit, se evaluó la posibilidad de mantener un shim de compatibilidad transitorio con un `Proxy` de JavaScript en `lib/supabase.ts`. Dicho patrón fue formalmente **descartado** tras constatar que degrada la cadena prototipal (falla en verificaciones `instanceof SupabaseClient`), introduce opacidad analítica en getters con campos privados (`#field`) y supone una complejidad innecesaria.
* **Migración Directa:** Al verificarse que en todo el repositorio existían exactamente dos únicos consumidores (`app/admin/dashboard/page.tsx` y `components/DiagnosticWizard.tsx`), se procedió a una **migración directa y definitiva** hacia el cliente lazy (`import { getSupabaseBrowserClient } from '@/lib/supabase/client'`).
* **Erradiación del Archivo Heredado:** El archivo monolítico `lib/supabase.ts` fue eliminado radicalmente del repositorio (`git rm`), purificando la estructura y suprimiendo cualquier ambigüedad de resolución en los imports.
* **Instanciación Local:** Los componentes consumidores ya no instancian el cliente en el scope global del módulo ni durante el render; invocan `const supabase = getSupabaseBrowserClient();` estrictamente dentro del ciclo de vida de los manejadores de eventos o efectos en tiempo de ejecución (`useEffect`, `onClick`, `onSubmit`).

---

## 5. Contrato de Variables (`.env.example`)
Se ha estandarizado un manifiesto público y seguro sin secretos reales ni simulaciones ambiguas, utilizando placeholders inequívocos:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace_with_supabase_anon_key
OPENAI_API_KEY=replace_with_openai_api_key
```

---

## 6. Flujo de Inicialización Diferida (Lazy Initialization)
1. **Importación Estática (Build / Pre-render):** Cuando Next.js importa los componentes durante `npm run build`, se evalúan los módulos pero **ningún cliente Supabase se instancia ni conecta**. La función `createClient` permanece completamente inmóvil en reposo.
2. **Ejecución en Browser (Runtime):** Al montarse un componente o dispararse una acción real del usuario (ej: `fetchLeads` o `startDiagnostic`), el código solicita la instancia a la fábrica (`getSupabaseBrowserClient()`).
3. **Validación Inyectada:** El singleton valida mediante `requirePublicEnv()` que las variables vivas existan efectivamente en memoria.
4. **Respuesta Controlada y Determinista:** Si están activas y presentes, establece la conexión y cachea la instancia; si no existen, lanza un error tipado controlado (`EnvironmentConfigurationError`) sin encubrir el estado informático con proxies falsos.

---

## 7. Decisiones Tomadas y Rechazo al Proxy Falso
* **Rechazo Arquitectónico del Proxy Falso / Shim Silencioso:** Se descartó taxativamente implementar un objeto que aparente ser Supabase devolviendo arreglos vacíos `[]` o invocando `createClient('', '')`. Ocultar un fallo de configuración o pretender que una consulta a la base de datos devuelve cero registros corrompe la integridad del sistema y engaña tanto en depuración como al operador.
* **Uso Estricto de `unknown`:** Eliminación progresiva y sistemática del tipo inseguro `any` en los bloques `catch(error: unknown)` de los consumidores, garantizando análisis robustos de excepciones.
* **Manejo UI-Ready:** Cuando un desarrollador o QA ejecuta en local sin credenciales en `.env.local` (*Escenario C*):
  * En el Dashboard, la UI captura la excepción y renderiza un aviso visual dedicado (*"Aviso del Sistema: Configuración de entorno incompleta..."*), distinguiéndolo claramente de una base de datos con cero leads legítimos.
  * En el Wizard, el fallo detiene la ejecución inmediatamente (`return;`), impidiendo comunicar en falso que la sesión fue creada en Supabase y abortando llamadas malformadas a la IA.

---

## 8. Matriz de Escenarios y Estado Operativo
| Escenario de Ejecución | Comportamiento en V1 (MVP) | Estado y Comportamiento en V2 (Fase 1A) |
| :--- | :--- | :--- |
| **A. `npm run build` sin `.env.local`** | Falla categóricamente con `Error: supabaseUrl is required`. | **COMPROBADO EMPÍRICAMENTE:** Compila en verde al 100% (5/5 páginas estáticas exitosas, cero conexiones activadas). |
| **B. Runtime con credenciales válidas** | Funciona (mediante instancia global insegura en memoria). | **SOPORTADO POR DISEÑO / PENDIENTE DE PRUEBA RUNTIME:** El patrón Singleton preserva milimétricamente las consultas transaccionales intactas; continúa pendiente de validación empírica en runtime debido a la falta de credenciales reales cargadas en el entorno local actual. |
| **C. Runtime local sin `.env.local`** | Explota ciegamente o falla silenciosamente en consola. | **COMPROBADO:** Interfaz captura `EnvironmentConfigurationError` sin divulgar secretos y muestra avisos comprensibles sin bloquear el navegador. |

---

## 9. Procedimiento de Validación Manual y Cero Deuda
* Para comprobar empíricamente el **Escenario B** de manera no destructiva cuando se cuente con las claves legítimas:
  1. Ejecutar `cp .env.example .env.local` e rellenar las credenciales públicas reales sin subirlas al control de versiones.
  2. Ejecutar `npm run build` confirmando que finaliza en verde sin abrir conexiones.
  3. Ejecutar `npm run dev` y acceder a `http://localhost:3000/admin/dashboard` observando en la consola de red la lectura exitosa del Kanban sin alteración alguna a datos ni filtraciones en consola.
