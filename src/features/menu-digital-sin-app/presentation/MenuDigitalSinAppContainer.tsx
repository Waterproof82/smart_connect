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
      "El menú digital sin app ha simplificado nuestra vida. ¡Adiós a las apps!",
    name: "Carlos Ruiz",
    title: "Gerente, Restaurante El Puerto",
    avatarUrl: "/avatars/carlos-ruiz.jpg",
  },
  {
    id: 2,
    quote:
      "Los clientes pueden pedir desde su móvil sin necesidad de descargar nada.",
    name: "Laura Martínez",
    title: "Propietaria, Café La Costa",
    avatarUrl: "/avatars/laura-martinez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Cómo funciona el menú digital sin app?",
    answer:
      "Los clientes escanean un código QR en la mesa y pueden ver el menú directamente en su navegador.",
  },
  {
    id: 2,
    question: "¿Necesito descargar algo para usarlo?",
    answer: "No, solo necesitas un navegador web para acceder al menú.",
  },
];

const MenuDigitalSinAppContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.menuDigitalSinAppSeoTitle}</title>
        <meta name="description" content={t.menuDigitalSinAppSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.menuDigitalSinAppHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.menuDigitalSinAppHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.menuDigitalSinAppHeroCta}
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

export default MenuDigitalSinAppContainer;
