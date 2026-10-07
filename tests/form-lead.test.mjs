import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const url = s => 'data:text/javascript;base64,' + Buffer.from(s).toString('base64');
const shared = url(read('functions/_shared.js'));
const helper = url(read('functions/_lead.js'));
const module = await import(url(read('functions/api/lead.js').replace("'../_shared.js'", JSON.stringify(shared)).replace("'../_lead.js'", JSON.stringify(helper))));
const originalFetch = globalThis.fetch;
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const id = '00000000-0000-4000-8000-000000000001';
const id2 = '00000000-0000-4000-8000-000000000002';
const valid = {nombre:'Synthetic', telefono:'000000000', tipo:'historia', requestId:id};
const request = data => new Request('https://offline.invalid/api/lead', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const store = () => {const records = new Map();return {records,get:async k=>records.get(k),put:async(k,v)=>records.set(k,v)}};
const env = KV => ({KV,TELEGRAM_TOKEN:'synthetic',TELEGRAM_CHAT_ID:'synthetic'});
async function run(data, environment) {const r=await module.onRequestPost({request:request(data),env:environment});return {status:r.status,body:await r.json()};}

test('handler acceptance, delivery failures, validation and best effort dedupe', async () => {
 try {
  let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response('{"ok":false}',{status:500})};
  let r=await run(valid,env({get:async()=>null,put:async()=>{throw Error('offline')}}));assert.equal(r.status,503);
  r=await run(valid,{});assert.equal(r.status,503);
  const kv=store();r=await run(valid,env(kv));assert.equal(r.status,503);assert.equal(r.body.ok,false);assert.equal(r.body.requestId,id);assert.equal(r.body.stored,true);assert.equal(r.body.notificationSent,false);assert.equal(JSON.parse([...kv.records.values()][0]).notification.status,'pending');
  globalThis.fetch=async()=>{calls++;return new Response('{"ok":true}',{status:200})};
  r=await run(valid,env(kv));assert.equal(r.status,200);assert.equal(r.body.requestId,id);assert.equal(kv.records.size,1);assert.equal(JSON.parse([...kv.records.values()][0]).notification.status,'sent');
  r=await run(valid,env(null));assert.equal(r.body.ok,true);assert.equal(r.body.stored,false);assert.equal(r.body.notificationSent,true);
  for (const payload of [null, [], 'scalar', {...valid,nombre:123}, {...valid,requestId:'invalid'}, {...valid,mensaje:'x'.repeat(501)}]) {r=await run(payload,{});assert.equal(r.status,400);}
  globalThis.fetch=async()=>new Response('{"ok":false}',{status:200});r=await run(valid,env(null));assert.equal(r.status,503);
  globalThis.fetch=async()=>{throw Error('offline')};r=await run(valid,env(null));assert.equal(r.status,503);
  calls=0;globalThis.fetch=async()=>{calls++;return new Response('{"ok":true}',{status:200})};
  const sequential=store();await run(valid,env(sequential));r=await run(valid,env(sequential));assert.equal(r.body.duplicate,true);assert.equal(calls,1);
  r=await run({...valid,nombre:'Changed'},env(sequential));assert.equal(r.status,409);assert.equal(calls,1);
  const now=Date.now;try {Date.now=()=>1234567890000;await run(valid,env(sequential));await run({...valid,requestId:id2},env(sequential));assert.equal(sequential.records.size,2);}finally{Date.now=now}
  const legacy={...valid};delete legacy.requestId;r=await run(legacy,env(null));assert.equal(r.status,200);assert.match(r.body.requestId,/^[0-9a-f-]{36}$/);
  const malformed=await module.onRequestPost({request:new Request('https://offline.invalid/api/lead',{method:'POST',body:'{' }),env:{}});assert.equal(malformed.status,400);
  r=await run({...valid,extra:'x'.repeat(8192)},{});assert.equal(r.status,413);
  // Existing durable pending record remains accepted even when later writes fail.
  const pending=store();globalThis.fetch=async()=>new Response('{}',{status:500});await run(valid,env(pending));pending.put=async()=>{throw Error('offline')};r=await run(valid,env(pending));assert.equal(r.status,503);assert.equal(r.body.ok,false);assert.equal(r.body.stored,true);
 } finally {globalThis.fetch=originalFetch;}
});

