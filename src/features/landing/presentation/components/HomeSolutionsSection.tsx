import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MessageSquare, Monitor, Smartphone, Utensils } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * Home hub: the two flagship products (Carta Digital, TPV) as large cards
 * with a real product image (indexable `<img>` + descriptive alt), then the
 * secondary services (chatbot, NFC cards). Every card links to its own
 * indexable page with a keyword anchor — home carries no duplicated product
 * content.
 */

interface CardImage {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
}
const HomeSolutionsSection: React.FC = () => {
  const { t } = useLanguage();

  // Carta Digital is the main service: it spans two of three columns and
  // lists its differentiators (real contact person, orders, table payment,
  // SEO/GEO, POS + Veri*factu) plus the free-trial badge. The full content
  // still lives only on /carta-digital.
  const flagships: Array<{
    to: string;
    icon: typeof Utensils;
    eyebrow: string;
    title: string;
    desc: string;
    cta: string;
    badge?: string;
    highlights?: string[];
    image?: CardImage;
  }> = [
    {
      to: "/carta-digital",
      icon: Utensils,
      eyebrow: t.cartaTeaserEyebrow,
      title: t.cartaTeaserTitle,
      desc: t.cartaTeaserDesc,
      cta: t.cartaTeaserCta,
      badge: t.homeCartaBadge,
      highlights: [
        t.homeCartaHighlight1,
        t.homeCartaHighlight2,
        t.homeCartaHighlight3,
        t.homeCartaHighlight4,
        t.homeCartaHighlight5,
      ],
      image: {
        src: "/assets/carta-digital-cliente-640w.webp",
        srcSet:
          "/assets/carta-digital-cliente-320w.webp 320w, /assets/carta-digital-cliente-640w.webp 640w, /assets/carta-digital-cliente-1280w.webp 1280w",
        sizes: "(min-width: 1024px) 700px, calc(100vw - 2rem)",
        width: 640,
        height: 501,
        alt: t.homeCartaImageAlt,
      },
    },
    {
      to: "/tpv-restaurantes",
      icon: Monitor,
      eyebrow: t.tpvCardEyebrow,
      title: t.tpvCardTitle,
      desc: t.tpvCardDesc,
      cta: t.tpvCardCta,
      image: {
        src: "/assets/tpv/tpv-cobro-480w.webp",
        srcSet:
          "/assets/tpv/tpv-cobro-480w.webp 480w, /assets/tpv/tpv-cobro-720w.webp 720w, /assets/tpv/tpv-cobro.webp 936w",
        sizes: "(min-width: 1024px) 340px, calc(100vw - 2rem)",
        width: 480,
        height: 360,
        alt: t.tpvCobroFigureAlt,
      },
    },
  ];

  const services = [
    {
      to: "/ia-chatbots-tenerife",
      icon: MessageSquare,
      title: t.iaTeaserTitle,
      desc: t.iaTeaserDesc,
      cta: t.iaTeaserCta,
    },
    {
      to: "/tarjetas-nfc",
      icon: Smartphone,
      title: t.nfcCardTitle,
      desc: t.nfcCardDesc,
      cta: t.nfcCardCta,
    },
  ];

  return (
    <>
      <section
        aria-labelledby="productos-title"
        className="ds-section"
      >
        <div className="ds-container">
          <div className="max-w-2xl mb-12">
            <h2
              id="productos-title"
              className="ds-h2 mb-4"
            >
              {t.homeStarsTitle}
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              {t.homeStarsSubtitle}
            </p>
          </div>
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6 list-none">
            {flagships.map(({ to, icon: Icon, eyebrow, title, desc, cta, badge, highlights, image }) => (
              <li key={to} className={highlights ? "lg:col-span-2" : undefined}>
                <Link
                  to={to}
                  className={`group flex flex-col h-full bg-[var(--color-surface)] border rounded-xl p-8 md:p-10 hover:border-[var(--color-primary)] hover:-translate-y-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${highlights ? "border-[var(--color-accent-border)]" : "border-[var(--color-border)]"}`}
                >
                  {image && (
                    <div className="mb-6 overflow-hidden rounded-lg border border-[var(--color-border)] aspect-[16/9]">
                      <img
                        src={image.src}
                        srcSet={image.srcSet}
                        sizes={image.sizes}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--color-accent-subtle)] text-[var(--color-primary)]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="ds-kicker">
                      {eyebrow}
                    </span>
                    {badge && (
                      <span className="ml-auto px-3 py-1 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-sm font-semibold text-[var(--color-primary)]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black font-display leading-tight mb-4">
                    {title}
                  </h3>
                  <p className="text-muted leading-relaxed mb-8">{desc}</p>
                  {highlights && (
                    <ul
                      aria-label={t.homeCartaHighlightsLabel}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-none mb-8"
                    >
                      {highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm md:text-base">
                          <Check
                            className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-primary)]"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-auto inline-flex items-center gap-2 font-bold text-[var(--color-primary)]">
                    {cta}
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="servicios-title"
        className="pb-[var(--section-y)]"
      >
        <div className="ds-container">
          <h2
            id="servicios-title"
            className="ds-h2 mb-8"
          >
            {t.homeMoreTitle}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 list-none">
            {services.map(({ to, icon: Icon, title, desc, cta }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex gap-4 h-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <Icon
                    className="w-6 h-6 shrink-0 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-bold text-lg mb-1">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-3">
                      {desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
                      {cta}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default HomeSolutionsSection;
