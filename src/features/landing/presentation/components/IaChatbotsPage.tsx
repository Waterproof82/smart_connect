import React from "react";
import { Helmet } from "react-helmet-async";
import { RelatedServices } from "@shared/components/RelatedServices";
import {
  MessageSquare,
  Smartphone,
  Clock,
  UserPlus,
  Workflow,
  Utensils,
  CalendarCheck,
  Store,
} from "lucide-react";
import {
  ExpertAssistant,
  OPEN_ASSISTANT_EVENT,
} from "@features/chatbot/presentation";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import {
  PageHero,
  Section,
  FaqList,
  WhatsAppCta,
  ClosingCta,
} from "@shared/presentation/layout";
import {
  SeoFaqSchema,
  BreadcrumbListSchema,
  ServiceSchema,
} from "@shared/presentation/components/SeoSchema";
import { useLanguage } from "@shared/context/LanguageContext";
import { trackEvent } from "@shared/utils/analyticsEvents";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/ia-chatbots-tenerife`;
const PAGE_TITLE =
  "Chatbots IA y Automatización en Tenerife | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "Chatbots de IA para web y WhatsApp y automatización de procesos para empresas en Tenerife. Atiende a tus clientes 24/7.";

const IaChatbotsPage: React.FC = () => {
  const { t } = useLanguage();

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
    { question: t.iaFaqQ4, answer: t.iaFaqA4 },
    { question: t.iaFaqQ5, answer: t.iaFaqA5 },
  ];
  const cases = [
    { icon: Utensils, title: t.iaCase1Title, desc: t.iaCase1Desc },
    { icon: CalendarCheck, title: t.iaCase2Title, desc: t.iaCase2Desc },
    { icon: Store, title: t.iaCase3Title, desc: t.iaCase3Desc },
  ];
  const steps = [
    { title: t.iaStep1Title, desc: t.iaStep1Desc },
    { title: t.iaStep2Title, desc: t.iaStep2Desc },
    { title: t.iaStep3Title, desc: t.iaStep3Desc },
  ];
  const servicio = "Chatbots IA";

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
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og/ia-chatbots.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Chatbots de IA y automatización en Tenerife"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/ia-chatbots.png"
        />
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

      <PageShell
        waMessage={t.waMsgIa}
        servicio={servicio}
        extras={<ExpertAssistant />}
      >
        <PageHero
          title={t.iaH1}
          lede={t.iaIntro}
          actions={
            <WhatsAppCta
              label={t.iaCtaButton}
              message={t.waMsgIa}
              servicio={servicio}
            />
          }
        />

        <Section label={t.iaH1}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)] list-none p-0 m-0">
            {cards.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="ds-card">
                <Icon
                  className="w-7 h-7 text-[var(--color-primary)] mb-4"
                  aria-hidden="true"
                />
                <h2 className="ds-h3 mb-2">{title}</h2>
                <p className="text-muted leading-relaxed m-0">{desc}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="ia-automatizacion"
          tone="alt"
          width="prose"
          title={t.iaAutoTitle}
          intro={t.iaAutoDesc}
        >
          <Workflow
            className="w-8 h-8 text-[var(--color-primary)]"
            aria-hidden="true"
          />
        </Section>

        <Section id="ia-cases" title={t.iaCasesTitle}>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-md)] list-none p-0 m-0">
            {cases.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="ds-card">
                <Icon
                  className="w-7 h-7 text-[var(--color-primary)] mb-4"
                  aria-hidden="true"
                />
                <h3 className="ds-h3 mb-2">{title}</h3>
                <p className="text-muted leading-relaxed m-0">{desc}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="ia-demo"
          tone="alt"
          width="prose"
          title={t.iaDemoTitle}
          intro={t.iaDemoDesc}
        >
          <button
            type="button"
            onClick={() => {
              trackEvent("chatbot_demo_open", {
                page_path: "/ia-chatbots-tenerife",
              });
              globalThis.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
            }}
            className="btn-ghost"
          >
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            {t.iaDemoButton}
          </button>
        </Section>

        <Section id="ia-steps" title={t.iaStepsTitle}>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-lg)] list-none p-0 m-0">
            {steps.map(({ title, desc }, i) => (
              <li
                key={title}
                className="border-t border-[var(--color-border)] pt-[var(--space-md)]"
              >
                <span
                  className="block font-display text-sm text-muted tabular-nums mb-2"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ds-h3 mb-2">{title}</h3>
                <p className="text-muted leading-relaxed m-0">{desc}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="ia-faq" width="prose" title={t.iaFaqTitle}>
          <FaqList
            items={faqs.map((f) => ({ q: f.question, a: f.answer }))}
          />
        </Section>

        <ClosingCta
          id="ia-cta"
          title={t.iaCtaTitle}
          label={t.iaCtaButton}
          message={t.waMsgIa}
          servicio={servicio}
        />
        <RelatedServices currentId="ia-chatbots" />
      </PageShell>
    </>
  );
};

export default IaChatbotsPage;
