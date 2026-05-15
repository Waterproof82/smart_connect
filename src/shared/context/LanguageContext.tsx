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
  heroStats5Lang: string;
  heroStats0Commission: string;
  heroStats247: string;
  heroStatsInfinite: string;

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
  featuresContact: string;
  featuresDetails: string;

  // Success Stats
  successTitle: string;
  successSubtitle: string;
  successDesc: string;
  successStat1Value: string;
  successStat1Label: string;
  successStat1Quote: string;
  successStat1Author: string;
  successStat2Value: string;
  successStat2Label: string;
  successStat2Quote: string;
  successStat2Author: string;
  successStat3Value: string;
  successStat3Label: string;
  successStat3Quote: string;
  successStat3Author: string;
  successStat4Value: string;
  successStat4Label: string;
  successStat4Quote: string;
  successStat4Author: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoProductDescription: string;
  seoAltTextNFC: string;
  seoAltTextQribar: string;

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
  contactFormEmailRequired: string;
  contactFormEmailInvalid: string;
  contactFormServiceRequired: string;
  contactFormMessageRequired: string;
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
  navbarSoftwareIA: string;
  navbarSoftwareIADesc: string;
  navbarAutomation: string;
  navbarAutomationDesc: string;
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
  cartaHeroCardLabel: string;

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
  cartaSolucionTenerife: string;

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

  // Card 1: Pérdidas
  cartaDineroCard1Title: string;
  cartaDineroCard1Item1: string;
  cartaDineroCard1Item2: string;
  cartaDineroCard1Item3: string;
  cartaDineroCard1Total: string;

  // Card 2: Ganancias
  cartaDineroCard2Title: string;
  cartaDineroCard2Item1: string;
  cartaDineroCard2Item2: string;
  cartaDineroCard2Item3: string;
  cartaDineroCard2Item4: string;
  cartaDineroCard2Total: string;

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

  cartaDemoTitle: string;
  cartaDemoVideoLabel: string;
  cartaDemoScreen1Title: string;
  cartaDemoScreen1Label: string;
  cartaDemoScreen2Title: string;
  cartaDemoScreen2Label: string;
  cartaDemoScreen3Title: string;
  cartaDemoScreen3Label: string;

  cartaCTATitle: string;
  cartaCTASubtitle: string;
  cartaCTABtnDemo: string;
  cartaCTABtnContact: string;
  cartaCTANoContract: string;
  cartaCTASignup48h: string;
  cartaCTASupport: string;
  cartaCTANoComm: string;

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
  digitalMenuHeroTitle: string;
  digitalMenuHeroSubtitle: string;
  digitalMenuHeroCta: string;

  // Menu QR Landing
  menuQrHeroTitle: string;
  menuQrHeroSubtitle: string;
  menuQrHeroCta: string;

  // Table Orders Landing
  tableOrdersHeroTitle: string;
  tableOrdersHeroSubtitle: string;
  tableOrdersHeroCta: string;

  // Digital Menu SEO
  digitalMenuSeoTitle: string;
  digitalMenuSeoDescription: string;
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
    heroStats5Lang: "Idiomas",
    heroStats0Commission: "Sin comisiones",
    heroStats247: "Soporte 24/7",
    heroStatsInfinite: "Integraciones",

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
    featuresContact: "Contactar",
    featuresDetails: "Ver detalles",

    // Success Stats
    successTitle: "Casos de Éxito",
    successSubtitle: "Resultados reales que transforman negocios",
    successDesc:
      "Empresas que ya confían en nosotros y han transformado su operación.",
    successStat1Value: "50+",
    successStat1Label: "Aumento Promedio",
    successStat1Quote:
      "Desde que implementamos QRIBAR, nuestros ingresos por mesa aumentaron un 45%",
    successStat1Author: "Restaurante L'Escale",
    successStat2Value: "98%",
    successStat2Label: "Satisfacción",
    successStat2Quote:
      "Mis clientes adoran la experiencia. Las reseñas positivas se dispararon",
    successStat2Author: "Café Central Madrid",
    successStat3Value: "45%",
    successStat3Label: "Reseñas Ganadas",
    successStat3Quote:
      "Pasamos de 200 a 1200 reseñas en Google. Es increíble el impacto",
    successStat3Author: "Bar Bodega Toledo",
    successStat4Value: "850+",
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
    seoAltTextQribar: "Menú digital QRIBAR con pedidos en tiempo real",

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
    contactFormEmailRequired: "El email es obligatorio",
    contactFormEmailInvalid: "El email no es válido",
    contactFormServiceRequired: "Selecciona un servicio",
    contactFormMessageRequired: "El mensaje es obligatorio",
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
    footerTagline: "Tecnología de próxima generación para negocios locales.",
    footerSocialTitle: "Síguenos",
    footerNavTitle: "Navegación",
    footerNavInicio: "Inicio",
    footerNavSoluciones: "Soluciones",
    footerNavExito: "Casos de Éxito",
    footerNavContacto: "Contacto",
    footerLegalTitle: "Legal",
    footerLegalAviso: "Aviso Legal",
    footerLegalPrivacidad: "Política de Privacidad",
    footerLegalCookies: "Política de Cookies",
    footerCopyright: "© 2026 SmartConnect AI. Todos los derechos reservados.",

    // Navbar Solutions
    navbarSoftwareIA: "Software & IA",
    navbarSoftwareIADesc: "Soluciones a medida",
    navbarAutomation: "Automatización n8n",
    navbarAutomationDesc: "Flujos inteligentes",
    navbarNFC: "Tarjetas NFC",
    navbarNFCDesc: "Reseñas al instante",
    navbarQribar: "QRIBAR",
    navbarQribarDesc: "Pedido en tiempo real a barra y cocina",
    navbarCartaDigital: "Carta Digital Premium",
    navbarCartaDigitalDesc: "0% comisiones, 5 idiomas",

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
    cartaHeroCardLabel: "Tap-to-Review NFC",

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
    cartaSolucionTenerife:
      "Especial para clientes en Tenerife: bares, restaurantes y empresas. Atención en persona con explicación de demos in situ.",

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
    digitalMenuHeroTitle: "La Carta Digital que Vende por Ti en Tenerife",
    digitalMenuHeroSubtitle:
      "Transforma tu menú de papel en una herramienta de marketing y ventas que tus clientes amarán. Sin comisiones, sin intermediarios, 100% tuyo.",
    digitalMenuHeroCta: "Descubre cómo",

    // Menu QR Landing
    menuQrHeroTitle: "Menú QR Interactivo para Restaurantes Modernos",
    menuQrHeroSubtitle:
      "Ofrece a tus clientes una experiencia visual, rápida y sin contacto. Actualiza tu carta en segundos y destaca sobre tu competencia en Canarias.",
    menuQrHeroCta: "Solicitar Información",

    // Table Orders Landing
    tableOrdersHeroTitle: "Pedidos a Mesa con QR: Más Rápido, Más Ventas",
    tableOrdersHeroSubtitle:
      "Elimina las esperas y aumenta el ticket medio. Tus clientes piden y pagan desde su móvil, y el pedido llega directo a cocina.",
    tableOrdersHeroCta: "Ver Demo",

    // Digital Menu SEO
    digitalMenuSeoTitle:
      "Carta Digital para Restaurantes en Tenerife | Optimiza y Vende Más",
    digitalMenuSeoDescription:
      "Crea tu carta digital QR en Tenerife. Atrae más clientes, aumenta el ticket medio y elimina comisiones. Solución para restaurantes, bares y hoteles en Canarias.",
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
    heroStats5Lang: "Languages",
    heroStats0Commission: "No commissions",
    heroStats247: "Support 24/7",
    heroStatsInfinite: "Integrations",

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
    featuresContact: "Contact",
    featuresDetails: "View details",

    // Success Stats
    successTitle: "Success Stories",
    successSubtitle: "Real results that transform businesses",
    successDesc:
      "Companies that already trust us and have transformed their operation.",
    successStat1Value: "50+",
    successStat1Label: "Average Increase",
    successStat1Quote:
      "Since we implemented QRIBAR, our revenue per table increased by 45%",
    successStat1Author: "Restaurante L'Escale",
    successStat2Value: "98%",
    successStat2Label: "Satisfaction",
    successStat2Quote:
      "My clients love the experience. Positive reviews skyrocketed",
    successStat2Author: "Café Central Madrid",
    successStat3Value: "45%",
    successStat3Label: "Reviews Gained",
    successStat3Quote:
      "We went from 200 to 1200 Google reviews. The impact is incredible",
    successStat3Author: "Bar Bodega Toledo",
    successStat4Value: "850+",
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
    seoAltTextQribar: "QRIBAR digital menu with real-time orders",

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
    contactFormEmailRequired: "Email is required",
    contactFormEmailInvalid: "Email is not valid",
    contactFormServiceRequired: "Please select a service",
    contactFormMessageRequired: "Message is required",
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
    navbarSoftwareIA: "Software & AI",
    navbarSoftwareIADesc: "Tailored solutions",
    navbarAutomation: "Automation n8n",
    navbarAutomationDesc: "Smart workflows",
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
    cartaHeroCardLabel: "Tap-to-Review NFC",

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
    cartaSolucionTenerife:
      "Special for clients in Tenerife: bars, restaurants and companies. On-site demos and personalized attention.",

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
    digitalMenuHeroTitle: "The Digital Menu that Sells for You in Tenerife",
    digitalMenuHeroSubtitle:
      "Transform your paper menu into a marketing and sales tool your customers will love. No commissions, no intermediaries, 100% yours.",
    digitalMenuHeroCta: "Discover How",

    // Menu QR Landing
    menuQrHeroTitle: "Interactive QR Menu for Modern Restaurants",
    menuQrHeroSubtitle:
      "Offer your customers a visual, fast, and contactless experience. Update your menu in seconds and stand out from your competition in the Canary Islands.",
    menuQrHeroCta: "Request Information",

    // Table Orders Landing
    tableOrdersHeroTitle: "QR Table Orders: Faster Service, More Sales",
    tableOrdersHeroSubtitle:
      "Eliminate waiting times and increase the average ticket. Your customers order and pay from their mobile, and the order goes straight to the kitchen.",
    tableOrdersHeroCta: "View Demo",

    // Digital Menu SEO
    digitalMenuSeoTitle:
      "Digital Menu for Restaurants in Tenerife | Optimize & Sell More",
    digitalMenuSeoDescription:
      "Create your QR digital menu in Tenerife. Attract more customers, increase average ticket size, and eliminate commissions. Solution for restaurants, bars, and hotels in the Canary Islands.",
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
