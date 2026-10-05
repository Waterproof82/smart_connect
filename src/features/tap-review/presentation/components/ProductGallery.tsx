import React, { useState } from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const ProductGallery: React.FC = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const products = [
    {
      name: t.tapReviewProductExhibitorWhite,
      image: "/assets/nfc/nfc-exhibidor-blanco-1.avif",
      thumbnail: "/assets/nfc/nfc-exhibidor-blanco-1-128w.webp",
      alt: t.tapReviewProductExhibitorWhiteAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductExhibitorBlack,
      image: "/assets/nfc/nfc-exhibidor-negro.avif",
      thumbnail: "/assets/nfc/nfc-exhibidor-negro-128w.webp",
      alt: t.tapReviewProductExhibitorBlackAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductStand,
      image: "/assets/nfc/nfc-stand-exhibidor.avif",
      thumbnail: "/assets/nfc/nfc-stand-exhibidor-128w.webp",
      alt: t.tapReviewProductStandAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductExhibitorWhite,
      image: "/assets/nfc/nfc-exhibidor-blanco-2.avif",
      thumbnail: "/assets/nfc/nfc-exhibidor-blanco-2-128w.webp",
      alt: t.tapReviewProductExhibitorWhiteAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
  ];

  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-gradient-to-br from-[var(--color-bg-alt)] to-[var(--color-surface)] rounded-xl overflow-hidden">
        {products.map((product, idx) => (
          <div
            key={product.image}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              activeIndex === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            {imageErrors[idx] ? (
              <img
                src={product.fallback}
                alt={product.alt}
                width="640"
                height="640"
                className="w-3/4 h-3/4 object-contain drop-shadow-2xl"
              />
            ) : (
              <img
                src={product.image}
                alt={product.alt}
                width="640"
                height="640"
                className="w-3/4 h-3/4 object-contain drop-shadow-2xl"
                onError={() =>
                  setImageErrors((prev) => ({ ...prev, [idx]: true }))
                }
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        {products.map((product, idx) => (
          <button
            key={product.image}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
              activeIndex === idx
                ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={imageErrors[idx] ? product.fallback : product.thumbnail}
              alt={product.alt}
              width="640"
              height="640"
              className="w-full h-full object-cover"
              onError={() =>
                setImageErrors((prev) => ({ ...prev, [idx]: true }))
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
