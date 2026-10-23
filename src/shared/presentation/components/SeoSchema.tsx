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
    alternateName: [...ORGANIZATION.alternateName],
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
    name: "Digitaliza Tenerife | TPV, carta digital y chatbot con IA",
    description:
      "Digitaliza Tenerife: TPV para restaurantes, carta digital sin comisiones, tarjetas NFC para reseñas y chatbot con IA en Tenerife y Canarias.",
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

