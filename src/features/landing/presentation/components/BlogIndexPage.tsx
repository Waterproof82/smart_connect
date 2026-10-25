import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { PageHero, Section } from "@shared/presentation/layout";
import { BreadcrumbListSchema } from "@shared/presentation/components/SeoSchema";
import {
  BLOG_BASE_PATH,
  BLOG_INDEX_OG_IMAGE,
  BLOG_POSTS,
} from "@features/landing/data/blogPosts";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}${BLOG_BASE_PATH}`;
const PAGE_TITLE = "Blog de TPV, carta digital y chatbots | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "Guías para restaurantes, bares y alojamientos de Tenerife y Canarias: precio de un TPV, carta digital frente a comisiones, chatbots con IA y reseñas en Google.";

/** Blog index: one crawlable link per article with a keyword title. */
const BlogIndexPage: React.FC = () => (
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
      <meta property="og:image" content={`${ORG_URL}${BLOG_INDEX_OG_IMAGE}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Digitaliza Tenerife: guías de tecnología para negocios locales"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={PAGE_TITLE} />
      <meta name="twitter:description" content={PAGE_DESCRIPTION} />
      <meta name="twitter:image" content={`${ORG_URL}${BLOG_INDEX_OG_IMAGE}`} />
    </Helmet>
    <BreadcrumbListSchema
      breadcrumbs={[
        { name: "Inicio", url: `${ORG_URL}/` },
        { name: "Blog", url: PAGE_URL },
      ]}
    />
    <PageShell>
      <PageHero
        title="Blog: tecnología para restaurantes y negocios de Tenerife"
        lede="Guías prácticas sobre TPV táctil, carta digital, chatbots con IA y reseñas en Google, escritas para dueños de negocio sin perfil técnico."
      />
      <Section id="articulos" title="Últimos artículos">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-md)] list-none p-0 m-0">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug} className="ds-card">
              <h3 className="ds-h3 mb-2">
                <Link
                  to={`${BLOG_BASE_PATH}/${post.slug}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-muted leading-relaxed m-0">
                {post.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  </>
);

export default BlogIndexPage;
