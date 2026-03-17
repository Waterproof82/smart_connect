
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { getAppSettings, AppSettings } from '@shared/services/settingsService';
import { getLandingContainer } from '../LandingContainer';
import { LeadEntity } from '../../domain/entities';
import { sanitizeInput, isValidEmail } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';
import { contactSchema, ContactFormData } from '../schemas/contactSchema';
import { useIntersectionObserver } from '@shared/hooks';

const fieldClasses = "w-full border rounded-2xl py-3 sm:py-4 px-4 sm:px-6 outline-none transition-colors text-sm text-default bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--focus-ring)] min-h-[48px] sm:min-h-[52px]";

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const errorClasses = "bg-[var(--color-error-bg)] border-[var(--color-error-border)] focus:border-[var(--color-error-text)]";
const validClasses = "bg-[var(--color-accent-subtle)] border-[var(--color-accent-border)] focus:border-[var(--color-primary)]";

export const Contact: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);
  const successTimeoutRef = useRef<number | null>(null);

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
    const webhookUrl = settings.n8nWebhookUrl || 'https://placeholder-webhook-url.invalid';
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
    defaultValues: { name: '', company: '', email: '', service: '', message: '' },
    mode: 'onBlur',
  });

  const formValues = watch();
  const hasAllRequiredFields = formValues.name && formValues.company && formValues.email && formValues.service && formValues.message;
  const canSubmit = hasAllRequiredFields && !isSubmitting && !isLoadingSettings;

  const getFieldClassName = (field: keyof ContactFormData): string => {
    if (touchedFields[field] && errors[field]) return `${fieldClasses} ${errorClasses}`;
    if (touchedFields[field] && !errors[field]) return `${fieldClasses} ${validClasses}`;
    return fieldClasses;
  };

  const onSubmit = async (data: ContactFormData) => {
    const isValid = await trigger();
    if (!isValid) return;

    const userIdentifier = data.email || 'anonymous';
    const isAllowed = await rateLimiter.checkLimit(userIdentifier, RateLimitPresets.CONTACT_FORM);
    if (!isAllowed) { setSubmitStatus('error'); return; }

    setSubmitStatus('idle');
    try {
      const sanitizedData = {
        name: sanitizeInput(data.name, 'contact_name', 100),
        company: sanitizeInput(data.company, 'contact_company', 100),
        email: sanitizeInput(data.email, 'contact_email', 255),
        service: sanitizeInput(data.service, 'contact_service', 100),
        message: sanitizeInput(data.message, 'contact_message', 2000),
      };

      if (!isValidEmail(sanitizedData.email)) { setSubmitStatus('error'); return; }
      if (!container) { setSubmitStatus('error'); return; }

      const lead = new LeadEntity(sanitizedData);
      const result = await container.submitLeadUseCase.execute(lead);

      if (result.success) {
        setSubmitStatus('success');
        successTimeoutRef.current = window.setTimeout(() => { reset(); setSubmitStatus('idle'); }, 3000);
      } else {
        setSubmitStatus('error');
        successTimeoutRef.current = window.setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch { 
      setSubmitStatus('error'); 
      successTimeoutRef.current = window.setTimeout(() => setSubmitStatus('idle'), 3000); 
    }
  };

  useEffect(() => {
    const updateServiceFromURL = () => {
      const hash = globalThis.location.hash;
      if (!hash.includes('?')) return;
      const params = new URLSearchParams(hash.split('?')[1]);
      const servicio = params.get('servicio');
      if (servicio) {
        setValue('service', decodeURIComponent(servicio), { shouldValidate: true });
        setTimeout(() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };
    updateServiceFromURL();
    globalThis.addEventListener('hashchange', updateServiceFromURL);
    return () => globalThis.removeEventListener('hashchange', updateServiceFromURL);
  }, [setValue]);

  const { ref: nameRegRef, ...nameRegProps } = register('name');

  return (
    <div className="relative py-24 overflow-hidden" ref={sectionRef}>
      <div className="absolute top-1/2 left-0 w-[200px] h-[200px] bg-[var(--color-accent)]/10 rounded-full -translate-y-1/2 -ml-16"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
          prefersReducedMotion() || isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] text-xs font-bold mb-6 tracking-wider uppercase">
            ¿Hablamos?
          </div>
          <h2 className="text-5xl font-extrabold mb-6">Impulsa tu <span className="text-[var(--color-primary)]">Negocio Hoy</span></h2>
          <p className="text-muted text-lg leading-relaxed">
            Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className={`lg:col-span-5 space-y-6 transition-all duration-1000 delay-300 ${
            prefersReducedMotion() || isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {[
              { id: 'email', icon: <Mail className="w-6 h-6" />, title: "Email Directo", value: settings?.contactEmail || (settingsError ? "No disponible" : "Cargando..."), desc: settingsError ? "Intenta más tarde" : "Respondemos en menos de 2 horas", color: "text-[var(--color-icon-blue)]", href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined },
              { id: 'whatsapp', icon: <MessageSquare className="w-6 h-6" />, title: "WhatsApp Business", value: settings?.whatsappPhone || "Disponible pronto", desc: "Soporte técnico inmediato", color: "text-[var(--color-icon-emerald)]", href: settings?.whatsappPhone ? `https://wa.me/${settings.whatsappPhone.replaceAll(/[^\d+]/g, '')}` : undefined, external: true },
              { id: 'location', icon: <MapPin className="w-6 h-6" />, title: "Nuestras Oficinas", value: settings?.physicalAddress || "Madrid, España", desc: "Hub Tecnológico de Innovación", color: "text-[var(--color-icon-purple)]", href: `https://maps.google.com/?q=${encodeURIComponent(settings?.physicalAddress || 'Madrid, España')}`, external: true }
            ].map((item, idx) => {
              const cardClasses = `p-6 rounded-2xl flex gap-4 group hover:border-[var(--color-border)] transition-colors block ${
                idx === 0 ? 'bg-[var(--color-surface)] border border-[var(--color-border)]' :
                idx === 1 ? 'bg-[var(--color-bg-alt)] border-2 border-dashed border-[var(--color-border)]' :
                'bg-[var(--color-surface)] border border-[var(--color-border)]'
              }`;
              const content = (
                <>
                  <div className={`w-12 h-12 bg-[var(--color-surface)] rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{item.title}</p>
                    <h3 className="text-lg font-bold mb-1">{item.value}</h3>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                </>
              );
              return item.href ? (
                <a key={item.id} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className={cardClasses}>
                  {content}
                </a>
              ) : (
                <div key={item.id} className={cardClasses}>
                  {content}
                </div>
              );
            })}
          </div>

          <div className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
            prefersReducedMotion() || isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="bg-[var(--color-bg-alt)] p-8 md:p-10 rounded-3xl border border-[var(--color-border)] shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Nombre Completo <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span></label>
                    <input id="contact-name" type="text" placeholder="Ej. Juan Pérez" className={getFieldClassName('name') + ' placeholder:text-[var(--color-text-muted)]'} aria-required="true" aria-invalid={touchedFields.name && !!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined} ref={nameRegRef} {...nameRegProps} />
                    {touchedFields.name && errors.name && <p id="contact-name-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-company" className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Empresa <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span></label>
                    <input id="contact-company" type="text" placeholder="Ej. Restaurante L'Escale" className={getFieldClassName('company') + ' placeholder:text-[var(--color-text-muted)]'} aria-required="true" aria-invalid={touchedFields.company && !!errors.company} aria-describedby={errors.company ? 'contact-company-error' : undefined} {...register('company')} />
                    {touchedFields.company && errors.company && <p id="contact-company-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1">{errors.company.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Correo Electrónico <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span></label>
                  <input id="contact-email" type="email" placeholder="juan@empresa.com" className={getFieldClassName('email') + ' placeholder:text-[var(--color-text-muted)]'} aria-required="true" aria-describedby={errors.email ? 'contact-email-error' : undefined} {...register('email')} />
                  {touchedFields.email && errors.email && <p id="contact-email-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="contact-service" className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Servicio de Interés <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span></label>
                  <div className="relative">
                    <select id="contact-service" className={getFieldClassName('service') + ' appearance-none pr-10'} aria-required="true" aria-invalid={touchedFields.service && !!errors.service} aria-describedby={errors.service ? 'contact-service-error' : undefined} {...register('service')}>
                      <option value="" className="text-muted">Selecciona una opción</option>
                      <option value="QRIBAR - Menú Digital">QRIBAR - Menú Digital</option>
                      <option value="Automatización n8n">Automatización n8n</option>
                      <option value="Tarjetas NFC Reseñas">Tarjetas NFC Reseñas</option>
                      <option value="Consultoría IA">Consultoría IA</option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  </div>
                  {touchedFields.service && errors.service && <p id="contact-service-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1">{errors.service.message}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="text-xs font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Mensaje <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span></label>
                  <textarea id="contact-message" rows={4} placeholder="Cuéntanos brevemente sobre tu proyecto..." className={getFieldClassName('message') + ' resize-none placeholder:text-[var(--color-text-muted)]'} aria-required="true" aria-describedby={errors.message ? 'contact-message-error' : undefined} {...register('message')}></textarea>
                  {touchedFields.message && errors.message && <p id="contact-message-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1">{errors.message.message}</p>}
                </div>

                {submitStatus === 'success' && (
                  <div id="contact-success-message" role="status" className="flex items-center gap-3 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-2xl py-4 px-6">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success-text)]" />
                    <p className="text-sm text-[var(--color-success-text)]">¡Mensaje enviado con éxito! Te responderemos pronto.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div id="contact-error-message" role="alert" className="flex items-center gap-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-2xl py-4 px-6">
                    <AlertCircle className="w-5 h-5 text-[var(--color-error-text)] shrink-0" />
                    <p className="text-sm text-[var(--color-error-text)]">Error al enviar. Por favor, intenta nuevamente.</p>
                  </div>
                )}

                <button type="submit" disabled={!canSubmit} className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] ${canSubmit ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)]' : 'bg-[var(--color-overlay-medium)] text-muted cursor-not-allowed'}`}>
                  {isLoadingSettings ? <><Loader2 className="w-4 h-4 animate-spin" />Cargando...</> : isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <>Enviar Propuesta <Send className="w-4 h-4" aria-hidden="true" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
