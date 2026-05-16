import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

type Language = "es" | "en";

interface Translation {
  // Navigation
  navSolutions: string;
  navSuccess: string;
  navContact: string;
  navAdmin: string;
  navBack: string;
  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroTitleEnd: string;
  heroSubtitle: string;
  heroButtonDemo: string;
  heroButtonContact: string;
  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  featuresContent1: string;
  featuresContent2: string;
  featuresContent3: string;
  featuresContent4: string;
  featuresContent5: string;
  featuresContent6: string;
  featuresSoftwareIA: string;
  featuresSoftwareIADesc: string;
  featuresAutomation: string;
  featuresAutomationDesc: string;
  featuresNFC: string;
  featuresNFCDesc: string;
  featuresQribar: string;
  featuresQribarDesc: string;
  featuresCartaDigital: string;
  featuresCartaDigitalDesc: string;
  featuresVisit: string;
  featuresDetails: string;
  // Success Stats
  successTitle: string;
  successSubtitle: string;
  successDesc: string;
  successStat1Label: string;
  successStat1Quote: string;
  successStat1Author: string;
  successStat2Label: string;
  successStat2Quote: string;
  successStat2Author: string;
  successStat3Label: string;
  successStat3Quote: string;
  successStat3Author: string;
  successStat4Label: string;
  successStat4Quote: string;
  successStat4Author: string;
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoProductDescription: string;
  seoAltTextNFC: string;
  // Contact
  contactTitle: string;
  contactSubtitle: string;
  contactEmailTitle: string;
  contactEmailDesc: string;
  contactEmailLoading: string;
  contactEmailError: string;
  contactWhatsappTitle: string;
  contactWhatsappDesc: string;
  contactLocationTitle: string;
  contactFormName: string;
  contactFormCompany: string;
  contactFormEmail: string;
  contactFormService: string;
  contactFormMessage: string;
  contactFormSubmit: string;
  contactFormLoading: string;
  contactFormSending: string;
  contactSuccess: string;
  contactError: string;
  contactPlaceholderName: string;
  contactPlaceholderCompany: string;
  contactPlaceholderEmail: string;
  contactSelectOption: string;
  contactPlaceholderMessage: string;
  contactFormNameRequired: string;
  contactFormCompanyRequired: string;
  contactFormEmailInvalid: string;
  contactFormServiceRequired: string;
  contactFormMessageMinLength: string;
  // Footer
  footerTagline: string;
  footerSocialTitle: string;
  footerNavTitle: string;
  footerNavInicio: string;
  footerNavSoluciones: string;
  footerNavExito: string;
  footerNavContacto: string;
  footerLegalTitle: string;
  footerLegalAviso: string;
  footerLegalPrivacidad: string;
  footerLegalCookies: string;
  footerCopyright: string;
  // Navbar Solutions
  navbarNFC: string;
  navbarNFCDesc: string;
  navbarQribar: string;
  navbarQribarDesc: string;
  navbarCartaDigital: string;
  navbarCartaDigitalDesc: string;
  // Service options
  serviceCartaDigital: string;
  serviceQribar: string;
  serviceAutomation: string;
  serviceNFC: string;
  serviceConsultoria: string;
  // Error Boundary
  errorBoundaryTitle: string;
  errorBoundaryMessage: string;
  errorBoundaryButton: string;
  // Skip Link
  skipLink: string;
  // Dashboard Preview
  dashboardTitle: string;
  dashboardDesc: string;
  dashboardPanelTitle: string;
  dashboardLastUpdate: string;
  dashboardSystemStatus: string;
  dashboardTotalScans: string;
  dashboardVsLastMonth: string;
  dashboardGoogleReviews: string;
  dashboardRatingExcellent: string;
  dashboardPlanPro: string;
  dashboardPlanActive: string;
  dashboardManage: string;
  dashboardLeadTemp: string;
  dashboardLast7Days: string;
  dashboardRecentActivity: string;
  dashboardActivityScan: string;
  dashboardActivityReview: string;
  dashboardActivityWebhook: string;
  // Carta Digital Page
  cartaHeroEyebrow: string;
  cartaHeroTenerife: string;
  cartaHeroTitle1: string;
  cartaHeroTitleAccent: string;
  cartaHeroTitle2: string;
  cartaHeroSubtitle: string;
  cartaHeroButtonDemo: string;
  cartaHeroButtonCalc: string;
  cartaHeroStat1Label: string;
  cartaHeroStat2Label: string;
  cartaHeroStat3Label: string;
  cartaHeroStat4Label: string;
  cartaProblemaTitle: string;
  cartaProblemaSubtitle: string;
  cartaProblemaDesc: string;
  cartaProblemaItem1Title: string;
  cartaProblemaItem1Desc: string;
  cartaProblemaItem2Title: string;
  cartaProblemaItem2Desc: string;
  cartaProblemaItem3Title: string;
  cartaProblemaItem3Desc: string;
  cartaProblemaItem4Title: string;
  cartaProblemaItem4Desc: string;
  cartaProblemaItem5Title: string;
  cartaProblemaItem5Desc: string;
  cartaProblemaItem6Title: string;
  cartaProblemaItem6Desc: string;
  cartaSolucionTitle: string;
  cartaSolucionSubtitle: string;
  cartaSolucionHighlight: string;
  cartaSolucionPrefix: string;
  cartaSolucionSuffix: string;
  cartaSolucionDesc: string;
  cartaBeneficiosTitle: string;
  cartaBeneficiosSubtitle: string;
  cartaBeneficio1Title: string;
  cartaBeneficio1Desc: string;
  cartaBeneficio1Tag: string;
  cartaBeneficio2Title: string;
  cartaBeneficio2Desc: string;
  cartaBeneficio2Tag: string;
  cartaBeneficio3Title: string;
  cartaBeneficio3Desc: string;
  cartaBeneficio3Tag: string;
  cartaBeneficio4Title: string;
  cartaBeneficio4Desc: string;
  cartaBeneficio4Tag: string;
  cartaBeneficio5Title: string;
  cartaBeneficio5Desc: string;
  cartaBeneficio5Tag: string;
  cartaBeneficio6Title: string;
  cartaBeneficio6Desc: string;
  cartaBeneficio6Tag: string;
  cartaBeneficio7Title: string;
  cartaBeneficio7Desc: string;
  cartaBeneficio7Tag: string;
  cartaFlujoTitle: string;
  cartaFlujoSubtitle: string;
  cartaFlujoStep5Title: string;
  cartaFlujoStep5Desc: string;
  cartaFlujoStep1Title: string;
  cartaFlujoStep1Desc: string;
  cartaFlujoStep2Title: string;
  cartaFlujoStep2Desc: string;
  cartaFlujoStep3Title: string;
  cartaFlujoStep3Desc: string;
  cartaFlujoStep4Title: string;
  cartaFlujoStep4Desc: string;
  // --- COMPARATIVA DINERO ---
  cartaDineroTitle: string;
  cartaDineroSubtitle: string;
  cartaDineroCalcDesc: string;
  cartaDineroCard1Title: string;
  cartaDineroCard1Item1: string;
  cartaDineroCard1Item2: string;
  cartaDineroCard1Item3: string;
  cartaDineroCard1Total: string;
  cartaDineroCard2Title: string;
  cartaDineroCard2Item1: string;
  cartaDineroCard2Item2: string;
  cartaDineroCard2Item3: string;
  cartaDineroCard2Item4: string;
  cartaDineroCard2Total: string;
  // BBDD Section
  cartaBBDDTitle: string;
  cartaBBDDSubtitle: string;
  cartaBBDDDesc: string;
  cartaBBDDLabel1: string;
  cartaBBDDLabel2: string;
  cartaBBDDLabelTuBBDD: string;
  cartaBBDDData1: string;
  cartaBBDDData2: string;
  cartaBBDDData3: string;
  cartaBBDDData4: string;
  cartaBBDDAction1: string;
  cartaBBDDAction2: string;
  cartaBBDDAction3: string;
  // CTA Final Section
  cartaCTATitle: string;
  cartaCTASubtitle: string;
  cartaCTABtnDemo: string;
  cartaCTABtnContact: string;
  cartaCTANoContract: string;
  cartaCTASignup48h: string;
  cartaCTASupport: string;
  cartaCTANoComm: string;
  // Demo Section
  cartaDemoTitle: string;
  cartaDemoVideoLabel: string;
  cartaDemoScreen1Title: string;
  cartaDemoScreen1Label: string;
  cartaDemoScreen2Title: string;
  cartaDemoScreen2Label: string;
  cartaDemoScreen3Title: string;
  cartaDemoScreen3Label: string;
  // Tap Review (NFC)
  tapReviewMetaTitle: string;
  tapReviewMetaDesc: string;
  tapReviewEyebrow: string;
  tapReviewHeroTitle: string;
  tapReviewHeroAccent: string;
  tapReviewHeroSubtitle: string;
  tapReviewHeroBtnContact: string;
  tapReviewHeroBtnProduct: string;
  tapReviewHeroFeature1: string;
  tapReviewHeroFeature2: string;
  tapReviewHeroFeature3: string;
  tapReviewProductExhibitorWhite: string;
  tapReviewProductExhibitorWhiteAlt: string;
  tapReviewProductExhibitorBlack: string;
  tapReviewProductExhibitorBlackAlt: string;
  tapReviewProductStand: string;
  tapReviewProductStandAlt: string;
  tapReviewStatsBusinesses: string;
  tapReviewStatsReviews: string;
  tapReviewStatsDaily: string;
  tapReviewHowTitle: string;
  tapReviewHowSubtitle: string;
  tapReviewHowStep1Title: string;
  tapReviewHowStep1Desc: string;
  tapReviewHowStep2Title: string;
  tapReviewHowStep2Desc: string;
  tapReviewHowStep3Title: string;
  tapReviewHowStep3Desc: string;
  tapReviewFeatTitle: string;
  tapReviewFeatSubtitle: string;
  tapReviewFeatNFC: string;
  tapReviewFeatNFCDesc: string;
  tapReviewFeatSpeed: string;
  tapReviewFeatSpeedDesc: string;
  tapReviewFeatGoogle: string;
  tapReviewFeatGoogleDesc: string;
  tapReviewFeatNoSub: string;
  tapReviewFeatNoSubDesc: string;
  tapReviewSocialTitle: string;
  tapReviewSocialSubtitle: string;
  tapReviewTestimonial1Quote: string;
  tapReviewTestimonial1Author: string;
  tapReviewTestimonial1Business: string;
  tapReviewTestimonial2Quote: string;
  tapReviewTestimonial2Author: string;
  tapReviewTestimonial2Business: string;
  tapReviewTestimonial3Quote: string;
  tapReviewTestimonial3Author: string;
  tapReviewTestimonial3Business: string;
  tapReviewFAQTitle: string;
  tapReviewFAQ1Question: string;
  tapReviewFAQ1Answer: string;
  tapReviewFAQ2Question: string;
  tapReviewFAQ2Answer: string;
  tapReviewFAQ3Question: string;
  tapReviewFAQ3Answer: string;
  tapReviewCTATitle: string;
  tapReviewCTASubtitle: string;
  tapReviewCTABtnPrimary: string;
  tapReviewCTAFeature1: string;
  tapReviewCTAFeature2: string;
  tapReviewCTAFeature3: string;
  tapReviewTrust30Days: string;
  tapReviewTrust24h: string;
  tapReviewTrustSupport: string;
  tapReviewTrustNoSub: string;
  // QRIBAR
  qribarSector: string;
  qribarTitle: string;
  qribarSubtitle: string;
  qribarBenefit1: string;
  qribarBenefit2: string;
  qribarBenefit3: string;
  qribarBenefit4: string;
  qribarButton: string;
  qribarError: string;
  qribarLoading: string;
  // Digital Menu Landing
  // Menu QR Landing
  // Table Orders Landing
  // Digital Menu SEO
  // Menu QR SEO
  // Table Orders SEO
  // NFC Reviews Landing Page
  // n8n Automation Landing Page
  n8nAutomationSeoTitle: string;
  n8nAutomationSeoDescription: string;
  n8nAutomationHeroTitle: string;
  n8nAutomationHeroSubtitle: string;
  n8nAutomationHeroCta: string;
  // WhatsApp Automation Landing Page
  whatsappAutomationSeoTitle: string;
  whatsappAutomationSeoDescription: string;
  whatsAppAutomationHeroTitle: string;
  whatsAppAutomationHeroSubtitle: string;
  whatsAppAutomationHeroCta: string;
  // WhatsApp Automation — Stats & Benefits
  whatsAppAutomationStat1Label: string;
  whatsAppAutomationStat2Label: string;
  whatsAppAutomationStat3Label: string;
  whatsAppAutomationStat4Label: string;
  whatsAppAutomationBenefitsTitle: string;
  whatsAppAutomationBenefitsSubtitle: string;
  whatsAppAutomationBenefit1Title: string;
  whatsAppAutomationBenefit1Desc: string;
  whatsAppAutomationBenefit2Title: string;
  whatsAppAutomationBenefit2Desc: string;
  whatsAppAutomationBenefit3Title: string;
  whatsAppAutomationBenefit3Desc: string;
  whatsAppAutomationBenefit4Title: string;
  whatsAppAutomationBenefit4Desc: string;
  whatsAppAutomationHowItWorksTitle: string;
  whatsAppAutomationHowItWorksSubtitle: string;
  whatsAppAutomationStep1Title: string;
  whatsAppAutomationStep1Desc: string;
  whatsAppAutomationStep2Title: string;
  whatsAppAutomationStep2Desc: string;
  whatsAppAutomationStep3Title: string;
  whatsAppAutomationStep3Desc: string;
  whatsAppAutomationGeoCoverageTitle: string;
  whatsAppAutomationGeoCoverageSubtitle: string;
  whatsAppAutomationServiceArea: string;
  whatsAppAutomationInternalLinksTitle: string;
  whatsAppAutomationInternalLink1Label: string;
  whatsAppAutomationInternalLink1Desc: string;
  whatsAppAutomationInternalLink2Label: string;
  whatsAppAutomationInternalLink2Desc: string;
  whatsAppAutomationInternalLink3Label: string;
  whatsAppAutomationInternalLink3Desc: string;
  whatsAppAutomationInternalLink4Label: string;
  whatsAppAutomationInternalLink4Desc: string;
  whatsAppAutomationWhatsAppText: string;
  whatsAppAutomationTestimonialsTitle: string;
  whatsAppAutomationTestimonial1Quote: string;
  whatsAppAutomationTestimonial1Name: string;
  whatsAppAutomationTestimonial1Title: string;
  whatsAppAutomationTestimonial2Quote: string;
  whatsAppAutomationTestimonial2Name: string;
  whatsAppAutomationTestimonial2Title: string;
  whatsAppAutomationFaqsTitle: string;
  whatsAppAutomationFaq1Question: string;
  whatsAppAutomationFaq1Answer: string;
  whatsAppAutomationFaq2Question: string;
  whatsAppAutomationFaq2Answer: string;
  whatsAppAutomationFaq3Question: string;
  whatsAppAutomationFaq3Answer: string;
  whatsAppAutomationFaq4Question: string;
  whatsAppAutomationFaq4Answer: string;
  whatsAppAutomationFaq5Question: string;
  whatsAppAutomationFaq5Answer: string;
  whatsAppAutomationFaq6Question: string;
  whatsAppAutomationFaq6Answer: string;
  whatsAppAutomationFaq7Question: string;
  whatsAppAutomationFaq7Answer: string;
  // Software Canarias Landing Page
  softwareCanariasSeoTitle: string;
  softwareCanariasSeoDescription: string;
  softwareCanariasHeroTitle: string;
  softwareCanariasHeroSubtitle: string;
  softwareCanariasHeroCta: string;
  // Software Canarias — Stats & Benefits
  softwareCanariasStat1Label: string;
  softwareCanariasStat2Label: string;
  softwareCanariasStat3Label: string;
  softwareCanariasStat4Label: string;
  softwareCanariasBenefitsTitle: string;
  softwareCanariasBenefitsSubtitle: string;
  softwareCanariasBenefit1Title: string;
  softwareCanariasBenefit1Desc: string;
  softwareCanariasBenefit2Title: string;
  softwareCanariasBenefit2Desc: string;
  softwareCanariasBenefit3Title: string;
  softwareCanariasBenefit3Desc: string;
  softwareCanariasBenefit4Title: string;
  softwareCanariasBenefit4Desc: string;
  softwareCanariasHowItWorksTitle: string;
  softwareCanariasHowItWorksSubtitle: string;
  softwareCanariasStep1Title: string;
  softwareCanariasStep1Desc: string;
  softwareCanariasStep2Title: string;
  softwareCanariasStep2Desc: string;
  softwareCanariasStep3Title: string;
  softwareCanariasStep3Desc: string;
  softwareCanariasGeoCoverageTitle: string;
  softwareCanariasGeoCoverageSubtitle: string;
  softwareCanariasServiceArea: string;
  softwareCanariasInternalLinksTitle: string;
  softwareCanariasInternalLink1Label: string;
  softwareCanariasInternalLink1Desc: string;
  softwareCanariasInternalLink2Label: string;
  softwareCanariasInternalLink2Desc: string;
  softwareCanariasInternalLink3Label: string;
  softwareCanariasInternalLink3Desc: string;
  softwareCanariasInternalLink4Label: string;
  softwareCanariasInternalLink4Desc: string;
  softwareCanariasInternalLink5Label: string;
  softwareCanariasInternalLink5Desc: string;
  softwareCanariasWhatsAppText: string;
  softwareCanariasTestimonialsTitle: string;
  softwareCanariasTestimonial1Quote: string;
  softwareCanariasTestimonial1Name: string;
  softwareCanariasTestimonial1Title: string;
  softwareCanariasTestimonial2Quote: string;
  softwareCanariasTestimonial2Name: string;
  softwareCanariasTestimonial2Title: string;
  softwareCanariasFaqsTitle: string;
  softwareCanariasFaq1Question: string;
  softwareCanariasFaq1Answer: string;
  softwareCanariasFaq2Question: string;
  softwareCanariasFaq2Answer: string;
  softwareCanariasFaq3Question: string;
  softwareCanariasFaq3Answer: string;
  softwareCanariasFaq4Question: string;
  softwareCanariasFaq4Answer: string;
  softwareCanariasFaq5Question: string;
  softwareCanariasFaq5Answer: string;
  softwareCanariasFaq6Question: string;
  softwareCanariasFaq6Answer: string;
  // Digitalization Tenerife Landing Page
  digitalizationTenerifeSeoTitle: string;
  digitalizationTenerifeSeoDescription: string;
  digitalizationTenerifeHeroTitle: string;
  digitalizationTenerifeHeroSubtitle: string;
  digitalizationTenerifeHeroCta: string;
  // Digitalization Tenerife — Stats & Benefits
  digitalizationTenerifeStat1Label: string;
  digitalizationTenerifeStat2Label: string;
  digitalizationTenerifeStat3Label: string;
  digitalizationTenerifeStat4Label: string;
  digitalizationTenerifeBenefitsTitle: string;
  digitalizationTenerifeBenefitsSubtitle: string;
  digitalizationTenerifeBenefit1Title: string;
  digitalizationTenerifeBenefit1Desc: string;
  digitalizationTenerifeBenefit2Title: string;
  digitalizationTenerifeBenefit2Desc: string;
  digitalizationTenerifeBenefit3Title: string;
  digitalizationTenerifeBenefit3Desc: string;
  digitalizationTenerifeBenefit4Title: string;
  digitalizationTenerifeBenefit4Desc: string;
  digitalizationTenerifeHowItWorksTitle: string;
  digitalizationTenerifeHowItWorksSubtitle: string;
  digitalizationTenerifeStep1Title: string;
  digitalizationTenerifeStep1Desc: string;
  digitalizationTenerifeStep2Title: string;
  digitalizationTenerifeStep2Desc: string;
  digitalizationTenerifeStep3Title: string;
  digitalizationTenerifeStep3Desc: string;
  digitalizationTenerifeGeoCoverageTitle: string;
  digitalizationTenerifeGeoCoverageSubtitle: string;
  digitalizationTenerifeServiceArea: string;
  digitalizationTenerifeInternalLinksTitle: string;
  digitalizationTenerifeInternalLink1Label: string;
  digitalizationTenerifeInternalLink1Desc: string;
  digitalizationTenerifeInternalLink2Label: string;
  digitalizationTenerifeInternalLink2Desc: string;
  digitalizationTenerifeInternalLink3Label: string;
  digitalizationTenerifeInternalLink3Desc: string;
  digitalizationTenerifeInternalLink4Label: string;
  digitalizationTenerifeInternalLink4Desc: string;
  digitalizationTenerifeInternalLink5Label: string;
  digitalizationTenerifeInternalLink5Desc: string;
  digitalizationTenerifeInternalLink6Label: string;
  digitalizationTenerifeInternalLink6Desc: string;
  digitalizationTenerifeWhatsAppText: string;
  digitalizationTenerifeTestimonialsTitle: string;
  digitalizationTenerifeTestimonial1Quote: string;
  digitalizationTenerifeTestimonial1Name: string;
  digitalizationTenerifeTestimonial1Title: string;
  digitalizationTenerifeTestimonial2Quote: string;
  digitalizationTenerifeTestimonial2Name: string;
  digitalizationTenerifeTestimonial2Title: string;
  digitalizationTenerifeFaqsTitle: string;
  digitalizationTenerifeFaq1Question: string;
  digitalizationTenerifeFaq1Answer: string;
  digitalizationTenerifeFaq2Question: string;
  digitalizationTenerifeFaq2Answer: string;
  digitalizationTenerifeFaq3Question: string;
  digitalizationTenerifeFaq3Answer: string;
  digitalizationTenerifeFaq4Question: string;
  digitalizationTenerifeFaq4Answer: string;
  digitalizationTenerifeFaq5Question: string;
  digitalizationTenerifeFaq5Answer: string;
  digitalizationTenerifeFaq6Question: string;
  digitalizationTenerifeFaq6Answer: string;
  digitalizationTenerifeFaq7Question: string;
  digitalizationTenerifeFaq7Answer: string;
  // Menu Digital sin App Landing Page
  // Navbar Solutions (Silo 2)
  navbarAutomationN8n: string;
  navbarAutomationN8nDesc: string;
  navbarWhatsAppAutomation: string;
  navbarWhatsAppAutomationDesc: string;
  navbarSoftwareCanarias: string;
  navbarSoftwareCanariasDesc: string;
  navbarDigitalizationTenerife: string;
  navbarDigitalizationTenerifeDesc: string;
  // Hero Additional Keys
  smartConnect: string;
  enterpriseAINode: string;
  aiCore: string;
  processing: string;
  uplinkStable: string;
  nfcActive: string;
  // n8n Automation — Stats & Benefits
  n8nAutomationStat1Label: string;
  n8nAutomationStat2Label: string;
  n8nAutomationStat3Label: string;
  n8nAutomationStat4Label: string;
  n8nAutomationBenefitsTitle: string;
  n8nAutomationBenefitsSubtitle: string;
  n8nAutomationBenefit1Title: string;
  n8nAutomationBenefit1Desc: string;
  n8nAutomationBenefit2Title: string;
  n8nAutomationBenefit2Desc: string;
  n8nAutomationBenefit3Title: string;
  n8nAutomationBenefit3Desc: string;
  n8nAutomationBenefit4Title: string;
  n8nAutomationHowItWorksTitle: string;
  n8nAutomationHowItWorksSubtitle: string;
  n8nAutomationStep1Title: string;
  n8nAutomationStep1Desc: string;
  n8nAutomationStep2Title: string;
  n8nAutomationStep2Desc: string;
  n8nAutomationStep3Title: string;
  n8nAutomationStep3Desc: string;
  n8nAutomationGeoCoverageTitle: string;
  n8nAutomationGeoCoverageSubtitle: string;
  n8nAutomationServiceArea: string;
  n8nAutomationInternalLinksTitle: string;
  n8nAutomationInternalLink1Label: string;
  n8nAutomationInternalLink1Desc: string;
  n8nAutomationWhatsAppText: string;
  n8nAutomationBenefit4Desc: string;
  n8nAutomationInternalLink2Label: string;
  n8nAutomationInternalLink2Desc: string;
  n8nAutomationInternalLink3Label: string;
  n8nAutomationInternalLink3Desc: string;
  n8nAutomationInternalLink4Label: string;
  n8nAutomationInternalLink4Desc: string;
  // n8n Automation — Testimonials & FAQs
  n8nAutomationTestimonialsTitle: string;
  n8nAutomationTestimonial1Quote: string;
  n8nAutomationTestimonial1Name: string;
  n8nAutomationTestimonial1Title: string;
  n8nAutomationTestimonial2Quote: string;
  n8nAutomationTestimonial2Name: string;
  n8nAutomationTestimonial2Title: string;
  n8nAutomationFaqsTitle: string;
  n8nAutomationFaq1Question: string;
  n8nAutomationFaq1Answer: string;
  n8nAutomationFaq2Question: string;
  n8nAutomationFaq2Answer: string;
  n8nAutomationFaq3Question: string;
  n8nAutomationFaq3Answer: string;
  n8nAutomationFaq4Question: string;
  n8nAutomationFaq4Answer: string;
  n8nAutomationFaq5Question: string;
  n8nAutomationFaq5Answer: string;
  n8nAutomationFaq6Question: string;
  n8nAutomationFaq6Answer: string;
}

