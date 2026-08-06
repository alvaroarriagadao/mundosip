import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { subtotalSeccion, totalItem } from '../calcular';
import { KIT_LABEL, type SnapshotCotizacion } from '../cotizacion.types';

/**
 * PDF de la cotización llave en mano — se renderiza en el servidor a
 * partir del SNAPSHOT emitido, nunca de datos vivos: el documento con
 * folio es reproducible tal cual aunque los precios cambien después.
 *
 * Tipografía Helvetica (nativa de PDF): cero fuentes que embeber y el
 * archivo pesa poco. La identidad la ponen el teal/tan de la marca.
 */

const TEAL_NIGHT = '#0D2129';
const TEAL = '#204E5F';
const TAN = '#B98A4E';
const CREAM = '#F6F1EA';
const INK = '#14232B';
const MUTED = '#6B7A82';
const LINE = '#E4DACE';

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const cantidadFmt = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 3 });

const fechaFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });

const s = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 64,
    paddingHorizontal: 46,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: INK,
  },

  /* ── Encabezado ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  marca: { fontFamily: 'Helvetica-Bold', fontSize: 19, color: TEAL_NIGHT, letterSpacing: 1.5 },
  marcaSip: { color: TAN },
  tagline: { fontSize: 7.5, color: MUTED, marginTop: 3, letterSpacing: 0.6 },
  folioBox: {
    alignItems: 'flex-end',
  },
  folio: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: TEAL },
  folioMeta: { fontSize: 7.5, color: MUTED, marginTop: 2 },

  /* ── Título ── */
  tituloBanda: {
    backgroundColor: TEAL_NIGHT,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  tituloKicker: { color: TAN, fontSize: 7, letterSpacing: 2, marginBottom: 3 },
  titulo: { color: CREAM, fontFamily: 'Helvetica-Bold', fontSize: 12.5 },

  /* ── Cliente ── */
  clienteFila: { flexDirection: 'row', gap: 18, marginBottom: 16 },
  clienteCampo: { flexDirection: 'row', gap: 4 },
  clienteEtiqueta: { color: MUTED },
  clienteValor: { fontFamily: 'Helvetica-Bold' },

  /* ── Secciones ── */
  seccion: { marginBottom: 10 },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: CREAM,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 3,
  },
  seccionNombre: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: TEAL_NIGHT },
  seccionCodigo: { color: TAN, fontFamily: 'Helvetica-Bold', fontSize: 8 },

  filaItem: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  colCodigo: { width: 26, color: MUTED },
  colDesc: { flex: 1, paddingRight: 8 },
  colUnidad: { width: 34, textAlign: 'center', color: MUTED },
  colCantidad: { width: 46, textAlign: 'right' },
  colPrecio: { width: 62, textAlign: 'right' },
  colTotal: { width: 66, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  filaCabecera: { borderBottomWidth: 1, borderBottomColor: TEAL_NIGHT },
  celdaCabecera: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: MUTED, letterSpacing: 0.4 },

  filaSubtotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 10,
  },
  subtotalEtiqueta: { color: MUTED },
  subtotalValor: { fontFamily: 'Helvetica-Bold', width: 66, textAlign: 'right' },

  /* ── Totales ── */
  totales: {
    marginTop: 8,
    alignSelf: 'flex-end',
    width: 240,
    borderTopWidth: 1.5,
    borderTopColor: TEAL_NIGHT,
    paddingTop: 8,
  },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5 },
  totalEtiqueta: { color: MUTED },
  totalValor: { fontFamily: 'Helvetica-Bold' },
  granTotal: {
    marginTop: 5,
    backgroundColor: TEAL_NIGHT,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  granTotalEtiqueta: { color: TAN, fontFamily: 'Helvetica-Bold', fontSize: 9, letterSpacing: 1 },
  granTotalValor: { color: CREAM, fontFamily: 'Helvetica-Bold', fontSize: 12.5 },

  /* ── Notas y condiciones ── */
  bloqueFinal: { marginTop: 16 },
  bloqueTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: TEAL, marginBottom: 3 },
  nota: { color: MUTED, marginBottom: 1.5, lineHeight: 1.45 },

  /* ── Pie ── */
  pie: {
    position: 'absolute',
    bottom: 26,
    left: 46,
    right: 46,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pieTexto: { fontSize: 7, color: MUTED },
});

