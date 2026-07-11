/* ============================================================
   ZOE TRAVEL SPAIN — lógica compartida (Pages Functions)
   Agente "Zoe" + captura de leads. Patrón: velai / myxu / dialogos
   ============================================================ */

/* Mismo Telegram del equipo (se puede cambiar por el de Karol vía env TELEGRAM_CHAT_ID) */
export const TELEGRAM_CHAT_ID_DEFAULT = '-5021568102';
export const WA_EQUIPO = [
  // 'whatsapp:+34644280183',   // Karol / Zoe Travel
];
export const TWILIO_FROM = 'whatsapp:+15706160059';
export const WHATSAPP_ZOE = '34644280183';

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const SYSTEM = `Eres Zoe, la asistente virtual de Zoe Travel Spain — una agencia de viajes con alma, fundada por Karol en Sevilla.

Tu misión: entender el viaje que sueña la persona, orientarla con cercanía y conseguir que deje su nombre y WhatsApp para que el equipo le prepare una cotización personalizada.

== SOBRE ZOE TRAVEL SPAIN ==
Karol fundó la agencia hace 4 años, tres meses después de ser mamá, con amor y pasión. Su propósito: "conectar corazones". Ayudan a familias a reencontrarse, a cumplir sueños y a descubrir nuevos destinos. Muchos clientes son migrantes que viajan para reunirse con su familia. Cada viaje tiene un propósito.

== QUÉ OFRECEMOS ==
- Vuelos y paquetes a cualquier destino ("donde quieras ir, te ayudamos a llegar")
- Cotización personalizada de tu viaje
- Viajar con tu mascota 🐾 (asesoría y gestión)
- Servicio de recogida en el aeropuerto al llegar a tu destino
- Asesoría e información para que viajes seguro y bien informado (documentos, seguros de viaje)
- Promociones y ofertas de temporada

== CÓMO ACTUAR ==
1. Saluda con calidez y cercanía (tono familiar, emotivo, cero frío).
2. Pregunta a dónde quiere viajar, fechas aproximadas, cuántas personas y el motivo (reencuentro, vacaciones, etc.).
3. Si viaja con mascota o necesita recogida en aeropuerto, ofréceselo con naturalidad.
4. Explica que le preparamos una cotización a medida sin compromiso.
5. Pide su nombre y WhatsApp para enviarle la cotización / que el equipo le escriba.
6. Al confirmar: "¡Gracias [nombre]! 💛 El equipo de Zoe te escribe pronto por WhatsApp con tu cotización. ¡Nos vemos en tu próximo viaje! ✈️"

== ESTILO ==
- Cálido, cercano, familiar y emotivo (Karol atiende con el corazón).
- Mensajes cortos (máx 3-4 líneas). Emojis con cariño (✈️ 🐾 💛 🌍).
- Tuteo. Nunca inventes precios exactos: la cotización siempre la prepara el equipo.
- Responde SIEMPRE en el idioma en que te escriban (español o inglés).`;

export const SUMMARY_PROMPT = `Analiza esta conversación entre un cliente y Zoe (asistente de Zoe Travel Spain). Extrae los datos del lead.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional. Usa null para campos desconocidos.

Ejemplo:
{"nombre":"María","destino":"Bogotá","fechas":"diciembre","personas":2,"mascota":false,"motivo":"reencuentro familiar","contexto":"viaja con su hijo"}

Campos:
- nombre: nombre del cliente
- destino: a dónde quiere viajar
- fechas: fechas o temporada aproximada
- personas: número de viajeros (número o null)
- mascota: true si viaja con mascota
- motivo: motivo del viaje (máx 5 palabras)
- contexto: detalle relevante (máx 12 palabras)`;

export function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
export function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, CORS) });
}
export async function sendTelegram(token, chatId, text) {
  try {
    await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
    });
  } catch (e) {}
}
export async function sendWhatsApp(accountSid, authToken, text) {
  var plain = text.replace(/<[^>]+>/g, '');
  await Promise.all(WA_EQUIPO.map(async function (to) {
    try {
      await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: TWILIO_FROM, To: to, Body: plain }).toString(),
      });
    } catch (e) {}
  }));
}
export async function notify(env, text) {
  var chatId = env.TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID_DEFAULT;
  if (env.TELEGRAM_TOKEN && chatId) await sendTelegram(env.TELEGRAM_TOKEN, chatId, text);
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) await sendWhatsApp(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN, text);
}
export async function callClaude(apiKey, model, system, messages, maxTokens) {
  var res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model, max_tokens: maxTokens || 320, system: system, messages: messages }),
  });
  var data = await res.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}
export async function summarizeLead(apiKey, messages) {
  var conv = messages.map(function (m) { return (m.role === 'user' ? 'Cliente' : 'Zoe') + ': ' + (typeof m.content === 'string' ? m.content : ''); }).join('\n');
  try {
    var raw = await callClaude(apiKey, 'claude-haiku-4-5-20251001', SUMMARY_PROMPT, [{ role: 'user', content: conv }], 200);
    var match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : '{}');
  } catch (e) { return {}; }
}
