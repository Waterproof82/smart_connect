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
      "La digitalización ha cambiado nuestra forma de trabajar para siempre!",
    name: "María López",
    title: "Gerente, Restaurante El Mirador",
    avatarUrl: "/avatars/maria-lopez.jpg",
  },
  {
    id: 2,
    quote: "Ahora gestionamos todo desde un solo lugar. ¡Increíble!",
    name: "Javier García",
    title: "Propietario, Café La Costa",
    avatarUrl: "/avatars/javier-garcia.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Qué herramientas de digitalización ofrecen?",
    answer:
      "Ofrecemos menús digitales QR, automatización n8n, y herramientas para gestionar pedidos y reseñas.",
  },
  {
    id: 2,
    question: "¿Es difícil implementar estas herramientas?",
    answer:
      "No, nuestro equipo se encarga de la configuración y capacitación para que puedas empezar rápidamente.",
  },
];

const DigitalizationTenerifeContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.digitalizationTenerifeSeoTitle}</title>
        <meta
          name="description"
          content={t.digitalizationTenerifeSeoDescription}
        />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.digitalizationTenerifeHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.digitalizationTenerifeHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.digitalizationTenerifeHeroCta}
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

export default DigitalizationTenerifeContainer;
