# ADR-001: Adopción de Clean Architecture con Scope Rule

**Fecha**: 2026-01-26  
**Estado**: Aceptado

## Contexto

SmartConnect AI es un ecosistema multi-módulo que integra:
- Landing Page (Next.js con SEO)
- Chatbot RAG con IA (Gemini)
- Sistema de Lead Scoring con n8n
- Producto QRIBAR (carta digital)

El proyecto requería una arquitectura que permitiera:
1. Desarrollo paralelo de múltiples features independientes
2. Testabilidad extrema (TDD con cobertura 80%+)
3. Escalabilidad y mantenibilidad a largo plazo
4. Separación clara entre lógica de negocio e infraestructura
5. Reutilización de código común sin acoplamiento

Restricciones:
- Equipo mixto con diferentes niveles de experiencia
- Necesidad de integrar múltiples servicios externos (Gemini, n8n, Google Sheets)
- Requisitos de seguridad estrictos (OWASP Top 10)

## Opciones Consideradas

1. **Arquitectura en Capas Tradicional (MVC)**
   - Pro: Familiar para todos los desarrolladores
   - Contra: Acoplamiento alto, dificulta testing unitario

2. **Feature-First sin Clean Architecture**
   - Pro: Simplicidad inicial, rápido para prototipos
   - Contra: Dificulta la reutilización, lógica de negocio mezclada con UI

3. **Clean Architecture con Scope Rule (Shared + Local)**
   - Pro: Independencia de frameworks, testabilidad extrema, separación clara
   - Contra: Curva de aprendizaje inicial, más archivos/carpetas

4. **Arquitectura de Microservicios**
   - Pro: Máxima independencia entre módulos
   - Contra: Complejidad operacional excesiva para el tamaño del proyecto

## Decisión

Elegimos **Clean Architecture con Scope Rule (Shared + Local)**

## Justificación

- **Testabilidad TDD**: La inversión de dependencias permite mockear infraestructura fácilmente. El Domain Layer es 100% testeable sin dependencias externas.
- **Independencia de Frameworks**: La lógica de negocio (Use Cases, Entities) no depende de React, Next.js o Flutter. Podemos cambiar el framework de UI sin reescribir las reglas de negocio.
- **Scope Rule**: La separación Shared/Local evita el anti-patrón de "feature folders que importan entre sí". El código común vive en `core/` y `shared/`, el código específico en `features/`.
- **OWASP Compliance**: La capa Domain valida reglas de negocio antes de llegar a Data. La capa Data centraliza validaciones de seguridad (ej: sanitización de inputs en datasources).
- **Escalabilidad del Equipo**: Nuevos desarrolladores pueden trabajar en una feature sin afectar otras. Las interfaces del Domain actúan como contrato.
- **Integración con IA**: El patrón Repository permite abstraer las llamadas a Gemini API, facilitando cambios futuros (ej: migrar a otra IA sin tocar Use Cases).

## Consecuencias

### Positivas

- **Alta Testabilidad**: 80%+ de cobertura alcanzable con unit tests puros en Domain.
- **Mantenibilidad**: Los cambios de infraestructura (ej: cambiar de API) no afectan lógica de negocio.
- **Colaboración Paralela**: Equipos pueden trabajar en features diferentes sin conflictos de merge.
- **Documentación Implícita**: La estructura de carpetas comunica la arquitectura (Presentation → Domain → Data).
- **Seguridad**: Validaciones centralizadas en Domain y Data reducen vulnerabilidades (A03: Injection, A01: Broken Access Control).

### Negativas

- **Curva de Aprendizaje**: Desarrolladores junior necesitan capacitación en el flujo de dependencias (Dependency Rule).
- **Boilerplate Inicial**: Crear una feature requiere al menos 3 carpetas (presentation/domain/data) aunque sea simple.
- **Riesgo de Over-Engineering**: Para features triviales (ej: mostrar texto estático), la separación en 3 capas puede ser excesiva.
- **Más Archivos**: El proyecto tiene más archivos que una arquitectura plana, lo que puede intimidar al inicio.

## Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [AGENTS.md - Sección Metodología y Reglas Técnicas](../../AGENTS.md)
- [STRUCTURE.md - Flujo de Dependencias](../../STRUCTURE.md)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
