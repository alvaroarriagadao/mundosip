#!/usr/bin/env bash
#
# Genera muestras del hero con distintos niveles de calidad para
# compararlas antes de procesar el video completo.
#
#   npm run hero:comparar assets/mi-video.mp4
#   ANCHO=2560 npm run hero:comparar assets/mi-video.mp4
#
# Crea public/videos/_comparar/crf-XX.mp4 (8 segundos cada uno) y
# muestra el peso estimado del video completo con cada nivel.
# Ábrelos en Finder/QuickTime y compáralos a pantalla completa.

set -euo pipefail

ENTRADA="${1:-}"
ANCHO="${ANCHO:-1920}"
DESDE="${DESDE:-2}"      # segundo de inicio de la muestra
DURACION=8

if [[ -z "$ENTRADA" || ! -f "$ENTRADA" ]]; then
  echo "Uso: npm run hero:comparar <ruta-al-video>"
  exit 1
fi

OUT="public/videos/_comparar"
rm -rf "$OUT"; mkdir -p "$OUT"

TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENTRADA" | cut -d. -f1)
echo "📹 $ENTRADA · duración total ${TOTAL}s · muestras de ${DURACION}s a ${ANCHO}px"
echo ""

for CRF in 20 22 24 26 30; do
  ffmpeg -y -loglevel error -ss "$DESDE" -t "$DURACION" -i "$ENTRADA" \
    -vf "scale=${ANCHO}:-2,fps=30" \
    -c:v libx264 -crf "$CRF" -preset slow -profile:v high -pix_fmt yuv420p \
    -movflags +faststart -an \
    "$OUT/crf-$CRF.mp4"

  BYTES=$(stat -f%z "$OUT/crf-$CRF.mp4")
  MUESTRA_MB=$(echo "scale=1; $BYTES/1048576" | bc)
  COMPLETO_MB=$(echo "scale=0; $BYTES*$TOTAL/$DURACION/1048576" | bc)
  printf "   CRF %-3s → muestra %5s MB   ·   video completo ≈ %s MB\n" \
    "$CRF" "$MUESTRA_MB" "$COMPLETO_MB"
done

echo ""
echo "👀 Compáralas:  open $OUT"
echo "   Cuando decidas:  CRF=24 npm run hero:video $ENTRADA"
