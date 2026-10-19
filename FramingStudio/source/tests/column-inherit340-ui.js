window.confirmSmoke316={done:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),snap=()=>JSON.stringify(StudioHost.get().p),check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);},tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30))),guard=()=>{if($('dialog[open]'))throw Error('Unexpected confirmation; not answered');};
 const click=async s=>{guard();const e=$(s);if(!e||e.disabled)throw Error('Missing '+s);e.click();await tick();guard();},wait=async fn=>{const until=Date.now()+60000;while(!fn()){guard();if(Date.now()>until)throw Error('Timeout');await tick();}};
 const original=ColumnSchemes319.search;let report;ColumnSchemes319.search=function(...args){return report=original.apply(this,args);};
 try{
 check('Private current model accepted',StudioHost.transact(()=>{const p=StudioHost.get().p;Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,clone(window.replan331Fixture));},null,false,true));
 for(const key of ['F04','F01','F03']){
  StudioHost.viewFloor(StudioHost.get().result.floors.find(f=>f.type===key).n);StudioHost.navigate('columns');await tick();const before=snap();$('#column-schemes319').open=true;report=null;await click('[data-scheme319-generate]');await wait(()=>report&&!$('[data-scheme319-generate]').disabled);
  check(key+' preview preserves exact project',snap()===before);check(key+' has candidates',report.schemes.length>0);
  const cards=[...document.querySelectorAll('[data-scheme340-card]')];check(key+' all technical details initially closed',cards.every(q=>!q.querySelector('[data-scheme340-details]').open));
  check(key+' preview/apply above details',cards.every(q=>{const details=q.querySelector('details'),apply=q.querySelector('[data-scheme319-apply]');return !!(apply.compareDocumentPosition(details)&Node.DOCUMENT_POSITION_FOLLOWING);}));
  check(key+' compact main summary',cards.every(q=>q.querySelector('[data-scheme340-summary]').textContent.length<110));
  if(key==='F04'){check('F04 first scheme retains 28 upper positions',report.schemes[0].family==='adjacent340'&&report.schemes[0].columns.length===28&&report.schemes[0].metrics.unalignedAbove===0);check('Unresolved support remains visible outside details',cards[0].querySelector('[data-scheme340-summary]').textContent.includes('承托待核對 28'));$('#column-schemes319').scrollIntoView({block:'start'});await tick();await window.replan331Checkpoint('F04-compact-aligned');
   const detail=cards[0].querySelector('[data-scheme340-details]');detail.open=true;await tick();check('Expanded details retain support information',detail.textContent.includes('逐層承托提示'));detail.open=false;
  }
  const s=report.schemes.find(q=>!q.unchanged);await click('[data-scheme319-apply="'+s.id+'"]');await wait(()=>!$('[data-scheme319-generate]').disabled);check(key+' applies without confirmation',!!$('[data-scheme333-undo]'));check(key+' applied column count matches preview',Engine.model(StudioHost.get().p,key).columns.filter(c=>c.status!=='上层柱').length===s.columns.length);await click('[data-scheme333-undo]');check(key+' undo restores exact model',snap()===before);
 }
 o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{ColumnSchemes319.search=original;o.done=true;}
})();
