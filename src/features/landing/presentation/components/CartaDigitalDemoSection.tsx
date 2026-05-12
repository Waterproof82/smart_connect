import React, { RefObject } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Pause, Play } from "lucide-react";

interface CartaDigitalDemoSectionProps {
  videoRef: RefObject<HTMLVideoElement>;
  isVideoPlaying: boolean;
  onToggleVideo: () => void;
  onOpenLightbox: (image: string) => void;
}

const CartaDigitalDemoSection: React.FC<CartaDigitalDemoSectionProps> = ({
  videoRef,
  isVideoPlaying,
  onToggleVideo,
  onOpenLightbox,
}) => {
  const { t } = useLanguage();

  const screens = [
    {
      image: "/assets/carta-digital-cliente.png",
      label: t.cartaDemoScreen1Label,
      title: t.cartaDemoScreen1Title,
    },
    {
      image: "/assets/carta-digital-dashboard.png",
      label: t.cartaDemoScreen2Label,
      title: t.cartaDemoScreen2Title,
    },
    {
      image: "/assets/carta-digital-pedidos.png",
      label: t.cartaDemoScreen3Label,
      title: t.cartaDemoScreen3Title,
    },
  ];

  return (
    <section id="demo" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
            {t.cartaDemoTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
            {t.cartaFlujoSubtitle}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto mb-10 md:mb-14">
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none z-10 border-[10px] md:border-[16px] border-[var(--color-bg-alt)] rounded-3xl"></div>
            <video
              ref={videoRef}
              src="/assets/video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video object-cover"
            />
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <button
                onClick={onToggleVideo}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={isVideoPlaying ? "Pausar video" : "Reanudar video"}
              >
                {isVideoPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
              <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-xl">
                <span className="text-sm text-white font-medium">
                  {t.cartaDemoVideoLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {screens.map((screen, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="px-3 py-2 bg-[var(--color-bg-alt)] flex items-center gap-1.5 border-b border-[var(--color-border)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                <span className="text-xs text-muted ml-2">{screen.label}</span>
              </div>
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                <button
                  type="button"
                  aria-label="Ampliar imagen"
                  className="absolute inset-0 w-full h-full cursor-pointer"
                  onClick={() => onOpenLightbox(screen.image)}
                >
                  <img
                    src={screen.image}
                    alt=""
                    className="w-full h-full object-contain hover:scale-[1.02] transition-transform pointer-events-none"
                  />
                </button>
              </div>
              <div className="px-4 py-3 font-bold text-sm border-t border-[var(--color-border)] text-[var(--color-primary)] flex items-center gap-2">
                {screen.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalDemoSection;
