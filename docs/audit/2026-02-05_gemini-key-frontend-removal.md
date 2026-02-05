# 2026-02-05 - Eliminación de exposición de GEMINI_API_KEY en frontend

**Fecha:** 2026-02-05

**Acción:**
- Eliminado el uso de `VITE_GEMINI_API_KEY` en el frontend y archivos de entorno.
- Ahora solo `GEMINI_API_KEY` es utilizada en el backend y edge functions.
- El frontend nunca expone la clave ni la requiere para funcionar, solo consume la Edge Function segura.
- Actualizados `.env.example` y documentación de entorno.

**Motivo:**
- Mitigar riesgo de filtración y bloqueo de la API key de Gemini.
- Cumplimiento de buenas prácticas OWASP y seguridad by design.

**Impacto:**
- El frontend ya no puede filtrar la clave Gemini.
- El backend y edge functions siguen funcionando sin cambios visibles para el usuario final.
