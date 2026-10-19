window.confirmSmoke316={done:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),snap=()=>JSON.stringify(StudioHost.get().p),check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);},tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,45))),guard=()=>{if($('dialog[open]'))throw Error('Unexpected dialog; not answered');};
 const click=async s=>{guard();const e=$(s);if(!e||e.disabled)throw Error('Missing '+s);e.click();await tick();guard();};
 const original=Drawing.plan;let plot;Drawing.plan=function(...args){return plot=original.apply(this,args);};
 const setModel=p=>StudioHost.transact(()=>{const target=StudioHost.get().p;Object.keys(target).forEach(k=>delete target[k]);Object.assign(target,clone(p));},null,false,true);
 try{
 check('Current model copy loaded',setModel(window.replan331Fixture));const before=snap();
 for(const key of ['F01','F03','F04']){
  const f=StudioHost.get().result.floors.find(f=>f.type===key);StudioHost.viewFloor(f.n);StudioHost.navigate('columns');await tick();
  check(key+' Structural Zone control visible in Legend',!!$('#show-structural-zone342')&&$('#structural-zone-control342').getBoundingClientRect().width>0);
  if(!$('#show-structural-zone342').checked)await click('#show-structural-zone342');
  const expected=LocalHeights96.zones(StudioHost.get().p,f.n);check(key+' values/regions equal floor-page calculation',JSON.stringify(plot.structureZones)===JSON.stringify(expected));check(key+' structural mm labels visible',plot.structureZoneLabels.length>0&&plot.structureZoneLabels.every(q=>expected.some(z=>q.label.endsWith(z.sh+' mm'))));
  await click('#show-structural-zone342');check(key+' off hides all zone labels',plot.structureZones.length===0&&plot.structureZoneLabels.length===0);check(key+' toggle does not change project',snap()===before);
  StudioHost.navigate('floors');await tick();check(key+' floor-page toggle shares the off setting',!$('#lh119-zones').checked);await click('#lh119-zones');check(key+' floor-page toggle updates Legend',!!$('#show-structural-zone342').checked);StudioHost.navigate('columns');await tick();check(key+' shared on state survives navigation',plot.structureZones.length===expected.length);
  if(key==='F01'){await window.replan331Checkpoint('GF-structural-zone');}
 }
 for(const tab of ['columnMove','beamLayout']){StudioHost.navigate(tab);await tick();check(tab+' plan shows structural zones',plot.structureZoneLabels.length>0&&$('#show-structural-zone342').checked);}
 await click('#three');check('3D disables plan-only Structural Zone control',$('#show-structural-zone342').disabled);await click('#plan');check('Returning to plan restores control and labels',!$('#show-structural-zone342').disabled&&plot.structureZoneLabels.length>0);
 StudioHost.navigate('loading');await tick();check('Loading keeps unrelated overlays hidden',$('#structural-zone-control342').style.display==='none'&&plot.structureZones.length===0);StudioHost.navigate('columns');await tick();
 check('All original-model view operations leave complete project unchanged',snap()===before);
 const p=clone(StudioHost.get().p),f=Engine.floors(p).find(f=>f.type==='F03'),cell=LocalHeights96.grid(p,f.type).find(g=>g.rect.x1-g.rect.x0>10&&Engine.tiles(p,p.types[f.type]).some(t=>t.state===1&&LocalHeights96.overlap(t,g.rect)>0));
 p.localHeights96=[{id:'LH342',name:'Local test',base:f.n-1,top:f.n,type:f.type,height:f.h,headroom:f.h-.7,em:.2,cells:[cell.cell],clearance119:true}];check('Local structural-zone fixture accepted',setModel(p));StudioHost.viewFloor(f.n);StudioHost.navigate('columns');await tick();const local=plot.structureZones.find(z=>z.local==='LH342');check('Local zone has its separately calculated 500mm height',Math.abs(local.sh-500)<1e-6);check('Local 500mm badge is visible',plot.structureZoneLabels.some(z=>z.label==='LH342 · 500 mm'));check('Local overlay does not edit project',snap()===JSON.stringify(p));await window.replan331Checkpoint('local-structural-zone');
 StudioHost.navigate('floors');await tick();check('02 local structural height matches Legend',Number($('[data-lh-sh="LH342"]').textContent)===local.sh);
 const opening=clone(p),tile=Engine.tiles(opening,opening.types[f.type]).find(t=>LocalHeights96.overlap(t,cell.rect)>0);const axesX=Engine.axes(opening,'x',f.type),axesY=Engine.axes(opening,'y',f.type),ix=axesX.findIndex(a=>Math.abs(a.v-tile.x0)<1e-7),iy=axesY.findIndex(a=>Math.abs(a.v-tile.y0)<1e-7);opening.types[f.type].opening[ix+','+iy]=true;check('Opening fixture accepted',setModel(opening));StudioHost.navigate('columns');await tick();check('Opening carries no structural-zone badge',!plot.structureZones.some(z=>LocalHeights96.overlap(z.rect,cell.rect)>0));
 check('Original test project restored',setModel(window.replan331Fixture));check('Original project contents exactly restored',snap()===before);o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{Drawing.plan=original;o.done=true;}
})();

