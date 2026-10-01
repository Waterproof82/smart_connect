import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageHero, WhatsAppCta } from "@shared/presentation/layout";
import { PageShell } from "./PageShell";

export const NotFound: React.FC = () => (
  <>
    <Helmet>
      <title>Página no encontrada - Digitaliza Tenerife</title>
      <meta
        name="description"
        content="La página que buscas no existe o ha sido movida. Vuelve al inicio de Digitaliza Tenerife."
      />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <PageShell showWhatsAppBar={false}>
      <PageHero
        title="404"
        lede="Página no encontrada"
        actions={
          <>
            <Link to="/" className="btn-ghost">
              Volver al inicio
            </Link>
            <WhatsAppCta />
          </>
        }
      />
    </PageShell>
  </>
);
