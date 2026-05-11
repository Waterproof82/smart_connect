// __mocks__/dompurify.ts

interface DomPurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
}

const createDOMPurify = () => ({
  sanitize: (html: string | Node, config?: DomPurifyConfig): string | Node => {
    // If config is not provided, return the html as is
    if (!config) {
      return html;
    }

    // List of allowed tags and attributes
    const { ALLOWED_TAGS, ALLOWED_ATTR } = config;

    // Simulate XSS removal by stripping tags and attributes
    let sanitizedHtml = String(html);

    // If no tags are allowed, strip all tags
    if (ALLOWED_TAGS && ALLOWED_TAGS.length === 0) {
      sanitizedHtml = sanitizedHtml.replace(/<[^>]*>/g, "");
    }

    // If no attributes are allowed, strip all attributes
    if (ALLOWED_ATTR && ALLOWED_ATTR.length === 0) {
      const attrRegex = /\s(on\w+|style|class|id)=["'][^"']*["']/g;
      sanitizedHtml = sanitizedHtml.replace(attrRegex, "");
    }

    // A more specific regex for allowed attributes
    if (ALLOWED_ATTR && ALLOWED_ATTR.length > 0) {
      const allowedAttrsRegex = new RegExp(
        `\\s(?!${ALLOWED_ATTR.join("|")})\\w+=["'][^"']*["']`,
        "g",
      );
      sanitizedHtml = sanitizedHtml.replace(allowedAttrsRegex, "");
    }

    return sanitizedHtml;
  },
});

export default createDOMPurify;
