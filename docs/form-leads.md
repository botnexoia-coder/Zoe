# Recepción de formularios

`POST /api/lead` mantiene `ok:true` cuando al menos un proveedor de aviso acepta el mensaje. `notificationSent` significa aceptación por el proveedor, no lectura humana ni entrega final de WhatsApp. Si el aviso no se acepta responde 503, incluso cuando KV guarda una copia (`ok:false`, `stored:true`, `notificationSent:false`, `requestId`): el formulario mantiene datos y permite reintentar. JSON no objeto, tipos o tamaños inválidos: 400; cuerpo superior a 8192 bytes: 413.

El frontend genera UUID v4 por payload, conserva el mismo UUID tras error de transporte/HTTP y genera otro cuando cambian campos. El servidor admite llamadas antiguas sin ID y les asigna uno. Mismo ID con contenido normalizado diferente produce 409; un reintento secuencial observado de un registro con aviso aceptado devuelve duplicate sin otro aviso. Mismo ID pendiente vuelve a intentar el aviso y actualiza su estado. El navegador agrupa dobles envíos simultáneos del mismo payload en una sola promesa.

KV conserva registros 90 días bajo `lead:form:<UUID>`, con datos originales, payload normalizado, fecha y notification.status (`pending` o `sent`), texto del aviso y resultados de canales. No contiene tokens del proveedor. Dos leads diferentes ya no comparten clave por coincidir en milisegundos.

## Pendientes

Este cambio NO crea scheduler ni promete reintentos automáticos. Un registro pending es recuperable por el operador con acceso autorizado al KV del proyecto (consultar CONEXIONES y verificar cuenta/proyecto antes de operar): buscar el prefijo lead:form:, revisar notification.status y contactar con los datos guardados o gestionar el aviso por el canal operativo acordado. El usuario ve que la copia está guardada pero el aviso sigue pendiente; el formulario permanece disponible para reintentar con el mismo UUID o usar el contacto directo. No se confirma atención operativa desde KV solo. Una futura cola automática o revisión humana necesita su propio responsable y alcance; no considerar una lista KV como evidencia de seguimiento humano ya activo. Al revisar/exportar, conservar privacidad y TTL; no copiar registros a repositorios/informes.

## Límites

KV no ofrece exclusión atómica ni lecturas inmediatamente consistentes: concurrencia, lectura atrasada o fallo al guardar estado pueden duplicar avisos. Si solo el proveedor acepta y KV falla, tampoco hay dedupe durable. No se garantiza exactly once. El UUID hace posible seguir el intento lógico, evita colisiones de timestamp y deduplica cuando se observa su registro; una garantía más fuerte exige infraestructura transaccional aprobada.

Pruebas offline: `node --test tests/*.test.mjs`. Las pruebas de consumidores extraen los manejadores reales y simulan DOM/transportes; no sustituyen QA visual en navegador. No enviar formularios reales como prueba sin encargo explícito.
