
import React, { useState, useEffect, useRef } from 'react';
import { Mail, MapPin, Send, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { ENV } from '@shared/config/env.config';
import { getLandingContainer } from '../LandingContainer';
import { LeadEntity } from '../../domain/entities';
import { sanitizeInput, isValidEmail } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';

// ====================================
// DEPENDENCY INJECTION
// ====================================
// Use a placeholder for build time, validation happens at runtime
const webhookUrl = ENV.N8N_WEBHOOK_URL || 'https://placeholder-webhook-url.invalid';
const container = getLandingContainer(webhookUrl);

interface FormData {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
}

interface ValidationErrors {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
}

export const Contact: React.FC = () => {
  // Runtime validation of critical environment variables
  useEffect(() => {
    if (!ENV.N8N_WEBHOOK_URL || ENV.N8N_WEBHOOK_URL.includes('placeholder')) {
      console.error('❌ CRITICAL: VITE_N8N_WEBHOOK_URL is not configured in production!');
      console.error('Please add it to Vercel Environment Variables');
    }
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState('Selecciona una opción');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    service: '',
    message: ''
  });
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    company: false,
    email: false,
    service: false,
    message: false
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: '',
    company: '',
    email: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Use LeadEntity for validation
  const createLeadEntity = (): LeadEntity => {
    return new LeadEntity({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      service: formData.service,
      message: formData.message,
    });
  };

  // Validations using LeadEntity
  const validateField = (field: keyof FormData, value: string): string => {
    const tempLead = new LeadEntity({
      ...formData,
      [field]: value,
    });

    switch (field) {
      case 'name': return tempLead.validateName();
      case 'company': return tempLead.validateCompany();
      case 'email': return tempLead.validateEmail();
      case 'service': return tempLead.validateService();
      case 'message': return tempLead.validateMessage();
      default: return '';
    }
  };

  // Verificar si un campo es válido
  const isFieldValid = (field: keyof FormData): boolean => {
    return touched[field] && !validationErrors[field] && formData[field].trim() !== '';
  };

  // Verificar si un campo tiene error
  const hasFieldError = (field: keyof FormData): boolean => {
    return touched[field] && !!validationErrors[field];
  };

  // Manejar cambio de campo
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // Manejar blur (cuando el usuario sale del campo)
  const handleFieldBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Obtener clase CSS para input según estado de validación
  const getInputClassName = (field: keyof FormData): string => {
    const baseClasses = 'w-full border rounded-2xl py-4 px-6 outline-none transition-all text-sm';
    if (hasFieldError(field)) {
      return `${baseClasses} bg-red-500/10 border-red-500/50 focus:border-red-500`;
    }
    if (isFieldValid(field)) {
      return `${baseClasses} bg-blue-500/10 border-blue-500/50 focus:border-blue-500`;
    }
    return `${baseClasses} bg-white/5 border-white/10 focus:border-blue-500/50`;
  };

  // Obtener clase CSS para select/textarea
  const getSelectClassName = (field: keyof FormData): string => {
    const baseClasses = 'w-full border rounded-2xl py-4 px-6 outline-none transition-all text-sm';
    if (hasFieldError(field)) {
      return `${baseClasses} bg-red-500/10 border-red-500/50 focus:border-red-500 appearance-none`;
    }
    if (isFieldValid(field)) {
      return `${baseClasses} bg-blue-500/10 border-blue-500/50 focus:border-blue-500 appearance-none`;
    }
    return `${baseClasses} bg-white/5 border-white/10 focus:border-blue-500/50 appearance-none`;
  };

  const getTextareaClassName = (field: keyof FormData): string => {
    const baseClasses = 'w-full border rounded-2xl py-4 px-6 outline-none transition-all text-sm resize-none';
    if (hasFieldError(field)) {
      return `${baseClasses} bg-red-500/10 border-red-500/50 focus:border-red-500`;
    }
    if (isFieldValid(field)) {
      return `${baseClasses} bg-blue-500/10 border-blue-500/50 focus:border-blue-500`;
    }
    return `${baseClasses} bg-white/5 border-white/10 focus:border-blue-500/50`;
  };

  // Validar que todos los campos estén completos y sin errores
  const isFormValid = () => {
    const lead = createLeadEntity();
    return lead.isValid();
  };

  // Manejar envío del formulario usando Clean Architecture
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    // ✅ Security: Rate limiting (OWASP A04:2021 - Insecure Design)
    // Note: Using email as identifier - can be enhanced with IP detection
    const userIdentifier = formData.email || 'anonymous';
    const isAllowed = await rateLimiter.checkLimit(userIdentifier, RateLimitPresets.CONTACT_FORM);

    if (!isAllowed) {
      setValidationErrors({
        ...validationErrors,
        message: 'Has enviado demasiados formularios. Por favor, espera una hora.',
      });
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // ✅ Security: Sanitize all inputs (OWASP A03:2021 - Injection)
      const sanitizedData = {
        name: sanitizeInput(formData.name, 'contact_name', 100),
        company: sanitizeInput(formData.company, 'contact_company', 100),
        email: sanitizeInput(formData.email, 'contact_email', 255),
        service: sanitizeInput(formData.service, 'contact_service', 100),
        message: sanitizeInput(formData.message, 'contact_message', 2000),
      };

      // Double-check email format after sanitization
      if (!isValidEmail(sanitizedData.email)) {
        setValidationErrors({
          ...validationErrors,
          email: 'Email inválido',
        });
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // Create lead entity with sanitized data
      const lead = new LeadEntity(sanitizedData);

      // Use SubmitLeadUseCase (Clean Architecture approach)
      const result = await container.submitLeadUseCase.execute(lead);

      if (result.success) {
        setSubmitStatus('success');
        
        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setFormData({
            name: '',
            company: '',
            email: '',
            service: '',
            message: ''
          });
          setSelectedService('Selecciona una opción');
          setTouched({
            name: false,
            company: false,
            email: false,
            service: false,
            message: false
          });
          setValidationErrors({
            name: '',
            company: '',
            email: '',
            service: '',
            message: ''
          });
          setSubmitStatus('idle');
        }, 3000);
      } else {
        // Handle validation errors from use case
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error al enviar lead:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, service: selectedService }));
  }, [selectedService]);

  useEffect(() => {
    // Función para hacer scroll y focus
    const scrollAndFocus = () => {
      sectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 800);
    };

    // Función para leer parámetro de servicio de la URL
    const updateServiceFromURL = () => {
      const hash = globalThis.location.hash;
      if (!hash.includes('?')) return;
      
      const params = new URLSearchParams(hash.split('?')[1]);
      const servicio = params.get('servicio');
      if (!servicio) return;
      
      setSelectedService(decodeURIComponent(servicio));
      setTimeout(scrollAndFocus, 100);
    };

    // Ejecutar al montar
    updateServiceFromURL();

    // Escuchar cambios en el hash
    globalThis.addEventListener('hashchange', updateServiceFromURL);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      globalThis.removeEventListener('hashchange', updateServiceFromURL);
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

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
                value: "hola@smartconnect.ai", 
                desc: "Respondemos en menos de 2 horas",
                color: "text-blue-500"
              },
              { 
                id: 'contact-whatsapp',
                icon: <MessageSquare className="w-6 h-6" />, 
                title: "WhatsApp Business", 
                value: "+34 600 000 000", 
                desc: "Soporte técnico inmediato",
                color: "text-emerald-500"
              },
              { 
                id: 'contact-location',
                icon: <MapPin className="w-6 h-6" />, 
                title: "Oficinas Centrales", 
                value: "Madrid, España", 
                desc: "Hub Tecnológico de Innovación",
                color: "text-purple-500"
              }
            ].map((item) => (
              <div key={item.id} className="glass-card p-8 rounded-3xl border border-white/5 flex gap-6 group hover:border-white/10 transition-all">
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.title}</p>
                  <h4 className="text-xl font-bold mb-1">{item.value}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input 
                      id="contact-name"
                      ref={nameInputRef}
                      type="text" 
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                      placeholder="Ej. Juan Pérez"
                      className={getInputClassName('name')}
                    />
                    {touched.name && validationErrors.name && (
                      <p className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ⚠️ {validationErrors.name}
                      </p>
                    )}
                    {isFieldValid('name') && (
                      <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ✓ Campo válido
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-company" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Empresa</label>
                    <input 
                      id="contact-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleFieldChange('company', e.target.value)}
                      onBlur={() => handleFieldBlur('company')}
                      placeholder="Ej. Restaurante L'Escale"
                      className={getInputClassName('company')}
                    />
                    {touched.company && validationErrors.company && (
                      <p className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ⚠️ {validationErrors.company}
                      </p>
                    )}
                    {isFieldValid('company') && (
                      <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        ✓ Campo válido
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input 
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="juan@empresa.com"
                    className={getInputClassName('email')}
                  />
                  {touched.email && validationErrors.email && (
                    <p className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ⚠️ {validationErrors.email}
                    </p>
                  )}
                  {isFieldValid('email') && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-service" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Servicio de Interés</label>
                  <select 
                    id="contact-service"
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      handleFieldChange('service', e.target.value);
                    }}
                    onBlur={() => handleFieldBlur('service')}
                    className={getSelectClassName('service')}
                  >
                    <option className="bg-[#0d0d1e]" value="Selecciona una opción">Selecciona una opción</option>
                    <option className="bg-[#0d0d1e]">QRIBAR - Menú Digital</option>
                    <option className="bg-[#0d0d1e]">Automatización n8n</option>
                    <option className="bg-[#0d0d1e]">Tarjetas NFC Reseñas</option>
                    <option className="bg-[#0d0d1e]">Consultoría IA</option>
                  </select>
                  {touched.service && validationErrors.service && (
                    <p className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ⚠️ {validationErrors.service}
                    </p>
                  )}
                  {isFieldValid('service') && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Mensaje {formData.message.length > 0 && (
                      <span className="text-gray-600">({formData.message.length}/1000)</span>
                    )}
                  </label>
                  <textarea 
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    onBlur={() => handleFieldBlur('message')}
                    rows={4}
                    placeholder="Cuéntanos brevemente sobre tu proyecto..."
                    className={getTextareaClassName('message')}
                  ></textarea>
                  {touched.message && validationErrors.message && (
                    <p className="text-xs text-red-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ⚠️ {validationErrors.message}
                    </p>
                  )}
                  {isFieldValid('message') && (
                    <p className="text-xs text-blue-400 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      ✓ Campo válido
                    </p>
                  )}
                </div>

                {/* Mensajes de estado */}
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
                    <p className="text-sm text-red-300 font-medium">
                      ❌ Error al enviar. Por favor, intenta nuevamente.
                    </p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] group ${
                    isFormValid() && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer'
                      : 'bg-gray-600/30 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? (
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
