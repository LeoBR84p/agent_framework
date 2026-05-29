export const config = { runtime: 'edge' };

export default function handler() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'aiz_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
    }
  });
}
