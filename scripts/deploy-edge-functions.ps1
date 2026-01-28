# ================================================
# SCRIPT DE DESPLIEGUE - SUPABASE EDGE FUNCTIONS
# ================================================
# Este script despliega las Edge Functions y configura los secretos

Write-Host "🚀 DESPLEGANDO EDGE FUNCTIONS A SUPABASE" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si Supabase CLI está instalado
Write-Host "📦 Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCommand) {
    Write-Host "❌ Supabase CLI no está instalado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Instálalo con:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    exit 1
}

Write-Host "✅ Supabase CLI encontrado: $($supabaseCommand.Version)" -ForegroundColor Green
Write-Host ""

# 2. Login a Supabase
Write-Host "🔐 Iniciando sesión en Supabase..." -ForegroundColor Yellow
Write-Host "   (Se abrirá el navegador para autenticación)" -ForegroundColor Gray
supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el login." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host ""

# 3. Link al proyecto
Write-Host "🔗 Conectando al proyecto Supabase..." -ForegroundColor Yellow
$projectRef = "tysjedvujvsmrzzrmesr"
supabase link --project-ref $projectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al conectar con el proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto conectado: $projectRef" -ForegroundColor Green
Write-Host ""

# 4. Configurar secreto GEMINI_API_KEY
Write-Host "🔑 Configurando GEMINI_API_KEY..." -ForegroundColor Yellow
Write-Host "   (Cargando desde .env.local)" -ForegroundColor Gray

# Leer .env.local
$envFile = ".\.env.local"
if (Test-Path $envFile) {
    $geminiKey = Get-Content $envFile | Select-String -Pattern "^GEMINI_API_KEY=" | ForEach-Object {
        $_.Line -replace "^GEMINI_API_KEY=", ""
    }
    
    if ($geminiKey) {
        # Configurar secreto en Supabase
        supabase secrets set GEMINI_API_KEY="$geminiKey"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GEMINI_API_KEY configurado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al configurar GEMINI_API_KEY" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ No se encontró GEMINI_API_KEY en .env.local" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Desplegar función gemini-embedding
Write-Host "📤 Desplegando gemini-embedding..." -ForegroundColor Yellow
supabase functions deploy gemini-embedding

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar gemini-embedding" -ForegroundColor Red
    exit 1
}

Write-Host "✅ gemini-embedding desplegado" -ForegroundColor Green
Write-Host ""

# 6. Desplegar función gemini-generate
Write-Host "📤 Desplegando gemini-generate..." -ForegroundColor Yellow
supabase functions deploy gemini-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar gemini-generate" -ForegroundColor Red
    exit 1
}

Write-Host "✅ gemini-generate desplegado" -ForegroundColor Green
Write-Host ""

# 7. Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 URLs de las Edge Functions:" -ForegroundColor Yellow
Write-Host "   - gemini-embedding: https://$projectRef.supabase.co/functions/v1/gemini-embedding" -ForegroundColor White
Write-Host "   - gemini-generate:  https://$projectRef.supabase.co/functions/v1/gemini-generate" -ForegroundColor White
Write-Host ""
Write-Host "🔒 API Key GEMINI_API_KEY está segura (server-side)" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximo paso: Prueba el chatbot en tu aplicación" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
