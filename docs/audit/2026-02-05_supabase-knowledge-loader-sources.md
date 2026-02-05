# [2026-02-05] SupabaseKnowledgeLoader: sources solo presentes

- Se modificó el loader para que solo incluya sources presentes en los datos reales.
- Ya no se inicializan keys vacíos (qribar, reviews, general) si no hay documentos para esos sources.
- Se actualizaron los tests unitarios para reflejar este nuevo comportamiento.
- Resultado: la UI y las estadísticas solo muestran sources realmente existentes en la base de datos.
