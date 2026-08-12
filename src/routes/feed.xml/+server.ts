import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return new Response('<!-- feed generation not yet migrated -->', {
    status: 501,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
