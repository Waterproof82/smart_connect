import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { PageHero } from "@shared/presentation/components/SeoSchema";
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
} from "@shared/presentation/components/SeoSchema";
import {
  Smartphone,
  Zap,
  TrendingUp,
  Package,
  MapPin,
  QrCode,
  Star,
  ArrowRight,
} from "lucide-react";

const SoftwareCanariasContainer: React.FC = () => {
  const { t } = useLanguage();

  const mockTestimonials: TestimonialType[] = [
    {
      id: 1,
      quote: t.softwareCanariasTestimonial1Quote,
      name: t.softwareCanariasTestimonial1Name,
      title: t.softwareCanariasTestimonial1Title,
      avatarUrl: "/avatars/carlos-garcia.jpg",
    },
    {
      id: 2,
      quote: t.softwareCanariasTestimonial2Quote,
      name: t.softwareCanariasTestimonial2Name,
      title: t.softwareCanariasTestimonial2Title,
      avatarUrl: "/avatars/ana-fernandez.jpg",
    },
  ];

  const mockFaqs: FAQType[] = [
    {
      id: 1,
      question: t.softwareCanariasFaq1Question,
      answer: t.softwareCanariasFaq1Answer,
    },
    {
      id: 2,
      question: t.softwareCanariasFaq2Question,
      answer: t.softwareCanariasFaq2Answer,
    },
    {
      id: 3,
      question: t.softwareCanariasFaq3Question,
      answer: t.softwareCanariasFaq3Answer,
    },
    {
      id: 4,
      question: t.softwareCanariasFaq4Question,
      answer: t.softwareCanariasFaq4Answer,
    },
    {
      id: 5,
      question: t.softwareCanariasFaq5Question,
      answer: t.softwareCanariasFaq5Answer,
    },
    {
      id: 6,
      question: t.softwareCanariasFaq6Question,
      answer: t.softwareCanariasFaq6Answer,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t.softwareCanariasSeoTitle}</title>
        <meta name="description" content={t.softwareCanariasSeoDescription} />
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <meta property="og:title" content={t.softwareCanariasSeoTitle} />
        <meta
          property="og:description"
          content={t.softwareCanariasSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.softwareCanariasSeoTitle} />
        <meta
          name="twitter:description"
          content={t.softwareCanariasSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Software Restaurantes Canarias"
        description={t.softwareCanariasSeoDescription}
        url="https://digitalizatenerife.es/software-restaurantes-canarias"
        address={{
          streetAddress: "Santa Cruz de Tenerife",
          addressLocality: "Santa Cruz de Tenerife",
          addressRegion: "Tenerife",
          postalCode: "38001",
          addressCountry: "ES",
        }}
        areaServed={["Canarias"]}
      />

      <Navbar scrolled={true} />
      <main>
        <PageHero
          title={t.softwareCanariasHeroTitle}
          subtitle={t.softwareCanariasHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.softwareCanariasHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20saber%20mas%20sobre%20el%20software%20para%20restaurantes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                {t.softwareCanariasWhatsAppText}
              </a>
            </>
          }
        />
        <StatsBar
          stats={[
            { value: "50+", label: t.softwareCanariasStat1Label },
            { value: "24h", label: t.softwareCanariasStat2Label },
            { value: "6", label: t.softwareCanariasStat3Label },
            { value: "0%", label: t.softwareCanariasStat4Label },
          ]}
        />

        <BenefitsGrid
          title={t.softwareCanariasBenefitsTitle}
          subtitle={t.softwareCanariasBenefitsSubtitle}
          columns={2}
          benefits={[
            {
              icon: <QrCode className="w-6 h-6" />,
              title: t.softwareCanariasBenefit1Title,
              description: t.softwareCanariasBenefit1Desc,
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: t.softwareCanariasBenefit2Title,
              description: t.softwareCanariasBenefit2Desc,
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: t.softwareCanariasBenefit3Title,
              description: t.softwareCanariasBenefit3Desc,
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: t.softwareCanariasBenefit4Title,
              description: t.softwareCanariasBenefit4Desc,
            },
          ]}
        />

        <HowItWorks
          title={t.softwareCanariasHowItWorksTitle}
          subtitle={t.softwareCanariasHowItWorksSubtitle}
          steps={[
            {
              number: "1",
              icon: <Package className="w-6 h-6" />,
              title: t.softwareCanariasStep1Title,
              description: t.softwareCanariasStep1Desc,
            },
            {
              number: "2",
              icon: <Zap className="w-6 h-6" />,
              title: t.softwareCanariasStep2Title,
              description: t.softwareCanariasStep2Desc,
            },
            {
              number: "3",
              icon: <TrendingUp className="w-6 h-6" />,
              title: t.softwareCanariasStep3Title,
              description: t.softwareCanariasStep3Desc,
            },
          ]}
        />

        <GeoCoverage
          title={t.softwareCanariasGeoCoverageTitle}
          subtitle={t.softwareCanariasGeoCoverageSubtitle}
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
          serviceArea={t.softwareCanariasServiceArea}
        />

        <TestimonialCarousel
          title={t.softwareCanariasTestimonialsTitle}
          testimonials={mockTestimonials}
        />
        <FAQAccordion title={t.softwareCanariasFaqsTitle} items={mockFaqs} />

        <InternalLinks
          title={t.softwareCanariasInternalLinksTitle}
          links={[
            {
              href: "/carta-digital",
              label: t.softwareCanariasInternalLink1Label,
              description: t.softwareCanariasInternalLink1Desc,
            },
            {
              href: "/tap-review",
              label: t.softwareCanariasInternalLink2Label,
              description: t.softwareCanariasInternalLink2Desc,
            },
            {
              href: "/automatizacion-restaurantes-n8n",
              label: t.softwareCanariasInternalLink3Label,
              description: t.softwareCanariasInternalLink3Desc,
            },
            {
              href: "/automatizacion-whatsapp-restaurante",
              label: t.softwareCanariasInternalLink4Label,
              description: t.softwareCanariasInternalLink4Desc,
            },
            {
              href: "/carta-digital",
              label: t.softwareCanariasInternalLink5Label,
              description: t.softwareCanariasInternalLink5Desc,
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default SoftwareCanariasContainer;
