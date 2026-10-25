import { describe, expect, it } from "vitest";
import { contactSchema } from "../features/landing/presentation/schemas/contactSchema";
import { loginSchema } from "../features/admin/presentation/schemas/loginSchema";
import { settingsSchema } from "../features/admin/presentation/schemas/settingsSchema";

// Characterization of the three form schemas: same accepted input and the
// same Spanish messages on the same fields, whatever the zod major version.
type Schema = {
  safeParse: (v: unknown) =>
    | { success: true }
    | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
};

function messages(schema: Schema, value: unknown): Record<string, string> {
  const result = schema.safeParse(value);
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    out[key] ??= issue.message;
  }
  return out;
}

const validContact = {
  name: "Ana García",
  company: "Bar La Plaza",
  email: "ana@example.com",
  service: "Carta digital",
  message: "Quiero información sobre la carta digital.",
};

describe("contactSchema", () => {
  it("accepts a valid lead", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("returns the field messages for empty input", () => {
    expect(
      messages(contactSchema, { name: "", company: "", email: "", service: "", message: "" }),
    ).toEqual({
      name: "¿Cómo te llamas?",
      company: "¿Para qué empresa trabajas?",
      email: "¿Cuál es tu correo?",
      service: "¿Qué servicio te interesa?",
      message: "¿En qué podemos ayudarte?",
    });
  });

  it("rejects a malformed email, the placeholder option and script injection", () => {
    expect(
      messages(contactSchema, {
        ...validContact,
        email: "ana@",
        service: "Selecciona una opción",
        message: "<script>alert(1)</script> hola hola",
      }),
    ).toEqual({
      email: "El correo no parece válido. Ejemplo: tu@email.com",
      service: "Selecciona una opción de la lista",
      message: "El mensaje contiene caracteres no permitidos",
    });
  });

  it("enforces message length after sanitizing", () => {
    expect(messages(contactSchema, { ...validContact, message: "corto" })).toEqual({
      message: "El mensaje es muy corto (mínimo 10 caracteres)",
    });
    expect(messages(contactSchema, { ...validContact, message: "a".repeat(1001) })).toEqual({
      message: "El mensaje es muy largo (máximo 1000 caracteres)",
    });
  });

  it("trims and rejects digits in the name", () => {
    expect(messages(contactSchema, { ...validContact, name: "  R2D2  " })).toEqual({
      name: "Usa solo letras y espacios (2-50 caracteres)",
    });
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials and reports empty or malformed fields", () => {
    expect(loginSchema.safeParse({ email: "a@b.es", password: "x" }).success).toBe(true);
    expect(messages(loginSchema, { email: "", password: "" })).toEqual({
      email: "Introduce tu correo electrónico",
      password: "Introduce tu contraseña",
    });
    expect(messages(loginSchema, { email: "nope", password: "x" })).toEqual({
      email: "El correo no parece válido. Ejemplo: tu@email.com",
    });
  });
});

describe("settingsSchema", () => {
  const base = {
    n8nWebhookUrl: "",
    n8nEnabled: false,
    contactEmail: "",
    whatsappPhone: "",
    physicalAddress: "",
  };

  it("accepts empty optional fields and valid values", () => {
    expect(settingsSchema.safeParse(base).success).toBe(true);
    expect(
      settingsSchema.safeParse({
        n8nWebhookUrl: "https://n8n.example.com/webhook",
        n8nEnabled: true,
        contactEmail: "hola@example.com",
        whatsappPhone: "+34600000000",
        physicalAddress: "Calle Mayor 1",
      }).success,
    ).toBe(true);
  });

  it("reports invalid fields and the n8n cross-field rule", () => {
    expect(messages(settingsSchema, { ...base, n8nEnabled: true })).toEqual({
      n8nWebhookUrl: "Para activar n8n necesitas una URL de webhook válida",
    });
    expect(
      messages(settingsSchema, {
        ...base,
        whatsappPhone: "12ab",
        physicalAddress: "x".repeat(201),
      }),
    ).toEqual({
      whatsappPhone: "Usa formato internacional. Ejemplo: +5491112345678",
      physicalAddress: "La dirección es muy larga (máximo 200 caracteres)",
    });
  });

  it("rejects a malformed URL and email", () => {
    const result = settingsSchema.safeParse({
      ...base,
      n8nWebhookUrl: "not a url",
      contactEmail: "nope",
    });
    expect(result.success).toBe(false);
  });
});
