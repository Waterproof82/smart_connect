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

## Cautela
No endurezcas cabeceras sin comprobar impacto: una CSP estricta puede romper Supabase, analytics, fuentes, embeds o el chatbot. Prueba en preview y reporta el riesgo. Cambios en `vercel.json` → regression check completo.
