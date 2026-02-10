# Audit Log: Eliminación de cita 'Según el Documento 1' en respuestas RAG

**Fecha:** 2026-02-10

**Descripción:**
Se eliminó la instrucción del prompt en la Edge Function `chat-with-rag` que pedía citar "Según el Documento 1..." en las respuestas generadas por Gemini. Ahora el asistente responde solo con la información del contexto, sin añadir referencias automáticas a documentos.

**Motivo:**
Mejorar la naturalidad de las respuestas y evitar frases innecesarias para el usuario final.

**Archivo modificado:**
- `supabase/functions/chat-with-rag/index.ts`

**Responsable:** GitHub Copilot
