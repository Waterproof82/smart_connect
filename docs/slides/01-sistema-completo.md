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
