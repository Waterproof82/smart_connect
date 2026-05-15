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
      "Las tarjetas NFC han multiplicado nuestras reseñas en Google. ¡Más clientes y mejor posicionamiento!",
    name: "Juan Pérez",
    title: "Propietario, Restaurante La Terraza",
    avatarUrl: "/avatars/juan-perez.jpg",
  },
  {
    id: 2,
    quote:
      "Fácil de implementar y los clientes lo agradecen. En solo un mes tenemos 30 reseñas más.",
    name: "María López",
    title: "Gerente, Bar El Rincón",
    avatarUrl: "/avatars/maria-lopez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Cómo funcionan las tarjetas NFC?",
    answer:
      "Los clientes acercan su móvil a la tarjeta NFC. Se abre automáticamente la página de reseñas de Google para tu negocio.",
  },
  {
    id: 2,
    question: "¿Necesito configurar algo en mi restaurante?",
    answer:
      "Solo necesitas colocar la tarjeta NFC en un lugar visible. El resto lo configura SmartConnect AI.",
  },
];

const NfcReviewsContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.nfcReviewsSeoTitle}</title>
        <meta name="description" content={t.nfcReviewsSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.nfcReviewsHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.nfcReviewsHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.nfcReviewsHeroCta}
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

export default NfcReviewsContainer;
