# 🚀 Despliegue de Edge Functions - Supabase

## ✅ Estado Actual

### Archivos Creados
- ✅ `supabase/functions/gemini-embedding/index.ts` - Function para generar embeddings
- ✅ `supabase/functions/gemini-generate/index.ts` - Function para generar respuestas
- ✅ `deploy-edge-functions.ps1` - Script de despliegue automatizado
- ✅ `ExpertAssistantWithRAG.tsx` - Componente actualizado para usar Edge Functions

### ¿Qué son las Edge Functions?

Las **Supabase Edge Functions** son funciones serverless que se ejecutan en la infraestructura de Supabase (Deno runtime). Son perfectas para:
- 🔒 **Ocultar API keys** del navegador (server-side)
- ⚡ **Baja latencia** (red global de Deno Deploy)
- 💰 **Free tier generoso** (500K invocaciones/mes)
- 🚫 **Sin servidor propio** (sin Express, sin VPS)

---

## 📦 Pre-requisitos

### 1. Instalar Supabase CLI

```powershell
npm install -g supabase
```

### 2. Verificar instalación

```powershell
supabase --version
```

---

## 🚀 Despliegue Automático (Recomendado)

Ejecuta el script que automatiza todo el proceso:

```powershell
.\deploy-edge-functions.ps1
```

El script:
1. ✅ Verifica Supabase CLI
2. 🔐 Login a Supabase (abre navegador)
3. 🔗 Conecta al proyecto `tysjedvujvsmrzzrmesr`
4. 🔑 Configura `GEMINI_API_KEY` desde `.env.local`
5. 📤 Despliega `gemini-embedding`
6. 📤 Despliega `gemini-generate`
7. ✨ Muestra URLs de las funciones

---

## 🛠️ Despliegue Manual (Alternativa)

Si prefieres hacerlo paso a paso:

### 1. Login a Supabase

```powershell
supabase login
```

Se abrirá el navegador para autenticación.

### 2. Link al proyecto

```powershell
supabase link --project-ref tysjedvujvsmrzzrmesr
```

### 3. Configurar GEMINI_API_KEY

```powershell
# Lee la API key de .env.local
$geminiKey = Get-Content .\.env.local | Select-String -Pattern "^GEMINI_API_KEY=" | ForEach-Object { $_.Line -replace "^GEMINI_API_KEY=", "" }

# Configúrala en Supabase
supabase secrets set GEMINI_API_KEY="$geminiKey"
```

### 4. Desplegar funciones

```powershell
# Desplegar gemini-embedding
supabase functions deploy gemini-embedding

# Desplegar gemini-generate
supabase functions deploy gemini-generate
```

---

## 🧪 Verificar Despliegue

### 1. Revisar en Supabase Dashboard

1. Ve a https://supabase.com/dashboard/project/tysjedvujvsmrzzrmesr
2. Navega a **Edge Functions**
3. Verifica que ambas funciones aparezcan como **Active**

### 2. Test manual con cURL

```powershell
# Test gemini-embedding
$headers = @{
    "Authorization" = "Bearer YOUR_SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    text = "¿Cuánto cuesta QRIBAR?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## 🔍 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│  NAVEGADOR (React + Vite)                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ExpertAssistantWithRAG.tsx                            │  │
│  │  - NO expone GEMINI_API_KEY                           │  │
│  │  - Llama a supabase.functions.invoke()               │  │
│  └───────────┬───────────────────────────────────────────┘  │
└──────────────┼─────────────────────────────────────────────┘
               │
               │ HTTPS (Supabase Client)
               ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTIONS (Deno Runtime)                     │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │ gemini-embedding    │    │ gemini-generate          │   │
│  │  - Lee API key de   │    │  - Lee API key de        │   │
│  │    Deno.env         │    │    Deno.env              │   │
│  │  - Genera embeddings│    │  - Genera respuestas     │   │
│  └──────────┬──────────┘    └───────────┬──────────────┘   │
└─────────────┼──────────────────────────┼──────────────────┘
              │                           │
              │ HTTPS                     │ HTTPS
              ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│  GEMINI API (Google AI Studio)                              │
│  - text-embedding-004 (embeddings)                          │
│  - gemini-2.0-flash-exp (generación)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad

### ✅ ANTES (Inseguro)
```typescript
// ❌ API key expuesta en el navegador
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
fetch(`https://generativelanguage.googleapis.com/...?key=${GEMINI_API_KEY}`);
```

### ✅ DESPUÉS (Seguro)
```typescript
// ✅ API key oculta en server-side
const { data } = await supabase.functions.invoke('gemini-generate', {
  body: { contents, generationConfig }
});
```

---

## 📊 Costos

| Servicio | Free Tier | Costo después |
|----------|-----------|---------------|
| **Supabase Edge Functions** | 500K invocaciones/mes | $2 por millón |
| **Gemini text-embedding-004** | 1,500 requests/día | Gratis |
| **Gemini 2.0 Flash** | 1,500 requests/día | Gratis |

**Total: $0/mes** (dentro del free tier)

---

## 🎯 Próximos Pasos

1. ✅ Ejecuta `.\deploy-edge-functions.ps1`
2. ✅ Verifica despliegue en Supabase Dashboard
3. ✅ Prueba el chatbot: `npm run dev`
4. ✅ Pregunta: "¿Cuánto cuesta QRIBAR?"
5. ✅ Verifica que NO aparezca la API key en DevTools

---

## 🐛 Troubleshooting

### Error: "supabase: command not found"
```powershell
npm install -g supabase
```

### Error: "Function already exists"
```powershell
# Elimina y vuelve a desplegar
supabase functions delete gemini-embedding
supabase functions deploy gemini-embedding
```

### Error: "Missing GEMINI_API_KEY"
```powershell
# Verifica que el secreto esté configurado
supabase secrets list

# Si no está, configúralo manualmente
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

### Error CORS en el navegador
Las Edge Functions ya incluyen headers CORS. Si persiste:
1. Verifica que el código de las funciones tenga:
```typescript
return new Response(JSON.stringify(data), {
  headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" // Cambiar a tu dominio en producción
  }
});
```

---

## 📚 Referencias

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/)
- [Gemini API](https://ai.google.dev/docs)
- [AGENTS.md](../AGENTS.md) - Arquitectura del proyecto
