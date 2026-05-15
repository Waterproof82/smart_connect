# Proposal: SEO Hospitality Strategy

## Intent

Position SmartConnect AI as the leading digital solution provider for hospitality businesses in Tenerife and Canarias, focusing on **conversion-driven SEO** and **local search dominance**. This proposal outlines a comprehensive strategy to capture high-intent commercial traffic, generate qualified leads, and establish topical authority in digital solutions for hostelería.

The current website lacks a strong **commercial intent** and **local SEO focus**, resulting in low conversion rates and unqualified leads. This strategy will address these gaps by:

- Optimizing for **transactional and local search intent** (e.g., "carta digital restaurante Tenerife").
- Creating **siloed landing pages** with high-conversion copywriting.
- Building **topical authority** through blog content that directly addresses business pain points.
- Implementing **EEAT (Experience, Expertise, Authority, Trust)** principles to enhance credibility.

## Scope

### In Scope

1. **Arquitectura SEO Completa**: Siloed landing pages para cada keyword principal.
2. **Keywords Primarias y Secundarias**: Investigación y asignación por URL.
3. **Cluster Semántico**: Estructura de contenido para reforzar autoridad temática.
4. **Optimización de Títulos y Meta Descripciones**: Alineados con intención comercial y local.
5. **Estructura H1/H2/H3**: Jerarquía clara con enfoque en conversión.
6. **FAQs SEO**: Optimizadas para preguntas comerciales y locales.
7. **Copywriting Persuasivo**: Enfoque en beneficios tangibles para negocios hosteleros.
8. **Estrategia de Enlazado Interno**: Interlinking estratégico para mejorar autoridad de página.
9. **Schema Markup**: Implementación de rich snippets para mejorar CTR.
10. **Estrategia de Artículos de Blog**: Contenido orientado a intención comercial.
11. **Estrategia GEO Local**: Optimización para Tenerife, Canarias, y ciudades clave.
12. **CTAs Optimizados**: Enfoque en conversión (contacto, WhatsApp, llamadas).
13. **Estrategia de Conversión**: Flujos diseñados para capturar leads cualificados.
14. **Estrategia EEAT**: Contenido que demuestre experiencia y autoridad en hostelería.
15. **Recomendaciones Core Web Vitals**: Optimización técnica para mejorar rankings.
16. **Recomendaciones Técnicas SEO**: Incluyendo velocidad, estructura de URLs, y accesibilidad.
17. **Optimización para Búsquedas Transaccionales**: Enfoque en keywords con intención de compra.
18. **Optimización para Búsquedas "Near Me"**: Posicionamiento local agresivo.
19. **Blog SEO**: Artículos que resuelvan problemas específicos de hostelería.
20. **Ecosistema SEO para Generación de Clientes**: Contenido que convierta visitantes en leads.

### Out of Scope

- Desarrollo de nuevas funcionalidades técnicas (ej: integraciones adicionales).
- Optimización de redes sociales (fuera del alcance SEO).
- Contenido genérico sin intención comercial.
- Keywords con baja intención de compra.

## Capabilities

### New Capabilities

- **`seo-landing-pages`**: Siloed landing pages para cada keyword principal, con copywriting orientado a conversión y optimización local.
- **`geo-local-seo`**: Estrategia de posicionamiento para Tenerife, Canarias, y ciudades clave.
- **`blog-seo-commercial`**: Artículos de blog enfocados en resolver problemas específicos de hostelería y generar leads.
- **`eeat-hosteleria`**: Contenido que demuestra experiencia y autoridad en digitalización para hostelería.
- **`schema-rich-snippets`**: Implementación de schema markup para mejorar CTR y posicionamiento.
- **`interlinking-strategic`**: Enlazado interno optimizado para mejorar autoridad de página y experiencia de usuario.

### Modified Capabilities

- **`existing-content`**: Actualización de contenido existente para alinear con intención comercial y local.
- **`meta-tags`**: Optimización de títulos y meta descripciones para mejorar CTR y posicionamiento.
- **`faq-sections`**: Reescritura de FAQs para incluir preguntas comerciales y locales.

## Approach

### Arquitectura SEO

**Estructura Siloed**:

- **Home**: "digitalización para restaurantes en Tenerife" (keyword principal).
- **Landing Pages Independientes**: Cada URL enfocada en una keyword comercial específica (ej: `/carta-digital-restaurante-tenerife`).
- **Blog**: Contenido que respalda las landing pages y atrae tráfico orgánico.

**Estrategia de Contenido**:

