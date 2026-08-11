/**
 * WebMCP — Web Model Context Protocol
 *
 * Registers tools on navigator.modelContext for AI agents visiting the page.
 * Uses @mcp-b/webmcp-polyfill to work in all browsers (not just Chrome 146+).
 *
 * Each tool has: name, description, inputSchema (JSON Schema), execute callback.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 *       https://docs.mcp-b.ai/
 */

import "@mcp-b/webmcp-polyfill";

// --- Types ---

interface ToolContentBlock {
  type: "text";
  text: string;
}

interface ToolResult {
  content: ToolContentBlock[];
}

interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
}

const tk = (text: string): ToolResult => ({
  content: [{ type: "text", text }],
});

// --- Tool implementations ---

const tools: ToolDescriptor[] = [
  {
    name: "get_product_info",
    description:
      "Get detailed information about Digitaliza Tenerife's two solutions: Carta Digital Premium (digital menu, includes a QRIBAR live-demo link) and Tap-to-Review NFC cards, for Canary Islands hospitality businesses.",
    inputSchema: {
      type: "object",
      properties: {
        product: {
          type: "string",
          enum: ["carta-digital", "tap-review"],
          description: "The product or service to get information about.",
        },
        language: {
          type: "string",
          enum: ["es", "en"],
          description: "Language for the response (es=Spanish, en=English).",
        },
      },
      required: ["product"],
    },
    execute: (args: Record<string, unknown>): ToolResult => {
      const productMap: Record<string, { es: string; en: string }> = {
        "tap-review": {
          es: "Tap-to-Review NFC: Tarjetas NFC para que los clientes dejen reseñas en Google con un solo toque. Pago único, sin suscripciones. Incluye expositor de mesa y soporte 24/7.",
          en: "Tap-to-Review NFC: NFC cards for customers to leave Google reviews with one tap. One-time payment, no subscriptions. Includes table stand and 24/7 support.",
        },
        "carta-digital": {
          es: "Carta Digital Premium: Menú digital avanzado con fotos, vídeos, 5 idiomas, pedidos por WhatsApp y base de datos propia de clientes. 0% comisiones. Incluye un enlace a la demo en vivo de QRIBAR.",
          en: "Carta Digital Premium: Advanced digital menu with photos, videos, 5 languages, WhatsApp orders, and your own customer database. 0% commissions. Includes a link to the QRIBAR live demo.",
        },
      };

      const product = String(args.product || "").toLowerCase();
      const lang = args.language === "en" ? "en" : "es";
      const info = productMap[product];

      if (!info) {
        return tk(
          `Product "${product}" not found. Available: ${Object.keys(productMap).join(", ")}`,
        );
      }

      const urls: Record<string, string> = {
        "tap-review": "https://digitalizatenerife.es/#tarjetas-nfc",
        "carta-digital": "https://digitalizatenerife.es/#carta-digital",
      };

      return tk(
        `${info[lang]}\n\nMore info: ${urls[product] || "https://digitalizatenerife.es"}`,
      );
    },
  },
  {
    name: "get_contact_info",
    description:
      "Get contact information for Digitaliza Tenerife, including email, WhatsApp, and office location in Santa Cruz de Tenerife.",
    inputSchema: {
      type: "object",
      properties: {
        language: {
          type: "string",
          enum: ["es", "en"],
          description: "Language for the response (es=Spanish, en=English).",
        },
      },
    },
    execute: (args: Record<string, unknown>): ToolResult => {
      const lang = args.language === "en" ? "en" : "es";
      if (lang === "en") {
        return tk(
          [
            "Digitaliza Tenerife — Contact Information",
            "",
            "- Email: info@digitalizatenerife.es",
            "- WhatsApp: available via the contact page",
            "- Office: Santa Cruz de Tenerife, Canary Islands, Spain",
            "- Website: https://digitalizatenerife.es",
            "- Contact page: https://digitalizatenerife.es/contacto",
          ].join("\n"),
        );
      }
      return tk(
        [
          "Digitaliza Tenerife — Información de Contacto",
          "",
          "- Email: info@digitalizatenerife.es",
          "- WhatsApp: disponible a través de la página de contacto",
          "- Oficina: Santa Cruz de Tenerife, Islas Canarias, España",
          "- Web: https://digitalizatenerife.es",
          "- Página de contacto: https://digitalizatenerife.es/contacto",
        ].join("\n"),
      );
    },
  },
  {
    name: "list_products",
    description:
      "List all products and services offered by Digitaliza Tenerife for local businesses in Tenerife and the Canary Islands.",
    inputSchema: {
      type: "object",
      properties: {
        language: {
          type: "string",
          enum: ["es", "en"],
          description: "Language for the response (es=Spanish, en=English).",
        },
      },
    },
    execute: (args: Record<string, unknown>): ToolResult => {
      const lang = args.language === "en" ? "en" : "es";
      if (lang === "en") {
        return tk(
          [
            "Digitaliza Tenerife — Products & Services",
            "",
            "1. Carta Digital Premium — Premium digital menu with 5 languages (includes a QRIBAR live-demo link)",
            "2. Tap-to-Review NFC — Google review NFC cards",
            "",
            "Website: https://digitalizatenerife.es",
          ].join("\n"),
        );
      }
      return tk(
        [
          "Digitaliza Tenerife — Productos y Servicios",
          "",
          "1. Carta Digital Premium — Menú digital premium con 5 idiomas (incluye enlace a la demo de QRIBAR)",
          "2. Tap-to-Review NFC — Tarjetas NFC para reseñas en Google",
          "",
          "Web: https://digitalizatenerife.es",
        ].join("\n"),
      );
    },
  },
  {
    name: "get_page_content_markdown",
    description:
      "Get the full content of a page as Markdown. Use this to read the complete content of any page on the site.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          enum: [
            "/",
            "/contacto",
            "/about",
            "/legal/aviso",
            "/legal/privacidad",
            "/legal/cookies",
          ],
          description: "The URL path of the page to fetch content from.",
        },
      },
      required: ["path"],
    },
    execute: async (args: Record<string, unknown>): Promise<ToolResult> => {
      const pagePath = String(args.path || "/");
      try {
        const response = await fetch(
          `https://digitalizatenerife.es${pagePath}`,
          { headers: { Accept: "text/markdown" } },
        );
        if (response.ok) {
          return tk(await response.text());
        }
        return tk(
          `Could not fetch content for ${pagePath}. Status: ${response.status}`,
        );
      } catch {
        return tk(
          `Error fetching content for ${pagePath}. The page might not be accessible.`,
        );
      }
    },
  },
];

// --- Registration ---

const REGISTERED_KEY = "__webmcp_registered";

export function registerWebMCPTools(): void {
  // Prevent double registration (e.g. in dev HMR)
  if ((globalThis as Record<string, unknown>)[REGISTERED_KEY]) {
    return;
  }

  try {
    const mc = (navigator as unknown as Record<string, unknown>)
      .modelContext as
      | { registerTool?: (tool: ToolDescriptor) => void }
      | undefined;

    if (mc && typeof mc.registerTool === "function") {
      for (const tool of tools) {
        mc.registerTool(tool);
      }
      (globalThis as Record<string, unknown>)[REGISTERED_KEY] = true;
    }
  } catch {
    // Registration failed — non-critical, skip silently
  }
}
