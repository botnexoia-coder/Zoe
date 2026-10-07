// KV dedupe is best effort, not an atomic lock or an exactly-once guarantee.
export async function acceptLead(env, data, text, notify, requestId) {
  const id = requestId || crypto.randomUUID();
  const key = 'lead:form:' + id;
  const payload = JSON.stringify(data);
  let record;
  if (env.KV) {
    try {
      const raw = await env.KV.get(key);
      if (raw) record = JSON.parse(raw);
    } catch (_) {}
  }
  if (record && record.payload !== payload) return { conflict: true };
  if (record && record.notification && record.notification.status === 'sent') {
    return { ok: true, requestId: id, stored: true, notificationSent: true, duplicate: true };
  }
  const alreadyStored = Boolean(record);
  record = record || { ...data, requestId: id, payload, stamp: new Date().toISOString(), notification: { status: 'pending', text } };
  let stored = alreadyStored;
  const save = async () => {
    if (!env.KV) return;
    try { await env.KV.put(key, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 90 }); stored = true; } catch (_) {}
  };
  await save();
  let delivery;
  try { delivery = await notify(env, text); } catch (_) { delivery = { sent: false, results: [] }; }
  const notificationSent = Boolean(delivery && delivery.sent);
  record.notification = { status: notificationSent ? 'sent' : 'pending', text, channels: delivery && delivery.results || [] };
  await save();
  return { ok: notificationSent, requestId: id, stored, notificationSent };
}

export function validLeadBody(body, fields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (body.requestId !== undefined && (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId))) return false;
  return Object.entries(fields).every(([key, max]) => body[key] === undefined || (typeof body[key] === 'string' && body[key].length <= max));
}
