/**
 * CartaDigitalSection Component
 * @module features/landing/presentation/components
 *
 * Digital menu solution — merged into the home page as a full scrollable
 * section (was previously its own /carta-digital page). No Helmet, no
 * JSON-LD, no Navbar/Footer here: App.tsx owns the single <Helmet> and the
 * JSON-LD graph (via buildHomeSchema) for the whole home page now.
 *
 * PR4: mounted as the "tienda-carta-digital" entry of the TPV_MODULES
 * registry (design.md D1/D2), via
 * shared/components/tpv/TpvModuleSections.tsx. Its own sub-section tree is
 * unchanged (wrapper intact) — only the wrapper `id` moved from a hardcoded
 * literal to a prop.
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
import CartaDigitalDemoSection from "./CartaDigitalDemoSection";
import CartaDigitalCTAFinalSection from "./CartaDigitalCTAFinalSection";
import CartaDigitalLightbox from "./CartaDigitalLightbox";
import CartaDigitalTelegramSection from "./CartaDigitalTelegramSection";
import CartaDigitalModosSection from "./CartaDigitalModosSection";
import CartaDigitalAntidesperdicioSection from "./CartaDigitalAntidesperdicioSection";

interface CartaDigitalSectionProps {
  /**
   * Section wrapper id — prop-ised (PR4) so this component can be mounted
   * as the "tienda-carta-digital" entry in the TPV_MODULES registry
   * (design.md D1/D2) without hardcoding the anchor internally.
   */
  id: string;
  /** Pre-fetched, wa.me-ready phone number — single fetch lives in App.tsx via useWhatsappPhone(). */
  whatsappPhone: string;
}

const CartaDigitalSection: React.FC<CartaDigitalSectionProps> = ({
  id,
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
    <div id={id} className="bg-[var(--color-bg)] text-default">
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