const CABECERA_COLUMNAS = (
  <View style={[s.filaItem, s.filaCabecera]} fixed>
    <Text style={[s.colCodigo, s.celdaCabecera]}>N°</Text>
    <Text style={[s.colDesc, s.celdaCabecera]}>DETALLE</Text>
    <Text style={[s.colUnidad, s.celdaCabecera]}>UNIDAD</Text>
    <Text style={[s.colCantidad, s.celdaCabecera]}>CANTIDAD</Text>
    <Text style={[s.colPrecio, s.celdaCabecera]}>P. UNITARIO</Text>
    <Text style={[s.colTotal, s.celdaCabecera]}>TOTAL</Text>
  </View>
);

export default function CotizacionPDF({ cotizacion }: { cotizacion: SnapshotCotizacion }) {
  const { totales } = cotizacion;
  const fecha = fechaFmt.format(new Date(cotizacion.fechaISO));
  // Solo es "llave en mano" si va todo; si no, el documento lo declara
  const esParcial =
    cotizacion.seccionesTotales != null && cotizacion.secciones.length < cotizacion.seccionesTotales;

  return (
    <Document
      title={`Cotización ${cotizacion.folio} — MundoSIP`}
      author="MundoSIP"
      subject={cotizacion.titulo}
    >
      <Page size="A4" style={s.page}>
        {/* Encabezado de marca + folio */}
        <View style={s.header}>
          <View>
            <Text style={s.marca}>
              MUNDO<Text style={s.marcaSip}>SIP</Text>
            </Text>
            <Text style={s.tagline}>CASAS EN PANELES SIP · PURRANQUE, CHILE</Text>
          </View>
          <View style={s.folioBox}>
            <Text style={s.folio}>COTIZACIÓN {cotizacion.folio}</Text>
            <Text style={s.folioMeta}>Fecha: {fecha}</Text>
            <Text style={s.folioMeta}>Válida por {cotizacion.validezDias} días hábiles</Text>
          </View>
        </View>

        {/* Título */}
        <View style={s.tituloBanda}>
          <Text style={s.tituloKicker}>COTIZACIÓN DE SERVICIOS DE INGENIERÍA Y CONSTRUCCIÓN</Text>
          <Text style={s.titulo}>
            {cotizacion.titulo} · {KIT_LABEL[cotizacion.kit]}
          </Text>
          {esParcial ? (
            <Text style={{ color: CREAM, fontSize: 8, marginTop: 4, opacity: 0.85 }}>
              Alcance a medida del cliente: incluye {cotizacion.secciones.length} de{' '}
              {cotizacion.seccionesTotales} secciones del servicio llave en mano completo.
            </Text>
          ) : null}
        </View>

        {/* Cliente */}
        <View style={s.clienteFila}>
          <View style={s.clienteCampo}>
            <Text style={s.clienteEtiqueta}>Preparada para:</Text>
            <Text style={s.clienteValor}>{cotizacion.cliente.nombre}</Text>
          </View>
          <View style={s.clienteCampo}>
            <Text style={s.clienteEtiqueta}>Email:</Text>
            <Text style={s.clienteValor}>{cotizacion.cliente.email}</Text>
          </View>
          {cotizacion.cliente.telefono ? (
            <View style={s.clienteCampo}>
              <Text style={s.clienteEtiqueta}>Teléfono:</Text>
              <Text style={s.clienteValor}>{cotizacion.cliente.telefono}</Text>
            </View>
          ) : null}
        </View>

        {/* Secciones elegidas */}
        {cotizacion.secciones.map((seccion) => (
          <View key={seccion.id} style={s.seccion} wrap={seccion.items.length > 8}>
            <View style={s.seccionHeader}>
              <Text style={s.seccionNombre}>{seccion.nombre}</Text>
              <Text style={s.seccionCodigo}>{seccion.codigo}</Text>
            </View>
            {CABECERA_COLUMNAS}
            {seccion.items.map((item) => (
              <View key={item.id} style={s.filaItem}>
                <Text style={s.colCodigo}>{item.codigo ?? ''}</Text>
                <Text style={s.colDesc}>{item.descripcion}</Text>
                <Text style={s.colUnidad}>{item.unidad}</Text>
                <Text style={s.colCantidad}>{cantidadFmt.format(item.cantidad)}</Text>
                <Text style={s.colPrecio}>{clp.format(item.precioUnitario)}</Text>
                <Text style={s.colTotal}>{clp.format(totalItem(item))}</Text>
              </View>
            ))}
            <View style={s.filaSubtotal}>
              <Text style={s.subtotalEtiqueta}>Subtotal {seccion.nombre.toLowerCase()}</Text>
              <Text style={s.subtotalValor}>{clp.format(subtotalSeccion(seccion))}</Text>
            </View>
          </View>
        ))}

        {/* Totales */}
        <View style={s.totales} wrap={false}>
          <View style={s.totalFila}>
            <Text style={s.totalEtiqueta}>Valor neto</Text>
            <Text style={s.totalValor}>{clp.format(totales.neto)}</Text>
          </View>
          {totales.descuento > 0 ? (
            <>
              <View style={s.totalFila}>
                <Text style={s.totalEtiqueta}>
                  {cotizacion.descuentoNombre ?? 'Descuento'} ({cantidadFmt.format(cotizacion.descuentoPct)}%)
                </Text>
                {/* Guion ASCII: el "−" tipográfico no existe en Helvetica WinAnsi */}
                <Text style={s.totalValor}>-{clp.format(totales.descuento)}</Text>
              </View>
              <View style={s.totalFila}>
                <Text style={s.totalEtiqueta}>Neto con descuento</Text>
                <Text style={s.totalValor}>{clp.format(totales.netoConDescuento)}</Text>
              </View>
            </>
          ) : null}
          <View style={s.totalFila}>
            <Text style={s.totalEtiqueta}>IVA ({cantidadFmt.format(cotizacion.ivaPct)}%)</Text>
            <Text style={s.totalValor}>{clp.format(totales.iva)}</Text>
          </View>
          <View style={s.granTotal}>
            <Text style={s.granTotalEtiqueta}>TOTAL</Text>
            <Text style={s.granTotalValor}>{clp.format(totales.total)}</Text>
          </View>
        </View>

        {/* Notas y condiciones */}
        {cotizacion.notas.length > 0 ? (
          <View style={s.bloqueFinal} wrap={false}>
            <Text style={s.bloqueTitulo}>Notas a la cotización</Text>
            {cotizacion.notas.map((nota) => (
              <Text key={nota} style={s.nota}>
                ·  {nota}
              </Text>
            ))}
            {/* Solo si las notas del equipo no mencionan ya la vigencia */}
            {!cotizacion.notas.some((n) => /validez/i.test(n)) && (
              <Text style={s.nota}>
                ·  Esta cotización tiene una validez de {cotizacion.validezDias} días hábiles desde su emisión.
              </Text>
            )}
          </View>
        ) : null}
        {cotizacion.condicionesPago ? (
          <View style={s.bloqueFinal} wrap={false}>
            <Text style={s.bloqueTitulo}>Condiciones generales de pago</Text>
            <Text style={s.nota}>{cotizacion.condicionesPago}</Text>
          </View>
        ) : null}

        {/* Pie en todas las páginas */}
        <View style={s.pie} fixed>
          <Text style={s.pieTexto}>MundoSIP · Arturo Prat 742, Purranque, Los Lagos · contacto@mundosip.cl · +56 9 4036 7867</Text>
          <Text style={s.pieTexto} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