test('frontend envelope checks, unchanged retry IDs, changed payload and in-flight duplicate', async () => {
 const sent=[];let unblock;
 const ctx={window:{},crypto:webcrypto,fetch:async(u,o)=>{sent.push(JSON.parse(o.body));return new Response('{"ok":false}',{status:200})}};
 vm.createContext(ctx);vm.runInContext(read('public/assets/lead-submit.js'),ctx);const submit=ctx.window.LeadSubmission();
 await assert.rejects(submit({nombre:'A'}), error=>error.result.ok===false);await assert.rejects(submit({nombre:'A'}));assert.equal(sent[0].requestId,sent[1].requestId);
 await assert.rejects(submit({nombre:'B'}));assert.notEqual(sent[1].requestId,sent[2].requestId);
 ctx.fetch=async()=>{await new Promise(r=>unblock=r);return new Response('{"ok":true,"stored":true,"notificationSent":true}',{status:200})};
 const a=submit({nombre:'C'}),b=submit({nombre:'C'});assert.equal(a,b);unblock();assert.equal((await a).ok,true);
 ctx.fetch=async()=>new Response('not json',{status:200});await assert.rejects(submit({nombre:'D'}));
 ctx.fetch=async()=>new Response('{"ok":true}',{status:503});await assert.rejects(submit({nombre:'E'}));
});

for (const [file, kind] of fs.existsSync(new URL('public/web/index.html',root)) ? [['public/index.html','pop'],['public/web/index.html','web']] : [['public/index.html','zoe']]) {
 for (const lang of kind==='zoe'?['es','en']:['es']) {
  test(`real submit consumer ${kind}/${lang}: error retains form; pending states accurate`, async()=>{
   const html=read(file);
   const marker=kind==='zoe'?"lf.addEventListener('submit', async function(e){":kind==='pop'?'form.addEventListener("submit", async e => {':"  form.addEventListener('submit', async function(e){";
   const start=kind==='web'?html.lastIndexOf(marker):html.indexOf(marker);assert(start>=0);
   const end=html.indexOf('\n});',start)>=0 && kind!=='web'?html.indexOf('\n});',start):html.indexOf('\n  });',start);
   const snippet=html.slice(start,end)+(kind==='web'?'\n  });':'\n});');
   const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{style:{},textContent:'',checked:true});return elements.get(id)};
   let callback;const form={style:{},nombre:{value:'Synthetic'},telefono:{value:'000000000'},destino:{value:'Spain'},mensaje:{value:'Test'},reportValidity:()=>true,querySelectorAll:()=>[el('field')],addEventListener:(type,fn)=>callback=fn};
   const done=el('done');const receipt=kind==='zoe'?html.slice(html.indexOf('function leadReceiptText('),html.indexOf('function applyLang(')):'';
   const alerts=[];
   const pendingText=kind==='zoe'?html.slice(html.indexOf('function leadPendingText('),html.indexOf('function leadReceiptText(')):'';
   const ctx={I18N:{es:{f_err_p:'error'},en:{f_err_p:'error'}},form,lf:form,doneEl:done,current:'historia',ACCIONES:{historia:{titulo:'Historia'}},EPISODIO:{invitado:'Synthetic'},lang,alert:value=>alerts.push(value),document:{getElementById:el,querySelector:()=>el('doneText')},submitLead:async()=>{throw Error('offline')}};
   vm.createContext(ctx);vm.runInContext(pendingText+receipt+snippet,ctx);await callback({preventDefault(){}});assert.notEqual(form.style.display,'none');assert.notEqual(el('field').style.display,'none');assert.equal(el(kind==='zoe'?'leadBtn':'submitBtn').disabled,false);assert.equal(form.nombre.value,'Synthetic');
   ctx.submitLead=async()=>{const error=new Error('pending');error.result={ok:false,stored:true,notificationSent:false};throw error};await callback({preventDefault(){}});
   const message=kind==='zoe'?el('doneText').textContent:kind==='pop'?el('formError').textContent:alerts.at(-1);assert.match(message,lang==='en'?/pending/:/pendiente/);assert(!message.includes('hoy'));assert.equal(done.textContent,'');assert.notEqual(form.style.display,'none');assert.notEqual(el('field').style.display,'none');assert.equal(form.nombre.value,'Synthetic');
   ctx.submitLead=async()=>({ok:true,stored:false,notificationSent:true});await callback({preventDefault(){}});
   assert.match(kind==='zoe'?el('doneText').textContent:el('doneMsg').textContent,lang==='en'?/accepted/:/aceptado/);
  });
 }
}


test('Zoe language switch retains actual pending status', () => {
 const html=read('public/index.html');
 const source=html.slice(html.indexOf('function leadPendingText('),html.indexOf("document.getElementById('langBtn').addEventListener"));
 const text={textContent:''};
 const ctx={currentLeadAcceptance:null,currentLeadFailure:{stored:true},I18N:{en:{},es:{}},localStorage:{setItem(){}},document:{querySelectorAll:()=>[],querySelector:()=>text,getElementById:()=>({}),documentElement:{}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);ctx.applyLang('en');assert.match(text.textContent,/pending/);ctx.applyLang('es');assert.match(text.textContent,/pendiente/);
});
