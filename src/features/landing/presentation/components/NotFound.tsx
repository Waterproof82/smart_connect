import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-default mb-4">404</h1>
      <p className="text-muted text-lg mb-8">Página no encontrada</p>
      <Link
        to="/"
        className="btn-primary"
      >
        Volver al inicio
      </Link>
    </div>
  </>
);
