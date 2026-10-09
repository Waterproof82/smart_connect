import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { formatAddressLine } from "@shared/config/organization";
import Contact from "../Contact";

// jsdom has no IntersectionObserver; Contact.tsx uses it via
// useIntersectionObserver for the scroll-reveal animation, which is
// irrelevant to this test's className/disabled-state assertions.
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

vi.mock("@shared/services/settingsService", () => ({
  getAppSettings: vi.fn().mockResolvedValue({
    contactEmail: "hola@digitalizatenerife.es",
    whatsappPhone: "+34600000000",
    physicalAddress: "Santa Cruz de Tenerife, España",
  }),
}));

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../../LandingContainer", () => ({
  createLandingContainer: vi.fn(() => ({
    submitLeadUseCase: {
      execute: mockExecute,
    },
  })),
}));

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>,
  );
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nombre Completo/i), "Ana García");
  await user.type(screen.getByLabelText(/Empresa/i), "Acme SL");
  await user.type(screen.getByLabelText(/Correo Electrónico/i), "ana@acme.es");
  await user.selectOptions(
    screen.getByLabelText(/Servicio de Interés/i),
    "Carta Digital Premium",
  );
  await user.type(screen.getByLabelText(/Mensaje/i), "Quiero más info");
};

describe("Contact", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("shows the ORGANIZATION fallback address before settings load, not the old literal", () => {
    renderWithLanguage();
    expect(screen.getByText(formatAddressLine("es"))).toBeInTheDocument();
    expect(screen.queryByText("Santa Cruz de Tenerife, España")).not.toBeInTheDocument();
  });

  it("submit button uses the static btn-primary w-full className (no runtime branch)", async () => {
    renderWithLanguage();
    const button = await screen.findByRole("button", {
      name: /Enviar Mensaje/i,
    });
    expect(button.className).toBe("btn-primary w-full");
  });

  it("submit button has no stale conflicting utility classes", async () => {
    renderWithLanguage();
    const button = await screen.findByRole("button", {
      name: /Enviar Mensaje/i,
    });
    expect(button.className).not.toMatch(
      /rounded-2xl|focus:ring-2|min-h-\[44px\]/,
    );
  });

  it("submit button is disabled while required fields are empty", async () => {
    renderWithLanguage();
    const button = await screen.findByRole("button", {
      name: /Enviar Mensaje/i,
    });
    await waitFor(() => expect(button).toBeDisabled());
  });

  it("submit button becomes enabled once required fields are filled and settings finish loading, className stays unchanged", async () => {
    const user = userEvent.setup();
    renderWithLanguage();

    const button = await screen.findByRole("button", {
      name: /Enviar Mensaje/i,
    });
    await waitFor(() => expect(button).toBeDisabled());

    await fillRequiredFields(user);

    await waitFor(() => expect(button).not.toBeDisabled());
    expect(button.className).toBe("btn-primary w-full");
  });

  describe("anti-bot honeypot + fill-time (sdd/notify-lead-antibot, D10/D8)", () => {
    beforeEach(() => {
      mockExecute.mockClear();
    });

    it("renders a hidden honeypot field with the expected attributes, identical SSR/CSR markup", () => {
      renderWithLanguage();

      const honeypot = document.getElementById(
        "contact-sc-hp",
      ) as HTMLInputElement;
      expect(honeypot).toBeInTheDocument();
      // Hotfix 2026-10-09: Chrome autofill ignores autocomplete="off" and
      // filled a field named "website" for a real user. The name/id must not
      // match any autofill heuristic (url, website, company, name, email...).
      expect(honeypot).toHaveAttribute("name", "sc_hp_field");
      expect(honeypot.name).not.toMatch(
        /web|site|url|company|name|mail|phone|tel|address/i,
      );
      expect(honeypot.id).not.toMatch(/web|site|url|company|mail|phone/i);
      expect(honeypot).toHaveAttribute("type", "text");
      expect(honeypot).toHaveAttribute("autocomplete", "off");
      expect(honeypot).toHaveAttribute("tabindex", "-1");
      // Password-manager opt-outs (LastPass, 1Password, Bitwarden, Dashlane).
      expect(honeypot).toHaveAttribute("data-lpignore", "true");
      expect(honeypot).toHaveAttribute("data-1p-ignore", "true");
      expect(honeypot).toHaveAttribute("data-bwignore", "true");
      expect(honeypot).toHaveAttribute("data-form-type", "other");

      // Hotfix #2 2026-10-09: Chrome autofill fills off-screen
      // (left:-9999px) inputs — the honeypot was still filled for a real
      // user after the rename. Chrome never autofills non-focusable fields,
      // so the wrapper must be display:none (bots filling raw HTML still hit
      // it).
      const wrapper = honeypot.closest('[aria-hidden="true"]') as HTMLElement;
      expect(wrapper).not.toBeNull();
      expect(wrapper.style.display).toBe("none");

      // Last field of the form, away from the name/company/email section so
      // autofill never groups it with personal-data fields.
      const form = honeypot.closest("form") as HTMLFormElement;
      const fields = Array.from(
        form.querySelectorAll("input, textarea, select"),
      );
      expect(fields[fields.length - 1]).toBe(honeypot);
    });

    it("does not register the honeypot in the zod-validated form state (not required to submit)", async () => {
      const user = userEvent.setup();
      renderWithLanguage();

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /Enviar Mensaje/i }),
        ).toBeDisabled(),
      );
      await fillRequiredFields(user);

      const button = await screen.findByRole("button", {
        name: /Enviar Mensaje/i,
      });
      await waitFor(() => expect(button).not.toBeDisabled());
    });

    it("sends a numeric elapsedMs and an empty honeypot for a normal human submission", async () => {
      const user = userEvent.setup();

      renderWithLanguage();
      await fillRequiredFields(user);

      const button = await screen.findByRole("button", {
        name: /Enviar Mensaje/i,
      });
      await waitFor(() => expect(button).not.toBeDisabled());
      await user.click(button);

      await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));
      const [, meta] = mockExecute.mock.calls[0];
      expect(meta.website).toBe("");
      expect(typeof meta.elapsedMs).toBe("number");
      expect(meta.elapsedMs).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(meta.elapsedMs)).toBe(true);
    });

    it("still sends a 0ms elapsed (falsy but valid) rather than omitting it", async () => {
      const user = userEvent.setup();
      const nowSpy = vi.spyOn(performance, "now").mockReturnValue(1000);

      renderWithLanguage();
      await fillRequiredFields(user);

      const button = await screen.findByRole("button", {
        name: /Enviar Mensaje/i,
      });
      await waitFor(() => expect(button).not.toBeDisabled());
      await user.click(button);

      await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));
      const [, meta] = mockExecute.mock.calls[0];
      expect(meta.elapsedMs).toBe(0);

      nowSpy.mockRestore();
    });
  });
});
