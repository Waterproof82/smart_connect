// ========================================
// SCRIPT DE ENTRENAMIENTO RAG
// ========================================
// Este script genera embeddings y los inserta en Supabase
// Ejecutar: node train_rag.js

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../../../.env.local');

dotenv.config({ path: envPath });

// ========================================
// CONFIGURACIÓN
// ========================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Faltan variables de entorno en .env.local');
  console.error('Asegúrate de configurar:');
  console.error('  - GEMINI_API_KEY');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ========================================
// BASE DE CONOCIMIENTO
// ========================================
const knowledgeBase = [
  {
    content: `QRIBAR - Menús Digitales para Hostelería
    
QRIBAR es la solución completa para digitalizar tu carta de restaurante o bar. Los clientes escanean un código QR y acceden al menú desde su móvil, sin apps ni descargas.

Características principales:
• Menú digital interactivo con fotos HD de cada plato
• Actualización de precios y disponibilidad en tiempo real
• Filtros de alérgenos e ingredientes
• Multiidioma (español, inglés, francés, alemán)
• Panel de administración intuitivo
• Analíticas: platos más vistos, horarios de pico, etc.
• Diseño personalizado con los colores de tu marca
• Compatible con cualquier móvil (iOS, Android)

Casos de uso:
- Restaurantes que quieren eliminar menús de papel
- Bares con carta de cócteles extensa
- Hoteles con servicio de habitaciones
- Cafeterías con menú de desayunos

Beneficios:
✓ Ahorra en impresión de cartas
✓ Actualiza precios al instante
✓ Mejora la experiencia del cliente
✓ Aumenta pedidos con fotos atractivas
✓ Reduce errores en pedidos`,
    metadata: {
      category: 'producto',
      service: 'qribar',
      tags: ['menu', 'restaurante', 'qr', 'hosteleria', 'digital'],
      priority: 'high'
    }
  },
  {
    content: `Precios QRIBAR 2026

Plan BÁSICO - 29€/mes
• 1 restaurante/local
• Menú ilimitado (platos, categorías)
• Código QR personalizado
• Actualizaciones en tiempo real
• Soporte por email
• Sin permanencia

Plan PRO - 79€/mes
• Hasta 5 locales
• Todo del plan Básico
• Analíticas avanzadas
• Diseño 100% personalizado
• Soporte prioritario (WhatsApp)
• Multiidioma completo
• Exportación de datos

Plan ENTERPRISE - Precio personalizado
• Locales ilimitados
• API para integraciones
• Gestor de cuenta dedicado
• Formación del equipo
• Soporte 24/7
• Desarrollo a medida

PROMOCIÓN LANZAMIENTO:
• 3 meses gratis contratando anual
• Setup gratuito (valor 199€)
• 50% descuento primer mes`,
    metadata: {
      category: 'precio',
      service: 'qribar',
      tags: ['precio', 'planes', 'coste', 'tarifa'],
      priority: 'high'
    }
  },
  {
    content: `Automatización con n8n

n8n es una plataforma de automatización de workflows que conecta tus herramientas empresariales sin código.

¿Qué podemos automatizar para tu negocio?

1. GENERACIÓN DE LEADS
• Formulario web → CRM automático
• Leads de Facebook/Google Ads → Base de datos
• Clasificación automática con IA (hot/cold leads)
• Notificaciones instantáneas por email/WhatsApp/Telegram

2. ATENCIÓN AL CLIENTE
• Respuestas automáticas en redes sociales
• Chatbots inteligentes con IA
• Tickets de soporte → Asignación automática
• Seguimiento de satisfacción del cliente

3. VENTAS Y FACTURACIÓN
• Pedidos → Factura automática
• Recordatorios de pago
• Sincronización con contabilidad
• Informes de ventas diarios

4. MARKETING
• Envío de newsletters segmentadas
• Publicación automática en redes sociales
• Análisis de métricas consolidadas
• Seguimiento de campañas

5. RECURSOS HUMANOS
• Onboarding automatizado de empleados
• Gestión de vacaciones
• Control de fichajes
• Evaluaciones de desempeño

Ventajas vs Zapier/Make:
✓ Más económico (open source)
✓ Más flexible y potente
✓ Sin límites de operaciones
✓ Alojamiento en tu servidor o nuestro
✓ Personalización ilimitada`,
    metadata: {
      category: 'producto',
      service: 'n8n',
      tags: ['automatizacion', 'workflow', 'integracion', 'zapier'],
      priority: 'high'
    }
  },
  {
    content: `Precios Automatización n8n 2026

CONFIGURACIÓN INICIAL:
• Flujo Básico (1-3 integraciones): 199€
  - Setup de n8n en nuestro servidor
  - 1 workflow completo funcional
  - Documentación básica
  - 1 hora de formación

• Flujo Avanzado (4-10 integraciones): 499€
  - Setup completo
  - Hasta 3 workflows
  - Integraciones complejas (IA, APIs)
  - Documentación detallada
  - 2 sesiones de formación (2h cada una)
  - Soporte 1 mes incluido

• Proyecto Enterprise: Desde 1.999€
  - Análisis completo de procesos
  - Workflows ilimitados
  - Integraciones a medida
  - Desarrollo custom
  - Formación completa del equipo
  - 6 meses de soporte incluido

MANTENIMIENTO MENSUAL (opcional):
• Plan Mantenimiento - 99€/mes
  - Monitoreo 24/7
  - Actualizaciones de workflows
  - Soporte prioritario
  - 2 horas de desarrollo incluidas/mes
  - Reportes mensuales

SERVICIOS ADICIONALES:
• Desarrollo de workflow nuevo: 149€/workflow
• Hora de consultoría: 75€/hora
• Migración desde Zapier/Make: 299€
• Formación adicional: 99€/sesión (2h)`,
    metadata: {
      category: 'precio',
      service: 'n8n',
      tags: ['precio', 'automatizacion', 'coste', 'implementacion'],
      priority: 'high'
    }
  },
  {
    content: `Tarjetas Tap-to-Review NFC - Sistema de Reseñas

¿Qué son las tarjetas Tap-to-Review?
Tarjetas físicas con chip NFC que los clientes tocan con su móvil para dejar una reseña en Google Maps. Sin apps, sin complicaciones.

Cómo funciona:
1. Cliente toca la tarjeta con su móvil
2. Se abre directamente la página de reseñas de Google
3. Cliente deja su reseña en 10 segundos
4. Tu negocio acumula reseñas positivas

Estadísticas:
• 300% más reseñas vs. método tradicional
• 85% de las personas que tocan la tarjeta dejan reseña
• Reseñas positivas en 90% de los casos
• ROI promedio: recuperas la inversión en 1 mes

Casos de éxito:
- Restaurante en Madrid: de 12 a 94 reseñas en 2 meses
- Hotel en Barcelona: de 3.8 a 4.7 estrellas en 3 meses
- Tienda de ropa: 150 reseñas nuevas en 6 semanas

Dónde colocarlas:
✓ En la mesa del restaurante
✓ En el mostrador de pago
✓ Junto a la caja registradora
✓ En la recepción del hotel
✓ En tarjetas de visita del personal

Personalización:
• Diseño con tu logo y colores
• Texto personalizado
• Enlace directo a tu Google Business
• Tamaño tarjeta de crédito
• Material PVC premium
• Durabilidad: +5 años`,
    metadata: {
      category: 'producto',
      service: 'tap-to-review',
      tags: ['reseñas', 'nfc', 'google', 'reputacion'],
      priority: 'high'
    }
  },
  {
    content: `Precios Tarjetas Tap-to-Review 2026

Pack STARTER - 49€
• 5 tarjetas NFC personalizadas
• Diseño básico con tu logo
• Setup de enlace a Google
• Guía de uso
• Soporte por email

Pack BUSINESS - 129€
• 20 tarjetas NFC personalizadas
• Diseño premium personalizado
• Setup completo
• Pegatinas adicionales (10 unidades)
• Soporte prioritario
• Analíticas básicas (clicks)

Pack PREMIUM - 249€
• 50 tarjetas NFC
• Diseño 100% a medida
• Setup + optimización de perfil Google
• 30 pegatinas NFC
• Display de mostrador incluido
• Analíticas avanzadas
• Consultoría de reputación online (1h)
• Soporte VIP

PEDIDOS GRANDES:
• +100 tarjetas: 3.99€/unidad
• +500 tarjetas: 2.99€/unidad
• +1000 tarjetas: 1.99€/unidad

SERVICIOS ADICIONALES:
• Pegatinas NFC adhesivas: 5€/unidad
• Display de mostrador: 29€
• Rediseño de tarjetas: 39€
• Optimización perfil Google Business: 99€
• Gestión de reseñas negativas: 149€`,
    metadata: {
      category: 'precio',
      service: 'tap-to-review',
      tags: ['precio', 'tarjetas', 'nfc', 'coste'],
      priority: 'high'
    }
  },
  {
    content: `Proceso de Implementación y Tiempos

QRIBAR - Menú Digital:
1. Contratación y pago: Inmediato
2. Envío de información (logos, menú, fotos): 1-2 días (cliente)
3. Configuración y diseño: 2-3 días (nosotros)
4. Revisión y ajustes: 1 día
5. Activación: Inmediato
TOTAL: 5-7 días desde contratación

n8n - Automatización:
1. Reunión de análisis: 1-2 horas
2. Diseño del workflow: 2-3 días
3. Desarrollo e integración: 3-5 días
4. Pruebas y ajustes: 1-2 días
5. Formación del equipo: 2 horas
6. Go-live: Inmediato
TOTAL: 7-12 días desde kickoff

Tarjetas Tap-to-Review:
1. Pedido y diseño: 1 día
2. Aprobación del diseño: 1 día (cliente)
3. Producción: 3-5 días
4. Envío: 1-2 días (península)
5. Setup de enlace: Inmediato
TOTAL: 6-9 días desde pedido

GARANTÍAS:
✓ Garantía de satisfacción 30 días
✓ Reembolso completo si no cumple expectativas
✓ Soporte técnico incluido primer mes
✓ Actualizaciones gratuitas de por vida`,
    metadata: {
      category: 'proceso',
      service: 'general',
      tags: ['implementacion', 'tiempos', 'proceso', 'garantia'],
      priority: 'medium'
    }
  },
  {
    content: `Comparativa con Competidores

QRIBAR vs Otros Menús Digitales:
• vs TheFork Menu: Más económico, sin comisiones por pedidos
• vs Flipdish: Sin lock-in, exportas tus datos cuando quieras
• vs Glovo/UberEats QR: Sin comisiones, tú controlas todo
• vs Menús PDF: Interactivo, actualizable, con analíticas

n8n vs Otras Automatizaciones:
• vs Zapier: Más barato, sin límites de operaciones
• vs Make (Integromat): Más flexible, open source
• vs Microsoft Power Automate: Más fácil, sin curva de aprendizaje
• vs Desarrollo custom: Mucho más económico, mantenible

Tarjetas NFC vs Otros Métodos:
• vs Pedir reseñas manualmente: 10x más conversión
• vs Email post-visita: 5x más tasa de respuesta
• vs QR code estático: Experiencia más fluida
• vs Agencias de reseñas: 80% más económico`,
    metadata: {
      category: 'competencia',
      service: 'general',
      tags: ['comparativa', 'competencia', 'alternativas'],
      priority: 'medium'
    }
  },
  {
    content: `Soporte y Contacto

Canales de Atención:
• Email: soporte@smartconnect-ai.com (respuesta < 24h)
• WhatsApp: +34 XXX XXX XXX (respuesta < 2h en horario laboral)
• Telegram: @smartconnect_soporte (respuesta < 1h)
• Chat web: Disponible 24/7 con IA

Horario de Soporte:
• Lunes a Viernes: 9:00 - 19:00 CET
• Sábados: 10:00 - 14:00 CET
• Domingos: Cerrado (excepto emergencias clientes Premium)

Tipos de Soporte:
1. Soporte Técnico: Problemas de funcionamiento
2. Consultoría: Optimización y mejores prácticas
3. Formación: Sesiones para tu equipo
4. Desarrollo Custom: Nuevas funcionalidades

SLA (Service Level Agreement):
• Plan Básico: Respuesta en 24h
• Plan Pro: Respuesta en 4h
• Plan Enterprise: Respuesta en 1h

Recursos de Ayuda:
• Base de conocimiento: docs.smartconnect-ai.com
• Video tutoriales: youtube.com/@smartconnectai
• Comunidad: community.smartconnect-ai.com
• Webinars mensuales gratuitos`,
    metadata: {
      category: 'soporte',
      service: 'general',
      tags: ['soporte', 'contacto', 'ayuda'],
      priority: 'medium'
    }
  },
  {
    content: `Casos de Éxito Reales

QRIBAR - Restaurante "La Tasquita" (Madrid):
Antes: Menús de papel, cambios de precio cada semana
Después: QRIBAR con fotos profesionales
Resultados:
• 40% aumento en pedidos de postres (por fotos atractivas)
• Ahorro de 150€/mes en impresión de menús
• 4.8 estrellas en Google (antes 4.2)
• Ticket medio subió de 18€ a 24€

n8n - Agencia Inmobiliaria "PropTech Partners":
Antes: Gestión manual de leads, pérdida de oportunidades
Después: Automatización completa con n8n + IA
Resultados:
• 0 leads perdidos (antes perdían 30% por respuesta tardía)
• Tiempo de respuesta: de 4 horas a 5 minutos
• 2 personas ahorradas en tareas administrativas
• ROI: 400% en 6 meses

Tarjetas NFC - Hotel Boutique "Casa del Mar" (Barcelona):
Antes: 23 reseñas en Google, 3.9 estrellas
Después: Tarjetas NFC en cada habitación y recepción
Resultados (3 meses):
• 147 reseñas nuevas
• Calificación subió a 4.7 estrellas
• Reservas directas +60%
• Aparecen en top 10 hoteles de la zona`,
    metadata: {
      category: 'casos_exito',
      service: 'general',
      tags: ['caso exito', 'testimonios', 'resultados', 'roi'],
      priority: 'high'
    }
  }
];

