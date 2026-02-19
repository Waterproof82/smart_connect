# 🔐 GitHub Actions CI/CD Setup

Este proyecto usa GitHub Actions para validación automática de código, seguridad y builds.

## 🚀 ¿Qué hace este workflow?

### En cada **Push a `main`**:
1. ✅ **Lint:** Verifica calidad de código con ESLint
2. ✅ **Type Check:** Valida tipos de TypeScript
3. ✅ **Security Scan:** Analiza vulnerabilidades con Snyk
4. ✅ **Build:** Compila el proyecto con Vite
5. ✅ **Monitoring:** Envía reporte a Snyk para seguimiento continuo

### En cada **Pull Request**:
1. ✅ **Lint + Type Check + Build**
2. ✅ **Security Gate:** Bloquea el PR si hay vulnerabilidades críticas

### Exclusiones:
- ❌ No se ejecuta si solo cambias archivos en `docs/**` o `*.md`

---

## ⚙️ CONFIGURACIÓN REQUERIDA

### 1️⃣ Crear cuenta en Snyk

1. Ve a https://snyk.io/
2. Regístrate con tu cuenta de GitHub
3. Plan gratuito incluye:
   - ✅ 200 tests/mes
   - ✅ Monitoreo ilimitado de proyectos open source

### 2️⃣ Obtener el Token de Snyk

1. Una vez logueado, ve a: https://app.snyk.io/account
2. Busca la sección **"Auth Token"**
3. Click en **"Show"** y **copia** el token (empieza con algo como `a1b2c3d4-...`)

### 3️⃣ Agregar el Secret en GitHub

1. Ve a tu repositorio: https://github.com/Waterproof82/smart_connect
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **"New repository secret"**
4. En "Name" escribe: `SNYK_TOKEN`
5. En "Secret" pega el token que copiaste de Snyk
6. Click **"Add secret"**

---

## 🧪 Probar el Workflow

### Opción 1: Push a main
```bash
git add .
git commit -m "test: trigger CI/CD"
git push origin main
```

### Opción 2: Ejecutar manualmente
1. Ve a https://github.com/Waterproof82/smart_connect/actions
2. Click en **"CI/CD Pipeline - SmartConnect AI"**
3. Click en **"Run workflow"** → **"Run workflow"**

---

## 📊 Ver resultados

1. Ve a: https://github.com/Waterproof82/smart_connect/actions
2. Click en el workflow run más reciente
3. Verás 2 jobs:
   - **🚀 Quality, Security & Build** (principal)
   - **📢 Status Report** (resumen)

### Estados posibles:
- ✅ **Verde:** Todo OK, código listo para producción
- ❌ **Rojo:** Algo falló (lint, type-check, security o build)
- 🟡 **Amarillo:** En progreso

---

## 🛡️ Security Gate (Snyk)

### En Pull Requests:
- **Bloquea** si encuentra vulnerabilidades de **severidad alta o crítica**
- Threshold configurado: `--severity-threshold=high`

### En Push a main:
- **NO bloquea**, solo monitorea
- Envía reporte a Snyk Dashboard para seguimiento

### Ver vulnerabilidades:
1. Ve a https://app.snyk.io/
2. Busca el proyecto **"SmartConnect-AI-Production"**
3. Verás todas las vulnerabilidades detectadas con recomendaciones

---

## 🐛 Troubleshooting

### Error: "Snyk auth failed"
**Causa:** El secret `SNYK_TOKEN` no existe o es inválido

**Solución:**
1. Verifica que el secret existe en GitHub Settings
2. Regenera el token en https://app.snyk.io/account
3. Actualiza el secret en GitHub

### Error: "npm ci failed"
**Causa:** Problema con dependencias en `package-lock.json`

**Solución:**
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate package-lock"
git push
```

### Lint warnings > 50
**Causa:** Demasiados warnings de ESLint

**Solución:**
- Puedes aumentar el límite en `.github/workflows/ci-cd.yml`: `--max-warnings 100`
- O mejor: arregla los warnings ejecutando `npm run lint` localmente

---

## 📦 Build Artifacts

Los builds se guardan como artifacts en GitHub Actions por **7 días**.

### Descargar un build:
1. Ve al workflow run en Actions
2. Scroll hasta **"Artifacts"** (al final)
3. Click en **"build-output"** para descargar

Útil para:
- ✅ Debugging de builds en CI
- ✅ Comparar builds entre commits
- ✅ Testing manual antes de deploy

---

## 🔄 Relación con Vercel

**Este workflow NO hace deploy.** Vercel ya lo hace automáticamente.

**Flujo completo:**
1. Push a `main` → GitHub Actions ejecuta validaciones
2. Si GitHub Actions pasa ✅ → Vercel auto-deploys
3. Si GitHub Actions falla ❌ → Vercel igual hace deploy (pero sabes que algo está mal)

**Ventaja:** Detectas problemas ANTES de que lleguen a producción.

---

## 📝 Configuración avanzada

### Cambiar el threshold de Snyk:
```yaml
run: snyk test --severity-threshold=medium  # medium, high, o critical
```

### Deshabilitar Snyk temporalmente:
Comenta las líneas 31-41 en `.github/workflows/ci-cd.yml`

### Agregar tests:
```yaml
- name: Run tests
  run: npm run test
```
*(Primero necesitas crear tests en el proyecto)*

---

## ✅ Checklist de configuración

- [ ] Cuenta de Snyk creada
- [ ] Token de Snyk obtenido
- [ ] Secret `SNYK_TOKEN` agregado en GitHub
- [ ] Primer workflow ejecutado exitosamente
- [ ] Proyecto visible en Snyk Dashboard

---

**¿Necesitas ayuda?** Revisa los logs en GitHub Actions o el dashboard de Snyk.
