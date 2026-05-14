import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAppSettings, AppSettings } from "@shared/services/settingsService";
import { getLandingContainer } from "../LandingContainer";
import { LeadEntity } from "../../domain/entities";
import { sanitizeInput, isValidEmail } from "@shared/utils/sanitizer";
import { rateLimiter, RateLimitPresets } from "@shared/utils/rateLimiter";
import { contactSchema, ContactFormData } from "../schemas/contactSchema";
import { useIntersectionObserver } from "@shared/hooks";
import { useLanguage } from "@shared/context/LanguageContext";

const fieldClasses =
  "w-full border rounded-2xl py-3 sm:py-4 px-4 sm:px-6 outline-none transition-colors text-sm text-default bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--focus-ring)] min-h-[44px]";

const prefersReducedMotion = () => {
  if (globalThis.matchMedia === undefined) return true;
  const mql = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
  return mql.matches;
};
const errorClasses =
  "bg-[var(--color-error-bg)] border-[var(--color-error-border)] focus:border-[var(--color-error-text)]";
const validClasses =
  "bg-[var(--color-accent-subtle)] border-[var(--color-accent-border)] focus:border-[var(--color-primary)]";

const socialLinks = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M23.5 6.19A3.02 3.02 0 0 0 21.36 4.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.36.6A3.02 3.02 0 0 0 .5 6.19 32.9 32.9 0 0 0 0 12a32.9 32.9 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.14 2.09c1.86.6 9.36.6 9.36.6s7.5 0 9.36-.6a3.02 3.02 0 0 0 2.14-2.09A32.9 32.9 0 0 0 24 12a32.9 32.9 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
    href: "https://youtube.com/@TODO",
    label: "YouTube",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: "https://x.com/TODO",
    label: "X (Twitter)",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    href: "https://linkedin.com/company/TODO",
    label: "LinkedIn",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    href: "https://instagram.com/TODO",
    label: "Instagram",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    href: "https://facebook.com/TODO",
    label: "Facebook",
  },
];

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings();
        setSettings(data);
      } catch {
        setSettingsError(true);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const container = useMemo(() => {
    if (isLoadingSettings || !settings) return null;
    const webhookUrl =
      settings.n8nWebhookUrl || "https://placeholder-webhook-url.invalid";
    return getLandingContainer(webhookUrl);
  }, [settings, isLoadingSettings]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      service: "",
      message: "",
    },
    mode: "onBlur",
  });

  const formValues = watch();
  const hasAllRequiredFields =
    formValues.name &&
    formValues.company &&
    formValues.email &&
    formValues.service &&
    formValues.message;
  const canSubmit = hasAllRequiredFields && !isSubmitting && !isLoadingSettings;

  const getFieldClassName = (field: keyof ContactFormData): string => {
    if (touchedFields[field] && errors[field])
      return `${fieldClasses} ${errorClasses}`;
    if (touchedFields[field] && !errors[field])
      return `${fieldClasses} ${validClasses}`;
    return fieldClasses;
  };
  const getSubmitButtonClass = () => {
    if (canSubmit) {
      return "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md";
    }
    return "bg-[var(--color-overlay-medium)] text-muted cursor-not-allowed";
  };

  const renderSubmitButtonContent = () => {
    if (isLoadingSettings)
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {t.contactFormLoading}
        </>
      );
    if (isSubmitting)
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {t.contactFormSending}
        </>
      );
    return (
      <>
        <span className="text-base">{t.contactFormSubmit}</span>{" "}
        <Send className="w-5 h-5" aria-hidden="true" />
      </>
    );
  };
  const onSubmit = async (data: ContactFormData) => {
    const isValid = await trigger();
    if (!isValid) return;

    const userIdentifier = data.email || "anonymous";
    const isAllowed = await rateLimiter.checkLimit(
      userIdentifier,
      RateLimitPresets.CONTACT_FORM,
    );
    if (!isAllowed) {
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("idle");
    try {
      const sanitizedData = {
        name: sanitizeInput(data.name, "contact_name", 100),
        company: sanitizeInput(data.company, "contact_company", 100),
        email: sanitizeInput(data.email, "contact_email", 255),
        service: sanitizeInput(data.service, "contact_service", 100),
        message: sanitizeInput(data.message, "contact_message", 2000),
      };

      if (!isValidEmail(sanitizedData.email)) {
        setSubmitStatus("error");
        return;
      }
      if (!container) {
        setSubmitStatus("error");
        return;
      }

      const lead = new LeadEntity(sanitizedData);
      const result = await container.submitLeadUseCase.execute(lead);

      if (result.success) {
        setSubmitStatus("success");
        successTimeoutRef.current = globalThis.setTimeout(() => {
          reset();
          setSubmitStatus("idle");
        }, 3000);
      } else {
        setSubmitStatus("error");
        successTimeoutRef.current = globalThis.setTimeout(
          () => setSubmitStatus("idle"),
          3000,
        );
      }
    } catch {
      setSubmitStatus("error");
      successTimeoutRef.current = globalThis.setTimeout(
        () => setSubmitStatus("idle"),
        3000,
      );
    }
  };

  useEffect(() => {
    const updateServiceFromHash = () => {
      // Parse hash query params (e.g., #contacto?servicio=Consultor%C3%ADa%20IA)
      const hash = globalThis.location.hash;
      if (!hash.includes("?")) return;

      const params = new URLSearchParams(hash.split("?")[1]);
      const servicio = params.get("servicio");
      if (servicio) {
        setValue("service", decodeURIComponent(servicio), {
          shouldValidate: true,
        });
      }
    };
    updateServiceFromHash();
    globalThis.addEventListener("hashchange", updateServiceFromHash);
    return () =>
      globalThis.removeEventListener("hashchange", updateServiceFromHash);
  }, [setValue]);

  const { ref: nameRegRef, ...nameRegProps } = register("name");

  return (
    <div className="relative py-24 overflow-hidden" ref={sectionRef}>
      <div className="absolute top-1/2 left-0 w-[200px] h-[200px] bg-[var(--color-accent)]/10 rounded-full -translate-y-1/2 -ml-16"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
            prefersReducedMotion() || isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] text-xs font-bold mb-6 tracking-wider uppercase">
            {t.heroEyebrow}
          </div>
          <h2 className="text-5xl font-extrabold mb-6">{t.contactTitle}</h2>
          <p className="text-muted text-lg leading-relaxed">
            Get a demo of our digital menu and NFC solutions for restaurants.
            Learn more about{" "}
            <Link
              to="/tap-review"
              className="text-[var(--color-primary)] hover:underline"
            >
              NFC cards for Google Reviews
            </Link>{" "}
            or explore our{" "}
            <Link
              to="/chatbot"
              className="text-[var(--color-primary)] hover:underline"
            >
              AI-powered chatbot
            </Link>
            .
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div
            className={`lg:col-span-5 space-y-6 transition-all duration-1000 delay-300 ${
              prefersReducedMotion() || isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            {[
              {
                id: "email",
                icon: <Mail className="w-6 h-6" />,
                title: t.contactEmailTitle,
                value:
                  settings?.contactEmail ||
                  (settingsError ? t.contactEmailError : t.contactEmailLoading),
                desc: t.contactEmailDesc,
                color: "text-[var(--color-icon-blue)]",
                href: settings?.contactEmail
                  ? `mailto:${settings.contactEmail}`
                  : undefined,
              },
              {
                id: "whatsapp",
                icon: <MessageSquare className="w-6 h-6" />,
                title: t.contactWhatsappTitle,
                value: settings?.whatsappPhone || t.contactEmailLoading,
                desc: t.contactWhatsappDesc,
                color: "text-[var(--color-icon-emerald)]",
                href: settings?.whatsappPhone
                  ? `https://wa.me/${settings.whatsappPhone.replaceAll(/[^\d+]/g, "")}`
                  : undefined,
                external: true,
              },
              {
                id: "location",
                icon: <MapPin className="w-6 h-6" />,
                title: t.contactLocationTitle,
                value: settings?.physicalAddress || "Madrid, España",
                desc: "Hub Tecnológico de Innovación",
                color: "text-[var(--color-icon-purple)]",
                href: `https://maps.google.com/?q=${encodeURIComponent(settings?.physicalAddress || "Madrid, España")}`,
                external: true,
              },
            ].map((item, idx) => {
              const getCardBackground = () => {
                if (idx === 0)
                  return "bg-[var(--color-surface)] border border-[var(--color-border)]";
                if (idx === 1)
                  return "bg-[var(--color-bg-alt)] border-2 border-dashed border-[var(--color-border)]";
                return "bg-[var(--color-surface)] border border-[var(--color-border)]";
              };
              const cardClasses = `p-6 rounded-2xl flex gap-4 group hover:border-[var(--color-border)] transition-colors block ${getCardBackground()}`;
              const content = (
                <>
                  <div
                    className={`w-12 h-12 bg-[var(--color-surface)] rounded-xl flex items-center justify-center ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">
                      {item.title}
                    </p>
                    <h3 className="text-lg font-bold mb-1">{item.value}</h3>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                </>
              );
              return item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cardClasses}
                >
                  {content}
                </a>
              ) : (
                <div key={item.id} className={cardClasses}>
                  {content}
                </div>
              );
            })}
          </div>

          <div
            className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
              prefersReducedMotion() || isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <div className="bg-[var(--color-bg-alt)] p-8 md:p-10 rounded-3xl border border-[var(--color-border)] shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2"
                    >
                      {t.contactFormName}{" "}
                      <span
                        className="text-[var(--color-error-text)]"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder={t.contactPlaceholderName}
                      className={
                        getFieldClassName("name") +
                        " placeholder:text-[var(--color-text-muted)]"
                      }
                      aria-required="true"
                      aria-invalid={touchedFields.name && !!errors.name}
                      aria-describedby={
                        errors.name ? "contact-name-error" : undefined
                      }
                      ref={nameRegRef}
                      {...nameRegProps}
                    />
                    {touchedFields.name && errors.name && (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="text-xs text-[var(--color-error-text)] mt-1"
                      >
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-company"
                      className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2"
                    >
                      {t.contactFormCompany}{" "}
                      <span
                        className="text-[var(--color-error-text)]"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      id="contact-company"
                      type="text"
                      placeholder={t.contactPlaceholderCompany}
                      className={
                        getFieldClassName("company") +
                        " placeholder:text-[var(--color-text-muted)]"
                      }
                      aria-required="true"
                      aria-invalid={touchedFields.company && !!errors.company}
                      aria-describedby={
                        errors.company ? "contact-company-error" : undefined
                      }
                      {...register("company")}
                    />
                    {touchedFields.company && errors.company && (
                      <p
                        id="contact-company-error"
                        role="alert"
                        className="text-xs text-[var(--color-error-text)] mt-1"
                      >
                        {errors.company.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2"
                  >
                    {t.contactFormEmail}{" "}
                    <span
                      className="text-[var(--color-error-text)]"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder={t.contactPlaceholderEmail}
                    className={
                      getFieldClassName("email") +
                      " placeholder:text-[var(--color-text-muted)]"
                    }
                    aria-required="true"
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    {...register("email")}
                  />
                  {touchedFields.email && errors.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="text-xs text-[var(--color-error-text)] mt-1"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-service"
                    className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2"
                  >
                    {t.contactFormService}{" "}
                    <span
                      className="text-[var(--color-error-text)]"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="contact-service"
                      className={
                        getFieldClassName("service") + " appearance-none pr-10"
                      }
                      aria-required="true"
                      aria-invalid={touchedFields.service && !!errors.service}
                      aria-describedby={
                        errors.service ? "contact-service-error" : undefined
                      }
                      {...register("service")}
                    >
                      <option value="" className="text-muted">
                        {t.contactSelectOption}
                      </option>
                      <option value="Carta Digital Premium">
                        {t.serviceCartaDigital}
                      </option>
                      <option value="QRIBAR - Menú Digital">
                        {t.serviceQribar}
                      </option>
                      <option value="Automatización n8n">
                        {t.serviceAutomation}
                      </option>
                      <option value="Tarjetas NFC Reseñas">
                        {t.serviceNFC}
                      </option>
                      <option value="Consultoría IA">
                        {t.serviceConsultoria}
                      </option>
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                    />
                  </div>
                  {touchedFields.service && errors.service && (
                    <p
                      id="contact-service-error"
                      role="alert"
                      className="text-xs text-[var(--color-error-text)] mt-1"
                    >
                      {errors.service.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2"
                  >
                    {t.contactFormMessage}{" "}
                    <span
                      className="text-[var(--color-error-text)]"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder={t.contactPlaceholderMessage}
                    className={
                      getFieldClassName("message") +
                      " resize-none placeholder:text-[var(--color-text-muted)]"
                    }
                    aria-required="true"
                    aria-describedby={
                      errors.message ? "contact-message-error" : undefined
                    }
                    {...register("message")}
                  ></textarea>
                  {touchedFields.message && errors.message && (
                    <p
                      id="contact-message-error"
                      role="alert"
                      className="text-xs text-[var(--color-error-text)] mt-1"
                    >
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {submitStatus === "success" && (
                  <output className="flex items-center gap-3 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-2xl py-4 px-6">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success-text)]" />
                    <p className="text-sm text-[var(--color-success-text)]">
                      {t.contactSuccess}
                    </p>
                  </output>
                )}

                {submitStatus === "error" && (
                  <div
                    id="contact-error-message"
                    role="alert"
                    className="flex items-center gap-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-2xl py-4 px-6"
                  >
                    <AlertCircle className="w-5 h-5 text-[var(--color-error-text)] shrink-0" />
                    <p className="text-sm text-[var(--color-error-text)]">
                      {t.contactError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[44px] ${getSubmitButtonClass()}`}
                >
                  {renderSubmitButtonContent()}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-16 pt-12 border-t border-[var(--color-border)] text-center">
          <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6">
            {t.footerSocialTitle}
          </h3>
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-muted hover:text-[var(--color-primary)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-subtle)] transition-all duration-300"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
