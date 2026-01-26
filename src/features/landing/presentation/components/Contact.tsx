
import React, { useState, useEffect, useRef } from 'react';
import { Mail, MapPin, Send, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { ENV } from '@shared/config/env.config';

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

  // Validaciones individuales por campo
  const validateName = (value: string): string => {
    if (!value.trim()) return 'El nombre es requerido';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(value)) {
      return 'Solo letras y espacios (2-50 caracteres)';
    }
    return '';
  };

  const validateCompany = (value: string): string => {
    if (!value.trim()) return 'La empresa es requerida';
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s&'.,\u002D]{2,100}$/.test(value)) {
      return 'Nombre de empresa válido (2-100 caracteres)';
    }
    return '';
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'El email es requerido';
    if (!/^[a-zA-Z0-9._%+\u002D]+@[a-zA-Z0-9.\u002D]+\.[a-zA-Z]{2,}$/.test(value)) {
      return 'Formato de email inválido (ejemplo@dominio.com)';
    }
    return '';
  };

  const validateService = (value: string): string => {
    if (value === 'Selecciona una opción' || !value) {
      return 'Debes seleccionar un servicio';
    }
    return '';
  };

  const validateMessage = (value: string): string => {
    if (!value.trim()) return 'El mensaje es requerido';
    if (value.length < 10) return 'Mínimo 10 caracteres';
    if (value.length > 1000) return 'Máximo 1000 caracteres';
    return '';
  };

  // Validaciones
  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case 'name': return validateName(value);
      case 'company': return validateCompany(value);
      case 'email': return validateEmail(value);
      case 'service': return validateService(value);
      case 'message': return validateMessage(value);
      default: return '';
    }
  };

  // Verificar si un campo es válido
  const isFieldValid = (field: keyof FormData): boolean => {
    return touched[field] && !validationErrors[field];
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
    return (
      formData.name.trim() !== '' &&
      formData.company.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.service !== 'Selecciona una opción' &&
      formData.message.trim() !== '' &&
      !validationErrors.name &&
      !validationErrors.company &&
      !validationErrors.email &&
      !validationErrors.service &&
      !validationErrors.message
    );
  };

  // Generar HTML del email con diseño moderno
  const generateEmailHTML = (data: FormData): string => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Solicitud de Contacto - SmartConnect AI</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                      🚀 Nueva Solicitud de Contacto
                    </h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">
                      SmartConnect AI - Business Accelerator
                    </p>
                  </td>
                </tr>

                <!-- Fecha y Hora -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                      📅 Recibido el ${currentDate}
                    </p>
                  </td>
                </tr>

                <!-- Información del Cliente -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #60a5fa; border-left: 4px solid #3b82f6; padding-left: 16px;">
                      👤 Información del Cliente
                    </h2>
                    
                    <table width="100%" cellpadding="12" cellspacing="0">
                      <tr>
                        <td style="width: 40%; font-weight: 600; color: #9ca3af; font-size: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          Nombre Completo:
                        </td>
                        <td style="font-size: 14px; color: #ffffff; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          ${data.name}
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 40%; font-weight: 600; color: #9ca3af; font-size: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          Empresa:
                        </td>
                        <td style="font-size: 14px; color: #ffffff; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          ${data.company}
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 40%; font-weight: 600; color: #9ca3af; font-size: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          Email:
                        </td>
                        <td style="font-size: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                          <a href="mailto:${data.email}" style="color: #60a5fa; text-decoration: none;">
                            ${data.email}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 40%; font-weight: 600; color: #9ca3af; font-size: 14px; padding: 12px 0;">
                          Servicio de Interés:
                        </td>
                        <td style="font-size: 14px; padding: 12px 0;">
                          <span style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; display: inline-block;">
                            ${data.service}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Mensaje -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #60a5fa; border-left: 4px solid #3b82f6; padding-left: 16px;">
                      💬 Mensaje del Cliente
                    </h2>
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 24px; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
                      ${data.message.replaceAll('\n', '<br>')}
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="mailto:${data.email}?subject=Re: Solicitud de ${data.service}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); transition: all 0.3s;">
                      📧 Responder a ${data.name}
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: rgba(255,255,255,0.02); padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                      SmartConnect AI
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      Business Accelerator • Transformando Negocios con IA y Automatización
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 11px; color: #4b5563;">
                      Este email fue generado automáticamente desde el formulario de contacto.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const emailHTML = generateEmailHTML(formData);
      
      // Aquí integrarías con tu servicio de email (n8n, SendGrid, etc.)
      // Por ahora, simulamos el envío
      console.log('Enviando email a:', ENV.CONTACT_EMAIL);
      console.log('HTML generado:', emailHTML);
      
      // Simulación de envío (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error al enviar:', error);
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
