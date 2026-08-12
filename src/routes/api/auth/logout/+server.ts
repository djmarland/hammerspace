import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
  // Clear admin session cookie and redirect to /
  const headers = new Headers();
  // Clear cookie (HttpOnly, Path=/, Max-Age=0)
  headers.set('Set-Cookie', 'admin_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
  headers.set('Location', '/');
  return new Response(null, { status: 303, headers });
};
