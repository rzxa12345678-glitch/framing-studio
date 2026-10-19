// E2.333 direct apply and undo. Isolated browser/WebView2 profiles only. The runner supplies a private copy.
// ok=false deliberately bypasses the legacy host's automatic dialog sweep.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[],metrics:{cases:[]}};
(async()=>{
 const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6;
 const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),snapshot=()=>stable(StudioHost.get().p);
 const check=(name,value)=>{if(!value)throw Error(name);o.passed.push(name);};
 const dialog=()=>{const d=$('#studio-confirm316');return d?.open&&getComputedStyle(d).display!=='none'?d:null;};
 const guard=()=>{if(dialog())throw Error('Unexpected confirmation: the test will not answer it');};
 const tick=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(resolve,30))));
 const wait=async(fn,expectedDialog=false)=>{const end=Date.now()+90000;while(!fn()){if(!expectedDialog)guard();if(Date.now()>end)throw Error('Replan UI timeout');await new Promise(r=>setTimeout(r,25));}await tick();if(!expectedDialog)guard();};
 const click=async(selector,expectedDialog=false)=>{guard();const e=$(selector);if(!e||e.disabled)throw Error('Missing/enabled control: '+selector);e.click();await tick();if(!expectedDialog)guard();};
 const checkpoint=async tag=>{if(typeof window.replan331Checkpoint==='function')await window.replan331Checkpoint(tag);};
 let key='',lastReport=null;
 const searchOriginal=ColumnSchemes319.search;
 ColumnSchemes319.search=function(...args){const report=searchOriginal.apply(this,args);lastReport=report;return report;};
 const actual=()=>{const h=StudioHost.get();return Engine.floorModel(h.result,h.floor,h.key);};
 const sections=m=>m.columns.filter(c=>c.status!=='上层柱').map(c=>{const r=Engine.columnRect(c);return {id:c.id,x:r.x,y:r.y,b:r.w,d:r.d};});
 const geometry=rows=>rows.map(c=>[c.x,c.y,c.b,c.d].map(v=>Number(v.toFixed(6))).join(',')).sort().join(';');
 const deletionRecords=t=>clone({columnSchemeDeleted319:t.columnSchemeDeleted319||[],suppressedColumns:t.suppressedColumns||[],disabled:t.columns.filter(c=>!c.on)});
 const otherInput=()=>{const p=clone(StudioHost.get().p);delete p.types[key];return stable(p);};
 const nav=async()=>{const h=StudioHost.get(),floor=h.result.floors.find(f=>f.type===key);if(!floor)throw Error('Fixture has no floor using '+key);StudioHost.viewFloor(floor.n);StudioHost.navigate('columns');await tick();if(getComputedStyle($('#side')).display==='none')await click('#mobile-inputs');guard();};
 const replace=async input=>{let error;const ok=StudioHost.transact(()=>{const p=StudioHost.get().p;for(const k of Object.keys(p))delete p[k];Object.assign(p,clone(input));},e=>error=e,false,true);if(!ok)throw error||Error('Fixture transaction rejected');await nav();};
 const generate=async reset=>{$('#column-schemes319').open=true;lastReport=null;await click(reset?'[data-scheme331-replan]':'[data-scheme319-generate]');await wait(()=>lastReport&&!$('[data-scheme319-generate]')?.disabled);return lastReport;};
 const checkDiagnostics=(report,scheme)=>{
  const h=StudioHost.get(),card=$('[data-scheme319-preview="'+scheme.id+'"]')?.closest('section');
  check(key+': candidate card identifies the actual affected floor labels',!!card&&report.affectedFloors.every(f=>$('#column-schemes319').textContent.includes(FloorLevels.name(h.p,f))));
  const alignment=card.querySelector('[data-scheme331-alignment]')?.textContent.split('；')||[];
  check(key+': absent neighboring columns show N/A rather than a successful zero-alignment count',alignment.length===2&&(!report.alignment331.aboveCount?alignment[0].includes('上層對齊：N/A'):!alignment[0].includes('N/A'))&&(!report.alignment331.belowCount?alignment[1].includes('下層對齊：N/A'):!alignment[1].includes('N/A')));
  const floorRows=[...$('#column-schemes319').querySelectorAll('[data-scheme331-floor]')];
  check(key+': per-floor comparison labels match actual project floor names',floorRows.length===report.affectedFloors.length&&report.affectedFloors.every(f=>floorRows.some(e=>+e.dataset.scheme331Floor===f&&e.textContent.startsWith(FloorLevels.name(h.p,f)+'：'))));
  check(key+': per-floor support rows cover each proposed column exactly once',scheme.support330.length===scheme.columns.length*report.affectedFloors.length&&report.affectedFloors.every(f=>scheme.support330.filter(r=>r.at===f).length===scheme.columns.length));
  check(key+': preview keeps the warning that unbuilt transfer support is not complete',card.textContent.includes('未建立支承不會當作已完成 Transfer'));
  return card;
 };
 try{
  if(!window.replan331Fixture?.types)throw Error('Runner must supply replan331Fixture');const supplied=stable(window.replan331Fixture),keys=window.replan331Keys||['F01','F03'];
  for(key of keys){
   await replace(window.replan331Fixture);const original=snapshot(),originalRecords=deletionRecords(StudioHost.get().p.types[key]);
   let report=await generate(false);
   check(key+': normal Generate leaves current model and deletion records unchanged',snapshot()===original&&stable(deletionRecords(StudioHost.get().p.types[key]))===stable(originalRecords));
   const rawResetCount=originalRecords.columnSchemeDeleted319.length+originalRecords.suppressedColumns.length;
   check(key+': default report accurately counts current resettable deletion records',report.deletion331?.resettableCount===rawResetCount&&report.deletion331.disabledCount===originalRecords.disabled.length&&!report.resetDeleted331);
   check(key+': deleted-record count is visible beside the default workflow',!!$('[data-scheme331-deletion-count]')&&$('[data-scheme331-deletion-count]').textContent.includes(String(rawResetCount)));
   check(key+': reset control is enabled only when resettable deletion records exist',$('[data-scheme331-replan]').disabled===(rawResetCount===0));
   const actualDefaultCount=rawResetCount;let seeded=false;
   if(rawResetCount===0){
    // The current F03 has no deletion records. A local copy with a few deleted
    // proposal locations exercises the same reset flow without editing source.
    const candidate=report.schemes.find(s=>s.family==='balanced330')||report.schemes.find(s=>s.columns.length>=5);
    check(key+': no-deletion Framing still offers usable normal proposals',candidate?.columns.length>=5);
    const p=clone(StudioHost.get().p),t=p.types[key],points=candidate.columns.slice(0,4);
    t.columnSchemeDeleted319=points.slice(0,3).map(c=>({x:c.x,y:c.y,w:c.b,d:c.d}));
    const c=points[3];t.columns.push({id:'QA331_DISABLED',x:c.x,y:c.y,b:c.b*1000,d:c.d*1000,on:false,status:'上下贯通'});
    await replace(p);seeded=true;report=await generate(false);
    check(key+': disabled manual record is distinguished from resettable deletions',report.deletion331.resettableCount===3&&report.deletion331.disabledCount===originalRecords.disabled.length+1);
   }
   const initial=snapshot(),records=deletionRecords(StudioHost.get().p.types[key]),protectedInput=otherInput(),beforeGeometry=geometry(sections(actual()));
   report=await generate(true);check(key+': reset/replan only previews and does not clear live records',report.resetDeleted331===true&&!!$('[data-scheme331-reset-preview]')&&snapshot()===initial&&stable(deletionRecords(StudioHost.get().p.types[key]))===stable(records));
   const defaultAgain=await generate(false);check(key+': normal Generate after reset preview returns to deletion-preserving default mode',defaultAgain.resetDeleted331===false&&!$('[data-scheme331-reset-preview]')&&defaultAgain.deletion331.resettableCount===report.deletion331.resettableCount&&snapshot()===initial&&stable(deletionRecords(StudioHost.get().p.types[key]))===stable(records));
   report=await generate(true);
   check(key+': displayed candidate order follows coverage/coherence ranking',report.schemes.every((s,i)=>!i||s.quality331>=report.schemes[i-1].quality331-1e-7)&&[...$('#column-schemes319').querySelectorAll('[data-scheme319-preview]')].every((e,i)=>+e.dataset.scheme319Preview===report.schemes[i].id));
   let scheme=report.schemes.find(s=>s.family==='balanced330'&&!s.unchanged)||report.schemes.find(s=>!s.unchanged);
   check(key+': reset preview provides an applicable scheme',!!scheme);let card=checkDiagnostics(report,scheme);
   await click('[data-scheme319-preview="'+scheme.id+'"]');card=$('[data-scheme319-preview="'+scheme.id+'"]').closest('section');card.scrollIntoView({block:'start'});await tick();
   check(key+': selecting a reset proposal keeps every source field unchanged',snapshot()===initial);await checkpoint(key+'-reset-preview');
   check(key+': reset effect is shown next to each Apply button',!!card.querySelector('[data-scheme333-apply-note]')&&card.querySelector('[data-scheme333-apply-note]').textContent.includes(String(report.deletion331.resettableCount)));
   await click('[data-scheme319-clear]');
   check(key+': closing preview preserves all model fields and deleted positions',snapshot()===initial&&geometry(sections(actual()))===beforeGeometry);
   report=await generate(true);scheme=report.schemes.find(s=>s.family==='balanced330'&&!s.unchanged)||report.schemes.find(s=>!s.unchanged);
   await click('[data-scheme319-apply="'+scheme.id+'"]');await wait(()=>!$('[data-scheme319-generate]')?.disabled);
   check(key+': one Apply completes without an extra dialog',!dialog()&&!!$('[data-scheme333-undo]'));
   check(key+': success identifies the applied scheme and column count',$('#column-schemes319 [role="status"]').textContent.includes('方案 '+scheme.id)&&$('#column-schemes319 [role="status"]').textContent.includes(scheme.columns.length+' 支柱'));
   const applied=snapshot(),appliedGeometry=geometry(sections(actual())),appliedRecords=deletionRecords(StudioHost.get().p.types[key]);
   check(key+': direct reset clears only resettable records in the selected Framing',appliedRecords.columnSchemeDeleted319.length===0&&appliedRecords.suppressedColumns.length===0&&otherInput()===protectedInput);
   check(key+': direct reset preserves disabled manual records',stable(appliedRecords.disabled)===stable(records.disabled));
   check(key+': direct Apply exactly matches the displayed physical columns',appliedGeometry===geometry(scheme.columns));
   await checkpoint(key+'-direct-applied');
   const oldName=StudioHost.get().p.name;
   StudioHost.transact(()=>{StudioHost.get().p.name=oldName+' QA unrelated edit';});await tick();
   check(key+': later model edit hides scheme-specific Undo instead of undoing unrelated work',!$('[data-scheme333-undo]'));
   await click('#undo');
   check(key+': undoing later edit returns to the applied scheme',snapshot()===applied&&!!$('[data-scheme333-undo]'));
   await click('[data-scheme333-undo]');
   check(key+': one Undo restores geometry and all deletion records exactly',snapshot()===initial&&geometry(sections(actual()))===beforeGeometry&&stable(deletionRecords(StudioHost.get().p.types[key]))===stable(records));
   check(key+': Undo invalidates the applied status message',!/已套用/.test(document.querySelector('#column-schemes319 [role="status"]')?.textContent||'')&&!$('[data-scheme333-undo]'));
   await replace(JSON.parse(applied));
   check(key+': applied model reopens with exact geometry and cleared deletion records',snapshot()===applied&&geometry(sections(actual()))===appliedGeometry&&stable(deletionRecords(StudioHost.get().p.types[key]))===stable(appliedRecords));
   check(key+': reopened model preserves other Framing and input settings',otherInput()===protectedInput);
   await click('#undo');check(key+': reopen test Undo restores the pre-reset snapshot',snapshot()===initial);
   o.metrics.cases.push({key,floor:StudioHost.get().floor,floorLabel:FloorLevels.name(StudioHost.get().p,StudioHost.get().floor),originalDefaultDeletionCount:actualDefaultCount,isolatedDeletionSeeded:seeded,resettableCount:report.deletion331.resettableCount,disabledManualPreserved:records.disabled.length,schemes:report.schemes.map(s=>({id:s.id,family:s.family,columns:s.columns.length})),appliedColumns:scheme.columns.length,undoExact:true,reopenExact:true});
  }
  key=keys[0];await replace(window.replan331Fixture);const finalModel=snapshot();const finalReport=await generate(ColumnSchemes319.deletionInfo331(StudioHost.get().p,key).resettableCount>0),finalScheme=finalReport.schemes.find(s=>s.family==='balanced330')||finalReport.schemes[0];await click('[data-scheme319-preview="'+finalScheme.id+'"]');const finalCard=$('[data-scheme319-preview="'+finalScheme.id+'"]').closest('section');finalCard.scrollIntoView({block:'start'});await tick();
  check('Final isolated preview restores the supplied current model exactly',snapshot()===finalModel&&snapshot()===supplied);
  check('Injected private fixture was never mutated',stable(window.replan331Fixture)===supplied);
  o.metrics.originalModelRestored=true;o.metrics.screenshotScope='isolated preview only; original user tab untouched';o.uiOK=true;
 }catch(error){o.error=error.stack||String(error);}
 finally{ColumnSchemes319.search=searchOriginal;o.done=true;}
})();
