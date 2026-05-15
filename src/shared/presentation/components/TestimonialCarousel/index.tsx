import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, A11y } from "swiper/modules";

export interface Testimonial {
  id: string | number;
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
}) => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container px-6 py-10 mx-auto">
        <h1 className="text-2xl font-semibold text-center text-gray-800 capitalize lg:text-3xl dark:text-white">
          Lo que nuestros clientes en Canarias dicen
        </h1>

        <div className="flex justify-center mx-auto mt-6">
          <span className="inline-block w-40 h-1 bg-blue-500 rounded-full"></span>
          <span className="inline-block w-3 h-1 mx-1 bg-blue-500 rounded-full"></span>
          <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
        </div>

        <div className="flex items-start max-w-6xl mx-auto mt-16">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={50}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop={true}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="p-8 border rounded-lg dark:border-gray-700">
                  <p className="leading-loose text-gray-500 dark:text-gray-400">
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center mt-8 -mx-2">
                    <img
                      className="object-cover mx-2 rounded-full w-14 shrink-0 h-14"
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                    />

                    <div className="mx-2">
                      <h1 className="font-semibold text-gray-800 dark:text-white">
                        {testimonial.name}
                      </h1>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
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
  );
};

export default TestimonialCarousel;
