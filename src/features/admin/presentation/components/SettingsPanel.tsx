/**
 * Settings Panel Component
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Panel para visualizar y modificar la configuración de la aplicación.
 * Solo incluye campos que son usados directamente por la app.
 */

import React, { useState, useEffect } from 'react';
import { Settings } from '../../domain/entities/Settings';
import { SettingsUpdateInput } from '../../domain/repositories/ISettingsRepository';
import { GetSettingsUseCase } from '../../domain/usecases/GetSettingsUseCase';
import { UpdateSettingsUseCase } from '../../domain/usecases/UpdateSettingsUseCase';
import { Mail, Link as LinkIcon, Save, RefreshCw, AlertCircle, CheckCircle2, Phone, MapPin } from 'lucide-react';

interface SettingsPanelProps {
  getSettingsUseCase: GetSettingsUseCase;
  updateSettingsUseCase: UpdateSettingsUseCase;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  getSettingsUseCase,
  updateSettingsUseCase,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<SettingsUpdateInput>({
    n8nWebhookUrl: '',
    contactEmail: '',
    whatsappPhone: '',
    physicalAddress: '',
  });

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getSettingsUseCase.execute();
      setSettings(result);
      setFormData({
        n8nWebhookUrl: result.n8nWebhookUrl,
        contactEmail: result.contactEmail,
        whatsappPhone: result.whatsappPhone,
        physicalAddress: result.physicalAddress,
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      await updateSettingsUseCase.execute(formData);
      
      setSuccess('Configuración guardada correctamente');
      await loadSettings();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsUpdateInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Configuración</h2>
          <p className="text-gray-400 text-sm mt-1">
            Datos de contacto mostrados en la landing page
          </p>
        </div>
        <button
          onClick={loadSettings}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Section: Contact Info */}
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
          
          {/* Contact Email */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              Email de Contacto
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contacto@tuempresa.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email mostrado en la landing page
            </p>
          </div>

          {/* WhatsApp Phone */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsappPhone}
              onChange={(e) => handleChange('whatsappPhone', e.target.value)}
              placeholder="+5491112345678"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número de WhatsApp mostrado en la landing
            </p>
          </div>

          {/* Physical Address */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4" />
              Dirección
            </label>
            <input
              type="text"
              value={formData.physicalAddress}
              onChange={(e) => handleChange('physicalAddress', e.target.value)}
              placeholder="Av. Example 123, Ciudad"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dirección mostrada en la landing page
            </p>
          </div>
        </div>

        {/* Section: n8n Webhook */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Integración n8n</h3>

          {/* n8n Webhook URL */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <LinkIcon className="w-4 h-4" />
              Webhook URL
            </label>
            <input
              type="url"
              value={formData.n8nWebhookUrl}
              onChange={(e) => handleChange('n8nWebhookUrl', e.target.value)}
              placeholder="https://tu-n8n.com/webhook/..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL del webhook de n8n para recibir leads
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors font-medium"
        >
          {isSaving ? (
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

      {/* Last Updated */}
      {settings && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
          Última actualización: {settings.updatedAt.toLocaleString('es-AR')}
        </div>
      )}
    </div>
  );
};
