// Packaged EXE isolated profile only. qaCurrent319 and qaFresh319 are local fixtures.
window.confirmSmoke316={done:false,ok:false,passed:[]};
(async()=>{
 const out=window.confirmSmoke316,$=s=>document.querySelector(s),check=(s,v)=>{if(!v)throw Error(s);out.passed.push(s);},wait=async fn=>{const end=Date.now()+60000;while(!fn()){if(Date.now()>end)throw Error('UI timeout');await new Promise(r=>setTimeout(r,30));}},tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),click=async s=>{$(s).click();await tick();},model=()=>JSON.stringify(StudioHost.get().p);
 const importFixture=async p=>{const d=new DataTransfer();d.items.add(new File([JSON.stringify(p)],'scheme-qa.framing.json',{type:'application/json'}));$('#file').files=d.files;$('#file').dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>$('#studio-confirm316')||$('#project-name').textContent===p.name);if($('#studio-confirm316'))await click('[data-confirm316=ok]');await wait(()=>$('#project-name').textContent===p.name);await tick();};
 const generate=async()=>{await click('[data-scheme319-generate]');await wait(()=>!$('[data-scheme319-generate]').disabled);await tick();};
 const input=(k,value)=>{const e=$('[data-scheme319-input='+k+']');e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));};
 try{
  await importFixture({...qaCurrent319,name:'Current exam column preview QA'});StudioHost.viewFloor(3);await click('[data-tab=columns]');$('#column-schemes319').open=true;await tick();
  const before=model(),derived=JSON.stringify(StudioHost.get().result),started=performance.now();await generate();out.currentSearchMs=Math.round(performance.now()-started);
  check('Current exam preview keeps every project input and derived result',model()===before&&JSON.stringify(StudioHost.get().result)===derived);
  check('All 24 connected F03 columns are preserved', $('#column-schemes319').textContent.includes('固定 24 支柱'));
  check('Unchanged baseline shown without a misleading Apply action',$('[data-scheme319-apply]').disabled&&$('[data-scheme319-apply]').textContent==='現況，無須套用');
  await click('[data-scheme319-preview]');check('Preview changes no model input',model()===before);
  await click('[data-scheme319-clear]');check('Close preview removes candidates without modifying model',!$('[data-scheme319-preview]')&&model()===before);
  await importFixture({...qaFresh319,name:'Offline scheme apply QA'});await click('[data-tab=columns]');$('#column-schemes319').open=true;await tick();
  const initial=model();await generate();check('Fresh constrained layout provides proposals',!!$('[data-scheme319-preview]'));
  input('targetX','');check('Draft can be empty and invalidates old Apply buttons',$('[data-scheme319-input=targetX]').value===''&&[...document.querySelectorAll('[data-scheme319-apply]')].every(b=>b.disabled));await generate();check('Invalid target reports error and preserves model',$('#column-schemes319').textContent.includes('目標柱距須')&&model()===initial);
  input('targetX','6');await generate();const apply=[...document.querySelectorAll('[data-scheme319-apply]')].find(b=>!b.disabled);check('At least one complete applicable proposal exists',!!apply);apply.click();await tick();await wait(()=>!$('[data-scheme319-generate]').disabled);
  check('Apply completes and changes only after explicit action',$('#column-schemes319').textContent.includes('已套用 F1')&&model()!==initial);
  const applied=model(),current=StudioHost.get(),physical=JSON.stringify(Engine.model(current.p,current.key).columns.map(c=>({id:c.id,...Engine.columnRect(c)})));Engine.validate(JSON.parse(applied));
  check('Applied result survives model serialization',JSON.stringify(Engine.model(JSON.parse(applied),current.key).columns.map(c=>({id:c.id,...Engine.columnRect(c)})))===physical);
  await click('#undo');check('One UI undo restores the complete original model',model()===initial);
  await importFixture({...JSON.parse(applied),name:'Reopened column scheme QA'});check('Project reopen retains applied physical columns',JSON.stringify(Engine.model(StudioHost.get().p,'F1').columns.map(c=>({id:c.id,...Engine.columnRect(c)})))===physical);
  await click('[data-tab=columns]');$('#column-schemes319').open=true;await tick();const saved=model();await generate();const generated=$('[data-scheme319-preview]');check('Reopened model supports another offline search',!!generated&&model()===saved);
  const keep=$('[data-scheme319-keep]');keep.checked=true;keep.dispatchEvent(new Event('change',{bubbles:true}));await tick();check('Keep-all option invalidates previous candidates',!$('[data-scheme319-preview]'));
  out.ok=true;StudioDialogs316.notice(out.passed.length+' column-scheme UI checks passed','E2.319 offline verification');
 }catch(e){out.error=e.stack||String(e);}finally{out.done=true;}
})();
