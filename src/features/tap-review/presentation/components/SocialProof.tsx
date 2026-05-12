import React, { useRef } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useIntersectionObserver } from "@shared/hooks";
import { Star } from "lucide-react";

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
                    className="w-5 h-5 fill-[var(--color-icon-amber)] text-[var(--color-icon-amber)]"
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

export default SocialProof;
