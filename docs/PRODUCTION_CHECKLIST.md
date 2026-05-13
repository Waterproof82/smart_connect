# ✅ SmartConnect AI – Production Readiness Checklist

Fecha: 2026-02-18

## 1. Testing y QA

- [x] Todos los tests unitarios, integración y e2e pasan correctamente
- [x] Pruebas manuales de flujos críticos (captación, chatbot, QRIBAR, notificaciones)

## 2. Seguridad

- [x] Mitigaciones OWASP Top 10 aplicadas (ver `docs/context/security_agent.md`)
- [x] Variables de entorno y secretos protegidos
- [x] No hay claves/API expuestas en frontend ni repo

- [x] Landing (React + Vite) desplegada en Vercel/Netlify/hosting
- [x] Dashboard/Chatbot (React + Vite) desplegado y accesible
- [ ] n8n backend en VPS propio (Docker, HTTPS, firewall)
- [x] Edge Functions desplegadas en Supabase
- [ ] Dominios y HTTPS configurados

## 4. Integraciones

- [x] Webhooks (n8n, Telegram, email, Google Sheets) probados
- [x] Chatbot RAG funcional (ver `docs/GUIA_IMPLEMENTACION_RAG.md`)
- [ ] Integración QRIBAR y Reviews validada

## 5. Versionado y Documentación

- [x] Versiones actualizadas en package.json
- [x] CHANGELOG.md actualizado (Keep a Changelog)
- [x] Registro de operación en `docs/audit/` (timestamp + descripción)

- [ ] Logs y backups activos para n8n y Supabase
- [x] Notificaciones de leads calientes probadas

## 7. Checklist Final

- [x] Sin datos sensibles en el repo
- [x] SEO y rendimiento de la landing validados
- [x] Smoke test de todos los flujos de usuario

## 8. Bundle Size & Performance

- [x] Initial bundle < 500KB (use `npm run build` to verify)
- [x] Code-splitting implemented for lazy loading routes
- [x] Vendor chunks separated (React, Supabase)
- [x] No build warnings about chunk sizes

## 9. GEO Agent Readiness (AI Agent Optimization)

- [x] `llms.txt` — Machine-readable markdown for LLMs
- [x] `mcp/server-card.json` — MCP Server Card
- [x] `agent-skills/index.json` — Agent Skills index
- [x] `api-catalog` — API Catalog in linkset+json format
- [x] `openid-configuration` — OAuth/OIDC discovery metadata
- [x] `oauth-protected-resource` — Protected Resource Metadata
- [x] `robots.txt` — AI bot rules + Content-Signal directives
- [x] Link headers — API discovery endpoints
- [x] JSON-LD authorship signals — author/publisher/breadcrumb
- [ ] Verify Agent Readiness Score in production

### Build Output Expectations

```
dist/assets/index-*.js           ~11 KB    ← Landing principal
dist/assets/vendor-react-*.js    ~48 KB    ← React core
dist/assets/vendor-supabase-*.js ~170 KB   ← Supabase client
dist/assets/index-admin-*.js     ~52 KB    ← Admin (lazy)
dist/assets/index-chatbot-*.js  ~262 KB    ← Chatbot (lazy)
```

### Run Performance Check

```bash
npm run build
# Verify no warnings about chunk size > 500KB
```

---

> Usa esta checklist antes de pasar a producción. Marca cada punto solo cuando esté 100% validado.
