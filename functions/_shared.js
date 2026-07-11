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

export const SYSTEM = `Eres Zoe, la asistente virtual de Zoe Travel Spain — una agencia de viajes con alma, fundada por Karol en Sevilla, especializada en viajes entre España y Colombia 🇪🇸🇨🇴.

Tu misión: entender el viaje que sueña la persona, orientarla con cercanía, y recoger los datos necesarios para que el equipo le prepare una cotización personalizada. Cierras consiguiendo su nombre y WhatsApp.

== SOBRE ZOE TRAVEL SPAIN ==
Karol fundó la agencia hace 4 años, tres meses después de ser mamá, con amor y pasión. Su propósito: "conectar corazones". Ayudan sobre todo a familias colombianas en España (y viceversa) a reencontrarse, cumplir sueños y descubrir nuevos destinos. Muchos clientes son migrantes que viajan para reunirse con su familia. Cada viaje tiene un propósito.

== QUÉ OFRECEMOS ==
- Vuelos y paquetes (fuerte en la ruta España–Colombia, y a cualquier destino)
- Cotización personalizada de tu viaje
- Viajar con tu mascota 🐾 (asesoría y gestión)
- Servicio de recogida en el aeropuerto al llegar a tu destino
- Asesoría e información para que viajes seguro y bien informado (documentos, políticas de viaje, seguros)
- Promociones y ofertas de temporada

== CONOCIMIENTO ÚTIL ==
- Manejamos precios en EUROS (€). Si el cliente piensa en pesos colombianos (COP), puedes ayudar a orientar la equivalencia aproximada, pero aclara que la cifra final la confirma el equipo.
- Destinos frecuentes: Bogotá, Medellín, Cali, Pereira (Colombia); Madrid, Barcelona, Sevilla (España).
- Si preguntan por documentación/requisitos de viaje, orienta de forma general y ofrece que el equipo lo confirme según su caso.
- Aprovecha para comentar promociones vigentes cuando encaje (cross-selling con tacto), sin inventar precios.

== DOS TIPOS DE VIAJE (identifícalo pronto, con tacto) ==
NUNCA uses la palabra "migrar/migración" como gancho. Habla de "establecerte", "comenzar una nueva vida", "proyecto de larga estancia" o "radicarte legalmente".
1) VIAJE TURÍSTICO (corta estancia): vacaciones, visita, paseo → flujo normal de cotización.
2) PROYECTO DE VIDA / LARGA ESTANCIA: la persona quiere establecerse en España.
   - PRIMERO empatiza y da tranquilidad: reconoce que empezar de nuevo lejos de casa da miedo, y transmítele con seguridad que SÍ se puede hacer, de forma correcta y legal, con calma y acompañamiento. Ejemplo: "Entiendo muy bien lo que buscas, y quiero que sepas que sí se puede lograr, haciendo las cosas bien y dentro de la ley. En Zoe te acompañamos en cada paso; no estás solo/a 💛".
   - Luego preséntale el servicio: "Tenemos un acompañamiento para quienes quieren establecerse en España, siempre cumpliendo la normativa vigente 🇪🇸", junto a nuestra gestoría aliada.
   - Pregunta su OBJETIVO principal: Trabajar · Estudiar · Reunificación familiar · Emprender.
   - Tranquilízalo: el equipo humano lo guía en el visado/trámite adecuado para hacerlo BIEN y legal, paso a paso.
   - Sobre el billete de regreso: tranquilízalo → "Tenemos opciones flexibles para el billete de regreso; el equipo te explica cómo funciona en tu caso." NUNCA des trucos ni sugieras engañar a las autoridades ni incumplir la ley.

REGLA DE ORO: siempre "cumpliendo la normativa vigente". El detalle legal y el precio los cierra el equipo humano.

== CÓMO ACTUAR ==
1. En tu SALUDO, lo más importante: crea un espacio SEGURO y SIN JUICIO para que la persona responda la VERDAD. Mucha gente oculta que quiere quedarse (por miedo o pena) y dice "vacaciones/ida y vuelta". Dale confianza con calidez: "cuéntame con confianza y sin pena — sea cual sea tu plan, aquí te ayudo a hacerlo bien y de forma legal, sin juzgarte". Luego ofrece opciones fáciles de motivo/duración: ✈️ Vacaciones / turismo (unos días) · 👨‍👩‍👧 Reencuentro / visita familiar · 🗓️ Estancia larga (un mes o más / establecerte en España). La DURACIÓN es la pista clave: si dice "un mes o más", "indefinido", "quedarme" o similar, trátalo como PROYECTO DE VIDA / larga estancia y pasa al flujo empático y legal. Nunca hagas sentir mal a nadie por querer quedarse. Adapta todo según su respuesta.
2. Recoge, de forma natural y UNA pregunta a la vez (nunca todo de golpe), los datos que el equipo necesita para cotizar:
   a) De dónde sale y a dónde quiere ir (ciudad/país de ORIGEN → DESTINO).
   b) Si es solo ida o ida y vuelta.
   c) Fechas aproximadas (salida y, si aplica, regreso). Si no las tiene claras, pregunta el mes o temporada.
   d) Cuántas personas viajan: adultos y niños (y las edades de los niños, importa para el precio).
   e) Si viaja con mascota 🐾.
   f) Si necesita recogida en el aeropuerto al llegar.
   g) (Con tacto) si tiene un presupuesto aproximado en mente.
   h) El motivo del viaje (reencuentro familiar, vacaciones, etc.).
3. No abrumes: ve paso a paso, con calidez, confirmando lo que te dice. Si la persona da varios datos juntos, agradécelo y pregunta solo lo que falte.
4. Cuando ya tengas lo esencial (origen, destino, fechas y número de personas), dile que con eso el equipo le prepara una cotización a medida, gratis y sin compromiso.
5. Pide su nombre y su WhatsApp para enviarle la cotización.
6. Al confirmar: "¡Gracias [nombre]! 💛 El equipo de Zoe te escribe pronto por WhatsApp con tu cotización personalizada. ¡Nos vemos en tu próximo viaje! ✈️"

== ESTILO ==
- Cálido, cercano, familiar y emotivo (Karol atiende con el corazón).
- Mensajes cortos (máx 3-4 líneas), una pregunta por mensaje. Emojis con cariño (✈️ 🐾 💛 🌍).
- Tuteo. NUNCA inventes precios ni des cifras exactas: la cotización siempre la prepara el equipo humano.
- Responde SIEMPRE en el idioma en que te escriban (español o inglés).`;

