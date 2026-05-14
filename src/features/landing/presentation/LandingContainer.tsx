import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Contact } from "./components/Contact";
import { SuccessStats } from "./components/SuccessStats";
import { Navbar } from "./components/Navbar";
import { useLanguage } from "../../../shared/context/LanguageContext";

// Add missing translation keys
declare module "../../../shared/context/LanguageContext" {
  interface Translation {
    seoTitle: string;
    seoDescription: string;
    seoProductDescription: string;
  }
}

const LandingContainer: React.FC = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(() => {
          setScrolled(globalThis.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    globalThis.addEventListener("scroll", handleScroll, { passive: true });
    return () => globalThis.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <meta property="og:title" content={t.seoTitle} />
        <meta property="og:description" content={t.seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartconnect.ai" />
        <meta property="og:image" content="https://smartconnect.ai/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.seoTitle} />
        <meta name="twitter:description" content={t.seoDescription} />
        <meta name="twitter:image" content="https://smartconnect.ai/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "LocalBusiness",
                  name: "SmartConnect AI",
                  description: t.seoDescription,
                  url: "https://smartconnect.ai",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://smartconnect.ai/logo.png",
                    width: 512,
                    height: 512,
                  },
                  telephone: "+34123456789",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Calle Ejemplo 123",
                    addressLocality: "Madrid",
                    addressRegion: "Madrid",
                    postalCode: "28001",
                    addressCountry: "ES",
                  },
                  serviceType: [
                    "Software Development",
                    "AI Solutions",
                    "Digital Marketing",
                  ],
                  sameAs: [
                    "https://twitter.com/smartconnectai",
                    "https://linkedin.com/company/smartconnectai",
                    "https://instagram.com/smartconnectai",
                    "https://facebook.com/smartconnectai",
                    "https://youtube.com/@smartconnectai",
                  ],
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.8",
                    reviewCount: "850",
                  },
                },
                {
                  "@type": "Product",
                  name: "QRIBAR - Menú Digital para Restaurantes",
                  description: t.seoProductDescription,
                  image: "https://smartconnect.ai/qribar.png",
                  url: "https://smartconnect.ai/qribar",
                  brand: {
                    "@type": "Brand",
                    name: "SmartConnect AI",
                  },
                  offers: {
                    "@type": "Offer",
                    name: "QRIBAR",
                    description:
                      "Menú digital con pedidos en tiempo real a barra y cocina",
                    url: "https://smartconnect.ai/qribar",
                    priceCurrency: "EUR",
                    price: "0",
                    availability: "https://schema.org/InStock",
                    validFrom: "2026-01-01",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    reviewCount: "450",
                  },
                },
                {
                  "@type": "Product",
                  name: "Tarjetas NFC Tap-to-Review",
                  description:
                    "Tarjetas NFC para obtener reseñas de Google con un solo toque",
                  image: "https://smartconnect.ai/tap-review.png",
                  url: "https://smartconnect.ai/tap-review",
                  brand: {
                    "@type": "Brand",
                    name: "SmartConnect AI",
                  },
                  offers: {
                    "@type": "Offer",
                    name: "Tap-to-Review NFC",
                    description:
                      "Dispositivo NFC para reseñas instantáneas en Google",
                    url: "https://smartconnect.ai/tap-review",
                    priceCurrency: "EUR",
                    price: "29.90",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Review",
                  itemReviewed: {
                    "@type": "Product",
                    name: "QRIBAR",
                  },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: "5",
                    bestRating: "5",
                  },
                  author: {
                    "@type": "Person",
                    name: "Restaurante L'Escale",
                  },
                  reviewBody:
                    "Desde que implementamos QRIBAR, nuestros ingresos por mesa aumentaron un 45%",
                  datePublished: "2026-04-15",
                },
                {
                  "@type": "Review",
                  itemReviewed: {
                    "@type": "Product",
                    name: "QRIBAR",
                  },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: "5",
                    bestRating: "5",
                  },
                  author: {
                    "@type": "Person",
                    name: "Café Central Madrid",
                  },
                  reviewBody:
                    "Mis clientes adoran la experiencia. Las reseñas positivas se dispararon",
                  datePublished: "2026-03-20",
                },
                {
                  "@type": "Review",
                  itemReviewed: {
                    "@type": "Product",
                    name: "Tarjetas NFC",
                  },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: "5",
                    bestRating: "5",
                  },
                  author: {
                    "@type": "Person",
                    name: "Bar Bodega Toledo",
                  },
                  reviewBody:
                    "Pasamos de 200 a 1200 reseñas en Google. Es increíble el impacto",
                  datePublished: "2026-02-10",
                },
                {
                  "@type": "WebSite",
                  name: "SmartConnect AI",
                  url: "https://smartconnect.ai",
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      "https://smartconnect.ai/search?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "WebPage",
                  "@id": "https://smartconnect.ai",
                  url: "https://smartconnect.ai",
                  name: t.seoTitle,
                  description: t.seoDescription,
                  inLanguage: "es",
                  author: {
                    "@type": "Organization",
                    name: "SmartConnect AI",
                    url: "https://smartconnect.ai",
                    logo: {
                      "@type": "ImageObject",
                      url: "https://smartconnect.ai/logo.png",
                      width: 512,
                      height: 512,
                    },
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "SmartConnect AI",
                    url: "https://smartconnect.ai",
                    logo: {
                      "@type": "ImageObject",
                      url: "https://smartconnect.ai/logo.png",
                    },
                  },
                  breadcrumb: {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                      {
                        "@type": "ListItem",
                        position: 1,
                        name: "Inicio",
                        item: "https://smartconnect.ai",
                      },
                    ],
                  },
                },
              ],
            }),
          }}
        />
      </Helmet>
      <Navbar scrolled={scrolled} />
      <Hero />
      <Features />
      <SuccessStats />
      <Contact />
    </>
  );
};

export default LandingContainer;
