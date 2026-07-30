/**
 * Estructura FIJA de una pregunta frecuente.
 * En fase 2 el equipo las administra desde el CMS: pregunta,
 * respuesta y, opcionalmente, una lista de puntos destacados.
 */

export interface PuntoFaq {
  /** Término destacado: "Eficiencia energética" */
  titulo: string;
  texto: string;
}

export interface Faq {
  id: string;
  pregunta: string;
  /** Párrafo de respuesta (puede ir solo o como intro de los puntos) */
  respuesta?: string;
  /** Lista de puntos con término destacado (opcional) */
  puntos?: PuntoFaq[];
  orden: number;
}
