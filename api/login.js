export const config = { runtime: 'edge' };

async function signJWT(payload, secret) {
  const toB64url = s => btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const hdr = toB64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const pay = toB64url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${hdr}.${pay}`));
  const sig = toB64url(String.fromCharCode(...new Uint8Array(buf)));
  return `${hdr}.${pay}.${sig}`;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const { username, password } = body ?? {};
  const validUser = process.env.USERNAME;
  const validPass = process.env.USERPASSWORD;

  if (!validUser || !validPass) {
    return json({ error: 'Auth not configured on server' }, 503);
  }

  if (username !== validUser || password !== validPass) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 86400; // 24 h
  const token = await signJWT({ sub: username, iat: now, exp }, validPass);
  const secure = req.url.startsWith('https') ? '; Secure' : '';

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `aiz_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`
    }
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
