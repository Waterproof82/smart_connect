/**
 * Debug Script - Vercel Environment Variables
 * 
 * Este script muestra qué variables de entorno están disponibles durante el build
 */

console.log('\n🔍 ===== VERCEL BUILD DEBUG =====\n');

console.log('📦 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MODE:', process.env.MODE);
console.log('- VITE_N8N_WEBHOOK_URL:', process.env.VITE_N8N_WEBHOOK_URL ? '✅ SET' : '❌ NOT SET');
console.log('- VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
console.log('- VITE_CONTACT_EMAIL:', process.env.VITE_CONTACT_EMAIL ? '✅ SET' : '❌ NOT SET');
console.log('- VITE_GOOGLE_SHEETS_ID:', process.env.VITE_GOOGLE_SHEETS_ID ? '✅ SET' : '❌ NOT SET');

console.log('\n📊 All VITE_ variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('VITE_'))
  .forEach(key => {
    const value = process.env[key];
    const preview = value ? value.substring(0, 20) + '...' : 'undefined';
    console.log(`  ${key}: ${preview}`);
  });

console.log('\n🎯 Expected values:');
console.log('  VITE_N8N_WEBHOOK_URL should be: https://n8n-production-12fbe.up.railway.app/webhook-test/hot-lead-intake');

if (!process.env.VITE_N8N_WEBHOOK_URL) {
  console.error('\n⚠️  WARNING: VITE_N8N_WEBHOOK_URL is not set!');
  console.error('The app will fail at runtime. Please configure it in Vercel Dashboard → Settings → Environment Variables');
  console.error('Continuing build to show full error context...\n');
} else {
  console.log('\n✅ All required variables are set!\n');
}
