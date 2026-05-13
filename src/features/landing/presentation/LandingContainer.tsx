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
                  ],
                  offers: {
                    "@type": "Offer",
                    name: "QRIBAR",
                    description: t.seoProductDescription,
                    url: "https://smartconnect.ai/qribar",
                    priceCurrency: "EUR",
                    availability: "https://schema.org/InStock",
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
