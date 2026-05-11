/**
 * Sanitizer Utility Tests
 *
 * Security: OWASP A03:2021 (Injection)
 */

import {
  sanitizeInput,
  sanitizeHTML,
  isValidEmail,
  isValidPhone,
  sanitizeURL,
} from "../../../src/shared/utils/sanitizer";

// Mock DOMPurify for testing
jest.mock("dompurify", () => {
  const sanitize = (
    dirty: string,
    config?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[] },
  ) => {
    let clean = dirty;
    if (!config?.ALLOWED_TAGS || config.ALLOWED_TAGS.length === 0) {
      clean = clean.replace(/<[^>]*>/g, "");
    } else {
      const allowedSet = new Set(config.ALLOWED_TAGS);
      clean = clean.replace(/<\/?(\w+)[^>]*>/g, (match, tagName) => {
        if (allowedSet.has(tagName.toLowerCase())) {
          return match;
        }
        return ""; // strip disallowed tags, keep content
      });
    }
    return clean;
  };

  // Factory pattern: matches DOMPurify(window) in sanitizer.ts
  return {
    __esModule: true,
    default: () => ({ sanitize }),
  };
});

describe("sanitizeInput", () => {
  it("should pass through plain text unchanged", () => {
    expect(sanitizeInput("Hello world")).toBe("Hello world");
  });

  it("should strip HTML tags", () => {
    expect(sanitizeInput("<b>bold</b> text")).toBe("bold text");
  });

  it("should strip script tags and content", () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeInput(input, "test");
    expect(result).not.toContain("<script");
    expect(result).toContain("Hello");
  });

  it("should throw TypeError for non-string input", () => {
    expect(() => sanitizeInput(123 as unknown as string)).toThrow(TypeError);
  });

  it("should throw on input exceeding maxLength", () => {
    const longInput = "a".repeat(5000);
    expect(() => sanitizeInput(longInput, "test", 4000)).toThrow(
      "exceeds maximum length",
    );
  });

  it("should respect custom maxLength", () => {
    expect(() => sanitizeInput("abc", "test", 2)).toThrow(
      "exceeds maximum length",
    );
  });

  it("should trim output", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("should detect XSS patterns like javascript: in HTML context", () => {
    const result = sanitizeInput(
      '<a href="javascript:alert(1)">click</a>',
      "test",
    );
    expect(result).not.toContain("javascript:");
  });

  it("should detect onerror patterns", () => {
    const result = sanitizeInput('<img onerror="alert(1)" />', "test");
    expect(result).not.toContain("onerror");
  });
});

describe("sanitizeHTML", () => {
  it("should allow safe tags", () => {
    const result = sanitizeHTML("<b>bold</b> and <i>italic</i>");
    expect(result).toContain("<b>");
    expect(result).toContain("<i>");
  });

  it("should strip dangerous tags", () => {
    const result = sanitizeHTML('<script>alert("xss")</script>safe');
    expect(result).not.toContain("<script");
  });

  it("should strip iframe tags", () => {
    const result = sanitizeHTML('<iframe src="evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  });

  it("should throw TypeError for non-string input", () => {
    expect(() => sanitizeHTML(42 as unknown as string)).toThrow(TypeError);
  });

  it("should allow anchor tags with href", () => {
    const result = sanitizeHTML('<a href="https://example.com">link</a>');
    expect(result).toContain("<a");
    expect(result).toContain("href");
  });
});

describe("isValidEmail", () => {
  it("should accept valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });

  it("should reject emails exceeding 254 chars", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("should accept valid phone numbers", () => {
    expect(isValidPhone("+34612345678")).toBe(true);
    expect(isValidPhone("1234567890")).toBe(true);
  });

  it("should reject too short numbers", () => {
    expect(isValidPhone("12345")).toBe(false);
  });

  it("should reject too long numbers", () => {
    expect(isValidPhone("1234567890123456")).toBe(false);
  });

  it("should reject non-string input", () => {
    expect(isValidPhone(123 as unknown as string)).toBe(false);
  });

  it("should reject strings exceeding max raw length", () => {
    expect(isValidPhone("a".repeat(21))).toBe(false);
  });
});

describe("sanitizeURL", () => {
  it("should allow https URLs", () => {
    expect(sanitizeURL("https://example.com")).toBe("https://example.com");
  });

  it("should allow http URLs", () => {
    expect(sanitizeURL("http://example.com")).toBe("http://example.com");
  });

  it("should allow mailto URLs", () => {
    expect(sanitizeURL("mailto:user@example.com")).toBe(
      "mailto:user@example.com",
    );
  });

  it("should allow tel URLs", () => {
    expect(sanitizeURL("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("should block javascript: URLs", () => {
    expect(sanitizeURL("javascript:alert(1)")).toBe("");
  });

  it("should block data: URLs", () => {
    expect(sanitizeURL("data:text/html,<script>alert(1)</script>")).toBe("");
  });

  it("should block vbscript: URLs", () => {
    expect(sanitizeURL('vbscript:MsgBox("xss")')).toBe("");
  });

  it("should reject unknown protocols", () => {
    expect(sanitizeURL("ftp://files.com/secret")).toBe("");
  });

  it("should return empty string for empty/null input", () => {
    expect(sanitizeURL("")).toBe("");
    expect(sanitizeURL(null as unknown as string)).toBe("");
  });
});
