# Ruta de tu proyecto Supabase
Set-Location "C:\Users\PC\Desktop\smart-connect"

# Inicializa el proyecto si aún no se ha hecho
supabase init

# Lista de funciones que quieres crear
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
    Write-Host "Creando función: $func"
    
    # Ejecuta el comando para crear la función
    # La primera vez te pedirá elegir TypeScript en el CLI interactivo
    supabase functions new $func
}

Write-Host "`n¡Todas las funciones fueron creadas! Ahora instala dependencias y compila cada una."
