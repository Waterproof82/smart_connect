import fetch from 'cross-fetch';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const EDGE_FUNCTION_URL = 'https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

async function testEdgeFunction() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Autenticación anónima
  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) {
    console.error('Error al hacer signInAnonymously:', anonError);
    return;
  }
  const jwt = anonData?.session?.access_token;
  if (!jwt) {
    console.error('No se obtuvo JWT de sesión anónima');
    return;
  }
  console.log('JWT obtenido:', jwt.substring(0, 30) + '...');

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: '¿Cuánto cuesta QRIBAR?' })
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

await testEdgeFunction();
