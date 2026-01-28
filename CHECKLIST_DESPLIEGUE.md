# 🚀 DESPLIEGUE EDGE FUNCTIONS - CHECKLIST VISUAL

## ✅ ESTADO: CÓDIGO COMPLETO, LISTO PARA DESPLEGAR

---

## 📋 CHECKLIST DE DESPLIEGUE

### PRE-REQUISITOS
- [x] Código Edge Functions creado (`supabase/functions/`)
- [x] React component refactorizado (`ExpertAssistantWithRAG.tsx`)
- [x] Script de despliegue creado (`deploy-edge-functions.ps1`)
- [x] Documentación completa (`docs/EDGE_FUNCTIONS_DEPLOYMENT.md`)
- [x] Tests de validación creados (`test_edge_functions.js`)
- [x] `GEMINI_API_KEY` en `.env.local` (SIN prefijo `VITE_`)
- [x] **Supabase CLI instalado** → `supabase --version` (2.72.7)
- [x] **Modelo actualizado** → gemini-embedding-001 (768 dim) - 28/01/2026
- [x] **Base de datos entrenada** → 10 documentos insertados exitosamente

---

## 🎯 PASO 1: DESPLEGAR EDGE FUNCTIONS

### Comando:
```powershell
.\deploy-edge-functions.ps1
```

### ¿Qué hace el script?
1. ✅ Verifica que Supabase CLI esté instalado
2. 🔐 Login a Supabase (abre navegador para autenticación)
3. 🔗 Conecta al proyecto `tysjedvujvsmrzzrmesr`
4. 🔑 Configura `GEMINI_API_KEY` desde `.env.local`
5. 📤 Despliega `gemini-embedding`
6. 📤 Despliega `gemini-generate`
7. ✨ Muestra URLs de las funciones

### Checklist durante ejecución:
- [x] Script inicia sin errores
- [x] Navegador abre para login de Supabase
- [x] Login exitoso (✅ en la terminal)
- [x] Proyecto conectado (✅ en la terminal)
- [x] `GEMINI_API_KEY` configurado (✅ en la terminal)
- [x] `gemini-embedding` desplegado (✅ en la terminal) - **v1beta**
- [x] `gemini-generate` desplegado (✅ en la terminal) - **v1beta**
- [x] URLs mostradas al final

---

## 🧪 PASO 2: VALIDAR EDGE FUNCTIONS

### Comando:
```powershell
node test_edge_functions.js
```

### Checklist de validación:
- [x] Test 1 (gemini-embedding) muestra: `✅ Success: Embedding generado (768 dimensiones)`
- [x] Test 2 (gemini-generate) muestra: `✅ Success: Respuesta generada` - **gemini-2.5-flash**
- [x] **NO** aparecen errores `❌ Error:`

