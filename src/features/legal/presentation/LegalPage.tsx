import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@shared/context/LanguageContext";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Contact } from "@features/landing/presentation/components/Contact";

interface LegalPageProps {
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
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Helmet>
        <title>{tr(titleKey)}</title>
        <meta name="description" content={tr(descriptionKey)} />
      </Helmet>
      <Navbar scrolled={true} />
      <div className="container mx-auto px-6 py-24 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-default mb-4">
            {tr(titleKey)}
          </h1>
          {updatedKey && <p className="text-muted">{tr(updatedKey)}</p>}
        </div>
        {sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-semibold text-default mb-4">
              {tr(section.titleKey)}
            </h2>
            <div
              className="text-default"
              dangerouslySetInnerHTML={{ __html: tr(section.contentKey) }}
            />
          </div>
        ))}
        <div className="mt-12">
          <a href="/" className="text-default hover:text-primary">
            {tr(backLinkKey)}
          </a>
        </div>
      </div>
      <Contact />
    </div>
  );
};

export default LegalPage;