const translations: Record<Language, Translation> = {
  es: {
    // Navigation
    navSolutions: "Soluciones",
    navSuccess: "Éxito",
    navContact: "Contacto",
    navAdmin: "Admin",
    navBack: "Volver",

    // Hero
    heroEyebrow: "La revolución digital para negocios locales",
    heroTitle: "Potencia tu Negocio con",
    heroTitleAccent: "IA",
    heroTitleEnd: "y Automatización",
    heroSubtitle:
      "Tecnología de próxima generación para restaurantes en Tenerife y Canarias. Automatiza pedidos, aumenta ingresos por mesa, reduce tiempos de espera y fideliza clientes con soluciones digitales sin comisiones ni intermediarios.",
    heroButtonDemo: "Ver Demo",
    heroButtonContact: "Contactar",

    // Features
    featuresTitle: "Nuestros Servicios",
    featuresSubtitle:
      "Herramientas avanzadas diseñadas para la era digital, desde el hardware hasta el código.",
    featuresContent1:
      "En SmartConnect AI transformamos la experiencia de los restaurantes en Tenerife y Canarias. Con IA, automatización y hardware inteligente, ayudamos a atraer, retener y fidelizar clientes. Nuestras soluciones incluyen menús digitales QRIBAR con pedidos en tiempo real, tarjetas NFC para reseñas instantáneas en Google y automatización con n8n que conecta cada interacción del cliente. ¡El salto digital que tu negocio necesita para crecer!",
    featuresContent2:
      "Con QRIBAR, tus clientes en Tenerife y Canarias pueden pedir desde su móvil escaneando un código QR en la mesa. El pedido llega directamente a barra y cocina en tiempo real, reduciendo tiempos de espera y aumentando la rotación de mesas. Sin comisiones ni intermediarios, cada mesa se convierte en un punto de venta digital que opera 24/7, recopilando datos valiosos para campañas de marketing automatizadas y fidelización.",
    featuresContent3:
      "Nuestras tarjetas NFC Tap-to-Review permiten a tus clientes dejar reseñas en Google con un solo toque. Más reseñas significan mejor posicionamiento en Google Maps y atraerás más clientes nuevos a tu restaurante en Tenerife y Canarias. Tecnología de alto rendimiento, sin suscripciones y configuración inmediata. Estudios demuestran que los negocios con más de 50 reseñas en Google reciben hasta un 40% más de visitas.",
    featuresContent4:
      "Imagina un flujo de trabajo automatizado donde cada lead se captura, analiza y responde automáticamente. Con nuestras automatizaciones n8n, conectamos tu CRM, email, WhatsApp y redes sociales en un solo ecosistema. Cada interacción con clientes potenciales genera acciones en cadena: análisis de sentimiento con IA, asignación de temperatura del lead y notificaciones en tiempo real a tu equipo comercial. ¡Libera horas de trabajo cada semana!",
    featuresContent5:
      "QRIBAR no es solo un menú digital: es tu nuevo canal de ventas directo para restaurantes en Tenerife y Canarias. Cada mesa escanea un código QR, explora platos con fotos y vídeos profesionales en 5 idiomas, y envía el pedido directamente a barra y cocina. Los datos de cada cliente se almacenan en tu base de datos para campañas de fidelización automatizadas. El resultado: mesas que rotan más rápido, tickets promedio más altos y clientes que vuelven por la experiencia impecable.",
    featuresContent6:
      "Las tarjetas NFC Tap-to-Review convierten cada visita en una reseña de Google para tu restaurante en Tenerife y Canarias. Coloca el expositor en tu local, el cliente acerca su móvil, y en 5 segundos tiene abierta la página de reseñas. Más reseñas significan mejor posicionamiento local en Google Maps y atraen más clientes nuevos cada mes. Es un ciclo virtuoso que multiplica tu visibilidad sin inversión publicitaria recurrente. ¡Multiplica tus reseñas por 6 en los primeros 90 días!",
    featuresSoftwareIA: "Software & IA",
    featuresSoftwareIADesc:
      "Desarrollo de herramientas personalizadas que se integran perfectamente con tus sistemas actuales. Soluciones a medida impulsadas por algoritmos inteligentes.",
    featuresAutomation: "Automatización (n8n)",
    featuresAutomationDesc:
      "Orquesta flujos de trabajo complejos sin esfuerzo. Conectamos tus apps favoritas y automatizamos tareas repetitivas para que tu equipo se enfoque en innovar.",
    featuresNFC: "Tarjetas Tap-to-Review",
    featuresNFCDesc:
      "Hardware físico con alma digital. Tarjetas NFC elegantes que permiten a tus clientes dejar reseñas positivas al instante con un solo toque.",
    featuresQribar: "QRIBAR",
    featuresQribarDesc:
      "El cliente pide desde su móvil en la mesa y el pedido llega en tiempo real a barra y cocina. Elimina esperas del camarero y aumenta la rotación de mesas.",
    featuresCartaDigital: "Carta Digital Premium",
    featuresCartaDigitalDesc:
      "La carta digital que elimina intermediarios. 0% comisiones, 5 idiomas, pedidos por WhatsApp y tu propia base de datos de clientes.",
    featuresVisit: "Visitar",
    featuresDetails: "Ver detalles",

    // Success Stats
    successTitle: "Casos de Éxito",
    successSubtitle: "Resultados reales que transforman negocios",
    successDesc:
      "Empresas que ya confían en nosotros y han transformado su operación.",
    successStat1Label: "Aumento Promedio",
    successStat1Quote:
      "Desde que implementamos QRIBAR, nuestros ingresos por mesa aumentaron un 45%",
    successStat1Author: "Restaurante L'Escale",
    successStat2Label: "Satisfacción",
    successStat2Quote:
      "Mis clientes adoran la experiencia. Las reseñas positivas se dispararon",
    successStat2Author: "Café Central Madrid",
    successStat3Label: "Reseñas Ganadas",
    successStat3Quote:
      "Pasamos de 200 a 1200 reseñas en Google. Es increíble el impacto",
    successStat3Author: "Bar Bodega Toledo",
    successStat4Label: "Clientes Activos",
    successStat4Quote:
      "Más de 850 negocios confían en SmartConnect para su transformación digital",
    successStat4Author: "Comunidad Hostelera",

    // SEO
    seoTitle:
      "SmartConnect AI: Soluciones Digitales para Restaurantes en Tenerife y Canarias",
    seoDescription:
      "SmartConnect AI: automatización con IA, n8n, tarjetas NFC para Google Reviews y menús digitales QRIBAR. Digitaliza tu restaurante en Tenerife y Canarias para aumentar pedidos, reducir tiempos de espera y maximizar ingresos por mesa. Sin comisiones, sin intermediarios.",
    seoProductDescription:
      "Plataforma de crecimiento para restaurantes en Tenerife y Canarias con menú digital QRIBAR, pedidos por QR, tecnología NFC Tap-to-Review y automatización n8n. Diseñada para aumentar pedidos, reducir tiempos de espera, maximizar ingresos por mesa y obtener más reseñas en Google. Ideal para bares, restaurantes y hostelería en Canarias.",
    seoAltTextNFC: "Tarjeta NFC Tap-to-Review para obtener reseñas en Google",

    // Contact
    contactTitle: "Contacto",
    contactSubtitle:
      "¿Hablamos? Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.",
    contactEmailTitle: "Email Directo",
    contactEmailDesc: "Respondemos en menos de 2 horas",
    contactEmailLoading: "Cargando...",
    contactEmailError: "No disponible",
    contactWhatsappTitle: "WhatsApp Business",
    contactWhatsappDesc: "Soporte técnico inmediato",
    contactLocationTitle: "Nuestras Oficinas",
    contactFormName: "Nombre Completo",
    contactFormCompany: "Empresa",
    contactFormEmail: "Correo Electrónico",
    contactFormService: "Servicio de Interés",
    contactFormMessage: "Mensaje",
    contactFormSubmit: "Enviar Mensaje",
    contactFormLoading: "Cargando configuración...",
    contactFormSending: "Enviando mensaje...",
    contactSuccess: "¡Mensaje enviado! Te contactaremos en menos de 2 horas.",
    contactError:
      "No se pudo enviar. Intenta de nuevo o contáctanos por otro medio.",
    contactPlaceholderName: "Ej. Juan Pérez",
    contactPlaceholderCompany: "Ej. Restaurante L'Escale",
    contactPlaceholderEmail: "juan@empresa.com",
    contactSelectOption: "Selecciona una opción",
    contactPlaceholderMessage: "Cuéntanos brevemente sobre tu proyecto...",
    contactFormNameRequired: "El nombre es obligatorio",
    contactFormCompanyRequired: "La empresa es obligatoria",
    contactFormEmailInvalid: "El email no es válido",
    contactFormServiceRequired: "Selecciona un servicio",
    contactFormMessageMinLength: "El mensaje debe tener al menos 10 caracteres",

    // Dashboard Preview
    dashboardTitle: "Control Total en Tiempo Real",
    dashboardDesc:
      "Monitorea tus KPIs y la reputación de tu negocio desde un solo lugar.",
    dashboardPanelTitle: "Panel de Control",
    dashboardLastUpdate: "Última actualización: hace 2 min",
    dashboardSystemStatus: "Sistema Operativo",
    dashboardTotalScans: "Total Scans",
    dashboardVsLastMonth: "↗ +12% vs mes pasado",
    dashboardGoogleReviews: "Reseñas Google",
    dashboardRatingExcellent: "Excelente",
    dashboardPlanPro: "Plan Pro",
    dashboardPlanActive: "Tu suscripción está activa hasta Dic 2024.",
    dashboardManage: "Gestionar",
    dashboardLeadTemp: "Lead Temperature",
    dashboardLast7Days: "Últimos 7 días",
    dashboardRecentActivity: "Actividad Reciente",
    dashboardActivityScan: "Usuario Escaneo NFC",
    dashboardActivityReview: "Nueva Reseña 5★",
    dashboardActivityWebhook: "Webhook Ejecutado",

    // Footer
    footerTagline: "Next-generation technology for local businesses.",
    footerSocialTitle: "Follow Us",
    footerNavTitle: "Navigation",
    footerNavInicio: "Home",
    footerNavSoluciones: "Solutions",
    footerNavExito: "Success Stories",
    footerNavContacto: "Contact",
    footerLegalTitle: "Legal",
    footerLegalAviso: "Aviso Legal",
    footerLegalPrivacidad: "Política de Privacidad",
    footerLegalCookies: "Política de Cookies",
    footerCopyright: "© 2026 SmartConnect AI. Todos los derechos reservados.",

    // Navbar Solutions
    navbarNFC: "Tarjetas NFC",
    navbarNFCDesc: "Reseñas al instante",
    navbarQribar: "QRIBAR",
    navbarQribarDesc: "Pedido en tiempo real a barra y cocina",
    navbarCartaDigital: "Carta Digital Premium",
    navbarCartaDigitalDesc: "0% comisiones, 5 idiomas",
    navbarAutomationN8n: "Automatización n8n",
    navbarAutomationN8nDesc: "Flujos automatizados para hostelería",
    navbarWhatsAppAutomation: "WhatsApp Automation",
    navbarWhatsAppAutomationDesc: "Soporte y pedidos automatizados",
    navbarSoftwareCanarias: "Software para Canarias",
    navbarSoftwareCanariasDesc: "Soluciones digitales para restaurantes",
    navbarDigitalizationTenerife: "Digitalización Tenerife",
    navbarDigitalizationTenerifeDesc: "Herramientas para modernizar tu negocio",

    // Service options
    serviceCartaDigital: "Carta Digital Premium",
    serviceQribar: "QRIBAR - Pedido en tiempo real a barra y cocina",
    serviceAutomation: "Automatización n8n",
    serviceNFC: "Tarjetas NFC Reseñas",
    serviceConsultoria: "Consultoría IA",

    // Error Boundary
    errorBoundaryTitle: "Algo salió mal",
    errorBoundaryMessage: "Por favor, recarga la página.",
    errorBoundaryButton: "Recargar",

    // Skip Link
    skipLink: "Saltar al contenido",

    // Carta Digital Page
    cartaHeroEyebrow: "La revolución digital para restaurantes en Tenerife",
    cartaHeroTenerife:
      "Especial para bares, restaurantes y empresas. Atención en persona con explicación de demos in situ.",
    cartaHeroTitle1: "Tu carta,",
    cartaHeroTitleAccent: "tu negocio,",
    cartaHeroTitle2: "tus clientes.",
    cartaHeroSubtitle:
      "Una carta digital autogestionable que transforma la experiencia de tus comensales, elimina intermediarios y convierte cada visita en un cliente fiel.",
    cartaHeroButtonDemo: "Ver cómo funciona",
    cartaHeroButtonCalc: "Calcular ahorro",
    cartaHeroStat1Label: "Idiomas",
    cartaHeroStat2Label: "Comisiones",
    cartaHeroStat3Label: "Pedidos online",
    cartaHeroStat4Label: "Clientes",

    cartaProblemaTitle: "¿Cuánto dinero",
    cartaProblemaSubtitle: "estás perdiendo hoy?",
    cartaProblemaDesc:
      "La mayoría de restaurantes dependen de sistemas anticuados, intermediarios costosos y herramientas que no les pertenecen. El resultado: margen reducido, clientes anónimos y oportunidades perdidas.",
    cartaProblemaItem1Title: "Comisiones que sangran",
    cartaProblemaItem1Desc:
      "Glovo, Uber Eats y similares se quedan entre el 25% y el 35% de cada pedido. Tú trabajas, ellos se llevan el margen.",
    cartaProblemaItem2Title: "Carta en papel obsoleta",
    cartaProblemaItem2Desc:
      "Sin fotos, sin descripciones claras, sin idiomas. El cliente no sabe qué va a pedir y llama al camarero tres veces.",
    cartaProblemaItem3Title: "Turistas sin atender",
    cartaProblemaItem3Desc:
      "El cliente extranjero no entiende la carta y pide lo más sencillo. Ticket medio más bajo garantizado.",
    cartaProblemaItem4Title: "Llamadas perdidas",
    cartaProblemaItem4Desc:
      "Gestionar pedidos por teléfono mientras sirves mesas es imposible.",
    cartaProblemaItem5Title: "Clientes anónimos",
    cartaProblemaItem5Desc:
      "Cada cliente que pide por Glovo, Uber Eats o similares es de ellos, no tuyo. No tienes su contacto y no puedes fidelizarlo.",
    cartaProblemaItem6Title: "Invisible en internet",
    cartaProblemaItem6Desc:
      "Sin web propia optimizada en buscadores, dependes de plataformas de terceros.",

    cartaSolucionTitle: "La solución",
    cartaSolucionSubtitle:
      "Una sola herramienta. Todos los problemas, resueltos.",
    cartaSolucionHighlight: "carta digital multimedia",
    cartaSolucionPrefix: "Una ",
    cartaSolucionSuffix:
      " que trabaja para ti las 24 horas: dentro del local, en Google y en redes sociales.",
    cartaSolucionDesc:
      "Tus clientes ven los platos con fotos, vídeos y descripciones en 5 idiomas escaneando el QR de la mesa. Los nuevos clientes encuentran tu carta en Google y hacen pedidos take away directamente. Tú recibes el pedido por WhatsApp, acumulas su contacto en tu base de datos y les fidelizas con promociones. Sin intermediarios. Sin comisiones. Sin depender de nadie.",

    cartaBeneficiosTitle: "7 beneficios que",
    cartaBeneficiosSubtitle: "cambian tu negocio",
    cartaBeneficio1Title: "Experiencia premium en mesa",
    cartaBeneficio1Desc:
      "Cada plato se presenta con fotos profesionales, vídeos y descripciones detalladas. El cliente sabe exactamente qué va a pedir.",
    cartaBeneficio1Tag: "↑ Ticket medio",
    cartaBeneficio2Title: "Sin barreras de idioma",
    cartaBeneficio2Desc:
      "La carta se adapta automáticamente a 5 idiomas. Turistas entienden la oferta completa.",
    cartaBeneficio2Tag: "↑ Satisfacción",
    cartaBeneficio3Title: "Cero comisiones",
    cartaBeneficio3Desc:
      "Los pedidos para recogido llegan directamente. Te ahorras entre el 25% y el 35%.",
    cartaBeneficio3Tag: "Ahorro real",
    cartaBeneficio4Title: "Tus clientes, tu base",
    cartaBeneficio4Desc:
      "Cada pedido online pasa a ser tuyo. Envías promociones cuando quieras.",
    cartaBeneficio4Tag: "Fidelización",
    cartaBeneficio5Title: "Pedidos por WhatsApp",
    cartaBeneficio5Desc:
      "Los pedidos llegan en tiempo real por WhatsApp, bien estructurados.",
    cartaBeneficio5Tag: "↓ Errores",
    cartaBeneficio6Title: "Presencia digital",
    cartaBeneficio6Desc:
      "Web SEO, Google Business, redes sociales. Apareces cuando te buscan.",
    cartaBeneficio6Tag: "↑ Visibilidad",
    cartaBeneficio7Title: "Gestión total",
    cartaBeneficio7Desc:
      "Añade, edita u oculta platos en segundos. Todo desde un panel intuitivo.",
    cartaBeneficio7Tag: "Autogestionable",

    cartaFlujoTitle: "El flujo",
    cartaFlujoSubtitle: "¿Cómo se ve?",
    cartaFlujoStep5Title: "Presencia Digital",
    cartaFlujoStep5Desc:
      "Tu carta visible en Google Business Profile. Atrae nuevos clientes con fotos impactantes.",
    cartaFlujoStep1Title: "Escanea el QR",
    cartaFlujoStep1Desc: "El cliente apunta la cámara al QR de la mesa.",
    cartaFlujoStep2Title: "Explora",
    cartaFlujoStep2Desc: "Ve cada plato con imágenes y precio.",
    cartaFlujoStep3Title: "Fidelización",
    cartaFlujoStep3Desc: "Recibe oferta a cambio de su email.",
    cartaFlujoStep4Title: "Pide",
    cartaFlujoStep4Desc: "Sin dudas, sin malentendidos.",

    // --- COMPARATIVA DINERO ---
    cartaDineroTitle: "El valor real",
    cartaDineroSubtitle: "Comisiones perdidas vs. Inversión en tu negocio",
    cartaDineroCalcDesc:
      "Deja de pagar comisiones a terceros y haz mailings con promociones para los días con menos gente. Tus clientes, tu contacto, tu dinero.",

    // Card 1: Pérdidas
    cartaDineroCard1Title: "Costes Ocultos y Comisiones",
    cartaDineroCard1Item1: "Comisiones a Terceros (Glovo, etc.)",
    cartaDineroCard1Item2: "Pérdida por Baja Visibilidad",
    cartaDineroCard1Item3: "Falta de Clientes Recurrentes",
    cartaDineroCard1Total: "Pérdida Neta Estimada",

    // Card 2: Ganancias
    cartaDineroCard2Title: "Inversión y Crecimiento",
    cartaDineroCard2Item1: "Ahorro en Comisiones",
    cartaDineroCard2Item2: "Nuevos Clientes (SEO/Google)",
    cartaDineroCard2Item3: "Fidelización (Mailings)",
    cartaDineroCard2Item4: "Aumento Ticket Medio",
    cartaDineroCard2Total: "Incremento Neto Estimado",

    cartaBBDDTitle: "Tu activo más valioso",
    cartaBBDDSubtitle: "La base de datos que trabaja sola",
    cartaBBDDDesc:
      "Cada cliente que entra en tu local o hace un pedido online es una oportunidad. Con esta herramienta, no se escapa ninguna.",
    cartaBBDDLabel1: "QR en mesa",
    cartaBBDDLabel2: "Take Away",
    cartaBBDDLabelTuBBDD: "TU BBDD",
    cartaBBDDData1: "Nombre",
    cartaBBDDData2: "Email",
    cartaBBDDData3: "Teléfono",
    cartaBBDDData4: "Historial",
    cartaBBDDAction1: "Email",
    cartaBBDDAction2: "Promo",
    cartaBBDDAction3: "Recuperar",

    cartaDemoTitle: "Demo del producto",
    cartaDemoVideoLabel: "▶ Así se ven tus platos en la carta digital",
    cartaDemoScreen1Title: "📱 Carta digital — QR en mesa",
    cartaDemoScreen1Label: "Vista del cliente",
    cartaDemoScreen2Title: "⚙️ Panel de gestión y estadísticas",
    cartaDemoScreen2Label: "Panel de administración",
    cartaDemoScreen3Title: "📧 Pedidos en tiempo real",
    cartaDemoScreen3Label: "Gestión de pedidos",

    cartaCTATitle: "El siguiente paso",
    cartaCTASubtitle: "Empieza a trabajar para ti.",
    cartaCTABtnDemo: "Demo gratuita",
    cartaCTABtnContact: "Habar con asesor",
    cartaCTANoContract: "✓ Sin permanencia",
    cartaCTASignup48h: "✓ Alta 48h",
    cartaCTASupport: "✓ Soporte",
    cartaCTANoComm: "✓ 0% comisiones",

    // Tap Review (NFC)
    tapReviewMetaTitle: "Tap-to-Review NFC - Multiplica tus reseñas en Google",
    tapReviewMetaDesc:
      "Dispositivos NFC para conseguir reseñas en Google de forma automática. Solo un toque y tus clientes te valoran con 5 estrellas.",
    tapReviewEyebrow: "TARJETAS NFC",
    tapReviewHeroTitle: "Multiplica las reseñas",
    tapReviewHeroAccent: "en Google de tu negocio",
    tapReviewHeroSubtitle:
      "Consigue más reseñas con los dispositivos Tap-to-Review y atrae más clientes. Chip NFC de alto rendimiento para reseñas en 5 segundos.",
    tapReviewHeroBtnContact: "Contactar ahora",
    tapReviewHeroBtnProduct: "Ver producto",
    tapReviewHeroFeature1: "Pago único - Sin suscripciones",
    tapReviewHeroFeature2: "Consigue reseñas en 5 segundos",
    tapReviewHeroFeature3: "Aparece el primero en Google Maps",

    tapReviewProductExhibitorWhite: "Expositor Blanco",
    tapReviewProductExhibitorWhiteAlt: "Expositor de reseñas blanco",
    tapReviewProductExhibitorBlack: "Expositor Negro",
    tapReviewProductExhibitorBlackAlt: "Expositor de reseñas negro",
    tapReviewProductStand: "Stand Exhibidor",
    tapReviewProductStandAlt: "Stand exhibidor Tap-to-Review",

    tapReviewStatsBusinesses: "Funcionando en +20,000 negocios",
    tapReviewStatsReviews: "reseñas conseguidas",
    tapReviewStatsDaily: "reseñas diarias",

    tapReviewHowTitle: "¿Cómo funciona?",
    tapReviewHowSubtitle:
      "Gracias a su Chip NFC de alto rendimiento, tus clientes acercan el móvil y se les abre la página de reseñas de tu negocio en Google.",
    tapReviewHowStep1Title: "Coloca el dispositivo",
    tapReviewHowStep1Desc:
      "Pon el expositor Tapstar en tu local, visible para tus clientes.",
    tapReviewHowStep2Title: "Cliente acerca el móvil",
    tapReviewHowStep2Desc:
      "El cliente acerca su teléfono al chip NFC. No necesita abrir apps ni escanear nada.",
    tapReviewHowStep3Title: "Reseña en 5 segundos",
    tapReviewHowStep3Desc:
      "Se abre directamente la página de reseñas de tu negocio en Google. El cliente solo tiene que tocar 5 estrellas.",

    tapReviewFeatTitle: "Ventajas Tap-to-Review",
    tapReviewFeatSubtitle:
      "Todo lo que necesitas para conseguir reseñas de forma automática",
    tapReviewFeatNFC: "NFC de Alto Rendimiento",
    tapReviewFeatNFCDesc:
      "Tecnología NFC de última generación que funciona con cualquier smartphone moderno.",
    tapReviewFeatSpeed: "Reseñas en 5 segundos",
    tapReviewFeatSpeedDesc:
      'El proceso es tan rápido que los clientes no tienen tiempo de decir "no".',
    tapReviewFeatGoogle: "Aparece primero en Google",
    tapReviewFeatGoogleDesc:
      "Más reseñas = mejor posicionamiento en Google Maps y búsquedas locales.",
    tapReviewFeatNoSub: "Sin suscripciones",
    tapReviewFeatNoSubDesc:
      "Pago único. Sin cuotas mensuales, sin permanencia, sin sorpresas.",

    tapReviewSocialTitle: "Miles de negocios confían en nosotros",
    tapReviewSocialSubtitle:
      "Negocios de hostelería en toda España ya están multiplicando sus reseñas",
    tapReviewTestimonial1Quote:
      "Pasamos de 50 a 500 reseñas en 3 meses. El impacto en nuevos clientes ha sido brutal.",
    tapReviewTestimonial1Author: "Carlos Martínez",
    tapReviewTestimonial1Business: "Restaurante El Bodegón",
    tapReviewTestimonial2Quote:
      "Mis clientes lo usan constantemente. Es facilísimo, solo tienen que acercar el teléfono.",
    tapReviewTestimonial2Author: "María López",
    tapReviewTestimonial2Business: "Café Central Madrid",
    tapReviewTestimonial3Quote:
      "La mejor inversión que hemos hecho. Las reseñas han mejorado nuestro posicionamiento en Google.",
    tapReviewTestimonial3Author: "Pedro Sánchez",
    tapReviewTestimonial3Business: "Bar La Tapa",

    tapReviewFAQTitle: "Preguntas frecuentes",
    tapReviewFAQ1Question: "¿Realmente funciona el NFC con cualquier móvil?",
    tapReviewFAQ1Answer:
      "Sí, el NFC funciona en la mayoría de smartphones modernos (iPhone 8 en adelante, y todos los Android con NFC). Los iPhone también permiten NFC sin abrir apps.",
    tapReviewFAQ2Question: "¿Cómo configuro el dispositivo para mi negocio?",
    tapReviewFAQ2Answer:
      "Nosotros nos encargamos de todo. Solo necesitas darnos el nombre de tu negocio y nosotros configuramos el chip NFC para que apunte a tu ficha de Google Business.",
    tapReviewFAQ3Question: "¿Qué pasa si el cliente no tiene NFC?",
    tapReviewFAQ3Answer:
      "El dispositivo también incluye un código QR que el cliente puede escanear con la cámara de su móvil. Así nadie se queda sin poder dejarte su reseña.",

    tapReviewCTATitle: "Empieza a conseguir reseñas hoy",
    tapReviewCTASubtitle:
      "Únete a los +20,000 negocios que ya están multiplicando sus reseñas en Google",
    tapReviewCTABtnPrimary: "Contactar ahora",
    tapReviewCTAFeature1: "Garantía 30 días",
    tapReviewCTAFeature2: "Envío gratis 24h",
    tapReviewCTAFeature3: "Sin suscripciones",

    tapReviewTrust30Days: "Garantía 30 días",
    tapReviewTrust24h: "Envío gratis 24h",
    tapReviewTrustSupport: "Soporte 24/7",
    tapReviewTrustNoSub: "Sin suscripciones",

    // QRIBAR
    qribarSector: "SECTOR HOSTELERÍA",
    qribarTitle: "Digitaliza la experiencia con",
    qribarSubtitle:
      "Soluciones específicas para restaurantes de alta gama. Menús digitales elegantes, rápidos y sin contacto que elevan la percepción de tu marca mientras optimizan el servicio.",
    qribarBenefit1: "Actualización de precios en tiempo real",
    qribarBenefit2: "Diseño adaptable a tu identidad visual",
    qribarBenefit3: "Aumenta la rotación de mesas",
    qribarBenefit4: "Integración con sistemas de pedidos y pagos",
    qribarButton: "Más información",
    qribarError: "Error al cargar el menú",
    qribarLoading: "Cargando menú...",

    // Digital Menu Landing

    // Menu QR Landing

    // Table Orders Landing

    // Digital Menu SEO

    // Menu QR SEO

    // Table Orders SEO

    // NFC Reviews Landing Page

    // n8n Automation Landing Page
    n8nAutomationSeoTitle: "Automatización n8n para Restaurantes en Canarias",
    n8nAutomationSeoDescription:
      "Automatiza tus procesos de restaurante con n8n. Conecta CRM, WhatsApp, Google Reviews y más para aumentar ventas y reducir tiempos.",
    n8nAutomationHeroTitle: "Automatización n8n para Restaurantes",
    n8nAutomationHeroSubtitle:
      "Flujos inteligentes que conectan CRM, WhatsApp, Google Reviews y más para aumentar ventas y reducir tiempos.",
    n8nAutomationHeroCta: "Quiero automatizar mi restaurante",

    // WhatsApp Automation Landing Page
    whatsappAutomationSeoTitle:
      "Automatización WhatsApp para Restaurantes Tenerife",
    whatsappAutomationSeoDescription:
      "Automatiza el soporte y pedidos por WhatsApp en tu restaurante. Respuestas automáticas, notificaciones y más.",
    whatsAppAutomationHeroTitle: "Automatización WhatsApp para Restaurantes",
    whatsAppAutomationHeroSubtitle:
      "Soporte y pedidos por WhatsApp automatizados para reducir tiempos y mejorar experiencia de cliente.",
    whatsAppAutomationHeroCta: "Quiero automatizar WhatsApp",
    // WhatsApp Automation — Stats & Benefits
    whatsAppAutomationStat1Label: "Atención continua",
    whatsAppAutomationStat2Label: "Tiempo de respuesta",
    whatsAppAutomationStat3Label: "Preguntas automatizables",
    whatsAppAutomationStat4Label: "Configuración",
    whatsAppAutomationBenefitsTitle:
      "¿Por qué automatizar el WhatsApp de tu restaurante?",
    whatsAppAutomationBenefitsSubtitle:
      "No pierdas más clientes por no responder a tiempo",
    whatsAppAutomationBenefit1Title: "Responde al instante, siempre",
    whatsAppAutomationBenefit1Desc:
      "Tus clientes reciben respuesta automática al segundo, incluso cuando estás cerrado, cocinando o atendiendo a otros clientes. Nunca más pierdas una reserva o consulta.",
    whatsAppAutomationBenefit2Title: "Ahorra horas de trabajo",
    whatsAppAutomationBenefit2Desc:
      "Deja de escribir las mismas respuestas una y otra vez. El bot responde automáticamente a las preguntas más frecuentes: horarios, menú, ubicación, reservas.",
    whatsAppAutomationBenefit3Title: "Parece humano, no robot",
    whatsAppAutomationBenefit3Desc:
      "Respuestas personalizadas con tu tono y estilo. El cliente no nota que habla con un bot. Y si necesita ayuda humana, se deriva automáticamente a tu equipo.",
    whatsAppAutomationBenefit4Title: "Convierte consultas en clientes",
    whatsAppAutomationBenefit4Desc:
      "Cada consulta de WhatsApp es una oportunidad de venta. Con respuestas rápidas y profesionales, conviertes más dudas en reservas y pedidos. Más clientes para tu restaurante.",
    whatsAppAutomationHowItWorksTitle:
      "Cómo activar tu WhatsApp automático en 3 pasos",
    whatsAppAutomationHowItWorksSubtitle:
      "Empieza a automatizar en menos de 24 horas",
    whatsAppAutomationStep1Title: "Conectamos tu WhatsApp",
    whatsAppAutomationStep1Desc:
      "Vinculamos tu número de WhatsApp Business con nuestra plataforma. Sin cambios en tu número actual, sin perder conversaciones.",
    whatsAppAutomationStep2Title: "Configuramos las respuestas",
    whatsAppAutomationStep2Desc:
      "Tú nos dices qué preguntas recibes más y cómo quieres responder. Creamos respuestas automáticas con tu tono y personalidad.",
    whatsAppAutomationStep3Title: "Empieza a recibir clientes",
    whatsAppAutomationStep3Desc:
      "El sistema responde automáticamente 24/7. Recibes informes semanales y ajustamos lo que necesites. Más clientes, menos trabajo.",
    whatsAppAutomationGeoCoverageTitle: "Disponible en toda Canarias",
    whatsAppAutomationGeoCoverageSubtitle:
      "Automatización de WhatsApp para restaurantes en cualquier isla",
    whatsAppAutomationServiceArea:
      "Configuración remota para toda Canarias. Soporte en Tenerife.",
    whatsAppAutomationInternalLinksTitle: "Más soluciones para tu restaurante",
    whatsAppAutomationInternalLink1Label: "Automatización n8n",
    whatsAppAutomationInternalLink1Desc: "Conecta todas tus herramientas",
    whatsAppAutomationInternalLink2Label: "NFC para reseñas Google",
    whatsAppAutomationInternalLink2Desc: "Multiplica reseñas automáticamente",
    whatsAppAutomationInternalLink3Label: "Carta digital QR",
    whatsAppAutomationInternalLink3Desc: "Menú digital interactivo",
    whatsAppAutomationInternalLink4Label: "Pedidos desde la mesa",
    whatsAppAutomationInternalLink4Desc: "Pide desde el móvil",
    whatsAppAutomationWhatsAppText: "Escríbenos ahora",
    // WhatsApp Automation — Testimonials & FAQs
    whatsAppAutomationTestimonialsTitle:
      "Lo que nuestros clientes en Canarias dicen",
    whatsAppAutomationTestimonial1Quote:
      "Desde que automatizamos el WhatsApp, respondemos al instante las 24 horas. Hemos recuperado clientes que antes se perdían porque nadie respondía.",
    whatsAppAutomationTestimonial1Name: "Laura Martínez",
    whatsAppAutomationTestimonial1Title:
      "Gerente, Restaurante El Mirador, Puerto de la Cruz",
    whatsAppAutomationTestimonial2Quote:
      "Configuramos respuestas automáticas para preguntas frecuentes: horarios, ubicación, menú. Los clientes reciben respuesta al segundo y nosotros ahorramos horas.",
    whatsAppAutomationTestimonial2Name: "Javier López",
    whatsAppAutomationTestimonial2Title:
      "Propietario, Café La Playa, Los Cristianos",
    whatsAppAutomationFaqsTitle: "Preguntas Frecuentes",
    whatsAppAutomationFaq1Question:
      "¿Cómo funciona la automatización de WhatsApp?",
    whatsAppAutomationFaq1Answer:
      "Conectamos tu WhatsApp Business con nuestras herramientas para que puedas responder preguntas frecuentes, enviar notificaciones de pedidos y dar seguimiento a clientes de forma automática. Todo configurado a medida para tu restaurante.",
    whatsAppAutomationFaq2Question:
      "¿Puedo personalizar las respuestas automáticas?",
    whatsAppAutomationFaq2Answer:
      "Sí, completamente. Tú decides qué respuestas automáticas quieres, en qué idioma, con qué tono y para qué preguntas. Puedes tener respuestas para horarios, menú del día, reservas, ubicación y más.",
    whatsAppAutomationFaq3Question:
      "¿El cliente nota que es un bot o parece humano?",
    whatsAppAutomationFaq3Answer:
      "Las respuestas están diseñadas para sonar naturales y cercanas. Puedes personalizar el tono: formal, informal, canario... Además, si la conversación se complica, el sistema deriva al cliente a un humano automáticamente.",
    whatsAppAutomationFaq4Question:
      "¿Funciona con mi número de WhatsApp actual?",
    whatsAppAutomationFaq4Answer:
      "Funciona con WhatsApp Business API. Si tienes un número normal de WhatsApp, podemos ayudarte a migrar a WhatsApp Business sin perder tus conversaciones. Es un proceso sencillo.",
    whatsAppAutomationFaq5Question: "¿Qué tipos de mensajes puedo automatizar?",
    whatsAppAutomationFaq5Answer:
      "Puedes automatizar: respuestas a preguntas frecuentes, confirmaciones de reserva, recordatorios de cita, notificaciones de pedido listo, mensajes de agradecimiento post-visita, ofertas especiales y mucho más.",
    whatsAppAutomationFaq6Question:
      "¿Cuánto cuesta la automatización de WhatsApp?",
    whatsAppAutomationFaq6Answer:
      "El coste depende del volumen de mensajes y la complejidad de las automatizaciones. Ofrecemos planes desde una cuota mensual baja. Solicita una demo y te preparamos un presupuesto sin compromiso para tu negocio en Tenerife.",
    whatsAppAutomationFaq7Question:
      "¿Esto sirve para aumentar ventas o solo para atención al cliente?",
    whatsAppAutomationFaq7Answer:
      "Para ambas. Puedes enviar ofertas personalizadas, recordar a clientes que vuelvan, recomendar platos del día y hasta gestionar pedidos por WhatsApp. Es una herramienta de ventas y atención a la vez.",
    // Software Canarias Landing Page
    softwareCanariasSeoTitle: "Software para Restaurantes en Canarias",
    softwareCanariasSeoDescription:
      "Soluciones digitales para restaurantes en Canarias. Menús digitales, pedidos por QR, automatización y más.",
    softwareCanariasHeroTitle: "Software para Restaurantes en Canarias",
    softwareCanariasHeroSubtitle:
      "Herramientas digitales para aumentar ventas y reducir tiempos en tu restaurante.",
    softwareCanariasHeroCta: "Quiero digitalizar mi restaurante",
    // Software Canarias — Stats & Benefits
    softwareCanariasStat1Label: "Restaurantes digitalizados",
    softwareCanariasStat2Label: "Implementación",
    softwareCanariasStat3Label: "Herramientas integradas",
    softwareCanariasStat4Label: "Comisiones",
    softwareCanariasBenefitsTitle:
      "Todo lo que necesitas para digitalizar tu restaurante",
    softwareCanariasBenefitsSubtitle:
      "Una suite completa de herramientas diseñadas para la hostelería canaria",
    softwareCanariasBenefit1Title: "Carta digital QR + Menú interactivo",
    softwareCanariasBenefit1Desc:
      "Tu carta en formato digital con fotos, precios y alérgenos. Los clientes la ven escaneando un QR. Sin apps, sin descargas, sin comisiones.",
    softwareCanariasBenefit2Title: "Automatización n8n + WhatsApp",
    softwareCanariasBenefit2Desc:
      "Conecta todas tus herramientas y automatiza procesos. Responder WhatsApp, gestionar reseñas, enviar emails... Todo funcionando solo.",
    softwareCanariasBenefit3Title: "Tarjetas NFC para reseñas Google",
    softwareCanariasBenefit3Desc:
      "Multiplica tus reseñas en Google con tarjetas NFC. Un toque y el cliente deja su opinión. Más reseñas = mejor posicionamiento en Google.",
    softwareCanariasBenefit4Title: "Hecho en Canarias para Canarias",
    softwareCanariasBenefit4Desc:
      "Somos un equipo local con presencia en Tenerife. Entendemos el mercado canario, sus necesidades y su idiosincrasia. Soporte presencial y cercano.",
    softwareCanariasHowItWorksTitle: "Cómo empezar con SmartConnect AI",
    softwareCanariasHowItWorksSubtitle: "De cero a digitalizado en 3 pasos",
    softwareCanariasStep1Title: "Elige tus herramientas",
    softwareCanariasStep1Desc:
      "Selecciona los servicios que necesitas: carta digital, NFC, automatización... Una herramienta o todas. Tú decides.",
    softwareCanariasStep2Title: "Lo configuramos todo",
    softwareCanariasStep2Desc:
      "Nuestro equipo configura todas las herramientas y las adapta a tu restaurante. En 24 horas tienes todo funcionando.",
    softwareCanariasStep3Title: "Disfruta de los resultados",
    softwareCanariasStep3Desc:
      "Más clientes, mejores reseñas, menos trabajo manual. Tu restaurante funciona mejor mientras tú te centras en lo que importa: dar de comer bien.",
    softwareCanariasGeoCoverageTitle: "Disponible en todas las Islas Canarias",
    softwareCanariasGeoCoverageSubtitle:
      "SmartConnect AI funciona para restaurantes en cualquier isla",
    softwareCanariasServiceArea:
      "Servicio en todo el archipiélago canario. Soporte presencial en Tenerife y remoto en el resto de islas.",
    softwareCanariasInternalLinksTitle: "Explora cada herramienta",
    softwareCanariasInternalLink1Label: "Carta digital QR",
    softwareCanariasInternalLink1Desc: "Tu menú en digital",
    softwareCanariasInternalLink2Label: "Tarjetas NFC reseñas",
    softwareCanariasInternalLink2Desc: "Multiplica reseñas Google",
    softwareCanariasInternalLink3Label: "Automatización n8n",
    softwareCanariasInternalLink3Desc: "Conecta todas tus herramientas",
    softwareCanariasInternalLink4Label: "WhatsApp Automático",
    softwareCanariasInternalLink4Desc: "Atención 24/7",
    softwareCanariasInternalLink5Label: "Menú sin app",
    softwareCanariasInternalLink5Desc: "Acceso directo al menú",
    softwareCanariasWhatsAppText: "Habla por WhatsApp",
    // Software Canarias — Testimonials & FAQs
    softwareCanariasTestimonialsTitle:
      "Lo que nuestros clientes en Canarias dicen",
    softwareCanariasTestimonial1Quote:
      "SmartConnect AI nos ha dado todas las herramientas para digitalizar el restaurante: carta QR, WhatsApp automatizado, reseñas NFC... Ahora todo funciona solo.",
    softwareCanariasTestimonial1Name: "Carlos García",
    softwareCanariasTestimonial1Title:
      "Propietario, Restaurante El Puerto, Santa Cruz",
    softwareCanariasTestimonial2Quote:
      "Todo en uno: menú digital, pedidos QR y automatización. Además, el soporte está en Tenerife, lo que marca la diferencia cuando necesitas ayuda.",
    softwareCanariasTestimonial2Name: "Ana Fernández",
    softwareCanariasTestimonial2Title: "Gerente, Café La Costa, La Laguna",
    softwareCanariasFaqsTitle: "Preguntas Frecuentes",
    softwareCanariasFaq1Question:
      "¿Qué incluye el software para restaurantes en Canarias?",
    softwareCanariasFaq1Answer:
      "SmartConnect AI es una suite completa: carta digital QR, menú interactivo, pedidos desde la mesa, tarjetas NFC para reseñas Google, automatización n8n y WhatsApp Business. Todo lo que necesita un restaurante moderno en Canarias.",
    softwareCanariasFaq2Question: "¿Es fácil de implementar?",
    softwareCanariasFaq2Answer:
      "Sí. La mayoría de herramientas se configuran en 24 horas. Nuestro equipo se encarga de todo: instalación, configuración y capacitación. No necesitas conocimientos técnicos.",
    softwareCanariasFaq3Question:
      "¿Puedo contratar servicios por separado o es obligatorio el pack completo?",
    softwareCanariasFaq3Answer:
      "Puedes contratar los servicios que necesites por separado: solo la carta digital, solo las tarjetas NFC, solo la automatización... Cada herramienta funciona de forma independiente. Eso sí, cuando las combinas, los resultados son mucho mejores.",
    softwareCanariasFaq4Question: "¿Hay soporte técnico en Canarias?",
    softwareCanariasFaq4Answer:
      "Sí, nuestro equipo está en Tenerife. Ofrecemos soporte presencial en la isla y soporte remoto para el resto de Canarias. Resolvemos incidencias en horas, no en días.",
    softwareCanariasFaq5Question:
      "¿Qué precio tiene el software para restaurantes?",
    softwareCanariasFaq5Answer:
      "Los precios empiezan desde una cuota mensual muy baja por herramienta. Ofrecemos packs con descuento si contratas varias. Sin permanencia, sin comisiones, sin sorpresas. Solicita una demo y te enviamos un presupuesto personalizado.",
    softwareCanariasFaq6Question:
      "¿Funciona para cualquier tipo de negocio hostelero?",
    softwareCanariasFaq6Answer:
      "Sí, nuestras herramientas funcionan para restaurantes, bares, cafeterías, guachinches, beach clubs, hoteles, food trucks y cualquier negocio de hostelería en Canarias.",

    // Digitalization Tenerife Landing Page
    digitalizationTenerifeSeoTitle: "Digitalización para Restaurantes Tenerife",
    digitalizationTenerifeSeoDescription:
      "Digitaliza tu restaurante en Tenerife con menús QR, pedidos por móvil y automatización.",
    digitalizationTenerifeHeroTitle:
      "Digitalización para Restaurantes Tenerife",
    digitalizationTenerifeHeroSubtitle:
      "Transforma tu restaurante con herramientas digitales para aumentar ventas y mejorar experiencia de cliente.",
    digitalizationTenerifeHeroCta: "Quiero digitalizar mi restaurante",
    // Digitalization Tenerife — Stats & Benefits
    digitalizationTenerifeStat1Label: "Negocios digitalizados en Tenerife",
    digitalizationTenerifeStat2Label: "Tu carta QR activa",
    digitalizationTenerifeStat3Label: "Aumento de ticket medio",
    digitalizationTenerifeStat4Label: "Comisiones",
    digitalizationTenerifeBenefitsTitle:
      "Digitaliza tu restaurante en Tenerife y nota la diferencia",
    digitalizationTenerifeBenefitsSubtitle:
      "Tecnología accesible para negocios locales canarios",
    digitalizationTenerifeBenefit1Title: "Carta digital y menú QR",
    digitalizationTenerifeBenefit1Desc:
      "Tu menú en formato digital, siempre actualizado, sin costes de impresión. Los clientes lo ven escaneando un QR desde su móvil. Sin apps, sin complicaciones.",
    digitalizationTenerifeBenefit2Title: "Automatización inteligente",
    digitalizationTenerifeBenefit2Desc:
      "Conecta tus herramientas y automatiza procesos: respuestas de WhatsApp, notificaciones de reseñas, emails de seguimiento. Ahorra tiempo y no pierdas oportunidades.",
    digitalizationTenerifeBenefit3Title: "Más reseñas en Google",
    digitalizationTenerifeBenefit3Desc:
      "Con nuestras tarjetas NFC, tus clientes dejan reseñas en Google con un solo toque. Más reseñas = mejor posicionamiento = más clientes.",
    digitalizationTenerifeBenefit4Title: "Hecho por y para Tenerife",
    digitalizationTenerifeBenefit4Desc:
      "Somos un equipo local. Entendemos el mercado canario, sus oportunidades y sus retos. Soporte presencial en toda la isla. Hablamos tu mismo idioma.",
    digitalizationTenerifeHowItWorksTitle: "Digitaliza tu negocio en 3 pasos",
    digitalizationTenerifeHowItWorksSubtitle:
      "De principio a fin, sin complicaciones",
    digitalizationTenerifeStep1Title: "Diagnóstico gratuito",
    digitalizationTenerifeStep1Desc:
      "Analizamos tu restaurante y te recomendamos las mejores herramientas digitales para tu caso concreto. Sin compromiso.",
    digitalizationTenerifeStep2Title: "Implementación exprés",
    digitalizationTenerifeStep2Desc:
      "En 24-48 horas tienes todo configurado y funcionando. Sin obras, sin instalaciones. Solo resultados.",
    digitalizationTenerifeStep3Title: "Resultados visibles",
    digitalizationTenerifeStep3Desc:
      "Más clientes, mejores reseñas, menos trabajo manual. Te ayudamos a medir el impacto de la digitalización en tu negocio.",
    digitalizationTenerifeGeoCoverageTitle:
      "Digitalización hostelera en toda Canarias",
    digitalizationTenerifeGeoCoverageSubtitle:
      "Especialistas en digitalización de restaurantes en Tenerife y Canarias",
    digitalizationTenerifeServiceArea:
      "Servicio en toda Canarias con presencia local en Tenerife.",
    digitalizationTenerifeInternalLinksTitle: "Todas nuestras soluciones",
    digitalizationTenerifeInternalLink1Label: "Carta digital QR",
    digitalizationTenerifeInternalLink1Desc: "Tu menú siempre actualizado",
    digitalizationTenerifeInternalLink2Label: "Menú QR interactivo",
    digitalizationTenerifeInternalLink2Desc: "Navegación visual del menú",
    digitalizationTenerifeInternalLink3Label: "Tarjetas NFC reseñas",
    digitalizationTenerifeInternalLink3Desc: "Multiplica reseñas Google",
    digitalizationTenerifeInternalLink4Label: "Automatización WhatsApp",
    digitalizationTenerifeInternalLink4Desc: "Atención 24/7 automática",
    digitalizationTenerifeInternalLink5Label: "Pedidos QR mesa",
    digitalizationTenerifeInternalLink5Desc: "Pide sin esperar",
    digitalizationTenerifeInternalLink6Label: "Software completo",
    digitalizationTenerifeInternalLink6Desc: "Suite de herramientas digitales",
    digitalizationTenerifeWhatsAppText: "Consulta por WhatsApp",
    // Digitalization Tenerife — Testimonials & FAQs
    digitalizationTenerifeTestimonialsTitle:
      "Lo que nuestros clientes en Canarias dicen",
    digitalizationTenerifeTestimonial1Quote:
      "Digitalizamos completamente el restaurante: carta QR, pedidos desde mesa, tarjetas NFC. Ahora todo es más eficiente y nuestros clientes están más contentos.",
    digitalizationTenerifeTestimonial1Name: "María López",
    digitalizationTenerifeTestimonial1Title:
      "Gerente, Restaurante El Mirador, Adeje",
    digitalizationTenerifeTestimonial2Quote:
      "Pasamos de tener 5 reseñas en Google a más de 60 en dos meses. La digitalización ha sido la mejor inversión para nuestro bar en La Laguna.",
    digitalizationTenerifeTestimonial2Name: "Javier García",
    digitalizationTenerifeTestimonial2Title:
      "Propietario, Café La Costa, La Laguna",
    digitalizationTenerifeFaqsTitle: "Preguntas Frecuentes",
    digitalizationTenerifeFaq1Question:
      "¿Qué significa digitalizar un restaurante en Tenerife?",
    digitalizationTenerifeFaq1Answer:
      "Digitalizar un restaurante es incorporar herramientas tecnológicas para mejorar la experiencia del cliente y la eficiencia del negocio. Incluye carta digital QR, pedidos desde el móvil, automatización de procesos, tarjetas NFC para reseñas Google y gestión digital de reservas y pedidos.",
    digitalizationTenerifeFaq2Question: "¿Es caro digitalizar un restaurante?",
    digitalizationTenerifeFaq2Answer:
      "No tiene por qué. Empezamos con cuotas mensuales muy asequibles y sin permanencia. El retorno de la inversión es rápido: más ticket medio, menos costes de impresión, más reseñas en Google y más clientes recurrentes.",
    digitalizationTenerifeFaq3Question:
      "¿Por qué es importante digitalizar la hostelería en Tenerife?",
    digitalizationTenerifeFaq3Answer:
      "Tenerife recibe millones de turistas al año que buscan experiencias rápidas y modernas. Un restaurante digitalizado atrae más clientes, aparece mejor en Google y ofrece una experiencia superior. Además, reduces costes y errores.",
    digitalizationTenerifeFaq4Question:
      "¿Cuánto tiempo se tarda en digitalizar un restaurante?",
    digitalizationTenerifeFaq4Answer:
      "Depende de las herramientas que elijas. Una carta digital se implanta en 24 horas. Un sistema completo con pedidos QR, NFC y automatización puede estar listo en 2-3 días. Todo sin obras ni instalaciones complejas.",
    digitalizationTenerifeFaq5Question:
      "¿Ofrecéis soporte presencial en Tenerife?",
    digitalizationTenerifeFaq5Answer:
      "Sí, tenemos equipo en Santa Cruz de Tenerife y damos soporte presencial en toda la isla. Para el resto de Canarias ofrecemos soporte remoto y visitas periódicas.",
    digitalizationTenerifeFaq6Question:
      "¿Qué tipos de negocio hostelero se benefician más de la digitalización?",
    digitalizationTenerifeFaq6Answer:
      "Todos. Restaurantes, bares, cafeterías, guachinches, beach clubs, hoteles, food trucks... Cualquier negocio que atienda clientes en mesa se beneficia de la digitalización: más eficiencia, más ventas y mejores reseñas.",
    digitalizationTenerifeFaq7Question:
      "¿Qué resultados puedo esperar después de digitalizar mi restaurante?",
    digitalizationTenerifeFaq7Answer:
      "Nuestros clientes en Tenerife reportan: aumento del 20-30% en ticket medio, reducción de errores en comandas, multiplicación de reseñas Google (5x o más), ahorro en impresión de cartas y mayor satisfacción del cliente.",

    // Menu Digital sin App Landing Page

    // Hero Additional Keys
    smartConnect: "SmartConnect",
    enterpriseAINode: "Enterprise AI Node",
    aiCore: "AI Core",
    processing: "Procesando...",
    uplinkStable: "Uplink Estable",
    nfcActive: "NFC Activo",

    // n8n Automation — Stats
    n8nAutomationStat1Label: "Eficiencia",
    n8nAutomationStat2Label: "Soporte 24/7",
    n8nAutomationStat3Label: "Integraciones",
    n8nAutomationStat4Label: "Tiempo Implantación",
    n8nAutomationBenefitsTitle: "Por qué Automatizar con n8n",
    n8nAutomationBenefitsSubtitle:
      "Optimiza las operaciones de tu restaurante con flujos de trabajo inteligentes",
    n8nAutomationBenefit1Title: "Ahorro de Tiempo",
    n8nAutomationBenefit1Desc:
      "Automatiza tareas repetitivas para liberar el tiempo de tu equipo en trabajo estratégico",
    n8nAutomationBenefit2Title: "Engagement del Cliente",
    n8nAutomationBenefit2Desc:
      "Crea experiencias personalizadas conectando todos los puntos de contacto con el cliente",
    n8nAutomationBenefit3Title: "Reducción de Errores",
    n8nAutomationBenefit3Desc:
      "Minimiza errores humanos en la entrada de datos y ejecución de procesos",
    n8nAutomationBenefit4Title: "Escalabilidad",
    n8nAutomationHowItWorksTitle: "Cómo Funciona",
    n8nAutomationHowItWorksSubtitle: "Te guiamos durante todo el proceso",
    n8nAutomationStep1Title: "Auditoría",
    n8nAutomationStep1Desc:
      "Analizamos tus procesos actuales e identificamos oportunidades de automatización",
    n8nAutomationStep2Title: "Diseño",
    n8nAutomationStep2Desc:
      "Diseñamos flujos de trabajo personalizados para tu negocio",
    n8nAutomationStep3Title: "Implementación",
    n8nAutomationStep3Desc:
      "Desplegamos las automatizaciones y formamos a tu equipo",
    n8nAutomationGeoCoverageTitle: "Cobertura Geográfica",
    n8nAutomationGeoCoverageSubtitle: "Dónde operamos",
    n8nAutomationServiceArea:
      "Tenerife, Gran Canaria, Lanzarote, Fuerteventura y toda Canarias",
    n8nAutomationInternalLinksTitle: "Descubre Más",
    n8nAutomationInternalLink1Label: "Carta Digital QRIBAR",
    n8nAutomationInternalLink1Desc: "Menú digital con pedidos desde la mesa",
    n8nAutomationWhatsAppText: "Escríbenos por WhatsApp",
    n8nAutomationBenefit4Desc:
      "A medida que crece tu negocio, las automatizaciones crecen contigo. Atiendes más clientes, gestionas más reseñas y procesas más pedidos sin necesidad de ampliar tu equipo.",
    n8nAutomationInternalLink2Label: "NFC para reseñas Google",
    n8nAutomationInternalLink2Desc: "Multiplica reseñas automáticamente",
    n8nAutomationInternalLink3Label: "Carta digital QR",
    n8nAutomationInternalLink3Desc: "Digitaliza tu menú",
    n8nAutomationInternalLink4Label: "Software restaurantes",
    n8nAutomationInternalLink4Desc: "Suite completa de herramientas",
    // n8n Automation — Testimonials & FAQs
    n8nAutomationTestimonialsTitle:
      "Lo que nuestros clientes en Canarias dicen",
    n8nAutomationTestimonial1Quote:
      "Automatizamos las notificaciones de nuevas reseñas, los mensajes de WhatsApp y las respuestas a clientes. Ahorramos horas cada semana.",
    n8nAutomationTestimonial1Name: "Carlos Ruiz",
    n8nAutomationTestimonial1Title: "Gerente, Restaurante El Rincón, Tenerife",
    n8nAutomationTestimonial2Quote:
      "Conectamos el CRM, el WhatsApp Business y las plantillas de email en un solo flujo. Ahora cada lead recibe seguimiento automático. Espectacular.",
    n8nAutomationTestimonial2Name: "Ana García",
    n8nAutomationTestimonial2Title: "Directora, Café Central, La Laguna",
    n8nAutomationFaqsTitle: "Preguntas Frecuentes",
    n8nAutomationFaq1Question: "¿Qué es n8n y cómo ayuda a mi restaurante?",
    n8nAutomationFaq1Answer:
      "n8n es una herramienta de automatización que conecta tus aplicaciones favoritas. Para tu restaurante, puede conectar CRM, WhatsApp, Google Reviews y más, reduciendo tiempos y mejorando la experiencia del cliente.",
    n8nAutomationFaq2Question:
      "¿Necesito conocimientos técnicos para configurarlo?",
    n8nAutomationFaq2Answer:
      "No. SmartConnect AI se encarga de la configuración. Solo necesitas indicarnos qué aplicaciones quieres conectar.",
    n8nAutomationFaq3Question:
      "¿Qué procesos puedo automatizar en mi restaurante?",
    n8nAutomationFaq3Answer:
      "Puedes automatizar la gestión de reseñas de Google, respuestas automáticas por WhatsApp, notificaciones de nuevos pedidos, seguimiento de leads, campañas de email marketing y la integración con tu CRM.",
    n8nAutomationFaq4Question: "¿Cuánto tiempo tarda la implementación?",
    n8nAutomationFaq4Answer:
      "La implementación de flujos básicos toma entre 2 y 3 días. Proyectos más complejos con múltiples integraciones pueden llevar hasta una semana.",
    n8nAutomationFaq5Question: "¿Se integra con mi sistema actual?",
    n8nAutomationFaq5Answer:
      "Sí, n8n se integra con cientos de aplicaciones y servicios. Trabajamos con tu stack tecnológico actual para crear flujos personalizados.",
    n8nAutomationFaq6Question:
      "¿Hay soporte técnico después de la implementación?",
    n8nAutomationFaq6Answer:
      "Sí, ofrecemos soporte técnico 24/7 para garantizar que tus automatizaciones funcionen sin interrupciones.",
  },
  en: {
    // Navigation
    navSolutions: "Solutions",
    navSuccess: "Success",
    navContact: "Contact",
    navAdmin: "Admin",
    navBack: "Back",

    // Hero
    heroEyebrow: "Digital revolution for local businesses",
    heroTitle: "Boost your business with",
    heroTitleAccent: "Artificial Intelligence",
    heroTitleEnd: "and automation",
    heroSubtitle:
      "Next-generation technology for restaurants in Tenerife and Canary Islands. Automate orders, increase revenue per table, reduce wait times, and retain customers with digital solutions that have no commissions or intermediaries.",
    heroButtonDemo: "View Demo",
    heroButtonContact: "Contact Us",

    // Features
    featuresTitle: "Our Solutions",
    featuresSubtitle:
      "Advanced tools designed for the digital era, from hardware to code.",
    featuresContent1:
      "At SmartConnect AI we combine artificial intelligence, automation, and smart hardware to transform how local businesses attract, retain, and build loyalty with customers. Our platform integrates QRIBAR digital menus with real-time ordering, NFC cards for instant Google reviews, and n8n automation workflows that connect every customer interaction.",
    featuresContent2:
      "With QRIBAR, your customers order from their phone by scanning a QR code at the table. Orders arrive directly to the bar and kitchen in real-time, eliminating wait times and increasing table turnover. No commissions, no intermediaries.",
    featuresContent3:
      "Our Tap-to-Review NFC cards let any customer leave a Google review with a single tap. More reviews mean better Google Maps positioning and more new customers. High-performance technology, no subscriptions, instant setup.",
    featuresContent4:
      "Imagine a workflow where every lead is captured, analyzed, and responded to automatically. With our n8n automations, we connect your CRM, email, WhatsApp, and social media in a single ecosystem. Each prospect interaction triggers chain actions: AI sentiment analysis, lead temperature scoring, and real-time notifications to your sales team.",
    featuresContent5:
      "QRIBAR is not just a digital menu — it's your new direct sales channel. Every table scans a QR code, explores dishes with professional photos and videos in 5 languages, and sends orders directly to the bar and kitchen. No commissions, no waiting, no intermediaries. Customer data is stored in your database for automated loyalty campaigns.",
    featuresContent6:
      "NFC Tap-to-Review cards turn every visit into a Google review. Place the display in your venue, customers tap their phone, and in 5 seconds the review page opens. More reviews = better local Google Maps ranking = more new customers. A virtuous cycle that multiplies your visibility without recurring ad spend.",
    featuresSoftwareIA: "Software & AI",
    featuresSoftwareIADesc:
      "Custom tool development that integrates perfectly with your existing systems. Tailored solutions powered by intelligent algorithms.",
    featuresAutomation: "Automation (n8n)",
    featuresAutomationDesc:
      "Orchestrate complex workflows effortlessly. Connect your favorite apps and automate repetitive tasks so your team can focus on innovation.",
    featuresNFC: "Tap-to-Review Cards",
    featuresNFCDesc:
      "Physical hardware with a digital soul. Elegant NFC cards that allow your customers to leave positive reviews instantly with a single tap.",
    featuresQribar: "QRIBAR",
    featuresQribarDesc:
      "Customers order from their phone at the table and the order arrives in real-time to the bar and kitchen. Eliminates waiter wait times and increases table turnover.",
    featuresCartaDigital: "Carta Digital Premium",
    featuresCartaDigitalDesc:
      "The digital menu that eliminates intermediaries. 0% commissions, 5 languages, WhatsApp orders and your own customer database.",
    featuresVisit: "Visit",
    featuresDetails: "View details",
    navbarAutomationN8n: "n8n Automation",
    navbarAutomationN8nDesc: "Automated workflows for hospitality",
    navbarWhatsAppAutomation: "WhatsApp Automation",
    navbarWhatsAppAutomationDesc: "Automated support and orders",
    navbarSoftwareCanarias: "Software for Canary Islands",
    navbarSoftwareCanariasDesc: "Digital solutions for restaurants",
    navbarDigitalizationTenerife: "Digitalization Tenerife",
    navbarDigitalizationTenerifeDesc: "Tools to modernize your business",

    // Success Stats
    successTitle: "Success Stories",
    successSubtitle: "Real results that transform businesses",
    successDesc:
      "Companies that already trust us and have transformed their operation.",
    successStat1Label: "Average Increase",
    successStat1Quote:
      "Since we implemented QRIBAR, our revenue per table increased by 45%",
    successStat1Author: "Restaurante L'Escale",
    successStat2Label: "Satisfaction",
    successStat2Quote:
      "My clients love the experience. Positive reviews skyrocketed",
    successStat2Author: "Café Central Madrid",
    successStat3Label: "Reviews Gained",
    successStat3Quote:
      "We went from 200 to 1200 Google reviews. The impact is incredible",
    successStat3Author: "Bar Bodega Toledo",
    successStat4Label: "Active Clients",
    successStat4Quote:
      "More than 850 businesses trust SmartConnect for their digital transformation",
    successStat4Author: "Hospitality Community",

    // SEO
    seoTitle:
      "SmartConnect AI: Digital Solutions for Restaurants in Tenerife and Canary Islands",
    seoDescription:
      "SmartConnect AI offers AI automation, n8n workflows, NFC cards for Google Reviews, and QRIBAR digital menus. Digitize your restaurant in Tenerife and Canary Islands to increase orders, reduce wait times, and maximize revenue per table. No commissions, no intermediaries.",
    seoProductDescription:
      "Growth platform for restaurants in Tenerife and Canary Islands with QRIBAR digital menus, QR ordering, NFC Tap-to-Review technology, and n8n automation. Designed to increase orders, reduce wait times, maximize revenue per table, and get more Google reviews. Ideal for bars, restaurants, and hospitality in Canary Islands.",
    seoAltTextNFC: "Tap-to-Review NFC card to get Google reviews",

    // Contact
    contactTitle: "Boost Your Business Today",
    contactSubtitle:
      "Let's talk? We're ready to audit your current process and show you how AI and automation can save you hundreds of hours monthly.",
    contactEmailTitle: "Direct Email",
    contactEmailDesc: "We respond in under 2 hours",
    contactEmailLoading: "Loading...",
    contactEmailError: "Not available",
    contactWhatsappTitle: "WhatsApp Business",
    contactWhatsappDesc: "Immediate technical support",
    contactLocationTitle: "Our Offices",
    contactFormName: "Full Name",
    contactFormCompany: "Company",
    contactFormEmail: "Email Address",
    contactFormService: "Service of Interest",
    contactFormMessage: "Message",
    contactFormSubmit: "Send Message",
    contactFormLoading: "Loading configuration...",
    contactFormSending: "Sending message...",
    contactSuccess: "Message sent! We will contact you in under 2 hours.",
    contactError:
      "Could not send. Please try again or contact us through another method.",
    contactPlaceholderName: "e.g. John Smith",
    contactPlaceholderCompany: "e.g. The Restaurant",
    contactPlaceholderEmail: "john@company.com",
    contactSelectOption: "Select an option",
    contactPlaceholderMessage: "Tell us briefly about your project...",
    contactFormNameRequired: "Name is required",
    contactFormCompanyRequired: "Company is required",
    contactFormEmailInvalid: "Email is not valid",
    contactFormServiceRequired: "Please select a service",
    contactFormMessageMinLength: "Message must be at least 10 characters",

    // Dashboard Preview
    dashboardTitle: "Real-Time Control",
    dashboardDesc:
      "Monitor your KPIs and business reputation from a single place.",
    dashboardPanelTitle: "Control Panel",
    dashboardLastUpdate: "Last updated: 2 min ago",
    dashboardSystemStatus: "System Online",
    dashboardTotalScans: "Total Scans",
    dashboardVsLastMonth: "↗ +12% vs last month",
    dashboardGoogleReviews: "Google Reviews",
    dashboardRatingExcellent: "Excellent",
    dashboardPlanPro: "Pro Plan",
    dashboardPlanActive: "Your subscription is active until Dec 2024.",
    dashboardManage: "Manage",
    dashboardLeadTemp: "Lead Temperature",
    dashboardLast7Days: "Last 7 days",
    dashboardRecentActivity: "Recent Activity",
    dashboardActivityScan: "NFC Scan User",
    dashboardActivityReview: "New 5★ Review",
    dashboardActivityWebhook: "Webhook Executed",

    // Footer
    footerTagline: "Next-generation technology for local businesses.",
    footerSocialTitle: "Follow Us",
    footerNavTitle: "Navigation",
    footerNavInicio: "Home",
    footerNavSoluciones: "Solutions",
    footerNavExito: "Success Stories",
    footerNavContacto: "Contact",
    footerLegalTitle: "Legal",
    footerLegalAviso: "Legal Notice",
    footerLegalPrivacidad: "Privacy Policy",
    footerLegalCookies: "Cookie Policy",
    footerCopyright: "© 2026 SmartConnect AI. All rights reserved.",

    // Navbar Solutions
    navbarNFC: "NFC Cards",
    navbarNFCDesc: "Instant reviews",
    navbarQribar: "QRIBAR",
    navbarQribarDesc: "Real-time orders to bar & kitchen",
    navbarCartaDigital: "Carta Digital Premium",
    navbarCartaDigitalDesc: "0% commissions, 5 languages",

    // Service options
    serviceCartaDigital: "Carta Digital Premium",
    serviceQribar: "QRIBAR - Real-time order to bar & kitchen",
    serviceAutomation: "Automation n8n",
    serviceNFC: "NFC Review Cards",
    serviceConsultoria: "AI Consulting",

    // Error Boundary
    errorBoundaryTitle: "Something went wrong",
    errorBoundaryMessage: "Please, reload the page.",
    errorBoundaryButton: "Reload",

    // Skip Link
    skipLink: "Skip to main content",

    // Carta Digital Page
    cartaHeroEyebrow: "Digital revolution for restaurants in Tenerife",
    cartaHeroTenerife:
      "Special for bars, restaurants and companies. On-site demos and personalized attention.",
    cartaHeroTitle1: "Your menu,",
    cartaHeroTitleAccent: "your business,",
    cartaHeroTitle2: "your customers.",
    cartaHeroSubtitle:
      "A self-managed digital menu that transforms your diners experience, eliminates intermediaries and turns every visit into a loyal customer.",
    cartaHeroButtonDemo: "See how it works",
    cartaHeroButtonCalc: "Calculate savings",
    cartaHeroStat1Label: "Languages",
    cartaHeroStat2Label: "Commissions",
    cartaHeroStat3Label: "Online orders",
    cartaHeroStat4Label: "Customers",

    cartaProblemaTitle: "How much money",
    cartaProblemaSubtitle: "are you losing today?",
    cartaProblemaDesc:
      "Most restaurants rely on outdated systems, expensive intermediaries and tools that don't belong to them. The result: reduced margins, anonymous customers and missed opportunities.",
    cartaProblemaItem1Title: "Bleeding commissions",
    cartaProblemaItem1Desc:
      "Glovo, Uber Eats and similar take between 25% and 35% of each order. You work, they take the margin.",
    cartaProblemaItem2Title: "Paper menu obsolete",
    cartaProblemaItem2Desc:
      "No photos, no clear descriptions, no languages. The customer doesn't know what to order and calls the waiter three times.",
    cartaProblemaItem3Title: "Unattended tourists",
    cartaProblemaItem3Desc:
      "The foreign customer doesn't understand the menu and orders the simplest thing. Lower average ticket guaranteed.",
    cartaProblemaItem4Title: "Lost calls",
    cartaProblemaItem4Desc:
      "Managing orders by phone while serving tables is impossible.",
    cartaProblemaItem5Title: "Anonymous customers",
    cartaProblemaItem5Desc:
      "Every customer who orders through Glovo, Uber Eats or similar platforms belongs to them, not yours. You don't have their contact and can't build loyalty.",
    cartaProblemaItem6Title: "Invisible online",
    cartaProblemaItem6Desc:
      "No own website optimized for search engines, you depend on third-party platforms.",

    cartaSolucionTitle: "The solution",
    cartaSolucionSubtitle: "One tool. All problems, solved.",
    cartaSolucionHighlight: "rich-media digital menu",
    cartaSolucionPrefix: "A ",
    cartaSolucionSuffix:
      " that works for you 24/7: in your venue, on Google, and on social media.",
    cartaSolucionDesc:
      "Your customers see dishes with photos, videos and descriptions in 5 languages by scanning the table QR. New customers find your menu on Google and order take away directly. You receive orders via WhatsApp, accumulate their contact in your database and fidelize them with promotions. No intermediaries. No commissions. Depending on no one.",

    cartaBeneficiosTitle: "7 benefits that",
    cartaBeneficiosSubtitle: "change your business",
    cartaBeneficio1Title: "Premium table experience",
    cartaBeneficio1Desc:
      "Each dish is presented with professional photos, videos and detailed descriptions. The customer knows exactly what to order.",
    cartaBeneficio1Tag: "↑ Average ticket",
    cartaBeneficio2Title: "No language barriers",
    cartaBeneficio2Desc:
      "The menu automatically adapts to 5 languages. Tourists understand the complete offer.",
    cartaBeneficio2Tag: "↑ Satisfaction",
    cartaBeneficio3Title: "Zero commissions",
    cartaBeneficio3Desc:
      "Pickup orders arrive directly. You save between 25% and 35%.",
    cartaBeneficio3Tag: "Real savings",
    cartaBeneficio4Title: "Your clients, your database",
    cartaBeneficio4Desc:
      "Every online order becomes yours. Send promotions whenever you want.",
    cartaBeneficio4Tag: "Fidelization",
    cartaBeneficio5Title: "Orders via WhatsApp",
    cartaBeneficio5Desc:
      "Orders arrive in real-time via WhatsApp, well structured.",
    cartaBeneficio5Tag: "↓ Errors",
    cartaBeneficio6Title: "Digital presence",
    cartaBeneficio6Desc:
      "SEO web, Google Business, social media. You appear when searched.",
    cartaBeneficio6Tag: "↑ Visibility",
    cartaBeneficio7Title: "Total management",
    cartaBeneficio7Desc:
      "Add, edit or hide dishes in seconds. Everything from an intuitive panel.",
    cartaBeneficio7Tag: "Self-manageable",

    cartaFlujoTitle: "The flow",
    cartaFlujoSubtitle: "How does it work?",
    cartaFlujoStep5Title: "Digital Presence",
    cartaFlujoStep5Desc:
      "Your menu visible on Google Business Profile. Attract new customers with stunning photos.",
    cartaFlujoStep1Title: "Instant Scan",
    cartaFlujoStep1Desc:
      "Customer points camera at the table QR or finds your menu on Google.",
    cartaFlujoStep2Title: "Multimedia Explore",
    cartaFlujoStep2Desc:
      "See dishes with photos, videos, and descriptions in 5 languages. Easy and fast.",
    cartaFlujoStep3Title: "In-Store Loyalty",
    cartaFlujoStep3Desc:
      "Email popup for promos and instant 5★ reviews. No orders at the table.",
    cartaFlujoStep4Title: "Take Away Online",
    cartaFlujoStep4Desc:
      'Activates "Cart Mode" from Google or Social Media. Orders for pickup.',

    // --- COMPARATIVE MONEY ---
    cartaDineroTitle: "The real value",
    cartaDineroSubtitle: "Lost commissions vs. Investment in your business",
    cartaDineroCalcDesc:
      "Stop paying third-party commissions and send mailings with promos on slow days. Your clients, your contact, your money.",

    // Card 1: Losses
    cartaDineroCard1Title: "Hidden Costs and Commissions",
    cartaDineroCard1Item1: "Third-party Commissions (Glovo, etc.)",
    cartaDineroCard1Item2: "Loss due to Low Visibility",
    cartaDineroCard1Item3: "Lack of Recurring Customers",
    cartaDineroCard1Total: "Estimated Net Loss",

    // Card 2: Gains
    cartaDineroCard2Title: "Investment and Growth",
    cartaDineroCard2Item1: "Savings on Commissions",
    cartaDineroCard2Item2: "New Customers (SEO/Google)",
    cartaDineroCard2Item3: "Loyalty (Mailings)",
    cartaDineroCard2Item4: "Increased Average Ticket",
    cartaDineroCard2Total: "Estimated Net Increase",

    cartaBBDDTitle: "Your most valuable asset",
    cartaBBDDSubtitle: "The database that works for you",
    cartaBBDDDesc:
      "Every customer who enters your establishment or places an online order is an opportunity. With this tool, none escape.",
    cartaBBDDLabel1: "Table QR",
    cartaBBDDLabel2: "Take Away",
    cartaBBDDLabelTuBBDD: "YOUR DB",
    cartaBBDDData1: "Name",
    cartaBBDDData2: "Email",
    cartaBBDDData3: "Phone",
    cartaBBDDData4: "History",
    cartaBBDDAction1: "Email",
    cartaBBDDAction2: "Promo",
    cartaBBDDAction3: "Recover",

    cartaDemoTitle: "Product Demo",
    cartaDemoVideoLabel: "▶ This is how your dishes look on the digital menu",
    cartaDemoScreen1Title: "📱 Digital menu — QR at table",
    cartaDemoScreen1Label: "Client view",
    cartaDemoScreen2Title: "⚙️ Management and statistics panel",
    cartaDemoScreen2Label: "Admin panel",
    cartaDemoScreen3Title: "📧 Real-time orders",
    cartaDemoScreen3Label: "Order management",

    cartaCTATitle: "The next step",
    cartaCTASubtitle: "Start working for yourself.",
    cartaCTABtnDemo: "Free demo",
    cartaCTABtnContact: "Talk to advisor",
    cartaCTANoContract: "✓ No contract",
    cartaCTASignup48h: "✓ Setup in 48h",
    cartaCTASupport: "✓ Support",
    cartaCTANoComm: "✓ 0% commissions",

    // Tap Review (NFC)
    tapReviewMetaTitle: "Tap-to-Review NFC - Multiply your Google reviews",
    tapReviewMetaDesc:
      "NFC devices to get reviews on Google automatically. One tap and your customers rate you with 5 stars.",
    tapReviewEyebrow: "NFC CARDS",
    tapReviewHeroTitle: "Multiply the reviews",
    tapReviewHeroAccent: "on Google for your business",
    tapReviewHeroSubtitle:
      "Get more reviews with Tap-to-Review devices and attract more customers. High-performance NFC chip for reviews in 5 seconds.",
    tapReviewHeroBtnContact: "Contact now",
    tapReviewHeroBtnProduct: "View product",
    tapReviewHeroFeature1: "One-time payment - No subscriptions",
    tapReviewHeroFeature2: "Get reviews in 5 seconds",
    tapReviewHeroFeature3: "Appear first on Google Maps",

    tapReviewProductExhibitorWhite: "White Exhibitor",
    tapReviewProductExhibitorWhiteAlt: "White reviews exhibitor",
    tapReviewProductExhibitorBlack: "Black Exhibitor",
    tapReviewProductExhibitorBlackAlt: "Black reviews exhibitor",
    tapReviewProductStand: "Display Stand",
    tapReviewProductStandAlt: "Tap-to-Review display stand",

    tapReviewStatsBusinesses: "Working in +20,000 businesses",
    tapReviewStatsReviews: "reviews obtained",
    tapReviewStatsDaily: "daily reviews",

    tapReviewHowTitle: "How does it work?",
    tapReviewHowSubtitle:
      "Thanks to its high-performance NFC chip, your customers bring their phone closer and the Google reviews page for your business opens.",
    tapReviewHowStep1Title: "Place the device",
    tapReviewHowStep1Desc:
      "Put the Tapstar exhibitor in your establishment, visible for your customers.",
    tapReviewHowStep2Title: "Customer brings phone closer",
    tapReviewHowStep2Desc:
      "The customer brings their phone to the NFC chip. No need to open apps or scan anything.",
    tapReviewHowStep3Title: "Review in 5 seconds",
    tapReviewHowStep3Desc:
      "Your business Google reviews page opens directly. The customer just has to tap 5 stars.",

    tapReviewFeatTitle: "Tap-to-Review Advantages",
    tapReviewFeatSubtitle: "Everything you need to get reviews automatically",
    tapReviewFeatNFC: "High-Performance NFC",
    tapReviewFeatNFCDesc:
      "Latest generation NFC technology that works with any modern smartphone.",
    tapReviewFeatSpeed: "Reviews in 5 seconds",
    tapReviewFeatSpeedDesc:
      'The process is so fast that customers don\'t have time to say "no".',
    tapReviewFeatGoogle: "Appear first on Google",
    tapReviewFeatGoogleDesc:
      "More reviews = better positioning on Google Maps and local searches.",
    tapReviewFeatNoSub: "No subscriptions",
    tapReviewFeatNoSubDesc:
      "One-time payment. No monthly fees, no commitment, no surprises.",

    tapReviewSocialTitle: "Thousands of businesses trust us",
    tapReviewSocialSubtitle:
      "Hospitality businesses across Spain are already multiplying their reviews",
    tapReviewTestimonial1Quote:
      "We went from 50 to 500 reviews in 3 months. The impact on new customers has been brutal.",
    tapReviewTestimonial1Author: "Carlos Martínez",
    tapReviewTestimonial1Business: "Restaurante El Bodegón",
    tapReviewTestimonial2Quote:
      "My customers use it constantly. It's super easy, they just have to bring their phone closer.",
    tapReviewTestimonial2Author: "María López",
    tapReviewTestimonial2Business: "Café Central Madrid",
    tapReviewTestimonial3Quote:
      "The best investment we've made. The reviews have improved our positioning on Google.",
    tapReviewTestimonial3Author: "Pedro Sánchez",
    tapReviewTestimonial3Business: "Bar La Tapa",

    tapReviewFAQTitle: "Frequently Asked Questions",
    tapReviewFAQ1Question: "Does NFC really work with any phone?",
    tapReviewFAQ1Answer:
      "Yes, NFC works on most modern smartphones (iPhone 8 and newer, and all Android phones with NFC). iPhones also allow NFC without opening apps.",
    tapReviewFAQ2Question: "How do I configure the device for my business?",
    tapReviewFAQ2Answer:
      "We take care of everything. You just need to give us your business name and we configure the NFC chip to point to your Google Business profile.",
    tapReviewFAQ3Question: "What if the customer doesn't have NFC?",
    tapReviewFAQ3Answer:
      "The device also includes a QR code that the customer can scan with their phone camera. So no one misses out on leaving you a review.",

    tapReviewCTATitle: "Start getting reviews today",
    tapReviewCTASubtitle:
      "Join the +20,000 businesses that are already multiplying their Google reviews",
    tapReviewCTABtnPrimary: "Contact now",
    tapReviewCTAFeature1: "30-day guarantee",
    tapReviewCTAFeature2: "Free 24h shipping",
    tapReviewCTAFeature3: "No subscriptions",

    tapReviewTrust30Days: "30-day guarantee",
    tapReviewTrust24h: "Free 24h shipping",
    tapReviewTrustSupport: "24/7 Support",
    tapReviewTrustNoSub: "No subscriptions",

    // QRIBAR
    qribarSector: "HOSPITALITY SECTOR",
    qribarTitle: "Digitalize the experience with",
    qribarSubtitle:
      "Specific solutions for high-end restaurants. Elegant, fast, contactless digital menus that elevate your brand perception while optimizing service.",
    qribarBenefit1: "Real-time price updates",
    qribarBenefit2: "Design adapted to your visual identity",
    qribarBenefit3: "Increases table turnover",
    qribarBenefit4: "Integration with order and payment systems",
    qribarButton: "More information",
    qribarError: "Error loading menu",
    qribarLoading: "Loading menu...",

    // Digital Menu Landing

    // Menu QR Landing

    // Table Orders Landing

    // Digital Menu SEO

    // Menu QR SEO

    // Table Orders SEO

    // NFC Reviews Landing Page

    // n8n Automation Landing Page
    n8nAutomationSeoTitle: "n8n Automation for Restaurants in Canary Islands",
    n8nAutomationSeoDescription:
      "Automate your restaurant processes with n8n. Connect CRM, WhatsApp, Google Reviews and more to increase sales and reduce times.",
    n8nAutomationHeroTitle: "n8n Automation for Restaurants",
    n8nAutomationHeroSubtitle:
      "Smart workflows connecting CRM, WhatsApp, Google Reviews and more to increase sales and reduce times.",
    n8nAutomationHeroCta: "I want to automate my restaurant",

    // WhatsApp Automation Landing Page
    whatsappAutomationSeoTitle:
      "WhatsApp Automation for Restaurants in Tenerife",
    whatsappAutomationSeoDescription:
      "Automate WhatsApp support and orders for your restaurant. Auto replies, notifications and more.",
    whatsAppAutomationHeroTitle: "WhatsApp Automation for Restaurants",
    whatsAppAutomationHeroSubtitle:
      "Automated WhatsApp support and orders to reduce response times and improve customer experience.",
    whatsAppAutomationHeroCta: "I want to automate WhatsApp",
    // WhatsApp Automation — Stats & Benefits
    whatsAppAutomationStat1Label: "Continuous support",
    whatsAppAutomationStat2Label: "Response time",
    whatsAppAutomationStat3Label: "Automatable questions",
    whatsAppAutomationStat4Label: "Setup",
    whatsAppAutomationBenefitsTitle: "Why automate your restaurant's WhatsApp?",
    whatsAppAutomationBenefitsSubtitle:
      "Don't lose more customers by not responding in time",
    whatsAppAutomationBenefit1Title: "Reply instantly, always",
    whatsAppAutomationBenefit1Desc:
      "Your customers get an automatic response in seconds, even when you're closed, cooking, or serving other customers. Never lose a reservation or inquiry again.",
    whatsAppAutomationBenefit2Title: "Save hours of work",
    whatsAppAutomationBenefit2Desc:
      "Stop writing the same answers over and over. The bot automatically answers the most frequent questions: hours, menu, location, reservations.",
    whatsAppAutomationBenefit3Title: "Looks human, not robot",
    whatsAppAutomationBenefit3Desc:
      "Personalized responses with your tone and style. The customer doesn't notice they're talking to a bot. And if they need human help, it's automatically transferred to your team.",
    whatsAppAutomationBenefit4Title: "Turn inquiries into customers",
    whatsAppAutomationBenefit4Desc:
      "Every WhatsApp inquiry is a sales opportunity. With fast and professional responses, you turn more doubts into reservations and orders. More customers for your restaurant.",
    whatsAppAutomationHowItWorksTitle:
      "How to activate your automatic WhatsApp in 3 steps",
    whatsAppAutomationHowItWorksSubtitle:
      "Start automating in less than 24 hours",
    whatsAppAutomationStep1Title: "We connect your WhatsApp",
    whatsAppAutomationStep1Desc:
      "We link your WhatsApp Business number to our platform. No changes to your current number, no lost conversations.",
    whatsAppAutomationStep2Title: "We configure the responses",
    whatsAppAutomationStep2Desc:
      "You tell us which questions you receive most and how you want to respond. We create automatic responses with your tone and personality.",
    whatsAppAutomationStep3Title: "Start receiving customers",
    whatsAppAutomationStep3Desc:
      "The system responds automatically 24/7. You receive weekly reports and we adjust as needed. More customers, less work.",
    whatsAppAutomationGeoCoverageTitle:
      "Available throughout the Canary Islands",
    whatsAppAutomationGeoCoverageSubtitle:
      "WhatsApp automation for restaurants on any island",
    whatsAppAutomationServiceArea:
      "Remote setup for all Canary Islands. Support in Tenerife.",
    whatsAppAutomationInternalLinksTitle: "More solutions for your restaurant",
    whatsAppAutomationInternalLink1Label: "n8n Automation",
    whatsAppAutomationInternalLink1Desc: "Connect all your tools",
    whatsAppAutomationInternalLink2Label: "NFC for Google Reviews",
    whatsAppAutomationInternalLink2Desc: "Multiply reviews automatically",
    whatsAppAutomationInternalLink3Label: "Digital QR Menu",
    whatsAppAutomationInternalLink3Desc: "Interactive digital menu",
    whatsAppAutomationInternalLink4Label: "Orders from the table",
    whatsAppAutomationInternalLink4Desc: "Order from your phone",
    whatsAppAutomationWhatsAppText: "Write us now",
    // WhatsApp Automation — Testimonials & FAQs
    whatsAppAutomationTestimonialsTitle:
      "What our clients in the Canary Islands say",
    whatsAppAutomationTestimonial1Quote:
      "Since we automated WhatsApp, we respond instantly 24 hours a day. We've recovered customers who used to be lost because no one answered.",
    whatsAppAutomationTestimonial1Name: "Laura Martínez",
    whatsAppAutomationTestimonial1Title:
      "Manager, Restaurante El Mirador, Puerto de la Cruz",
    whatsAppAutomationTestimonial2Quote:
      "We set up automatic replies for frequently asked questions: hours, location, menu. Customers get answers in seconds and we save hours.",
    whatsAppAutomationTestimonial2Name: "Javier López",
    whatsAppAutomationTestimonial2Title: "Owner, Café La Playa, Los Cristianos",
    whatsAppAutomationFaqsTitle: "Frequently Asked Questions",
    whatsAppAutomationFaq1Question: "How does WhatsApp automation work?",
    whatsAppAutomationFaq1Answer:
      "We connect your WhatsApp Business with our tools so you can automatically answer frequently asked questions, send order notifications, and follow up with customers. All customized for your restaurant.",
    whatsAppAutomationFaq2Question: "Can I customize the automatic replies?",
    whatsAppAutomationFaq2Answer:
      "Yes, completely. You decide which automatic replies you want, in which language, with what tone, and for which questions. You can have replies for hours, daily menu, reservations, location, and more.",
    whatsAppAutomationFaq3Question:
      "Does the customer notice it's a bot or does it seem human?",
    whatsAppAutomationFaq3Answer:
      "The replies are designed to sound natural and friendly. You can customize the tone: formal, informal, local... Plus, if the conversation gets complicated, the system automatically transfers the customer to a human.",
    whatsAppAutomationFaq4Question:
      "Does it work with my current WhatsApp number?",
    whatsAppAutomationFaq4Answer:
      "It works with WhatsApp Business API. If you have a regular WhatsApp number, we can help you migrate to WhatsApp Business without losing your conversations. It's a simple process.",
    whatsAppAutomationFaq5Question: "What types of messages can I automate?",
    whatsAppAutomationFaq5Answer:
      "You can automate: answers to frequently asked questions, reservation confirmations, appointment reminders, order-ready notifications, post-visit thank you messages, special offers, and much more.",
    whatsAppAutomationFaq6Question: "How much does WhatsApp automation cost?",
    whatsAppAutomationFaq6Answer:
      "The cost depends on the volume of messages and the complexity of the automations. We offer plans starting from a low monthly fee. Request a demo and we'll prepare a no-obligation quote for your Tenerife business.",
    whatsAppAutomationFaq7Question:
      "Is this for increasing sales or just customer service?",
    whatsAppAutomationFaq7Answer:
      "Both. You can send personalized offers, remind customers to come back, recommend daily specials, and even manage orders via WhatsApp. It's a sales and service tool at the same time.",

    // Software Canarias Landing Page
    softwareCanariasSeoTitle: "Software for Restaurants in Canary Islands",
    softwareCanariasSeoDescription:
      "Digital solutions for restaurants in the Canary Islands. Digital menus, QR ordering, automation and more.",
    softwareCanariasHeroTitle: "Software for Restaurants in Canary Islands",
    softwareCanariasHeroSubtitle:
      "Digital tools to increase sales and reduce times in your restaurant.",
    softwareCanariasHeroCta: "I want to digitize my restaurant",
    // Software Canarias — Stats & Benefits
    softwareCanariasStat1Label: "Digitized restaurants",
    softwareCanariasStat2Label: "Implementation",
    softwareCanariasStat3Label: "Integrated tools",
    softwareCanariasStat4Label: "Commissions",
    softwareCanariasBenefitsTitle:
      "Everything you need to digitize your restaurant",
    softwareCanariasBenefitsSubtitle:
      "A complete suite of tools designed for Canarian hospitality",
    softwareCanariasBenefit1Title: "Digital QR Menu + Interactive Menu",
    softwareCanariasBenefit1Desc:
      "Your menu in digital format with photos, prices and allergens. Customers view it by scanning a QR. No apps, no downloads, no commissions.",
    softwareCanariasBenefit2Title: "n8n + WhatsApp Automation",
    softwareCanariasBenefit2Desc:
      "Connect all your tools and automate processes. Answer WhatsApp, manage reviews, send emails... Everything running on its own.",
    softwareCanariasBenefit3Title: "NFC Cards for Google Reviews",
    softwareCanariasBenefit3Desc:
      "Multiply your Google reviews with NFC cards. One tap and the customer leaves their opinion. More reviews = better Google ranking.",
    softwareCanariasBenefit4Title:
      "Made in the Canary Islands for the Canary Islands",
    softwareCanariasBenefit4Desc:
      "We are a local team based in Tenerife. We understand the Canarian market, its needs and its uniqueness. In-person and close support.",
    softwareCanariasHowItWorksTitle: "How to get started with SmartConnect AI",
    softwareCanariasHowItWorksSubtitle: "From zero to digitized in 3 steps",
    softwareCanariasStep1Title: "Choose your tools",
    softwareCanariasStep1Desc:
      "Select the services you need: digital menu, NFC, automation... One tool or all. You decide.",
    softwareCanariasStep2Title: "We configure everything",
    softwareCanariasStep2Desc:
      "Our team configures all tools and adapts them to your restaurant. Everything up and running in 24 hours.",
    softwareCanariasStep3Title: "Enjoy the results",
    softwareCanariasStep3Desc:
      "More customers, better reviews, less manual work. Your restaurant runs better while you focus on what matters: serving great food.",
    softwareCanariasGeoCoverageTitle: "Available in all Canary Islands",
    softwareCanariasGeoCoverageSubtitle:
      "SmartConnect AI works for restaurants on any island",
    softwareCanariasServiceArea:
      "Service throughout the Canary Islands. In-person support in Tenerife and remote in the rest of the islands.",
    softwareCanariasInternalLinksTitle: "Explore each tool",
    softwareCanariasInternalLink1Label: "Digital QR Menu",
    softwareCanariasInternalLink1Desc: "Your menu in digital",
    softwareCanariasInternalLink2Label: "NFC Review Cards",
    softwareCanariasInternalLink2Desc: "Multiply Google reviews",
    softwareCanariasInternalLink3Label: "n8n Automation",
    softwareCanariasInternalLink3Desc: "Connect all your tools",
    softwareCanariasInternalLink4Label: "Automatic WhatsApp",
    softwareCanariasInternalLink4Desc: "24/7 Support",
    softwareCanariasInternalLink5Label: "Menu without app",
    softwareCanariasInternalLink5Desc: "Direct menu access",
    softwareCanariasWhatsAppText: "Chat on WhatsApp",
    // Software Canarias — Testimonials & FAQs
    softwareCanariasTestimonialsTitle:
      "What our clients in the Canary Islands say",
    softwareCanariasTestimonial1Quote:
      "SmartConnect AI has given us all the tools to digitize the restaurant: QR menu, automated WhatsApp, NFC reviews... Now everything runs on its own.",
    softwareCanariasTestimonial1Name: "Carlos García",
    softwareCanariasTestimonial1Title:
      "Owner, Restaurante El Puerto, Santa Cruz",
    softwareCanariasTestimonial2Quote:
      "All in one: digital menu, QR ordering and automation. Plus, the support is in Tenerife, which makes all the difference when you need help.",
    softwareCanariasTestimonial2Name: "Ana Fernández",
    softwareCanariasTestimonial2Title: "Manager, Café La Costa, La Laguna",
    softwareCanariasFaqsTitle: "Frequently Asked Questions",
    softwareCanariasFaq1Question:
      "What does the software for restaurants in the Canary Islands include?",
    softwareCanariasFaq1Answer:
      "SmartConnect AI is a complete suite: digital QR menu, interactive menu, table ordering, NFC cards for Google reviews, n8n automation and WhatsApp Business. Everything a modern restaurant in the Canary Islands needs.",
    softwareCanariasFaq2Question: "Is it easy to implement?",
    softwareCanariasFaq2Answer:
      "Yes. Most tools are set up within 24 hours. Our team handles everything: installation, configuration, and training. No technical knowledge needed.",
    softwareCanariasFaq3Question:
      "Can I hire services separately or is the full pack mandatory?",
    softwareCanariasFaq3Answer:
      "You can hire the services you need separately: just the digital menu, just the NFC cards, just the automation... Each tool works independently. That said, when you combine them, the results are much better.",
    softwareCanariasFaq4Question:
      "Is there technical support in the Canary Islands?",
    softwareCanariasFaq4Answer:
      "Yes, our team is in Tenerife. We offer in-person support on the island and remote support for the rest of the Canary Islands. We resolve issues in hours, not days.",
    softwareCanariasFaq5Question: "How much does the restaurant software cost?",
    softwareCanariasFaq5Answer:
      "Prices start from a very low monthly fee per tool. We offer discounted packs if you contract several. No minimum commitment, no commissions, no surprises. Request a demo and we'll send you a personalized quote.",
    softwareCanariasFaq6Question:
      "Does it work for any type of hospitality business?",
    softwareCanariasFaq6Answer:
      "Yes, our tools work for restaurants, bars, cafes, guachinches, beach clubs, hotels, food trucks, and any hospitality business in the Canary Islands.",

    // Digitalization Tenerife Landing Page
    digitalizationTenerifeSeoTitle:
      "Digitalization for Restaurants in Tenerife",
    digitalizationTenerifeSeoDescription:
      "Digitize your restaurant in Tenerife with QR menus, mobile ordering and automation.",
    digitalizationTenerifeHeroTitle:
      "Digitalization for Restaurants in Tenerife",
    digitalizationTenerifeHeroSubtitle:
      "Transform your restaurant with digital tools to increase sales and improve customer experience.",
    digitalizationTenerifeHeroCta: "I want to digitize my restaurant",
    // Digitalization Tenerife — Stats & Benefits
    digitalizationTenerifeStat1Label: "Digitized businesses in Tenerife",
    digitalizationTenerifeStat2Label: "Your QR menu active",
    digitalizationTenerifeStat3Label: "Average ticket increase",
    digitalizationTenerifeStat4Label: "Commissions",
    digitalizationTenerifeBenefitsTitle:
      "Digitize your restaurant in Tenerife and notice the difference",
    digitalizationTenerifeBenefitsSubtitle:
      "Accessible technology for local Canarian businesses",
    digitalizationTenerifeBenefit1Title: "Digital menu and QR Menu",
    digitalizationTenerifeBenefit1Desc:
      "Your menu in digital format, always updated, no printing costs. Customers view it by scanning a QR from their phone. No apps, no hassle.",
    digitalizationTenerifeBenefit2Title: "Smart automation",
    digitalizationTenerifeBenefit2Desc:
      "Connect your tools and automate processes: WhatsApp responses, review notifications, follow-up emails. Save time and don't miss opportunities.",
    digitalizationTenerifeBenefit3Title: "More Google reviews",
    digitalizationTenerifeBenefit3Desc:
      "With our NFC cards, your customers leave Google reviews with a single tap. More reviews = better positioning = more customers.",
    digitalizationTenerifeBenefit4Title: "Made by and for Tenerife",
    digitalizationTenerifeBenefit4Desc:
      "We are a local team. We understand the Canarian market, its opportunities and challenges. In-person support throughout the island. We speak your language.",
    digitalizationTenerifeHowItWorksTitle: "Digitize your business in 3 steps",
    digitalizationTenerifeHowItWorksSubtitle:
      "From start to finish, no complications",
    digitalizationTenerifeStep1Title: "Free diagnosis",
    digitalizationTenerifeStep1Desc:
      "We analyze your restaurant and recommend the best digital tools for your specific case. No obligation.",
    digitalizationTenerifeStep2Title: "Express implementation",
    digitalizationTenerifeStep2Desc:
      "In 24-48 hours everything is configured and running. No construction, no installations. Just results.",
    digitalizationTenerifeStep3Title: "Visible results",
    digitalizationTenerifeStep3Desc:
      "More customers, better reviews, less manual work. We help you measure the impact of digitization on your business.",
    digitalizationTenerifeGeoCoverageTitle:
      "Hospitality digitization throughout the Canary Islands",
    digitalizationTenerifeGeoCoverageSubtitle:
      "Specialists in restaurant digitization in Tenerife and the Canary Islands",
    digitalizationTenerifeServiceArea:
      "Service throughout the Canary Islands with local presence in Tenerife.",
    digitalizationTenerifeInternalLinksTitle: "All our solutions",
    digitalizationTenerifeInternalLink1Label: "Digital QR Menu",
    digitalizationTenerifeInternalLink1Desc: "Your menu always updated",
    digitalizationTenerifeInternalLink2Label: "Interactive QR Menu",
    digitalizationTenerifeInternalLink2Desc: "Visual menu navigation",
    digitalizationTenerifeInternalLink3Label: "NFC Review Cards",
    digitalizationTenerifeInternalLink3Desc: "Multiply Google reviews",
    digitalizationTenerifeInternalLink4Label: "WhatsApp Automation",
    digitalizationTenerifeInternalLink4Desc: "Automatic 24/7 support",
    digitalizationTenerifeInternalLink5Label: "QR Table Orders",
    digitalizationTenerifeInternalLink5Desc: "Order without waiting",
    digitalizationTenerifeInternalLink6Label: "Complete software",
    digitalizationTenerifeInternalLink6Desc: "Suite of digital tools",
    digitalizationTenerifeWhatsAppText: "Inquire via WhatsApp",
    // Digitalization Tenerife — Testimonials & FAQs
    digitalizationTenerifeTestimonialsTitle:
      "What our clients in the Canary Islands say",
    digitalizationTenerifeTestimonial1Quote:
      "We completely digitized the restaurant: QR menu, table ordering, NFC cards. Now everything is more efficient and our customers are happier.",
    digitalizationTenerifeTestimonial1Name: "María López",
    digitalizationTenerifeTestimonial1Title:
      "Manager, Restaurante El Mirador, Adeje",
    digitalizationTenerifeTestimonial2Quote:
      "We went from having 5 Google reviews to over 60 in two months. Digitization has been the best investment for our bar in La Laguna.",
    digitalizationTenerifeTestimonial2Name: "Javier García",
    digitalizationTenerifeTestimonial2Title: "Owner, Café La Costa, La Laguna",
    digitalizationTenerifeFaqsTitle: "Frequently Asked Questions",
    digitalizationTenerifeFaq1Question:
      "What does digitizing a restaurant in Tenerife mean?",
    digitalizationTenerifeFaq1Answer:
      "Digitizing a restaurant means incorporating technological tools to improve the customer experience and business efficiency. It includes digital QR menu, mobile ordering, process automation, NFC cards for Google reviews, and digital management of reservations and orders.",
    digitalizationTenerifeFaq2Question:
      "Is it expensive to digitize a restaurant?",
    digitalizationTenerifeFaq2Answer:
      "It doesn't have to be. We start with very affordable monthly fees and no minimum commitment. The return on investment is quick: higher average ticket, lower printing costs, more Google reviews, and more repeat customers.",
    digitalizationTenerifeFaq3Question:
      "Why is digitizing hospitality important in Tenerife?",
    digitalizationTenerifeFaq3Answer:
      "Tenerife receives millions of tourists each year who look for fast and modern experiences. A digitized restaurant attracts more customers, ranks better on Google, and offers a superior experience. Plus, you reduce costs and errors.",
    digitalizationTenerifeFaq4Question:
      "How long does it take to digitize a restaurant?",
    digitalizationTenerifeFaq4Answer:
      "It depends on the tools you choose. A digital menu is set up in 24 hours. A complete system with QR ordering, NFC and automation can be ready in 2-3 days. All without construction or complex installations.",
    digitalizationTenerifeFaq5Question:
      "Do you offer in-person support in Tenerife?",
    digitalizationTenerifeFaq5Answer:
      "Yes, we have a team in Santa Cruz de Tenerife and provide in-person support across the entire island. For the rest of the Canary Islands we offer remote support and periodic visits.",
    digitalizationTenerifeFaq6Question:
      "What types of hospitality businesses benefit most from digitization?",
    digitalizationTenerifeFaq6Answer:
      "All of them. Restaurants, bars, cafes, guachinches, beach clubs, hotels, food trucks... Any business that serves customers at tables benefits from digitization: more efficiency, more sales, and better reviews.",
    digitalizationTenerifeFaq7Question:
      "What results can I expect after digitizing my restaurant?",
    digitalizationTenerifeFaq7Answer:
      "Our clients in Tenerife report: 20-30% increase in average ticket, reduction in order errors, multiplication of Google reviews (5x or more), savings on menu printing, and higher customer satisfaction.",

    // Menu Digital sin App Landing Page

    // Hero Additional Keys
    smartConnect: "SmartConnect",
    enterpriseAINode: "Enterprise AI Node",
    aiCore: "AI Core",
    processing: "Processing...",
    uplinkStable: "Uplink Stable",
    nfcActive: "NFC Active",

    // n8n Automation — Stats
    n8nAutomationStat1Label: "Efficiency",
    n8nAutomationStat2Label: "24/7 Support",
    n8nAutomationStat3Label: "Integrations",
    n8nAutomationStat4Label: "Implementation Time",
    n8nAutomationBenefitsTitle: "Why Automate with n8n",
    n8nAutomationBenefitsSubtitle:
      "Streamline your restaurant operations with intelligent workflows",
    n8nAutomationBenefit1Title: "Time Savings",
    n8nAutomationBenefit1Desc:
      "Automate repetitive tasks to free up your team's time for more strategic work",
    n8nAutomationBenefit2Title: "Customer Engagement",
    n8nAutomationBenefit2Desc:
      "Create personalized experiences by connecting all customer touchpoints",
    n8nAutomationBenefit3Title: "Error Reduction",
    n8nAutomationBenefit3Desc:
      "Minimize human errors in data entry and process execution",
    n8nAutomationBenefit4Title: "Scalability",
    n8nAutomationHowItWorksTitle: "How It Works",
    n8nAutomationHowItWorksSubtitle: "We guide you through the entire process",
    n8nAutomationStep1Title: "Audit",
    n8nAutomationStep1Desc:
      "We analyze your current processes and identify automation opportunities",
    n8nAutomationStep2Title: "Design",
    n8nAutomationStep2Desc:
      "We design custom workflows tailored to your business",
    n8nAutomationStep3Title: "Implementation",
    n8nAutomationStep3Desc: "We deploy the automations and train your team",
    n8nAutomationGeoCoverageTitle: "Geographic Coverage",
    n8nAutomationGeoCoverageSubtitle: "Where we operate",
    n8nAutomationServiceArea:
      "Tenerife, Gran Canaria, Lanzarote, Fuerteventura and all Canary Islands",
    n8nAutomationInternalLinksTitle: "Discover More",
    n8nAutomationInternalLink1Label: "QRIBAR Digital Menu",
    n8nAutomationInternalLink1Desc: "Digital menu with table ordering",
    n8nAutomationWhatsAppText: "Write us on WhatsApp",
    n8nAutomationBenefit4Desc:
      "As your business grows, automations grow with you. You serve more customers, manage more reviews and process more orders without needing to expand your team.",
    n8nAutomationInternalLink2Label: "NFC for Google Reviews",
    n8nAutomationInternalLink2Desc: "Multiply reviews automatically",
    n8nAutomationInternalLink3Label: "Digital QR Menu",
    n8nAutomationInternalLink3Desc: "Digitize your menu",
    n8nAutomationInternalLink4Label: "Restaurant software",
    n8nAutomationInternalLink4Desc: "Complete tool suite",
    // n8n Automation — Testimonials & FAQs
    n8nAutomationTestimonialsTitle:
      "What our clients in the Canary Islands say",
    n8nAutomationTestimonial1Quote:
      "We automated notifications for new reviews, WhatsApp messages, and customer responses. We save hours every week.",
    n8nAutomationTestimonial1Name: "Carlos Ruiz",
    n8nAutomationTestimonial1Title: "Manager, Restaurante El Rincón, Tenerife",
    n8nAutomationTestimonial2Quote:
      "We connected CRM, WhatsApp Business, and email templates in a single flow. Now every lead gets automatic follow-up. Spectacular.",
    n8nAutomationTestimonial2Name: "Ana García",
    n8nAutomationTestimonial2Title: "Director, Café Central, La Laguna",
    n8nAutomationFaqsTitle: "Frequently Asked Questions",
    n8nAutomationFaq1Question:
      "What is n8n and how does it help my restaurant?",
    n8nAutomationFaq1Answer:
      "n8n is an automation tool that connects your favorite applications. For your restaurant, it can connect CRM, WhatsApp, Google Reviews, and more, reducing times and improving the customer experience.",
    n8nAutomationFaq2Question: "Do I need technical knowledge to set it up?",
    n8nAutomationFaq2Answer:
      "No. SmartConnect AI handles the setup. You just need to tell us which applications you want to connect.",
    n8nAutomationFaq3Question:
      "What processes can I automate in my restaurant?",
    n8nAutomationFaq3Answer:
      "You can automate Google review management, automatic WhatsApp replies, new order notifications, lead follow-up, email marketing campaigns, and integration with your CRM.",
    n8nAutomationFaq4Question: "How long does implementation take?",
    n8nAutomationFaq4Answer:
      "Basic flow implementation takes between 2 and 3 days. More complex projects with multiple integrations can take up to a week.",
    n8nAutomationFaq5Question: "Does it integrate with my current system?",
    n8nAutomationFaq5Answer:
      "Yes, n8n integrates with hundreds of applications and services. We work with your current tech stack to create custom workflows.",
    n8nAutomationFaq6Question:
      "Is there technical support after implementation?",
    n8nAutomationFaq6Answer:
      "Yes, we offer 24/7 technical support to ensure your automations run without interruptions.",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Always init as "es" (same on SSR and client) to prevent hydration mismatch.
  // Post-hydration, restore saved preference via useEffect.
  const [language, setLanguage] = useState<Language>("es");

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  // Post-hydration: restore saved language preference and update html lang
  useEffect(() => {
    const saved = localStorage.getItem("language");
    const lang = saved === "es" || saved === "en" ? saved : "es";
    setLanguage(lang);
    document.documentElement.lang = lang;
  }, []);

  const value: LanguageContextValue = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t: translations[language],
    }),
    [language, handleSetLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export type { Language, Translation };
