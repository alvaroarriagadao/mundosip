/**
 * Estructura FIJA de un panel SIP a la venta.
 *
 * Contrato con el panel de administración (fase 2): cada campo será un
 * campo del formulario. Publicar un panel nuevo = llenar estos datos.
 */

export interface PanelSIP {
  id: string;
  /** URL: /paneles/panel-sip-94mm */
  slug: string;
  /** "Panel SIP 94 MM" */
  nombre: string;
  /** Espesor total en mm — ordena el catálogo y dibuja el corte a escala */
  espesorTotalMM: number;
  precioCLP: number;
  /** "1220 x 2440 mm" */
  dimensiones: string;
  /** Espesor de cada placa OSB en mm */
  espesorOSBMM: number;
  /** Espesor del núcleo EPS en mm */
  espesorEPSMM: number;
  /** "15 kg/m³" */
  densidadEPS: string;
  /** Escuadría de madera compatible: '2×3" calibrada' */
  aptoParaMadera: string;
  descripcion: string;
  /** Dónde conviene usarlo: muros, cubierta, entrepiso… */
  usos: string[];
  destacado: boolean;
  orden: number;
}
