# 🏠 Slide 01: Sistema Completo

## SmartConnect AI - Vista General del Ecosistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMARTCONNECT AI                                   │
│                    Business Accelerator con IA                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUARIO FINAL                                   │
│   (Cliente potencial del negocio local: restaurante, tienda, profesional)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        1. LANDING PAGE (SEO)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • React + Vite + TypeScript + Tailwind                           │    │
│  │  • Indexación Google/Bing                                          │    │
│  │  • Botones de contacto (WhatsApp, formulario)                     │    │
│  │  • QR Codes para Google Reviews                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                  │                    │                    
                  ▼                    ▼                    
    ┌──────────────────┐  ┌──────────────────┐  
    │   2. CHATBOT    │  │  3. FORMULARIO  │  
    │   (Asistente IA)│  │   (Contacto)      │  
    └──────────────────┘  └──────────────────┘  
           │                       │                    
           └───────────────────────┼──────────────────────┐
                                   ▼                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                         4. n8n (ORQUESTADOR)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • Receives webhooks                                               │    │
│  │  • AI Agent: analiza temperatura del lead                         │    │
│  │  • Clasifica: Frío / Tibio / Caliente                            │    │
│  │  • Notificaciones: Telegram + Email                               │    │
│  │  • Google Sheets: Registro automático                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │ Telegram  │   │   Email   │   │  Sheets   │
            │  (Admin)  │   │ (Cliente) │   │  (CRM)   │
            └───────────┘   └───────────┘   └───────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           5. SUPABASE (BACKEND)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │  pgvector   │  │   Edge     │  │    Auth     │        │
│  │  (Datos)    │  │ (Búsqueda)  │  │ Functions  │  │  (JWT/RLS)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  GEMINI API (Google AI Studio) - Cerebro IA                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes Clave

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Landing | React + Vite | Captación SEO |
| Chatbot | RAG + Gemini | Asistente IA (incluye info de servicios) |
| n8n | Workflows | Automatización |
| Supabase | BaaS | Backend + DB |
| Gemini | LLM | Procesamiento IA |

---

## Servicios Ofrecidos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICIOS SMARTCONNECT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐│
│  │   SOFTWARE & IA    │  │  AUTOMATIZACIÓN n8n │  │    TARJETAS NFC    ││
│  │                     │  │                     │  │                     ││
│  │  • Webs a medida   │  │  • Workflows auto   │  │  • Google Reviews  ││
│  │  • Apps mobiles     │  │  • Lead scoring     │  │  • Tap to Review   ││
│  │  • Chatbots IA      │  │  • Notificaciones   │  │  • QR Codes        ││
│  │                     │  │  • Integraciones    │  │                     ││
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PRODUCTOS EXTERNOS (enlazados desde landing)                      │   │
│  │                                                                       │   │
│  │  • QRIBAR (https://qribar.es) - Menú digital para restaurantes   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

```
Usuario → Landing → [Chatbot | Formulario]
                        │
                        ▼
                  n8n Webhook
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
    Telegram         Email           Sheets
    (Notif)         (Auto)          (CRM)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMARTCONNECT AI                                   │
│                    Business Accelerator con IA                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUARIO FINAL                                   │
│   (Cliente potencial del negocio local: restaurante, tienda, profesional)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        1. LANDING PAGE (SEO)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • React + Vite + TypeScript + Tailwind                           │    │
│  │  • Indexación Google/Bing                                          │    │
│  │  • Botones de contacto (WhatsApp, formulario)                     │    │
│  │  • QR Codes para Google Reviews                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                  │                    │                    ▼                    ▼                    │
                  ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   2. QRIBAR      │  │   3. CHATBOT     │  │  4. FORMULARIO   │
    │   (Carta QR)     │  │   (Asistente IA) │  │   (Contacto)     │
    └──────────────────┘  └──────────────────┘  └──────────────────┘
           │                       │                      │
           └───────────────────────┼──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         5. n8n (ORQUESTADOR)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • Receives webhooks                                               │    │
│  │  • AI Agent: analiza temperatura del lead                         │    │
│  │  • Clasifica: Frío / Tibio / Caliente                            │    │
│  │  • Notificaciones: Telegram + Email                               │    │
│  │  • Google Sheets: Registro automático                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │ Telegram  │   │   Email   │   │  Sheets   │
            │  (Admin)  │   │ (Cliente) │   │  (CRM)   │
            └───────────┘   └───────────┘   └───────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           6. SUPABASE (BACKEND)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │  pgvector   │  │   Edge     │  │    Auth     │        │
│  │  (Datos)    │  │ (Búsqueda)  │  │ Functions  │  │  (JWT/RLS)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  GEMINI API (Google AI Studio) - Cerebro IA                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes Clave

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Landing | React + Vite | Captación SEO |
| QRIBAR | QR + Web App | Menú digital |
| Chatbot | RAG + Gemini | Asistente IA |
| n8n | Workflows | Automatización |
| Supabase | BaaS | Backend + DB |
| Gemini | LLM | Procesamiento IA |

---

## Flujo de Datos

```
Usuario → Landing → [QRIBAR | Chatbot | Formulario]
                            │
                            ▼
                      n8n Webhook
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
        Telegram         Email           Sheets
        (Notif)         (Auto)          (CRM)
```