### Si hay errores:
1. Verifica que las funciones estén activas en [Supabase Dashboard](https://supabase.com/dashboard/project/tysjedvujvsmrzzrmesr)
2. Revisa los logs en Dashboard → Edge Functions → gemini-embedding/gemini-generate → Logs
3. Verifica que `GEMINI_API_KEY` esté configurado: `supabase secrets list`

---

## 🎨 PASO 3: PROBAR CHATBOT EN VIVO

### Comando:
```powershell
npm run dev
```

### Checklist de prueba:
- [x] Aplicación abre en http://localhost:5173
- [x] Botón del chatbot visible (esquina inferior derecha)
- [x] Clic en el chatbot abre el panel
- [x] Escribir: **"¿Cuánto cuesta QRIBAR?"**
- [x] Chatbot responde con información de pricing
- [x] Respuesta menciona precios correctos (del knowledge base)
- [x] **NO** aparece "Lo siento, tuve un problema..."

---

## 🔒 PASO 4: VALIDAR SEGURIDAD

### Abrir DevTools:
1. En el navegador, presiona **F12**
2. Ve a la pestaña **Network**
3. Escribe una pregunta en el chatbot
4. Observa las peticiones HTTP

### Checklist de seguridad:
- [x] Aparecen peticiones a: `https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding`
- [x] Aparecen peticiones a: `https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-generate`
- [x] **NO** aparecen peticiones a: `https://generativelanguage.googleapis.com/...?key=AIza...`
- [x] En la pestaña **Payload**, **NO** aparece `GEMINI_API_KEY`

### ✅ CONFIRMACIÓN VISUAL:

**ANTES (Inseguro):**
```
Network Tab:
  generativelanguage.googleapis.com/v1beta/...?key=AIzaSy***[EXPUESTA]
  👆 ❌ API KEY EXPUESTA
```

**DESPUÉS (Seguro):**
```
Network Tab:
  tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding
  tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-generate
  👆 ✅ API KEY OCULTA (server-side)
```

---

## 📊 RESUMEN FINAL

### Estado Actual (28/01/2026 - 21:15h):
- [x] Edge Functions desplegadas correctamente
- [x] **Modelo embedding:** gemini-embedding-001 (v1beta + 768 dim)
- [x] **Modelo chat:** gemini-2.5-flash (v1beta)
- [x] **Base de datos entrenada:** 10 documentos con embeddings de 768 dimensiones
- [x] **Tests de búsqueda:** 70-83% similarity (✅ validado)
- [x] **Tests Edge Functions:** ✅ Todos pasados
- [x] **Chatbot funcionando:** ✅ Respuestas correctas con RAG
- [x] Seguridad validada (API key oculta)

### Detalles técnicos del RAG:
```
✅ Documentos insertados: 10
❌ Errores: 0

📊 Resultados de búsqueda:
1. "cuánto cuesta un menú digital?" → 70.1% match (QRIBAR)
2. "cómo funciona la automatización n8n?" → 83.7% match (n8n)
3. "quiero más reseñas en Google" → 72.0% match (Tap-to-Review)
```

### ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE:
```
┌────────────────────────────────────────────┐
│  ✨ DESPLIEGUE EXITOSO                     │
│  🔒 API key segura (server-side)           │
│  🤖 RAG con 10 documentos entrenados       │
│  💬 gemini-2.5-flash funcionando           │
│  🔍 gemini-embedding-001 (768 dim)         │
│  ✅ Chatbot funcionando correctamente      │
│  🎯 Listo para producción                  │
└────────────────────────────────────────────┘
```

### Próximos pasos:
1. ✅ Commit y push al repositorio
2. ✅ Documentar cualquier issue encontrado
3. ✅ Continuar con siguiente feature

---

## 🐛 TROUBLESHOOTING RÁPIDO

| Problema | Solución |
|----------|----------|
| `supabase: command not found` | `npm install -g supabase` |
| Login falla | `supabase logout` → `supabase login` |
| Function deploy falla | `supabase functions delete <name>` → re-deploy |
| `Missing GEMINI_API_KEY` | `supabase secrets set GEMINI_API_KEY="..."` |
| Chatbot no responde | Revisar logs en Supabase Dashboard |
| Error CORS | Verificar headers en Edge Functions |

---

## 📞 SOPORTE

- 📄 **Guía Completa:** `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`
- 📄 **README Técnico:** `supabase/functions/README.md`
- 📄 **Resumen Ejecutivo:** `RESUMEN_EDGE_FUNCTIONS.md`
- 🔗 **Supabase Docs:** https://supabase.com/docs/guides/functions
- 🔗 **Gemini API Docs:** https://ai.google.dev/docs

---

## 🎓 NOTAS IMPORTANTES

1. **No exponer GEMINI_API_KEY en el código**
   - ❌ NUNCA: `import.meta.env.VITE_GEMINI_API_KEY`
   - ✅ SIEMPRE: `supabase.functions.invoke('gemini-...')`

2. **Free tier es suficiente**
   - 500K invocaciones/mes en Supabase
   - 1,500 requests/día en Gemini
   - No necesitas tarjeta de crédito

3. **Edge Functions son globales**
   - Red CDN de Deno Deploy
   - Baja latencia desde cualquier región
   - Auto-scaling sin configuración

---

**¿Listo para comenzar?**

```powershell
.\deploy-edge-functions.ps1
```

*Después de ejecutar cada paso, marca el checkbox correspondiente.*
