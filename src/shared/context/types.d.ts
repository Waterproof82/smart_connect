import { Translation as BaseTranslation } from "./LanguageContext";

declare module "./LanguageContext" {
  interface Translation extends BaseTranslation {
    // Navbar Solutions
    navbarNFCReview: string;
    navbarNFCReviewDesc: string;
    navbarAutomationN8n: string;
    navbarAutomationN8nDesc: string;
    navbarWhatsAppAutomation: string;
    navbarWhatsAppAutomationDesc: string;
    navbarSoftwareCanarias: string;
    navbarSoftwareCanariasDesc: string;
    navbarDigitalizationTenerife: string;
    navbarDigitalizationTenerifeDesc: string;
    navbarMenuDigitalSinApp: string;
    navbarMenuDigitalSinAppDesc: string;

    // NFC Reviews
    nfcReviewsSeoTitle: string;
    nfcReviewsSeoDescription: string;
    nfcReviewsHeroTitle: string;
    nfcReviewsHeroSubtitle: string;
    nfcReviewsHeroCta: string;

    // n8n Automation
    n8nAutomationSeoTitle: string;
    n8nAutomationSeoDescription: string;
    n8nAutomationHeroTitle: string;
    n8nAutomationHeroSubtitle: string;
    n8nAutomationHeroCta: string;

    // WhatsApp Automation
    whatsappAutomationSeoTitle: string;
    whatsappAutomationSeoDescription: string;
    whatsAppAutomationHeroTitle: string;
    whatsAppAutomationHeroSubtitle: string;
    whatsAppAutomationHeroCta: string;

    // Software Canarias
    softwareCanariasSeoTitle: string;
    softwareCanariasSeoDescription: string;
    softwareCanariasHeroTitle: string;
    softwareCanariasHeroSubtitle: string;
    softwareCanariasHeroCta: string;

    // Digitalization Tenerife
    digitalizationTenerifeSeoTitle: string;
    digitalizationTenerifeSeoDescription: string;
    digitalizationTenerifeHeroTitle: string;
    digitalizationTenerifeHeroSubtitle: string;
    digitalizationTenerifeHeroCta: string;

    // Menu Digital sin App
    menuDigitalSinAppSeoTitle: string;
    menuDigitalSinAppSeoDescription: string;
    menuDigitalSinAppHeroTitle: string;
    menuDigitalSinAppHeroSubtitle: string;
    menuDigitalSinAppHeroCta: string;
  }
}
