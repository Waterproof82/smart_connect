# Quick test
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDE5NjIsImV4cCI6MjA4NTExNzk2Mn0.wwEaxcanylAFKY1x6NNNlewEcQPby0zdo9Q93qqe3dM"
    "Content-Type" = "application/json"
}

$body = '{"userQuery":"Test"}'

try {
    $response = Invoke-WebRequest -Uri "https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "✅ Success:" $response.Content
} catch {
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "❌ Error:" $reader.ReadToEnd()
    } else {
        Write-Host "❌" $_.Exception.Message
    }
}
