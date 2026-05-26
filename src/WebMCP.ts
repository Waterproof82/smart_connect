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
      "Get detailed information about SmartConnect products: QRIBAR (digital menu), Tap-to-Review NFC cards, Carta Digital Premium, n8n automation, WhatsApp automation, and software solutions for Canary Islands hospitality businesses.",
    inputSchema: {
      type: "object",
      properties: {
        product: {
          type: "string",
          enum: [
            "qribar",
            "tap-review",
            "carta-digital",
            "n8n-automation",
            "whatsapp-automation",
            "software-canarias",
            "digitalization-tenerife",
          ],
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
        qribar: {
          es: "QRIBAR: Menú digital con pedidos en tiempo real desde la mesa a barra y cocina. Sin comisiones. Los clientes escanean un código QR en la mesa, exploran platos con fotos y vídeos, y envían el pedido directamente.",
          en: "QRIBAR: Digital menu with real-time orders from table to bar and kitchen. No commissions. Customers scan a QR code at the table, browse dishes with photos and videos, and send orders directly.",
        },
        "tap-review": {
          es: "Tap-to-Review NFC: Tarjetas NFC para que los clientes dejen reseñas en Google con un solo toque. Pago único, sin suscripciones. Incluye expositor de mesa y soporte 24/7.",
          en: "Tap-to-Review NFC: NFC cards for customers to leave Google reviews with one tap. One-time payment, no subscriptions. Includes table stand and 24/7 support.",
        },
        "carta-digital": {
          es: "Carta Digital Premium: Menú digital avanzado con fotos, vídeos, 5 idiomas, pedidos por WhatsApp y base de datos propia de clientes. 0% comisiones.",
          en: "Carta Digital Premium: Advanced digital menu with photos, videos, 5 languages, WhatsApp orders, and your own customer database. 0% commissions.",
        },
        "n8n-automation": {
          es: "Automatización n8n: Flujos de trabajo que conectan CRM, email, WhatsApp y redes sociales. Automatiza captación, análisis de sentimiento y notificaciones.",
          en: "n8n Automation: Workflows connecting CRM, email, WhatsApp and social media. Automatize lead capture, sentiment analysis, and notifications.",
        },
        "whatsapp-automation": {
          es: "Automatización WhatsApp: Respuestas automáticas 24/7 para reservas, consultas y pedidos. Se integra con tu número existente de WhatsApp Business.",
          en: "WhatsApp Automation: 24/7 automatic responses for reservations, inquiries, and orders. Integrates with your existing WhatsApp Business number.",
        },
        "software-canarias": {
          es: "Software para Canarias: Soluciones digitales para restaurantes canarios. Desarrollo de software a medida, integración con sistemas existentes y soporte local en Tenerife.",
          en: "Software for Canary Islands: Digital solutions for Canarian restaurants. Custom software development, integration with existing systems, and local support in Tenerife.",
        },
        "digitalization-tenerife": {
          es: "Digitalización Tenerife: Transformación digital completa para negocios en Tenerife. Desde menús digitales hasta automatización con IA.",
          en: "Digitalization Tenerife: Complete digital transformation for businesses in Tenerife. From digital menus to AI automation.",
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
        qribar: "https://digitalizatenerife.es/carta-digital",
        "tap-review": "https://digitalizatenerife.es/tap-review",
        "carta-digital": "https://digitalizatenerife.es/carta-digital",
        "n8n-automation":
          "https://digitalizatenerife.es/automatizacion-restaurantes-n8n",
        "whatsapp-automation":
          "https://digitalizatenerife.es/automatizacion-whatsapp-restaurante",
        "software-canarias":
          "https://digitalizatenerife.es/software-restaurantes-canarias",
        "digitalization-tenerife":
          "https://digitalizatenerife.es/digitalizacion-hosteleria-tenerife",
      };

      return tk(
        `${info[lang]}\n\nMore info: ${urls[product] || "https://digitalizatenerife.es"}`,
      );
    },
  },
  {
    name: "get_contact_info",
    description:
      "Get contact information for SmartConnect AI, including email, WhatsApp, and office location in Santa Cruz de Tenerife.",
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
            "SmartConnect AI — Contact Information",
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
          "SmartConnect AI — Información de Contacto",
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
      "List all products and services offered by SmartConnect AI for local businesses in Tenerife and the Canary Islands.",
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
            "SmartConnect AI — Products & Services",
            "",
            "1. QRIBAR — Digital menu with real-time orders (no commissions)",
            "2. Tap-to-Review NFC — Google review NFC cards",
            "3. Carta Digital Premium — Premium digital menu with 5 languages",
            "4. n8n Automation — Workflow automation for hospitality",
            "5. WhatsApp Automation — 24/7 automated messaging",
            "6. Software Canarias — Custom software for Canary Islands businesses",
            "7. Digitalización Tenerife — Complete digital transformation in Tenerife",
            "",
            "Website: https://digitalizatenerife.es",
          ].join("\n"),
        );
      }
      return tk(
        [
          "SmartConnect AI — Productos y Servicios",
          "",
          "1. QRIBAR — Menú digital con pedidos en tiempo real (sin comisiones)",
          "2. Tap-to-Review NFC — Tarjetas NFC para reseñas en Google",
          "3. Carta Digital Premium — Menú digital premium con 5 idiomas",
          "4. Automatización n8n — Automatización de flujos para hostelería",
          "5. Automatización WhatsApp — Mensajería automatizada 24/7",
          "6. Software Canarias — Software a medida para empresas canarias",
          "7. Digitalización Tenerife — Transformación digital completa en Tenerife",
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
            "/servicios",
            "/contacto",
            "/carta-digital",
            "/tap-review",
            "/automatizacion-restaurantes-n8n",
            "/automatizacion-whatsapp-restaurante",
            "/software-restaurantes-canarias",
            "/digitalizacion-hosteleria-tenerife",
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
