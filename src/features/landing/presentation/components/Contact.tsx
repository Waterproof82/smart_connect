
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Send, MessageSquare, Sparkles, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import { getAppSettings, AppSettings } from '@shared/services/settingsService';
import { getLandingContainer } from '../LandingContainer';
import { LeadEntity } from '../../domain/entities';
import { sanitizeInput, isValidEmail } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';
import { contactSchema, ContactFormData } from '../schemas/contactSchema';

export const Contact: React.FC = () => {
  // Settings from database
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings();
        setSettings(data);
    } catch {
      // Settings fetch failed - use defaults
    } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Create container dynamically when settings are loaded
  // Uses webhook URL from BBDD only
  const container = useMemo(() => {
    if (isLoadingSettings || !settings) return null;
    const webhookUrl = settings.n8nWebhookUrl || 'https://placeholder-webhook-url.invalid';
    return getLandingContainer(webhookUrl);
  }, [settings, isLoadingSettings]);

  const [isVisible, setIsVisible] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid, touchedFields, submitCount },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      service: '',
      message: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const messageValue = watch('message');
  const serviceValue = watch('service');

  // CSS class helper for validated form fields
  const getFieldClassName = (field: keyof ContactFormData, extra = ''): string => {
    const base = `w-full border rounded-2xl py-4 px-6 outline-none transition-all text-sm ${extra}`.trim();
    if (touchedFields[field] && errors[field]) {
      return `${base} bg-red-500/10 border-red-500/50 focus:border-red-500`;
    }
    if (touchedFields[field] && !errors[field]) {
      return `${base} bg-blue-500/10 border-blue-500/50 focus:border-blue-500`;
    }
    return `${base} bg-white/5 border-white/10 focus:border-blue-500/50`;
  };

  const onSubmit = async (data: ContactFormData) => {
    // Rate limiting (OWASP A04:2021 - Insecure Design)
    const userIdentifier = data.email || 'anonymous';
    const isAllowed = await rateLimiter.checkLimit(userIdentifier, RateLimitPresets.CONTACT_FORM);

    if (!isAllowed) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('idle');

    try {
      // Sanitize all inputs (OWASP A03:2021 - Injection)
      const sanitizedData = {
        name: sanitizeInput(data.name, 'contact_name', 100),
        company: sanitizeInput(data.company, 'contact_company', 100),
        email: sanitizeInput(data.email, 'contact_email', 255),
        service: sanitizeInput(data.service, 'contact_service', 100),
        message: sanitizeInput(data.message, 'contact_message', 2000),
      };

      // Double-check email format after sanitization
      if (!isValidEmail(sanitizedData.email)) {
        setSubmitStatus('error');
        return;
      }

      // Create lead entity with sanitized data
      const lead = new LeadEntity(sanitizedData);

      if (!container) {
        setSubmitStatus('error');
        return;
      }

      const result = await container.submitLeadUseCase.execute(lead);

      if (result.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          reset();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }

    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    // Scroll and focus helper
    const scrollAndFocus = () => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 800);
    };

    // Read service parameter from URL
    const updateServiceFromURL = () => {
      const hash = globalThis.location.hash;
      if (!hash.includes('?')) return;

      const params = new URLSearchParams(hash.split('?')[1]);
      const servicio = params.get('servicio');
      if (!servicio) return;

      setValue('service', decodeURIComponent(servicio), { shouldValidate: true });
      setTimeout(scrollAndFocus, 100);
    };

    updateServiceFromURL();

    globalThis.addEventListener('hashchange', updateServiceFromURL);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const sectionNode = sectionRef.current;
    if (sectionNode) observer.observe(sectionNode);

    return () => {
      globalThis.removeEventListener('hashchange', updateServiceFromURL);
      if (sectionNode) observer.unobserve(sectionNode);
    };
  }, [setValue]);

  const { ref: nameRegRef, ...nameRegProps } = register('name');

  return (
    <div className="relative py-24 overflow-hidden" ref={sectionRef}>
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 -ml-32"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            ¿Hablamos?
          </div>
          <h2 className="text-5xl font-black mb-6">Impulsa tu <span className="gradient-text">Negocio Hoy</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info */}
          <div className={`lg:col-span-5 space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {[
              {
                id: 'contact-email',
                icon: <Mail className="w-6 h-6" />,
                title: "Email Directo",
                value: settings?.contactEmail || "Cargando...",
                desc: "Respondemos en menos de 2 horas",
                color: "text-blue-500",
                loading: isLoadingSettings,
                href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined,
              },
              {
                id: 'contact-whatsapp',
                icon: <MessageSquare className="w-6 h-6" />,
                title: "WhatsApp Business",
                value: settings?.whatsappPhone || "Disponible pronto",
                desc: "Soporte técnico inmediato",
                color: "text-emerald-500",
                loading: isLoadingSettings,
                href: settings?.whatsappPhone ? `https://wa.me/${settings.whatsappPhone.replaceAll(/[^\d+]/g, '')}` : undefined,
                external: true,
              },
              {
                id: 'contact-location',
                icon: <MapPin className="w-6 h-6" />,
                title: "Nuestras Oficinas",
                value: settings?.physicalAddress || "Madrid, España",
                desc: "Hub Tecnológico de Innovación",
                color: "text-purple-500",
                loading: isLoadingSettings,
                href: `https://maps.google.com/?q=${encodeURIComponent(settings?.physicalAddress || 'Madrid, España')}`,
                external: true,
              }
            ].map((item) => {
              const content = (
                <>
                  <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{item.title}</p>
                    <h4 className={`text-xl font-bold mb-1 ${item.loading ? 'animate-pulse' : ''}`}>{item.value}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </>
              );
              return item.href && !item.loading ? (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="glass-card p-8 rounded-3xl border border-white/5 flex gap-6 group hover:border-white/10 transition-all"
                >
                  {content}
                </a>
              ) : (
                <div key={item.id} className="glass-card p-8 rounded-3xl border border-white/5 flex gap-6 group hover:border-white/10 transition-all">
                  {content}
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      className={getFieldClassName('name')}
                      aria-invalid={touchedFields.name && !!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      ref={(e) => {
                        nameRegRef(e);
                        (nameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                      }}
                      {...nameRegProps}
                    />
                    {touchedFields.name && errors.name && (
                      <p id="name-error" role="alert" className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        {errors.name.message}
                      </p>
                    )}
                    {touchedFields.name && !errors.name && (
                      <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ✓ Campo válido
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-company" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Empresa</label>
                    <input
                      id="contact-company"
                      type="text"
                      placeholder="Ej. Restaurante L'Escale"
                      className={getFieldClassName('company')}
                      aria-invalid={touchedFields.company && !!errors.company}
                      aria-describedby={errors.company ? 'company-error' : undefined}
                      {...register('company')}
                    />
                    {touchedFields.company && errors.company && (
                      <p id="company-error" role="alert" className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        {errors.company.message}
                      </p>
                    )}
                    {touchedFields.company && !errors.company && (
                      <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ✓ Campo válido
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="juan@empresa.com"
                    className={getFieldClassName('email')}
                    aria-invalid={touchedFields.email && !!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email')}
                  />
                  {touchedFields.email && errors.email && (
                    <p id="email-error" role="alert" className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      {errors.email.message}
                    </p>
                  )}
                  {touchedFields.email && !errors.email && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-service" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Servicio de Interés</label>
                  <div className="relative">
                    <select
                      id="contact-service"
                      className={getFieldClassName('service', 'appearance-none pr-10')}
                      aria-invalid={touchedFields.service && !!errors.service}
                      aria-describedby={errors.service ? 'service-error' : undefined}
                      {...register('service')}
                    >
                      <option className="bg-sc-dark-alt" value="">Selecciona una opción</option>
                      <option className="bg-sc-dark-alt" value="QRIBAR - Menú Digital">QRIBAR - Menú Digital</option>
                      <option className="bg-sc-dark-alt" value="Automatización n8n">Automatización n8n</option>
                      <option className="bg-sc-dark-alt" value="Tarjetas NFC Reseñas">Tarjetas NFC Reseñas</option>
                      <option className="bg-sc-dark-alt" value="Consultoría IA">Consultoría IA</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  {touchedFields.service && errors.service && (
                    <p id="service-error" role="alert" className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      {errors.service.message}
                    </p>
                  )}
                  {touchedFields.service && !errors.service && serviceValue && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Mensaje {messageValue.length > 0 && (
                      <span className="text-gray-600">({messageValue.length}/1000)</span>
                    )}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Cuéntanos brevemente sobre tu proyecto..."
                    className={getFieldClassName('message', 'resize-none')}
                    aria-invalid={touchedFields.message && !!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    {...register('message')}
                  ></textarea>
                  {touchedFields.message && errors.message && (
                    <p id="message-error" role="alert" className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      {errors.message.message}
                    </p>
                  )}
                  {touchedFields.message && !errors.message && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                {/* Status messages */}
                {submitStatus === 'success' && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-4 px-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-emerald-300 font-medium">
                      ¡Mensaje enviado con éxito! Te responderemos pronto.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl py-4 px-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300 font-medium">
                      Error al enviar. Por favor, intenta nuevamente.
                    </p>
                  </div>
                )}

                {!isValid && submitCount > 0 && submitStatus === 'idle' && (
                  <p className="text-sm text-amber-400 text-center animate-in fade-in slide-in-from-top-1">
                    Por favor, revisa los campos marcados antes de enviar.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting || isLoadingSettings}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] group ${
                    isValid && !isSubmitting && !isLoadingSettings
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer'
                      : 'bg-gray-600/30 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isLoadingSettings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cargando...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Propuesta
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
