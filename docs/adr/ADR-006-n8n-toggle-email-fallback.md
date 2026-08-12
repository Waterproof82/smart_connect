# ADR-006: Toggle n8n/Email para Entrega de Leads + Fix de Fake-Success

**Fecha:** 2026-08-10
**Estado:** Aceptado

---

## Contexto

El webhook de n8n (ADR-002) dejó de estar disponible en producción, y el formulario de contacto de la landing (`Contact.tsx`) tenía un bypass silencioso: si `settings.n8nWebhookUrl` estaba vacía, el código la reemplazaba por `"https://placeholder-webhook-url.invalid"` y, del otro lado, `N8NWebhookDataSource` detectaba substrings mágicos (`placeholder`, `your_`, `.invalid`) y devolvía `true` sin hacer `fetch`. El resultado: el visitante veía "mensaje enviado con éxito" y el lead se perdía por completo, sin ningún registro del fallo.

Además, `LandingContainer` exponía un singleton memoizado (`getLandingContainer`) que cacheaba la primera instancia construida y automáticamente ignoraba cualquier cambio posterior de configuración (incluida la URL del webhook), lo que hacía inviable introducir un toggle runtime sin recargar la página.

### Requisitos identificados
1. El admin necesita poder desactivar n8n y que los leads sigan llegando, por email, sin perder ninguno.
2. Ningún estado debe reportar éxito falso: si un canal falla, el visitante debe ver un error real.
3. El toggle debe poder cambiarse sin build ni redeploy del frontend.
4. La API key de un proveedor de email nunca debe llegar al bundle del cliente.

---

## Opciones Consideradas

1. **Mantener solo n8n y arreglar el downtime del VPS** — descartado: no resuelve el problema de negocio (el cliente necesita seguir recibiendo leads mientras n8n está caído), y el dueño del proyecto quiere control manual del canal, no solo disponibilidad de infraestructura.
2. **`CompositeLeadRepository` que intenta n8n y hace fallback automático a email** — descartado: oculta qué canal corrió realmente, vuelve imposible testear "n8n activado + URL rota debe mostrar error" (el fallback silencioso resucitaría el fake-success), y mezcla dos decisiones de negocio distintas (routing explícito del admin vs. resiliencia automática).
3. **Branch `if (n8nEnabled)` dentro de `Contact.tsx` o de `SubmitLeadUseCase`** — descartado: filtra una decisión de infraestructura dentro de la vista o del dominio, violando la dirección de dependencias de Clean Architecture.
4. **Strategy Pattern seleccionado en el composition root (`LandingContainer`), más una Edge Function propia para el canal de email (Elegida)**.

---

## Decisión

Elegimos el **Strategy Pattern en el composition root** para elegir entre `LeadRepositoryImpl` (n8n) y `EmailLeadRepositoryImpl` (email), controlado por un nuevo campo persistido `Settings.n8nEnabled`, más una Supabase Edge Function (`notify-lead`) que envía el email vía **Brevo**.

En el mismo cambio, se corrigieron dos bugs de correctitud que bloqueaban la implementación segura del toggle:

- **Eliminación del singleton memoizado de `LandingContainer`** — reemplazado por `createLandingContainer(config)`, una factory pura sin memoización, con el cacheo correcto movido a `useMemo` en `Contact.tsx` (component-scoped, keyed por `settings`).
- **Eliminación del bypass de fake-success** en ambos extremos: `Contact.tsx` ya no inventa una URL placeholder, y `N8NWebhookDataSource` ya no interpreta substrings como "válidos"; en su lugar valida la URL con `new URL()` + chequeo de protocolo y retorna `false` (sin `fetch`) si no es usable.

---

## Justificación

### Razones técnicas

