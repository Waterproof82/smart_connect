/**
 * Settings Panel Component
 *
 * Clean Architecture: Presentation Layer
 *
 * Panel para visualizar y modificar la configuración de la aplicación.
 * Solo incluye campos que son usados directamente por la app.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from '../../domain/entities/Settings';
import { Mail, Link as LinkIcon, Save, RefreshCw, AlertCircle, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { settingsSchema, SettingsFormData } from '../schemas/settingsSchema';
import { useAdmin } from '../AdminContext';
import { ConsoleLogger } from '@core/domain/usecases/Logger';

const logger = new ConsoleLogger('[SettingsPanel]');

const inputClasses = "w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-default placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:border-transparent";

export const SettingsPanel: React.FC = () => {
  const { container } = useAdmin();
  const { getSettingsUseCase, updateSettingsUseCase } = container;
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      n8nWebhookUrl: '',
      contactEmail: '',
      whatsappPhone: '',
      physicalAddress: '',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getSettingsUseCase.execute();
      setSettings(result);
      reset({
        n8nWebhookUrl: result.n8nWebhookUrl,
        contactEmail: result.contactEmail,
        whatsappPhone: result.whatsappPhone,
        physicalAddress: result.physicalAddress,
      });
    } catch (err) {
      logger.error('Failed to load settings', err);
      setError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  }, [getSettingsUseCase, reset]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setError(null);
      setSuccess(null);

      await updateSettingsUseCase.execute(data);

      setSuccess('Configuración guardada correctamente');
      await loadSettings();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Failed to save settings', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-6" role="status" aria-live="polite">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-bg-alt)] border border-[var(--color-error-border)] rounded-lg p-6" role="alert">
        <div className="flex items-center justify-center h-32">
          <div className="text-[var(--color-error-text)]">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg p-6" role="form" aria-label="Configuración de la aplicación">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-default">Configuración</h2>
          <p className="text-muted text-sm mt-1">
            Datos de contacto mostrados en la landing page
          </p>
        </div>
        <button
          onClick={loadSettings}
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-default hover:bg-[var(--color-surface)] rounded-lg transition-colors"
          aria-label="Recargar configuración"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-lg flex items-center gap-2" role="status" aria-live="polite">
          <CheckCircle2 className="w-5 h-5 text-[var(--color-success-text)]" />
          <span className="text-[var(--color-success-text)] text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg flex items-center gap-2" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-[var(--color-error-text)]" />
          <span className="text-[var(--color-error-text)] text-sm">{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Section: Contact Info */}
          <div className="border-b border-[var(--color-border)] pb-4 mb-4">
            <h3 className="text-lg font-semibold text-default mb-4">Información de Contacto</h3>

            {/* Contact Email */}
            <div className="mb-4">
              <label htmlFor="settings-contactEmail" className="flex items-center gap-2 text-sm font-medium text-default mb-2">
                <Mail className="w-4 h-4" />
                Email de Contacto
              </label>
              <input
                id="settings-contactEmail"
                type="email"
                placeholder="contacto@tuempresa.com"
                className={`${inputClasses} focus:ring-[var(--focus-ring)]`}
                {...register('contactEmail')}
              />
              {errors.contactEmail && (
                <p className="text-xs text-[var(--color-error-text)] mt-1">{errors.contactEmail.message}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Email mostrado en la landing page
              </p>
            </div>

            {/* WhatsApp Phone */}
            <div className="mb-4">
              <label htmlFor="settings-whatsappPhone" className="flex items-center gap-2 text-sm font-medium text-default mb-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </label>
              <input
                id="settings-whatsappPhone"
                type="tel"
                placeholder="+5491112345678"
                className={`${inputClasses} focus:ring-[var(--focus-ring)]`}
                {...register('whatsappPhone')}
              />
              {errors.whatsappPhone && (
                <p className="text-xs text-[var(--color-error-text)] mt-1">{errors.whatsappPhone.message}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Número de WhatsApp mostrado en la landing
              </p>
            </div>

            {/* Physical Address */}
            <div className="mb-4">
              <label htmlFor="settings-physicalAddress" className="flex items-center gap-2 text-sm font-medium text-default mb-2">
                <MapPin className="w-4 h-4" />
                Dirección
              </label>
              <input
                id="settings-physicalAddress"
                type="text"
                placeholder="Av. Example 123, Ciudad"
                className={`${inputClasses} focus:ring-[var(--focus-ring)]`}
                {...register('physicalAddress')}
              />
              {errors.physicalAddress && (
                <p className="text-xs text-[var(--color-error-text)] mt-1">{errors.physicalAddress.message}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Dirección mostrada en la landing page
              </p>
            </div>
          </div>

          {/* Section: n8n Webhook */}
          <div>
            <h3 className="text-lg font-semibold text-default mb-4">Integración n8n</h3>

            {/* n8n Webhook URL */}
            <div className="mb-4">
              <label htmlFor="settings-n8nWebhookUrl" className="flex items-center gap-2 text-sm font-medium text-default mb-2">
                <LinkIcon className="w-4 h-4" />
                Webhook URL
              </label>
              <input
                id="settings-n8nWebhookUrl"
                type="url"
                placeholder="https://tu-n8n.com/webhook/..."
                className={`${inputClasses} focus:ring-[var(--focus-ring)]`}
                {...register('n8nWebhookUrl')}
              />
              {errors.n8nWebhookUrl && (
                <p className="text-xs text-[var(--color-error-text)] mt-1">{errors.n8nWebhookUrl.message}</p>
              )}
              <p className="text-xs text-muted mt-1">
                URL del webhook de n8n para recibir leads
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-[var(--color-on-accent)] rounded-lg transition-colors font-medium"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>

      {/* Last Updated */}
      {settings && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-muted">
          Última actualización: {settings.updatedAt.toLocaleString('es-AR')}
        </div>
      )}
    </div>
  );
};
