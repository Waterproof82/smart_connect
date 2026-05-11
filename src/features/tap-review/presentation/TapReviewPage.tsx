/**
 * TapReviewPage Component
 * @module features/tap-review/presentation
 *
 * NFC Tap-to-Review solution page - similar design to tapstar.es
 */

import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Check,
  Star,
  Smartphone,
  QrCode,
  Shield,
  Zap,
  Award,
  Users,
  MessageSquare,
  ChevronDown,
  Cpu,
  Menu,
  X,
  ArrowLeft,
  Code2,
  Settings2,
  Utensils,
} from "lucide-react";
import { useIntersectionObserver } from "@shared/hooks";
import { useLanguage } from "@shared/context/LanguageContext";
import LanguageSelector from "@shared/components/LanguageSelector";
import { getAppSettings } from "@shared/services/settingsService";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

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

const StatsBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-6 my-12">
      <div className="bg-gradient-to-r from-[var(--color-bg-alt)] to-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <StarRating rating={4.9} />
              <span className="ml-2 text-lg font-bold text-default">4.9/5</span>
            </div>
            <span className="text-muted">|</span>
            <span className="text-muted font-medium">
              {t.tapReviewStatsBusinesses}
            </span>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                +600K
              </p>
              <p className="text-sm text-muted">{t.tapReviewStatsReviews}</p>
            </div>
            <div className="w-px h-12 bg-[var(--color-border)]"></div>
            <div>
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                +400
              </p>
              <p className="text-sm text-muted">{t.tapReviewStatsDaily}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const steps = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: t.tapReviewHowStep1Title,
      desc: t.tapReviewHowStep1Desc,
      image: "/assets/nfc/put_exibitor.webp",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: t.tapReviewHowStep2Title,
      desc: t.tapReviewHowStep2Desc,
      image: "/assets/nfc/place_device.jpg",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t.tapReviewHowStep3Title,
      desc: t.tapReviewHowStep3Desc,
      image: "/assets/nfc/review.webp",
    },
  ];

  return (
    <div ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewHowTitle}
          </h2>
          <p className="text-muted">{t.tapReviewHowSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative p-8 bg-[var(--color-bg-alt)] rounded-3xl transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-on-accent)] font-bold text-xl">
                {idx + 1}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center mb-6 text-[var(--color-accent)]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-default">
                  {step.title}
                </h3>
                <p className="text-muted">{step.desc}</p>
                <div className="mt-6 w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                  {imageErrors[idx] ? (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 mx-auto mb-2 text-[var(--color-accent)]">
                        {step.icon}
                      </div>
                      <p className="text-xs text-muted font-medium">
                        Paso {idx + 1}
                      </p>
                    </div>
                  ) : (
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-contain drop-shadow-lg"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [idx]: true }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: t.tapReviewFeatNFC,
      desc: t.tapReviewFeatNFCDesc,
      color: "blue",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t.tapReviewFeatSpeed,
      desc: t.tapReviewFeatSpeedDesc,
      color: "amber",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: t.tapReviewFeatGoogle,
      desc: t.tapReviewFeatGoogleDesc,
      color: "green",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t.tapReviewFeatNoSub,
      desc: t.tapReviewFeatNoSubDesc,
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <div ref={sectionRef} className="py-20 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewFeatTitle}
          </h2>
          <p className="text-muted">{t.tapReviewFeatSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-default">
                {feature.title}
              </h3>
              <p className="text-sm text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SocialProof: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  const testimonials = [
    {
      quote: t.tapReviewTestimonial1Quote,
      author: t.tapReviewTestimonial1Author,
      business: t.tapReviewTestimonial1Business,
    },
    {
      quote: t.tapReviewTestimonial2Quote,
      author: t.tapReviewTestimonial2Author,
      business: t.tapReviewTestimonial2Business,
    },
    {
      quote: t.tapReviewTestimonial3Quote,
      author: t.tapReviewTestimonial3Author,
      business: t.tapReviewTestimonial3Business,
    },
  ];

  return (
    <div ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewSocialTitle}
          </h2>
          <p className="text-muted">{t.tapReviewSocialSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`p-8 bg-[var(--color-bg-alt)] rounded-3xl transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-default mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-default">{testimonial.author}</p>
                  <p className="text-sm text-muted">{testimonial.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: t.tapReviewFAQ1Question,
      answer: t.tapReviewFAQ1Answer,
    },
    {
      question: t.tapReviewFAQ2Question,
      answer: t.tapReviewFAQ2Answer,
    },
    {
      question: t.tapReviewFAQ3Question,
      answer: t.tapReviewFAQ3Answer,
    },
  ];

  return (
    <div ref={sectionRef} className="py-20 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewFAQTitle}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-default pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? "max-h-96" : "max-h-0"}`}
              >
                <p className="px-6 pb-6 text-muted">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CTASection: React.FC<{ whatsappPhone: string }> = ({ whatsappPhone }) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  return (
    <div ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div
          className={`relative bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] rounded-3xl p-12 md:p-16 text-center transition-all duration-1000 overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.tapReviewCTATitle}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              {t.tapReviewCTASubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={
                  whatsappPhone
                    ? `https://wa.me/${whatsappPhone}`
                    : "#contacto?servicio=Tap%20Review%20NFC"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-accent)] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-colors min-h-[48px]"
              >
                {t.tapReviewCTABtnPrimary}
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature1}
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature2}
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature3}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="border-t border-b border-[var(--color-border)] py-8 bg-[var(--color-surface)] mt-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-muted">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t.tapReviewTrust30Days}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">{t.tapReviewTrust24h}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t.tapReviewTrustSupport}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">{t.tapReviewTrustNoSub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar: React.FC<{ scrolled?: boolean }> = ({ scrolled = false }) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(-1);

  const solutions = [
    {
      id: "software-ia",
      icon: <Code2 className="w-5 h-5 text-[var(--color-icon-blue)]" />,
      title: t.navbarSoftwareIA,
      desc: t.navbarSoftwareIADesc,
      href: "/#soluciones",
    },
    {
      id: "automatizacion-n8n",
      icon: <Settings2 className="w-5 h-5 text-[var(--color-icon-purple)]" />,
      title: t.navbarAutomation,
      desc: t.navbarAutomationDesc,
      href: "/#soluciones",
    },
    {
      id: "qribar",
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-amber)]" />,
      title: t.navbarQribar,
      desc: t.navbarQribarDesc,
      href: "https://qribar.es",
      external: true,
    },
    {
      id: "carta-digital",
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-emerald)]" />,
      title: t.navbarCartaDigital,
      desc: t.navbarCartaDigitalDesc,
      href: "/carta-digital",
    },
  ];

  const handleDropdownLinkClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false);
    if (e?.currentTarget?.href?.includes("#")) {
      const target = document.querySelector(new URL(e.currentTarget.href).hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[var(--color-border)] bg-[var(--color-bg)] ${
        scrolled ? "py-2 md:py-3" : "py-3 md:py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Cpu className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default hidden sm:block">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-muted">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.navBack}
          </Link>
          <div
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => {
              setIsDropdownOpen(false);
              setFocusedDropdownIndex(-1);
            }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              {t.navSolutions}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
                isDropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="w-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] p-4 shadow-lg">
                <div className="grid gap-2">
                  {solutions.map((item, idx) => (
                    <a
                      key={item.id}
                      href={item.href}
                      tabIndex={isDropdownOpen ? 0 : -1}
                      className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--color-bg-alt)] transition-colors group/item ${focusedDropdownIndex === idx ? "bg-[var(--color-bg-alt)]" : ""}`}
                      onClick={handleDropdownLinkClick}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setFocusedDropdownIndex((idx + 1) % solutions.length);
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setFocusedDropdownIndex(
                            (idx - 1 + solutions.length) % solutions.length,
                          );
                        }
                      }}
                    >
                      <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-default text-xs font-bold">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/#exito"
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors"
          >
            {t.navSuccess}
          </Link>
          <Link
            to="/#contacto"
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors"
          >
            {t.navContact}
          </Link>
          <LanguageSelector />
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)]"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-[80vw] max-w-xs h-full bg-[var(--color-bg)] border-l border-[var(--color-border)] p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-right overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-default">
                  SmartConnect{" "}
                  <span className="text-[var(--color-primary)]">AI</span>
                </span>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-default p-2 rounded-lg"
                    aria-label="Cerrar"
                    autoFocus
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t.navBack}
                </Link>
                <hr className="border-[var(--color-border)] my-1" />
                <span className="px-3 py-1.5 text-xs font-bold text-muted uppercase tracking-wider">
                  {t.navSolutions}
                </span>
                {solutions.map((item) =>
                  item.external ? (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ) : (
                    <a
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        window.location.href = item.href;
                      }}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ),
                )}
                <hr className="border-[var(--color-border)] my-1" />
                <a
                  href="/#exito"
                  className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    window.location.href = "/#exito";
                  }}
                >
                  {t.navSuccess}
                </a>
                <a
                  href="/#contacto"
                  className="flex items-center gap-3 p-3 min-h-[44px] text-muted hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    window.location.href = "/#contacto";
                  }}
                >
                  {t.navContact}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          <div>
            <span className="font-bold text-xl text-default">
              SmartConnect{" "}
              <span className="text-[var(--color-primary)]">AI</span>
            </span>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              {t.footerTagline}
            </p>
          </div>
          <nav aria-label="Navegación del footer">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerNavTitle}
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link
                  to="/"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerNavInicio}
                </Link>
              </li>
              <li>
                <Link
                  to="/#soluciones"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerNavSoluciones}
                </Link>
              </li>
              <li>
                <Link
                  to="/#exito"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerNavExito}
                </Link>
              </li>
              <li>
                <Link
                  to="/#contacto"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerNavContacto}
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerLegalTitle}
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalAviso}
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalPrivacidad}
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalCookies}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-6 md:pt-8 text-center text-muted text-sm">
          <p>&copy; {t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export const TapReviewPage: React.FC = () => {
  const { t } = useLanguage();
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const settings = await getAppSettings();
        if (settings.whatsappPhone) {
          setWhatsappPhone(settings.whatsappPhone.replaceAll(/[^\d+]/g, ""));
        }
      } catch {
        // Silently fail, WhatsApp button will fallback to contacto
      }
    };
    fetchWhatsApp();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t.tapReviewMetaTitle}</title>
        <meta name="description" content={t.tapReviewMetaDesc} />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Smartphone className="w-4 h-4" />
                {t.tapReviewEyebrow}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t.tapReviewHeroTitle}
                <span className="text-[var(--color-accent)]">
                  {" "}
                  {t.tapReviewHeroAccent}
                </span>
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                {t.tapReviewHeroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href={
                    whatsappPhone
                      ? `https://wa.me/${whatsappPhone}`
                      : "#contacto?servicio=Tap%20Review%20NFC"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-accent-hover)] transition-colors min-h-[48px]"
                >
                  {t.tapReviewHeroBtnContact}
                </a>
                <a
                  href="#product"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-surface)] text-default font-bold px-8 py-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] transition-colors min-h-[48px]"
                >
                  {t.tapReviewHeroBtnProduct}
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted">{t.tapReviewHeroFeature1}</span>
                </div>
                <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted">{t.tapReviewHeroFeature2}</span>
                </div>
                <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted">{t.tapReviewHeroFeature3}</span>
                </div>
              </div>
            </div>

            <div id="product">
              <ProductGallery />
            </div>
          </div>
        </div>

        <TrustBadges />
        <StatsBanner />
        <HowItWorks />
        <Features />
        <SocialProof />
        <FAQ />
        <CTASection whatsappPhone={whatsappPhone} />
      </div>

      <Footer />
    </>
  );
};
