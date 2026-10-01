import React from "react";
import { Helmet } from "react-helmet-async";
import { RelatedServices } from "@shared/components/RelatedServices";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { Section, FaqList } from "@shared/presentation/layout";
import CartaDigitalSection from "@features/landing/presentation/components/CartaDigitalSection";
import {
  ServiceSchema,
  SeoFaqSchema,
  BreadcrumbListSchema,
} from "@shared/presentation/components/SeoSchema";
import { useCartaFaqGroup } from "@features/landing/presentation/components/HomeFaqSection";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { SOLUTIONS } from "@shared/config/solutions";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/carta-digital`;
const PAGE_TITLE = "Carta Digital para Restaurantes | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "Carta digital con pedidos en mesa y para recoger. Sin pagar comisión a Glovo: ahorra el 30 % del margen de cada pedido.";

/**
 * Standalone /carta-digital route. Template = TapReviewPage.tsx: own
 * <Helmet> + page-level JSON-LD + shared Navbar + section body + FAQ group.
 */
const CartaDigitalPage: React.FC = () => {
  const { t } = useLanguage();
  const whatsappPhone = useWhatsappPhone();
  const cartaFaqGroup = useCartaFaqGroup();
  const solutionMeta = SOLUTIONS.find((s) => s.id === "carta-digital");

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
          content="https://digitalizatenerife.es/og/carta-digital.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Carta digital: ahorra el 30 % que se lleva Glovo de cada pedido"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/carta-digital.png"
        />
      </Helmet>

      <ServiceSchema
        name={solutionMeta?.serviceValue ?? "Carta Digital Premium"}
        description={solutionMeta?.jsonLd.description ?? PAGE_DESCRIPTION}
        url={PAGE_URL}
        providerName="Digitaliza Tenerife"
        providerUrl={ORG_URL}
        providerLogoUrl={`${ORG_URL}/icon.png`}
        areaServed={solutionMeta?.jsonLd.areaServed}
        serviceType={solutionMeta?.jsonLd.serviceType}
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: `${ORG_URL}/` },
          { name: "Carta Digital", url: PAGE_URL },
        ]}
      />
      <SeoFaqSchema
        faqs={cartaFaqGroup.items.map((item) => ({
          question: item.q,
          answer: item.a,
        }))}
      />

      <PageShell waMessage={t.waMsgCarta} servicio="Carta Digital">
        <h1 className="sr-only">{t.cartaPageH1}</h1>
        <CartaDigitalSection id="carta-digital" whatsappPhone={whatsappPhone} />

        <Section id="faq" width="prose" title={cartaFaqGroup.title}>
          <FaqList items={cartaFaqGroup.items} />
        </Section>
        <RelatedServices currentId="carta-digital" />
      </PageShell>
    </>
  );
};

export default CartaDigitalPage;
