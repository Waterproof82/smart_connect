const ALLOWED_ORIGINS = [
  'https://smartconnect.ai',
  'https://www.smartconnect.ai',
  'https://smart-connect-landing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

Deno.serve((req) => {
  console.log('FUNCION TEST LOG OK');
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  const corsHeaders = { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }
  return new Response('OK', {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
  });
});
