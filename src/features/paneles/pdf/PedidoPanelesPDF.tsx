import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { SnapshotPedido } from '../panel.types';

/**
 * PDF de una cotización de paneles sueltos — renderizado en el servidor
 * desde el snapshot del pedido, igual que las cotizaciones de casas.
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

const fechaFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });

const s = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 64,
    paddingHorizontal: 46,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: INK,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  marca: { fontFamily: 'Helvetica-Bold', fontSize: 19, color: TEAL_NIGHT, letterSpacing: 1.5 },
  marcaSip: { color: TAN },
  tagline: { fontSize: 7.5, color: MUTED, marginTop: 3, letterSpacing: 0.6 },
  folio: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: TEAL },
  folioMeta: { fontSize: 7.5, color: MUTED, marginTop: 2, textAlign: 'right' },

  banda: { backgroundColor: TEAL_NIGHT, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14 },
  bandaKicker: { color: TAN, fontSize: 7, letterSpacing: 2, marginBottom: 3 },
  bandaTitulo: { color: CREAM, fontFamily: 'Helvetica-Bold', fontSize: 12.5 },

  clienteFila: { flexDirection: 'row', gap: 18, marginBottom: 16 },
  clienteCampo: { flexDirection: 'row', gap: 4 },
  clienteEtiqueta: { color: MUTED },
  clienteValor: { fontFamily: 'Helvetica-Bold' },

  fila: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  filaCabecera: { borderBottomWidth: 1, borderBottomColor: TEAL_NIGHT },
  celdaCabecera: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: MUTED, letterSpacing: 0.4 },
  colProducto: { flex: 1, paddingRight: 8 },
  colCantidad: { width: 70, textAlign: 'right' },
  colPrecio: { width: 90, textAlign: 'right' },
  colTotal: { width: 90, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  totalBox: {
    marginTop: 14,
    alignSelf: 'flex-end',
    width: 240,
    backgroundColor: TEAL_NIGHT,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEtiqueta: { color: TAN, fontFamily: 'Helvetica-Bold', fontSize: 9, letterSpacing: 1 },
  totalValor: { color: CREAM, fontFamily: 'Helvetica-Bold', fontSize: 12.5 },

  notas: { marginTop: 18 },
  notasTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: TEAL, marginBottom: 3 },
  nota: { color: MUTED, marginBottom: 1.5, lineHeight: 1.45 },

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

export default function PedidoPanelesPDF({ pedido }: { pedido: SnapshotPedido }) {
  const fecha = fechaFmt.format(new Date(pedido.fechaISO));
  const unidades = pedido.lineas.reduce((suma, l) => suma + l.cantidad, 0);

  return (
    <Document title={`Cotización de paneles ${pedido.folio} — MundoSIP`} author="MundoSIP">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.marca}>
              MUNDO<Text style={s.marcaSip}>SIP</Text>
            </Text>
            <Text style={s.tagline}>CASAS EN PANELES SIP · PURRANQUE, CHILE</Text>
          </View>
          <View>
            <Text style={s.folio}>COTIZACIÓN {pedido.folio}</Text>
            <Text style={s.folioMeta}>Fecha: {fecha}</Text>
            <Text style={s.folioMeta}>Válida por 7 días hábiles</Text>
          </View>
        </View>

        <View style={s.banda}>
          <Text style={s.bandaKicker}>VENTA DE PANELES SIP POR UNIDAD</Text>
          <Text style={s.bandaTitulo}>
            {unidades} {unidades === 1 ? 'panel' : 'paneles'} · {pedido.lineas.length}{' '}
            {pedido.lineas.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>

        <View style={s.clienteFila}>
          <View style={s.clienteCampo}>
            <Text style={s.clienteEtiqueta}>Preparada para:</Text>
            <Text style={s.clienteValor}>{pedido.cliente.nombre}</Text>
          </View>
          <View style={s.clienteCampo}>
            <Text style={s.clienteEtiqueta}>Email:</Text>
            <Text style={s.clienteValor}>{pedido.cliente.email}</Text>
          </View>
          {pedido.cliente.telefono ? (
            <View style={s.clienteCampo}>
              <Text style={s.clienteEtiqueta}>Teléfono:</Text>
              <Text style={s.clienteValor}>{pedido.cliente.telefono}</Text>
            </View>
          ) : null}
        </View>

        <View style={[s.fila, s.filaCabecera]}>
          <Text style={[s.colProducto, s.celdaCabecera]}>PRODUCTO</Text>
          <Text style={[s.colCantidad, s.celdaCabecera]}>CANTIDAD</Text>
          <Text style={[s.colPrecio, s.celdaCabecera]}>P. UNITARIO</Text>
          <Text style={[s.colTotal, s.celdaCabecera]}>TOTAL</Text>
        </View>
        {pedido.lineas.map((linea) => (
          <View key={linea.slug} style={s.fila}>
            <Text style={s.colProducto}>{linea.nombre}</Text>
            <Text style={s.colCantidad}>{linea.cantidad}</Text>
            <Text style={s.colPrecio}>{clp.format(linea.precioClp)}</Text>
            <Text style={s.colTotal}>{clp.format(linea.precioClp * linea.cantidad)}</Text>
          </View>
        ))}

        <View style={s.totalBox} wrap={false}>
          <Text style={s.totalEtiqueta}>TOTAL</Text>
          <Text style={s.totalValor}>{clp.format(pedido.totalClp)}</Text>
        </View>

        <View style={s.notas} wrap={false}>
          <Text style={s.notasTitulo}>Notas</Text>
          <Text style={s.nota}>·  Valores unitarios referenciales; no incluyen despacho.</Text>
          <Text style={s.nota}>
            ·  Nuestro equipo te contactará para confirmar stock, coordinar la entrega y la forma de pago.
          </Text>
          <Text style={s.nota}>·  Esta cotización tiene una validez de 7 días hábiles desde su emisión.</Text>
        </View>

        <View style={s.pie} fixed>
          <Text style={s.pieTexto}>MundoSIP · Arturo Prat 742, Purranque, Los Lagos · contacto@mundosip.cl · +56 9 4036 7867</Text>
          <Text style={s.pieTexto} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
