
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Send, MessageSquare, Sparkles, CheckCircle2, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { getAppSettings, AppSettings } from '@shared/services/settingsService';
import { getLandingContainer } from '../LandingContainer';
import { LeadEntity } from '../../domain/entities';
import { sanitizeInput, isValidEmail } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';
import { contactSchema, ContactFormData } from '../schemas/contactSchema';

const fieldClasses = "w-full border rounded-2xl py-3 sm:py-4 px-4 sm:px-6 outline-none transition-colors text-sm text-neutral-200 bg-white/5 border-white/10 focus:border-blue-500 min-h-[48px] sm:min-h-[52px]";
const errorClasses = "bg-red-500/10 border-red-500/50 focus:border-red-500";
const validClasses = "bg-blue-500/10 border-blue-500/50 focus:border-blue-500";

export const Contact: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const sectionNode = sectionRef.current;
    if (sectionNode) observer.observe(sectionNode);
    return () => { if (sectionNode) observer.unobserve(sectionNode); };
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
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', company: '', email: '', service: '', message: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const getFieldClassName = (field: keyof ContactFormData): string => {
    if (touchedFields[field] && errors[field]) return `${fieldClasses} ${errorClasses}`;
    if (touchedFields[field] && !errors[field]) return `${fieldClasses} ${validClasses}`;
    return fieldClasses;
  };

  const onSubmit = async (data: ContactFormData) => {
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
        setTimeout(() => { reset(); setSubmitStatus('idle'); }, 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch { setSubmitStatus('error'); setTimeout(() => setSubmitStatus('idle'), 3000); }
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative py-24 overflow-hidden" ref={sectionRef}>
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
          <p className="text-neutral-300 text-lg leading-relaxed">
            Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className={`lg:col-span-5 space-y-6 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {[
              { id: 'email', icon: <Mail className="w-6 h-6" />, title: "Email Directo", value: settings?.contactEmail || (settingsError ? "No disponible" : "Cargando..."), desc: settingsError ? "Intenta más tarde" : "Respondemos en menos de 2 horas", color: "text-blue-500", href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined },
              { id: 'whatsapp', icon: <MessageSquare className="w-6 h-6" />, title: "WhatsApp Business", value: settings?.whatsappPhone || "Disponible pronto", desc: "Soporte técnico inmediato", color: "text-emerald-500", href: settings?.whatsappPhone ? `https://wa.me/${settings.whatsappPhone.replaceAll(/[^\d+]/g, '')}` : undefined, external: true },
              { id: 'location', icon: <MapPin className="w-6 h-6" />, title: "Nuestras Oficinas", value: settings?.physicalAddress || "Madrid, España", desc: "Hub Tecnológico de Innovación", color: "text-purple-500", href: `https://maps.google.com/?q=${encodeURIComponent(settings?.physicalAddress || 'Madrid, España')}`, external: true }
            ].map((item) => (
              <a key={item.id} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className="glass-card p-6 rounded-2xl flex gap-4 group hover:border-white/10 transition-colors block">
                <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.title}</p>
                  <h4 className="text-lg font-bold mb-1">{item.value}</h4>
                  <p className="text-sm text-neutral-400">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <div className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5 shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1 block mb-2">Nombre Completo</label>
                    <input id="contact-name" type="text" placeholder="Ej. Juan Pérez" className={getFieldClassName('name') + ' placeholder:text-neutral-500'} aria-invalid={touchedFields.name && !!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined} ref={(e) => { nameRegRef(e); nameInputRef.current = e; }} {...nameRegProps} />
                    {touchedFields.name && errors.name && <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-company" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1 block mb-2">Empresa</label>
                    <input id="contact-company" type="text" placeholder="Ej. Restaurante L'Escale" className={getFieldClassName('company') + ' placeholder:text-neutral-500'} aria-describedby={errors.company ? 'contact-company-error' : undefined} {...register('company')} />
                    {touchedFields.company && errors.company && <p id="contact-company-error" role="alert" className="text-xs text-red-400 mt-1">{errors.company.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1 block mb-2">Correo Electrónico</label>
                  <input id="contact-email" type="email" placeholder="juan@empresa.com" className={getFieldClassName('email') + ' placeholder:text-neutral-500'} aria-describedby={errors.email ? 'contact-email-error' : undefined} {...register('email')} />
                  {touchedFields.email && errors.email && <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="contact-service" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1 block mb-2">Servicio de Interés</label>
                  <div className="relative">
                    <select id="contact-service" className={getFieldClassName('service') + ' appearance-none pr-10 [&>option]:bg-sc-dark [&>option]:text-neutral-200 [&>option]:py-2'} aria-describedby={errors.service ? 'contact-service-error' : undefined} {...register('service')}>
                      <option value="" className="text-neutral-400">Selecciona una opción</option>
                      <option value="QRIBAR - Menú Digital">QRIBAR - Menú Digital</option>
                      <option value="Automatización n8n">Automatización n8n</option>
                      <option value="Tarjetas NFC Reseñas">Tarjetas NFC Reseñas</option>
                      <option value="Consultoría IA">Consultoría IA</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                  {touchedFields.service && errors.service && <p id="contact-service-error" role="alert" className="text-xs text-red-400 mt-1">{errors.service.message}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1 block mb-2">Mensaje</label>
                  <textarea id="contact-message" rows={4} placeholder="Cuéntanos brevemente sobre tu proyecto..." className={getFieldClassName('message') + ' resize-none placeholder:text-neutral-500'} aria-describedby={errors.message ? 'contact-message-error' : undefined} {...register('message')}></textarea>
                  {touchedFields.message && errors.message && <p id="contact-message-error" role="alert" className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                </div>

                {submitStatus === 'success' && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-4 px-6">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-emerald-300">¡Mensaje enviado con éxito! Te responderemos pronto.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl py-4 px-6">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">Error al enviar. Por favor, intenta nuevamente.</p>
                  </div>
                )}

                <button type="submit" disabled={!isValid || isSubmitting || isLoadingSettings} className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-sc-dark ${isValid && !isSubmitting && !isLoadingSettings ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-neutral-600/30 text-neutral-400 cursor-not-allowed'}`}>
                  {isLoadingSettings ? <><Loader2 className="w-4 h-4 animate-spin" />Cargando...</> : isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <>Enviar Propuesta <Send className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
