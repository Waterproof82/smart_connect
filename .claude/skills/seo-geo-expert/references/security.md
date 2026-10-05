# Seguridad relacionada con SEO

## Checklist
- HTTPS en todo, redirección 301/308 http→https, HSTS (empezar con `max-age` bajo antes de `includeSubDomains`/preload).
- Sin mixed content, certificado válido.
- Cabeceras: `Content-Security-Policy` (probar con `Report-Only` primero), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, protección contra clickjacking (`frame-ancestors`).
- Cookies: `Secure`, `HttpOnly`, `SameSite` según uso; consentimiento coherente con analytics.
- Formularios: validación servidor/Zod, anti-spam, rate limiting, sin exponer claves (solo claves públicas en el cliente).
- Contenido inyectado/hackeado: buscar `site:digitalizatenerife.es` con términos ajenos, redirecciones sospechosas, enlaces ocultos.
- GSC → *Problemas de seguridad* y *Acciones manuales*: comprobar (`NOT VERIFIED` sin acceso).
- Endpoints públicos (`.well-known`, Edge Functions) sin filtrar datos sensibles; seguir `docs/context/security_agent.md` (OWASP).
- **Endurecer la CSP** (por ejemplo, quitar `'unsafe-eval'`, hecho el 2026-10-05 en #129):
  1. Comprobá que ningún chunk lo necesita: `rg "new Function\(|[^.\w]eval\(" dist/assets/*.js`.
  2. Hacé un smoke test en el **preview de Vercel del PR** antes de mergear. Tiene SSO: el navegador del propietario con sesión en Vercel pasa, `curl` no.
  3. En el preview, registrá un listener `securitypolicyviolation` y revisá la consola en: páginas públicas (que gtag cargue y envíe `page_view`), apertura del chat y `/admin`.
  4. Las Edge Functions de Supabase rechazan el host del preview por CORS (`responseStatus` 0). Para probar el chat de punta a punta, usá producción.
- **Si el chatbot falla, revisá primero los logs de Supabase**: `query_logs` con `source = 'function_logs'`. Un 402 `RESOURCE_EXHAUSTED` de Gemini significa que se agotaron los créditos prepago (2026-10-05). Es una acción del propietario en ai.studio, no un bug de código, y explica que fallen los tests de `tests/e2e/chatbotFlow.test.ts`.

## Cautela
No endurezcas cabeceras sin comprobar impacto: una CSP estricta puede romper Supabase, analytics, fuentes, embeds o el chatbot. Prueba en preview y reporta el riesgo. Cambios en `vercel.json` → regression check completo.
