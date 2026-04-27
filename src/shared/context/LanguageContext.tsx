import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'es' | 'en';

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

  // Carta Digital Page
  cartaHeroEyebrow: string;
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
  cartaFlujoStep1Title: string;
  cartaFlujoStep1Desc: string;
  cartaFlujoStep2Title: string;
  cartaFlujoStep2Desc: string;
  cartaFlujoStep3Title: string;
  cartaFlujoStep3Desc: string;
  cartaFlujoStep4Title: string;
  cartaFlujoStep4Desc: string;
  
  cartaDineroTitle: string;
  cartaDineroSubtitle: string;
  cartaDineroCalcDesc: string;
  cartaDineroIntermediarios: string;
  cartaDineroGlovo: string;
  cartaDineroJustEat: string;
  cartaDineroUber: string;
  cartaDineroTotal: string;
  cartaDineroTuCarta: string;
  cartaDineroComision: string;
  cartaDineroSuscripcion: string;
  cartaDineroClientes: string;
  cartaDineroAhorro: string;
  cartaDineroAhorroAnual: string;
  
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
}

const translations: Record<Language, Translation> = {
  es: {
    // Navigation
    navSolutions: 'Soluciones',
    navSuccess: 'Éxito',
    navContact: 'Contacto',
    navAdmin: 'Admin',
    navBack: 'Volver',
    
    // Hero
    heroEyebrow: 'La revolución digital para negocios locales',
    heroTitle: 'Impulsa tu negocio con',
    heroTitleAccent: 'Inteligencia Artificial',
    heroTitleEnd: 'y automatización',
    heroSubtitle: 'Tecnología de próxima generación para negocios locales. Automatiza tareas, fideliza clientes y escala tu empresa con soluciones inteligentes.',
    heroButtonDemo: 'Ver Demo',
    heroButtonContact: 'Contactar',
    heroStats5Lang: 'Idiomas',
    heroStats0Commission: 'Sin comisiones',
    heroStats247: 'Soporte 24/7',
    heroStatsInfinite: 'Integraciones',
    
    // Features
    featuresTitle: 'Nuestras Soluciones',
    featuresSubtitle: 'Herramientas avanzadas diseñadas para la era digital, desde el hardware hasta el código.',
    featuresSoftwareIA: 'Software & IA',
    featuresSoftwareIADesc: 'Desarrollo de herramientas personalizadas que se integran perfectamente con tus sistemas actuales. Soluciones a medida impulsadas por algoritmos inteligentes.',
    featuresAutomation: 'Automatización (n8n)',
    featuresAutomationDesc: 'Orquesta flujos de trabajo complejos sin esfuerzo. Conectamos tus apps favoritas y automatizamos tareas repetitivas para que tu equipo se enfoque en innovar.',
    featuresNFC: 'Tarjetas Tap-to-Review',
    featuresNFCDesc: 'Hardware físico con alma digital. Tarjetas NFC elegantes que permiten a tus clientes dejar reseñas positivas al instante con un solo toque.',
    featuresQribar: 'QRIBAR',
    featuresQribarDesc: 'El cliente pide desde su móvil en la mesa y el pedido llega en tiempo real a barra y cocina. Elimina esperas del camarero y aumenta la rotación de mesas.',
    featuresCartaDigital: 'Carta Digital Premium',
    featuresCartaDigitalDesc: 'La carta digital que elimina intermediarios. 0% comisiones, 5 idiomas, pedidos por WhatsApp y tu propia base de datos de clientes.',
    featuresVisit: 'Visitar',
    featuresContact: 'Contactar',
    featuresDetails: 'Ver detalles',
    
    // Success Stats
    successTitle: 'Casos de Éxito',
    successSubtitle: 'Resultados reales que transforman negocios',
    successStat1Value: '50+',
    successStat1Label: 'Aumento Promedio',
    successStat1Quote: 'Desde que implementamos QRIBAR, nuestros ingresos por mesa aumentaron un 45%',
    successStat1Author: "Restaurante L'Escale",
    successStat2Value: '98%',
    successStat2Label: 'Satisfacción',
    successStat2Quote: 'Mis clientes adoran la experiencia. Las reseñas positivas se dispararon',
    successStat2Author: 'Café Central Madrid',
    successStat3Value: '45%',
    successStat3Label: 'Reseñas Ganadas',
    successStat3Quote: 'Pasamos de 200 a 1200 reseñas en Google. Es increíble el impacto',
    successStat3Author: 'Bar Bodega Toledo',
    successStat4Value: '850+',
    successStat4Label: 'Clientes Activos',
    successStat4Quote: 'Más de 850 negocios confían en SmartConnect para su transformación digital',
    successStat4Author: 'Comunidad Hostelera',
    
    // Contact
    contactTitle: 'Impulsa tu Negocio Hoy',
    contactSubtitle: '¿Hablamos? Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.',
    contactEmailTitle: 'Email Directo',
    contactEmailDesc: 'Respondemos en menos de 2 horas',
    contactEmailLoading: 'Cargando...',
    contactEmailError: 'No disponible',
    contactWhatsappTitle: 'WhatsApp Business',
    contactWhatsappDesc: 'Soporte técnico inmediato',
    contactLocationTitle: 'Nuestras Oficinas',
    contactFormName: 'Nombre Completo',
    contactFormCompany: 'Empresa',
    contactFormEmail: 'Correo Electrónico',
    contactFormService: 'Servicio de Interés',
    contactFormMessage: 'Mensaje',
    contactFormSubmit: 'Enviar Mensaje',
    contactFormLoading: 'Cargando configuración...',
    contactFormSending: 'Enviando mensaje...',
    contactSuccess: '¡Mensaje enviado! Te contactaremos en menos de 2 horas.',
    contactError: 'No se pudo enviar. Intenta de nuevo o contáctanos por otro medio.',
    contactPlaceholderName: 'Ej. Juan Pérez',
    contactPlaceholderCompany: 'Ej. Restaurante L\'Escale',
    contactPlaceholderEmail: 'juan@empresa.com',
    contactSelectOption: 'Selecciona una opción',
    contactPlaceholderMessage: 'Cuéntanos brevemente sobre tu proyecto...',
    contactFormNameRequired: 'El nombre es obligatorio',
    contactFormCompanyRequired: 'La empresa es obligatoria',
    contactFormEmailRequired: 'El email es obligatorio',
    contactFormEmailInvalid: 'El email no es válido',
    contactFormServiceRequired: 'Selecciona un servicio',
    contactFormMessageRequired: 'El mensaje es obligatorio',
    contactFormMessageMinLength: 'El mensaje debe tener al menos 10 caracteres',
    
    // Footer
    footerTagline: 'Tecnología de próxima generación para negocios locales.',
    footerNavTitle: 'Navegación',
    footerNavInicio: 'Inicio',
    footerNavSoluciones: 'Soluciones',
    footerNavExito: 'Casos de Éxito',
    footerNavContacto: 'Contacto',
    footerLegalTitle: 'Legal',
    footerLegalAviso: 'Aviso Legal',
    footerLegalPrivacidad: 'Política de Privacidad',
    footerLegalCookies: 'Política de Cookies',
    footerCopyright: '© 2026 SmartConnect AI. Todos los derechos reservados.',
    
    // Navbar Solutions
    navbarSoftwareIA: 'Software & IA',
    navbarSoftwareIADesc: 'Soluciones a medida',
    navbarAutomation: 'Automatización n8n',
    navbarAutomationDesc: 'Flujos inteligentes',
    navbarNFC: 'Tarjetas NFC',
    navbarNFCDesc: 'Reseñas al instante',
    navbarQribar: 'QRIBAR',
    navbarQribarDesc: 'Pedido en tiempo real a barra y cocina',
    navbarCartaDigital: 'Carta Digital Premium',
    navbarCartaDigitalDesc: '0% comisiones, 5 idiomas',
    
    // Service options
    serviceCartaDigital: 'Carta Digital Premium',
    serviceQribar: 'QRIBAR - Pedido en tiempo real a barra y cocina',
    serviceAutomation: 'Automatización n8n',
    serviceNFC: 'Tarjetas NFC Reseñas',
    serviceConsultoria: 'Consultoría IA',
    
    // Error Boundary
    errorBoundaryTitle: 'Algo salió mal',
    errorBoundaryMessage: 'Por favor, recarga la página.',
    errorBoundaryButton: 'Recargar',
    
    // Skip Link
    skipLink: 'Saltar al contenido',
    
    // QRIBAR
    qribarSector: 'SECTOR HOSTELERÍA',
    qribarTitle: 'Digitaliza la experiencia con',
    qribarSubtitle: 'Soluciones específicas para restaurantes de alta gama. Menús digitales elegantes, rápidos y sin contacto que elevan la percepción de tu marca mientras optimizan el servicio.',
    qribarBenefit1: 'Actualización de precios en tiempo real',
    qribarBenefit2: 'Diseño adaptable a tu identidad visual',
    qribarBenefit3: 'Aumenta la rotación de mesas',
    qribarBenefit4: 'Integración con sistemas de pedidos y pagos',
    qribarButton: 'Más información',
    qribarError: 'Error al cargar el menú',
    qribarLoading: 'Cargando menú...',
    
    // Carta Digital Page
    cartaHeroEyebrow: 'La revolución digital para restaurantes',
    cartaHeroTitle1: 'Tu carta,',
    cartaHeroTitleAccent: 'tu negocio,',
    cartaHeroTitle2: 'tus clientes.',
    cartaHeroSubtitle: 'Una carta digital autogestionable que transforma la experiencia de tus comensales, elimina intermediarios y convierte cada visita en un cliente fiel.',
    cartaHeroButtonDemo: 'Ver cómo funciona',
    cartaHeroButtonCalc: 'Calcular ahorro',
    cartaHeroStat1Label: 'Idiomas',
    cartaHeroStat2Label: 'Comisiones',
    cartaHeroStat3Label: 'Pedidos online',
    cartaHeroStat4Label: 'Clientes',
    cartaHeroCardLabel: 'Tap-to-Review NFC',
    
    cartaProblemaTitle: '¿Cuánto dinero',
    cartaProblemaSubtitle: 'estás perdiendo hoy?',
    cartaProblemaDesc: 'La mayoría de restaurantes dependen de sistemas anticuados, intermediarios costosos y herramientas que no les pertenecen. El resultado: margen reducido, clientes anónimos y oportunidades perdidas.',
    cartaProblemaItem1Title: 'Comisiones que sangran',
    cartaProblemaItem1Desc: 'Glovo, Uber Eats y similares se quedan entre el 25% y el 35% de cada pedido. Túizas, ellos se llevan el margen.',
    cartaProblemaItem2Title: 'Carta en papel obsoleta',
    cartaProblemaItem2Desc: 'Sin fotos, sin descripciones claras, sin idiomas. El cliente no sabe qué va a pedir y llama al camarero tres veces.',
    cartaProblemaItem3Title: 'Turistas sin atender',
    cartaProblemaItem3Desc: 'El cliente extranjero no entiende la carta y pide lo más sencillo. Ticket medio más bajo garantizado.',
    cartaProblemaItem4Title: 'Llamadas perdidas',
    cartaProblemaItem4Desc: 'Gestionar pedidos por teléfono mientras sirves mesas es imposible.',
    cartaProblemaItem5Title: 'Clientes anónimos',
    cartaProblemaItem5Desc: 'Cada cliente que pide por Glovo es de Glovo, no tuyo. No tienes su contacto.',
    cartaProblemaItem6Title: 'Invisible en internet',
    cartaProblemaItem6Desc: 'Sin web propia optimizada en buscadores, dependes de plataformas de terceros.',
    
    cartaSolucionTitle: 'La solución',
    cartaSolucionSubtitle: 'Una sola herramienta. Todos los problemas, resueltos.',
    cartaSolucionHighlight: 'carta digital multimedia',
    cartaSolucionDesc: 'Tus clientes ven los platos con fotos, vídeos y descripciones en 5 idiomas escaneando el QR de la mesa. Los nuevos clientes encuentran tu carta en Google y hacen pedidos take away directamente. Tú recibes el pedido por WhatsApp, acumulas su contacto en tu base de datos y les fidelizas con promociones. Sin intermediarios. Sin comisiones. Sin depender de nadie.',
    
    cartaBeneficiosTitle: '7 beneficios que',
    cartaBeneficiosSubtitle: 'cambian tu negocio',
    cartaBeneficio1Title: 'Experiencia premium en mesa',
    cartaBeneficio1Desc: 'Cada plato se presenta con fotos profesionales, vídeos y descripciones detalladas. El cliente sabe exactamente qué va a pedir.',
    cartaBeneficio1Tag: '↑ Ticket medio',
    cartaBeneficio2Title: 'Sin barreras de idioma',
    cartaBeneficio2Desc: 'La carta se adapta automáticamente a 5 idiomas. Turistas entienden la oferta completa.',
    cartaBeneficio2Tag: '↑ Satisfacción',
    cartaBeneficio3Title: 'Cero comisiones',
    cartaBeneficio3Desc: 'Los pedidos para recogido llegan directamente. Te ahorras entre el 25% y el 35%.',
    cartaBeneficio3Tag: 'Ahorro real',
    cartaBeneficio4Title: 'Tus clientes, tu base',
    cartaBeneficio4Desc: 'Cada pedido online pasa a ser tuyo. Envías promociones cuando quieras.',
    cartaBeneficio4Tag: 'Fidelización',
    cartaBeneficio5Title: 'Pedidos por WhatsApp',
    cartaBeneficio5Desc: 'Los pedidos llegan en tiempo real por WhatsApp, bien estructurados.',
    cartaBeneficio5Tag: '↓ Errores',
    cartaBeneficio6Title: 'Presencia digital',
    cartaBeneficio6Desc: 'Web SEO, Google Business, redes sociales. Apareces cuando te buscan.',
    cartaBeneficio6Tag: '↑ Visibilidad',
    cartaBeneficio7Title: 'Gestión total',
    cartaBeneficio7Desc: 'Añade, edita u oculta platos en segundos. Todo desde un panel intuitivo.',
    cartaBeneficio7Tag: 'Autogestionable',
    
    cartaFlujoTitle: 'El flujo',
    cartaFlujoSubtitle: '¿Cómo funciona en la práctica?',
    cartaFlujoStep1Title: 'Escanea el QR',
    cartaFlujoStep1Desc: 'El cliente apunta la cámara al QR de la mesa.',
    cartaFlujoStep2Title: 'Explora',
    cartaFlujoStep2Desc: 'Ve cada plato con imágenes y precio.',
    cartaFlujoStep3Title: 'Fidelización',
    cartaFlujoStep3Desc: 'Recibe oferta a cambio de su email.',
    cartaFlujoStep4Title: 'Pide',
    cartaFlujoStep4Desc: 'Sin dudas, sin malentendidos.',
    
    cartaDineroTitle: 'La matemática',
    cartaDineroSubtitle: 'Lo que te cobrabas vs. lo que pagarías con nosotros',
    cartaDineroCalcDesc: 'Basado en un restaurante con 3.000€/mes en pedidos take away. Los números hablan solos.',
    cartaDineroIntermediarios: '❌ Con intermediarios',
    cartaDineroGlovo: 'Glovo (~28%)',
    cartaDineroJustEat: 'Just Eat (~25%)',
    cartaDineroUber: 'Uber Eats (~30%)',
    cartaDineroTotal: 'Total mensual',
    cartaDineroTuCarta: '✅ Con tu carta',
    cartaDineroComision: 'Comisión',
    cartaDineroSuscripcion: 'Suscripción',
    cartaDineroClientes: 'Clientes',
    cartaDineroAhorro: 'Ahorro mensual',
    cartaDineroAhorroAnual: '8.000€ al año.',
    
    cartaBBDDTitle: 'Tu activo más valioso',
    cartaBBDDSubtitle: 'La base de datos que trabaja sola',
    cartaBBDDDesc: 'Cada cliente que entra en tu local o hace un pedido online es una oportunidad. Con esta herramienta, no se escapa ninguna.',
    cartaBBDDLabel1: 'QR en mesa',
    cartaBBDDLabel2: 'Take Away',
    cartaBBDDLabelTuBBDD: 'TU BBDD',
    cartaBBDDData1: 'Nombre',
    cartaBBDDData2: 'Email',
    cartaBBDDData3: 'Teléfono',
    cartaBBDDData4: 'Historial',
    cartaBBDDAction1: 'Email',
    cartaBBDDAction2: 'Promo',
    cartaBBDDAction3: 'Recuperar',
    
    cartaDemoTitle: 'El producto real',
    cartaDemoVideoLabel: '▶ Así se ven tus platos en la carta digital',
    cartaDemoScreen1Title: '📱 Carta digital — QR en mesa',
    cartaDemoScreen1Label: 'Vista del cliente',
    cartaDemoScreen2Title: '⚙️ Panel de gestión y estadísticas',
    cartaDemoScreen2Label: 'Panel de administración',
    cartaDemoScreen3Title: '📧 Pedidos en tiempo real',
    cartaDemoScreen3Label: 'Gestión de pedidos',
    
    cartaCTATitle: 'El siguiente paso',
    cartaCTASubtitle: 'Empieza a trabajar para ti.',
    cartaCTABtnDemo: 'Demo gratuita',
    cartaCTABtnContact: 'Habar con asesor',
    cartaCTANoContract: '✓ Sin permanencia',
    cartaCTASignup48h: '✓ Alta 48h',
    cartaCTASupport: '✓ Soporte',
    cartaCTANoComm: '✓ 0% comisiones',
  },
  en: {
    // Navigation
    navSolutions: 'Solutions',
    navSuccess: 'Success',
    navContact: 'Contact',
    navAdmin: 'Admin',
    navBack: 'Back',
    
    // Hero
    heroEyebrow: 'Digital revolution for local businesses',
    heroTitle: 'Boost your business with',
    heroTitleAccent: 'Artificial Intelligence',
    heroTitleEnd: 'and automation',
    heroSubtitle: 'Next-generation technology for local businesses. Automate tasks, retain customers and scale your company with smart solutions.',
    heroButtonDemo: 'View Demo',
    heroButtonContact: 'Contact Us',
    heroStats5Lang: 'Languages',
    heroStats0Commission: 'No commissions',
    heroStats247: 'Support 24/7',
    heroStatsInfinite: 'Integrations',
    
    // Features
    featuresTitle: 'Our Solutions',
    featuresSubtitle: 'Advanced tools designed for the digital era, from hardware to code.',
    featuresSoftwareIA: 'Software & AI',
    featuresSoftwareIADesc: 'Custom tool development that integrates perfectly with your existing systems. Tailored solutions powered by intelligent algorithms.',
    featuresAutomation: 'Automation (n8n)',
    featuresAutomationDesc: 'Orchestrate complex workflows effortlessly. Connect your favorite apps and automate repetitive tasks so your team can focus on innovation.',
    featuresNFC: 'Tap-to-Review Cards',
    featuresNFCDesc: 'Physical hardware with a digital soul. Elegant NFC cards that allow your customers to leave positive reviews instantly with a single tap.',
    featuresQribar: 'QRIBAR',
    featuresQribarDesc: 'Customers order from their phone at the table and the order arrives in real-time to the bar and kitchen. Eliminates waiter wait times and increases table turnover.',
    featuresCartaDigital: 'Carta Digital Premium',
    featuresCartaDigitalDesc: 'The digital menu that eliminates intermediaries. 0% commissions, 5 languages, WhatsApp orders and your own customer database.',
    featuresVisit: 'Visit',
    featuresContact: 'Contact',
    featuresDetails: 'View details',
    
    // Success Stats
    successTitle: 'Success Stories',
    successSubtitle: 'Real results that transform businesses',
    successStat1Value: '50+',
    successStat1Label: 'Average Increase',
    successStat1Quote: 'Since we implemented QRIBAR, our revenue per table increased by 45%',
    successStat1Author: "Restaurante L'Escale",
    successStat2Value: '98%',
    successStat2Label: 'Satisfaction',
    successStat2Quote: 'My clients love the experience. Positive reviews skyrocketed',
    successStat2Author: 'Café Central Madrid',
    successStat3Value: '45%',
    successStat3Label: 'Reviews Gained',
    successStat3Quote: 'We went from 200 to 1200 Google reviews. The impact is incredible',
    successStat3Author: 'Bar Bodega Toledo',
    successStat4Value: '850+',
    successStat4Label: 'Active Clients',
    successStat4Quote: 'More than 850 businesses trust SmartConnect for their digital transformation',
    successStat4Author: 'Hospitality Community',
    
    // Contact
    contactTitle: 'Boost Your Business Today',
    contactSubtitle: "Let's talk? We're ready to audit your current process and show you how AI and automation can save you hundreds of hours monthly.",
    contactEmailTitle: 'Direct Email',
    contactEmailDesc: 'We respond in under 2 hours',
    contactEmailLoading: 'Loading...',
    contactEmailError: 'Not available',
    contactWhatsappTitle: 'WhatsApp Business',
    contactWhatsappDesc: 'Immediate technical support',
    contactLocationTitle: 'Our Offices',
    contactFormName: 'Full Name',
    contactFormCompany: 'Company',
    contactFormEmail: 'Email Address',
    contactFormService: 'Service of Interest',
    contactFormMessage: 'Message',
    contactFormSubmit: 'Send Message',
    contactFormLoading: 'Loading configuration...',
    contactFormSending: 'Sending message...',
    contactSuccess: 'Message sent! We will contact you in under 2 hours.',
    contactError: 'Could not send. Please try again or contact us through another method.',
    contactPlaceholderName: 'e.g. John Smith',
    contactPlaceholderCompany: 'e.g. The Restaurant',
    contactPlaceholderEmail: 'john@company.com',
    contactSelectOption: 'Select an option',
    contactPlaceholderMessage: 'Tell us briefly about your project...',
    contactFormNameRequired: 'Name is required',
    contactFormCompanyRequired: 'Company is required',
    contactFormEmailRequired: 'Email is required',
    contactFormEmailInvalid: 'Email is not valid',
    contactFormServiceRequired: 'Please select a service',
    contactFormMessageRequired: 'Message is required',
    contactFormMessageMinLength: 'Message must be at least 10 characters',
    
    // Footer
    footerTagline: 'Next-generation technology for local businesses.',
    footerNavTitle: 'Navigation',
    footerNavInicio: 'Home',
    footerNavSoluciones: 'Solutions',
    footerNavExito: 'Success Stories',
    footerNavContacto: 'Contact',
    footerLegalTitle: 'Legal',
    footerLegalAviso: 'Legal Notice',
    footerLegalPrivacidad: 'Privacy Policy',
    footerLegalCookies: 'Cookie Policy',
    footerCopyright: '© 2026 SmartConnect AI. All rights reserved.',
    
    // Navbar Solutions
    navbarSoftwareIA: 'Software & AI',
    navbarSoftwareIADesc: 'Tailored solutions',
    navbarAutomation: 'Automation n8n',
    navbarAutomationDesc: 'Smart workflows',
    navbarNFC: 'NFC Cards',
    navbarNFCDesc: 'Instant reviews',
    navbarQribar: 'QRIBAR',
    navbarQribarDesc: 'Real-time orders to bar & kitchen',
    navbarCartaDigital: 'Carta Digital Premium',
    navbarCartaDigitalDesc: '0% commissions, 5 languages',
    
    // Service options
    serviceCartaDigital: 'Carta Digital Premium',
    serviceQribar: 'QRIBAR - Real-time order to bar & kitchen',
    serviceAutomation: 'Automation n8n',
    serviceNFC: 'NFC Review Cards',
    serviceConsultoria: 'AI Consulting',
    
    // Error Boundary
    errorBoundaryTitle: 'Something went wrong',
    errorBoundaryMessage: 'Please, reload the page.',
    errorBoundaryButton: 'Reload',
    
    // Skip Link
    skipLink: 'Skip to main content',
    
    // QRIBAR
    qribarSector: 'HOSPITALITY SECTOR',
    qribarTitle: 'Digitalize the experience with',
    qribarSubtitle: 'Specific solutions for high-end restaurants. Elegant, fast, contactless digital menus that elevate your brand perception while optimizing service.',
    qribarBenefit1: 'Real-time price updates',
    qribarBenefit2: 'Design adapted to your visual identity',
    qribarBenefit3: 'Increases table turnover',
    qribarBenefit4: 'Integration with order and payment systems',
    qribarButton: 'More information',
    qribarError: 'Error loading menu',
    qribarLoading: 'Loading menu...',
    
    // Carta Digital Page
    cartaHeroEyebrow: 'Digital revolution for restaurants',
    cartaHeroTitle1: 'Your menu,',
    cartaHeroTitleAccent: 'your business,',
    cartaHeroTitle2: 'your customers.',
    cartaHeroSubtitle: 'A self-managed digital menu that transforms your diners experience, eliminates intermediaries and turns every visit into a loyal customer.',
    cartaHeroButtonDemo: 'See how it works',
    cartaHeroButtonCalc: 'Calculate savings',
    cartaHeroStat1Label: 'Languages',
    cartaHeroStat2Label: 'Commissions',
    cartaHeroStat3Label: 'Online orders',
    cartaHeroStat4Label: 'Customers',
    cartaHeroCardLabel: 'Tap-to-Review NFC',
    
    cartaProblemaTitle: 'How much money',
    cartaProblemaSubtitle: 'are you losing today?',
    cartaProblemaDesc: 'Most restaurants rely on outdated systems, expensive intermediaries and tools that don\'t belong to them. The result: reduced margins, anonymous customers and missed opportunities.',
    cartaProblemaItem1Title: 'Bleeding commissions',
    cartaProblemaItem1Desc: 'Glovo, Uber Eats and similar take between 25% and 35% of each order. You work, they take the margin.',
    cartaProblemaItem2Title: 'Paper menu obsolete',
    cartaProblemaItem2Desc: 'No photos, no clear descriptions, no languages. The customer doesn\'t know what to order and calls the waiter three times.',
    cartaProblemaItem3Title: 'Unattended tourists',
    cartaProblemaItem3Desc: 'The foreign customer doesn\'t understand the menu and orders the simplest thing. Lower average ticket guaranteed.',
    cartaProblemaItem4Title: 'Lost calls',
    cartaProblemaItem4Desc: 'Managing orders by phone while serving tables is impossible.',
    cartaProblemaItem5Title: 'Anonymous customers',
    cartaProblemaItem5Desc: 'Every customer who orders through Glovo belongs to Glovo, not yours. You don\'t have their contact.',
    cartaProblemaItem6Title: 'Invisible online',
    cartaProblemaItem6Desc: 'No own website optimized for search engines, you depend on third-party platforms.',
    
    cartaSolucionTitle: 'The solution',
    cartaSolucionSubtitle: 'One tool. All problems, solved.',
    cartaSolucionHighlight: 'multimedia digital menu',
    cartaSolucionDesc: 'Your customers see dishes with photos, videos and descriptions in 5 languages by scanning the table QR. New customers find your menu on Google and order take away directly. You receive orders via WhatsApp, accumulate their contact in your database and fidelize them with promotions. No intermediaries. No commissions. Depending on no one.',
    
    cartaBeneficiosTitle: '7 benefits that',
    cartaBeneficiosSubtitle: 'change your business',
    cartaBeneficio1Title: 'Premium table experience',
    cartaBeneficio1Desc: 'Each dish is presented with professional photos, videos and detailed descriptions. The customer knows exactly what to order.',
    cartaBeneficio1Tag: '↑ Average ticket',
    cartaBeneficio2Title: 'No language barriers',
    cartaBeneficio2Desc: 'The menu automatically adapts to 5 languages. Tourists understand the complete offer.',
    cartaBeneficio2Tag: '↑ Satisfaction',
    cartaBeneficio3Title: 'Zero commissions',
    cartaBeneficio3Desc: 'Pickup orders arrive directly. You save between 25% and 35%.',
    cartaBeneficio3Tag: 'Real savings',
    cartaBeneficio4Title: 'Your clients, your database',
    cartaBeneficio4Desc: 'Every online order becomes yours. Send promotions whenever you want.',
    cartaBeneficio4Tag: 'Fidelization',
    cartaBeneficio5Title: 'Orders via WhatsApp',
    cartaBeneficio5Desc: 'Orders arrive in real-time via WhatsApp, well structured.',
    cartaBeneficio5Tag: '↓ Errors',
    cartaBeneficio6Title: 'Digital presence',
    cartaBeneficio6Desc: 'SEO web, Google Business, social media. You appear when searched.',
    cartaBeneficio6Tag: '↑ Visibility',
    cartaBeneficio7Title: 'Total management',
    cartaBeneficio7Desc: 'Add, edit or hide dishes in seconds. Everything from an intuitive panel.',
    cartaBeneficio7Tag: 'Self-manageable',
    
    cartaFlujoTitle: 'The flow',
    cartaFlujoSubtitle: 'How it works in practice?',
    cartaFlujoStep1Title: 'Scan the QR',
    cartaFlujoStep1Desc: 'The customer points the camera at the table QR.',
    cartaFlujoStep2Title: 'Explore',
    cartaFlujoStep2Desc: 'See each dish with images and price.',
    cartaFlujoStep3Title: 'Fidelization',
    cartaFlujoStep3Desc: 'Receives an offer in exchange for their email.',
    cartaFlujoStep4Title: 'Order',
    cartaFlujoStep4Desc: 'No doubts, no misunderstandings.',
    
    cartaDineroTitle: 'The math',
    cartaDineroSubtitle: 'What you were charging vs. what you\'d pay with us',
    cartaDineroCalcDesc: 'Based on a restaurant with €3,000/month in take away orders. The numbers speak for themselves.',
    cartaDineroIntermediarios: '❌ With intermediaries',
    cartaDineroGlovo: 'Glovo (~28%)',
    cartaDineroJustEat: 'Just Eat (~25%)',
    cartaDineroUber: 'Uber Eats (~30%)',
    cartaDineroTotal: 'Monthly total',
    cartaDineroTuCarta: '✅ With your menu',
    cartaDineroComision: 'Commission',
    cartaDineroSuscripcion: 'Subscription',
    cartaDineroClientes: 'Clients',
    cartaDineroAhorro: 'Monthly savings',
    cartaDineroAhorroAnual: '€8,000 per year.',
    
    cartaBBDDTitle: 'Your most valuable asset',
    cartaBBDDSubtitle: 'The database that works for you',
    cartaBBDDDesc: 'Every customer who enters your establishment or places an online order is an opportunity. With this tool, none escape.',
    cartaBBDDLabel1: 'Table QR',
    cartaBBDDLabel2: 'Take Away',
    cartaBBDDLabelTuBBDD: 'YOUR DB',
    cartaBBDDData1: 'Name',
    cartaBBDDData2: 'Email',
    cartaBBDDData3: 'Phone',
    cartaBBDDData4: 'History',
    cartaBBDDAction1: 'Email',
    cartaBBDDAction2: 'Promo',
    cartaBBDDAction3: 'Recover',
    
    cartaDemoTitle: 'The real product',
    cartaDemoVideoLabel: '▶ This is how your dishes look on the digital menu',
    cartaDemoScreen1Title: '📱 Digital menu — QR at table',
    cartaDemoScreen1Label: 'Client view',
    cartaDemoScreen2Title: '⚙️ Management and statistics panel',
    cartaDemoScreen2Label: 'Admin panel',
    cartaDemoScreen3Title: '📧 Real-time orders',
    cartaDemoScreen3Label: 'Order management',
    
    cartaCTATitle: 'The next step',
    cartaCTASubtitle: 'Start working for yourself.',
    cartaCTABtnDemo: 'Free demo',
    cartaCTABtnContact: 'Talk to advisor',
    cartaCTANoContract: '✓ No contract',
    cartaCTASignup48h: '✓ Setup in 48h',
    cartaCTASupport: '✓ Support',
    cartaCTANoComm: '✓ 0% commissions',
  }
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'es') return saved;
    }
    return 'es';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, []);

  const value: LanguageContextValue = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language, Translation };