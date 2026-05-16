import React from "react";

/**
 * Simple gradient page header for SEO landing pages.
 * Replaces the full Hero component to avoid layout overlap.
 */
interface PageHeroProps {
  title: string;
  subtitle: string;
  cta?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, cta }) => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-blue-600/20 via-blue-900/10 to-base overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 max-w-4xl mx-auto">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
          {subtitle}
        </p>
        {cta && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {cta}
          </div>
        )}
      </div>
    </section>
  );
};

interface FAQEntry {
  question: string;
  answer: string;
}

interface SeoFaqSchemaProps {
  faqs: FAQEntry[];
}

export const SeoFaqSchema: React.FC<SeoFaqSchemaProps> = ({ faqs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  telephone?: string;
  image?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  areaServed?: string[];
}

export const LocalBusinessSchema: React.FC<LocalBusinessSchemaProps> = ({
  name,
  description,
  url,
  telephone,
  image,
  address,
  geo,
  areaServed,
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
  };

  if (telephone) schema.telephone = telephone;
  if (image) schema.image = image;
  if (address) schema.address = { "@type": "PostalAddress", ...address };
  if (geo) schema.geo = { "@type": "GeoCoordinates", ...geo };
  if (areaServed) {
    schema.areaServed = areaServed.map((a) => ({
      "@type": "City",
      name: a,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

/**
 * Renders a grid of benefit/feature cards.
 * Each card has an icon from lucide-react, a title, and a description.
 */
interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface BenefitsGridProps {
  title: string;
  subtitle?: string;
  benefits: BenefitCard[];
  columns?: 2 | 3 | 4;
}

export const BenefitsGrid: React.FC<BenefitsGridProps> = ({
  title,
  subtitle,
  benefits,
  columns = 3,
}) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <section className="py-16 md:py-24 bg-base">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-white/70 text-center max-w-2xl mx-auto mb-12">
            {subtitle}
          </p>
        )}
        <div
          className={`grid grid-cols-1 ${gridCols[columns]} gap-8 max-w-5xl mx-auto`}
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Renders a "How it works" 3-step process section.
 */
interface StepInfo {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HowItWorksProps {
  title: string;
  subtitle?: string;
  steps: StepInfo[];
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  title,
  subtitle,
  steps,
}) => {
  return (
    <section className="py-16 md:py-24 bg-base/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-white/70 text-center max-w-2xl mx-auto mb-16">
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
              )}
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
                {step.icon}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Renders a local GEO coverage section showing cities served.
 */
interface GeoCoverageProps {
  title: string;
  subtitle: string;
  cities: string[];
  serviceArea: string;
}

export const GeoCoverage: React.FC<GeoCoverageProps> = ({
  title,
  subtitle,
  cities,
  serviceArea,
}) => {
  return (
    <section className="py-16 md:py-24 bg-base">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          {title}
        </h2>
        <p className="text-lg text-white/70 text-center max-w-2xl mx-auto mb-8">
          {subtitle}
        </p>
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {cities.map((city) => (
              <span
                key={city}
                className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium"
              >
                {city}
              </span>
            ))}
          </div>
          <p className="text-white/60 text-sm">{serviceArea}</p>
        </div>
      </div>
    </section>
  );
};

/**
 * Renders a social proof stats bar.
 */
interface StatItem {
  value: string;
  label: string;
}

interface StatsBarProps {
  stats: StatItem[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Renders an internal links section connecting related landing pages.
 */
interface RelatedLink {
  href: string;
  label: string;
  description: string;
}

interface InternalLinksProps {
  title: string;
  links: RelatedLink[];
}

export const InternalLinks: React.FC<InternalLinksProps> = ({
  title,
  links,
}) => {
  return (
    <section className="py-16 bg-base/30">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-white font-semibold mb-1">{link.label}</h3>
              <p className="text-white/60 text-sm">{link.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Service Schema ────────────────────────────────────────────
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
  providerLogoUrl?: string;
  areaServed?: string[];
  serviceType?: string;
}

export const ServiceSchema: React.FC<ServiceSchemaProps> = ({
  name,
  description,
  url,
  providerName,
  providerUrl,
  providerLogoUrl,
  areaServed,
  serviceType,
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: providerUrl,
    },
  };
  if (providerLogoUrl) {
    (schema.provider as Record<string, unknown>).logo = {
      "@type": "ImageObject",
      url: providerLogoUrl,
    };
  }
  if (areaServed) schema.areaServed = areaServed;
  if (serviceType) schema.serviceType = serviceType;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─── BreadcrumbList Schema ─────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListSchemaProps {
  breadcrumbs: BreadcrumbItem[];
}

export const BreadcrumbListSchema: React.FC<BreadcrumbListSchemaProps> = ({
  breadcrumbs,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─── Review Schema ─────────────────────────────────────────────
interface ReviewSchemaProps {
  author: string;
  text: string;
  rating?: number;
  datePublished?: string;
}

export const ReviewSchema: React.FC<ReviewSchemaProps> = ({
  author,
  text,
  rating = 5,
  datePublished = new Date().toISOString().split("T")[0],
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: text,
    datePublished,
    author: {
      "@type": "Person",
      name: author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
