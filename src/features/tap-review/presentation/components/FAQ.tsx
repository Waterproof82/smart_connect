import React, { useRef, useState } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useIntersectionObserver } from "@shared/hooks";
import { ChevronDown } from "lucide-react";

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

export default FAQ;
