# Medición Zoe — contrato de integración

Contenedor propio de Zoe: `GTM-MBFKB44Q`. GA4: `G-WERY3DLGVQ`. Píxel Meta: `1013931690201337`. La web carga **solo GTM**, nunca añade otra copia de GA4 o Meta. El contenedor debe configurarse y publicarse por separado antes de afirmar recepción.

`public/assets/measurement.js` se ejecuta en head de las páginas públicas. Consent Mode v2 parte de analytics_storage, ad_storage, ad_user_data y ad_personalization denegados. No hay iframe noscript ni peticiones de medición antes de autorizar analítica o publicidad. YouTube tiene consentimiento separado. El almacenamiento anterior v1 no autoriza las nuevas categorías.

Los eventos de interacción entran a GTM con el prefijo `zoe_web_`; el tag GA4 lo elimina al enviar el evento a Google. Esto evita que `gtag(event, nombre)` vuelva a disparar el mismo trigger GTM y cause recursión. Los eventos ready conservan sus nombres. Cada evento lleva `analytics_consent` y `advertising_consent` (`granted`/`denied`), `page_location` (origen+ruta, sin query/hash), `page_path`, `page_referrer` saneado y título fijo. GTM debe usar estos valores, **no Page URL/Referrer automáticos** si pueden incluir información personal. Los parámetros UTM se excluyen en esta versión para no transmitir valores arbitrarios en URLs; la atribución por campaña detallada requiere acordar una lista de campañas/valores permitidos. Desactivar medición mejorada automática de formularios y datos proporcionados por usuarios. No habilitar coincidencia avanzada de Meta.

- `zoe_analytics_ready`: inicializar Analytics / page_view al autorizar analítica. El trigger filtra analytics_consent=granted y el HTML comprueba de nuevo ZoeMeasurement.preferences().analytics antes de ejecutar; Consent Mode mantiene analytics_storage coherente.
- `zoe_ads_ready`: inicializar Meta / PageView al autorizar publicidad. El trigger filtra advertising_consent=granted y el HTML comprueba de nuevo ZoeMeasurement.preferences().advertising. Consent Mode mantiene ad_storage, ad_user_data y ad_personalization coherentes.
- `zoe_web_whatsapp_click` → `whatsapp_click`: clic en enlace wa.me o api.whatsapp.com; no implica mensaje enviado. Meta: Contact.
- `zoe_web_chatbot_open` → `chatbot_open`: transición real del widget `#vaiWidget` a `.is-open`, incluidos el botón propio del widget y los CTA.
- `zoe_web_zoe_prompt_view` → `zoe_prompt_view`: se abre la ventana de elección de ayuda.
- `zoe_web_zoe_prompt_choice` → `zoe_prompt_choice`: `choice` está limitada a zoe, whatsapp o close.
- `zoe_web_generate_lead` → `generate_lead`: respuesta del endpoint confirma `stored:true` y requestId, una vez por requestId durante la página. Cuenta aunque el aviso al equipo esté pendiente; no cuenta una notificación sin guardado. Meta: Lead.

Todos los eventos GA requieren analítica concedida; todos los Meta requieren publicidad concedida. Una categoría no autoriza la otra. Los dos tags HTML usan NOT_NEEDED en el selector de comprobaciones adicionales de GTM porque la restricción real es el filtro de evento más la comprobación en código; no se depende de una comprobación adicional de consentimiento de GTM. No emitir etiquetas de PageView/Contact/Lead sin estos filtros. Las variables nombre/teléfono/mensaje/requestId nunca se incluyen en dataLayer. El píxel Meta puede adjuntar la URL/referrer nativos a su protocolo: no poner información personal en las URLs de la web o de campañas. No afirmar que Meta recibe exclusivamente page_location saneado.

La retirada actualiza Consent Mode, deshabilita GA, revoca Meta si está cargado, elimina cookies de medición accesibles y recarga para detener código ya cargado. Las cookies de terceros deben gestionarse en el navegador. Si el navegador impide guardar la preferencia, se conserva denegada en memoria sin recargar para evitar restaurar un permiso anterior.

## Reutilización

Reutilizar el patrón y los eventos, nunca las cuentas/IDs de Zoe para otra web. Cada cliente mantiene su propiedad de Analytics, contenedor y píxel. Adaptar el identificador local de consentimiento y los selectores del widget/formulario; preservar el límite que impide enviar contenido de usuarios. La integración técnica se hace una vez; el equipo de marketing mantiene sus etiquetas/campañas desde GTM y consulta resultados en Analytics/Meta.

## Verificación

`node --test tests/*.test.mjs` cubre endpoint/formulario y frontera de medición: denegación inicial, categorías separadas, eventos sin PII, guardado de lead y deduplicación, retirada/cookies/recarga. `node --check public/assets/measurement.js`. QA navegador y recepción real en GA4/Meta son comprobaciones adicionales, no sustituidas por tests locales.
