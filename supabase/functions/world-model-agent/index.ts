import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ ok: false, error: 'POST required' }, 405);
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: event, error: eventError } = await supabase.from('world_model_events').select('*').eq('status', 'PENDING').order('received_at', { ascending: true }).limit(1).maybeSingle();
  if (eventError) return json({ ok: false, error: eventError.message }, 500);
  if (!event) return json({ ok: true, processed: false, reason: 'No pending event' });

  const { data: entity } = await supabase.from('world_model_entities').select('*').eq('id', `repo:${event.repository.split('/').pop()?.toLowerCase()}`).maybeSingle();
  const beforeState = entity || null;
  const patch = { metadata: { ...(entity?.metadata || {}), lastCommitSha: event.after_sha, lastChangeAt: event.received_at, changedFiles: event.changed_files }, updated_at: new Date().toISOString() };
  const { error: updateError } = await supabase.from('world_model_entities').update(patch).eq('id', entity?.id || '');
  if (updateError && entity) {
    await supabase.from('world_model_events').update({ status: 'ERROR', error: updateError.message }).eq('id', event.id);
    return json({ ok: false, error: updateError.message }, 500);
  }

  await supabase.from('world_model_entity_history').insert({ entity_id: entity?.id || `repo:${event.repository}`, operation: 'REPOSITORY_CHANGE', before_state: beforeState, after_state: { ...(entity || {}), ...patch }, evidence: event.changed_files, source: 'github-webhook' });
  await supabase.from('world_model_proactive_events').insert({ event_type: 'REPOSITORY_CHANGED', priority: 'high', payload: { repository: event.repository, before: event.before_sha, after: event.after_sha, files: event.changed_files } });
  await supabase.from('world_model_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', event.id);
  return json({ ok: true, processed: true, eventId: event.id, repository: event.repository });
});
