# 🔧 GUÍA PASO A PASO: Configurar Variables en Vercel

## ⚠️ PROBLEMA COMÚN
Si el formulario no funciona y ves el error `VITE_N8N_WEBHOOK_URL is not configured`, significa que Vercel NO está leyendo las variables de entorno durante el build.

---

## ✅ SOLUCIÓN: Verificar Variables en Vercel

### Paso 1: Ir a la sección correcta
1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto **smart-connect**
3. Click en **Settings** (en el menú superior)
4. Click en **Environment Variables** (menú lateral izquierdo)

### Paso 2: Verificar que las variables existan
Deberías ver estas 6 variables en la lista:

```
VITE_CONTACT_EMAIL
VITE_N8N_WEBHOOK_URL
VITE_GOOGLE_SHEETS_ID
VITE_GEMINI_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Paso 3: Verificar que estén en "Production"
Para CADA variable, debe haber un checkbox marcado en:
- ✅ Production
- ✅ Preview (opcional pero recomendado)
- ✅ Development (opcional)

**CRÍTICO:** Si "Production" NO está marcado, Vercel NO usará esa variable en el build de producción.

---

## 🔄 Si las variables NO existen o NO tienen Production marcado:

### Añadir una variable:
1. Click en **"Add New"** (botón en la parte superior)
2. En "Key" escribe exactamente: `VITE_N8N_WEBHOOK_URL`
3. En "Value" pega: `https://n8n-production-12fbe.up.railway.app/webhook-test/hot-lead-intake`
4. En "Environments" marca:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

Repite para las otras 5 variables.

---

## 🚀 DESPUÉS de añadir/corregir variables:

### OBLIGATORIO: Redeploy
Las variables solo se aplican a NUEVOS builds, no a los existentes.

1. Ve a la pestaña **Deployments**
2. Click en el deployment más reciente
3. Click en el menú de **3 puntos (...)** en la esquina superior derecha
4. Click en **"Redeploy"**
5. **NO marques** "Use existing Build Cache" (queremos un build fresco)
6. Click **Redeploy**

Espera 1-2 minutos a que termine el build.

---

## 🧪 VERIFICAR que funcionó:

1. Abre tu sitio: https://digitalizatenerife.es
2. Abre la consola del navegador (F12 → Console)
3. **Si ya NO ves** el error `❌ CRITICAL: VITE_N8N_WEBHOOK_URL is not configured` → ✅ ÉXITO
4. Prueba el formulario de contacto

---

## 🆘 Si sigue sin funcionar:

### Opción A: Verificar que Vercel lee las variables
En los Build Logs del deployment, busca la sección:
```
🔍 ===== VERCEL BUILD DEBUG =====
```

Debe mostrar:
```
- VITE_N8N_WEBHOOK_URL: ✅ SET
```

Si muestra `❌ NOT SET`, las variables NO están configuradas correctamente.

### Opción B: Verificar permisos del proyecto
Asegúrate de que eres el owner del proyecto en Vercel. Si es un proyecto de equipo, puede que necesites permisos de admin para editar Environment Variables.

---

## 📋 CHECKLIST FINAL

- [ ] Variables añadidas en Settings → Environment Variables
- [ ] Cada variable tiene el prefijo `VITE_`
- [ ] "Production" está marcado para TODAS las variables
- [ ] Hice un Redeploy SIN cache
- [ ] El deployment terminó exitosamente
- [ ] Ya NO veo el error en la consola del navegador
- [ ] El formulario envía correctamente

---

## 📝 VALORES EXACTOS (para copiar/pegar):

```env
VITE_CONTACT_EMAIL=jmaristia@gmail.com

VITE_N8N_WEBHOOK_URL=https://n8n-production-12fbe.up.railway.app/webhook-test/hot-lead-intake

VITE_GOOGLE_SHEETS_ID=1ozjw4PGtBQZc1KFWlUxahz9qRmBOZDvVR6UyoIGBHl0

VITE_GEMINI_API_KEY=your_gemini_api_key_here

VITE_SUPABASE_URL=https://your-project.supabase.co

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**¡Importante!** Copia cada valor COMPLETO, sin espacios al principio o final.
