/**
 * CartaDigitalPremium Component
 * @module features/landing/presentation/components
 *
 * Digital menu solution page - Clean Architecture with extracted components
 */

import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@shared/context/LanguageContext";
import { getAppSettings } from "@shared/services/settingsService";

// Import components from same directory (Clean Architecture)
import CartaDigitalNavbar from "./CartaDigitalNavbar";
import CartaDigitalFooter from "./CartaDigitalFooter";
import CartaDigitalHeroSection from "./CartaDigitalHeroSection";
import CartaDigitalProblemaSection from "./CartaDigitalProblemaSection";
import CartaDigitalSolucionSection from "./CartaDigitalSolucionSection";
import CartaDigitalBeneficiosSection from "./CartaDigitalBeneficiosSection";
import CartaDigitalComoFuncionaSection from "./CartaDigitalComoFuncionaSection";
import CartaDigitalDineroSection from "./CartaDigitalDineroSection";
import CartaDigitalBBDDSection from "./CartaDigitalBBDDSection";
import CartaDigitalDemoSection from "./CartaDigitalDemoSection";
import CartaDigitalCTAFinalSection from "./CartaDigitalCTAFinalSection";
import CartaDigitalLightbox from "./CartaDigitalLightbox";

const CartaDigitalPremium: React.FC = () => {
  const { t } = useLanguage();
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const settings = await getAppSettings();
      if (settings.whatsappPhone) {
        setWhatsappPhone(settings.whatsappPhone.replaceAll(/[^\d+]/g, ""));
      }
    };
    fetchWhatsApp();
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t.navbarCartaDigital} — Presentación | SmartConnect AI</title>
        <meta name="description" content={t.featuresCartaDigitalDesc} />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)] text-default">
        <CartaDigitalNavbar />

        <CartaDigitalHeroSection onScrollToSection={scrollToSection} />
        <CartaDigitalProblemaSection />
        <CartaDigitalSolucionSection />
        <CartaDigitalBeneficiosSection />
        <CartaDigitalComoFuncionaSection />
        <CartaDigitalDineroSection />
        <CartaDigitalBBDDSection />
        <CartaDigitalDemoSection
          videoRef={videoRef}
          isVideoPlaying={isVideoPlaying}
          onToggleVideo={toggleVideo}
          onOpenLightbox={setLightboxImage}
        />
        <CartaDigitalCTAFinalSection whatsappPhone={whatsappPhone} />

        <CartaDigitalFooter />

        <CartaDigitalLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      </div>
    </>
  );
};

export default CartaDigitalPremium;
