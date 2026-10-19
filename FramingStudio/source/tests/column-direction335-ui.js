// Isolated browser and actual WebView2 EXE UI tests. Never answer dialogs.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[],metrics:{cases:[]}};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),snap=()=>stable(StudioHost.get().p);
 const check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);};
 const tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30)));
 const guard=()=>{if($('#studio-confirm316')?.open)throw Error('Unexpected dialog; no automatic response');};
 const click=async s=>{guard();const e=$(s);if(!e||e.disabled)throw Error('Missing control '+s);e.click();await tick();guard();};
 const wait=async fn=>{const until=Date.now()+90000;while(!fn()){guard();if(Date.now()>until)throw Error('Timeout');await tick();}};
 const checkpoint=async tag=>{if(window.replan331Checkpoint)await window.replan331Checkpoint(tag);};
 const originalSearch=ColumnSchemes319.search;let report;
 ColumnSchemes319.search=function(...a){return report=originalSearch.apply(this,a);};
 const nav=async key=>{const h=StudioHost.get();StudioHost.viewFloor(h.result.floors.find(f=>f.type===key).n);StudioHost.navigate('columns');await tick();$('#column-schemes319').open=true;};
 const load=async p=>{let error;check('Fixture transaction accepted',StudioHost.transact(()=>{const h=StudioHost.get().p;Object.keys(h).forEach(k=>delete h[k]);Object.assign(h,clone(p));},e=>error=e,false,true));if(error)throw error;await tick();};
 const generate=async()=>{report=null;await click('[data-scheme319-generate]');await wait(()=>report&&!$('[data-scheme319-generate]').disabled);};
 try{
  const input=window.replan331Fixture,before=stable(input);await load(input);
  for(const key of ['F01','F03']){
   await nav(key);const saved=snap();await generate();check(key+' preview does not change the model',snap()===saved);check(key+' offers candidates',report.schemes.length>0);
   const scheme=report.schemes.find(q=>q.family==='balanced330')||report.schemes[0];await click('[data-scheme319-preview="'+scheme.id+'"]');
   const card=$('[data-scheme319-preview="'+scheme.id+'"]').closest('section'),panel=card.querySelector('[data-tb334-routes]');check(key+' route diagnostics visible',!!panel);check(key+' line count matches preview',panel.textContent.includes(scheme.routes334.length+' 條'));
   for(const route of scheme.routes334){const text=panel.querySelector('[data-tb334-route="'+route.id+'"]')?.textContent||'';check(key+' '+route.id+' shows physical support IDs, floor and span',text.includes(route.a.id)&&text.includes(route.z.id)&&text.includes(String(Number(route.span.toFixed(2))))&&text.includes(FloorLevels.name(StudioHost.get().p,route.below)));}
   check(key+' route explicitly remains an unbuilt/unverified proposal',panel.textContent.includes('套用柱位不會建立 TB')&&panel.textContent.includes('未驗算'));
   if(key==='F01')check('G/F has no invented lower-floor TB routes',scheme.routes334.length===0);
   else{const dirs=report.schemes.filter(q=>q.axis335);check('F03 compares separate X and Y layouts',dirs.length===2&&new Set(dirs.map(q=>q.axis335)).size===2);check('F03 shorter Y 33m precedes X 42m',dirs[0].axis335==='Y'&&dirs[0].maxTB335===33&&dirs[1].maxTB335===42);check('Direction, maximum span and regular-row explanation visible',!!card.querySelector('[data-direction335]')&&card.textContent.includes('33 m')&&card.textContent.includes('共用排位'));for(const s of dirs){check('F03 '+s.axis335+' new transfer routes never mix the other direction',s.routes334.every(q=>q.axis===s.axis335));check('F03 '+s.axis335+' new transfer points share common row positions',s.support330.filter(q=>q.kind==='transfer'&&!s.columns.find(c=>Math.hypot(c.x-q.x,c.y-q.y)<1e-6)?.locked).every(q=>s.stations335.some(v=>Math.abs(v-(s.axis335==='X'?q.x:q.y))<1e-6)));}check('F03 has proposed TB routes',scheme.routes334.length>0);check('F03 new transfer points reference preview routes',scheme.support330.filter(q=>q.kind==='transfer'&&!scheme.columns.find(c=>Math.hypot(q.x-c.x,q.y-c.y)<1e-6)?.locked).every(q=>scheme.routes334.some(r=>r.id===q.tb334)));}
   card.scrollIntoView({block:'start'});await tick();await checkpoint(key+'-routes');
   if(!scheme.unchanged){const beams=stable(StudioHost.get().p.types[key].beams),other=clone(StudioHost.get().p);delete other.types[key];await click('[data-scheme319-apply="'+scheme.id+'"]');await wait(()=>!$('[data-scheme319-generate]').disabled);
    const applied=snap();check(key+' applies once without confirmation',!!$('[data-scheme333-undo]')&&!$('#studio-confirm316')?.open);check(key+' route preview did not create beams',stable(StudioHost.get().p.types[key].beams)===beams);const after=clone(StudioHost.get().p);delete after.types[key];check(key+' other Framing and report settings preserved',stable(after)===stable(other));
    check(key+' applied route diagnostics remain available',!!$('[data-tb334-routes]'));
    await click('[data-scheme333-undo]');check(key+' undo restores whole model',snap()===saved);
    await load(JSON.parse(applied));await nav(key);const reopened=snap();await generate();check(key+' saved model reopens and preview does not mutate it',snap()===reopened&&reopened===applied);await click('#undo');check(key+' reopen undo restores previous model',snap()===saved);
   }
   o.metrics.cases.push({key,columns:scheme.columns.length,axis:scheme.axis335,maximumSpan:scheme.maxTB335,rows:scheme.stations335,routes:scheme.routes334.map(q=>({id:q.id,axis:q.axis,ends:[q.a.id,q.z.id],span:q.span})),unchanged:!!scheme.unchanged});
  }
  await load(input);await nav('F03');await generate();const alt=report.schemes.find(q=>q.axis335==='X');await click('[data-scheme319-apply="'+alt.id+'"]');await wait(()=>!$('[data-scheme319-generate]').disabled);check('Alternative X layout also keeps applied support diagnostics',StudioHost.get().p.types.F03.columnSchemeReview330&&!!$('[data-tb334-routes]'));await click('[data-scheme333-undo]');check('Alternative layout undo restores original model',snap()===before);await generate();const s=report.schemes.find(q=>q.family==='balanced330')||report.schemes[0];await click('[data-scheme319-preview="'+s.id+'"]');$('[data-scheme319-preview="'+s.id+'"]').closest('section').scrollIntoView({block:'start'});await tick();check('Final model and supplied fixture unchanged',snap()===before&&stable(input)===before);await checkpoint('final');o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{ColumnSchemes319.search=originalSearch;o.done=true;}
})();
