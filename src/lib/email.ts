import { Resend } from 'resend';

/**
 * Envío de correo del sitio (Resend).
 *
 * Los avisos NUNCA deben tumbar la operación que los dispara: el lead ya
 * quedó guardado en la base antes de llegar aquí, así que un fallo de
 * correo se registra en el log y se sigue. Por eso ninguna función de
 * este módulo lanza excepciones.
 */

/** A dónde llegan los avisos del sitio. Se cambia por env sin tocar código. */
const DESTINO = process.env.CORREO_AVISOS?.trim() || 'contacto.lacustre@gmail.com';

/**
 * Remitente. Tiene que ser una dirección del dominio verificado en
 * Resend (mundosip.cl); si no, la API rechaza el envío.
 */
const REMITENTE = process.env.CORREO_REMITENTE?.trim() || 'MundoSIP <web@mundosip.cl>';

interface AvisoParams {
  asunto: string;
  html: string;
  texto: string;
  /** Correo del visitante: deja que el equipo responda con "Responder" */
  responderA?: string;
}

/**
 * Manda un aviso al equipo. Devuelve si salió o no, para dejarlo en el
 * log; quien llama no necesita hacer nada con el resultado.
 */
export async function enviarAviso({ asunto, html, texto, responderA }: AvisoParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[email] falta RESEND_API_KEY: el aviso no se envía (el lead sí quedó guardado)');
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: REMITENTE,
      to: DESTINO,
      subject: asunto,
      html,
      text: texto,
      ...(responderA ? { replyTo: responderA } : {}),
    });

    if (error) {
      console.error('[email] Resend rechazó el envío', error);
      return false;
    }
    console.log('[email] aviso enviado', data?.id);
    return true;
  } catch (error) {
    console.error('[email] error enviando el aviso', error);
    return false;
  }
}
