import React from "react";
import { Link } from "react-router-dom";
import { Section } from "@shared/presentation/layout";
import { useLanguage } from "@shared/context/LanguageContext";
import { BLOG_BASE_PATH, BLOG_POSTS } from "@features/landing/data/blogPosts";

interface RelatedArticlesProps {
  /** Path of the service page; lists the articles whose CTA links to it. */
  servicePath: string;
}

/**
 * "Lee también" block for service pages. Derived from BLOG_POSTS (each
 * article's `cta.to`), so a new article shows up on its service page with
 * no extra wiring. Renders nothing when no article supports the page.
 */
export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ servicePath }) => {
  const { t } = useLanguage();
  const posts = BLOG_POSTS.filter((post) => post.cta.to === servicePath);
  if (posts.length === 0) return null;

  return (
    <Section
      id="related-articles"
      title={t.relatedArticlesTitle}
      intro={t.relatedArticlesIntro}
    >
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-md)] list-none p-0 m-0">
        {posts.map((post) => (
          <li key={post.slug} className="ds-card">
            <h3 className="ds-h3 mb-2">
              <Link to={`${BLOG_BASE_PATH}/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
            <p className="text-muted leading-relaxed m-0">{post.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
};
