import { EnvironmentConfigurationError } from './errors';

export interface PublicEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

/**
 * Evalúa sin lanzar excepciones si el entorno público de Supabase está plenamente configurado.
 * Permite distinguir entre:
 * a) Entorno local/staging/producción plenamente configurado.
 * b) Entorno no configurado durante fase de build estático (npm run build) o CI desatendido.
 */
export function isPublicEnvConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url.trim() !== '' && key && key.trim() !== '');
}

/**
 * Obtiene el contrato de entorno público si existe, o null si está incompleto.
 * No ejecuta validaciones destructivas durante importación estática ni rompe el build.
 */
export function getPublicEnv(): PublicEnv | null {
  if (!isPublicEnvConfigured()) {
    return null;
  }
  return {
    NEXT_PUBLIC_SUPABASE_URL: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  };
}

/**
 * Exige que las variables de entorno públicas estén configuradas para realizar una acción real.
 * Lanza un EnvironmentConfigurationError explícito, seguro y sin secretos si falta alguna variable.
 * Debe invocarse exclusivamente dentro de operaciones en tiempo de ejecución (lazy runtime).
 */
export function requirePublicEnv(): PublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.trim() === '') {
    throw new EnvironmentConfigurationError(
      'NEXT_PUBLIC_SUPABASE_URL',
      'la conexión con el cliente Supabase de navegador'
    );
  }

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.trim() === '') {
    throw new EnvironmentConfigurationError(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'la autenticación anónima del cliente Supabase de navegador'
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url.trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key.trim(),
  };
}
