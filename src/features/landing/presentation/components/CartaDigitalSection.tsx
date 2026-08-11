/**
 * CartaDigitalSection Component
 * @module features/landing/presentation/components
 *
 * Digital menu solution — merged into the home page as a full scrollable
 * section (was previously its own /carta-digital page). No Helmet, no
 * JSON-LD, no Navbar/Footer here: App.tsx owns the single <Helmet> and the
 * JSON-LD graph (via buildHomeSchema) for the whole home page now.
 */

import React, { useRef, useState } from "react";

// Import components from same directory (Clean Architecture)
import CartaDigitalHeroSection from "./CartaDigitalHeroSection";
import CartaDigitalProblemaSection from "./CartaDigitalProblemaSection";
import CartaDigitalSolucionSection from "./CartaDigitalSolucionSection";
import CartaDigitalBeneficiosSection from "./CartaDigitalBeneficiosSection";
import CartaDigitalComoFuncionaSection from "./CartaDigitalComoFuncionaSection";
import CartaDigitalDineroSection from "./CartaDigitalDineroSection";
import CartaDigitalBBDDSection from "./CartaDigitalBBDDSection";
import CartaDigitalComparacionSection from "./CartaDigitalComparacionSection";
import CartaDigitalFaqSection from "./CartaDigitalFaqSection";
import CartaDigitalDemoSection from "./CartaDigitalDemoSection";
import CartaDigitalCTAFinalSection from "./CartaDigitalCTAFinalSection";
import CartaDigitalLightbox from "./CartaDigitalLightbox";
import CartaDigitalTelegramSection from "./CartaDigitalTelegramSection";
import CartaDigitalModosSection from "./CartaDigitalModosSection";
import CartaDigitalAntidesperdicioSection from "./CartaDigitalAntidesperdicioSection";

interface CartaDigitalSectionProps {
  /** Pre-fetched, wa.me-ready phone number — single fetch lives in App.tsx via useWhatsappPhone(). */
  whatsappPhone: string;
}

const CartaDigitalSection: React.FC<CartaDigitalSectionProps> = ({
  whatsappPhone,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div id="carta-digital" className="bg-[var(--color-bg)] text-default">
      <CartaDigitalHeroSection onScrollToSection={scrollToSection} />
      <CartaDigitalProblemaSection />
      <CartaDigitalSolucionSection />
      <CartaDigitalBeneficiosSection />
      <CartaDigitalTelegramSection />
      <CartaDigitalModosSection />
      <CartaDigitalComoFuncionaSection />
      <CartaDigitalAntidesperdicioSection />
      <CartaDigitalDineroSection />
      <CartaDigitalComparacionSection />
      <CartaDigitalBBDDSection />
      <CartaDigitalFaqSection />
      <CartaDigitalDemoSection
        videoRef={videoRef}
        isVideoPlaying={isVideoPlaying}
        onToggleVideo={toggleVideo}
        onOpenLightbox={setLightboxImage}
      />
      <CartaDigitalCTAFinalSection whatsappPhone={whatsappPhone} />

      <CartaDigitalLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default CartaDigitalSection;
