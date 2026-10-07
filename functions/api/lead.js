import { acceptLead, validLeadBody } from '../_lead.js';
import { CORS, esc, json, notify, rateLimited } from '../_shared.js';

export function onRequestOptions() { return new Response(null, { headers: CORS }); }

export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (await rateLimited(env, ip, 'lead', 5)) return json({ error: 'Demasiadas peticiones, inténtalo en un momento.' }, 429);
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 8192) return json({ error: 'Solicitud demasiado grande' }, 413);
    body = JSON.parse(raw);
  } catch (e) { return json({ error: 'JSON inválido' }, 400); }

  if (!validLeadBody(body, { nombre: 80, telefono: 40, destino: 120, mensaje: 500 })) return json({ error: 'Datos inválidos' }, 400);

  const nombre = (body.nombre || '').toString().trim().slice(0, 80);
  const telefono = (body.telefono || '').toString().trim().slice(0, 40);
  const destino = (body.destino || '').toString().trim().slice(0, 120);
  const mensaje = (body.mensaje || '').toString().trim().slice(0, 500);
  if (!nombre || !telefono) return json({ error: 'Faltan datos' }, 400);

  let m = '✈️ <b>NUEVO LEAD — ZOE TRAVEL SPAIN (formulario)</b>\n\n';
  m += '👤 Nombre: ' + esc(nombre) + '\n📱 WhatsApp: ' + esc(telefono) + '\n';
  if (destino) m += '🌍 Destino: ' + esc(destino) + '\n';
  if (mensaje) m += '📝 Mensaje: ' + esc(mensaje) + '\n';
  m += '\n⚡ <b>Preparar cotización hoy</b>';

  const accepted = await acceptLead(env, { nombre, telefono, destino, mensaje }, m, notify, body.requestId);
  if (accepted.conflict) return json({ error: 'La solicitud cambió; vuelve a enviarla con un identificador nuevo.' }, 409);
  if (!accepted.ok) return json({ ...accepted, error: accepted.stored
    ? 'Solicitud guardada, pero el aviso al equipo está pendiente. Reintenta o contacta directamente.'
    : 'No pudimos registrar la solicitud. Inténtalo de nuevo.' }, 503);
  return json(accepted);
}
