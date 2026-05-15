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
      "SmartConnect AI ha transformado completamente mi restaurante. ¡Gracias!",
    name: "Carlos García",
    title: "Propietario, Restaurante El Puerto",
    avatarUrl: "/avatars/carlos-garcia.jpg",
  },
  {
    id: 2,
    quote: "Las herramientas digitales han aumentado mis ventas en un 30%!",
    name: "Ana Fernández",
    title: "Gerente, Café La Costa",
    avatarUrl: "/avatars/ana-fernandez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Qué tipo de software ofrecen para Canarias?",
    answer:
      "Ofrecemos soluciones digitales como menús QR, automatización n8n, y herramientas para gestionar pedidos y reseñas.",
  },
  {
    id: 2,
    question: "¿Es fácil de implementar?",
    answer:
      "Sí, nuestro equipo se encarga de la configuración y capacitación para que puedas empezar a usar las herramientas rápidamente.",
  },
];

const SoftwareCanariasContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.softwareCanariasSeoTitle}</title>
        <meta name="description" content={t.softwareCanariasSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.softwareCanariasHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.softwareCanariasHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.softwareCanariasHeroCta}
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

export default SoftwareCanariasContainer;
