async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [hdr, pay, sig] = parts;

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const binSig = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      'HMAC', key, binSig,
      new TextEncoder().encode(`${hdr}.${pay}`)
    );
    if (!valid) return false;

    const { exp } = JSON.parse(atob(pay.replace(/-/g, '+').replace(/_/g, '/')));
    return exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default async function middleware(req) {
  const { pathname } = new URL(req.url);

  // Public paths — no auth check
  if (
    pathname === '/' ||
    pathname === '/auth' ||
    pathname === '/auth.html' ||
    pathname.startsWith('/investor/') ||
    pathname === '/investor' ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/api/')
  ) return;

  const cookie = req.headers.get('cookie') ?? '';
  const match  = cookie.match(/(?:^|;\s*)aiz_token=([^;]+)/);
  const token  = match?.[1] ?? null;
  const secret = process.env.USERPASSWORD;

  const loginUrl = new URL('/auth.html', req.url);
  loginUrl.searchParams.set('return', pathname);

  if (!token || !secret) return Response.redirect(loginUrl, 302);

  const ok = await verifyToken(token, secret);
  if (!ok) return Response.redirect(loginUrl, 302);
}

export const config = {
  matcher: ['/((?!assets/|favicon\\.ico).*)']
};
