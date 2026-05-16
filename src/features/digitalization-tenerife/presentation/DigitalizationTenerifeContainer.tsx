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
  ServiceSchema,
  BreadcrumbListSchema,
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
  Cloud,
  QrCode,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

const DigitalizationTenerifeContainer: React.FC = () => {
  const { t } = useLanguage();

  const mockTestimonials: TestimonialType[] = [
    {
      id: 1,
      quote: t.digitalizationTenerifeTestimonial1Quote,
      name: t.digitalizationTenerifeTestimonial1Name,
      title: t.digitalizationTenerifeTestimonial1Title,
      avatarUrl: "/avatars/maria-lopez.jpg",
    },
    {
      id: 2,
      quote: t.digitalizationTenerifeTestimonial2Quote,
      name: t.digitalizationTenerifeTestimonial2Name,
      title: t.digitalizationTenerifeTestimonial2Title,
      avatarUrl: "/avatars/javier-garcia.jpg",
    },
  ];

  const mockFaqs: FAQType[] = [
    {
      id: 1,
      question: t.digitalizationTenerifeFaq1Question,
      answer: t.digitalizationTenerifeFaq1Answer,
    },
    {
      id: 2,
      question: t.digitalizationTenerifeFaq2Question,
      answer: t.digitalizationTenerifeFaq2Answer,
    },
    {
      id: 3,
      question: t.digitalizationTenerifeFaq3Question,
      answer: t.digitalizationTenerifeFaq3Answer,
    },
    {
      id: 4,
      question: t.digitalizationTenerifeFaq4Question,
      answer: t.digitalizationTenerifeFaq4Answer,
    },
    {
      id: 5,
      question: t.digitalizationTenerifeFaq5Question,
      answer: t.digitalizationTenerifeFaq5Answer,
    },
    {
      id: 6,
      question: t.digitalizationTenerifeFaq6Question,
      answer: t.digitalizationTenerifeFaq6Answer,
    },
    {
      id: 7,
      question: t.digitalizationTenerifeFaq7Question,
      answer: t.digitalizationTenerifeFaq7Answer,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t.digitalizationTenerifeSeoTitle}</title>
        <meta
          name="description"
          content={t.digitalizationTenerifeSeoDescription}
        />
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <meta property="og:title" content={t.digitalizationTenerifeSeoTitle} />
        <meta
          property="og:description"
          content={t.digitalizationTenerifeSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.digitalizationTenerifeSeoTitle} />
        <meta
          name="twitter:description"
          content={t.digitalizationTenerifeSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Digitalización Hostelería Tenerife"
        description={t.digitalizationTenerifeSeoDescription}
        url="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
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
        areaServed={["Tenerife"]}
      />
      <ServiceSchema
        name="Digitalización para Hostelería en Tenerife"
        description={t.digitalizationTenerifeSeoDescription}
        url="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        providerName="SmartConnect AI"
        providerUrl="https://digitalizatenerife.es"
        providerLogoUrl="https://digitalizatenerife.es/icon.png"
        areaServed={["Tenerife"]}
        serviceType="DigitalTransformation"
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: "https://digitalizatenerife.es/" },
          {
            name: "Digitalización Hostelería Tenerife",
            url: "https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife",
          },
        ]}
      />

      <Navbar scrolled={true} />
      <main>
        <PageHero
          title={t.digitalizationTenerifeHeroTitle}
          subtitle={t.digitalizationTenerifeHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.digitalizationTenerifeHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20digitalizar%20mi%20restaurante%20en%20Tenerife"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                {t.digitalizationTenerifeWhatsAppText}
              </a>
            </>
          }
        />

        <StatsBar
          stats={[
            { value: "50+", label: t.digitalizationTenerifeStat1Label },
            { value: "24h", label: t.digitalizationTenerifeStat2Label },
            { value: "+30%", label: t.digitalizationTenerifeStat3Label },
            { value: "0%", label: t.digitalizationTenerifeStat4Label },
          ]}
        />

        <BenefitsGrid
          title={t.digitalizationTenerifeBenefitsTitle}
          subtitle={t.digitalizationTenerifeBenefitsSubtitle}
          columns={2}
          benefits={[
            {
              icon: <QrCode className="w-6 h-6" />,
              title: t.digitalizationTenerifeBenefit1Title,
              description: t.digitalizationTenerifeBenefit1Desc,
            },
            {
              icon: <Cloud className="w-6 h-6" />,
              title: t.digitalizationTenerifeBenefit2Title,
              description: t.digitalizationTenerifeBenefit2Desc,
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: t.digitalizationTenerifeBenefit3Title,
              description: t.digitalizationTenerifeBenefit3Desc,
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: t.digitalizationTenerifeBenefit4Title,
              description: t.digitalizationTenerifeBenefit4Desc,
            },
          ]}
        />

        <HowItWorks
          title={t.digitalizationTenerifeHowItWorksTitle}
          subtitle={t.digitalizationTenerifeHowItWorksSubtitle}
          steps={[
            {
              number: "1",
              icon: <Cloud className="w-6 h-6" />,
              title: t.digitalizationTenerifeStep1Title,
              description: t.digitalizationTenerifeStep1Desc,
            },
            {
              number: "2",
              icon: <Zap className="w-6 h-6" />,
              title: t.digitalizationTenerifeStep2Title,
              description: t.digitalizationTenerifeStep2Desc,
            },
            {
              number: "3",
              icon: <TrendingUp className="w-6 h-6" />,
              title: t.digitalizationTenerifeStep3Title,
              description: t.digitalizationTenerifeStep3Desc,
            },
          ]}
        />

        <GeoCoverage
          title={t.digitalizationTenerifeGeoCoverageTitle}
          subtitle={t.digitalizationTenerifeGeoCoverageSubtitle}
          cities={[
            "Santa Cruz de Tenerife",
            "San Cristóbal de La Laguna",
            "Adeje",
            "Los Cristianos",
            "Puerto de la Cruz",
            "La Orotava",
            "Granadilla de Abona",
            "Las Palmas de GC",
          ]}
          serviceArea={t.digitalizationTenerifeServiceArea}
        />

        <TestimonialCarousel
          title={t.digitalizationTenerifeTestimonialsTitle}
          testimonials={mockTestimonials}
        />
        <FAQAccordion
          title={t.digitalizationTenerifeFaqsTitle}
          items={mockFaqs}
        />

        <InternalLinks
          title={t.digitalizationTenerifeInternalLinksTitle}
          links={[
            {
              href: "/carta-digital",
              label: t.digitalizationTenerifeInternalLink1Label,
              description: t.digitalizationTenerifeInternalLink1Desc,
            },
            {
              href: "/carta-digital",
              label: t.digitalizationTenerifeInternalLink2Label,
              description: t.digitalizationTenerifeInternalLink2Desc,
            },
            {
              href: "/tap-review",
              label: t.digitalizationTenerifeInternalLink3Label,
              description: t.digitalizationTenerifeInternalLink3Desc,
            },
            {
              href: "/automatizacion-whatsapp-restaurante",
              label: t.digitalizationTenerifeInternalLink4Label,
              description: t.digitalizationTenerifeInternalLink4Desc,
            },
            {
              href: "/carta-digital",
              label: t.digitalizationTenerifeInternalLink5Label,
              description: t.digitalizationTenerifeInternalLink5Desc,
            },
            {
              href: "/software-restaurantes-canarias",
              label: t.digitalizationTenerifeInternalLink6Label,
              description: t.digitalizationTenerifeInternalLink6Desc,
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default DigitalizationTenerifeContainer;
