#!/bin/bash
#
# check-models.sh
#
# Verifica el estado de los modelos SDD y genera un reporte de auditoría.
# Uso: ./scripts/check-models.sh
# Requisitos: MISTRAL_API_KEY en .env, Node.js 20+, npx
#

set -euo pipefail

# Directorio raíz del proyecto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPENCODE_DIR="$ROOT_DIR/.opencode"
DOCS_AUDIT_DIR="$ROOT_DIR/docs/audit"
SCRIPT_PATH="$OPENCODE_DIR/scripts/verify-mistral.ts"
HEALTH_PATH="$OPENCODE_DIR/models/health.json"
REPORT_PATH="$DOCS_AUDIT_DIR/model_health_$(date +'%Y-%m-%d').md"

# Verificar prerequisitos
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "❌ Error: verify-mistral.ts no encontrado en $SCRIPT_PATH"
  exit 1
fi

if [ ! -f "$ROOT_DIR/.env" ] || ! grep -q "MISTRAL_API_KEY" "$ROOT_DIR/.env"; then
  echo "❌ Error: MISTRAL_API_KEY no encontrado en .env"
  exit 1
fi

# Crear directorio de reportes si no existe
mkdir -p "$DOCS_AUDIT_DIR"

# Ejecutar verificación
echo "🔍 Verificando modelos Mistral y Zen..."
cd "$ROOT_DIR" && npx tsx "$SCRIPT_PATH"

# Generar reporte de auditoría
CRITICAL_COUNT=$(jq -r '.summary.critical' "$HEALTH_PATH")

cat > "$REPORT_PATH" <<EOF
# Model Health Audit - $(date +'%Y-%m-%d %H:%M:%S')

## Resumen
$(cat "$HEALTH_PATH")

## Acciones Recomendadas

1. **Modelos Críticos ($CRITICAL_COUNT):**
   - Reemplazar modelos con errores 402/404 en ".opencode/sdd-profile-free.json".
   - Referencia: [Mistral Model List](https://docs.mistral.ai/getting-started/models/)

2. **Modelos Zen (Verificación Manual)**:
   - Verificar disponibilidad en [OpenCode Zen Docs](https://opencode.ai/docs/zen/).
   - Actualizar ".opencode/sdd-profile-free.json" si hay cambios.

3. **Próxima Verificación**:
   - Programar para $(date -d "+7 days" +'%Y-%m-%d').

## Contexto
- **Script Ejecutado**: "`basename "$0"`"
- **Directorio**: "`pwd`"
EOF

# El conteo de modelos críticos ya se extrajo antes de generar el reporte

echo "📊 Reporte generado: $REPORT_PATH"