Deno.serve((req) => {
  console.log('FUNCION TEST LOG OK');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' } });
  }
  return new Response('OK', {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' }
  });
});
