// ========================================
// TEST: Gemini Generate Edge Function
// ========================================
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

// Leer .env.local manualmente
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 Testing gemini-generate Edge Function...\n');

const testPayload = {
  contents: [
    { 
      role: 'user',
      parts: [{ text: 'Hola, ¿qué servicios ofreces?' }] 
    }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500
  }
};

console.log('📤 Sending payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\n⏳ Waiting for response...\n');

try {
  const { data, error } = await supabase.functions.invoke('gemini-generate', {
    body: testPayload
  });

  if (error) {
    console.error('❌ Error from Supabase:', error);
    
    // Intentar leer el cuerpo de la respuesta de error
    if (error.context?.body) {
      try {
        const reader = error.context.body.getReader();
        const { value } = await reader.read();
        const errorBody = new TextDecoder().decode(value);
        console.error('\n📄 Error Response Body:');
        console.error(errorBody);
      } catch (readError) {
        console.error('Could not read error body:', readError);
      }
    }
    process.exit(1);
  }

  if (data?.error) {
    console.error('❌ Error from Gemini API:', data.error);
    console.error('Error details:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('✅ Success! Response received:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log('\n💬 Generated text:');
    console.log(data.candidates[0].content.parts[0].text);
  }
} catch (err) {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
}
