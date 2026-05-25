import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, A11y } from "swiper/modules";
import {
  ReviewSchema,
  CollectionPageSchema,
} from "@shared/presentation/components/SeoSchema";

export interface Testimonial {
  id: string | number;
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  title?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  title = "Lo que nuestros clientes en Canarias dicen",
}) => {
  return (
    <>
      {testimonials.map((t) => (
        <ReviewSchema key={`review-${t.id}`} author={t.name} text={t.quote} />
      ))}
      <CollectionPageSchema
        title={title}
        items={testimonials.map((testimonial) => ({
          name: `${testimonial.name} - ${testimonial.title}`,
          description: testimonial.quote,
        }))}
      />
      <section className="bg-[var(--color-bg-alt)] py-16 md:py-24">
        <div className="container px-6 mx-auto">
          <h2 className="text-2xl font-bold text-center text-default capitalize lg:text-3xl mb-12">
            {title}
          </h2>

          <div className="max-w-4xl mx-auto">
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              spaceBetween={32}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              loop={true}
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="p-8 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] mb-10">
                    <p className="leading-relaxed text-muted text-base mb-8">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center shrink-0">
                        <span className="text-[var(--color-primary)] font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-default text-sm">
                          {testimonial.name}
                        </p>
                        <span className="text-xs text-muted">
                          {testimonial.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialCarousel;
