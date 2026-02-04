# ADR-002: n8n Webhook para Formulario de Contacto

**Fecha:** 2026-02-04  
**Estado:** Aceptado

---

## Contexto

SmartConnect AI necesitaba capturar leads desde la landing page y automatizar su procesamiento con inteligencia artificial para priorizar los más valiosos.

### Requisitos Identificados
1. **Captación de leads** desde formulario de contacto con campos estructurados
2. **Análisis de sentimiento** automático para clasificar temperatura del lead (Caliente/Tibio/Frío)
3. **Flujo automatizado** que incluye:
   - Guardado en Google Sheets para análisis histórico
   - Notificaciones a Telegram para leads calientes (acción inmediata)
   - Emails de respuesta automática con seguimiento
4. **Separación de lógica:** Frontend enfocado en UI, backend en orquestación de flujos
5. **Agilidad de desarrollo:** Cambios rápidos en workflows sin modificar código

### Restricciones
- Presupuesto limitado (startup validando modelo de negocio)
- Equipo pequeño con conocimiento variado en backend
- Necesidad de iterar rápido sobre reglas de negocio
- Integración con múltiples servicios externos (Gemini, Google Sheets, Telegram)

---

## Opciones Consideradas

### Opción 1: Backend Propio (Node.js/Express + PostgreSQL)
**Descripción:** Crear API REST con Express, base de datos propia y lógica custom.

**Pros:**
- Control total del código
- Máxima flexibilidad técnica
- Sin dependencias externas

**Contras:**
- Requiere desarrollo completo (endpoints, validación, persistencia, integraciones)
- Mayor tiempo de desarrollo (2-3 semanas mínimo)
- Mantenimiento de infraestructura (servidor, DB, backups)
- Costo de hosting adicional
- Cambios en lógica de negocio requieren deploy

### Opción 2: Servicios de Formularios SaaS (Formspree, Tally, Google Forms)
**Descripción:** Usar plataforma third-party para captura de leads.

**Pros:**
- Setup inmediato (< 1 hora)
- Sin código backend
- Hosting incluido

**Contras:**
- **NO permite análisis de sentimiento con IA personalizada**
- **NO permite orquestación compleja** (Gemini → Sheets → Telegram/Email)
- Datos en silos de terceros
- Limitaciones en personalización de flujos
- Costo mensual recurrente (plan premium para integraciones)

### Opción 3: Supabase Functions
**Descripción:** Edge Functions de Supabase para lógica serverless.

**Pros:**
- Ya usamos Supabase en el proyecto
- TypeScript nativo
- Escalabilidad automática

**Contras:**
- Requiere código TypeScript para cada integración
- Debugging complejo en edge runtime
- Cambios en flujo requieren deploy
- NO hay UI visual para workflows
- Vendor lock-in

### Opción 4: Zapier / Make (Integromat)
**Descripción:** Plataformas de automatización no-code.

**Pros:**
- UI visual de workflows
- Integraciones pre-construidas
- Sin código

**Contras:**
- **Costo elevado:** ~$50-100/mes para volumen esperado
- Límite de "tasks" mensuales
- Zapier no permite self-hosting (datos en sus servers)
- Menos control sobre flujo de datos

### Opción 5: n8n Webhook (Elegida)
**Descripción:** Plataforma open-source de automatización con self-hosting en VPS propio (Railway).

**Pros:**
- **Open-source:** Sin costo de licencia, self-hosted en Railway (VPS gratuito tier)
- **UI visual:** Workflows editables sin tocar código
- **Integraciones nativas:** Gemini API, Google Sheets, Telegram, SMTP incluidas
- **Análisis IA personalizado:** Prompt customizable para clasificar temperatura de lead
- **Orquestación compleja:** Permite flujos condicionales (IF lead = caliente → Telegram)
- **Agilidad:** Cambios en workflow en minutos, sin deploy de código
- **Control total:** Datos en nuestro VPS, no en third-party
- **Webhooks nativos:** Recepción directa desde frontend con CORS configurado

**Contras:**
- Requiere VPS para hosting (Railway usado, pero añade dependencia)
- Curva de aprendizaje inicial para configurar workflows
- Mantenimiento de instancia n8n (actualizaciones)

---

## Decisión

Elegimos **n8n Webhook con self-hosting en Railway**

---

## Justificación

### Razones Técnicas

1. **Separación de Responsabilidades (Clean Architecture):**
   - Frontend (`Contact.tsx`) solo hace POST HTTP al webhook
   - n8n orquesta toda la lógica de negocio (análisis IA, notificaciones, persistencia)
   - Backend desacoplado del frontend (cambios independientes)

