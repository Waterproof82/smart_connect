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
import { Contact } from "@features/landing/presentation/components/Contact";
import { Helmet } from "react-helmet-async";

const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Laura P.",
    title: "Encargada, Bar El Puerto",
    quote:
      "Desde que los clientes piden desde la mesa, los camareros pueden dedicarse a atender mejor y a vender más. La rotación de mesas ha aumentado un 20%.",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704g",
  },
];

const mockFaqs: FAQItem[] = [
  {
    id: 1,
    question: "¿Cómo llega el pedido a cocina o a la barra?",
    answer:
      "El sistema se puede integrar con impresoras de tickets o pantallas en cocina (KDS). En cuanto el cliente confirma el pedido, se imprime o aparece en pantalla instantáneamente.",
  },
  {
    id: 2,
    question: "¿Permite el pago desde el móvil?",
    answer:
      "Sí, podemos integrar pasarelas de pago como Stripe o Redsys para que el cliente pueda pagar su cuenta directamente desde el móvil, agilizando todavía más el servicio.",
  },
];

const TableOrdersContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.tableOrdersSeoTitle}</title>
        <meta name="description" content={t.tableOrdersSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.tableOrdersHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.tableOrdersHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.tableOrdersHeroCta}
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

export default TableOrdersContainer;
