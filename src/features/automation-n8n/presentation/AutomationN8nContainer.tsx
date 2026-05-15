import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Hero } from "@features/landing/presentation/components/Hero";
import TestimonialCarousel, {
  Testimonial as TestimonialType,
} from "@shared/presentation/components/TestimonialCarousel";
import FAQAccordion, {
  FAQItem as FAQType,
} from "@shared/presentation/components/FAQAccordion";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Contact } from "@features/landing/presentation/components/Contact";
import { Helmet } from "react-helmet-async";

const mockTestimonials: TestimonialType[] = [
  {
    id: 1,
    quote:
      "La automatización n8n ha reducido mis tiempos de respuesta en un 80%. ¡Impresionante!",
    name: "Carlos Ruiz",
    title: "Gerente, Restaurante El Rincón",
    avatarUrl: "/avatars/carlos-ruiz.jpg",
  },
  {
    id: 2,
    quote:
      "Conectamos CRM, WhatsApp y Google Reviews en minutos. ¡Mi equipo adora esto!",
    name: "Ana García",
    title: "Directora, Café Central",
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
];

const AutomationN8nContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.n8nAutomationSeoTitle}</title>
        <meta name="description" content={t.n8nAutomationSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.n8nAutomationHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.n8nAutomationHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.n8nAutomationHeroCta}
            </a>
          </div>
        </div>
        <TestimonialCarousel testimonials={mockTestimonials} />
        <FAQAccordion items={mockFaqs} />
        <Contact />
      </main>
    </>
  );
};

export default AutomationN8nContainer;
