# ✅ SmartConnect AI – Production Readiness Checklist

Fecha: 2026-01-30

## 1. Testing y QA
- [x] Todos los tests unitarios, integración y e2e pasan correctamente
- [x] Pruebas manuales de flujos críticos (captación, chatbot, QRIBAR, notificaciones)

## 2. Seguridad
- [x] Mitigaciones OWASP Top 10 aplicadas (ver `docs/context/security_agent.md`)
- [x] Variables de entorno y secretos protegidos
- [x] No hay claves/API expuestas en frontend ni repo

- [ ] Landing (Next.js) desplegada en Vercel/Netlify/hosting
- [ ] Dashboard/Chatbot (Flutter Web) desplegado y accesible
- [ ] n8n backend en VPS propio (Docker, HTTPS, firewall)
- [ ] Edge Functions desplegadas en Supabase
- [ ] Dominios y HTTPS configurados

## 4. Integraciones
- [ ] Webhooks (n8n, Telegram, email, Google Sheets) probados
- [ ] Chatbot RAG funcional (ver `docs/context/chatbot_ia/GUIA_IMPLEMENTACION_RAG.md`)
- [ ] Integración QRIBAR y Reviews validada

## 5. Versionado y Documentación
- [x] Versiones actualizadas en pubspec.yaml, build.gradle, Info.plist
- [x] CHANGELOG.md actualizado (Keep a Changelog)
- [x] Registro de operación en `docs/audit/` (timestamp + descripción)

- [ ] Logs y backups activos para n8n y Supabase
- [x] Notificaciones de leads calientes probadas

## 7. Checklist Final
- [x] Sin datos sensibles en el repo
- [x] SEO y rendimiento de la landing validados
- [x] Smoke test de todos los flujos de usuario

---

> Usa esta checklist antes de pasar a producción. Marca cada punto solo cuando esté 100% validado.
