/* Zoe measurement boundary. GTM owns vendor tags; no form/chat values enter dataLayer. */
(function () {
  'use strict';
  var KEY = 'zoe-consent-v2', CONTAINER = 'GTM-MBFKB44Q';
  var consent = {analytics:false, advertising:false, external:false}, loaded=false, leads=new Set();
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted'});
  gtag('set','ads_data_redaction',true);
  gtag('set','url_passthrough',false);
  function read(){try {var v=JSON.parse(localStorage.getItem(KEY));return v && v.version===2 ? v : null;}catch(_){return null;}}
  function safeReferrer(){try{var u=new URL(document.referrer);return u.origin+u.pathname;}catch(_){return '';}}
  function payload(name){return {event:name,analytics_consent:consent.analytics?'granted':'denied',advertising_consent:consent.advertising?'granted':'denied',page_location:location.origin+location.pathname,page_path:location.pathname,page_referrer:safeReferrer(),page_title:'Zoe Travel Spain'};}
  var allowedEvents=['whatsapp_click','chatbot_open','zoe_prompt_view','zoe_prompt_choice','generate_lead'];
  function trackLead(result){if(!result || result.stored!==true || !result.requestId || leads.has(result.requestId))return;leads.add(result.requestId);track('generate_lead');}
  function track(name, detail){
    if(!allowedEvents.includes(name) || !(consent.analytics || consent.advertising))return;
    var p=payload(name);
    if(name==='zoe_prompt_choice' && detail && ['zoe','whatsapp','close'].includes(detail.choice))p.choice=detail.choice;
    window.dataLayer.push(p);
  }
  window.ZoeMeasurement={track:track,leadStored:trackLead,preferences:function(){return Object.assign({},consent);}};
  function clearCookies(){
    document.cookie.split(';').forEach(function(part){var name=part.trim().split('=')[0];if(!/^(_ga($|_)|_gid$|_gat($|_)|_gcl_|_fbp$|_fbc$)/.test(name))return;
      var domains=['',location.hostname,'.'+location.hostname];var bits=location.hostname.split('.');if(bits.length>2)domains.push('.'+bits.slice(-2).join('.'));
      domains.forEach(function(domain){document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax';});
    });
  }
  function apply(next, persist){
    var old=consent;consent={analytics:next.analytics===true,advertising:next.advertising===true,external:next.external===true};
    var revoked=(old.analytics&&!consent.analytics)||(old.advertising&&!consent.advertising);
    window['ga-disable-G-WERY3DLGVQ']=!consent.analytics;
    gtag('consent','update',{analytics_storage:consent.analytics?'granted':'denied',ad_storage:consent.advertising?'granted':'denied',ad_user_data:consent.advertising?'granted':'denied',ad_personalization:consent.advertising?'granted':'denied'});
    if(!consent.advertising && typeof window.fbq==='function')window.fbq('consent','revoke');
    var persisted=!persist;
    if(persist){try{localStorage.setItem(KEY,JSON.stringify(Object.assign({version:2,updated:new Date().toISOString()},consent)));persisted=true;}catch(_){}}
    // A reload stops already-loaded vendor code after revocation, including mixed-category consent.
    if(revoked){clearCookies();if(persisted){location.reload();return;}}
    window.dataLayer.push(payload('zoe_consent'));
    if((consent.analytics||consent.advertising)&&!loaded){loaded=true;window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id='+CONTAINER;document.head.appendChild(s);}
    if(consent.analytics&&!old.analytics)window.dataLayer.push(payload('zoe_analytics_ready'));
    if(consent.advertising&&!old.advertising)window.dataLayer.push(payload('zoe_ads_ready'));
  }
  var saved=read();if(saved)apply(saved,false);
  function init(){
    var english=function(){return document.documentElement.lang==='en';};
    var ui=document.createElement('div');ui.id='zoePrivacy';document.body.appendChild(ui);
    var settingsOpen=false, bannerOpen=!saved, returnFocus=null;
    function texts(){return english()?{title:'Your privacy choices',copy:'Analytics helps measure visits and use of Zoe. Advertising measures campaign results with Meta. Both are optional, as are YouTube videos.',accept:'Accept all',reject:'Reject optional',settings:'Settings',save:'Save preferences',close:'Close',necessary:'Necessary',necessaryText:'Language, theme and privacy preferences. Always active.',analytics:'Analytics',analyticsText:'Google Analytics: visits and interactions.',advertising:'Advertising',advertisingText:'Meta Pixel: campaign visits, contacts and quote requests.',external:'YouTube videos',externalText:'Allow embedded external videos.',manage:'Cookie settings',policy:'Privacy and cookies',video:'YouTube video blocked. Enable videos in cookie settings.'}:{title:'Tú decides sobre tu privacidad',copy:'La analítica mide las visitas y el uso de Zoe. La publicidad mide los resultados de las campañas con Meta. Ambas son opcionales, igual que los vídeos de YouTube.',accept:'Aceptar todas',reject:'Rechazar opcionales',settings:'Configurar',save:'Guardar preferencias',close:'Cerrar',necessary:'Necesarias',necessaryText:'Idioma, tema y preferencias de privacidad. Siempre activas.',analytics:'Analítica',analyticsText:'Google Analytics: visitas e interacciones.',advertising:'Publicidad',advertisingText:'Píxel de Meta: visitas de campañas, contactos y solicitudes de cotización.',external:'Vídeos de YouTube',externalText:'Permite cargar los vídeos externos integrados.',manage:'Configurar cookies',policy:'Privacidad y cookies',video:'Vídeo de YouTube bloqueado. Activa los vídeos desde la configuración de cookies.'};}
    function renderVideos(){document.querySelectorAll('.vid[data-video]').forEach(function(box){box.replaceChildren();if(consent.external){var f=document.createElement('iframe');f.src=box.dataset.video;f.title='Zoe Travel';f.loading='lazy';f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;box.appendChild(f);}else{var button=document.createElement('button');button.type='button';button.className='zoe-video-consent';button.textContent=texts().video;button.onclick=openSettings;box.appendChild(button);}});}
    function openSettings(){returnFocus=document.activeElement;settingsOpen=true;render();ui.querySelector('input').focus();}
    function closeSettings(){settingsOpen=false;render();if(returnFocus && returnFocus.isConnected)returnFocus.focus();}
    function save(next){apply(next,true);settingsOpen=false;bannerOpen=false;render();renderVideos();if(returnFocus && returnFocus.isConnected)returnFocus.focus();}
    function render(){var t=texts();ui.innerHTML=(bannerOpen?'<aside class="zp-banner" role="region" aria-label="'+t.title+'"><strong>'+t.title+'</strong><p>'+t.copy+' <a href="/privacidad/">'+t.policy+'</a>.</p><div class="zp-actions"><button data-zp="accept">'+t.accept+'</button><button data-zp="reject">'+t.reject+'</button><button data-zp="settings">'+t.settings+'</button></div></aside>':'')+'<button type="button" class="zp-manage" data-zp="settings">'+t.manage+'</button>'+(settingsOpen?'<div class="zp-overlay"><section class="zp-panel" role="dialog" aria-modal="true" aria-labelledby="zp-title"><h2 id="zp-title">'+t.title+'</h2><p>'+t.copy+'</p><div class="zp-row"><b>'+t.necessary+'</b><span>'+t.necessaryText+'</span></div>'+['analytics','advertising','external'].map(function(k){return '<label class="zp-row"><span><b>'+t[k]+'</b><span>'+t[k+'Text']+'</span></span><input type="checkbox" name="'+k+'" '+(consent[k]?'checked':'')+'></label>';}).join('')+'<div class="zp-actions"><button data-zp="save">'+t.save+'</button><button data-zp="close">'+t.close+'</button></div></section></div>':'');
      ui.querySelectorAll('[data-zp]').forEach(function(b){b.onclick=function(){var a=b.dataset.zp;if(a==='settings')openSettings();if(a==='close')closeSettings();if(a==='accept')save({analytics:true,advertising:true,external:true});if(a==='reject')save({});if(a==='save'){var next={};ui.querySelectorAll('input').forEach(function(i){next[i.name]=i.checked;});save(next);}};});
    }
    var homeManage=document.getElementById('cookieManage');if(homeManage)homeManage.onclick=openSettings;
    document.addEventListener('keydown',function(e){if(!settingsOpen)return;if(e.key==='Escape'){e.preventDefault();closeSettings();}if(e.key==='Tab'){var items=ui.querySelectorAll('.zp-panel input,.zp-panel button');var first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    new MutationObserver(function(){render();renderVideos();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    var chatOpen=false;
    new MutationObserver(function(){var widget=document.getElementById('vaiWidget'),now=!!(widget&&widget.classList.contains('is-open'));if(now&&!chatOpen)track('chatbot_open');chatOpen=now;}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a&&a.id!=='waNav'&&/^https:\/\/(wa\.me\/|api\.whatsapp\.com\/)/.test(a.href))track('whatsapp_click');},true);
    render();renderVideos();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