2. **Agilidad de Desarrollo:**
   - Cambios en reglas de negocio se hacen en UI visual de n8n (sin deploy)
   - Ejemplo: Cambiar criterio de "lead caliente" de prompt de Gemini en < 5 minutos
   - No requiere modificar código TypeScript ni hacer CI/CD

3. **Orquestación Compleja Simplificada:**
   - Un solo workflow maneja:
     - ✅ Recepción de webhook
     - ✅ Llamada a Gemini API (análisis de sentimiento)
     - ✅ Guardado en Google Sheets
     - ✅ Condicional IF (temperatura = caliente)
     - ✅ Notificación Telegram (solo hot leads)
     - ✅ Email de respuesta (HTML template)
   - Alternativa con Express requeriría 200+ líneas de código + tests + deploy

4. **Costo-Beneficio:**
   - n8n open-source + Railway tier gratuito = $0/mes
   - Zapier equivalente = $100/mes
   - Backend propio = 2-3 semanas desarrollo + hosting ($20/mes)

5. **Integraciones Nativas:**
   - Gemini API, Google Sheets, Telegram, SMTP ya integrados
   - No requiere escribir SDKs ni manejar autenticación manualmente

### Razones de Negocio

- **Time-to-Market:** Workflow completo implementado en 1 día (vs 2-3 semanas con backend custom)
- **Validación Rápida:** Iterar sobre reglas de scoring de leads sin tocar código
- **Escalabilidad Progresiva:** Cuando crezca el volumen, n8n en Railway puede escalar horizontalmente

---

## Consecuencias

### Positivas

1. **Automatización Completa del Pipeline de Leads:**
   - Captación → Análisis IA → Clasificación → Notificación → Respuesta automática
   - Reducción de tiempo de respuesta de horas a segundos

2. **Análisis de Temperatura Inteligente:**
   - Gemini clasifica leads en CALIENTE/TIBIO/FRÍO según mensaje y asunto
   - Permite priorizar esfuerzo comercial en leads de alta conversión

3. **Notificaciones Contextuales:**
   - Telegram solo para leads calientes (no spam)
   - Email HTML personalizado con tracking de CTA (botón "Llamar Ahora")

4. **Persistencia Estructurada:**
   - Google Sheets como CRM básico con todas las columnas necesarias
   - Posibilidad de análisis histórico y métricas

5. **Flexibilidad Iterativa:**
   - Modificar prompt de Gemini sin redeploy
   - Agregar nuevas acciones (ej: Slack, WhatsApp) sin tocar frontend

6. **Monitoreo Built-in:**
   - n8n Dashboard muestra ejecuciones, errores, tiempos de respuesta
   - Alertas automáticas si webhook falla

### Negativas

1. **Dependencia de Servicio Externo:**
   - Si Railway tiene downtime, el webhook no funciona
   - Mitigación: Railway tiene 99.9% uptime SLA + podemos migrar a otro VPS

2. **Latencia Adicional:**
   - Submit del formulario tarda ~2-3 segundos (llamada a Gemini + Sheets)
   - Usuario ve loading spinner más tiempo
   - Mitigación: UX acepta 2-3s en formularios de contacto (no crítico)

3. **Curva de Aprendizamiento:**
   - Equipo necesita aprender UI de n8n y conceptos de workflows
   - Mitigación: n8n tiene UX intuitiva + documentación completa

4. **Mantenimiento de Instancia:**
   - Actualizaciones de n8n deben hacerse manualmente
   - Monitoreo de salud de instancia Railway
   - Mitigación: Railway tiene auto-scaling + n8n es estable (pocas actualizaciones críticas)

5. **Debugging Más Complejo:**
   - Errores en workflow requieren revisar logs de n8n (no stack traces de código)
   - Mitigación: n8n tiene logging detallado por nodo + webhook test mode

---

## Referencias

- **Implementación:** `docs/CONTACT_FORM_WEBHOOK.md`
- **Deployment:** `docs/audit/2026-02-02_n8n-railway-production-deployment.md`
- **Código Frontend:** `src/features/landing/presentation/components/Contact.tsx`
- **Data Source:** `src/features/landing/data/datasources/N8NWebhookDataSource.ts`
- **Repository:** `src/features/landing/data/repositories/LeadRepositoryImpl.ts`
- **Use Case:** `src/features/landing/domain/usecases/SubmitLeadUseCase.ts`
- **n8n Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- **Railway Platform:** https://railway.app/
