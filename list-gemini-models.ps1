# List available Gemini models
$apiKey = "AIzaSyCar45i6iVddfuO0IjzaLjcTESIRHnaMDM"

try {
    $response = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey" -Method GET
    $models = ($response.Content | ConvertFrom-Json).models
    
    Write-Host "`n✅ Available models for generateContent:`n"
    foreach ($model in $models) {
        if ($model.supportedGenerationMethods -contains "generateContent") {
            Write-Host "  - $($model.name)"
        }
    }
} catch {
    Write-Host "❌ Error listing models:"
    Write-Host $_.Exception.Message
}
