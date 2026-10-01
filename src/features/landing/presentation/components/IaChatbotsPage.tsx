import React from "react";
import { Helmet } from "react-helmet-async";
import { MessageSquare, Smartphone, Clock, UserPlus, Workflow } from "lucide-react";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import {
  SeoFaqSchema,
  BreadcrumbListSchema,
  ServiceSchema,
} from "@shared/presentation/components/SeoSchema";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/ia-chatbots-tenerife`;
const PAGE_TITLE = "Chatbots IA y Automatización en Tenerife | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "Chatbots de IA para web y WhatsApp y automatización de procesos para empresas en Tenerife. Atiende a tus clientes 24/7.";

const IaChatbotsPage: React.FC = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const whatsappPhone = useWhatsappPhone();

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const cards = [
    { icon: MessageSquare, title: t.iaCard1Title, desc: t.iaCard1Desc },
    { icon: Smartphone, title: t.iaCard2Title, desc: t.iaCard2Desc },
    { icon: Clock, title: t.iaCard3Title, desc: t.iaCard3Desc },
    { icon: UserPlus, title: t.iaCard4Title, desc: t.iaCard4Desc },
  ];
  const faqs = [
    { question: t.iaFaqQ1, answer: t.iaFaqA1 },
    { question: t.iaFaqQ2, answer: t.iaFaqA2 },
    { question: t.iaFaqQ3, answer: t.iaFaqA3 },
  ];
  const ctaHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "/#contacto";

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={`${ORG_URL}/icon.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={`${ORG_URL}/icon.png`} />
      </Helmet>

      <ServiceSchema
        name="Chatbots IA y automatización"
        description={PAGE_DESCRIPTION}
        url={PAGE_URL}
        providerName="Digitaliza Tenerife"
        providerUrl={ORG_URL}
        providerLogoUrl={`${ORG_URL}/icon.png`}
        areaServed={["Tenerife", "Canarias"]}
        serviceType="AI Chatbot and Automation"
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: `${ORG_URL}/` },
          { name: "Chatbots IA", url: PAGE_URL },
        ]}
      />
      <SeoFaqSchema faqs={faqs} />

      <div className="min-h-screen bg-base text-default">
        <div
          ref={sentinelRef}
          className="absolute top-[50px] h-px w-px"
          aria-hidden="true"
        />
        <Navbar scrolled={scrolled} />

        <main id="main" aria-label="Contenido principal">
          <section className="pt-32 pb-16 md:pt-40 md:pb-24">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] font-display mb-6">
                {t.iaH1}
              </h1>
              <p className="text-lg text-muted leading-relaxed max-w-2xl mb-10">
                {t.iaIntro}
              </p>
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
              >
                {t.iaCtaButton}
              </a>
            </div>
          </section>

          <section
            aria-label={t.iaH1}
            className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
          >
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 list-none">
                {cards.map(({ icon: Icon, title, desc }) => (
                  <li
                    key={title}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6"
                  >
                    <Icon
                      className="w-8 h-8 text-[var(--color-primary)] mb-4"
                      aria-hidden="true"
                    />
                    <h2 className="font-bold text-lg mb-2">{title}</h2>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
              <Workflow
                className="w-8 h-8 text-[var(--color-primary)] mb-4"
                aria-hidden="true"
              />
              <h2 className="text-2xl md:text-3xl font-black font-display mb-4">
                {t.iaAutoTitle}
              </h2>
              <p className="text-muted leading-relaxed">{t.iaAutoDesc}</p>
            </div>
          </section>

          <section
            aria-label={t.iaFaqTitle}
            className="max-w-3xl mx-auto px-4 md:px-6 pb-16 md:pb-24"
          >
            <h2 className="text-2xl sm:text-3xl font-black font-display mb-8 text-center">
              {t.iaFaqTitle}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-base select-none">
                    {faq.question}
                    <span className="ml-4 shrink-0 text-[var(--color-primary)] group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 pt-2 text-sm text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-[var(--color-bg-alt)] text-center">
            <h2 className="text-2xl md:text-3xl font-black font-display mb-6">
              {t.iaCtaTitle}
            </h2>
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
            >
              {t.iaCtaButton}
            </a>
          </section>
        </main>

        <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] py-8">
          <div className="container mx-auto px-6 text-center text-muted text-sm">
            <p>&copy; {t.footerCopyright}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default IaChatbotsPage;
