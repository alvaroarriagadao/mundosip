import type { ContactoInput } from './contacto.schema';
import { INTERESES } from './contacto.schema';

/**
 * Arma el correo que recibe el equipo cuando alguien escribe desde el
 * formulario de contacto.
 *
 * Va todo el contenido del lead en el cuerpo a propósito: así se
 * responde desde el teléfono sin entrar al panel.
 */

/** El mensaje lo escribe un visitante: escapar antes de meterlo en el HTML */
function esc(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function etiquetaInteres(valor: string): string {
  return INTERESES.find((i) => i.valor === valor)?.label ?? valor;
}

const COLORES = {
  tinta: '#0D2129',
  teal: '#204E5F',
  tan: '#B98A4E',
  crema: '#F6F1EA',
  suave: '#6B7B82',
};

/** Fila etiqueta/valor de la tabla de datos */
function fila(etiqueta: string, valorHtml: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E6DFD5;color:${COLORES.suave};font-size:13px;width:120px;vertical-align:top;">${esc(etiqueta)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #E6DFD5;color:${COLORES.tinta};font-size:15px;vertical-align:top;">${valorHtml}</td>
    </tr>`;
}

export function construirAvisoContacto(datos: ContactoInput) {
  const { nombre, email, telefono, interes, mensaje } = datos;
  const interesLabel = etiquetaInteres(interes);

  const fecha = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(new Date());

  const asunto = `Nuevo contacto web · ${nombre} · ${interesLabel}`;

  const telefonoHtml = telefono
    ? `<a href="tel:${esc(telefono.replace(/\s+/g, ''))}" style="color:${COLORES.teal};">${esc(telefono)}</a>`
    : `<span style="color:${COLORES.suave};">No lo dejó</span>`;

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:${COLORES.crema};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E6DFD5;">
    <tr>
      <td style="background:${COLORES.teal};padding:22px 28px;">
        <p style="margin:0;color:${COLORES.tan};font-size:12px;letter-spacing:2px;text-transform:uppercase;">MundoSIP · Formulario web</p>
        <h1 style="margin:6px 0 0;color:${COLORES.crema};font-size:21px;font-weight:700;">${esc(nombre)} quiere contactarlos</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${fila('Interés', esc(interesLabel))}
          ${fila('Correo', `<a href="mailto:${esc(email)}" style="color:${COLORES.teal};">${esc(email)}</a>`)}
          ${fila('Teléfono', telefonoHtml)}
          ${fila('Recibido', esc(fecha))}
        </table>

        <p style="margin:22px 0 8px;color:${COLORES.suave};font-size:13px;">Mensaje</p>
        <div style="background:${COLORES.crema};border-left:3px solid ${COLORES.tan};border-radius:6px;padding:14px 16px;color:${COLORES.tinta};font-size:15px;line-height:1.6;white-space:pre-wrap;">${esc(mensaje)}</div>

        <p style="margin:22px 0 0;color:${COLORES.suave};font-size:13px;line-height:1.5;">
          Responde este correo y le llegará directo a ${esc(nombre)}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const texto = [
    `Nuevo contacto desde mundosip.cl`,
    ``,
    `Nombre:   ${nombre}`,
    `Interés:  ${interesLabel}`,
    `Correo:   ${email}`,
    `Teléfono: ${telefono || 'No lo dejó'}`,
    `Recibido: ${fecha}`,
    ``,
    `Mensaje:`,
    mensaje,
    ``,
    `Responde este correo y le llegará directo a ${nombre}.`,
  ].join('\n');

  return { asunto, html, texto };
}