1. **Open/Closed**: agregar un tercer canal (SMS, Slack) es una nueva implementación de `ILeadRepository` + una rama en `LandingContainer`. El dominio (`SubmitLeadUseCase`, `ILeadRepository`) permanece sin tocar.
2. **Ningún fake-success posible**: cada canal solo retorna `true` si la operación de red realmente tuvo éxito. Un toggle mal configurado (n8n activado sin URL válida) produce un error visible, nunca un éxito fabricado.
3. **Seguridad por diseño**: `BREVO_API_KEY` vive únicamente como secret de Supabase, leído server-side (`Deno.env.get`) dentro de `notify-lead`. El cliente nunca la ve. El destinatario (`contact_email`) también se resuelve server-side, así que un fallo al cargar `settings` en el cliente no compromete la entrega.
4. **Runtime toggle sin redeploy**: `n8n_enabled` es una columna de `app_settings`, leída en cada mount de la landing. Cambiar el toggle en `SettingsPanel` no requiere build ni deploy del frontend.
5. **Transición guardada, no invariante de entidad** (ADR-7 del diseño): activar `n8nEnabled` sin una URL de webhook válida se rechaza en `UpdateSettingsUseCase`, no en el constructor de `Settings` — así una fila corrupta en la DB nunca puede romper la carga del panel de admin que serviría para arreglarla.

### Razones de negocio

- El cliente recupera inmediatamente un canal de entrega de leads funcional (email) sin depender de que n8n vuelva a estar online.
- El toggle le da control operativo al dueño del negocio sin intervención técnica.

---

## Consecuencias

### Positivas

1. Cero leads perdidos por fake-success: cualquier fallo real en cualquiera de los dos canales es visible para el visitante.
2. El singleton bug queda erradicado con test de regresión explícito (`LandingContainer.test.ts`): dos configuraciones distintas producen instancias y canales distintos.
3. Contrato de email (`LeadNotificationPayload`, en inglés) desacoplado del contrato de n8n (`WebhookPayload`, en español) — cambiar un canal no puede romper el otro.
4. Contenido del lead (nombre, empresa, mensaje) se escapa antes de interpolarse en el HTML del email (`escapeHtml`), previniendo inyección de HTML/script en el cuerpo del correo.

### Negativas

1. **Sin persistencia de leads en DB**: si Brevo falla, el lead se pierde (igual que si n8n falla hoy). Aceptado explícitamente por el dueño del proyecto; revisar si la tasa de fallos lo justifica en el futuro.
2. **Rate limiting en memoria** (`Map` por-isolate en `notify-lead`) se resetea en cada cold start de la Edge Function — mitigado porque el rate limiter del lado del cliente sigue siendo la primera línea de defensa.
3. **Sin test ejecutable del toggle en UI**: `SettingsPanel.tsx` es `.tsx` y `jest.config.js` no incluye `.tsx` en `testMatch` (gap heredado, no introducido por este cambio). El comportamiento del toggle está cubierto indirectamente por los tests de `settingsSchema`, `UpdateSettingsUseCase` y `settingsService`.
4. **Deploy en orden estricto**: migración de DB → deploy de `notify-lead` + secret `BREVO_API_KEY` → deploy del frontend. Mitigado con mappers `?? false` que degradan al canal de email si la secuencia se rompe.

---

## Referencias

- **Implementación**: `docs/CONTACT_FORM_WEBHOOK.md`, `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Migración**: `supabase/migrations/20260810120000_add_n8n_enabled_to_app_settings.sql`
- **Composition root**: `src/features/landing/presentation/LandingContainer.ts`
- **Canal n8n**: `src/features/landing/data/datasources/N8NWebhookDataSource.ts`
- **Canal email**: `src/features/landing/data/datasources/EmailNotifyDataSource.ts`, `src/features/landing/data/repositories/EmailLeadRepositoryImpl.ts`
- **Edge Function**: `supabase/functions/notify-lead/index.ts`, `supabase/functions/notify-lead/_lib.ts`
- **Toggle admin**: `src/features/admin/presentation/components/SettingsPanel.tsx`, `src/features/admin/domain/usecases/UpdateSettingsUseCase.ts`
- **ADR previo relacionado**: [ADR-002](ADR-002-n8n-webhook-contact-form.md)
- **Brevo API**: https://developers.brevo.com/reference/sendtransacemail
