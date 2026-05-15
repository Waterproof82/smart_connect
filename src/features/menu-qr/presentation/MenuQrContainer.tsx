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
      <Navbar scrolled={true} />
      <main>
        <Hero />
          <Helmet>
        <title>{t.menuQrHeroTitle}</title>
        <meta name="description" content={t.menuQrHeroSubtitle} />
      </Helmet>
      <main>
        <Hero />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{t.menuQrHeroTitle}</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">{t.menuQrHeroSubtitle}</p>
        <a
            href="#contacto"
            className="block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
          >
            {t.menuQrHeroCta}
          </a>
        </Hero>

        <TestimonialCarousel testimonials={mockTestimonials} />

        <FAQAccordion items={mockFaqs} />

        <Contact />
      </main>
    </>
  );
};

export default MenuQrContainer;
