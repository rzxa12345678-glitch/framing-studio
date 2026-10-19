// Supplemental current-model check after the user removed lower columns.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[],metrics:{cases:[]}};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);},tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30)));
 let report;const original=ColumnSchemes319.search;ColumnSchemes319.search=function(...a){return report=original.apply(this,a);};
 try{
  check('Latest fixture accepted in isolated profile',StudioHost.transact(()=>{const p=StudioHost.get().p;Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,clone(window.replan331Fixture));},e=>{throw e;},false,true));await tick();
  const before=stable(StudioHost.get().p);
  for(const key of ['F01','F03']){StudioHost.viewFloor(StudioHost.get().result.floors.find(f=>f.type===key).n);StudioHost.navigate('columns');await tick();$('#column-schemes319').open=true;report=null;$('[data-scheme319-generate]').click();const until=Date.now()+90000;while(!report||$('[data-scheme319-generate]').disabled){if(Date.now()>until)throw Error('Timeout');await tick();}
   check(key+' no unexpected confirmation',!$('dialog[open]'));check(key+' latest model unchanged by preview',stable(StudioHost.get().p)===before);
   if(key==='F01'){check('G/F deletion count retained and shown',report.deletion331.resettableCount===38&&$('[data-scheme331-deletion-count]').textContent.includes('38'));check('G/F does not invent lower-floor routes',report.schemes.every(s=>s.routes334.length===0));check('All deleted G/F positions stay excluded',report.schemes.every(s=>window.replan331Fixture.types.F01.columnSchemeDeleted319.every(q=>!s.columns.some(c=>Engine.overlap({x:c.x,y:c.y,w:c.b,d:c.d},q)))));}
   else{const routes=report.schemes.flatMap(s=>s.routes334);check('F03 still has finite wall-to-wall candidates',routes.length>0&&routes.every(q=>q.a.kind==='wall'&&q.z.kind==='wall'));check('F03 does not invent deleted column endpoints or Y routes',routes.every(q=>q.axis==='X'&&q.span===42));check('F03 wall-only support keeps explicit X direction label',report.schemes.every(s=>s.axis335==='X'&&s.label.includes('X 向 TB')));}
   o.metrics.cases.push({key,deleted:report.deletion331.resettableCount,candidates:report.schemes.map(s=>({columns:s.columns.length,axis:s.axis335,routes:s.routes334.map(q=>({axis:q.axis,span:q.span,kinds:[q.a.kind,q.z.kind]}))}))});
  }
  o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{ColumnSchemes319.search=original;o.done=true;}
})();
