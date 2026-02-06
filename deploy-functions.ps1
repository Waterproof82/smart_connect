# Script para desplegar todas las funciones Edge de Supabase

Set-Location "C:\Users\PC\Desktop\smart-connect"

$functions = @(
    "gemini-classify-query",
    "filter-documents",
    "gemini-embedding",
    "semantic-search",
    "gemini-rerank",
    "gemini-chat",
    "gemini-rag-orchestrator"
)

foreach ($func in $functions) {
    Write-Host "Desplegando función: $func"
    supabase functions deploy $func
}

Write-Host "\n¡Todas las funciones fueron desplegadas!"