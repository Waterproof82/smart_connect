# 📧 Formulario de Contacto - Integración Webhook

## Objetivo

Conectar el formulario de contacto de la landing page con un webhook de n8n para automatizar la gestión de leads según su temperatura (caliente/tibio/frío).

---

## 🏗️ Arquitectura

```
Landing Page (Contact.tsx)
    ↓ POST
Webhook n8n (https://tu-n8n.com/webhook/contact)
    ↓
┌─────────────────────────────┐
│ Análisis de Temperatura     │
│ (Gemini AI Sentiment)       │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Google Sheets               │
│ (Registro de Leads)         │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Notificaciones              │
│ - Telegram (Lead Caliente)  │
│ - Email HTML (Respuesta)    │
└─────────────────────────────┘
```

---

## 📋 Pasos de Implementación

### 1. Configurar Webhook en n8n

#### 1.1. Crear Workflow en n8n

1. **Accede a n8n** (VPS o n8n Cloud)
2. **Crea nuevo workflow**: "SmartConnect - Contact Form Handler"
3. **Agrega nodo Webhook**:
   - **Método HTTP:** POST
   - **Path:** `/webhook/contact`
   - **Authentication:** None (opcional: Basic Auth)
   - **Respond:** Using 'Respond to Webhook' Node

#### 1.2. Estructura del Payload Esperado

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 600 123 456",
  "company": "RestauranteXYZ",
  "subject": "qribar" | "automation" | "tap-review" | "consulting",
  "message": "Estoy interesado en implementar QRIBAR en mi restaurante",
  "timestamp": "2026-01-27T22:00:00.000Z"
}
```

---

### 2. Configurar Análisis de Temperatura con Gemini

#### 2.1. Nodo HTTP Request (Gemini API)

**Endpoint:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-goog-api-key": "{{ $env.GEMINI_API_KEY }}"
}
```

**Body:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "Analiza este lead y clasifícalo como CALIENTE, TIBIO o FRÍO:\n\nAsunto: {{ $json.subject }}\nMensaje: {{ $json.message }}\n\nResponde SOLO con una palabra: CALIENTE, TIBIO o FRÍO"
    }]
  }],
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 20
  }
}
```

#### 2.2. Nodo Code (Extraer Temperatura)

```javascript
const response = $input.item.json;
const temperature = response.candidates[0].content.parts[0].text.trim();

return {
  json: {
    ...items[0].json,
    temperature: temperature,
    analyzedAt: new Date().toISOString()
  }
};
```

---

### 3. Configurar Google Sheets

#### 3.1. Crear Hoja de Cálculo

**Nombre:** SmartConnect - Leads Database

**Columnas:**
- A: Timestamp
- B: Nombre
- C: Email
- D: Teléfono
- E: Empresa
- F: Asunto
- G: Mensaje
- H: Temperatura
- I: Estado (Nuevo/Contactado/Cerrado)
- J: Notas

#### 3.2. Nodo Google Sheets

**Operación:** Append Row

**Mapping:**
```javascript
{
  "Timestamp": "{{ $json.timestamp }}",
  "Nombre": "{{ $json.name }}",
  "Email": "{{ $json.email }}",
  "Teléfono": "{{ $json.phone }}",
  "Empresa": "{{ $json.company }}",
  "Asunto": "{{ $json.subject }}",
  "Mensaje": "{{ $json.message }}",
  "Temperatura": "{{ $json.temperature }}",
  "Estado": "Nuevo",
  "Notas": ""
}
```

---

### 4. Configurar Notificaciones

#### 4.1. Telegram (Solo Leads Calientes)

**Nodo IF:**
```javascript
{{ $json.temperature }} === "CALIENTE"
```

**Nodo Telegram:**
```markdown
🔥 **LEAD CALIENTE** 🔥

👤 **Nombre:** {{ $json.name }}
📧 **Email:** {{ $json.email }}
📱 **Teléfono:** {{ $json.phone }}
🏢 **Empresa:** {{ $json.company }}
📌 **Asunto:** {{ $json.subject }}

💬 **Mensaje:**
{{ $json.message }}

⏰ **Recibido:** {{ $json.timestamp }}

🎯 **ACCIÓN:** Contactar INMEDIATAMENTE
```

#### 4.2. Email de Respuesta Automática

**Nodo Send Email (SMTP/SendGrid)**

**Para:** `{{ $json.email }}`
**Asunto:** `Gracias por contactar con SmartConnect AI`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
    .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Gracias {{ $json.name }}!</h1>
    </div>
    <div class="content">
      <p>Hemos recibido tu mensaje sobre <strong>{{ $json.subject }}</strong>.</p>
      
      <p>Nuestro equipo revisará tu solicitud y te contactaremos en las próximas <strong>24 horas</strong>.</p>
      
      <p>Mientras tanto, puedes:</p>
      <ul>
        <li>📖 Explorar nuestra <a href="https://smartconnect.ai/docs">documentación</a></li>
        <li>🎥 Ver <a href="https://smartconnect.ai/demos">demos en vídeo</a></li>
        <li>📞 Llamarnos directamente: <strong>+34 XXX XXX XXX</strong></li>
      </ul>
      
      <center>
        <a href="https://smartconnect.ai/agenda" class="cta-button">
          📅 Agenda una Demo
        </a>
      </center>
      
      <p>Saludos,<br><strong>Equipo SmartConnect AI</strong></p>
    </div>
    <div class="footer">
      <p>SmartConnect AI | Innovación Digital para Tu Negocio</p>
      <p>Si no solicitaste este email, puedes ignorarlo.</p>
    </div>
  </div>
</body>
</html>
```

