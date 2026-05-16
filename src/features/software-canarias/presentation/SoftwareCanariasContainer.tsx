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
  Package,
  MapPin,
  QrCode,
  Star,
  ArrowRight,
} from "lucide-react";

const mockTestimonials: TestimonialType[] = [
  {
    id: 1,
    quote:
      "SmartConnect AI nos ha dado todas las herramientas para digitalizar el restaurante: carta QR, WhatsApp automatizado, reseñas NFC... Ahora todo funciona solo.",
    name: "Carlos García",
    title: "Propietario, Restaurante El Puerto, Santa Cruz",
    avatarUrl: "/avatars/carlos-garcia.jpg",
  },
  {
    id: 2,
    quote:
      "Todo en uno: menú digital, pedidos QR y automatización. Además, el soporte está en Tenerife, lo que marca la diferencia cuando necesitas ayuda.",
    name: "Ana Fernández",
    title: "Gerente, Café La Costa, La Laguna",
    avatarUrl: "/avatars/ana-fernandez.jpg",
  },
];

const mockFaqs: FAQType[] = [
  {
    id: 1,
    question: "¿Qué incluye el software para restaurantes en Canarias?",
    answer:
      "SmartConnect AI es una suite completa: carta digital QR, menú interactivo, pedidos desde la mesa, tarjetas NFC para reseñas Google, automatización n8n y WhatsApp Business. Todo lo que necesita un restaurante moderno en Canarias.",
  },
  {
    id: 2,
    question: "¿Es fácil de implementar?",
    answer:
      "Sí. La mayoría de herramientas se configuran en 24 horas. Nuestro equipo se encarga de todo: instalación, configuración y capacitación. No necesitas conocimientos técnicos.",
  },
  {
    id: 3,
    question:
      "¿Puedo contratar servicios por separado o es obligatorio el pack completo?",
    answer:
      "Puedes contratar los servicios que necesites por separado: solo la carta digital, solo las tarjetas NFC, solo la automatización... Cada herramienta funciona de forma independiente. Eso sí, cuando las combinas, los resultados son mucho mejores.",
  },
  {
    id: 4,
    question: "¿Hay soporte técnico en Canarias?",
    answer:
      "Sí, nuestro equipo está en Tenerife. Ofrecemos soporte presencial en la isla y soporte remoto para el resto de Canarias. Resolvemos incidencias en horas, no en días.",
  },
  {
    id: 5,
    question: "¿Qué precio tiene el software para restaurantes?",
    answer:
      "Los precios empiezan desde una cuota mensual muy baja por herramienta. Ofrecemos packs con descuento si contratas varias. Sin permanencia, sin comisiones, sin sorpresas. Solicita una demo y te enviamos un presupuesto personalizado.",
  },
  {
    id: 6,
    question: "¿Funciona para cualquier tipo de negocio hostelero?",
    answer:
      "Sí, nuestras herramientas funcionan para restaurantes, bares, cafeterías, guachinches, beach clubs, hoteles, food trucks y cualquier negocio de hostelería en Canarias.",
  },
];

const SoftwareCanariasContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.softwareCanariasSeoTitle}</title>
        <meta name="description" content={t.softwareCanariasSeoDescription} />
        <link
          rel="canonical"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <meta property="og:title" content={t.softwareCanariasSeoTitle} />
        <meta
          property="og:description"
          content={t.softwareCanariasSeoDescription}
        />
        <meta
          property="og:url"
          content="https://digitalizatenerife.es/software-restaurantes-canarias"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.softwareCanariasSeoTitle} />
        <meta
          name="twitter:description"
          content={t.softwareCanariasSeoDescription}
        />
      </Helmet>

      <SeoFaqSchema faqs={mockFaqs} />
      <LocalBusinessSchema
        name="SmartConnect AI - Software Restaurantes Canarias"
        description="Software para restaurantes en Canarias. Carta digital, menú QR, pedidos, NFC y automatización. Todo en uno."
        url="https://digitalizatenerife.es/software-restaurantes-canarias"
        address={{
          streetAddress: "Santa Cruz de Tenerife",
          addressLocality: "Santa Cruz de Tenerife",
          addressRegion: "Tenerife",
          postalCode: "38001",
          addressCountry: "ES",
        }}
        areaServed={["Canarias"]}
      />

      <Navbar scrolled={true} />
      <main>
        <PageHero
          title={t.softwareCanariasHeroTitle}
          subtitle={t.softwareCanariasHeroSubtitle}
          cta={
            <>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                {t.softwareCanariasHeroCta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/34600000000?text=Quiero%20saber%20mas%20sobre%20el%20software%20para%20restaurantes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Habla por WhatsApp
              </a>
            </>
          }
        />
        <StatsBar
          stats={[
            { value: "50+", label: "Restaurantes digitalizados" },
            { value: "24h", label: "Implementación" },
            { value: "6", label: "Herramientas integradas" },
            { value: "0%", label: "Comisiones" },
          ]}
        />

        <BenefitsGrid
          title="Todo lo que necesitas para digitalizar tu restaurante"
          subtitle="Una suite completa de herramientas diseñadas para la hostelería canaria"
          columns={2}
          benefits={[
            {
              icon: <QrCode className="w-6 h-6" />,
              title: "Carta digital QR + Menú interactivo",
              description:
                "Tu carta en formato digital con fotos, precios y alérgenos. Los clientes la ven escaneando un QR. Sin apps, sin descargas, sin comisiones.",
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Automatización n8n + WhatsApp",
              description:
                "Conecta todas tus herramientas y automatiza procesos. Responder WhatsApp, gestionar reseñas, enviar emails... Todo funcionando solo.",
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Tarjetas NFC para reseñas Google",
              description:
                "Multiplica tus reseñas en Google con tarjetas NFC. Un toque y el cliente deja su opinión. Más reseñas = mejor posicionamiento en Google.",
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: "Hecho en Canarias para Canarias",
              description:
                "Somos un equipo local con presencia en Tenerife. Entendemos el mercado canario, sus necesidades y su idiosincrasia. Soporte presencial y cercano.",
            },
          ]}
        />

        <HowItWorks
          title="Cómo empezar con SmartConnect AI"
          subtitle="De cero a digitalizado en 3 pasos"
          steps={[
            {
              number: "1",
              icon: <Package className="w-6 h-6" />,
              title: "Elige tus herramientas",
              description:
                "Selecciona los servicios que necesitas: carta digital, NFC, automatización... Una herramienta o todas. Tú decides.",
            },
            {
              number: "2",
              icon: <Zap className="w-6 h-6" />,
              title: "Lo configuramos todo",
              description:
                "Nuestro equipo configura todas las herramientas y las adapta a tu restaurante. En 24 horas tienes todo funcionando.",
            },
            {
              number: "3",
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Disfruta de los resultados",
              description:
                "Más clientes, mejores reseñas, menos trabajo manual. Tu restaurante funciona mejor mientras tú te centras en lo que importa: dar de comer bien.",
            },
          ]}
        />

        <GeoCoverage
          title="Disponible en todas las Islas Canarias"
          subtitle="SmartConnect AI funciona para restaurantes en cualquier isla"
          cities={[
            "Santa Cruz de Tenerife",
            "San Cristóbal de La Laguna",
            "Adeje",
            "Los Cristianos",
            "Puerto de la Cruz",
            "Las Palmas de GC",
            "Lanzarote",
            "La Palma",
          ]}
          serviceArea="Servicio en todo el archipiélago canario. Soporte presencial en Tenerife y remoto en el resto de islas."
        />

        <TestimonialCarousel testimonials={mockTestimonials} />
        <FAQAccordion items={mockFaqs} />

        <InternalLinks
          title="Explora cada herramienta"
          links={[
            {
              href: "/carta-digital",
              label: "Carta digital QR",
              description: "Tu menú en digital",
            },
            {
              href: "/tap-review",
              label: "Tarjetas NFC reseñas",
              description: "Multiplica reseñas Google",
            },
            {
              href: "/automatizacion-restaurantes-n8n",
              label: "Automatización n8n",
              description: "Procesos automatizados",
            },
            {
              href: "/automatizacion-whatsapp-restaurante",
              label: "WhatsApp Automático",
              description: "Atención 24/7",
            },
            {
              href: "/carta-digital",
              label: "Menú sin app",
              description: "Acceso directo al menú",
            },
          ]}
        />

        <Contact />
      </main>
    </>
  );
};

export default SoftwareCanariasContainer;
