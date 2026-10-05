import React from "react";
import { SolutionConfig } from "@shared/config/solutions";
import { ORGANIZATION } from "@shared/config/organization";

const ORG_URL = "https://digitalizatenerife.es";

// ─── Single-source entity @ids (design.md D4) ───────────────────
// The one LocalBusiness and one WebSite node in the whole site. Every
// other reference (WebPage.author/publisher/isPartOf, every product
// page's ServiceSchema.provider, /about's mainEntity) is a bare
// `{"@id"}` into one of these two — never a redeclared inline object.
export const ORGANIZATION_ID = `${ORG_URL}/#organization`;
export const WEBSITE_ID = `${ORG_URL}/#website`;

// ─── Shared identity node builders ──────────────────────────────
// Pure, no React. Shared between buildHomeSchema and buildAboutSchema so
// the two pages' JSON-LD can never drift apart on address/geo/founder.
function postalAddressNode(): Record<string, unknown> {
  return {
    "@type": "PostalAddress",
    ...ORGANIZATION.address,
  };
}

function geoNode(): Record<string, unknown> {
  return {
    "@type": "GeoCoordinates",
    latitude: ORGANIZATION.geo.latitude,
    longitude: ORGANIZATION.geo.longitude,
  };
}

function founderNode(): Record<string, unknown> {
  return {
    "@type": "Person",
    name: ORGANIZATION.founder.name,
    jobTitle: ORGANIZATION.founder.jobTitle,
  };
}

/**
 * The single LocalBusiness/organization node (`#organization`). Shared by
 * `buildHomeSchema` and `buildAboutSchema` — embedded once on each page,
 * referenced by bare `{"@id"}` everywhere else (WebPage, ServiceSchema).
 * `knowsAbout`/`description` lead with carta digital/NFC, the core
 * products, before automation/n8n (organization-identity spec).
 */
export function organizationNode(): Record<string, unknown> {
  return {
    "@type": "LocalBusiness",
    "@id": ORGANIZATION_ID,
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    description:
      "Carta digital, tarjetas NFC para reseñas de Google, TPV y chatbots con IA para restaurantes, bares y cafeterías de Tenerife y Canarias.",
    areaServed: "Tenerife, Canarias, España",
    knowsAbout: [
      "Carta digital para restaurantes",
      "Tarjetas NFC para reseñas de Google",
      "TPV para hostelería",
      "Chatbots con IA para hostelería",
      "Automatización de procesos con IA",
    ],
    priceRange: "€€",
    image: `${ORG_URL}/icon.png`,
    logo: {
      "@type": "ImageObject",
      url: `${ORG_URL}/icon.png`,
      width: 512,
      height: 512,
    },
    address: postalAddressNode(),
    geo: geoNode(),
    founder: founderNode(),
    foundingDate: "2025",
    sameAs: [...ORGANIZATION.sameAs],
  };
}

