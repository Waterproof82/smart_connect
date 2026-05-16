import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { PageHero } from "@shared/presentation/components/SeoSchema";
import TestimonialCarousel, {
  Testimonial as TestimonialType,
} from "@shared/presentation/components/TestimonialCarousel";
import FAQAccordion, {
  FAQItem as FAQType,
} from "@shared/presentation/components/FAQAccordion";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Contact } from "@features/landing/presentation/components/Contact";
import { Helmet } from "react-helmet-async";
import {
  SeoFaqSchema,
  LocalBusinessSchema,
  BenefitsGrid,
  HowItWorks,
  StatsBar,
  GeoCoverage,
  InternalLinks,
} from "@shared/presentation/components/SeoSchema";
import {
  Smartphone,
  Zap,
  TrendingUp,
  Cloud,
  QrCode,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

const mockTestimonials: TestimonialType[] = [
  {
    id: 1,
    quote:
      "Digitalizamos completamente el restaurante: carta QR, pedidos desde mesa, tarjetas NFC. Ahora todo es más eficiente y nuestros clientes están más contentos.",
    name: "María López",
    title: "Gerente, Restaurante El Mirador, Adeje",
    avatarUrl: "/avatars/maria-lopez.jpg",
  },
  {
    id: 2,
    quote:
      "Pasamos de tener 5 reseñas en Google a más de 60 en dos meses. La digitalización ha sido la mejor inversión para nuestro bar en La Laguna.",
    name: "Javier García",
    title: "Propietario, Café La Costa, La Laguna",
    avatarUrl: "/avatars/javier-garcia.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Qué significa digitalizar un restaurante en Tenerife?",
    answer:
      "Digitalizar un restaurante es incorporar herramientas tecnológicas para mejorar la experiencia del cliente y la eficiencia del negocio. Incluye carta digital QR, pedidos desde el móvil, automatización de procesos, tarjetas NFC para reseñas Google y gestión digital de reservas y pedidos.",
  },
  {
    id: 2,
    question: "¿Es caro digitalizar un restaurante?",
    answer:
      "No tiene por qué. Empezamos con cuotas mensuales muy asequibles y sin permanencia. El retorno de la inversión es rápido: más ticket medio, menos costes de impresión, más reseñas en Google y más clientes recurrentes.",
  },
  {
    id: 3,
    question: "¿Por qué es importante digitalizar la hostelería en Tenerife?",
    answer:
      "Tenerife recibe millones de turistas al año que buscan experiencias rápidas y modernas. Un restaurante digitalizado atrae más clientes, aparece mejor en Google y ofrece una experiencia superior. Además, reduces costes y errores.",
  },
  {
    id: 4,
    question: "¿Cuánto tiempo se tarda en digitalizar un restaurante?",
    answer:
      "Depende de las herramientas que elijas. Una carta digital se implanta en 24 horas. Un sistema completo con pedidos QR, NFC y automatización puede estar listo en 2-3 días. Todo sin obras ni instalaciones complejas.",
  },
  {
    id: 5,
    question: "¿Ofrecéis soporte presencial en Tenerife?",
    answer:
      "Sí, tenemos equipo en Santa Cruz de Tenerife y damos soporte presencial en toda la isla. Para el resto de Canarias ofrecemos soporte remoto y visitas periódicas.",
  },
  {
    id: 6,
    question:
      "¿Qué tipos de negocio hostelero se benefician más de la digitalización?",
    answer:
      "Todos. Restaurantes, bares, cafeterías, guachinches, beach clubs, hoteles, food trucks... Cualquier negocio que atienda clientes en mesa se beneficia de la digitalización: más eficiencia, más ventas y mejores reseñas.",
  },
  {
    id: 7,
    question:
      "¿Qué resultados puedo esperar después de digitalizar mi restaurante?",
    answer:
      "Nuestros clientes en Tenerife reportan: aumento del 20-30% en ticket medio, reducción de errores en comandas, multiplicación de reseñas Google (5x o más), ahorro en impresión de cartas y mayor satisfacción del cliente.",
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
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <meta property="og:title" content={t.digitalizationTenerifeSeoTitle} />
        <meta
          property="og:description"
          content={t.digitalizationTenerifeSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.digitalizationTenerifeSeoTitle} />
        <meta
          name="twitter:description"
          content={t.digitalizationTenerifeSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Digitalización Hostelería Tenerife"
        description="Digitalización para restaurantes en Tenerife. Menú QR, pedidos, NFC, automatización. Transforma tu negocio."
        url="https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife"
        address={{
          streetAddress: "Santa Cruz de Tenerife",
          addressLocality: "Santa Cruz de Tenerife",
          addressRegion: "Tenerife",
          postalCode: "38001",
          addressCountry: "ES",
        }}
        geo={{
          latitude: 28.46824,
          longitude: -16.25462,
        }}
        areaServed={["Tenerife"]}
      />

      <Navbar scrolled={true} />
      <main>
        <PageHero
          title={t.digitalizationTenerifeHeroTitle}
          subtitle={t.digitalizationTenerifeHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.digitalizationTenerifeHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20digitalizar%20mi%20restaurante%20en%20Tenerife"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Consulta por WhatsApp
              </a>
            </>
          }
        />

        <StatsBar
          stats={[
            { value: "50+", label: "Negocios digitalizados en Tenerife" },
            { value: "24h", label: "Tu carta QR activa" },
            { value: "+30%", label: "Aumento de ticket medio" },
            { value: "0%", label: "Comisiones" },
          ]}
        />

        <BenefitsGrid
          title="Digitaliza tu restaurante en Tenerife y nota la diferencia"
          subtitle="Tecnología accesible para negocios locales canarios"
          columns={2}
          benefits={[
            {
              icon: <QrCode className="w-6 h-6" />,
              title: "Carta digital y menú QR",
              description:
                "Tu menú en formato digital, siempre actualizado, sin costes de impresión. Los clientes lo ven escaneando un QR desde su móvil. Sin apps, sin complicaciones.",
            },
            {
              icon: <Cloud className="w-6 h-6" />,
              title: "Automatización inteligente",
              description:
                "Conecta tus herramientas y automatiza procesos: respuestas de WhatsApp, notificaciones de reseñas, emails de seguimiento. Ahorra tiempo y no pierdas oportunidades.",
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Más reseñas en Google",
              description:
                "Con nuestras tarjetas NFC, tus clientes dejan reseñas en Google con un solo toque. Más reseñas = mejor posicionamiento = más clientes.",
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: "Hecho por y para Tenerife",
              description:
                "Somos un equipo local. Entendemos el mercado canario, sus oportunidades y sus retos. Soporte presencial en toda la isla. Hablamos tu mismo idioma.",
            },
          ]}
        />

        <HowItWorks
          title="Digitaliza tu negocio en 3 pasos"
          subtitle="De principio a fin, sin complicaciones"
          steps={[
            {
              number: "1",
              icon: <Cloud className="w-6 h-6" />,
              title: "Diagnóstico gratuito",
              description:
                "Analizamos tu restaurante y te recomendamos las mejores herramientas digitales para tu caso concreto. Sin compromiso.",
            },
            {
              number: "2",
              icon: <Zap className="w-6 h-6" />,
              title: "Implementación exprés",
              description:
                "En 24-48 horas tienes todo configurado y funcionando. Sin obras, sin instalaciones. Solo resultados.",
            },
            {
              number: "3",
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Resultados visibles",
              description:
                "Más clientes, mejores reseñas, menos trabajo manual. Te ayudamos a medir el impacto de la digitalización en tu negocio.",
            },
          ]}
        />

        <GeoCoverage
          title="Digitalización hostelera en toda Canarias"
          subtitle="Especialistas en digitalización de restaurantes en Tenerife y Canarias"
          cities={[
            "Santa Cruz de Tenerife",
            "San Cristóbal de La Laguna",
            "Adeje",
            "Los Cristianos",
            "Puerto de la Cruz",
            "La Orotava",
            "Granadilla de Abona",
            "Las Palmas de GC",
          ]}
          serviceArea="Servicio en toda Canarias con presencia local en Tenerife."
        />

        <TestimonialCarousel testimonials={mockTestimonials} />
        <FAQAccordion items={mockFaqs} />

        <InternalLinks
          title="Todas nuestras soluciones"
          links={[
            {
              href: "/carta-digital",
              label: "Carta digital QR",
              description: "Tu menú siempre actualizado",
            },
            {
              href: "/carta-digital",
              label: "Menú QR interactivo",
              description: "Navegación visual del menú",
            },
            {
              href: "/tap-review",
              label: "Tarjetas NFC reseñas",
              description: "Multiplica reseñas Google",
            },
            {
              href: "/automatizacion-whatsapp-restaurante",
              label: "Automatización WhatsApp",
              description: "Atención 24/7 automática",
            },
            {
              href: "/carta-digital",
              label: "Pedidos QR mesa",
              description: "Pide sin esperar",
            },
            {
              href: "/software-restaurantes-canarias",
              label: "Software completo",
              description: "Suite de herramientas digitales",
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default DigitalizationTenerifeContainer;
