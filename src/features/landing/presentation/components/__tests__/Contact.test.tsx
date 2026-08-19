import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { Contact } from "../Contact";

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
    n8nEnabled: false,
    n8nWebhookUrl: "",
  }),
}));

vi.mock("../../LandingContainer", () => ({
  createLandingContainer: vi.fn(() => ({
    submitLeadUseCase: {
      execute: vi.fn().mockResolvedValue({ success: true }),
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
    expect(button.className).not.toMatch(/rounded-2xl|focus:ring-2|min-h-\[44px\]/);
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
});
