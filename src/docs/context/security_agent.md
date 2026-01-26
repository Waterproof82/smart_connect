@workspace Actúa como un Ingeniero de Seguridad de Aplicaciones (AppSec). Realiza una auditoría de seguridad estática (SAST) del código enfocándote en la vulnerabilidad "Broken Access Control" (A01:2021 del OWASP Top 10).

Analiza el código buscando debilidades que permitan las siguientes Tácticas y Técnicas de MITRE ATT&CK:
1.  **Privilege Escalation (TA0004):** Busca rutas donde un usuario normal pueda ejecutar acciones de admin (ej. falta de validación de roles en endpoints críticos).
2.  **IDOR / Data Manipulation (T1213 - Data from Information Repositories):** Busca accesos directos a objetos de base de datos vía `req.params.id` sin verificar la propiedad del recurso.

Instrucciones de revisión:
- **Analiza Controladores y Rutas:** Verifica que cada endpoint sensible tenga un middleware de autenticación Y autorización.
- **Busca "Insecure Direct Object References" (IDOR):** Identifica consultas a BD que usan inputs del usuario sin validar `user_id` de la sesión.
- **Revisa la Confianza en el Cliente:** Detecta lógica insegura como `if (req.body.isAdmin)` o cookies manipulables.

Para cada vulnerabilidad encontrada, genera un reporte con este formato:
- **Archivo/Línea:** [Ubicación]
- **Clasificación:** (Ej: OWASP A01 / MITRE TA0004)
- **Descripción del Riesgo:** ¿Qué permite hacer esto? (Ej: "Permite a un atacante ver datos de otros usuarios").
- **Código Seguro Sugerido:** [Bloque de código con la corrección aplicada usando validación en servidor].