- **Landing Pages**: Copywriting persuasivo con enfoque en beneficios tangibles (ej: "Aumenta tus reseñas Google en un 30% con nuestras tarjetas NFC").
- **Blog**: Artículos que resuelvan problemas específicos (ej: "Cómo automatizar un restaurante con n8n").
- **FAQs**: Preguntas frecuentes optimizadas para preguntas comerciales y locales.

**Optimización Técnica**:

- **Core Web Vitals**: Velocidad de carga, interactividad y estabilidad visual.
- **Schema Markup**: Implementación de rich snippets para mejorar CTR.
- **Estructura de URLs**: URLs limpias y descriptivas.

### Estrategia Local SEO

- **Palabras Clave Locales**: Integración natural de términos como "Tenerife", "Canarias", "Santa Cruz", "Adeje", etc.
- **Google Business Profile**: Vinculación con perfiles locales para reforzar autoridad.
- **Búsquedas Near Me**: Optimización para búsquedas como "carta digital restaurante cerca de mí".

## Affected Areas

| Area                                             | Impact       | Description                                                              |
| ------------------------------------------------ | ------------ | ------------------------------------------------------------------------ |
| `/src/features/landing/presentation/`            | New/Modified | Creación de landing pages siloed y actualización de contenido existente. |
| `/src/content/blog/`                             | New          | Blog con artículos orientados a intención comercial.                     |
| `/src/shared/context/LanguageContext.tsx`        | Modified     | Meta tags, títulos y descripciones optimizados para SEO.                 |
| `/src/features/landing/presentation/components/` | New          | Componentes de FAQs y CTAs optimizados.                                  |
| `/src/utils/seo/`                                | New          | Scripts para schema markup y optimización técnica.                       |

## Risks

| Risk                                                 | Likelihood | Mitigation                                                             |
| ---------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| **Baja adopción de cambios por parte del equipo**    | Medium     | Capacitación y comunicación clara de los beneficios.                   |
| **Cambios en algoritmos de Google**                  | High       | Monitoreo constante y ajustes iterativos.                              |
| **Falta de contenido original**                      | Medium     | Planificación de contenido con anticipación y asignación de recursos.  |
| **Dificultad en la optimización de Core Web Vitals** | Medium     | Auditoría técnica previa y optimización progresiva.                    |
| **Competencia de competidores establecidos**         | High       | Enfoque en diferenciación (ej: autoridad temática, experiencia local). |

## Rollback Plan

1. **Revertir cambios en landing pages**: Restaurar versiones anteriores del contenido.
2. **Revertir meta tags y títulos**: Volver a la configuración original.
3. **Revertir schema markup**: Eliminar implementaciones de rich snippets.
4. **Revertir enlazado interno**: Restaurar enlaces originales.
5. **Monitorear métricas**: Usar Google Analytics para detectar cambios negativos en tráfico y conversiones.
6. **Comunicación con stakeholders**: Informar sobre los cambios y su impacto.

## Dependencies

- **Equipo de desarrollo**: Para implementar cambios técnicos (ej: schema markup, optimización de Core Web Vitals).
- **Equipo de contenido**: Para crear y actualizar landing pages y blog.
- **Herramientas de SEO**: Google Search Console, Google Analytics, Ahrefs, SEMrush.
- **Conocimiento local**: Información actualizada sobre el mercado de hostelería en Tenerife y Canarias.

## Success Criteria

- [ ] **Posicionamiento en las primeras 3 posiciones** para keywords principales en Google (ej: "carta digital restaurante Tenerife").
- [ ] **Aumento del 30% en tráfico orgánico** en 6 meses.
- [ ] **Conversión del 5% en leads cualificados** (contactos, WhatsApp, llamadas) desde tráfico orgánico.
- [ ] **Aumento del 20% en autoridad de dominio** (Domain Authority) en 6 meses.
- [ ] **Reducción del 40% en tiempo de carga** de las landing pages.
- [ ] **Implementación exitosa de schema markup** en todas las landing pages.
- [ ] **Contenido de blog publicado** con enfoque en intención comercial y posicionamiento local.
- [ ] **Enlazado interno optimizado** para mejorar autoridad de página.
- [ ] **Monitoreo constante** de Core Web Vitals y ajustes según resultados.

## Next Steps

1. **Investigación de keywords**: Identificar keywords primarias y secundarias con intención comercial.
2. **Creación de landing pages**: Desarrollo de contenido para cada URL siloed.
3. **Optimización técnica**: Asegurar que todas las páginas cumplan con Core Web Vitals.
4. **Blog SEO**: Publicación de artículos orientados a intención comercial.
5. **Implementación de schema markup**: Mejorar CTR y posicionamiento.
6. **Monitoreo y ajuste**: Evaluar métricas y realizar ajustes iterativos.

### Ready for specs (sdd-spec) or design (sdd-design).
