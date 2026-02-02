# Test Railway n8n Webhook
# Este script verifica que el webhook de n8n en Railway este funcionando correctamente

Write-Host "Testing Railway n8n Webhook..." -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://n8n-production-12fbe.up.railway.app/webhook-test/hot-lead-intake"

$body = @{
    nombre = "Test User Railway"
    empresa = "Test Company"
    email = "test@smartconnect.ai"
    servicio_interes = "IA & Automatizacion"
    mensaje_cuerpo = "Este es un test desde PowerShell. Necesito una reunion urgente hoy. Presupuesto aprobado."
} | ConvertTo-Json -Depth 10

Write-Host "Sending request to:" -ForegroundColor Yellow
Write-Host $webhookUrl -ForegroundColor White
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body $body -ContentType "application/json; charset=utf-8" -UseBasicParsing
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content -ForegroundColor White
    Write-Host ""
    Write-Host "El webhook esta funcionando correctamente!" -ForegroundColor Green
    Write-Host "Verifica:" -ForegroundColor Yellow
    Write-Host "  1. Google Sheets (deberia aparecer un nuevo registro)" -ForegroundColor White
    Write-Host "  2. Tu email (si el lead es caliente)" -ForegroundColor White
    Write-Host "  3. Telegram (si esta configurado)" -ForegroundColor White
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  1. El workflow no esta activado en n8n" -ForegroundColor White
    Write-Host "  2. La URL del webhook es incorrecta" -ForegroundColor White
    Write-Host "  3. n8n no esta funcionando en Railway" -ForegroundColor White
}