// ========================================
// FUNCIONES
// ========================================

// Generar embedding usando Gemini
async function generateEmbedding(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: 'gemini-embedding-001',
          content: { parts: [{ text }] },
          outputDimensionality: 768
        })
      }
    );

    const data = await response.json();
    
    if (!data?.embedding?.values) {
      console.error('Invalid response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid embedding response from Gemini');
    }
    
    return data.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Insertar documento en Supabase
async function insertDocument(content, metadata, embedding) {
  try {
    // Convertir embedding a string con formato PostgreSQL vector
    const embeddingStr = `[${embedding.join(',')}]`;
    
    // Usar SQL raw para forzar el casting a vector
    const { data, error } = await supabase.rpc('insert_document_with_embedding', {
      p_content: content,
      p_metadata: metadata,
      p_embedding: embeddingStr
    });

    if (error) {
      // Si la función no existe, intentar con insert normal
      const { data: data2, error: error2 } = await supabase
        .from('documents')
        .insert({
          content,
          metadata,
          embedding: embeddingStr
        })
        .select();
      
      if (error2) throw error2;
      return data2;
    }
    
    return data;
  } catch (error) {
    console.error('Error inserting document:', error);
    throw error;
  }
}

// Entrenar el modelo (generar embeddings e insertar)
async function trainRAG() {
  console.log('🚀 Iniciando entrenamiento del RAG...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < knowledgeBase.length; i++) {
    const doc = knowledgeBase[i];
    
    try {
      console.log(`📄 Procesando documento ${i + 1}/${knowledgeBase.length}...`);
      console.log(`   Servicio: ${doc.metadata.service}`);
      console.log(`   Categoría: ${doc.metadata.category}`);
      
      // Generar embedding
      console.log(`   🧠 Generando embedding...`);
      const embedding = await generateEmbedding(doc.content);
      console.log(`   ✅ Embedding generado (${embedding.length} dimensiones)`);
      
      // Insertar en Supabase
      console.log(`   💾 Insertando en Supabase...`);
      await insertDocument(doc.content, doc.metadata, embedding);
      console.log(`   ✅ Documento insertado correctamente\n`);
      
      successCount++;
      
      // Delay para no saturar la API de Gemini
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error procesando documento ${i + 1}:`, error.message, '\n');
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log('🎉 Entrenamiento completado!');
  console.log(`✅ Documentos insertados: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log('========================================\n');
}

// Función de prueba de búsqueda
async function testSearch(query) {
  console.log(`\n🔍 Probando búsqueda con: "${query}"\n`);
  
  try {
    // Generar embedding de la consulta
    const queryEmbedding = await generateEmbedding(query);
    
    // Buscar en Supabase
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3
    });

    if (error) throw error;

    console.log(`📊 Encontrados ${data.length} documentos relevantes:\n`);
    
    data.forEach((doc, i) => {
      console.log(`${i + 1}. Similitud: ${(doc.similarity * 100).toFixed(1)}%`);
      console.log(`   Servicio: ${doc.metadata.service}`);
      console.log(`   Preview: ${doc.content.substring(0, 100)}...\n`);
    });
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
  }
}

// ========================================
// EJECUTAR
// ========================================

try {
  // Entrenar el modelo
  await trainRAG();
  
  // Prueba de búsqueda
  console.log('\n🧪 Ejecutando pruebas de búsqueda...\n');
  await testSearch('cuánto cuesta un menú digital?');
  await testSearch('cómo funciona la automatización n8n?');
  await testSearch('quiero más reseñas en Google');
  
  console.log('\n✅ Script completado. El RAG está listo para usar!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error fatal:', error);
  process.exit(1);
}
