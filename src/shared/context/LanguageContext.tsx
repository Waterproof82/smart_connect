import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import {
  TpvModuleTranslations,
  tpvModuleEs,
  tpvModuleEn,
} from "@shared/i18n/modules";

type Language = "es" | "en";

interface Translation extends TpvModuleTranslations {
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
  heroServiciosTitle: string;
  heroServiciosTitleAccent: string;
  heroServiciosTitleEnd: string;
  heroContactoTitle: string;
  heroContactoTitleAccent: string;
  heroContactoTitleEnd: string;
  heroSubtitle: string;
  // Home — "por qué" stat strip (PR4: moved from hardcoded array to i18n)
  statStrip1Value: string;
  statStrip1Label: string;
  statStrip2Value: string;
  statStrip2Label: string;
  statStrip3Value: string;
  statStrip3Label: string;
  statStrip4Value: string;
  statStrip4Label: string;
  heroButtonDemo: string;
  heroButtonContact: string;
  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  featuresContent1: string;
  featuresContent1Title: string;
  featuresContent2: string;
  featuresContent2Title: string;
  featuresContent3: string;
  featuresContent3Title: string;
  featuresContent4: string;
  featuresContent4Title: string;
  featuresContent5: string;
  featuresContent5Title: string;
  featuresContent6: string;
  featuresContent6Title: string;
  featuresNFC: string;
  featuresNFCDesc: string;
  featuresCartaDigital: string;
  featuresCartaDigitalDesc: string;
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
  navbarCartaDigital: string;
  navbarCartaDigitalDesc: string;
  // Service options
  serviceCartaDigital: string;
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
  // Digital Menu Landing
  // Menu QR Landing
  // Table Orders Landing
  // Digital Menu SEO
  // Menu QR SEO
  // Table Orders SEO
  // NFC Reviews Landing Page
  // n8n Automation Landing Page
  brandName: string;
  enterpriseAINode: string;
  aiCore: string;
  processing: string;
  uplinkStable: string;
  nfcActive: string;
  // n8n Automation — Stats & Benefits
  legalAvisoTitle: string;
  legalAvisoDescription: string;
  legalAvisoBackLink: string;
  // --- /legal/aviso — section bodies (LSSI-CE art. 10) ---
  legalAvisoSection1Title: string;
  legalAvisoSection1Content: string;
  legalAvisoSection2Title: string;
  legalAvisoSection2Content: string;
  legalAvisoSection3Title: string;
  legalAvisoSection3Content: string;
  legalAvisoSection4Title: string;
  legalAvisoSection4Content: string;
  legalAvisoSection5Title: string;
  legalAvisoSection5Content: string;
  legalAvisoSection6Title: string;
  legalAvisoSection6Content: string;
  legalPrivacidadTitle: string;
  legalPrivacidadDescription: string;
  legalPrivacidadBackLink: string;
  legalPrivacidadUpdated: string;
  legalCookiesTitle: string;
  legalCookiesDescription: string;
  legalCookiesBackLink: string;
  legalCookiesUpdated: string;
  legalCookiesSection1Title: string;
  legalCookiesSection1Content: string;
  legalCookiesSection2Title: string;
  legalCookiesSection2Content: string;
  legalCookiesSection3Title: string;
  legalCookiesSection3Content: string;
  legalCookiesSection4Title: string;
  legalCookiesSection4Content: string;
  legalCookiesSection5Title: string;
  legalCookiesSection5Content: string;
  // Cookie consent banner
  cookieBannerTitle: string;
  cookieBannerBody: string;
  cookieBannerAccept: string;
  cookieBannerReject: string;
  cookieBannerPolicy: string;
  cookieReopenerLabel: string;
  // Home FAQ
  homeFaqTitle: string;
  homeFaqQ1: string;
  homeFaqA1: string;
  homeFaqQ2: string;
  homeFaqA2: string;
  homeFaqQ3: string;
  homeFaqA3: string;
  homeFaqQ4: string;
  homeFaqA4: string;
  homeFaqQ5: string;
  homeFaqA5: string;
  homeFaqQ6: string;
  homeFaqA6: string;
  // CartaDigital FAQ & HowTo
  cartaFaqTitle: string;
  cartaFaqQ1: string;
  cartaFaqA1: string;
  cartaFaqQ2: string;
  cartaFaqA2: string;
  cartaFaqQ3: string;
  cartaFaqA3: string;
  cartaFaqQ4: string;
  cartaFaqA4: string;
  cartaFaqQ5: string;
  cartaFaqA5: string;
  cartaComparTitle: string;
  cartaComparSubtitle: string;
  cartaComparHeaderCriterio: string;
  cartaComparHeaderPlataforma: string;
  cartaComparHeaderPapel: string;
  cartaComparHeaderOtras: string;
  cartaComparRow1Label: string;
  cartaComparRow1Plataforma: string;
  cartaComparRow1Papel: string;
  cartaComparRow1Otras: string;
  cartaComparRow2Label: string;
  cartaComparRow2Plataforma: string;
  cartaComparRow2Papel: string;
  cartaComparRow2Otras: string;
  cartaComparRow3Label: string;
  cartaComparRow3Plataforma: string;
  cartaComparRow3Papel: string;
  cartaComparRow3Otras: string;
  cartaComparRow4Label: string;
  cartaComparRow4Plataforma: string;
  cartaComparRow4Papel: string;
  cartaComparRow4Otras: string;
  cartaComparRow5Label: string;
  cartaComparRow5Plataforma: string;
  cartaComparRow5Papel: string;
  cartaComparRow5Otras: string;
  // Carta Digital — SEO / JSON-LD
  cartaDineroGrowthLabel: string;
  // Carta Digital — Solucion pills
  cartaSolucionPill1: string;
  cartaSolucionPill2: string;
  cartaSolucionPill3: string;
  cartaSolucionPill4: string;
  cartaSolucionPill5: string;
  cartaSolucionPill6: string;
  cartaSolucionPill7: string;
  cartaSolucionPill8: string;
  cartaSolucionPill9: string;
  // Carta Digital — Telegram section
  cartaTelegramTitle: string;
  cartaTelegramSubtitle: string;
  cartaTelegramFeature1Title: string;
  cartaTelegramFeature1Desc: string;
  cartaTelegramFeature2Title: string;
  cartaTelegramFeature2Desc: string;
  cartaTelegramFeature3Title: string;
  cartaTelegramFeature3Desc: string;
  cartaTelegramFeature4Title: string;
  cartaTelegramFeature4Desc: string;
  // Carta Digital — Modos section
  cartaModosTitle: string;
  cartaModosSubtitle: string;
  cartaModoRestauranteTitle: string;
  cartaModoRestauranteDesc: string;
  cartaModoRestauranteFeature1: string;
  cartaModoRestauranteFeature2: string;
  cartaModoTiendaTitle: string;
  cartaModoTiendaDesc: string;
  cartaModoTiendaFeature1: string;
  cartaModoTiendaFeature2: string;
  // Carta Digital — Antidesperdicio section
  cartaAntidesperdicioTitle: string;
  cartaAntidesperdicioSubtitle: string;
  cartaAntidesperdicioDesc: string;
  cartaAntidesperdicioFeature1Title: string;
  cartaAntidesperdicioFeature1Desc: string;
  cartaAntidesperdicioFeature2Title: string;
  cartaAntidesperdicioFeature2Desc: string;
  cartaAntidesperdicioFeature3Title: string;
  cartaAntidesperdicioFeature3Desc: string;
}

