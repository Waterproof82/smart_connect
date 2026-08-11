import React, { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { useIntersectionObserver } from "@shared/hooks";
import { useLanguage } from "@shared/context/LanguageContext";
import { ReviewSchema } from "@shared/presentation/components/SeoSchema";

const StarRating: React.FC = () => (
  <div className="flex gap-0.5 mb-4" aria-label="5 estrellas">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className="w-3.5 h-3.5 fill-[var(--color-icon-amber)] text-[var(--color-icon-amber)]"
      />
    ))}
  </div>
);

interface TestimonialCardProps {
  quote: string;
  author: string;
  service: string;
  delay: number;
  isInView: boolean;
  prominent?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  service,
  delay,
  isInView,
  prominent,
}) => (
  <div
    className={`bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-[2rem] flex flex-col transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
      isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    } ${prominent ? "p-8 md:p-10" : "p-7"}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <Quote
      className={`text-[var(--color-primary)] opacity-30 mb-5 shrink-0 ${prominent ? "w-8 h-8" : "w-6 h-6"}`}
    />
    <p
      className={`leading-relaxed text-default flex-1 mb-6 ${
        prominent ? "text-lg md:text-xl" : "text-base"
      }`}
    >
      {quote}
    </p>
    <div>
      <StarRating />
      <div className="font-bold text-default text-sm">{author}</div>
      <div className="text-xs text-muted mt-0.5">{service}</div>
    </div>
  </div>
);

export const SuccessStats: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);
  const { t } = useLanguage();

  const testimonials = [
    {
      quote: t.successStat1Quote,
      author: t.successStat1Author,
      service: "QRIBAR — Menú Digital",
      delay: 0,
    },
    {
      quote: t.successStat2Quote,
      author: t.successStat2Author,
      service: "Tarjetas NFC Tap-to-Review",
      delay: 100,
    },
    {
      quote: t.successStat3Quote,
      author: t.successStat3Author,
      service: "Tarjetas NFC Tap-to-Review",
      delay: 200,
    },
    {
      quote: t.successStat4Quote,
      author: t.successStat4Author,
      service: "Digitaliza Tenerife",
      delay: 300,
    },
  ];

  const keyStats = [
    { value: "45%", label: t.successStat1Label },
    { value: "6×", label: t.successStat3Label },
    { value: "850+", label: t.successStat4Label },
    { value: "★★★★★", label: t.successStat2Label },
  ];

  return (
    <>
      <ReviewSchema author={testimonials[0].author} text={testimonials[0].quote} />
      <ReviewSchema author={testimonials[1].author} text={testimonials[1].quote} />
      <ReviewSchema author={testimonials[2].author} text={testimonials[2].quote} />
      <ReviewSchema author={testimonials[3].author} text={testimonials[3].quote} />

      <div className="container mx-auto px-6" ref={sectionRef}>
        {/* Left-aligned header */}
        <div
          className={`max-w-2xl mb-14 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xs font-bold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3">
            {t.successTitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            {t.successSubtitle}
          </h2>
          <p className="text-base text-muted leading-relaxed">
            {t.successDesc}
          </p>
        </div>

        {/* Stats strip */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-[var(--color-border)] py-8 mb-12 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          {keyStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-black text-default tabular-nums tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-muted mt-1 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials — asymmetric grid */}
        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          {/* Featured */}
          <TestimonialCard
            quote={testimonials[0].quote}
            author={testimonials[0].author}
            service={testimonials[0].service}
            delay={0}
            isInView={isVisible}
            prominent
          />

          {/* Two stacked */}
          <div className="grid gap-6">
            <TestimonialCard
              quote={testimonials[1].quote}
              author={testimonials[1].author}
              service={testimonials[1].service}
              delay={100}
              isInView={isVisible}
            />
            <TestimonialCard
              quote={testimonials[2].quote}
              author={testimonials[2].author}
              service={testimonials[2].service}
              delay={200}
              isInView={isVisible}
            />
          </div>
        </div>

        {/* Full-width closing testimonial */}
        <div className="mt-6">
          <TestimonialCard
            quote={testimonials[3].quote}
            author={testimonials[3].author}
            service={testimonials[3].service}
            delay={300}
            isInView={isVisible}
          />
        </div>
      </div>
    </>
  );
};
