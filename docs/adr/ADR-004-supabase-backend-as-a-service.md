# ADR-004: Supabase como Backend as a Service (BaaS)

**Estado:** Aceptado  
**Fecha:** 2026-02-04  
**Decisores:** Arquitecto técnico, Equipo de desarrollo  
**Contexto:** SmartConnect AI - Sistema RAG para aceleración de negocios locales  

---

## 📋 Contexto

SmartConnect AI requiere una infraestructura backend que soporte:

### Requisitos Técnicos
- **Base de datos relacional:** Almacenamiento estructurado de usuarios, documentos, logs de seguridad
- **Búsqueda vectorial:** RAG con embeddings de 768 dimensiones (Gemini text-embedding-004)
- **Funciones serverless:** Protección de API keys (OWASP A02:2021 - Cryptographic Failures)
- **Autenticación:** Gestión segura de usuarios con JWT y RLS (Row Level Security)
- **Almacenamiento de archivos:** Imágenes, documentos del chatbot, assets del dashboard
- **Tiempo de desarrollo:** MVP funcional en 3-4 semanas (agencia-escuela)

### Restricciones
- **Presupuesto limitado:** Modelo de pago por uso, free tier generoso
- **Equipo pequeño:** 1-2 desarrolladores full-stack, sin DevOps dedicado
- **Stack tecnológico:** TypeScript/Flutter con preferencia por herramientas modernas
- **Escalabilidad:** Inicialmente 10-50 usuarios, proyección a 500+ en 6 meses
- **Seguridad:** Cumplimiento OWASP Top 10:2021, certificación SOC 2

---

## 🎯 Opciones Consideradas

### Opción 1: Supabase (BaaS Open-Source)

**Ventajas:**
- ✅ **PostgreSQL nativo:** Base de datos robusta con pgvector para RAG
- ✅ **Edge Functions:** Deno runtime serverless para proteger API keys
- ✅ **Auth integrada:** JWT + RLS + OAuth providers (Google, GitHub)
- ✅ **Free tier generoso:** 500MB DB, 500K Edge Function invocations/mes, 1GB storage
- ✅ **Open-source:** Código auditable, sin vendor lock-in (self-hosted posible)
- ✅ **TypeScript native:** SDK oficial con tipos completos
- ✅ **Tiempo de setup:** < 1 hora (CLI + dashboard visual)

**Desventajas:**
- ⚠️ **Límite de conexiones:** 60 simultáneas en free tier (aceptable para MVP)
- ⚠️ **Región fija:** Datos en US East (latencia ~150ms desde Europa)
- ⚠️ **Pricing escalado:** $25/mes Pro plan al superar free tier

**Costo estimado:**
- Mes 1-3: $0 (free tier)
- Mes 4-6: $25/mes (Pro plan)
- Año 1: ~$150 total

---

### Opción 2: Firebase (Google BaaS)

**Ventajas:**
- ✅ **Ecosistema Google:** Integración con Google AI Studio (Gemini)
- ✅ **Free tier:** 1GB Firestore, 125K Cloud Functions invocations
- ✅ **Auth robusta:** Firebase Authentication con múltiples providers

**Desventajas:**
- ❌ **NO tiene búsqueda vectorial nativa** (requiere Firestore + Vertex AI Search ~$120/mes)
- ❌ **NoSQL (Firestore):** Modelado relacional más complejo para leads, usuarios, logs
- ❌ **Cold start latency:** Cloud Functions (Node.js) ~800ms vs Deno Edge ~50ms
- ❌ **SDK más antiguo:** JavaScript clásico, tipado TypeScript incompleto

**Costo estimado:**
- Mes 1-3: $0 (free tier)
- Con Vertex AI Search: $120/mes (búsqueda vectorial)
- Año 1: ~$1,440 (12x$120)

**Razón de descarte:** Costo 10x superior por búsqueda vectorial + latencia en serverless

---

### Opción 3: Backend Custom (Express + PostgreSQL + Redis)

**Ventajas:**
- ✅ **Control total:** Arquitectura personalizada
- ✅ **Flexibilidad:** Sin límites de proveedor cloud

**Desventajas:**
- ❌ **Tiempo de desarrollo:** 2-3 semanas adicionales (auth, RLS, migrations, deployment)
- ❌ **Infraestructura:** VPS ($10-20/mes) + PostgreSQL managed ($15-25/mes) + Redis ($5-10/mes)
- ❌ **Mantenimiento:** Backups, actualizaciones, monitoreo de uptime
- ❌ **Certificaciones:** SOC 2, GDPR compliance manual (vs automático en BaaS)
- ❌ **No viable para agencia-escuela:** Presupuesto/tiempo excedido

**Costo estimado:**
- Mes 1-12: $40/mes (VPS + DB + cache)
- Año 1: $480 + 60 horas desarrollo = ~$2,880

**Razón de descarte:** Tiempo/costo 20x superior vs Supabase

---

### Opción 4: AWS Amplify + DynamoDB

