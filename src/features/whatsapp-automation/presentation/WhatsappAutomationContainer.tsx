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
      "La automatización de WhatsApp ha reducido mis tiempos de respuesta a segundos!",
    name: "Laura Martínez",
    title: "Gerente, Restaurante El Mirador",
    avatarUrl: "/avatars/laura-martinez.jpg",
  },
  {
    id: 2,
    quote: "Mis clientes ya no esperan para recibir respuestas. ¡Excelente!",
    name: "Javier López",
    title: "Propietario, Café La Playa",
    avatarUrl: "/avatars/javier-lopez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Cómo funciona la automatización de WhatsApp?",
    answer:
      "Conectamos tu WhatsApp Business con nuestras herramientas para responder preguntas frecuentes y notificar pedidos automáticamente.",
  },
  {
    id: 2,
    question: "¿Puedo personalizar las respuestas automáticas?",
    answer:
      "Sí, puedes personalizar las respuestas automáticas para que se adapten a tu restaurante y a las preguntas más frecuentes.",
  },
];

const WhatsappAutomationContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.whatsappAutomationSeoTitle}</title>
        <meta name="description" content={t.whatsappAutomationSeoDescription} />
      </Helmet>
      <Navbar scrolled={true} />
      <main>
        <Hero />
        <div className="container mx-auto px-6 text-center -mt-48 md:-mt-64 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {t.whatsappAutomationHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {t.whatsappAutomationHeroSubtitle}
          </p>
          <div className="mt-8">
            <a
              href="#contacto"
              className="inline-block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              {t.whatsappAutomationHeroCta}
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

export default WhatsappAutomationContainer;
