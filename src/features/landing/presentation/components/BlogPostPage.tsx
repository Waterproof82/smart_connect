import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { NotFound } from "@features/landing/presentation/components/NotFound";
import { ClosingCta, PageHero, Section } from "@shared/presentation/layout";
import { BreadcrumbListSchema } from "@shared/presentation/components/SeoSchema";
import { ORGANIZATION } from "@shared/config/organization";
import {
  BLOG_BASE_PATH,
  getBlogPost,
} from "@features/landing/data/blogPosts";

const ORG_URL = "https://digitalizatenerife.es";

/** One article: BlogPosting + BreadcrumbList JSON-LD, one H1, H2 per section. */
const BlogPostPage: React.FC = () => {
  // Server routes are explicit per article (route-parity tests), so the slug
  // comes from the location instead of a `:slug` param.
  const { pathname } = useLocation();
  const post = getBlogPost(pathname.replace(/\/+$/, "").split("/").pop() ?? "");

  if (!post) return <NotFound />;

  const pageUrl = `${ORG_URL}${BLOG_BASE_PATH}/${post.slug}`;
  const title = `${post.title} | Digitaliza Tenerife`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: "es",
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    mainEntityOfPage: pageUrl,
    image: `${ORG_URL}/og/home.png`,
    author: { "@type": "Organization", name: ORGANIZATION.name, url: ORG_URL },
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: ORG_URL,
    },
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${ORG_URL}/og/home.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={post.title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={`${ORG_URL}/og/home.png`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: `${ORG_URL}/` },
          { name: "Blog", url: `${ORG_URL}${BLOG_BASE_PATH}` },
          { name: post.title, url: pageUrl },
        ]}
      />
      <PageShell>
        <PageHero
          title={post.title}
          lede={post.intro}
          note={
            <time dateTime={post.datePublished}>
              Publicado el {post.datePublished.split("-").reverse().join("/")}
            </time>
          }
        />
        {post.sections.map((section, index) => (
          <Section
            key={section.heading}
            id={`s${index + 1}`}
            tone={index % 2 === 1 ? "alt" : "base"}
            width="prose"
            title={section.heading}
          >
            <div className="ds-prose text-lg text-muted grid gap-[var(--space-md)]">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="m-0">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="m-0 pl-6 grid gap-2 list-disc">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        ))}
        <ClosingCta
          id="blog-cta"
          title="¿Lo vemos en tu negocio?"
          intro={
            <>
              {post.cta.text}
              <Link
                to={post.cta.to}
                className="text-[var(--color-primary)] hover:underline"
              >
                {post.cta.anchor}
              </Link>{" "}
              o cuéntanos tu caso por WhatsApp.
            </>
          }
        />
        <p className="ds-container ds-container--prose pb-[var(--section-y)] m-0">
          <Link
            to={BLOG_BASE_PATH}
            className="text-[var(--color-primary)] hover:underline"
          >
            Ver todos los artículos del blog
          </Link>
        </p>
      </PageShell>
    </>
  );
};

export default BlogPostPage;
