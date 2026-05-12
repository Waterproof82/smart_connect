import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Star } from "lucide-react";

interface SocialProofProps {
  testimonials?: Array<{
    name: string;
    text: string;
    rating: number;
  }>;
}

const SocialProof: React.FC<SocialProofProps> = ({
  testimonials = [
    {
      name: "Carlos M.",
      text: "Excelente producto, nuestros clientes aman la facilidad",
      rating: 5,
    },
    {
      name: "María L.",
      text: "Incrementamos nuestras reviews un 300%",
      rating: 5,
    },
    { name: "Pedro R.", text: "Simple y efectivo, lo recomiendo", rating: 5 },
  ],
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-[var(--color-bg-alt)] p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{t.socialProofTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-[var(--color-surface)] p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] flex items-center justify-center mr-4">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="flex text-[var(--color-accent)]">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={`star-${i}`} className="w-4 h-4 fill-current" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={`empty-${i}`} className="w-4 h-4" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-muted italic">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProof;
