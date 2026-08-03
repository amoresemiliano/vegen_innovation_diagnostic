/**
 * Error tipado que se lanza cuando se intenta ejecutar una operación en tiempo de ejecución
 * que requiere una variable de entorno que no se encuentra configurada en el sistema.
 * Garantiza de forma estricta que nunca se impriman valores ni secretos en el mensaje.
 */
export class EnvironmentConfigurationError extends Error {
  public readonly missingVariable: string;

  constructor(variableName: string, context?: string) {
    const msg = `Configuración de entorno incompleta: la variable '${variableName}' es requerida${
      context ? ` para ${context}` : ''
    }, pero no está configurada o se encuentra vacía.`;
    super(msg);
    this.name = 'EnvironmentConfigurationError';
    this.missingVariable = variableName;
    
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, EnvironmentConfigurationError);
    }
  }

  /**
   * Helper seguro para formatear el mensaje de error para registros o respuestas UI
   * sin riesgo de fugas de stack traces profundos ni secretos inyectados.
   */
  public toSafeMessage(): string {
    return this.message;
  }
}

/**
 * Helper tipado sin 'any' para extraer mensajes controlados en bloques catch(unknown).
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof EnvironmentConfigurationError) {
    return error.toSafeMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocurrió un error inesperado al procesar la configuración del sistema.';
}
