import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
  return new Response(JSON.stringify({ error: 'webauthn register-options not yet migrated' }), { status: 501, headers: { 'Content-Type': 'application/json' } });
};
