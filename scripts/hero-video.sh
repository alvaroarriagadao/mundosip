#!/usr/bin/env bash
#
# Optimiza un video para el fondo del hero del home.
#
#   npm run hero:video assets/mi-video.mp4
#   CRF=22 npm run hero:video assets/mi-video.mp4        # más calidad, más peso
#   ANCHO=2560 CRF=24 npm run hero:video assets/mi.mp4   # nítido en pantallas Retina
#   POSTER=3 npm run hero:video assets/mi-video.mp4      # poster del segundo 3
#
# Parámetros (variables de entorno):
#   CRF    calidad: 18=máxima · 22=muy buena · 24=buena (default) · 28=media · 32=baja
#          Cada -2 en CRF sube el peso ~35%. Cada +2 lo baja ~25%.
#   ANCHO  ancho en px: 1920 (default) · 2560 para Retina · 1280 para peso mínimo
#   POSTER segundo del que se extrae la imagen de portada (default 1)
#   DESDE  recortar: segundo de inicio (ej: DESDE=4)
#   DURA   recortar: cuántos segundos usar (ej: DURA=10) — la palanca más
#          efectiva para bajar peso sin perder calidad, el hero va en loop
#   LOOP   "suave" (default): cruza el final con el inicio para que el loop
#          sea imperceptible · "corte" para dejar el corte seco
#
# Genera public/videos/hero.mp4 + hero-poster.jpg y respalda los anteriores
# en public/videos/_backup/

set -euo pipefail

ENTRADA="${1:-}"
CRF="${CRF:-24}"
ANCHO="${ANCHO:-1920}"
POSTER="${POSTER:-${2:-1}}"
DESDE="${DESDE:-}"
DURA="${DURA:-}"
LOOP="${LOOP:-suave}"
FADE=1   # segundos de cruce para el loop suave

# Flags de recorte (van antes de -i para que ffmpeg no decodifique de más)
RECORTE=()
[[ -n "$DESDE" ]] && RECORTE+=(-ss "$DESDE")
[[ -n "$DURA" ]] && RECORTE+=(-t "$DURA")

if [[ -z "$ENTRADA" ]]; then
  echo "Uso: npm run hero:video <ruta-al-video>"
  echo "     CRF=22 npm run hero:video <ruta-al-video>"
  exit 1
fi

if [[ ! -f "$ENTRADA" ]]; then
  echo "❌ No encuentro el archivo: $ENTRADA"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "❌ Falta ffmpeg. Instálalo con: brew install ffmpeg"
  exit 1
fi

SALIDA_DIR="public/videos"
BACKUP_DIR="$SALIDA_DIR/_backup"
mkdir -p "$SALIDA_DIR" "$BACKUP_DIR"

for f in hero.mp4 hero-poster.jpg; do
  [[ -f "$SALIDA_DIR/$f" ]] && cp "$SALIDA_DIR/$f" "$BACKUP_DIR/$f"
done

echo "📹 Entrada: $ENTRADA ($(du -h "$ENTRADA" | cut -f1))"
DETALLE="${ANCHO}px · CRF $CRF"
[[ "$LOOP" == "suave" ]] && DETALLE="$DETALLE · loop suave"
[[ -n "$DESDE" ]] && DETALLE="$DETALLE · desde ${DESDE}s"
[[ -n "$DURA" ]] && DETALLE="$DETALLE · ${DURA}s de duración"
echo "⚙️  Comprimiendo → $DETALLE (CRF menor = más calidad)…"

# Sin audio (el hero va muted) y faststart para que empiece a reproducir
# antes de terminar la descarga.
X264=(-c:v libx264 -crf "$CRF" -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an)

if [[ "$LOOP" == "suave" ]]; then
  # Duración efectiva del material que se va a codificar
  if [[ -n "$DURA" ]]; then
    DUR_EF="$DURA"
  else
    DUR_TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENTRADA")
    DUR_EF=$(echo "$DUR_TOTAL - ${DESDE:-0}" | bc)
  fi
  OFFSET=$(echo "$DUR_EF - $FADE" | bc)

  # Superpone el primer segundo (apareciendo en alpha) sobre el último:
  # al reiniciar el loop la imagen ya coincide y no se nota el corte.
  ffmpeg -y -loglevel error ${RECORTE[@]+"${RECORTE[@]}"} -i "$ENTRADA" -filter_complex \
"[0:v]scale=${ANCHO}:-2,fps=30,split[cuerpo][inicio];\
[inicio]trim=duration=${FADE},format=yuva420p,fade=t=in:st=0:d=${FADE}:alpha=1,setpts=PTS+${OFFSET}/TB[cruce];\
[cuerpo]setpts=PTS-STARTPTS[base];\
[base][cruce]overlay=format=auto,format=yuv420p[v]" \
    -map "[v]" "${X264[@]}" "$SALIDA_DIR/hero.mp4"
else
  ffmpeg -y -loglevel error ${RECORTE[@]+"${RECORTE[@]}"} -i "$ENTRADA" \
    -vf "scale=${ANCHO}:-2,fps=30" \
    "${X264[@]}" "$SALIDA_DIR/hero.mp4"
fi

echo "🖼  Extrayendo poster (segundo $POSTER)…"
ffmpeg -y -loglevel error -ss "$POSTER" -i "$ENTRADA" \
  -vframes 1 -vf "scale=${ANCHO}:-2" -q:v 2 \
  "$SALIDA_DIR/hero-poster.jpg"

echo ""
echo "✅ Listo ($DETALLE):"
ls -lh "$SALIDA_DIR"/hero.mp4 "$SALIDA_DIR"/hero-poster.jpg | awk '{print "   " $5 "\t" $9}'
echo ""

PESO=$(du -m "$SALIDA_DIR/hero.mp4" | cut -f1)
if (( PESO > 20 )); then
  echo "⚠️  ${PESO}MB es pesado para servir desde Vercel. Opciones:"
  echo "   · sube el CRF:      CRF=$((CRF + 2)) npm run hero:video $ENTRADA"
  echo "   · recorta duración: DURA=10 CRF=$CRF npm run hero:video $ENTRADA"
fi
echo "▶️  Prueba en local:  npm run dev  →  http://localhost:3000 (recarga con Cmd+Shift+R)"
echo "   Volver atrás:      cp public/videos/_backup/* public/videos/"
