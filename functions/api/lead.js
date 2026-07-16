import { CORS, esc, json, notify, rateLimited } from '../_shared.js';

export function onRequestOptions() { return new Response(null, { headers: CORS }); }

export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (await rateLimited(env, ip, 'lead', 5)) return json({ error: 'Demasiadas peticiones, inténtalo en un momento.' }, 429);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'JSON inválido' }, 400); }

  const nombre = (body.nombre || '').toString().trim().slice(0, 80);
  const telefono = (body.telefono || '').toString().trim().slice(0, 40);
  const destino = (body.destino || '').toString().trim().slice(0, 120);
  const mensaje = (body.mensaje || '').toString().trim().slice(0, 500);
  if (!nombre || !telefono) return json({ error: 'Faltan datos' }, 400);

  if (env.KV) {
    try {
      await env.KV.put('lead:' + Date.now(),
        JSON.stringify({ nombre, telefono, destino, mensaje, stamp: new Date().toISOString() }),
        { expirationTtl: 60 * 60 * 24 * 90 });
    } catch (e) {}
  }

  let m = '✈️ <b>NUEVO LEAD — ZOE TRAVEL SPAIN (formulario)</b>\n\n';
  m += '👤 Nombre: ' + esc(nombre) + '\n📱 WhatsApp: ' + esc(telefono) + '\n';
  if (destino) m += '🌍 Destino: ' + esc(destino) + '\n';
  if (mensaje) m += '📝 Mensaje: ' + esc(mensaje) + '\n';
  m += '\n⚡ <b>Preparar cotización hoy</b>';

  await notify(env, m);
  return json({ ok: true });
}
