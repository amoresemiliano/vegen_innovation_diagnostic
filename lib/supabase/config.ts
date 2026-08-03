import { isPublicEnvConfigured, requirePublicEnv } from '@/lib/env/public';

/**
 * Valida si la configuración de Supabase para el cliente web está disponible.
 * No lanza errores ni oculta estados incompletos.
 */
export function isSupabaseConfigured(): boolean {
  return isPublicEnvConfigured();
}

/**
 * Obtiene la configuración de conexión de Supabase para navegador en tiempo de ejecución.
 * Si alguna variable de entorno está ausente o vacía, lanza un EnvironmentConfigurationError tipado.
 */
export function getSupabaseBrowserConfig() {
  const env = requirePublicEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
