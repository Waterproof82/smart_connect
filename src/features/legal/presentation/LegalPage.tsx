import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@shared/context/LanguageContext";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { PageHero } from "@shared/presentation/layout";
import Contact from "@features/landing/presentation/components/Contact";
import { sanitizeHTML } from "@shared/utils/sanitizer";

interface LegalPageProps {
  url: string;
  titleKey: string;
  descriptionKey: string;
  sections: {
    titleKey: string;
    contentKey: string;
  }[];
  backLinkKey: string;
  updatedKey?: string;
}

const LegalPage: React.FC<LegalPageProps> = ({
  url,
  titleKey,
  descriptionKey,
  sections,
  backLinkKey,
  updatedKey,
}) => {
  const { t } = useLanguage();
  const tr = (key: string): string =>
    (t as unknown as Record<string, string>)[key] || key;

  return (
    <>
      <Helmet>
        <title>{tr(titleKey)}</title>
        <meta name="description" content={tr(descriptionKey)} />
        <link rel="canonical" href={url} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={tr(titleKey)} />
        <meta property="og:description" content={tr(descriptionKey)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
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
          name="twitter:image"
          content="https://digitalizatenerife.es/og/home.png"
        />
        <meta name="twitter:title" content={tr(titleKey)} />
        <meta name="twitter:description" content={tr(descriptionKey)} />
      </Helmet>
      <PageShell>
        <PageHero
          title={tr(titleKey)}
          lede={updatedKey ? tr(updatedKey) : undefined}
        />
        <div className="ds-section">
          <div className="ds-container ds-container--prose grid gap-[var(--space-xl)]">
            {sections.map((section) => (
              <section key={section.titleKey} className="ds-prose">
                <h2 className="ds-h3 mb-4">{tr(section.titleKey)}</h2>
                <div
                  className="text-default"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(
                      tr(section.contentKey),
                      "legal-content",
                    ),
                  }}
                />
              </section>
            ))}
            <a href="/" className="text-[var(--color-primary)] hover:underline">
              {tr(backLinkKey)}
            </a>
          </div>
        </div>
        <Contact />
      </PageShell>
    </>
  );
};

export default LegalPage;
