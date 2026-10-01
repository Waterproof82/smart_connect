import React from "react";
import { Helmet } from "react-helmet-async";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero, Section, WhatsAppCta } from "@shared/presentation/layout";
import { PageShell } from "./PageShell";

/**
 * About page — authorship and authority signals.
 * Provides organization info, verifiable authorship, and social proof
 * for AI crawlers and human visitors alike.
 */
const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Sobre Digitaliza Tenerife — Quiénes somos</title>
        <meta
          name="description"
          content="Digitaliza Tenerife es una empresa tecnológica con sede en Santa Cruz de Tenerife. Especialistas en IA, automatización y hardware inteligente para negocios locales en Canarias."
        />
        <link rel="canonical" href="https://digitalizatenerife.es/about" />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://digitalizatenerife.es/about"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://digitalizatenerife.es/about"
        />
        <meta
          property="og:title"
          content="Sobre Digitaliza Tenerife — Quiénes somos"
        />
        <meta
          property="og:description"
          content="Conoce al equipo detrás de Digitaliza Tenerife. IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalizatenerife.es/about" />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og/home.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Digitaliza Tenerife: carta digital, NFC e IA para negocios locales"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Sobre Digitaliza Tenerife — Quiénes somos"
        />
        <meta
          name="twitter:description"
          content="Conoce al equipo detrás de Digitaliza Tenerife. IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias."
        />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/home.png"
        />
        <link
          rel="author"
          href="https://digitalizatenerife.es/about"
          title="Digitaliza Tenerife"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Sobre Digitaliza Tenerife",
            description:
              "Información sobre Digitaliza Tenerife, empresa tecnológica especializada en IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.",
            mainEntity: {
              "@type": "Organization",
              name: "Digitaliza Tenerife",
              description:
                "Empresa tecnológica especializada en IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.",
              url: "https://digitalizatenerife.es",
              logo: {
                "@type": "ImageObject",
                url: "https://digitalizatenerife.es/icon.png",
                width: 512,
                height: 512,
              },
              email: "info@digitalizatenerife.es",
              telephone: "+34 601 39 64 19",
              // Kept in sync manually with app_settings.physical_address
              // (Supabase) — see SeoSchema.tsx buildHomeSchema for the same
              // address, must match Contact.tsx and Google Business Profile.
              address: {
                "@type": "PostalAddress",
                streetAddress: "c/ Ernesto Castro, 57, Puerta 501",
                addressLocality: "Santa Cruz de Tenerife",
                addressRegion: "Canary Islands",
                postalCode: "38001",
                addressCountry: "ES",
              },
              foundingDate: "2025",
              founder: {
                "@type": "Person",
                name: "Digitaliza Tenerife Team",
              },
              sameAs: [
                "https://twitter.com/digitalizatenerife",
                "https://linkedin.com/company/digitalizatenerife",
                "https://instagram.com/digitalizatenerife",
                "https://facebook.com/digitalizatenerife",
                "https://youtube.com/@digitalizatenerife",
              ],
            },
          })}
        </script>
      </Helmet>

      <PageShell>
        <PageHero
          title="Sobre Digitaliza Tenerife"
          lede="Tecnología, inteligencia artificial y automatización para potenciar negocios locales en Tenerife y Canarias."
          actions={<WhatsAppCta />}
        />

        <Section id="mision" width="prose" title="Nuestra misión">
          <div className="ds-prose text-lg text-muted grid gap-[var(--space-md)]">
            <p className="m-0">
              En Digitaliza Tenerife creemos que la tecnología debe estar al
              servicio de los negocios locales. Nuestra misión es democratizar
              el acceso a herramientas de IA, automatización y hardware
              inteligente para que cualquier restaurante, bar o comercio en
              Tenerife y Canarias pueda competir en la era digital.
            </p>
            <p className="m-0">
              Desde la Carta Digital que transforma la experiencia en mesa,
              hasta tarjetas NFC que multiplican las reseñas en Google, pasando
              por automatizaciones con n8n que liberan horas de trabajo cada
              semana — cada solución está diseñada para generar resultados
              medibles desde el primer día.
            </p>
            <p className="m-0">
              Operamos desde Santa Cruz de Tenerife, con un equipo apasionado
              por la tecnología y el desarrollo del tejido empresarial canario.
            </p>
          </div>
        </Section>

        <Section id="valores" tone="alt" title="Nuestros valores">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-md)] list-none p-0 m-0">
            {[
              {
                title: "Tecnología con propósito",
                desc: "No implementamos tecnología por moda. Cada solución resuelve un problema real de negocio.",
              },
              {
                title: "Resultados medibles",
                desc: "Trabajamos con métricas claras: más reseñas, más pedidos, más ingresos por mesa.",
              },
              {
                title: "Cercanía local",
                desc: "Estamos en Tenerife, conocemos el mercado canario y ofrecemos soporte presencial.",
              },
            ].map((value) => (
              <li key={value.title} className="ds-card">
                <h3 className="ds-h3 mb-3">{value.title}</h3>
                <p className="text-muted leading-relaxed m-0">{value.desc}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contacto-info" title="Contacto">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-lg)] m-0">
            {[
              {
                icon: MapPin,
                term: "Oficina",
                value: (
                  <>
                    Santa Cruz de Tenerife
                    <br />
                    Islas Canarias, España
                  </>
                ),
              },
              {
                icon: Mail,
                term: "Email",
                value: (
                  <a
                    href="mailto:info@digitalizatenerife.es"
                    className="text-[var(--color-primary)] hover:underline"
                    rel="author"
                  >
                    info@digitalizatenerife.es
                  </a>
                ),
              },
              {
                icon: Phone,
                term: "Web",
                value: (
                  <a
                    href="https://digitalizatenerife.es"
                    className="text-[var(--color-primary)] hover:underline"
                    rel="author"
                  >
                    digitalizatenerife.es
                  </a>
                ),
              },
            ].map(({ icon: Icon, term, value }) => (
              <div
                key={term}
                className="border-t border-[var(--color-border)] pt-[var(--space-md)]"
              >
                <dt className="flex items-center gap-2 font-semibold mb-2">
                  <Icon
                    className="w-5 h-5 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  {term}
                </dt>
                <dd className="text-muted m-0">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </PageShell>
    </>
  );
};

export default AboutPage;
