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

const WhatsappAutomationContainer: React.FC = () => {
  const { t } = useLanguage();

  const mockTestimonials: TestimonialType[] = [
    {
      id: 1,
      quote: t.whatsAppAutomationTestimonial1Quote,
      name: t.whatsAppAutomationTestimonial1Name,
      title: t.whatsAppAutomationTestimonial1Title,
      avatarUrl: "/avatars/laura-martinez.jpg",
    },
    {
      id: 2,
      quote: t.whatsAppAutomationTestimonial2Quote,
      name: t.whatsAppAutomationTestimonial2Name,
      title: t.whatsAppAutomationTestimonial2Title,
      avatarUrl: "/avatars/javier-lopez.jpg",
    },
  ];

  const mockFaqs: FAQType[] = [
    {
      id: 1,
      question: t.whatsAppAutomationFaq1Question,
      answer: t.whatsAppAutomationFaq1Answer,
    },
    {
      id: 2,
      question: t.whatsAppAutomationFaq2Question,
      answer: t.whatsAppAutomationFaq2Answer,
    },
    {
      id: 3,
      question: t.whatsAppAutomationFaq3Question,
      answer: t.whatsAppAutomationFaq3Answer,
    },
    {
      id: 4,
      question: t.whatsAppAutomationFaq4Question,
      answer: t.whatsAppAutomationFaq4Answer,
    },
    {
      id: 5,
      question: t.whatsAppAutomationFaq5Question,
      answer: t.whatsAppAutomationFaq5Answer,
    },
    {
      id: 6,
      question: t.whatsAppAutomationFaq6Question,
      answer: t.whatsAppAutomationFaq6Answer,
    },
    {
      id: 7,
      question: t.whatsAppAutomationFaq7Question,
      answer: t.whatsAppAutomationFaq7Answer,
    },
  ];

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
        <link
          rel="alternate"
          hrefLang="en"
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
        description={t.whatsappAutomationSeoDescription}
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
                {t.whatsAppAutomationWhatsAppText}
              </a>
            </>
          }
        />
        <StatsBar
          stats={[
            { value: "24/7", label: t.whatsAppAutomationStat1Label },
            { value: "<1s", label: t.whatsAppAutomationStat2Label },
            { value: "90%", label: t.whatsAppAutomationStat3Label },
            { value: "1d", label: t.whatsAppAutomationStat4Label },
          ]}
        />

        <BenefitsGrid
          title={t.whatsAppAutomationBenefitsTitle}
          subtitle={t.whatsAppAutomationBenefitsSubtitle}
          columns={2}
          benefits={[
            {
              icon: <Clock className="w-6 h-6" />,
              title: t.whatsAppAutomationBenefit1Title,
              description: t.whatsAppAutomationBenefit1Desc,
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              title: t.whatsAppAutomationBenefit2Title,
              description: t.whatsAppAutomationBenefit2Desc,
            },
            {
              icon: <Bot className="w-6 h-6" />,
              title: t.whatsAppAutomationBenefit3Title,
              description: t.whatsAppAutomationBenefit3Desc,
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: t.whatsAppAutomationBenefit4Title,
              description: t.whatsAppAutomationBenefit4Desc,
            },
          ]}
        />

        <HowItWorks
          title={t.whatsAppAutomationHowItWorksTitle}
          subtitle={t.whatsAppAutomationHowItWorksSubtitle}
          steps={[
            {
              number: "1",
              icon: <MessageSquare className="w-6 h-6" />,
              title: t.whatsAppAutomationStep1Title,
              description: t.whatsAppAutomationStep1Desc,
            },
            {
              number: "2",
              icon: <Bot className="w-6 h-6" />,
              title: t.whatsAppAutomationStep2Title,
              description: t.whatsAppAutomationStep2Desc,
            },
            {
              number: "3",
              icon: <Send className="w-6 h-6" />,
              title: t.whatsAppAutomationStep3Title,
              description: t.whatsAppAutomationStep3Desc,
            },
          ]}
        />

        <GeoCoverage
          title={t.whatsAppAutomationGeoCoverageTitle}
          subtitle={t.whatsAppAutomationGeoCoverageSubtitle}
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
          serviceArea={t.whatsAppAutomationServiceArea}
        />

        <TestimonialCarousel
          title={t.whatsAppAutomationTestimonialsTitle}
          testimonials={mockTestimonials}
        />
        <FAQAccordion title={t.whatsAppAutomationFaqsTitle} items={mockFaqs} />

        <InternalLinks
          title={t.whatsAppAutomationInternalLinksTitle}
          links={[
            {
              href: "/automatizacion-restaurantes-n8n",
              label: t.whatsAppAutomationInternalLink1Label,
              description: t.whatsAppAutomationInternalLink1Desc,
            },
            {
              href: "/tap-review",
              label: t.whatsAppAutomationInternalLink2Label,
              description: t.whatsAppAutomationInternalLink2Desc,
            },
            {
              href: "/carta-digital",
              label: t.whatsAppAutomationInternalLink3Label,
              description: t.whatsAppAutomationInternalLink3Desc,
            },
            {
              href: "/carta-digital",
              label: t.whatsAppAutomationInternalLink4Label,
              description: t.whatsAppAutomationInternalLink4Desc,
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default WhatsappAutomationContainer;
