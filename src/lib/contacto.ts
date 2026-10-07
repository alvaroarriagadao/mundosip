/**
 * Datos de contacto del negocio, en un solo lugar.
 *
 * El número de WhatsApp estaba escrito a mano en varias páginas: si
 * cambia, se edita aquí y listo.
 */

/** Formato internacional sin "+" ni espacios, como lo exige wa.me */
export const WHATSAPP_NUMERO = '56940367867';

/** Link para abrir el chat, con un mensaje ya escrito si se pasa uno */
export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMERO}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
