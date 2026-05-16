import React from "react";
import LegalPage from "@features/legal/presentation/LegalPage";

const PrivacidadPage: React.FC = () => {
  const sections = [
    {
      titleKey: "legalPrivacidadSection1Title",
      contentKey: "legalPrivacidadSection1Content",
    },
    {
      titleKey: "legalPrivacidadSection2Title",
      contentKey: "legalPrivacidadSection2Content",
    },
    {
      titleKey: "legalPrivacidadSection3Title",
      contentKey: "legalPrivacidadSection3Content",
    },
    {
      titleKey: "legalPrivacidadSection4Title",
      contentKey: "legalPrivacidadSection4Content",
    },
    {
      titleKey: "legalPrivacidadSection5Title",
      contentKey: "legalPrivacidadSection5Content",
    },
    {
      titleKey: "legalPrivacidadSection6Title",
      contentKey: "legalPrivacidadSection6Content",
    },
  ];

  return (
    <LegalPage
      titleKey="legalPrivacidadTitle"
      descriptionKey="legalPrivacidadDescription"
      sections={sections}
      backLinkKey="legalPrivacidadBackLink"
      updatedKey="legalPrivacidadUpdated"
    />
  );
};

export default PrivacidadPage;
