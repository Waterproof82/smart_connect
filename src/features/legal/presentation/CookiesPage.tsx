import React from "react";
import LegalPage from "@features/legal/presentation/LegalPage";

const CookiesPage: React.FC = () => {
  const sections = [
    {
      titleKey: "legalCookiesSection1Title",
      contentKey: "legalCookiesSection1Content",
    },
    {
      titleKey: "legalCookiesSection2Title",
      contentKey: "legalCookiesSection2Content",
    },
    {
      titleKey: "legalCookiesSection3Title",
      contentKey: "legalCookiesSection3Content",
    },
    {
      titleKey: "legalCookiesSection4Title",
      contentKey: "legalCookiesSection4Content",
    },
  ];

  return (
    <LegalPage
      titleKey="legalCookiesTitle"
      descriptionKey="legalCookiesDescription"
      sections={sections}
      backLinkKey="legalCookiesBackLink"
      updatedKey="legalCookiesUpdated"
    />
  );
};

export default CookiesPage;
