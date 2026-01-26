# 🤖 AGENT.md: SmartConnect AI - Business Accelerator

Este documento establece el contexto, reglas y arquitectura para el desarrollo de SmartConnect AI, un ecosistema diseñado para potenciar negocios locales mediante software, automatización e IA.

---

## 🎯 PROPÓSITO DE NEGOCIO (Agencia-Escuela)
El objetivo es transformar negocios mediante soluciones técnicas que aporten valor inmediato. 
- **Reputación:** Tarjetas NFC/QR para potenciar Google Reviews e Instagram (estilo Tapstar).
- **Digitalización:** Producto estrella "QRIBAR" (Carta digital con pedidos en mesa).
- **Crecimiento:** Automatizaciones de captación y fidelización basadas en la temperatura del lead.

---

## 🏗️ ARQUITECTURA HÍBRIDA & STACK
El proyecto sigue un modelo de alto rendimiento y escalabilidad:

1. **Landing Page (SEO Frontend):** - **Stack:** Next.js + TypeScript + Tailwind CSS.
   - **Misión:** Indexación SEO máxima y landing de conversión para campañas de Facebook/Google.
2. **Dashboard & Chatbot (App Frontend):** - **Stack:** Flutter Web.
   - **Misión:** Panel de administración y Chatbot experto con arquitectura RAG.
3. **Orquestador (Automation Backend):** - **Stack:** n8n en Docker (VPS propio).
   - **Misión:** Gestión de leads, análisis de sentimiento y notificaciones.
4. **Cerebro IA:** - **API:** Gemini (Google AI Studio) - Pago por uso.
   - **Protocolo:** MCP (Model Context Protocol) para conexión de datos.

---

## 🛠️ METODOLOGÍA Y REGLAS TÉCNICAS
Se aplican los estándares de calidad del Máster de Desarrollo con IA:

1. **TDD (Test-Driven Development):** - Escribir test PRIMERO -> Rojo -> Verde -> Refactorizar.
2. **Clean Architecture & Scope Rule:**
   - **Capas:** Data (Infra), Domain (Business Logic), Presentation (UI).
   - **Shared Scope:** Código global reutilizable.
   - **Local Scope:** Lógica específica de la feature (ej: /qribar-menu, /lead-scoring).
3. **Seguridad (Security by Design):**
   - Implementación estricta de mitigaciones OWASP Top 10.
   - Validación de datos sensibles y variables de entorno.

---

## 🔄 FLUJO DEL LEAD (Pipeline)
1. **Captación:** Botones con asuntos predefinidos en la Landing de Next.js.
2. **Chatbot RAG:** El bot en Flutter responde dudas usando el índice de QRIBAR o Reviews.
3. **Análisis n8n:** Recepción de email -> Agente IA analiza "Temperatura" y sentimiento.
4. **Registro:** Guardado automático en Google Sheets con actualización de estados.
5. **Cierre:** Lead Caliente -> Notificación Telegram + Email HTML con botón de llamada (Webhook tracking).

---

## 📋 INSTRUCCIONES PARA LA IA (TU ROL)
- **Precisión:** NO generes código no solicitado.
- **TDD:** Si pido un TEST, genera SOLO el test. Si pido IMPLEMENTACIÓN, genera SOLO la implementación.
- **Contexto:** Usa siempre el RAG de conocimiento sobre QRIBAR y servicios de software para las respuestas del bot.
- **Negocio:** Cada línea de código debe estar orientada a facilitar la venta o la conversión del cliente final.

---

**¿Entendido? Confirma para comenzar con el primer paso del desarrollo.**