const translations: Record<Language, Translation> = {
  es: {
    ...tpvModuleEs,

    // Navigation
    navSolutions: "Soluciones",
    navSuccess: "Éxito",
    navContact: "Contacto",
    navAdmin: "Admin",
    navBack: "Volver",

    // Hero — outcome-first: leads with business benefit (facturación /
    // tiempo ahorrado), platform breadth is supporting copy in the eyebrow.
    heroEyebrow: "Todo tu negocio en una pantalla",
    heroTitle: "Aumenta tu facturación,",
    heroTitleAccent: "ahorra horas",
    heroTitleEnd: "cada semana",
    heroServiciosTitle: "Soluciones de",
    heroServiciosTitleAccent: "IA y Automatización",
    heroServiciosTitleEnd: "para tu Negocio",
    heroContactoTitle: "Hablemos de tu",
    heroContactoTitleAccent: "Proyecto",
    heroContactoTitleEnd: "",
    heroSubtitle:
      "TPV, comandero móvil, cocina, reservas, stock y más en una sola plataforma. Cobra más rápido, reduce tareas manuales y dedica tu tiempo a lo que importa: tu negocio. Sin comisiones ni intermediarios.",
    statStrip1Value: "200+",
    statStrip1Label: "Negocios en Canarias",
    statStrip2Value: "0%",
    statStrip2Label: "Comisiones por pedido",
    statStrip3Value: "6×",
    statStrip3Label: "Más reseñas en 90 días",
    statStrip4Value: "40%",
    statStrip4Label: "Más visitas con reseñas",
    heroButtonDemo: "Ver Demo",
    heroButtonContact: "Contactar",

    // Features
    featuresTitle: "Nuestros Servicios",
    featuresSubtitle:
      "Herramientas avanzadas diseñadas para la era digital, desde el hardware hasta el código.",
    featuresContent1:
      "En Digitaliza Tenerife transformamos la experiencia de los restaurantes en Tenerife y Canarias. Con IA, automatización y hardware inteligente, ayudamos a atraer, retener y fidelizar clientes. Nuestras soluciones incluyen Carta Digital con pedidos en tiempo real, tarjetas NFC para reseñas instantáneas en Google y automatización con n8n que conecta cada interacción del cliente. ¡El salto digital que tu negocio necesita para crecer!",
    featuresContent1Title: "Carta Digital: Menú Inteligente",
    featuresContent2:
      "Con la Carta Digital, tus clientes en Tenerife y Canarias pueden pedir desde su móvil escaneando un código QR en la mesa. El pedido llega directamente a barra y cocina en tiempo real, reduciendo tiempos de espera y aumentando la rotación de mesas. Sin comisiones ni intermediarios, cada mesa se convierte en un punto de venta digital que opera 24/7, recopilando datos valiosos para campañas de marketing automatizadas y fidelización.",
    featuresContent2Title: "Tap-to-Review NFC",
    featuresContent3:
      "Nuestras tarjetas NFC Tap-to-Review permiten a tus clientes dejar reseñas en Google con un solo toque. Más reseñas significan mejor posicionamiento en Google Maps y atraerás más clientes nuevos a tu restaurante en Tenerife y Canarias. Tecnología de alto rendimiento, sin suscripciones y configuración inmediata. Estudios demuestran que los negocios con más de 50 reseñas en Google reciben hasta un 40% más de visitas.",
    featuresContent3Title: "Automatización con n8n",
    featuresContent4:
      "Imagina un flujo de trabajo automatizado donde cada lead se captura, analiza y responde automáticamente. Con nuestras automatizaciones n8n, conectamos tu CRM, email, WhatsApp y redes sociales en un solo ecosistema. Cada interacción con clientes potenciales genera acciones en cadena: análisis de sentimiento con IA, asignación de temperatura del lead y notificaciones en tiempo real a tu equipo comercial. ¡Libera horas de trabajo cada semana!",
    featuresContent4Title: "IA Conversacional para tu Negocio",
    featuresContent5:
      "La Carta Digital no es solo un menú digital: es tu nuevo canal de ventas directo para restaurantes en Tenerife y Canarias. Cada mesa escanea un código QR, explora platos con fotos y vídeos profesionales en 5 idiomas, y envía el pedido directamente a barra y cocina. Los datos de cada cliente se almacenan en tu base de datos para campañas de fidelización automatizadas. El resultado: mesas que rotan más rápido, tickets promedio más altos y clientes que vuelven por la experiencia impecable.",
    featuresContent5Title: "Carta Digital Sin Comisiones",
    featuresContent6:
      "Las tarjetas NFC Tap-to-Review convierten cada visita en una reseña de Google para tu restaurante en Tenerife y Canarias. Coloca el expositor en tu local, el cliente acerca su móvil, y en 5 segundos tiene abierta la página de reseñas. Más reseñas significan mejor posicionamiento local en Google Maps y atraen más clientes nuevos cada mes. Es un ciclo virtuoso que multiplica tu visibilidad sin inversión publicitaria recurrente. ¡Multiplica tus reseñas por 6 en los primeros 90 días!",
    featuresContent6Title: "NFC Tap-to-Review",
    featuresNFC: "Tarjetas Tap-to-Review",
    featuresNFCDesc:
      "Hardware físico con alma digital. Tarjetas NFC elegantes que permiten a tus clientes dejar reseñas positivas al instante con un solo toque.",
    featuresCartaDigital: "Carta Digital Premium",
    featuresCartaDigitalDesc:
      "La carta digital que elimina intermediarios. 0% comisiones, 5 idiomas, pedidos por WhatsApp y tu propia base de datos de clientes.",
    featuresDetails: "Ver detalles",

    // Success Stats
    successTitle: "Casos de Éxito",
    successSubtitle: "Resultados reales que transforman negocios",
    successDesc:
      "Empresas que ya confían en nosotros y han transformado su operación.",
    successStat1Label: "Aumento Promedio",
    successStat1Quote:
      "Desde que implementamos la Carta Digital, nuestros ingresos por mesa aumentaron un 45%",
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
      "Más de 850 negocios confían en Digitaliza Tenerife para su transformación digital",
    successStat4Author: "Comunidad Hostelera",

    // SEO
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
    footerCopyright: "© 2026 Digitaliza Tenerife. Todos los derechos reservados.",

    // Navbar Solutions
    navbarNFC: "Tarjetas NFC",
    navbarNFCDesc: "Reseñas al instante",
    navbarCartaDigital: "Carta Digital Premium",
    navbarCartaDigitalDesc: "0% comisiones, 5 idiomas",
    serviceCartaDigital: "Carta Digital Premium",
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
      "Tus clientes ven los platos con fotos, vídeos y descripciones en 5 idiomas escaneando el QR de la mesa. Los nuevos clientes encuentran tu carta en Google y hacen pedidos take away directamente. Tú recibes el pedido por Telegram, acumulas su contacto en tu base de datos y les fidelizas con promociones. Sin intermediarios. Sin comisiones. Sin depender de nadie.",

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
    cartaBeneficio5Title: "Pedidos por Telegram",
    cartaBeneficio5Desc:
      "El cliente pide desde el QR y el pedido llega al grupo de Telegram de tu equipo. Todo el personal lo ve en tiempo real, sin llamadas ni confusiones.",
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
    cartaFlujoStep1Desc: "El cliente apunta la cámara al QR de la mesa y abre la carta al instante.",
    cartaFlujoStep2Title: "Explora y pide",
    cartaFlujoStep2Desc: "Selecciona platos con fotos y precios. Confirma el pedido desde el móvil.",
    cartaFlujoStep3Title: "Llega a Telegram",
    cartaFlujoStep3Desc: "El pedido aparece en el grupo de Telegram de tu equipo en menos de 2 segundos.",
    cartaFlujoStep4Title: "Confirmación",
    cartaFlujoStep4Desc: "El equipo responde el tiempo de recogida con un botón. Sin llamadas.",

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


    // Digital Menu Landing

    // Menu QR Landing

    // Table Orders Landing

    // Digital Menu SEO

    // Menu QR SEO

    // Table Orders SEO

    // NFC Reviews Landing Page

    // n8n Automation Landing Page
    brandName: "Digitaliza Tenerife",
    enterpriseAINode: "Enterprise AI Node",
    aiCore: "AI Core",
    processing: "Procesando...",
    uplinkStable: "Uplink Estable",
    nfcActive: "NFC Activo",

    // n8n Automation — Stats
    legalAvisoTitle: "Aviso Legal - Digitaliza Tenerife",
    legalAvisoDescription:
      "Aviso legal de Digitaliza Tenerife. Información sobre términos de uso, propiedad intelectual, responsabilidades y condiciones generales del sitio web.",
    legalAvisoBackLink: "Volver al inicio",
    // --- /legal/aviso — section bodies (LSSI-CE art. 10) ---
    legalAvisoSection1Title: "Identificación del titular",
    legalAvisoSection1Content:
      "<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos: el titular de este sitio web opera bajo el nombre comercial <strong>Digitaliza Tenerife</strong>, como persona física dada de alta como trabajador autónomo, con NIF 02670352Y.</p><p>Domicilio: c/ Ernesto Castro, 57, Puerta 501, 38001, Santa Cruz de Tenerife, Canarias, España.</p><p>Correo electrónico: info@digitalizatenerife.es. Teléfono: +34 601 39 64 19.</p><p>Actividad: desarrollo de software, automatización con inteligencia artificial y servicios de consultoría tecnológica para negocios de hostelería y comercio local.</p>",
    legalAvisoSection2Title: "Objeto y condiciones de uso del sitio web",
    legalAvisoSection2Content:
      "<p>El presente aviso legal regula el acceso y uso de este sitio web, cuyo objeto es informar sobre los productos y servicios de Digitaliza Tenerife —entre ellos la Carta Digital, tarjetas NFC para reseñas y automatización con inteligencia artificial— y facilitar el contacto con potenciales clientes.</p><p>El acceso a este sitio web es gratuito y no exige la contratación de ningún servicio. El uso del sitio implica la aceptación de las condiciones recogidas en este aviso legal. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos, y a no emplearlos para actividades ilícitas, lesivas de derechos de terceros o contrarias a la buena fe y al orden público.</p>",
    legalAvisoSection3Title: "Propiedad intelectual e industrial",
    legalAvisoSection3Content:
      "<p>Los contenidos de este sitio web —textos, imágenes, código fuente, diseño, logotipos y marcas, entre otros elementos— son propiedad de Digitaliza Tenerife o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial vigente.</p><p>Las denominaciones <strong>Digitaliza Tenerife</strong> y <strong>Carta Digital</strong> se utilizan como marcas comerciales del titular de este sitio web. Queda prohibida la reproducción, distribución, comunicación pública o transformación de estos contenidos sin autorización expresa del titular, salvo en los casos permitidos por la ley.</p>",
    legalAvisoSection4Title: "Responsabilidad y exclusión de garantías",
    legalAvisoSection4Content:
      "<p>Este sitio web incluye un asistente conversacional (chatbot) basado en inteligencia artificial generativa. Las respuestas que ofrece se generan automáticamente a partir de un modelo de lenguaje y tienen carácter meramente informativo y orientativo: no constituyen asesoramiento profesional, no representan un compromiso contractual ni una oferta vinculante por parte de Digitaliza Tenerife, y pueden contener imprecisiones.</p><p>Digitaliza Tenerife no garantiza la disponibilidad, continuidad ni infalibilidad del sitio web ni de sus contenidos, y no se hace responsable de los daños que pudieran derivarse de la falta de disponibilidad o de errores en los contenidos, sin perjuicio de las medidas razonables adoptadas para evitarlos.</p>",
    legalAvisoSection5Title: "Enlaces externos",
    legalAvisoSection5Content:
      "<p>Este sitio web puede incluir enlaces a páginas de terceros. Digitaliza Tenerife no controla ni asume responsabilidad alguna sobre el contenido, la disponibilidad o las políticas de privacidad de dichos sitios externos, cuyo acceso queda bajo la exclusiva responsabilidad del usuario.</p>",
    legalAvisoSection6Title: "Legislación aplicable y jurisdicción",
    legalAvisoSection6Content:
      "<p>Este aviso legal se rige por la legislación española. Para la resolución de cualquier controversia derivada del acceso o uso de este sitio web, las partes se someten a los juzgados y tribunales de Santa Cruz de Tenerife, salvo que la normativa aplicable en materia de consumidores y usuarios disponga otro fuero.</p>",
    legalPrivacidadTitle: "Política de Privacidad - Digitaliza Tenerife",
    legalPrivacidadDescription:
      "Política de privacidad de Digitaliza Tenerife. Información sobre recogida, uso y protección de datos personales.",
    legalPrivacidadBackLink: "Volver al inicio",
    legalPrivacidadUpdated: "Última actualización: 2026",
    legalCookiesTitle: "Política de Cookies - Digitaliza Tenerife",
    legalCookiesDescription:
      "Política de cookies de Digitaliza Tenerife. Información sobre el uso de cookies y tecnologías similares.",
    legalCookiesBackLink: "Volver al inicio",
    legalCookiesUpdated: "Última actualización: 2026",
    legalCookiesSection1Title: "¿Qué son las cookies?",
    legalCookiesSection1Content:
      "<p>Una cookie es un pequeño archivo de texto que un sitio web guarda en tu navegador cuando lo visitas. Sirve para recordar información sobre tu visita, como tu idioma preferido u otras preferencias, y puede usarse también para analizar cómo se utiliza el sitio.</p><p>En digitalizatenerife.es utilizamos únicamente dos categorías de cookies: <strong>necesarias</strong> (imprescindibles para el funcionamiento del sitio) y <strong>de análisis</strong> (para entender cómo se usa la web). No utilizamos cookies de publicidad ni de marketing.</p>",
    legalCookiesSection2Title: "Cookies que utilizamos",
    legalCookiesSection2Content:
      "<p><strong>Cookies necesarias</strong> (no requieren consentimiento, art. 22.2 LSSI-CE):</p><ul><li><strong>Preferencia de idioma</strong> — guarda si navegas en español o inglés. Duración: hasta que la cambies o borres el almacenamiento del navegador.</li><li><strong>Tema visual (claro/oscuro)</strong> — recuerda tu preferencia de modo claro u oscuro. Duración: persistente en tu navegador.</li><li><strong>Consentimiento de cookies</strong> — guarda tu decisión sobre las cookies de análisis para no volver a preguntarte. Duración: 24 meses.</li></ul><p><strong>Cookies de análisis</strong> (requieren tu consentimiento previo) — Google Analytics 4:</p><ul><li><strong>_ga</strong> — identifica de forma anónima a los usuarios y distingue sesiones. Duración: 2 años. Proveedor: Google Ireland Limited.</li><li><strong>_ga_F9KQ7X8TSQ</strong> — mantiene el estado de la sesión para esta propiedad de Google Analytics 4. Duración: 2 años. Proveedor: Google Ireland Limited.</li></ul><p>Estas cookies de análisis solo se activan si aceptas expresamente su uso en el banner de cookies. Puedes retirar tu consentimiento en cualquier momento.</p>",
    legalCookiesSection3Title: "Transferencias internacionales de datos",
    legalCookiesSection3Content:
      "<p>Google Analytics 4 es un servicio prestado por Google Ireland Limited, cuya matriz, Google LLC, tiene sede en Estados Unidos. Esto implica que los datos recogidos por las cookies de análisis pueden transferirse fuera del Espacio Económico Europeo.</p><p>Google basa estas transferencias en las Cláusulas Contractuales Tipo (SCC) aprobadas por la Comisión Europea, que garantizan un nivel de protección equivalente al exigido por el RGPD. Puedes consultar más información en la <a href='https://business.safety.google/adsservices/' target='_blank' rel='noopener noreferrer'>política de tratamiento de datos de Google</a>.</p>",
    legalCookiesSection4Title: "Cómo gestionar o bloquear las cookies",
    legalCookiesSection4Content:
      "<p>Puedes aceptar, rechazar o retirar tu consentimiento a las cookies de análisis en cualquier momento desde el banner de cookies de este sitio.</p><p>Además, puedes configurar tu navegador para bloquear o eliminar cookies:</p><ul><li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</li><li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio.</li><li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web.</li><li><strong>Microsoft Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies y datos almacenados.</li></ul><p>Ten en cuenta que bloquear las cookies necesarias puede afectar al correcto funcionamiento del sitio.</p>",
    legalCookiesSection5Title: "Cómo retirar tu consentimiento",
    legalCookiesSection5Content:
      "<p>Puedes cambiar tu decisión sobre las cookies de análisis en cualquier momento haciendo clic en el botón de preferencias de cookies, visible en la esquina inferior izquierda de cualquier página del sitio.</p><p>Al retirar tu consentimiento, dejaremos de usar cookies de análisis en tus próximas visitas y se eliminará el permiso guardado.</p>",

    // Cookie consent banner
    cookieBannerTitle: "Usamos cookies",
    cookieBannerBody:
      "Usamos cookies necesarias para el funcionamiento del sitio y, solo con tu consentimiento, cookies de análisis para entender cómo lo usas. Puedes aceptar o rechazar las cookies de análisis; tu elección no afecta a la navegación.",
    cookieBannerAccept: "Aceptar",
    cookieBannerReject: "Rechazar",
    cookieBannerPolicy: "Más información",
    cookieReopenerLabel: "Preferencias de cookies",

    // Home FAQ
    homeFaqTitle: "Preguntas Frecuentes",
    homeFaqQ1: "¿Qué es Digitaliza Tenerife?",
    homeFaqA1: "Digitaliza Tenerife es una agencia de transformación digital especializada en hostelería y comercios locales de Canarias. Ofrecemos menús digitales, tarjetas NFC para reseñas, automatización con n8n e IA conversacional.",
    homeFaqQ2: "¿Cuánto cuesta la Carta Digital?",
    homeFaqA2: "La Carta Digital no tiene comisiones por pedido. El precio depende del plan y del tamaño del negocio. Contactá con nosotros para un presupuesto personalizado sin compromiso.",
    homeFaqQ3: "¿Cómo funcionan las tarjetas NFC Tap-to-Review?",
    homeFaqA3: "El cliente acerca su móvil a la tarjeta NFC y se abre directamente la página de reseñas de Google de tu negocio. Sin apps, sin fricción. Nuestros clientes multiplican sus reseñas por 6 en 90 días.",
    homeFaqQ4: "¿Sus soluciones sirven para negocios fuera de Canarias?",
    homeFaqA4: "Sí. Aunque nos especializamos en Tenerife y Canarias, nuestras soluciones digitales funcionan en cualquier negocio de España y Europa.",
    homeFaqQ5: "¿Necesito conocimientos técnicos para usar vuestras herramientas?",
    homeFaqA5: "No. Nuestras soluciones están diseñadas para propietarios de negocios sin experiencia técnica. Te damos formación, soporte y configuramos todo por ti.",
    homeFaqQ6: "¿Cuánto tiempo lleva implementar el sistema?",
    homeFaqA6: "La mayoría de nuestros sistemas están operativos en menos de 48 horas tras la firma del contrato. La Carta Digital puede estar lista el mismo día.",

    // CartaDigital FAQ & HowTo
    cartaFaqTitle: "Preguntas Frecuentes — Carta Digital",
    cartaFaqQ1: "¿Qué es la Carta Digital?",
    cartaFaqA1: "La Carta Digital de Digitaliza Tenerife es un menú digital con fotos y vídeos, gestión de pedidos vía Telegram, base de datos de clientes propia y herramientas de reducción de desperdicio alimentario. Sin comisiones por pedido.",
    cartaFaqQ2: "¿Necesito una app para usar el menú digital?",
    cartaFaqA2: "No. Los clientes simplemente escanean el QR de la mesa con la cámara del móvil. No se necesita descargar ninguna aplicación.",
    cartaFaqQ3: "¿Cuántos idiomas soporta la carta?",
    cartaFaqA3: "La carta digital soporta hasta 5 idiomas de forma simultánea, lo que es clave para la hostelería turística de Canarias.",
    cartaFaqQ4: "¿Hay comisiones por pedido?",
    cartaFaqA4: "No. A diferencia de plataformas como Glovo o Uber Eats, la Carta Digital no cobra ninguna comisión por pedido. Pagás una tarifa fija mensual.",
    cartaFaqQ5: "¿Cuánto tiempo lleva la puesta en marcha?",
    cartaFaqA5: "La carta digital puede estar operativa el mismo día. Configuramos el menú, generamos los QR y formamos a tu equipo en menos de 24 horas.",
    cartaComparTitle: "Carta Digital vs. Alternativas",
    cartaComparSubtitle: "Comparar y decidir con datos reales",
    cartaComparHeaderCriterio: "Criterio",
    cartaComparHeaderPlataforma: "Digitaliza Tenerife",
    cartaComparHeaderPapel: "Carta en papel",
    cartaComparHeaderOtras: "Otras apps",
    cartaComparRow1Label: "Comisiones",
    cartaComparRow1Plataforma: "0%",
    cartaComparRow1Papel: "Sin comisiones",
    cartaComparRow1Otras: "15–30%",
    cartaComparRow2Label: "Actualización de precios",
    cartaComparRow2Plataforma: "Tiempo real",
    cartaComparRow2Papel: "Reimpresión",
    cartaComparRow2Otras: "Manual",
    cartaComparRow3Label: "Idiomas",
    cartaComparRow3Plataforma: "Hasta 5",
    cartaComparRow3Papel: "1 (reimpresión)",
    cartaComparRow3Otras: "1–2",
    cartaComparRow4Label: "Pedidos digitales",
    cartaComparRow4Plataforma: "Sí, vía Telegram",
    cartaComparRow4Papel: "No",
    cartaComparRow4Otras: "Sí (con comisión)",
    cartaComparRow5Label: "Puesta en marcha",
    cartaComparRow5Plataforma: "Mismo día",
    cartaComparRow5Papel: "Semanas",
    cartaComparRow5Otras: "Semanas",

    // Carta Digital — SEO / JSON-LD
    cartaDineroGrowthLabel: "Visibilidad + Clientes recurrentes = Crecimiento real.",

    // Carta Digital — Solucion pills
    cartaSolucionPill1: "📱 QR",
    cartaSolucionPill2: "🌍 5 idiomas",
    cartaSolucionPill3: "🎬 Media",
    cartaSolucionPill4: "🛒 Take Away",
    cartaSolucionPill5: "💬 Telegram",
    cartaSolucionPill6: "📧 Email",
    cartaSolucionPill7: "📊 Stats",
    cartaSolucionPill8: "🔍 SEO",
    cartaSolucionPill9: "⭐ Google",

    // Carta Digital — Telegram section
    cartaTelegramTitle: "Pedidos por Telegram",
    cartaTelegramSubtitle: "El cliente pide desde el QR. El restaurante gestiona desde Telegram. Sin apps, sin comisiones.",
    cartaTelegramFeature1Title: "Pedido online al instante",
    cartaTelegramFeature1Desc: "El cliente escanea el QR y hace su pedido en segundos desde el móvil.",
    cartaTelegramFeature2Title: "Grupo de Telegram del equipo",
    cartaTelegramFeature2Desc: "El pedido llega al grupo compartido. Todo el equipo lo ve en tiempo real.",
    cartaTelegramFeature3Title: "Respuesta con un botón",
    cartaTelegramFeature3Desc: "Confirmás el tiempo de recogida con un solo toque. Sin llamadas, sin confusión.",
    cartaTelegramFeature4Title: "Camarero en mesa desde el móvil",
    cartaTelegramFeature4Desc: "El camarero gestiona pedidos en sala desde su móvil sin pantallas adicionales.",

    // Carta Digital — Modos section
    cartaModosTitle: "Dos modos, un sistema",
    cartaModosSubtitle: "Elegí el modo que se adapta a tu negocio.",
    cartaModoRestauranteTitle: "Modo Restaurante",
    cartaModoRestauranteDesc: "Pedidos online y en mesa desde Telegram. Perfecto para bares, restaurantes y cafeterías.",
    cartaModoRestauranteFeature1: "Pedidos en mesa vía QR + Telegram",
    cartaModoRestauranteFeature2: "Grupo compartido para todo el equipo",
    cartaModoTiendaTitle: "Modo Tienda",
    cartaModoTiendaDesc: "Gestión de pedidos online con cartera de clientes propia. Ideal para tiendas y take away.",
    cartaModoTiendaFeature1: "Pedidos online con gestión de clientes",
    cartaModoTiendaFeature2: "Portfolio propio — sin depender de plataformas",

    // Carta Digital — Antidesperdicio section
    cartaAntidesperdicioTitle: "Reduce el desperdicio alimentario",
    cartaAntidesperdicioSubtitle: "Convierte el stock próximo a caducar en ingresos",
    cartaAntidesperdicioDesc: "Publicá tus platos del día o ingredientes próximos a caducar con descuento. Tus clientes los descubren primero — al estilo Too Good To Go, pero integrado en tu carta.",
    cartaAntidesperdicioFeature1Title: "Descuentos por tiempo limitado",
    cartaAntidesperdicioFeature1Desc: "Marcá productos con descuento directo en la carta digital. Visibles desde el QR.",
    cartaAntidesperdicioFeature2Title: "Notificación a clientes frecuentes",
    cartaAntidesperdicioFeature2Desc: "Los clientes guardados en tu BBDD reciben promos automáticas por Telegram.",
    cartaAntidesperdicioFeature3Title: "Menos pérdidas, más margen",
    cartaAntidesperdicioFeature3Desc: "Recuperá el valor de stock que de otro modo se desperdiciaría.",
  },
  en: {
    ...tpvModuleEn,

    // Navigation
    navSolutions: "Solutions",
    navSuccess: "Success",
    navContact: "Contact",
    navAdmin: "Admin",
    navBack: "Back",

    // Hero — outcome-first: leads with business benefit (revenue / time
    // saved), platform breadth is supporting copy in the eyebrow.
    heroEyebrow: "Your whole business, one screen",
    heroTitle: "Boost your revenue,",
    heroTitleAccent: "save hours",
    heroTitleEnd: "every week",
    heroServiciosTitle: "AI and Automation",
    heroServiciosTitleAccent: "Solutions",
    heroServiciosTitleEnd: "for Your Business",
    heroContactoTitle: "Let's Talk About",
    heroContactoTitleAccent: "Your Project",
    heroContactoTitleEnd: "",
    heroSubtitle:
      "POS, mobile ordering, kitchen display, reservations, stock and more in one platform. Get paid faster, cut manual tasks, and spend your time on what matters — your business. No commissions, no middlemen.",
    statStrip1Value: "200+",
    statStrip1Label: "Businesses in the Canary Islands",
    statStrip2Value: "0%",
    statStrip2Label: "Commissions per order",
    statStrip3Value: "6×",
    statStrip3Label: "More reviews in 90 days",
    statStrip4Value: "40%",
    statStrip4Label: "More visits with reviews",
    heroButtonDemo: "View Demo",
    heroButtonContact: "Contact Us",

    // Features
    featuresTitle: "Our Solutions",
    featuresSubtitle:
      "Advanced tools designed for the digital era, from hardware to code.",
    featuresContent1:
      "At Digitaliza Tenerife we combine artificial intelligence, automation, and smart hardware to transform how local businesses attract, retain, and build loyalty with customers. Our platform integrates Carta Digital menus with real-time ordering, NFC cards for instant Google reviews, and n8n automation workflows that connect every customer interaction.",
    featuresContent1Title: "Carta Digital: Smart Digital Menu",
    featuresContent2:
      "With Carta Digital, your customers order from their phone by scanning a QR code at the table. Orders arrive directly to the bar and kitchen in real-time, eliminating wait times and increasing table turnover. No commissions, no intermediaries.",
    featuresContent2Title: "Tap-to-Review NFC",
    featuresContent3:
      "Our Tap-to-Review NFC cards let any customer leave a Google review with a single tap. More reviews mean better Google Maps positioning and more new customers. High-performance technology, no subscriptions, instant setup.",
    featuresContent3Title: "n8n Automation",
    featuresContent4:
      "Imagine a workflow where every lead is captured, analyzed, and responded to automatically. With our n8n automations, we connect your CRM, email, WhatsApp, and social media in a single ecosystem. Each prospect interaction triggers chain actions: AI sentiment analysis, lead temperature scoring, and real-time notifications to your sales team.",
    featuresContent4Title: "Conversational AI for Your Business",
    featuresContent5:
      "Carta Digital is not just a digital menu — it's your new direct sales channel. Every table scans a QR code, explores dishes with professional photos and videos in 5 languages, and sends orders directly to the bar and kitchen. No commissions, no waiting, no intermediaries. Customer data is stored in your database for automated loyalty campaigns.",
    featuresContent5Title: "Carta Digital No Commissions",
    featuresContent6:
      "NFC Tap-to-Review cards turn every visit into a Google review. Place the display in your venue, customers tap their phone, and in 5 seconds the review page opens. More reviews = better local Google Maps ranking = more new customers. A virtuous cycle that multiplies your visibility without recurring ad spend.",
    featuresContent6Title: "NFC Tap-to-Review",
    featuresNFC: "Tap-to-Review Cards",
    featuresNFCDesc:
      "Physical hardware with a digital soul. Elegant NFC cards that allow your customers to leave positive reviews instantly with a single tap.",
    featuresCartaDigital: "Carta Digital Premium",
    featuresCartaDigitalDesc:
      "The digital menu that eliminates intermediaries. 0% commissions, 5 languages, WhatsApp orders and your own customer database.",
    featuresDetails: "View details",
    successTitle: "Success Stories",
    successSubtitle: "Real results that transform businesses",
    successDesc:
      "Companies that already trust us and have transformed their operation.",
    successStat1Label: "Average Increase",
    successStat1Quote:
      "Since we implemented Carta Digital, our revenue per table increased by 45%",
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
      "More than 850 businesses trust Digitaliza Tenerife for their digital transformation",
    successStat4Author: "Hospitality Community",

    // SEO
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
    footerCopyright: "© 2026 Digitaliza Tenerife. All rights reserved.",

    // Navbar Solutions
    navbarNFC: "NFC Cards",
    navbarNFCDesc: "Instant reviews",
    navbarCartaDigital: "Carta Digital Premium",
    navbarCartaDigitalDesc: "0% commissions, 5 languages",

    // Service options
    serviceCartaDigital: "Carta Digital Premium",
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
      "Your customers see dishes with photos, videos and descriptions in 5 languages by scanning the table QR. New customers find your menu on Google and order take away directly. You receive orders via Telegram, accumulate their contact in your database and fidelize them with promotions. No intermediaries. No commissions. Depending on no one.",

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
    cartaBeneficio5Title: "Orders via Telegram",
    cartaBeneficio5Desc:
      "Customers order from the QR and the order arrives in your team's Telegram group. Everyone sees it in real time — no calls, no confusion.",
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
    cartaFlujoStep1Title: "Scan the QR",
    cartaFlujoStep1Desc:
      "Customer points camera at the table QR and the menu opens instantly.",
    cartaFlujoStep2Title: "Browse and order",
    cartaFlujoStep2Desc:
      "Select dishes with photos and prices. Confirm the order from their phone.",
    cartaFlujoStep3Title: "Arrives on Telegram",
    cartaFlujoStep3Desc:
      "Order appears in your team's Telegram group in under 2 seconds.",
    cartaFlujoStep4Title: "Confirmation",
    cartaFlujoStep4Desc:
      "Team responds with pickup time using one button. No phone calls.",

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


    // Digital Menu Landing

    // Menu QR Landing

    // Table Orders Landing

    // Digital Menu SEO

    // Menu QR SEO

    // Table Orders SEO

    // NFC Reviews Landing Page

    // n8n Automation Landing Page
    brandName: "Digitaliza Tenerife",
    enterpriseAINode: "Enterprise AI Node",
    aiCore: "AI Core",
    processing: "Processing...",
    uplinkStable: "Uplink Stable",
    nfcActive: "NFC Active",

    // n8n Automation — Stats
    legalAvisoTitle: "Legal Notice - Digitaliza Tenerife",
    legalAvisoDescription:
      "Legal notice of Digitaliza Tenerife. Information about terms of use, intellectual property, liabilities and general conditions of the website.",
    legalAvisoBackLink: "Back to home",
    // --- /legal/aviso — section bodies (LSSI-CE art. 10) ---
    legalAvisoSection1Title: "Identification of the site owner",
    legalAvisoSection1Content:
      "<p>In compliance with article 10 of Spanish Law 34/2002, of 11 July, on Information Society Services and Electronic Commerce (LSSI-CE), the following information is provided: the owner of this website operates under the trade name <strong>Digitaliza Tenerife</strong>, as a self-employed individual (autónomo) registered under Tax ID (NIF) 02670352Y.</p><p>Address: c/ Ernesto Castro, 57, Puerta 501, 38001, Santa Cruz de Tenerife, Canary Islands, Spain.</p><p>Email: info@digitalizatenerife.es. Phone: +34 601 39 64 19.</p><p>Activity: software development, AI-powered automation and technology consulting services for hospitality businesses and local commerce.</p>",
    legalAvisoSection2Title: "Purpose and terms of use of the website",
    legalAvisoSection2Content:
      "<p>This legal notice governs access to and use of this website, whose purpose is to provide information about Digitaliza Tenerife's products and services — including the Carta Digital menu, NFC review cards and AI-powered automation — and to facilitate contact with potential clients.</p><p>Access to this website is free of charge and does not require contracting any service. Using the site implies acceptance of the terms set out in this legal notice. Users agree to make appropriate use of the content and services offered, and not to use them for unlawful purposes, to infringe third-party rights, or in a manner contrary to good faith and public order.</p>",
    legalAvisoSection3Title: "Intellectual and industrial property",
    legalAvisoSection3Content:
      "<p>The content of this website — texts, images, source code, design, logos and trademarks, among other elements — is the property of Digitaliza Tenerife or of third parties who have authorized its use, and is protected under applicable intellectual and industrial property law.</p><p>The names <strong>Digitaliza Tenerife</strong> and <strong>Carta Digital</strong> are used as trademarks of the owner of this website. Reproduction, distribution, public communication or transformation of this content without the owner's express authorization is prohibited, except where permitted by law.</p>",
    legalAvisoSection4Title: "Liability and disclaimer",
    legalAvisoSection4Content:
      "<p>This website includes a conversational assistant (chatbot) based on generative artificial intelligence. The responses it provides are generated automatically from a language model and are purely informational and orientative in nature: they do not constitute professional advice, do not represent a contractual commitment or a binding offer from Digitaliza Tenerife, and may contain inaccuracies.</p><p>Digitaliza Tenerife does not guarantee the availability, continuity or infallibility of the website or its content, and is not liable for damages arising from unavailability or errors in the content, without prejudice to the reasonable measures taken to prevent them.</p>",
    legalAvisoSection5Title: "External links",
    legalAvisoSection5Content:
      "<p>This website may include links to third-party pages. Digitaliza Tenerife does not control and assumes no responsibility for the content, availability or privacy policies of such external sites, access to which is at the user's sole responsibility.</p>",
    legalAvisoSection6Title: "Applicable law and jurisdiction",
    legalAvisoSection6Content:
      "<p>This legal notice is governed by Spanish law. For the resolution of any dispute arising from access to or use of this website, the parties submit to the courts of Santa Cruz de Tenerife, unless applicable consumer protection regulations establish a different forum.</p>",
    legalPrivacidadTitle: "Privacy Policy - Digitaliza Tenerife",
    legalPrivacidadDescription:
      "Privacy policy of Digitaliza Tenerife. Information about collection, use and protection of personal data.",
    legalPrivacidadBackLink: "Back to home",
    legalPrivacidadUpdated: "Last updated: 2026",
    legalCookiesTitle: "Cookies Policy - Digitaliza Tenerife",
    legalCookiesDescription:
      "Cookies policy of Digitaliza Tenerife. Information about the use of cookies and similar technologies.",
    legalCookiesBackLink: "Back to home",
    legalCookiesUpdated: "Last updated: 2026",
    legalCookiesSection1Title: "What are cookies?",
    legalCookiesSection1Content:
      "<p>A cookie is a small text file that a website stores in your browser when you visit it. It is used to remember information about your visit, such as your preferred language or other preferences, and can also be used to analyze how the site is used.</p><p>At digitalizatenerife.es we only use two categories of cookies: <strong>necessary</strong> (essential for the site to function) and <strong>analytics</strong> (to understand how the site is used). We do not use advertising or marketing cookies.</p>",
    legalCookiesSection2Title: "Cookies we use",
    legalCookiesSection2Content:
      "<p><strong>Necessary cookies</strong> (do not require consent, art. 22.2 LSSI-CE):</p><ul><li><strong>Language preference</strong> — stores whether you browse in Spanish or English. Duration: until you change it or clear your browser storage.</li><li><strong>Visual theme (light/dark)</strong> — remembers your light or dark mode preference. Duration: persistent in your browser.</li><li><strong>Cookie consent</strong> — stores your decision about analytics cookies so we don't ask again. Duration: 24 months.</li></ul><p><strong>Analytics cookies</strong> (require your prior consent) — Google Analytics 4:</p><ul><li><strong>_ga</strong> — anonymously identifies users and distinguishes sessions. Duration: 2 years. Provider: Google Ireland Limited.</li><li><strong>_ga_F9KQ7X8TSQ</strong> — maintains session state for this Google Analytics 4 property. Duration: 2 years. Provider: Google Ireland Limited.</li></ul><p>These analytics cookies are only activated if you expressly accept their use in the cookie banner. You can withdraw your consent at any time.</p>",
    legalCookiesSection3Title: "International data transfers",
    legalCookiesSection3Content:
      "<p>Google Analytics 4 is a service provided by Google Ireland Limited, whose parent company, Google LLC, is headquartered in the United States. This means that data collected by analytics cookies may be transferred outside the European Economic Area.</p><p>Google bases these transfers on the Standard Contractual Clauses (SCCs) approved by the European Commission, which guarantee a level of protection equivalent to that required by the GDPR. You can find more information in <a href='https://business.safety.google/adsservices/' target='_blank' rel='noopener noreferrer'>Google's data processing terms</a>.</p>",
    legalCookiesSection4Title: "How to manage or block cookies",
    legalCookiesSection4Content:
      "<p>You can accept, reject, or withdraw your consent to analytics cookies at any time from this site's cookie banner.</p><p>You can also configure your browser to block or delete cookies:</p><ul><li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data.</li><li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data.</li><li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data.</li><li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions.</li></ul><p>Note that blocking necessary cookies may affect the site's proper functioning.</p>",
    legalCookiesSection5Title: "How to withdraw your consent",
    legalCookiesSection5Content:
      "<p>You can change your decision about analytics cookies at any time by clicking the cookie preferences button, visible in the bottom-left corner of any page on the site.</p><p>Withdrawing your consent stops analytics cookies from being used on your next visits and clears the saved permission.</p>",

    // Cookie consent banner
    cookieBannerTitle: "We use cookies",
    cookieBannerBody:
      "We use necessary cookies for the site to function and, only with your consent, analytics cookies to understand how it's used. You can accept or reject analytics cookies; your choice does not affect browsing.",
    cookieBannerAccept: "Accept",
    cookieBannerReject: "Reject",
    cookieBannerPolicy: "Learn more",
    cookieReopenerLabel: "Cookie preferences",

    // Home FAQ
    homeFaqTitle: "Frequently Asked Questions",
    homeFaqQ1: "What is Digitaliza Tenerife?",
    homeFaqA1: "Digitaliza Tenerife is a digital transformation agency specializing in hospitality and local businesses in the Canary Islands. We offer digital menus, NFC review cards, n8n automation, and conversational AI.",
    homeFaqQ2: "How much does Carta Digital cost?",
    homeFaqA2: "Carta Digital has no per-order commissions. Pricing depends on the plan and business size. Contact us for a free personalized quote.",
    homeFaqQ3: "How do Tap-to-Review NFC cards work?",
    homeFaqA3: "The customer taps their phone on the NFC card and your Google review page opens instantly — no app needed. Our clients multiply their reviews 6x in 90 days.",
    homeFaqQ4: "Do your solutions work for businesses outside the Canary Islands?",
    homeFaqA4: "Yes. While we specialize in Tenerife and the Canary Islands, our digital solutions work for any business across Spain and Europe.",
    homeFaqQ5: "Do I need technical knowledge to use your tools?",
    homeFaqA5: "No. Our solutions are designed for business owners with no technical background. We provide training, support, and handle the full setup.",
    homeFaqQ6: "How long does implementation take?",
    homeFaqA6: "Most of our systems are live within 48 hours of signing. Carta Digital can be ready the same day.",

    // CartaDigital FAQ & HowTo
    cartaFaqTitle: "FAQ — Digital Menu",
    cartaFaqQ1: "What is the Digital Menu?",
    cartaFaqA1: "Digitaliza Tenerife's Digital Menu is a digital menu with photos and videos, Telegram-based order management, your own customer database, and food waste reduction tools. No per-order commissions.",
    cartaFaqQ2: "Do customers need an app?",
    cartaFaqA2: "No. Customers just scan the table QR code with their phone camera. No app download required.",
    cartaFaqQ3: "How many languages does the menu support?",
    cartaFaqA3: "The digital menu supports up to 5 languages simultaneously — essential for tourist hospitality in the Canary Islands.",
    cartaFaqQ4: "Are there per-order commissions?",
    cartaFaqA4: "No. Unlike platforms such as Glovo or Uber Eats, the Digital Menu charges zero per-order commissions. You pay a fixed monthly fee.",
    cartaFaqQ5: "How long does setup take?",
    cartaFaqA5: "The digital menu can go live the same day. We configure your menu, generate QR codes, and train your team in under 24 hours.",
    cartaComparTitle: "Carta Digital vs. Alternatives",
    cartaComparSubtitle: "Compare and decide with real data",
    cartaComparHeaderCriterio: "Criteria",
    cartaComparHeaderPlataforma: "Digitaliza Tenerife",
    cartaComparHeaderPapel: "Paper menu",
    cartaComparHeaderOtras: "Other apps",
    cartaComparRow1Label: "Commissions",
    cartaComparRow1Plataforma: "0%",
    cartaComparRow1Papel: "No commissions",
    cartaComparRow1Otras: "15–30%",
    cartaComparRow2Label: "Price updates",
    cartaComparRow2Plataforma: "Real time",
    cartaComparRow2Papel: "Reprint",
    cartaComparRow2Otras: "Manual",
    cartaComparRow3Label: "Languages",
    cartaComparRow3Plataforma: "Up to 5",
    cartaComparRow3Papel: "1 (reprint)",
    cartaComparRow3Otras: "1–2",
    cartaComparRow4Label: "Digital orders",
    cartaComparRow4Plataforma: "Yes, via Telegram",
    cartaComparRow4Papel: "No",
    cartaComparRow4Otras: "Yes (with commission)",
    cartaComparRow5Label: "Setup time",
    cartaComparRow5Plataforma: "Same day",
    cartaComparRow5Papel: "Weeks",
    cartaComparRow5Otras: "Weeks",

    // Carta Digital — SEO / JSON-LD
    cartaDineroGrowthLabel: "Visibility + Repeat customers = Real growth.",

    // Carta Digital — Solucion pills
    cartaSolucionPill1: "📱 QR",
    cartaSolucionPill2: "🌍 5 languages",
    cartaSolucionPill3: "🎬 Media",
    cartaSolucionPill4: "🛒 Take Away",
    cartaSolucionPill5: "💬 Telegram",
    cartaSolucionPill6: "📧 Email",
    cartaSolucionPill7: "📊 Stats",
    cartaSolucionPill8: "🔍 SEO",
    cartaSolucionPill9: "⭐ Google",

    // Carta Digital — Telegram section
    cartaTelegramTitle: "Orders via Telegram",
    cartaTelegramSubtitle: "Customers order from the QR. The restaurant manages via Telegram. No apps, no commissions.",
    cartaTelegramFeature1Title: "Instant online orders",
    cartaTelegramFeature1Desc: "The customer scans the QR and places their order in seconds from their phone.",
    cartaTelegramFeature2Title: "Team Telegram group",
    cartaTelegramFeature2Desc: "Orders arrive in the shared group. The whole team sees them in real time.",
    cartaTelegramFeature3Title: "One-button response",
    cartaTelegramFeature3Desc: "Confirm the pickup time with a single tap. No calls, no confusion.",
    cartaTelegramFeature4Title: "Waiter on the floor via mobile",
    cartaTelegramFeature4Desc: "Staff manage table orders from their phone — no additional screens needed.",

    // Carta Digital — Modos section
    cartaModosTitle: "Two modes, one system",
    cartaModosSubtitle: "Choose the mode that fits your business.",
    cartaModoRestauranteTitle: "Restaurant Mode",
    cartaModoRestauranteDesc: "Online and table orders via Telegram. Perfect for bars, restaurants, and cafes.",
    cartaModoRestauranteFeature1: "Table orders via QR + Telegram",
    cartaModoRestauranteFeature2: "Shared group for the whole team",
    cartaModoTiendaTitle: "Shop Mode",
    cartaModoTiendaDesc: "Online order management with your own client portfolio. Ideal for shops and take away.",
    cartaModoTiendaFeature1: "Online orders with customer management",
    cartaModoTiendaFeature2: "Own portfolio — no platform dependency",

    // Carta Digital — Antidesperdicio section
    cartaAntidesperdicioTitle: "Reduce food waste",
    cartaAntidesperdicioSubtitle: "Turn near-expiry stock into revenue",
    cartaAntidesperdicioDesc: "List your daily specials or near-expiry items at a discount. Your customers discover them first — Too Good To Go style, but built into your menu.",
    cartaAntidesperdicioFeature1Title: "Time-limited discounts",
    cartaAntidesperdicioFeature1Desc: "Mark items at a discount directly in the digital menu. Visible from the QR.",
    cartaAntidesperdicioFeature2Title: "Notify frequent customers",
    cartaAntidesperdicioFeature2Desc: "Customers saved in your database receive automatic promos via Telegram.",
    cartaAntidesperdicioFeature3Title: "Less waste, more margin",
    cartaAntidesperdicioFeature3Desc: "Recover the value of stock that would otherwise be wasted.",
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