**Ventajas:**
- ✅ **Escalabilidad extrema:** Serverless nativo de AWS
- ✅ **Integración AWS:** Lambda, S3, CloudFront

**Desventajas:**
- ❌ **DynamoDB NoSQL:** Sin búsqueda vectorial nativa (requiere OpenSearch ~$70/mes)
- ❌ **Complejidad:** IAM roles, VPC, CloudFormation templates
- ❌ **Free tier limitado:** 25GB DynamoDB (vs 500MB PostgreSQL suficiente)
- ❌ **Curva de aprendizaje:** 1-2 semanas para equipo sin experiencia AWS

**Costo estimado:**
- Mes 1-3: $20/mes (Lambda + DynamoDB + OpenSearch)
- Año 1: $240 + 2 semanas aprendizaje

**Razón de descarte:** Over-engineering para MVP, complejidad innecesaria

---

### Opción 5: PocketBase (Open-Source BaaS)

**Ventajas:**
- ✅ **Gratis y open-source:** $0 costo de licencias
- ✅ **SQLite nativo:** Base de datos embebida
- ✅ **Go backend:** Alta performance

**Desventajas:**
- ❌ **NO tiene pgvector:** Búsqueda vectorial requiere integración externa (Pinecone ~$70/mes)
- ❌ **SQLite límites:** Max 1TB, no recomendado para +100 usuarios concurrentes
- ❌ **Self-hosted obligatorio:** Requiere VPS + configuración SSL + backups manuales
- ❌ **Comunidad pequeña:** Menos recursos vs Supabase/Firebase

**Costo estimado:**
- VPS: $10/mes
- Pinecone: $70/mes
- Año 1: $960

**Razón de descarte:** Falta búsqueda vectorial nativa + overhead de self-hosting

---

## ✅ Decisión

Elegimos **Supabase (Opción 1)** como Backend as a Service.

### Justificación Técnica

1. **PostgreSQL + pgvector nativo:**
   ```sql
   -- Búsqueda vectorial sin servicios adicionales
   CREATE EXTENSION vector;
   CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
   SELECT content FROM documents 
   ORDER BY embedding <=> $1::vector(768) LIMIT 5;
   ```
   - 768 dimensiones (Gemini text-embedding-004)
   - Cosine similarity con índice IVFFLAT
   - Latencia < 100ms para 10K documentos

2. **Edge Functions con Deno:**
   ```typescript
   // Protección de GEMINI_API_KEY (OWASP A02:2021)
   const geminiApiKey = Deno.env.get('GEMINI_API_KEY'); // Server-side only
   
   // Cold start: ~50ms (vs Node.js ~800ms)
   const response = await fetch('https://generativelanguage.googleapis.com/...');
   ```
   - API key nunca expuesta al navegador
   - 10x más rápido que Cloud Functions (Node.js)

3. **Row Level Security (RLS):**
   ```sql
   -- Usuarios solo ven sus propios documentos
   CREATE POLICY "Users see own documents"
   ON documents FOR SELECT
   USING (auth.uid() = user_id);
   ```
   - Seguridad a nivel de base de datos
   - Sin lógica custom de autorización

4. **TypeScript SDK robusto:**
   ```typescript
   // Tipado completo, autocomplete en IDE
   const { data, error } = await supabase
     .from('documents')
     .select('*')
     .eq('user_id', userId);
   ```

### Justificación de Negocio

1. **Costo inicial $0:** Free tier cubre primeros 3 meses de operación
2. **Time-to-market:** Setup completo en 1 día vs 2-3 semanas backend custom
3. **Agencia-escuela:** Permite enfoque en features de negocio, no en infraestructura
4. **Escalabilidad progresiva:** $25/mes Pro plan suficiente hasta 500 usuarios

### Justificación de Seguridad

1. **Certificaciones incluidas:** SOC 2 Type II, GDPR compliance
2. **Backups automáticos:** Point-in-time recovery (Pro plan)
3. **Auditoría de código:** Supabase es open-source, revisable en GitHub
4. **OWASP Top 10 mitigado:**
   - A01 (Access Control): RLS policies
   - A02 (Cryptographic Failures): Edge Functions + secrets
   - A03 (Injection): Prepared statements automáticos
   - A05 (Security Misconfiguration): Defaults seguros

---

## 🔄 Consecuencias

### Positivas ✅

1. **Desarrollo acelerado:**
   - Base de datos productiva en 1 hora
   - Auth funcional en 30 minutos
   - Edge Functions desplegadas en 5 minutos

2. **Stack unificado:**
   ```typescript
   // Un solo SDK para todo
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   
   // Database
   await supabase.from('documents').select('*');
   
   // Auth
   await supabase.auth.signInWithPassword({ email, password });
   
   // Storage
   await supabase.storage.from('avatars').upload(file);
   
   // Edge Functions
   await supabase.functions.invoke('gemini-embedding', { body: { text } });
   ```