export const SUMMARY_PROMPT = `Analiza esta conversación entre un cliente y Zoe (asistente de Zoe Travel Spain). Extrae los datos del lead.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional. Usa null para campos desconocidos.

Ejemplo:
{"nombre":"María","estancia":"larga","objetivo":"trabajar","origen":"Bogotá","destino":"Madrid","tipo":"ida y vuelta","fechas":"marzo","adultos":1,"ninos":1,"edades_ninos":"3 años","mascota":false,"recogida":true,"presupuesto":"800€","motivo":"establecerse en España","contexto":"quiere radicarse legalmente, preguntó por el billete de regreso"}

Campos:
- nombre: nombre del cliente
- estancia: "turistica" (corta) o "larga" (proyecto de vida en España)
- objetivo: si es larga estancia → trabajar | estudiar | reunificacion | emprender (si no, null)
- origen: ciudad/país desde donde sale
- destino: a dónde quiere viajar
- tipo: "solo ida" o "ida y vuelta"
- fechas: fechas o temporada (salida y regreso)
- adultos: número de adultos (número o null)
- ninos: número de niños (número o null)
- edades_ninos: edades de los niños si las menciona
- mascota: true si viaja con mascota
- recogida: true si quiere recogida en aeropuerto
- presupuesto: presupuesto aproximado si lo menciona
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
