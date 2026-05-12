import React, { useState } from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const ProductGallery: React.FC = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const products = [
    {
      name: t.tapReviewProductExhibitorWhite,
      image:
        "/assets/nfc/S0c0ed93c21c345e7ad3f8895ff09cec43.jpg_640x640q75.jpg_.avif",
      alt: t.tapReviewProductExhibitorWhiteAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductExhibitorBlack,
      image:
        "/assets/nfc/Se5c21071b09f40a2bd15019ea423800eb.jpg_640x640q75.jpg_.avif",
      alt: t.tapReviewProductExhibitorBlackAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductStand,
      image:
        "/assets/nfc/S3c28dfdc8fbc4adcaab2a58f3b235ca6m.jpg_640x640q75.jpg_.avif",
      alt: t.tapReviewProductStandAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
    {
      name: t.tapReviewProductExhibitorWhite,
      image:
        "/assets/nfc/S90c19838ba374d069994fec4075ffca20.jpg_640x640q75.jpg_.avif",
      alt: t.tapReviewProductExhibitorWhiteAlt,
      fallback: "/assets/Tarjeta_NFC_negra_MontesTAP.webp",
    },
  ];

  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden">
        {products.map((product, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              activeIndex === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            {imageErrors[idx] ? (
              <img
                src={product.fallback}
                alt={product.alt}
                className="w-3/4 h-3/4 object-contain drop-shadow-2xl"
              />
            ) : (
              <img
                src={product.image}
                alt={product.alt}
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
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
              activeIndex === idx
                ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={imageErrors[idx] ? product.fallback : product.image}
              alt={product.alt}
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
