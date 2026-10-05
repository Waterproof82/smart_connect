/**
 * Contact + WhatsAppCta settings-read dedupe (T5.6, SDD
 * `landing-main-thread-tbt`, slice S5).
 *
 * Unlike `Contact.test.tsx` (which mocks `@shared/services/settingsService`
 * entirely), this file deliberately does NOT mock settingsService — it
 * mocks `global.fetch` instead, so the REAL `getAppSettings()` shared
 * promise cache (D7 + S5) is exercised. Asserts that when `Contact`
 * (which reads settings directly) and `WhatsAppCta` (which reads settings
 * via `useWhatsappPhone`) mount on the same page, exactly ONE network
 * call happens in total — closing design.md's "double read" framing.
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { resetAppSettingsCache } from "@shared/services/settingsService";
import { WhatsAppCta } from "@shared/presentation/layout/WhatsAppCta";
import Contact from "../Contact";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

vi.mock("@shared/config/env.config", () => ({
  ENV: {
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "test-anon-key",
  },
}));

vi.mock("../../LandingContainer", () => ({
  createLandingContainer: vi.fn(() => ({
    submitLeadUseCase: {
      execute: vi.fn().mockResolvedValue({ success: true }),
    },
  })),
}));

const mockFetch = vi.fn();

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue(
    jsonResponse([
      {
        n8n_webhook_url: "",
        n8n_enabled: false,
        contact_email: "hola@digitalizatenerife.es",
        whatsapp_phone: "+34600000000",
        physical_address: "Tacoronte",
      },
    ]),
  );
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  resetAppSettingsCache();
});

describe("Contact + WhatsAppCta settings dedupe", () => {
  it("issues exactly one fetch total when both mount on the same page", async () => {
    render(
      <LanguageProvider>
        <Contact />
        <WhatsAppCta />
      </LanguageProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("hola@digitalizatenerife.es")).toBeInTheDocument(),
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