/** The single WebSite node (`#website`). Embedded once, on home. */
function websiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${ORG_URL}/`,
    name: ORGANIZATION.name,
    inLanguage: "es",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

// ─── Home page JSON-LD graph builder ────────────────────────────
export interface HomeSchemaFaq {
  question: string;
  answer: string;
}

/**
 * Builds the full JSON-LD `@graph` for the home page from the active
 * `SOLUTIONS` catalog (single source of truth) plus an optional set of
 * FAQ entries. Pure function — no React, no side effects — so it can be
 * unit tested directly and rendered once inside App.tsx's single
 * `<Helmet>` block.
 */
export function buildHomeSchema(
  solutions: SolutionConfig[],
  faqs: HomeSchemaFaq[] = [],
): { "@context": string; "@graph": Record<string, unknown>[] } {
  const organization = organizationNode();
  const website = websiteNode();

  const webPage = {
    "@type": "WebPage",
    // Matches the home canonical (https://digitalizatenerife.es/).
    "@id": `${ORG_URL}/#webpage`,
    url: `${ORG_URL}/`,
    name: "Digitaliza Tenerife | Carta digital, NFC e IA para negocios",
    description:
      "Carta digital sin comisiones, tarjetas NFC para reseñas de Google, chatbots con IA y TPV para restaurantes y negocios de Tenerife y Canarias.",
    inLanguage: "es",
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };

  const serviceUrl = (solution: SolutionConfig): string =>
    solution.href.startsWith("#") ? `${ORG_URL}/${solution.href}` : solution.href.startsWith("http") ? solution.href : `${ORG_URL}${solution.href}`;

  const serviceNodes = solutions.map((solution) => {
    const node: Record<string, unknown> = {
      "@type": "Service",
      "@id": `${ORG_URL}/#service-${solution.id}`,
      name: solution.serviceValue,
      description: solution.jsonLd.description,
      url: serviceUrl(solution),
      provider: { "@id": ORGANIZATION_ID },
      areaServed: solution.jsonLd.areaServed,
      serviceType: solution.jsonLd.serviceType,
    };
    if (solution.jsonLd.sameAs) {
      node.sameAs = solution.jsonLd.sameAs;
    }
    return node;
  });

  const itemList = {
    "@type": "ItemList",
    name: "Soluciones Digitaliza Tenerife",
    description:
      "Soluciones para hostelería y negocios locales: carta digital, tarjetas NFC, chatbots con IA y TPV para restaurantes.",
    url: `${ORG_URL}/#soluciones`,
    itemListElement: solutions.map((solution, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: solution.serviceValue,
      url: serviceUrl(solution),
    })),
  };

  const graph: Record<string, unknown>[] = [
    organization,
    website,
    webPage,
    ...serviceNodes,
    itemList,
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

// ─── /about page JSON-LD builder ────────────────────────────────
/**
 * Builds the AboutPage JSON-LD for `/about`. `mainEntity` embeds the same
 * `organizationNode()` home uses (identical `@id`) — one organization
 * entity, never a second, drifted redeclaration (design.md D4).
 */
export function buildAboutSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${ORG_URL}/about#webpage`,
    url: `${ORG_URL}/about`,
    name: "Sobre Digitaliza Tenerife",
    description:
      "Información sobre Digitaliza Tenerife, empresa tecnológica especializada en IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: organizationNode(),
  };
}

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
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-[var(--color-bg-alt)] overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--color-primary)]/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--color-primary)]/5 blur-3xl" aria-hidden="true" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-default mb-4 max-w-4xl mx-auto">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-8">
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
    <section className="py-16 md:py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-default">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-muted text-center max-w-2xl mx-auto mb-12">
            {subtitle}
          </p>
        )}
        <div
          className={`grid grid-cols-1 ${gridCols[columns]} gap-8 max-w-5xl mx-auto`}
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-[var(--color-bg-alt)] rounded-2xl p-6 border border-[var(--color-border)] hover:border-[var(--color-accent-border)] transition-[border-color] duration-150"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mb-4 text-[var(--color-primary)]">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-default mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted leading-relaxed">
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
    <section className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-default">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-muted text-center max-w-2xl mx-auto mb-16">
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-[var(--color-primary)]/30 to-transparent" aria-hidden="true" />
              )}
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                {step.icon}
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-default mb-2">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">
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
    <section className="py-12 border-y border-[var(--color-border)] bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
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
  areaServed?: string[];
  serviceType?: string;
}

export const ServiceSchema: React.FC<ServiceSchemaProps> = ({
  name,
  description,
  url,
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
    // A bare @id ref into the single LocalBusiness entity declared once
    // on home (design.md D4) — never a redeclared inline Organization.
    provider: { "@id": ORGANIZATION_ID },
  };
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

interface CollectionPageItem {
  name: string;
  description?: string;
  image?: string;
  url?: string;
}

interface CollectionPageSchemaProps {
  title: string;
  description?: string;
  items: CollectionPageItem[];
}

export const CollectionPageSchema: React.FC<CollectionPageSchemaProps> = ({
  title,
  description,
  items,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    ...(description && {
      description,
    }),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.description && {
        description: item.description,
      }),
      ...(item.image && {
        image: {
          "@type": "ImageObject",
          url: item.image,
        },
      }),
      url: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─── SoftwareApplication Schema ─────────────────────────────────
interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  authorName?: string;
  authorUrl?: string;
}

export const SoftwareApplicationSchema: React.FC<
  SoftwareApplicationSchemaProps
> = ({
  name,
  description,
  url,
  applicationCategory = "BusinessApplication",
  operatingSystem = "Web, iOS, Android",
  offers,
  authorName,
  authorUrl,
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
  };

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      ...(offers.availability && { availability: offers.availability }),
    };
  }

  if (authorName) {
    schema.author = {
      "@type": "Organization",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─── WebApplication Schema (extends SoftwareApplication) ────────
interface WebApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  browserRequirements?: string;
  applicationCategory?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  authorName?: string;
  authorUrl?: string;
}

export const WebApplicationSchema: React.FC<WebApplicationSchemaProps> = ({
  name,
  description,
  url,
  browserRequirements = "Requiere navegador moderno (Chrome, Firefox, Safari, Edge)",
  applicationCategory = "BusinessApplication",
  offers,
  authorName,
  authorUrl,
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#webapp`,
    name,
    description,
    url,
    applicationCategory,
    browserRequirements,
  };

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      ...(offers.availability && { availability: offers.availability }),
    };
  }

  if (authorName) {
    schema.author = {
      "@type": "Organization",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
