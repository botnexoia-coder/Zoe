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
    const larga = lead.estancia && String(lead.estancia).toLowerCase().indexOf('larg') === 0;
    let m = (larga ? '🏡 <b>LEAD LARGA ESTANCIA — ZOE TRAVEL SPAIN</b>' : '✈️ <b>NUEVO LEAD — ZOE TRAVEL SPAIN (chat)</b>') + '\n\n📱 <b>WhatsApp: ' + esc(phone[0]) + '</b>\n';
    if (lead.nombre)      m += '👤 Nombre: ' + esc(lead.nombre) + '\n';
    if (lead.estancia)    m += '🧭 Estancia: ' + esc(lead.estancia) + (lead.objetivo ? ' · Objetivo: ' + esc(lead.objetivo) : '') + '\n';
    if (lead.origen || lead.destino) m += '🛫 Ruta: ' + esc(lead.origen || '¿?') + ' → ' + esc(lead.destino || '¿?') + '\n';
    if (lead.tipo)        m += '🔁 Tipo: ' + esc(lead.tipo) + '\n';
    if (lead.fechas)      m += '📅 Fechas: ' + esc(lead.fechas) + '\n';
    var pax = [];
    if (lead.adultos) pax.push(esc(lead.adultos) + ' adulto(s)');
    if (lead.ninos)   pax.push(esc(lead.ninos) + ' niño(s)' + (lead.edades_ninos ? ' (' + esc(lead.edades_ninos) + ')' : ''));
    if (pax.length)   m += '👥 Viajeros: ' + pax.join(', ') + '\n';
    if (lead.mascota)     m += '🐾 Viaja con mascota\n';
    if (lead.recogida)    m += '🚕 Recogida en aeropuerto\n';
    if (lead.presupuesto) m += '💶 Presupuesto: ' + esc(lead.presupuesto) + '\n';
    if (lead.motivo)      m += '💛 Motivo: ' + esc(lead.motivo) + '\n';
    if (lead.contexto)    m += '📝 ' + esc(lead.contexto) + '\n';
    m += '\n⚡ <b>Preparar cotización hoy</b>';
    await notify(env, m);
  }
  return json({ reply });
}
