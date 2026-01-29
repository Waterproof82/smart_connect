import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Knowledge base documents about SmartConnect AI products
const documents = [
  {
    content: `QRiBar es el producto estrella de SmartConnect AI. Es un sistema de carta digital para restaurantes que permite a los clientes:
- Ver el menú completo escaneando un código QR en la mesa
- Realizar pedidos directamente desde su móvil sin necesidad de app
- Pagar online de forma segura
- Recibir notificaciones cuando el pedido está listo

Beneficios para el restaurante:
- Reduce costos de impresión de cartas físicas
- Aumenta la velocidad de servicio
- Permite actualizar precios y platos en tiempo real
- Analytics de qué platos se consultan más
- Compatible con cualquier smartphone

Precio: Desde 29€/mes con setup incluido`,
    source: 'qribar_product'
  },
  {
    content: `Las Tarjetas NFC de Reseñas de SmartConnect AI son una herramienta de reputación online inspirada en Tapstar. Permiten:
- Capturar reseñas de Google Reviews con un simple tap
- Redirigir a Instagram para nuevos seguidores
- Diseño personalizado con logo del negocio
- QR backup para dispositivos sin NFC
- Analytics de tasa de conversión

Casos de uso ideales:
- Restaurantes que quieren aumentar su rating en Google
- Negocios locales que buscan más visibilidad
- Tiendas físicas que quieren crecer en redes sociales

El cliente solo necesita acercar su móvil a la tarjeta (tap) y automáticamente se abre Google Reviews o Instagram.

Precio: 45€ por tarjeta + configuración inicial gratuita`,
    source: 'nfc_reviews_product'
  },
  {
    content: `SmartConnect AI ofrece Automatizaciones de Marketing usando n8n en servidor propio. Servicios incluidos:
- Captación de leads desde landing pages
- Análisis de temperatura del lead con IA (Gemini)
- Notificaciones automáticas por Telegram
- Integración con Google Sheets para CRM
- Seguimiento automatizado de clientes potenciales
- Email marketing personalizado según comportamiento

Flujo típico:
1. Lead llena formulario en landing
2. Sistema analiza intención con IA
3. Clasifica como frío/tibio/caliente
4. Envía notificación instantánea al equipo comercial
5. Programa seguimientos automáticos

Ideal para: Negocios que reciben muchos leads pero pierden oportunidades por falta de seguimiento rápido.

Precio: Desde 99€/mes según complejidad de workflows`,
    source: 'automation_product'
  },
  {
    content: `SmartConnect AI sigue el modelo de Agencia-Escuela:
- No somos solo una agencia de desarrollo
- Construimos productos reales para negocios locales
- Cada proyecto es una oportunidad de aprendizaje
- Aplicamos las últimas tecnologías (IA, automatización, cloud)
- Enfoque en ROI y resultados medibles

Stack tecnológico:
- Frontend: Next.js + Flutter Web
- Backend: Supabase + n8n
- IA: Gemini API con arquitectura RAG
- Cloud: VPS propio + Supabase

Filosofía: Transformar negocios tradicionales en negocios digitales potenciados por IA`,
    source: 'company_philosophy'
  },
  {
    content: `Información de contacto de SmartConnect AI:
- Email: jmaristia@gmail.com
- Ubicación: Servicios 100% remotos, atendemos toda España
- Horario: L-V 9:00-18:00 (zona horaria CET)
- Respuesta típica: Menos de 24 horas

Proceso de onboarding:
1. Consulta inicial gratuita (30 min)
2. Análisis de necesidades del negocio
3. Propuesta personalizada con precios
4. Setup técnico (1-2 semanas)
5. Capacitación del equipo del cliente
6. Soporte continuo incluido

Todos los proyectos incluyen:
- Documentación técnica completa
- Capacitación en uso del sistema
- 1 mes de soporte incluido
- Actualizaciones de seguridad`,
    source: 'contact_info'
  }
];

async function generateEmbedding(text) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }]
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding?.values || [];
}

async function populateKnowledgeBase() {
  console.log('🚀 Starting knowledge base population...\n');

  for (const doc of documents) {
    try {
      console.log(`📝 Processing: ${doc.source}...`);
      
      // Generate embedding
      const embedding = await generateEmbedding(doc.content);
      console.log(`   ✅ Generated embedding (${embedding.length} dimensions)`);

      // Convert to pgvector string format
      const vectorString = `[${embedding.join(',')}]`;

      // Use insert_document RPC function (returns void now)
      const result = await supabase.rpc('insert_document', {
        doc_content: doc.content,
        doc_embedding: vectorString,
        doc_source: doc.source
      });

      // Check for errors
      if (result.error) {
        console.error(`   ❌ Error inserting: ${result.error.message}`);
      } else {
        console.log(`   ✅ Inserted successfully\n`);
      }

      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error processing ${doc.source}:`, error);
    }
  }

  console.log('✅ Knowledge base population complete!\n');

  // Verify
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total documents in database: ${count}`);
}

populateKnowledgeBase().catch(console.error);
