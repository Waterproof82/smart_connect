# Test Gemini API Key directly
$apiKey = "AIzaSyCar45i6iVddfuO0IjzaLjcTESIRHnaMDM"

$headers = @{
    "Content-Type" = "application/json"
    "x-goog-api-key" = $apiKey
}

$body = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Say 'Hello World'" }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Testing gemini-1.5-flash..."
    $response = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" -Method POST -Headers $headers -Body $body
    Write-Host "✅ gemini-1.5-flash works!"
    Write-Host $response.Content
} catch {
    Write-Host "❌ gemini-1.5-flash failed:"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
