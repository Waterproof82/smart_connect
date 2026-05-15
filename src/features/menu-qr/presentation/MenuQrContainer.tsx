import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Hero } from "@features/landing/presentation/components/Hero";
import TestimonialCarousel, {
  Testimonial,
} from "@shared/presentation/components/TestimonialCarousel";
import FAQAccordion, {
  FAQItem,
} from "@shared/presentation/components/FAQAccordion";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Contact } from "@features/landing/presentation/components/Contact";

const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana S.",
    title: "Jefa de Sala, Restaurante La Cúpula",
    quote:
      "El menú QR es súper intuitivo. Los clientes lo usan sin problemas y hemos notado que los pedidos salen con menos errores. Un acierto.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
  },
];

const mockFaqs: FAQItem[] = [
  {
    id: 1,
    question: "¿Es solo una imagen PDF o es un menú interactivo?",
    answer:
      "Es un menú totalmente interactivo. Tus clientes pueden navegar por categorías, ver alérgenos, y en el futuro, incluso pedir directamente. No es un simple PDF.",
  },
  {
    id: 2,
    question:
      "¿Puedo tener diferentes menús (de día, de fin de semana, de postres)?",
    answer:
      "Sí. Puedes crear todos los menús que necesites y activarlos o desactivarlos con un solo clic desde tu panel de control. Ideal para menús del día o de temporada.",
  },
];

const MenuQrContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.menuQrSeoTitle}</title>
        <meta name="description" content={t.menuQrSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.menuQrHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.menuQrHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.menuQrHeroCta}
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

export default MenuQrContainer;
