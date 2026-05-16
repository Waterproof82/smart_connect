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
  Zap,
  TrendingUp,
  Clock,
  Settings2,
  MessageSquare,
  ArrowRight,
  Workflow,
} from "lucide-react";

const mockTestimonials: TestimonialType[] = [
  {
    id: 1,
    quote:
      "Automatizamos las notificaciones de nuevas reseñas, los mensajes de WhatsApp y las respuestas a clientes. Ahorramos horas cada semana.",
    name: "Carlos Ruiz",
    title: "Gerente, Restaurante El Rincón, Tenerife",
    avatarUrl: "/avatars/carlos-ruiz.jpg",
  },
  {
    id: 2,
    quote:
      "Conectamos el CRM, el WhatsApp Business y las plantillas de email en un solo flujo. Ahora cada lead recibe seguimiento automático. Espectacular.",
    name: "Ana García",
    title: "Directora, Café Central, La Laguna",
    avatarUrl: "/avatars/ana-garcia.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Qué es n8n y cómo ayuda a mi restaurante?",
    answer:
      "n8n es una herramienta de automatización que conecta tus aplicaciones favoritas. Para tu restaurante, puede conectar CRM, WhatsApp, Google Reviews y más, reduciendo tiempos y mejorando la experiencia del cliente.",
  },
  {
    id: 2,
    question: "¿Necesito conocimientos técnicos para configurarlo?",
    answer:
      "No. SmartConnect AI se encarga de la configuración. Solo necesitas indicarnos qué aplicaciones quieres conectar.",
  },
  {
    id: 3,
    question: "¿Qué procesos puedo automatizar en mi restaurante?",
    answer:
      "Puedes automatizar la gestión de reseñas de Google, respuestas automáticas por WhatsApp, notificaciones de nuevos pedidos, seguimiento de leads, campañas de email marketing y la integración con tu CRM.",
  },
  {
    id: 4,
    question: "¿Cuánto tiempo tarda la implementación?",
    answer:
      "La implementación de flujos básicos toma entre 2 y 3 días. Proyectos más complejos con múltiples integraciones pueden llevar hasta una semana.",
  },
  {
    id: 5,
    question: "¿Se integra con mi sistema actual?",
    answer:
      "Sí, n8n se integra con cientos de aplicaciones y servicios. Trabajamos con tu stack tecnológico actual para crear flujos personalizados.",
  },
  {
    id: 6,
    question: "¿Hay soporte técnico después de la implementación?",
    answer:
      "Sí, ofrecemos soporte técnico 24/7 para garantizar que tus automatizaciones funcionen sin interrupciones.",
  },
];

const AutomationN8nContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.n8nAutomationSeoTitle}</title>
        <meta name="description" content={t.n8nAutomationSeoDescription} />
        <meta property="og:title" content={t.n8nAutomationSeoTitle} />
        <meta
          property="og:description"
          content={t.n8nAutomationSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <meta name="twitter:title" content={t.n8nAutomationSeoTitle} />
        <meta
          name="twitter:description"
          content={t.n8nAutomationSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Automatización n8n Restaurantes"
        description={t.n8nAutomationSeoDescription}
        url="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
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
          title={t.n8nAutomationHeroTitle}
          subtitle={t.n8nAutomationHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.n8nAutomationHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20automatizar%20mi%20restaurante%20con%20n8n"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                {t.n8nAutomationWhatsAppText}
              </a>
            </>
          }
        />

        <StatsBar
          stats={[
            { value: "80%", label: t.n8nAutomationStat1Label },
            { value: "24/7", label: t.n8nAutomationStat2Label },
            { value: "+200", label: t.n8nAutomationStat3Label },
            { value: "2-3d", label: t.n8nAutomationStat4Label },
          ]}
        />

        <BenefitsGrid
          title={t.n8nAutomationBenefitsTitle}
          subtitle={t.n8nAutomationBenefitsSubtitle}
          columns={2}
          benefits={[
            {
              icon: <Clock className="w-6 h-6" />,
              title: t.n8nAutomationBenefit1Title,
              description: t.n8nAutomationBenefit1Desc,
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              title: t.n8nAutomationBenefit2Title,
              description: t.n8nAutomationBenefit2Desc,
            },
            {
              icon: <Settings2 className="w-6 h-6" />,
              title: t.n8nAutomationBenefit3Title,
              description: t.n8nAutomationBenefit3Desc,
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: t.n8nAutomationBenefit4Title,
              description:
                "A medida que crece tu negocio, las automatizaciones crecen contigo. Atiendes más clientes, gestionas más reseñas y procesas más pedidos sin necesidad de ampliar tu equipo.",
            },
          ]}
        />

        <HowItWorks
          title={t.n8nAutomationHowItWorksTitle}
          subtitle={t.n8nAutomationHowItWorksSubtitle}
          steps={[
            {
              number: "1",
              icon: <Settings2 className="w-6 h-6" />,
              title: t.n8nAutomationStep1Title,
              description: t.n8nAutomationStep1Desc,
            },
            {
              number: "2",
              icon: <Workflow className="w-6 h-6" />,
              title: t.n8nAutomationStep2Title,
              description: t.n8nAutomationStep2Desc,
            },
            {
              number: "3",
              icon: <Zap className="w-6 h-6" />,
              title: t.n8nAutomationStep3Title,
              description: t.n8nAutomationStep3Desc,
            },
          ]}
        />

        <GeoCoverage
          title={t.n8nAutomationGeoCoverageTitle}
          subtitle={t.n8nAutomationGeoCoverageSubtitle}
          cities={[
            "Santa Cruz de Tenerife",
            "San Cristóbal de La Laguna",
            "Adeje",
            "Los Cristianos",
            "Puerto de la Cruz",
            "Las Palmas de GC",
            "Lanzarote",
            "La Palma",
          ]}
          serviceArea={t.n8nAutomationServiceArea}
        />

        <TestimonialCarousel testimonials={mockTestimonials} />
        <FAQAccordion items={mockFaqs} />

        <InternalLinks
          title={t.n8nAutomationInternalLinksTitle}
          links={[
            {
              href: "/automatizacion-whatsapp-restaurante",
              label: t.n8nAutomationInternalLink1Label,
              description: t.n8nAutomationInternalLink1Desc,
            },
            {
              href: "/tap-review",
              label: "NFC para reseñas Google",
              description: "Multiplica reseñas automáticamente",
            },
            {
              href: "/carta-digital",
              label: "Carta digital QR",
              description: "Digitaliza tu menú",
            },
            {
              href: "/software-restaurantes-canarias",
              label: "Software restaurantes",
              description: "Suite completa de herramientas",
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default AutomationN8nContainer;
