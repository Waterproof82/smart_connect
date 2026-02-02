/**
 * Environment Variables Debug Component
 * Shows which variables are available in the built bundle
 */

import React from 'react';
import { ENV } from '@shared/config/env.config';

export const EnvDebug: React.FC = () => {
  if (ENV.PROD) {
    return null; // Hide in production
  }

  const envVars = {
    'N8N_WEBHOOK_URL': ENV.N8N_WEBHOOK_URL,
    'GEMINI_API_KEY': ENV.GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET',
    'SUPABASE_URL': ENV.SUPABASE_URL,
    'SUPABASE_ANON_KEY': ENV.SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET',
    'CONTACT_EMAIL': ENV.CONTACT_EMAIL,
    'GOOGLE_SHEETS_ID': ENV.GOOGLE_SHEETS_ID,
    'MODE': ENV.MODE,
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#000',
      color: '#0f0',
      padding: '10px',
      fontSize: '10px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      border: '2px solid #0f0'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 ENV DEBUG</div>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value || '❌ EMPTY'}
        </div>
      ))}
    </div>
  );
};
