/** 42 → "COT-00042" — el correlativo visible del documento. */
export function formatearFolio(folioNum: number | string): string {
  return `COT-${String(folioNum).padStart(5, '0')}`;
}
