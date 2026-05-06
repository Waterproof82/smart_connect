import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Contact } from './components/Contact';
import { SuccessStats } from './components/SuccessStats';
import { Navbar } from './components/Navbar';
import { useLanguage } from '../../../shared/context/LanguageContext';

// Add missing translation keys
declare module '../../../shared/context/LanguageContext' {
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "QRIBAR",
            "description": t.seoProductDescription,
            "brand": {
              "@type": "Brand",
              "name": "SmartConnect AI"
            },
            "offers": {
              "@type": "Offer",
              "url": "https://smartconnect.ai/qribar",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
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