3. **Búsqueda vectorial optimizada:**
   - Rendimiento: 5ms búsqueda en 10K docs (índice IVFFLAT)
   - Escalabilidad: Hasta 1M documentos sin degradación (Pro plan)
   - Sin servicios externos: Todo en PostgreSQL

4. **Seguridad robusta:**
   - RLS evita 90% de vulnerabilidades de autorización
   - Edge Functions protegen API keys (OWASP A02)
   - JWT automático con refresh tokens

5. **Documentación completa:**
   - 500+ guías oficiales
   - Comunidad activa (Discord con 20K miembros)
   - Ejemplos en GitHub (500+ repositorios)

### Negativas ⚠️

1. **Dependencia de Supabase:**
   - **Riesgo:** Cambios de pricing, deprecación de features
   - **Mitigación:** Es open-source, self-hosting posible en 1-2 días (Docker Compose)
   - **Realidad:** Supabase tiene funding de $116M (Series B), bajo riesgo de cierre

2. **Región única (US East):**
   - **Impacto:** Latencia +50-100ms desde Europa/LATAM
   - **Mitigación:** Cacheo en navegador (embeddings, documentos frecuentes)
   - **Aceptable:** Para MVP con usuarios locales (España)

3. **Límite de conexiones (60 en free tier):**
   - **Impacto:** Con 60 usuarios simultáneos, puede haber colas
   - **Mitigación:** Connection pooling automático (pgBouncer incluido)
   - **Upgrade path:** Pro plan tiene 120 conexiones ($25/mes)

4. **Learning curve de RLS:**
   - **Tiempo:** 2-3 días para dominar políticas complejas
   - **Documentación:** `docs/SUPABASE_SECURITY.md` con patrones comunes
   - **ROI:** Una vez aprendido, ahorra semanas de código custom

5. **Vendor lock-in parcial:**
   - **Edge Functions:** Deno runtime (portable a Deno Deploy)
   - **Database:** PostgreSQL estándar (exportable a cualquier host)
   - **Auth:** JWT estándar (reemplazable por Auth0, Clerk)
   - **Conclusión:** Lock-in bajo vs Firebase/AWS

---

## 📊 Comparativa Final

| Criterio | Supabase | Firebase | Backend Custom | AWS Amplify | PocketBase |
|----------|----------|----------|----------------|-------------|------------|
| **Búsqueda vectorial** | ✅ Nativo (pgvector) | ❌ Requiere Vertex AI | ✅ pgvector manual | ❌ Requiere OpenSearch | ❌ Requiere Pinecone |
| **Costo Año 1** | $150 | $1,440 | $2,880 | $240 | $960 |
| **Tiempo setup** | 1 día | 1 día | 3 semanas | 1 semana | 3 días |
| **Escalabilidad** | ✅ Hasta 1M docs | ✅ Ilimitada | ⚠️ Manual | ✅ Ilimitada | ⚠️ Limitada (SQLite) |
| **TypeScript** | ✅ SDK nativo | ⚠️ Parcial | ✅ Custom | ⚠️ Complejo | ⚠️ Comunidad pequeña |
| **Latencia Edge** | 50ms | 800ms | N/A | 200ms | N/A |
| **Open-source** | ✅ Sí | ❌ No | ✅ Sí | ❌ No | ✅ Sí |
| **Self-hosting** | ✅ Posible | ❌ No | ✅ Nativo | ❌ No | ✅ Obligatorio |

---

## 📚 Referencias

### Documentación Supabase
- [Supabase Official Docs](https://supabase.com/docs)
- [pgvector Extension Guide](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Row Level Security Patterns](https://supabase.com/docs/guides/auth/row-level-security)

### Implementación en SmartConnect
- `docs/EDGE_FUNCTIONS_DEPLOYMENT.md` - Despliegue de Edge Functions
- `docs/SUPABASE_SECURITY.md` - Configuración de RLS policies
- `docs/CHATBOT_RAG_ARCHITECTURE.md` - Integración pgvector con RAG
- `supabase/migrations/` - Scripts SQL de setup

### Auditorías de Seguridad
- `docs/audit/2026-01-28_owasp-top10-security-audit.md` - Cumplimiento OWASP
- `docs/audit/2026-01-29_edge-functions-deployment-setup.md` - Protección de API keys

### Decisiones Relacionadas
- [ADR-002: n8n Webhook](ADR-002-n8n-webhook-contact-form.md) - Orquestación externa
- [ADR-003: RAG Architecture](ADR-003-rag-architecture-decision.md) - Sistema vectorial

---

## 🔄 Revisión Futura

Reevaluar esta decisión si:

1. **Costo > $100/mes:** Considerar self-hosting Supabase (Docker Compose)
2. **Latencia > 300ms:** Evaluar réplicas regionales (Enterprise plan) o CDN
3. **10K+ usuarios concurrentes:** Migrar a PostgreSQL managed separado
4. **Requisitos multi-región:** AWS RDS Aurora Global Database
5. **Necesidad multi-modelo LLM:** Evaluar LangChain + Pinecone (más flexible)

**Próxima revisión:** 2026-08-01 (6 meses desde decisión)
