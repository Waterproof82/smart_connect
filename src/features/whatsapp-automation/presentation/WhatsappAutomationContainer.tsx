import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import TestimonialCarousel, {
  Testimonial as TestimonialType,
} from "@shared/presentation/components/TestimonialCarousel";
import FAQAccordion, {
  FAQItem as FAQType,
} from "@shared/presentation/components/FAQAccordion";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Contact } from "@features/landing/presentation/components/Contact";
import { Helmet } from "react-helmet-async";
import {
  SeoFaqSchema,
  LocalBusinessSchema,
  BenefitsGrid,
  HowItWorks,
  StatsBar,
  GeoCoverage,
  InternalLinks,
  PageHero,
} from "@shared/presentation/components/SeoSchema";
import {
  Smartphone,
  Clock,
  MessageSquare,
  Bot,
  Send,
  Star,
  ArrowRight,
} from "lucide-react";

const mockTestimonials: TestimonialType[] = [
  {
    id: 1,
    quote:
      "Desde que automatizamos el WhatsApp, respondemos al instante las 24 horas. Hemos recuperado clientes que antes se perdían porque nadie respondía.",
    name: "Laura Martínez",
    title: "Gerente, Restaurante El Mirador, Puerto de la Cruz",
    avatarUrl: "/avatars/laura-martinez.jpg",
  },
  {
    id: 2,
    quote:
      "Configuramos respuestas automáticas para preguntas frecuentes: horarios, ubicación, menú. Los clientes reciben respuesta al segundo y nosotros ahorramos horas.",
    name: "Javier López",
    title: "Propietario, Café La Playa, Los Cristianos",
    avatarUrl: "/avatars/javier-lopez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Cómo funciona la automatización de WhatsApp?",
    answer:
      "Conectamos tu WhatsApp Business con nuestras herramientas para que puedas responder preguntas frecuentes, enviar notificaciones de pedidos y dar seguimiento a clientes de forma automática. Todo configurado a medida para tu restaurante.",
  },
  {
    id: 2,
    question: "¿Puedo personalizar las respuestas automáticas?",
    answer:
      "Sí, completamente. Tú decides qué respuestas automáticas quieres, en qué idioma, con qué tono y para qué preguntas. Puedes tener respuestas para horarios, menú del día, reservas, ubicación y más.",
  },
  {
    id: 3,
    question: "¿El cliente nota que es un bot o parece humano?",
    answer:
      "Las respuestas están diseñadas para sonar naturales y cercanas. Puedes personalizar el tono: formal, informal, canario... Además, si la conversación se complica, el sistema deriva al cliente a un humano automáticamente.",
  },
  {
    id: 4,
    question: "¿Funciona con mi número de WhatsApp actual?",
    answer:
      "Funciona con WhatsApp Business API. Si tienes un número normal de WhatsApp, podemos ayudarte a migrar a WhatsApp Business sin perder tus conversaciones. Es un proceso sencillo.",
  },
  {
    id: 5,
    question: "¿Qué tipos de mensajes puedo automatizar?",
    answer:
      "Puedes automatizar: respuestas a preguntas frecuentes, confirmaciones de reserva, recordatorios de cita, notificaciones de pedido listo, mensajes de agradecimiento post-visita, ofertas especiales y mucho más.",
  },
  {
    id: 6,
    question: "¿Cuánto cuesta la automatización de WhatsApp?",
    answer:
      "El coste depende del volumen de mensajes y la complejidad de las automatizaciones. Ofrecemos planes desde una cuota mensual baja. Solicita una demo y te preparamos un presupuesto sin compromiso para tu negocio en Tenerife.",
  },
  {
    id: 7,
    question:
      "¿Esto sirve para aumentar ventas o solo para atención al cliente?",
    answer:
      "Para ambas. Puedes enviar ofertas personalizadas, recordar a clientes que vuelvan, recomendar platos del día y hasta gestionar pedidos por WhatsApp. Es una herramienta de ventas y atención a la vez.",
  },
];

const WhatsappAutomationContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.whatsappAutomationSeoTitle}</title>
        <meta name="description" content={t.whatsappAutomationSeoDescription} />
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/automatizacion-whatsapp-restaurante"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/automatizacion-whatsapp-restaurante"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/automatizacion-whatsapp-restaurante"
        />
        <meta property="og:title" content={t.whatsappAutomationSeoTitle} />
        <meta
          property="og:description"
          content={t.whatsappAutomationSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/automatizacion-whatsapp-restaurante"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.whatsappAutomationSeoTitle} />
        <meta
          name="twitter:description"
          content={t.whatsappAutomationSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Automatización WhatsApp Restaurantes"
        description="Automatización de WhatsApp para restaurantes en Tenerife. Responde al instante, automaticamente."
        url="https://digitalizatenerife.es/automatizacion-whatsapp-restaurante"
        address={{
          streetAddress: "Santa Cruz de Tenerife",
          addressLocality: "Santa Cruz de Tenerife",
          addressRegion: "Tenerife",
          postalCode: "38001",
          addressCountry: "ES",
        }}
        areaServed={["Tenerife", "Canarias"]}
      />

      <Navbar scrolled={true} />
      <main>
        <PageHero
          title={t.whatsAppAutomationHeroTitle}
          subtitle={t.whatsAppAutomationHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.whatsAppAutomationHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20automatizar%20WhatsApp%20para%20mi%20restaurante"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Escríbenos ahora
              </a>
            </>
          }
        />
        <StatsBar
          stats={[
            { value: "24/7", label: "Atención continua" },
            { value: "<1s", label: "Tiempo de respuesta" },
            { value: "90%", label: "Preguntas automatizables" },
            { value: "1d", label: "Configuración" },
          ]}
        />

        <BenefitsGrid
          title="¿Por qué automatizar el WhatsApp de tu restaurante?"
          subtitle="No pierdas más clientes por no responder a tiempo"
          columns={2}
          benefits={[
            {
              icon: <Clock className="w-6 h-6" />,
              title: "Responde al instante, siempre",
              description:
                "Tus clientes reciben respuesta automática al segundo, incluso cuando estás cerrado, cocinando o atendiendo a otros clientes. Nunca más pierdas una reserva o consulta.",
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              title: "Ahorra horas de trabajo",
              description:
                "Deja de escribir las mismas respuestas una y otra vez. El bot responde automáticamente a las preguntas más frecuentes: horarios, menú, ubicación, reservas.",
            },
            {
              icon: <Bot className="w-6 h-6" />,
              title: "Parece humano, no robot",
              description:
                "Respuestas personalizadas con tu tono y estilo. El cliente no nota que habla con un bot. Y si necesita ayuda humana, se deriva automáticamente a tu equipo.",
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Convierte consultas en clientes",
              description:
                "Cada consulta de WhatsApp es una oportunidad de venta. Con respuestas rápidas y profesionales, conviertes más dudas en reservas y pedidos. Más clientes para tu restaurante.",
            },
          ]}
        />

        <HowItWorks
          title="Cómo activar tu WhatsApp automático en 3 pasos"
          subtitle="Empieza a automatizar en menos de 24 horas"
          steps={[
            {
              number: "1",
              icon: <MessageSquare className="w-6 h-6" />,
              title: "Conectamos tu WhatsApp",
              description:
                "Vinculamos tu número de WhatsApp Business con nuestra plataforma. Sin cambios en tu número actual, sin perder conversaciones.",
            },
            {
              number: "2",
              icon: <Bot className="w-6 h-6" />,
              title: "Configuramos las respuestas",
              description:
                "Tú nos dices qué preguntas recibes más y cómo quieres responder. Creamos respuestas automáticas con tu tono y personalidad.",
            },
            {
              number: "3",
              icon: <Send className="w-6 h-6" />,
              title: "Empieza a recibir clientes",
              description:
                "El sistema responde automáticamente 24/7. Recibes informes semanales y ajustamos lo que necesites. Más clientes, menos trabajo.",
            },
          ]}
        />

        <GeoCoverage
          title="Disponible en toda Canarias"
          subtitle="Automatización de WhatsApp para restaurantes en cualquier isla"
          cities={[
            "Santa Cruz de Tenerife",
            "San Cristóbal de La Laguna",
            "Adeje",
            "Los Cristianos",
            "Puerto de la Cruz",
            "La Orotava",
            "Las Palmas de GC",
            "Maspalomas",
          ]}
          serviceArea="Configuración remota para toda Canarias. Soporte en Tenerife."
        />

        <TestimonialCarousel testimonials={mockTestimonials} />
        <FAQAccordion items={mockFaqs} />

        <InternalLinks
          title="Más soluciones para tu restaurante"
          links={[
            {
              href: "/automatizacion-restaurantes-n8n",
              label: "Automatización n8n",
              description: "Conecta todas tus herramientas",
            },
            {
              href: "/tap-review",
              label: "NFC para reseñas Google",
              description: "Multiplica reseñas automáticamente",
            },
            {
              href: "/carta-digital",
              label: "Carta digital QR",
              description: "Menú digital interactivo",
            },
            {
              href: "/carta-digital",
              label: "Pedidos desde la mesa",
              description: "Pide desde el móvil",
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default WhatsappAutomationContainer;
