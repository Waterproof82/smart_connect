import React from "react";
import LegalPage from "@features/legal/presentation/LegalPage";

const AvisoLegalPage: React.FC = () => {
  const sections = [
    {
      titleKey: "legalAvisoSection1Title",
      contentKey: "legalAvisoSection1Content",
    },
    {
      titleKey: "legalAvisoSection2Title",
      contentKey: "legalAvisoSection2Content",
    },
    {
      titleKey: "legalAvisoSection3Title",
      contentKey: "legalAvisoSection3Content",
    },
    {
      titleKey: "legalAvisoSection4Title",
      contentKey: "legalAvisoSection4Content",
    },
    {
      titleKey: "legalAvisoSection5Title",
      contentKey: "legalAvisoSection5Content",
    },
    {
      titleKey: "legalAvisoSection6Title",
      contentKey: "legalAvisoSection6Content",
    },
  ];

  return (
    <LegalPage
      titleKey="legalAvisoTitle"
      descriptionKey="legalAvisoDescription"
      sections={sections}
      backLinkKey="legalAvisoBackLink"
    />
  );
};

export default AvisoLegalPage;
