import 'server-only';
import { EnvironmentConfigurationError } from './errors';

export interface ServerEnv {
  OPENAI_API_KEY: string;
}

/**
 * Evalúa sin lanzar excepciones si el entorno privado del servidor (OpenAI) está configurado.
 */
export function isServerEnvConfigured(): boolean {
  const openAiKey = process.env.OPENAI_API_KEY;
  return Boolean(openAiKey && openAiKey.trim() !== '');
}

/**
 * Obtiene el contrato de variables privadas del servidor de manera controlada o null si no existe configuración.
 * Garantiza que estas variables nunca se validen ni exporten en componentes cliente.
 */
export function getServerEnv(): ServerEnv | null {
  if (!isServerEnvConfigured()) {
    return null;
  }
  return {
    OPENAI_API_KEY: (process.env.OPENAI_API_KEY || '').trim(),
  };
}

/**
 * Exige que el entorno de servidor esté configurado cuando se ejecuta una petición real en backend (ej. /api/diagnostic).
 * Lanza un EnvironmentConfigurationError seguro si falta la variable requerida.
 */
export function requireServerEnv(): ServerEnv {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey || openAiKey.trim() === '') {
    throw new EnvironmentConfigurationError(
      'OPENAI_API_KEY',
      'el motor de inferencia de IA en el servidor'
    );
  }

  return {
    OPENAI_API_KEY: openAiKey.trim(),
  };
}
