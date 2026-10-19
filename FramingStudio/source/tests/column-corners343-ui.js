window.confirmSmoke316={done:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),snap=()=>JSON.stringify(StudioHost.get().p),check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);},tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30))),guard=()=>{if($('dialog[open]'))throw Error('Unexpected confirmation; not answered');};
 const click=async s=>{guard();const e=$(s);if(!e||e.disabled)throw Error('Missing '+s);e.click();await tick();guard();},wait=async fn=>{const until=Date.now()+60000;while(!fn()){guard();if(Date.now()>until)throw Error('Timeout');await tick();}};
 const original=ColumnSchemes319.search;let report;ColumnSchemes319.search=function(...args){return report=original.apply(this,args);};
 try{
 check('Private current model accepted in isolated profile',StudioHost.transact(()=>{const p=StudioHost.get().p;Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,clone(window.replan331Fixture));},null,false,true));
 for(const key of ['F01','F03','F04','F08']){
  StudioHost.viewFloor(StudioHost.get().result.floors.find(f=>f.type===key).n);StudioHost.navigate('columns');await tick();const before=snap();$('#column-schemes319').open=true;report=null;await click('[data-scheme319-generate]');await wait(()=>report&&!$('[data-scheme319-generate]').disabled);
  check(key+' preview preserves exact project',snap()===before);check(key+' has candidates',report.schemes.length>0);
  const cards=[...document.querySelectorAll('[data-scheme340-card]')];check(key+' details start closed',cards.every(q=>!q.querySelector('[data-scheme340-details]').open));check(key+' preview/apply above details',cards.every(q=>!!(q.querySelector('[data-scheme319-apply]').compareDocumentPosition(q.querySelector('details'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  check(key+' compact summary reports both support directions',cards.every(q=>{const text=q.querySelector('[data-scheme340-summary]').textContent;return text.length<110&&text.includes('下層待核對')&&text.includes('上層未接續');}));
  if(key==='F01'){
   check('G/F has three distinct common-axis alternatives, not forced four',report.schemes.length===3&&report.schemes.map(s=>s.columns.length).join(',')==='16,38,22');
   check('Every G/F card exposes four unresolved upper positions',cards.every(q=>q.querySelector('[data-scheme340-summary]').textContent.includes('上層未接續 4')));
   const schemes=[...report.schemes];
   for(const s of schemes){
    report=null;await click('[data-scheme319-generate]');await wait(()=>report&&!$('[data-scheme319-generate]').disabled);
    await click('[data-scheme319-preview="'+s.id+'"]');check('G/F scheme '+s.id+' preview leaves project intact',snap()===before);
    const details=$('[data-scheme340-card="'+s.id+'"] [data-scheme340-details]');details.open=true;await tick();check('G/F scheme '+s.id+' explains minimum-spacing conflict',details.querySelector('[data-upper343]').textContent.includes('中心距')&&details.querySelector('[data-upper343]').textContent.includes('7 m'));details.open=false;
    if(s.id===2){$('[data-scheme340-card="1"]').scrollIntoView({block:'start'});await tick();await window.replan331Checkpoint('GF-common-rows');}
    await click('[data-scheme319-apply="'+s.id+'"]');await wait(()=>!$('[data-scheme319-generate]').disabled);check('G/F scheme '+s.id+' applies without confirmation',!!$('[data-scheme333-undo]'));
    const cols=Engine.model(StudioHost.get().p,key).columns.filter(c=>c.status!=='上层柱').map(c=>Engine.columnRect(c));check('G/F scheme '+s.id+' applied centres equal preview',cols.length===s.columns.length&&s.columns.every(a=>cols.some(b=>Math.hypot(a.x-b.x,a.y-b.y)<1e-6)));check('G/F scheme '+s.id+' keeps four physical corners',[[.5,.5],[.5,33.5],[51.5,.5],[51.5,33.5]].every(([x,y])=>cols.some(c=>Math.hypot(c.x-x,c.y-y)<1e-6)));
    const model=StudioHost.get().p,reopened=JSON.parse(JSON.stringify(model)),again=Engine.model(reopened,key).columns.filter(c=>c.status!=='上层柱').map(c=>Engine.columnRect(c));check('G/F scheme '+s.id+' JSON reopen retains exact centres',JSON.stringify(cols)===JSON.stringify(again));check('Applied G/F still reports upper discontinuities',$('[data-upper343]')?.textContent.includes('上層未接續 4'));
    await click('[data-scheme333-undo]');check('G/F scheme '+s.id+' undo restores exact model',snap()===before);
   }
  }else{check(key+' current protected arrangement is retained',report.schemes.some(s=>s.unchanged));await click('[data-scheme319-preview="'+report.schemes[0].id+'"]');check(key+' reference-only preview preserves project',snap()===before);}
 }
 o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{ColumnSchemes319.search=original;o.done=true;}
})();
