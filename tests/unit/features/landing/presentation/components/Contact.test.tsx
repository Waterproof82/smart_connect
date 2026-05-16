import React from "react";
import { render, screen } from "@testing-library/react";
import { Contact } from "../../../../../../src/features/landing/presentation/components/Contact";

// Mocks
jest.mock("../../../../../../src/shared/context/LanguageContext", () => ({
  useLanguage: jest.fn(() => ({ t: { contactTitle: "Contact Us" } })),
}));

jest.mock("react-hook-form", () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    reset: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(() => ({})),
    trigger: jest.fn().mockResolvedValue(true),
    formState: {
      errors: {},
      isSubmitting: false,
      touchedFields: {},
    },
  })),
}));

jest.mock("../../../../../../src/shared/services/settingsService", () => ({
  getAppSettings: jest.fn(() =>
    Promise.resolve({
      contactEmail: "contact@example.com",
      whatsappPhone: "+34600000000",
      physicalAddress: "Calle de la Innovación, 123",
    }),
  ),
}));

jest.mock(
  "../../../../../../src/features/landing/presentation/LandingContainer",
  () => ({
    getLandingContainer: jest.fn(() => ({
      submitLeadUseCase: {
        execute: jest.fn().mockResolvedValue({ success: true }),
      },
    })),
  }),
);

jest.mock(
  "../../../../../../src/features/landing/domain/entities/LeadEntity",
  () => ({
    LeadEntity: jest.fn((data) => data),
  }),
);

describe("Contact Component", () => {
  it("renders the Contact component correctly", () => {
    render(<Contact />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("displays contact information correctly", () => {
    render(<Contact />);
    expect(screen.getByText("contact@example.com")).toBeInTheDocument();
    expect(screen.getByText("+34600000000")).toBeInTheDocument();
    expect(screen.getByText("Calle de la Innovación, 123")).toBeInTheDocument();
  });
});
