import React from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, children }) => {
  return (
    <section className="bg-gray-900 text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">{subtitle}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
