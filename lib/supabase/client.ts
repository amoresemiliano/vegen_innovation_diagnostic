import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserConfig } from './config';

// Caché en memoria (Singleton) para preservar una única instancia por sesión de navegador en componentes "use client"
let browserClientInstance: SupabaseClient | null = null;

/**
 * Obtiene o inicializa la instancia única del cliente Supabase para el navegador ("use client").
 * 
 * REGLAS ARQUITECTÓNICAS (Fase 1A):
 * - INICIALIZACIÓN DIFERIDA (Lazy): no invoca createClient() durante importaciones en tiempo de build estático.
 * - SIN PROXIES FALSOS: si las variables están ausentes, no devuelve objetos simulados ni arrays vacíos;
 *   lanza explícitamente un EnvironmentConfigurationError controlado en el momento en que una acción intenta su uso.
 * - CONSERVACIÓN OPERATIVA: preserva el 100% del comportamiento de consultas del MVP cuando el entorno es válido.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClientInstance) {
    return browserClientInstance;
  }

  // Valida y obtiene las credenciales públicas de forma segura (lanzando error tipado si no existen)
  const { url, anonKey } = getSupabaseBrowserConfig();

  browserClientInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClientInstance;
}

/**
 * Limpia la instancia en memoria (utilizado principalmente para reset en pruebas de integración o reinicios de sesión).
 */
export function resetBrowserClientInstance(): void {
  browserClientInstance = null;
}
