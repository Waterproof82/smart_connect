# SmartConnect AI - Edge Functions Deployment
param([string]$Function = "all", [switch]$SkipSecrets, [switch]$DryRun)

Write-Host "`n SUPABASE EDGE FUNCTIONS DEPLOYMENT`n" -ForegroundColor Cyan

# Check Supabase CLI
Write-Host " Checking Supabase CLI..." -ForegroundColor Yellow
supabase projects list | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host " Not logged in. Run: supabase login" -ForegroundColor Red
    exit 1
}
Write-Host " Authenticated`n" -ForegroundColor Green

# Load .env.local
Write-Host " Loading .env.local..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host " .env.local not found" -ForegroundColor Red
    exit 1
}

$env = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $env[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$GEMINI_KEY = $env["GEMINI_API_KEY"]
$SUPABASE_URL = $env["VITE_SUPABASE_URL"]
$ANON_KEY = $env["VITE_SUPABASE_ANON_KEY"]
$SERVICE_KEY = $env["SUPABASE_SERVICE_ROLE_KEY"]

if (-not $GEMINI_KEY -or -not $SUPABASE_URL -or -not $SERVICE_KEY -or -not $ANON_KEY) {
    Write-Host " Missing required env vars" -ForegroundColor Red
    exit 1
}
Write-Host " Environment loaded`n" -ForegroundColor Green

# Set secrets
if (-not $SkipSecrets -and -not $DryRun) {
    Write-Host " Setting secrets..." -ForegroundColor Yellow
    supabase secrets set GEMINI_API_KEY="$GEMINI_KEY" --project-ref tysjedvujvsmrzzrmesr
    supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref tysjedvujvsmrzzrmesr
    supabase secrets set SUPABASE_ANON_KEY="$ANON_KEY" --project-ref tysjedvujvsmrzzrmesr
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY" --project-ref tysjedvujvsmrzzrmesr
    supabase secrets set ALLOWED_ORIGIN="*" --project-ref tysjedvujvsmrzzrmesr
    Write-Host " Secrets configured`n" -ForegroundColor Green
}

# Deploy functions
Write-Host " Deploying Edge Functions...`n" -ForegroundColor Yellow

$fns = if ($Function -eq "all") { @("gemini-chat", "gemini-generate", "gemini-embedding") } else { @($Function) }

foreach ($fn in $fns) {
    Write-Host "   Deploying $fn..." -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "  [DRY RUN]" -ForegroundColor Gray
    } else {
        supabase functions deploy $fn --project-ref tysjedvujvsmrzzrmesr
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   $fn deployed`n" -ForegroundColor Green
        }
    }
}

Write-Host "`n DEPLOYMENT COMPLETE`n" -ForegroundColor Green
Write-Host " Function URLs:" -ForegroundColor Cyan
Write-Host "   gemini-chat: https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat" -ForegroundColor White
Write-Host "   gemini-generate: https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-generate" -ForegroundColor White
Write-Host "   gemini-embedding: https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding`n" -ForegroundColor White
