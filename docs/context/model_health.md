# Model Health & SDD Profile Maintenance

## 🔍 Propósito
Mantener la **salud de los modelos SDD** en el perfil FREE, garantizando:
- Modelos gratuitos activos (Mistral + OpenCode Zen).
- Fallbacks funcionales.
- Cumplimiento de reglas de bloqueo (ej: `no_paid_models`).

---

## 🛠️ Script de Verificación
### `scripts/check-models.sh`
**Ejecución manual** (recomendado: semanal o antes de proyectos importantes):
```bash
chmod +x ./scripts/check-models.sh  # Solo primera vez
./scripts/check-models.sh
```

**Requisitos**:
- `MISTRAL_API_KEY` en `.env` (obtener en [Mistral Console](https://console.mistral.ai/)).
- Node.js 20+.

**Salida**:
- Actualiza `.opencode/models/health.json`.
- Genera reporte en `docs/audit/model_health_YYYY-MM-DD.md`.

---

## 📊 Interpretación de `health.json`
### Campos Clave
| Campo | Descripción | Acción si ❌ |
|-------|-------------|--------------|
| `summary.critical` | Modelos con errores 402/404 | Reemplazar en `sdd-profile-free.json` |
| `summary.warnings` | Modelos con rate limits (429) | Monitorear, considerar fallback |
| `zen_models_need_manual_check` | Modelos Zen gratuitos | Verificar en [OpenCode Zen Docs](https://opencode.ai/docs/zen/) |

### Ejemplo de Reporte
```json
{
  "summary": {
    "critical": 1,  // ❌ Reemplazar modelo
    "warnings": 2,  // ⚠️ Monitorear
    "zen_models_need_manual_check": 3  // 🔄 Verificar manualmente
  }
}
```

---

## 🔄 Flujo de Mantenimiento
1. **Ejecutar script**: `./scripts/check-models.sh`.
2. **Analizar reporte**: Revisar `docs/audit/model_health_YYYY-MM-DD.md`.
3. **Actualizar perfiles**:
   - Si hay modelos críticos → Reemplazar en `.opencode/sdd-profile-free.json`.
   - Si hay cambios en Zen → Actualizar `free_models_confirmed.opencode_zen_free.models`.
4. **Documentar**: Registrar cambios en `CHANGELOG.md` (etiqueta `Fixed` o `Changed`).

---

## ⚠️ Reglas de Bloqueo
- **`no_paid_models: true`**: El script fallará si detecta modelos pagos en `sdd-profile-free.json`.
- **Modelos bloqueados**: Lista en `models_NOT_to_use` (ej: `mistral/open-mixtral-8x22b`).

---

## 📅 Frecuencia Recomendada
| Tipo | Frecuencia | Responsable |
|------|------------|-------------|
| Verificación automática | Semanal | Script (`check-models.sh`) |
| Verificación manual Zen | Mensual | Desarrollador |
| Actualización de perfiles | Cuando haya cambios | Desarrollador |

---

## 🔗 Referencias
- [Mistral Model List](https://docs.mistral.ai/getting-started/models/)
- [OpenCode Zen Docs](https://opencode.ai/docs/zen/)
- [Documentación SDD Profile](https://opencode.ai/docs/sdd/profiles)