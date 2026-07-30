const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CL');

/** 8900000 → "$8.900.000" */
export function formatCLP(value: number): string {
  return clpFormatter.format(value);
}

/** 48000 → "48.000" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
