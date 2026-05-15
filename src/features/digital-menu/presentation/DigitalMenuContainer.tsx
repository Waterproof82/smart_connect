import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

import TestimonialCarousel, {
  Testimonial,
} from "@shared/presentation/components/TestimonialCarousel";
import FAQAccordion, {
  FAQItem,
} from "@shared/presentation/components/FAQAccordion";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Contact } from "@features/landing/presentation/components/Contact";
import { Hero } from "@features/landing/presentation/components/Hero";
import { Helmet } from "react-helmet-async";

// Mock data - in a real app, this would come from a service or CMS
const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Carlos R.",
    title: "Dueño, Guachinche El Moderno",
    quote:
      "La carta digital ha sido un antes y un después. Los clientes piden más rápido y hemos reducido los errores a cero. ¡Y es súper fácil de actualizar!",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 2,
    name: "María G.",
    title: "Gerente, Beach Club La Arena",
    quote:
      "Estábamos buscando una solución sin comisiones abusivas. Esto es justo lo que necesitábamos. El soporte técnico en Tenerife es un plus increíble.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
  },
];

const mockFaqs: FAQItem[] = [
  {
    id: 1,
    question: "¿Necesito una app para que mis clientes vean la carta?",
    answer:
      "No. Tu carta digital se abre en cualquier navegador móvil escaneando el QR. Sin descargas, sin barreras para tus clientes.",
  },
  {
    id: 2,
    question: "¿Puedo modificar los precios y platos yo mismo?",
    answer:
      "¡Por supuesto! Te damos acceso a un panel de control súper sencillo donde puedes cambiar precios, añadir platos, ocultar lo que no tengas en stock y mucho más, en tiempo real.",
  },
  {
    id: 3,
    question: "¿Tiene algún coste por comisión de pedidos?",
    answer:
      "No. A diferencia de las grandes plataformas de delivery, nuestro sistema de carta digital y pedidos a la mesa no tiene comisiones por venta. Pagas una cuota fija y vendes todo lo que quieras.",
  },
  {
    id: 4,
    question: "¿Funciona para mi bar/cafetería o solo es para restaurantes?",
    answer:
      "Funciona perfectamente para cualquier negocio de hostelería: restaurantes, bares, cafeterías, guachinches, food trucks, etc. Es totalmente adaptable.",
  },
];

const DigitalMenuContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.digitalMenuSeoTitle}</title>
        <meta name="description" content={t.digitalMenuSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.digitalMenuHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.digitalMenuHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.digitalMenuHeroCta}
            </a>
          </div>
        </div>

        {/* Feature List Section would go here */}

        <TestimonialCarousel testimonials={mockTestimonials} />

        <FAQAccordion items={mockFaqs} />

        <Contact />
      </main>
    </>
  );
};

export default DigitalMenuContainer;
