import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../../../../shared/context/LanguageContext";
import { Cpu, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * About page — authorship and authority signals.
 * Provides organization info, verifiable authorship, and social proof
 * for AI crawlers and human visitors alike.
 */
const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Sobre SmartConnect AI — Quiénes somos</title>
        <meta
          name="description"
          content="SmartConnect AI es una empresa tecnológica con sede en Santa Cruz de Tenerife. Especialistas en IA, automatización y hardware inteligente para negocios locales en Canarias."
        />
        <meta property="og:title" content="Sobre SmartConnect AI" />
        <meta
          property="og:description"
          content="Conoce al equipo detrás de SmartConnect AI. IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalizatenerife.es/about" />
        <link
          rel="author"
          href="https://digitalizatenerife.es/about"
          title="SmartConnect AI"
        />
      </Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Sobre SmartConnect AI",
            description:
              "Información sobre SmartConnect AI, empresa tecnológica especializada en IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.",
            mainEntity: {
              "@type": "Organization",
              name: "SmartConnect AI",
              description:
                "Empresa tecnológica especializada en IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.",
              url: "https://digitalizatenerife.es",
              logo: {
                "@type": "ImageObject",
                url: "https://digitalizatenerife.es/icon.png",
                width: 512,
                height: 512,
              },
              email: "info@digitalizatenerife.es",
              telephone: "+34922123456",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Calle Las Palmas 123",
                addressLocality: "Santa Cruz de Tenerife",
                addressRegion: "Canary Islands",
                postalCode: "38001",
                addressCountry: "ES",
              },
              foundingDate: "2025",
              founder: {
                "@type": "Person",
                name: "SmartConnect AI Team",
              },
              sameAs: [
                "https://twitter.com/smartconnectai",
                "https://linkedin.com/company/smartconnectai",
                "https://instagram.com/smartconnectai",
                "https://facebook.com/smartconnectai",
                "https://youtube.com/@smartconnectai",
              ],
            },
          }),
        }}
      />

      <div className="min-h-screen bg-base text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-base/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <Cpu className="w-5 h-5" />
              <span className="font-bold">
                SmartConnect <span className="text-blue-400">AI</span>
              </span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-blue-600/20 via-blue-900/10 to-base">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Sobre{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SmartConnect AI
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Tecnología, inteligencia artificial y automatización para
              potenciar negocios locales en Tenerife y Canarias.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Nuestra misión
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-6">
              En SmartConnect AI creemos que la tecnología debe estar al
              servicio de los negocios locales. Nuestra misión es democratizar
              el acceso a herramientas de IA, automatización y hardware
              inteligente para que cualquier restaurante, bar o comercio en
              Tenerife y Canarias pueda competir en la era digital.
            </p>
            <p className="text-lg text-white/70 leading-relaxed mb-6">
              Desde menús digitales QRIBAR que transforman la experiencia en
              mesa, hasta tarjetas NFC que multiplican las reseñas en Google,
              pasando por automatizaciones con n8n que liberan horas de trabajo
              cada semana — cada solución está diseñada para generar resultados
              medibles desde el primer día.
            </p>
            <p className="text-lg text-white/70 leading-relaxed">
              Operamos desde Santa Cruz de Tenerife, con un equipo apasionado
              por la tecnología y el desarrollo del tejido empresarial canario.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-white/5">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Nuestros valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Tecnología con propósito",
                  desc: "No implementamos tecnología por moda. Cada solución resuelve un problema real de negocio.",
                },
                {
                  title: "Resultados medibles",
                  desc: "Trabajamos con métricas claras: más reseñas, más pedidos, más ingresos por mesa.",
                },
                {
                  title: "Cercanía local",
                  desc: "Estamos en Tenerife, conocemos el mercado canario y ofrecemos soporte presencial.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-3 text-blue-300">
                    {value.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact info */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Oficina</h3>
                <p className="text-white/60 text-sm">
                  Santa Cruz de Tenerife
                  <br />
                  Islas Canarias, España
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-white/60 text-sm">
                  <a
                    href="mailto:info@digitalizatenerife.es"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    rel="author"
                  >
                    info@digitalizatenerife.es
                  </a>
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Web</h3>
                <p className="text-white-60 text-sm">
                  <a
                    href="https://digitalizatenerife.es"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    rel="author"
                  >
                    digitalizatenerife.es
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center text-white/40 text-sm">
          <div className="container mx-auto px-6">
            <p>{t.footerCopyright}</p>
            <p className="mt-2">
              <Link
                to="/"
                className="text-blue-400/60 hover:text-blue-400 transition-colors"
              >
                Inicio
              </Link>
              {" · "}
              <Link
                to="/servicios"
                className="text-blue-400/60 hover:text-blue-400 transition-colors"
              >
                Servicios
              </Link>
              {" · "}
              <Link
                to="/contacto"
                className="text-blue-400/60 hover:text-blue-400 transition-colors"
              >
                Contacto
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AboutPage;
