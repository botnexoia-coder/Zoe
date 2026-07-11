import { CORS, SYSTEM, esc, json, notify, callClaude, summarizeLead } from '../_shared.js';

export function onRequestOptions() { return new Response(null, { headers: CORS }); }

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ reply: 'El asistente aún no está configurado. ¡Escríbenos por WhatsApp mientras tanto! ✈️' });
  }
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'JSON inválido' }, 400); }
  let messages = body.messages;
  if (!messages || !Array.isArray(messages)) return json({ error: 'Faltan mensajes' }, 400);
  if (messages.length > 24) messages = messages.slice(-24);

  const reply = await callClaude(env.ANTHROPIC_API_KEY, 'claude-sonnet-4-6', SYSTEM, messages, 320);

  let lastUser = '';
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') { lastUser = String(messages[i].content || ''); break; }
  }
  const phone = lastUser.replace(/[\s\-.()]/g, '').match(/\+?[0-9]{7,}/);
  if (phone) {
    const all = messages.concat([{ role: 'assistant', content: reply }]);
    const lead = await summarizeLead(env.ANTHROPIC_API_KEY, all);
    let m = '✈️ <b>NUEVO LEAD — ZOE TRAVEL SPAIN (chat)</b>\n\n📱 <b>WhatsApp: ' + esc(phone[0]) + '</b>\n';
    if (lead.nombre)   m += '👤 Nombre: ' + esc(lead.nombre) + '\n';
    if (lead.destino)  m += '🌍 Destino: ' + esc(lead.destino) + '\n';
    if (lead.fechas)   m += '📅 Fechas: ' + esc(lead.fechas) + '\n';
    if (lead.personas) m += '👥 Viajeros: ' + esc(lead.personas) + '\n';
    if (lead.mascota)  m += '🐾 Viaja con mascota\n';
    if (lead.motivo)   m += '💛 Motivo: ' + esc(lead.motivo) + '\n';
    if (lead.contexto) m += '📝 ' + esc(lead.contexto) + '\n';
    m += '\n⚡ <b>Preparar cotización hoy</b>';
    await notify(env, m);
  }
  return json({ reply });
}
