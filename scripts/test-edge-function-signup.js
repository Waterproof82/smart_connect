
import fetch from 'cross-fetch';

const SUPABASE_URL = 'https://tysjedvujvsmrzzrmesr.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gemini-embedding`;
const TEST_EMAIL = 'jmaristia@gmail.com'; // Cambia por el email que quieras usar
const TEST_PASSWORD = 'Powered16!'; // Cambia por una contraseña segura
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDE5NjIsImV4cCI6MjA4NTExNzk2Mn0.wwEaxcanylAFKY1x6NNNlewEcQPby0zdo9Q93qqe3dM';


async function signUpAndGetJWT() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  });
  const data = await res.json();
  console.log('SignUp response:', data);
  // Si el usuario ya existe, puedes hacer sign-in:
  if (data.error?.message?.includes('already registered')) {
    return signInAndGetJWT();
  }
  return data.session?.access_token;
}

async function signInAndGetJWT() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  });
  const data = await res.json();
  console.log('SignIn response:', data);
  return data.access_token;
}

async function testEdgeFunction(jwt) {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: '¿Cuánto cuesta QRIBAR?' })
  });
  const data = await res.json();
  console.log('Edge Function Status:', res.status);
  console.log('Edge Function Response:', data);
}




// Solo login con usuario de test actual (debe estar confirmado)
let jwt = await signInAndGetJWT();
if (jwt) {
  await testEdgeFunction(jwt);
} else {
   console.error('No JWT obtained. Verifica email y contraseña en .env.local y que el usuario esté confirmado en Supabase.');
}
