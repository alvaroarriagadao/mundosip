/**
 * Inserta datos estructurados (schema.org) como JSON-LD.
 *
 * `</script>` dentro de un texto rompería el bloque: se escapa `<` para
 * que cualquier contenido escrito desde el admin sea seguro.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