#### 4.3. Webhook Tracking (Botón de Llamada)

**URL en el Email:**
```html
<a href="https://tu-n8n.com/webhook/track-call?lead={{ $json.email }}" class="cta-button">
  📞 Llamar Ahora
</a>
```

**Workflow Separado para Tracking:**
- Registra clics en Google Sheets
- Actualiza estado del lead a "Interesado Alto"
- Notificación adicional a Telegram

---

### 5. Componente React (Contact.tsx)

El formulario usa **Zod + React Hook Form** para validación type-safe y **LeadEntity** (domain layer) para lógica de negocio.

#### 5.1. Zod Schema (Presentation Layer)

```tsx
// src/features/landing/presentation/schemas/contactSchema.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/, 'Solo letras y espacios (2-50 caracteres)'),
  company: z.string().trim().min(1, 'La empresa es requerida')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s&'.,\-]{2,100}$/, 'Nombre de empresa válido (2-100 caracteres)'),
  email: z.string().trim().min(1, 'El email es requerido')
    .regex(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido'),
  service: z.string().min(1, 'Debes seleccionar un servicio')
    .refine((val) => val !== 'Selecciona una opción', { message: 'Debes seleccionar un servicio' }),
  message: z.string().trim().min(1, 'El mensaje es requerido')
    .refine((val) => !DANGEROUS_PATTERNS.some((p) => p.test(val)), 'Contenido no permitido')
    .refine((val) => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).length >= 10, 'Mínimo 10 caracteres')
    .refine((val) => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).length <= 1000, 'Máximo 1000 caracteres'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

#### 5.2. React Hook Form Integration

```tsx
// Contact.tsx - uses useForm + zodResolver
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting, isValid, touchedFields },
} = useForm<ContactFormData>({
  resolver: zodResolver(contactSchema),
  mode: 'onBlur',
  reValidateMode: 'onChange',
});

const onSubmit = async (data: ContactFormData) => {
  // Rate limiting (OWASP A04:2021)
  // Input sanitization (OWASP A03:2021)
  // LeadEntity creation with sanitized data
  // SubmitLeadUseCase execution (Clean Architecture)
};
```

#### 5.3. Arquitectura de Validación (Defense in Depth)

```
┌──────────────────────────────────────────────────────┐
│ Presentation Layer (Zod + React Hook Form)           │
│ - contactSchema: validación instantánea en UI        │
│ - Feedback visual (errores/éxito por campo)          │
├──────────────────────────────────────────────────────┤
│ Domain Layer (LeadEntity)                            │
│ - validate(): validación de negocio (defense-in-depth)│
│ - toWebhookPayload(): transformación + DOMPurify     │
├──────────────────────────────────────────────────────┤
│ Use Case Layer (SubmitLeadUseCase)                   │
│ - Orquesta validación + envío al webhook             │
└──────────────────────────────────────────────────────┘
```

---

### 6. Variables de Entorno

#### 6.1. Archivo `.env.local`

```env
# n8n Webhook
VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/contact

# Gemini API (para n8n)
GEMINI_API_KEY=key

# Telegram Bot (para n8n)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Email SMTP (para n8n)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

---

## 🔒 Seguridad

### Headers CORS en n8n

```javascript
// Nodo Set (antes de Respond to Webhook)
return {
  json: {
    ...items[0].json,
    headers: {
      'Access-Control-Allow-Origin': 'https://smartconnect.ai',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  }
};
```

### Rate Limiting

Implementar en n8n con nodo Code:

```javascript
// Limitar a 5 requests por IP cada 10 minutos
const ip = $json.headers['x-forwarded-for'] || $json.headers['x-real-ip'];
const key = `ratelimit:${ip}`;

// Usar Redis o memoria (simplificado)
const count = global.rateLimits?.[key] || 0;

if (count > 5) {
  throw new Error('Rate limit exceeded');
}

global.rateLimits = global.rateLimits || {};
global.rateLimits[key] = count + 1;

setTimeout(() => {
  delete global.rateLimits[key];
}, 600000); // 10 min

return items;
```

---

## 🧪 Testing

### Test Local con curl

```bash
curl -X POST https://tu-n8n.com/webhook/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+34 600000000",
    "company": "Test Company",
    "subject": "qribar",
    "message": "Necesito QRIBAR urgentemente para mañana",
    "timestamp": "2026-01-27T22:00:00.000Z"
  }'
```

### Verificaciones

1. ✅ Registro aparece en Google Sheets
2. ✅ Email de confirmación recibido
3. ✅ Notificación Telegram (si es lead caliente)
4. ✅ Temperatura clasificada correctamente

---

## 📊 Métricas y Monitoreo

### Dashboard en n8n

- Total de leads recibidos
- Distribución de temperatura (Caliente/Tibio/Frío)
- Tasa de conversión por asunto
- Tiempo de respuesta promedio

### Alertas

- Telegram si webhook falla
- Email si Google Sheets no se actualiza
- Notificación si Gemini API está down

---

## 🚀 Despliegue

### Checklist

- [ ] Webhook n8n configurado y activo
- [ ] Gemini API key válida
- [ ] Google Sheets conectado con permisos
- [ ] Telegram bot configurado
- [ ] SMTP/SendGrid configurado
- [ ] Variables de entorno en producción
- [ ] CORS configurado correctamente
- [ ] Rate limiting habilitado
- [ ] Tests exitosos en staging
- [ ] Monitoring activo

---

## 📚 Referencias

- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Gemini API - Content Generation](https://ai.google.dev/api/rest/v1/models/generateContent)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)
