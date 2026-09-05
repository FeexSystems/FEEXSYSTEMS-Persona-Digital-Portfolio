import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const encoder = new TextEncoder();
async function verifySignature(secret: string, body: string, signature: string | null) {
  if (!signature?.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return signature.slice(7) === hex;
}

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ ok: false, error: 'POST required' }, 405);
  const body = await req.text();
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
  if (!secret || !(await verifySignature(secret, body, req.headers.get('x-hub-signature-256')))) return json({ ok: false, error: 'Invalid webhook signature' }, 401);
  const payload = JSON.parse(body);
  const eventType = req.headers.get('x-github-event') || 'unknown';
  const repository = payload.repository?.full_name || null;
  if (!repository) return json({ ok: false, error: 'Repository missing' }, 400);
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const event = { delivery_id: req.headers.get('x-github-delivery'), event_type: eventType, repository, before_sha: payload.before || null, after_sha: payload.after || payload.head_commit?.id || null, ref: payload.ref || null, changed_files: [...new Set([...(payload.head_commit?.added || []), ...(payload.head_commit?.modified || []), ...(payload.head_commit?.removed || [])])], payload, received_at: new Date().toISOString() };
  const { error } = await supabase.from('world_model_events').insert(event);
  if (error) return json({ ok: false, error: error.message }, 500);
  return json({ ok: true, queued: true, event: { repository, eventType, after: event.after_sha } }, 202);
});
