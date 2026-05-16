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
  ServiceSchema,
  BreadcrumbListSchema,
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

const AutomationN8nContainer: React.FC = () => {
  const { t } = useLanguage();

  const mockTestimonials: TestimonialType[] = [
    {
      id: 1,
      quote: t.n8nAutomationTestimonial1Quote,
      name: t.n8nAutomationTestimonial1Name,
      title: t.n8nAutomationTestimonial1Title,
      avatarUrl: "/avatars/carlos-ruiz.jpg",
    },
    {
      id: 2,
      quote: t.n8nAutomationTestimonial2Quote,
      name: t.n8nAutomationTestimonial2Name,
      title: t.n8nAutomationTestimonial2Title,
      avatarUrl: "/avatars/ana-garcia.jpg",
    },
  ];

  const mockFaqs: FAQType[] = [
    {
      id: 1,
      question: t.n8nAutomationFaq1Question,
      answer: t.n8nAutomationFaq1Answer,
    },
    {
      id: 2,
      question: t.n8nAutomationFaq2Question,
      answer: t.n8nAutomationFaq2Answer,
    },
    {
      id: 3,
      question: t.n8nAutomationFaq3Question,
      answer: t.n8nAutomationFaq3Answer,
    },
    {
      id: 4,
      question: t.n8nAutomationFaq4Question,
      answer: t.n8nAutomationFaq4Answer,
    },
    {
      id: 5,
      question: t.n8nAutomationFaq5Question,
      answer: t.n8nAutomationFaq5Answer,
    },
    {
      id: 6,
      question: t.n8nAutomationFaq6Question,
      answer: t.n8nAutomationFaq6Answer,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t.n8nAutomationSeoTitle}</title>
        <meta name="description" content={t.n8nAutomationSeoDescription} />
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <meta property="og:title" content={t.n8nAutomationSeoTitle} />
        <meta
          property="og:description"
          content={t.n8nAutomationSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
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
        geo={{
          latitude: 28.46824,
          longitude: -16.25462,
        }}
        areaServed={["Tenerife", "Canarias"]}
      />
      <ServiceSchema
        name="Automatización con n8n"
        description="Flujos de trabajo automatizados que conectan CRM, email, WhatsApp y redes sociales para captación y fidelización de clientes."
        url="https://digitalizatenerife.es/automatizacion-restaurantes-n8n"
        providerName="SmartConnect AI"
        providerUrl="https://digitalizatenerife.es"
        providerLogoUrl="https://digitalizatenerife.es/icon.png"
        areaServed={["Tenerife", "Canarias"]}
        serviceType="WorkflowAutomation"
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: "https://digitalizatenerife.es/" },
          {
            name: "Automatización n8n",
            url: "https://digitalizatenerife.es/automatizacion-restaurantes-n8n",
          },
        ]}
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
              description: t.n8nAutomationBenefit4Desc,
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

        <TestimonialCarousel
          title={t.n8nAutomationTestimonialsTitle}
          testimonials={mockTestimonials}
        />
        <FAQAccordion title={t.n8nAutomationFaqsTitle} items={mockFaqs} />

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
              label: t.n8nAutomationInternalLink2Label,
              description: t.n8nAutomationInternalLink2Desc,
            },
            {
              href: "/carta-digital",
              label: t.n8nAutomationInternalLink3Label,
              description: t.n8nAutomationInternalLink3Desc,
            },
            {
              href: "/software-restaurantes-canarias",
              label: t.n8nAutomationInternalLink4Label,
              description: t.n8nAutomationInternalLink4Desc,
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default AutomationN8nContainer;
