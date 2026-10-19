// Offline, bounded column-layout proposals. No design equations or report code.
const ColumnSchemes319=(()=>{
 const eps=1e-7,clone=x=>Engine.clone(x),round=x=>+x.toFixed(6),same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<eps;
 const physical=c=>{const r=Engine.columnRect(c);return {x:r.x,y:r.y,b:r.w,d:r.d,id:c.id,existingKey:Engine.columnPositionKey(c),anchorX:c.anchorX,anchorY:c.anchorY};};
 const rect=c=>({x:c.x,y:c.y,w:c.b,d:c.d});
 const unique=arr=>[...new Set(arr.map(round))].sort((a,b)=>a-b);
 function defaults(p,key){const t=p.types[key],median=d=>{const axes=Engine.axes(p,d,key),a=axes.slice(1).map((x,i)=>x.v-axes[i].v).filter(x=>x>0).sort((a,b)=>a-b);return a[Math.floor(a.length/2)]||6;};return {targetX:t.columnSpacing258?.x||median('x'),targetY:t.columnSpacing258?.y||median('y'),maxX:'',maxY:'',keepAll:false,maxCandidates:1800};}
 function spacingProblem(a,b,min){return FloorColumns101.spacingProblem325(a,b,min);}
 function footprintProblem(p,key,m,c){const t=p.types[key],r=rect(c);
  // Point-selected regions can contain holes and disjoint pieces: corner/centre
  // containment cannot prove that the complete physical column is supported.
  if(m.floorPolygons315){if(Diagonal315.sum(Diagonal315.difference([Diagonal315.box(r)],m.floorPolygons315))>eps)return '柱截面越出實際樓面／斜邊或進入 Opening';}
  else if(!Engine.rectAllowed(m.ts,r.x,r.y,r.w,r.d,false))return '柱截面越出樓面或進入 Opening';if(Engine.columnZoneConflict314(t,r))return '柱截面侵入禁柱區';if(m.walls.some(w=>Engine.overlap(r,Engine.rect(w))))return '柱截面與牆重疊';return '';}
 function adjacent(p,result,key){const above=[],below=[],floors=result.floors.filter(f=>f.type===key);for(const f of floors)for(const [n,rows]of [[f.n+1,above],[f.n-1,below]])if(n>0&&n<=result.floors.length&&result.floors[n-1].type!==key)for(const c of Engine.floorModel(result,n).columns.filter(c=>c.status!=='上层柱'))rows.push({...physical(c),floor:n,at:f.n});return {above,below,floors:floors.map(f=>f.n),lowerFloors:floors.filter(f=>f.n>1&&result.floors[f.n-2].type!==key).map(f=>f.n)};}
 function protectedColumn(p,key,m,c,keepAll){if(keepAll||c.scheme319)return true;const t=p.types[key],pk=Engine.columnPositionKey(c),input=t.columns.find(x=>x.id===c.id),r=Engine.columnRect(c);if(c.anchorX===undefined&&!input?.scheme319||c.autoAdded&&!input?.scheme319||c.transferManual||Engine.columnPositionRecord(t,c)||t.columnPlacements?.some(x=>x.key===pk)&&!input?.scheme319||t.columnSizes?.some(x=>x.ax===c.anchorX&&x.ay===c.anchorY))return true;
  if(m.beams.some(b=>[b.rawA,b.rawZ,b.a,b.z].some(q=>q&&Math.abs(q[0]-r.x)<=r.w/2+eps&&Math.abs(q[1]-r.y)<=r.d/2+eps)))return true;
  if(typeof Loading!=='undefined'){const token=Loading.token('COL',c),floors=Engine.floors(p).filter(f=>f.type===key);if(floors.some(f=>p.foundation?.column===f.n+'|'+token))return true;for(const field of ['members','selected','reportA','reportB'])if(floors.some(f=>Object.hasOwn(p.explorer?.[field]||{},f.n+'|'+token)))return true;}return false;}
 function nearWall329(c,models){return models.map(m=>Engine.columnWallClearance329(rect(c),m.walls)).find(Boolean)||null;}
 function wallNotes329(p,result,key){
  const m=result.models[key]||Engine.model(p,key),contexts=[m,...result.floors.filter(f=>f.type===key).map(f=>Engine.floorModel(result,f.n))],notes=[];
  for(const c of m.columns.filter(c=>c.status!=='上层柱')){const hit=nearWall329(physical(c),contexts);if(hit)notes.push(c.id+'：靠近牆 '+hit.wallId+'（淨距 '+Math.round(hit.gap*1000)+' mm）；保留現有／手動柱，請核對柱牆整合'+(c.transferManual?'及 Transfer 承托':'或獨立柱需要')+'。');}
  for(const c of adjacent(p,result,key).above){const hit=nearWall329(c,contexts);if(hit)notes.push('上層 '+c.floor+'/F '+c.id+' 的對齊位置靠近牆 '+hit.wallId+'；不自動補貼牆柱，請另核對牆／TB 承托。');}
  return [...new Set(notes)];
 }
 function deletionRecords331(p,key){
  const t=p.types[key],b=(t.columnDefaults101?.cb??p.defaults.cb)/1000,d=(t.columnDefaults101?.cd??p.defaults.cd)/1000,xs=Engine.axes(p,'x',key),ys=Engine.axes(p,'y',key);
  const physical=(t.columnSchemeDeleted319||[]).map(x=>({...x})),grid=[],disabled=[];
  for(const s of t.suppressedColumns||[]){const x=xs.find(a=>a.id===s.ax),y=ys.find(a=>a.id===s.ay);if(!x||!y)continue;
   const size=t.columnSizes?.find(q=>q.ax===s.ax&&q.ay===s.ay),w=size?.bMode201!=='default'&&size?.b?size.b/1000:b,h=size?.dMode201!=='default'&&size?.d?size.d/1000:d,pk='axis:'+s.ax+'|'+s.ay,place=t.columnPlacements?.find(q=>q.key===pk),pos=t.columnAxisPositions?.find(q=>q.key===pk),dir=Engine.columnDirections[pos?.position]||[0,0];grid.push({x:place?.x??x.v+dir[0]*w/2,y:place?.y??y.v+dir[1]*h/2,w,d:h});
  }
  for(const c of t.columns.filter(c=>!c.on)){const w=(c.b||b*1000)/1000,h=(c.d||d*1000)/1000,pk='id:'+c.id,place=t.columnPlacements?.find(q=>q.key===pk),pos=t.columnAxisPositions?.find(q=>q.key===pk),dir=Engine.columnDirections[pos?.position]||[0,0];disabled.push({x:place?.x??c.x+dir[0]*w/2,y:place?.y??c.y+dir[1]*h/2,w,d:h});}
  return {physical,grid,disabled};
 }
 function deletionInfo331(p,key){const r=deletionRecords331(p,key),count=a=>new Set(a.map(v=>round(v.x)+','+round(v.y))).size;
  // A boundary-axis deletion can also have a physical deletion record at its
  // inward-offset centre. Resolve that exact anchored geometry on a clone for
  // counting only; never merge nearby manual records or alter exclusion areas.
  let grid=r.grid;if(r.grid.length){const trial=clone(p);trial.types[key].suppressedColumns=[];const restored=Engine.model(trial,key).columns,xs=Engine.axes(p,'x',key),ys=Engine.axes(p,'y',key),records=(p.types[key].suppressedColumns||[]).filter(s=>xs.some(a=>a.id===s.ax)&&ys.some(a=>a.id===s.ay));grid=r.grid.map((g,i)=>{const s=records[i],c=restored.find(c=>c.anchorX===s.ax&&c.anchorY===s.ay);return c?Engine.columnRect(c):g;});}
  return {count:count([...r.physical,...grid,...r.disabled]),resettableCount:count([...r.physical,...grid]),physicalCount:count(r.physical),gridCount:count(grid),disabledCount:count(r.disabled),retainedDisabledCount:r.disabled.length};}
 function deletedRects(p,key,reset=false){const r=deletionRecords331(p,key);return [...(reset?[]:[...r.physical,...r.grid]),...r.disabled];}
 // Move a complete candidate row/column, never individual grid points. Fixed and
 // adjacent-floor columns are considered separately and keep their exact centres.
 function coherentGrid331(set,b,d,min,allowed){
  const line=(values,width)=>values.map((v,i)=>round(v+(i===0&&set.arch331?width/2:i===values.length-1&&set.arch331?-width/2:0)));
  const x=line(set.x,b),y=line(set.y,d);
  for(const axis of ['y','x']){const values=axis==='x'?x:y,cross=axis==='x'?y:x,width=axis==='x'?b:d;
   for(let i=0;i<values.length;i++){const base=values[i],choices=[base,round(base-width/2),round(base+width/2)].filter(v=>values.every((q,j)=>j===i||((j<i?v>q+eps:v<q-eps)&&(Math.abs(base-q)<(min[axis]||0)-eps||Math.abs(v-q)>=(min[axis]||0)-eps))));
    const score=v=>cross.filter(q=>allowed({x:axis==='x'?v:q,y:axis==='x'?q:v,b,d})).length;
    choices.sort((a,z)=>score(z)-score(a)||Math.abs(a-base)-Math.abs(z-base)||a-z);values[i]=choices[0]??base;
   }
  }
  return x.flatMap(xx=>y.map(yy=>({x:xx,y:yy,b,d,grid331:true})));
 }
 function coherence331(columns,o){const short=(axis,step)=>{const a=unique(columns.map(c=>c[axis]));return a.slice(1).filter((v,i)=>v-a[i]<Math.min(1,step/4)-eps).length;};return {shortRows:short('y',o.targetY),shortColumns:short('x',o.targetX)};}
 function metrics(columns,adj,samples,walls){const gaps={x:[],y:[]};for(const axis of ['x','y']){const cross=axis==='x'?'y':'x',groups=new Map();for(const c of columns){const keys=['p:'+round(c[cross])],anchor=axis==='x'?'anchorY':'anchorX';if(c[anchor]!==undefined)keys.push('a:'+c[anchor]);for(const k of keys){const a=groups.get(k)||[];a.push(c[axis]);groups.set(k,a);}}for(const a of groups.values()){a.sort((a,b)=>a-b);for(let i=1;i<a.length;i++)gaps[axis].push(a[i]-a[i-1]);}}
  const unaligned=rows=>rows.filter(c=>!columns.some(q=>same(c,q))).length;
  const distances=samples.map(s=>Math.min(...columns.map(c=>Math.hypot(c.x-s[0],c.y-s[1])),...walls.map(w=>{const a=w.a,z=w.z,dx=z[0]-a[0],dy=z[1]-a[1],u=Math.max(0,Math.min(1,((s[0]-a[0])*dx+(s[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(s[0]-a[0]-u*dx,s[1]-a[1]-u*dy);})));return {count:columns.length,minX:gaps.x.length?Math.min(...gaps.x):null,minY:gaps.y.length?Math.min(...gaps.y):null,maxX:gaps.x.length?Math.max(...gaps.x):null,maxY:gaps.y.length?Math.max(...gaps.y):null,unalignedAbove:unaligned(adj.above),unalignedBelow:adj.floors.reduce((n,f)=>n+(adj.lowerFloors.includes(f)?columns.filter(c=>!adj.below.some(x=>x.at===f&&same(c,x))).length:0),0),maxReach:distances.length?Math.max(...distances):0,meanReach:distances.length?distances.reduce((a,b)=>a+b,0)/distances.length:0};}
 // Proposal diagnostics only. These records never set the manual Transfer override
 // or assign loads. Every occurrence of a shared Framing is checked separately.
 function support330(p,result,key,columns){
  const out=[],contains=(r,c)=>Math.abs(r.x-c.x)<=r.w/2+eps&&Math.abs(r.y-c.y)<=r.d/2+eps;
  for(const f of result.floors.filter(f=>f.type===key)){
   const lower=f.n>1?Engine.floorModel(result,f.n-1):null,shared=f.n>1&&result.floors[f.n-2].type===key;
   for(const c of columns){const row={x:c.x,y:c.y,at:f.n,below:f.n-1,id:c.id||'',kind:'base'};
    if(shared)row.kind='shared';
    else if(lower){
     const hits=lower.columns.filter(q=>q.status!=='上层柱'&&contains(Engine.columnRect(q),c));
     const walls=lower.walls.filter(w=>Engine.on([c.x,c.y],w));
     if(hits.length>1||hits.length&&walls.length)row.kind='ambiguous';
     else if(hits.length){row.kind=same(physical(hits[0]),c)?'column':'offset-column';row.member=hits[0].id;}
     else if(walls.length){row.kind='wall';row.member=walls.map(w=>w.id).join('／');}
     else {const target=Engine.transferBeamAt(p,lower,f.n-1,[c.x,c.y]);
      if(target){row.kind='beam';row.member=target.displayId||target.id;}
      else {const beams=lower.beams.filter(b=>Engine.transferBeamAt(p,{...lower,beams:[b]},f.n-1,[c.x,c.y]));row.kind=beams.length?'ambiguous':lower.columns.some(q=>q.status!=='上层柱')||lower.walls.length||lower.beams.length?'transfer':'missing';}
     }
    }
    out.push(row);
   }
  }
  return out;
 }
 // Geometric TB proposals only: no member creation, load assignment or design.
 // Orthogonal routes use adjacent physical lower supports, never an invented end.
 function tbRoutes334(p,result,key){
  const floors=[],routes=[];let limited=false;
  for(const f of result.floors.filter(f=>f.type===key&&f.n>1&&result.floors[f.n-2].type!==key)){
   const m=Engine.floorModel(result,f.n-1),cols=m.columns.filter(c=>c.status!=='上层柱').map(physical),walls=m.walls;
   const entry={at:f.n,below:f.n-1,model:m,routes:[]};floors.push(entry);
   for(const axis of [0,1]){
    const cross=1-axis,values=[...new Set([...cols.map(c=>cross?c.y:c.x),...walls.flatMap(w=>[w.a[cross],w.z[cross]])])].sort((a,b)=>a-b);
    if(values.length>160)limited=true;
    for(const v of values.slice(0,160)){
     const anchors=cols.filter(c=>Math.abs((cross?c.y:c.x)-v)<eps).map(c=>({point:[c.x,c.y],id:c.id,kind:'column'}));
     for(const w of walls){const delta=w.z[cross]-w.a[cross];if(Math.abs(delta)<eps){if(Math.abs(w.a[cross]-v)<eps)for(const pt of [w.a,w.z])anchors.push({point:[...pt],id:w.id,kind:'wall'});}else{const u=(v-w.a[cross])/delta;if(u>=-eps&&u<=1+eps)anchors.push({point:w.a.map((q,i)=>q+u*(w.z[i]-q)),id:w.id,kind:'wall'});}}
     anchors.sort((a,b)=>a.point[axis]-b.point[axis]||String(a.id).localeCompare(String(b.id)));
     const groups=[];for(const a of anchors){const g=groups.at(-1);if(g&&Math.abs(g[0].point[axis]-a.point[axis])<eps)g.push(a);else groups.push([a]);}
     for(let i=1;i<groups.length;i++){
      if(groups[i-1].length!==1||groups[i].length!==1)continue; // ambiguous bearing
      const a=groups[i-1][0],z=groups[i][0],span=Math.abs(z.point[axis]-a.point[axis]);if(span<eps||a.kind===z.kind&&a.id===z.id)continue;
      try{Diagonal315.checkBeam(a.point,z.point,{...m,beams:[]});}catch{continue;}
      // checkBeam handles tile/polygon gaps; explicitly cover slanted outlines too.
      if(m.floorPolygons315){const pieces=Diagonal315.segments319(a.point,z.point,m.floorPolygons315),covered=pieces.reduce((n,q)=>n+Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]),0);if(covered<span-1e-6)continue;}
      const route={id:'T'+f.n+'-'+(entry.routes.length+1),at:f.n,below:f.n-1,axis:axis?'Y':'X',a:clone(a),z:clone(z),span:round(span)};
      if(entry.routes.length>=320){limited=true;break;}entry.routes.push(route);routes.push(route);
     }
     if(entry.routes.length>=320)break;
    }
   }
  }
  return {floors,routes,limited};
 }
 function routeAt334(routes,c){return routes.filter(q=>{const i=q.axis==='X'?0:1,j=1-i,pt=[c.x,c.y];return Math.abs(pt[j]-q.a.point[j])<1e-6&&pt[i]>q.a.point[i]+eps&&pt[i]<q.z.point[i]-eps;}).sort((a,b)=>a.span-b.span||a.id.localeCompare(b.id))[0];}
 function routeDiagnostics334(p,result,key,columns,network=tbRoutes334(p,result,key),axis335=''){
  const supports=support330(p,result,key,columns),used=new Map();
  for(const row of supports)if(['transfer','missing'].includes(row.kind)){
   const locked=columns.find(c=>same(c,row))?.locked,route=routeAt334(network.routes.filter(q=>q.at===row.at&&(!axis335||locked||q.axis===axis335)),row);
   if(route){row.tb334=route.id;used.set(route.id,route);}
  }
  return {supports,routes:[...used.values()],unresolved:supports.filter(q=>['transfer','missing','ambiguous'].includes(q.kind)&&!q.tb334).length};
 }
 function routePool334(network,pool,b,d,o,p){
  const points=[...pool];
  for(const line of network.routes){const axis=line.axis==='X'?0:1,cross=1-axis,step=axis?o.targetY:o.targetX,n=Math.min(40,Math.max(2,Math.floor(line.span/step))),values=unique([...Array.from({length:n-1},(_,i)=>line.a.point[axis]+line.span*(i+1)/n),...pool.map(c=>axis?c.y:c.x)]);
   for(const v of values){if(v<=line.a.point[axis]+eps||v>=line.z.point[axis]-eps)continue;const pt=[0,0];pt[axis]=v;pt[cross]=line.a.point[cross];points.push({x:round(pt[0]),y:round(pt[1]),b,d,grid331:true});}
  }
  const seen=new Set(),out=[];
  for(const c of points){const token=round(c.x)+','+round(c.y);if(seen.has(token))continue;seen.add(token);
   if(network.floors.every(f=>{const hits=f.model.columns.filter(q=>q.status!=='上层柱'&&same(physical(q),c));return hits.length===1||!hits.length&&(f.model.walls.some(w=>Engine.on([c.x,c.y],w))||!!Engine.transferBeamAt(p,f.model,f.below,[c.x,c.y])||!!routeAt334(f.routes,c));}))out.push(c);
   if(out.length>=4000)break;
  }
  return out;
 }

 const pointDistance330=(s,c)=>Math.hypot(c.x-s[0],c.y-s[1]);
 // Compare complete orthogonal layouts, never combine X/Y routes to fill holes.
 // Stations are shared across all parallel routes, including split/unequal spans.
 // These are geometry proposals only; an upper column never splits a TB span.
 function directional335(p,r,key,network,fixed,adj,samples,contexts,min,o,b,d,allowed,existing,xs,ys){
  const empty={...network,routes:[],floors:network.floors.map(f=>({...f,routes:[]}))};
  const original=c=>{const old=existing.find(q=>same(physical(q),c));return old?physical(old):{x:round(c.x),y:round(c.y),b,d,grid331:true};};
  const direct=routePool334(empty,[...adj.below,...adj.above,...existing.map(physical)].map(original),b,d,o,p).filter(allowed);
  const base=supplement330(direct,fixed,adj,samples,contexts,min,o).columns,threshold=Math.hypot(o.targetX,o.targetY)/2;
  const distance=cols=>samples.map(s=>Math.min(...cols.map(c=>pointDistance330(s,c)),Math.max(...contexts.map(m=>Math.min(...m.walls.map(w=>wallDistance330(s,w)))))));
  const baseline=distance(base),penalty=a=>a.reduce((s,v)=>s+Math.max(0,Math.min(v,threshold*8)-threshold)**2,0),variants=[];let limited=false;
  for(const axis of ['X','Y']){
   const along=axis==='X'?'x':'y',cross=axis==='X'?'y':'x',index=axis==='X'?0:1,axes=axis==='X'?xs:ys,width=axis==='X'?b:d,step=axis==='X'?o.targetX:o.targetY;
   const routes=network.routes.filter(q=>q.axis===axis),net={...network,routes:[],floors:network.floors.map(f=>({...f,routes:f.routes.filter(q=>q.axis===axis)}))};
   const lo=axes[0]+width/2,hi=axes.at(-1)-width/2,n=Math.min(39,Math.max(1,Math.floor((hi-lo)/step)));if(!routes.length||hi<=lo)continue;
   const uniform=Array.from({length:n+1},(_,i)=>round(lo+(hi-lo)*i/n));
   // Direct-support rows are an alternative common station set, not extra points
   // interleaved with the regular grid. Evaluate both whole layouts separately.
   const aligned=unique(base.map(c=>c[along])).filter(v=>v>=lo-eps&&v<=hi+eps),stationSets=[uniform];
   if(aligned.length>2&&aligned.every((v,i)=>!i||v-aligned[i-1]>=(min[along]||step)-eps))stationSets.push(aligned);
   const axisVariants=[];
   for(const stations of stationSets){
    const groups=new Map();
    for(const route of routes)for(const v of stations){if(v<=route.a.point[index]+eps||v>=route.z.point[index]-eps)continue;const c=original({[along]:v,[cross]:route.a.point[1-index]});if(!allowed(c))continue;
     const group=groups.get(round(c[cross]))||[];if(!group.some(q=>same(q,c)))group.push(c);groups.set(round(c[cross]),group);
    }
    let examined=0;const bundles=[];
    for(const [crossValue,points]of groups){if((examined+=points.length)>Math.min(4000,o.maxCandidates)){limited=true;break;}
     const valid=routePool334(net,points,b,d,o,p);if(!valid.length)continue;
     const diagnostic=routeDiagnostics334(p,r,key,valid,network,axis),span=Math.max(0,...diagnostic.routes.map(q=>q.span));
     if(diagnostic.unresolved)continue;bundles.push({points:valid.sort((a,z)=>a[along]-z[along]),span,crossValue});
    }
    bundles.sort((a,z)=>a.span-z.span||a.crossValue-z.crossValue);
    const columns=base.map(clone);let distances=baseline.slice();
    for(const bundle of bundles){
     const additions=[];for(const c of bundle.points)if(![...columns,...additions].some(q=>same(c,q)||spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))||Math.hypot((c.x-q.x)/o.targetX,(c.y-q.y)/o.targetY)<.85))additions.push(c);
     if(!additions.length)continue;
     const next=distances.map((v,i)=>Math.min(v,...additions.map(c=>pointDistance330(samples[i],c))));
     // Add the entire feasible row, preserving gaps for constraints. Never shift
     // isolated points or add a longer route once sampled coverage is adequate.
     if(penalty(next)>=penalty(distances)-eps)continue;
     columns.push(...additions);distances=next;
    }
    const diagnostic=routeDiagnostics334(p,r,key,columns,network,axis),newRoutes=new Set(diagnostic.supports.filter(row=>!columns.find(c=>same(c,row))?.locked&&row.tb334).map(row=>row.tb334)),used=diagnostic.routes.filter(q=>newRoutes.has(q.id));
    if(!used.length||columns.length===base.length)continue;
    axisVariants.push({axis335:axis,columns,stations335:stations,maxTB335:Math.max(...used.map(q=>q.span)),totalTB335:used.reduce((s,q)=>s+q.span,0),routeCount335:used.length,coverageTarget330:threshold,coverageUnresolved330:distances.filter(v=>v>threshold+eps).length,coveragePenalty335:penalty(distances),coverageGain335:penalty(baseline)-penalty(distances)});
   }
   // Same direction: prefer shorter spans, then common rows with better coverage.
   axisVariants.sort((a,z)=>a.maxTB335-z.maxTB335||a.coveragePenalty335-z.coveragePenalty335||a.totalTB335-z.totalTB335);
   if(axisVariants.length)variants.push(axisVariants[0]);
  }
  variants.sort((a,z)=>a.maxTB335-z.maxTB335||a.totalTB335-z.totalTB335||a.coveragePenalty335-z.coveragePenalty335||a.axis335.localeCompare(z.axis335));
  return {variants,base,limited};
 }
 function wallDistance330(s,w){const [a,z]=[w.a,w.z],dx=z[0]-a[0],dy=z[1]-a[1],u=Math.max(0,Math.min(1,((s[0]-a[0])*dx+(s[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(s[0]-a[0]-u*dx,s[1]-a[1]-u*dy);}
 function supplement330(pool,fixed,adj,samples,contexts,min,o){
  const cols=fixed.map(clone),rank=c=>adj.above.some(q=>same(c,q))+adj.below.some(q=>same(c,q)),canAdd=(c,density)=>!cols.some(q=>same(c,q)||spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))||density&&Math.hypot((c.x-q.x)/o.targetX,(c.y-q.y)/o.targetY)<.85);
  // Keep valid upper/lower alignments before considering new transfer positions.
  for(const c of pool.filter(c=>rank(c)).sort((a,b)=>rank(b)-rank(a)||a.x-b.x||a.y-b.y))if(canAdd(c,false))cols.push(c);
  const threshold=Math.hypot(o.targetX,o.targetY)/2,wallDistances=samples.map(s=>Math.max(...contexts.map(m=>Math.min(...m.walls.map(w=>wallDistance330(s,w)))))),distances=samples.map((s,i)=>Math.min(wallDistances[i],...cols.map(c=>pointDistance330(s,c))));
  const candidates=pool.map(c=>({c,distances:samples.map(s=>pointDistance330(s,c))}));let iterations=0;
  // Minimise uncovered sampled area beyond a typical cell half-diagonal.
  // This is a bounded layout heuristic, not an allowable beam span.
  while(iterations++<160&&distances.some(d=>d>threshold+eps)){
   let best=null,gain=0;
   for(const v of candidates){if(!canAdd(v.c,true))continue;let improvement=0;for(let i=0;i<distances.length;i++){const old=Math.min(distances[i],threshold*8),next=Math.min(old,v.distances[i]);improvement+=Math.max(0,old-threshold)**2-Math.max(0,next-threshold)**2;}if(improvement>gain+eps){gain=improvement;best=v;}}
   if(!best)break;cols.push(best.c);for(let i=0;i<distances.length;i++)distances[i]=Math.min(distances[i],best.distances[i]);
  }
  return {columns:cols,coverageTarget330:threshold,coverageUnresolved330:distances.filter(d=>d>threshold+eps).length};
 }
 function localGrid336(m,b,d,min,o,allowed,fixed,xs,ys){
  const cells=m.ts.filter(c=>c.state===1);if(!cells.length)return [];
  const bounds={x:[Math.min(...cells.map(c=>c.x0))+b/2,Math.max(...cells.map(c=>c.x1))-b/2],y:[Math.min(...cells.map(c=>c.y0))+d/2,Math.max(...cells.map(c=>c.y1))-d/2]};
  const x=Engine.columnStations336(...bounds.x,min.x||o.targetX),y=Engine.columnStations336(...bounds.y,min.y||o.targetY),cols=fixed.map(clone),points=x.flatMap(xx=>y.map(yy=>({x:round(xx),y:round(yy),b,d,grid331:true,corner336:(Math.abs(xx-x[0])<eps||Math.abs(xx-x.at(-1))<eps)&&(Math.abs(yy-y[0])<eps||Math.abs(yy-y.at(-1))<eps)})));
  points.sort((a,b)=>Number(b.corner336)-Number(a.corner336)||a.x-b.x||a.y-b.y);
  for(const c of points)if(allowed(c)&&!cols.some(q=>same(c,q)||spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))||!min.x&&!min.y&&Math.hypot((c.x-q.x)/o.targetX,(c.y-q.y)/o.targetY)<.85))cols.push(c);
  return cols;
 }
 function search(project,result,key,options={}){
  const stamp=JSON.stringify(project),p=clone(project),t=p.types[key];if(!t)throw Error('Framing 已不存在');const o={...options,...defaults(p,key),keepAll:!!options.keepAll,maxCandidates:options.maxCandidates??1800},min={x:t.columnSpacing258?.x||0,y:t.columnSpacing258?.y||0};for(const [k,limit]of [['targetX',min.x],['targetY',min.y]])if(!Number.isFinite(+o[k])||+o[k]<=0||+o[k]<limit)throw Error('目標柱距須大於 0 並不少於該方向最小柱距');for(const [k,limit]of [['maxX',min.x],['maxY',min.y]])if(o[k]!==''&&o[k]!=null&&(!Number.isFinite(+o[k])||+o[k]<=0||+o[k]<limit))throw Error('最大柱距須大於 0 並不少於最小柱距');
  const r=result||Engine.generate(clone(p)),m=Engine.model(p,key),existing=m.columns.filter(c=>c.status!=='上层柱'),fixed=existing.filter(c=>protectedColumn(p,key,m,c,o.keepAll)).map(c=>({...physical(c),locked:true})),adj=adjacent(p,r,key),report={stamp,key,options:o,schemes:[],messages:[],limited:false,lockedCount:fixed.length,affectedFloors:adj.floors,resetDeleted331:true,deletion331:deletionInfo331(p,key),blockedByDeleted331:0,alignment331:{aboveCount:adj.above.length,belowCount:adj.below.length,floors:adj.floors.map(n=>({floor:n,aboveCount:adj.above.filter(c=>c.at===n).length,belowCount:adj.below.filter(c=>c.at===n).length,base:n===1,sharedAbove:r.floors[n]?.type===key,sharedBelow:n>1&&r.floors[n-2].type===key}))}};
  const contexts=[...new Set([m,...r.floors.filter(f=>f.type===key).map(f=>Engine.floorModel(r,f.n))])],problemFor=c=>contexts.map(model=>footprintProblem(p,key,model,c)).find(Boolean)||'';
  for(const c of t.columns.filter(c=>c.on&&(t.mode!=='auto'||c.autoAdded)))if(!m.columns.some(q=>q.id===c.id&&q.anchorX===undefined))report.messages.push(c.id+'：手動柱輸入未能生成，請先核對牆／範圍／柱重疊；未忽略此柱');
  for(let i=0;i<fixed.length;i++){const c=fixed[i],problem=problemFor(c);if(problem)report.messages.push(c.id+'：'+problem+'；保留固定柱，請先處理');for(const q of fixed.slice(0,i)){const s=spacingProblem(c,q,min);if(s||Engine.overlap(rect(c),rect(q)))report.messages.push(c.id+'／'+q.id+'：'+(s||'柱截面重疊'));}}if(report.messages.length)return report;
  const b=(t.columnDefaults101?.cb??p.defaults.cb)/1000,d=(t.columnDefaults101?.cd??p.defaults.cd)/1000,xs=Engine.axes(p,'x',key).map(x=>x.v),ys=Engine.axes(p,'y',key).map(x=>x.v),blocked=deletedRects(p,key,report.resetDeleted331),blockedPoints331=new Set(),samples=[];
  const allowed331=c=>{if(problemFor(c)||nearWall329(c,contexts)||fixed.some(q=>spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))))return false;if(blocked.some(q=>Engine.overlap(rect(c),q))){blockedPoints331.add(round(c.x)+','+round(c.y));return false;}return true;};
  for(const cell of m.ts.filter(c=>c.state===1)){const nx=Math.min(30,Math.max(3,Math.ceil((cell.x1-cell.x0)/o.targetX*2))),ny=Math.min(30,Math.max(3,Math.ceil((cell.y1-cell.y0)/o.targetY*2)));for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++){const s=[cell.x0+(cell.x1-cell.x0)*(ix+.5)/nx,cell.y0+(cell.y1-cell.y0)*(iy+.5)/ny];if(m.floorPolygons315?m.floorPolygons315.some(poly=>Diagonal315.inside(s,poly)):!t.diagonal315||Diagonal315.inside(s,t.diagonal315.outline))samples.push(s);}}
  if(samples.length>600){const stride=Math.ceil(samples.length/600);samples.splice(0,samples.length,...samples.filter((_,i)=>i%stride===0));}
  const grid=(a,width,target)=>{const lo=a[0]+width/2,hi=a.at(-1)-width/2;if(hi<lo)return [];const n=Math.min(39,Math.max(1,Math.floor((hi-lo)/target)));return Array.from({length:n+1},(_,i)=>lo+(hi-lo)*i/n);};
  const sets=[{label:'只補上下層對齊',x:[],y:[]},{label:'沿用建築軸網',x:xs,y:ys,arch331:true},{label:'均勻柱網',x:grid(xs,b,+o.targetX),y:grid(ys,d,+o.targetY)},{label:'較疏柱網',x:grid(xs,b,+o.targetX*1.2),y:grid(ys,d,+o.targetY*1.2)}],usedSchemes=new Set(),budget=Math.max(1,Math.min(4000,Number(o.maxCandidates)||1800));let evaluated=0;const allPool=[],gridPools=[],network334=tbRoutes334(p,r,key);
  report.messages.push(...wallNotes329(p,r,key));
  const baseline=existing.map(c=>({...physical(c),locked:fixed.some(q=>q.existingKey===Engine.columnPositionKey(c))}));if(baseline.length&&!baseline.some((c,i)=>problemFor(c)||!c.locked&&nearWall329(c,contexts)||baseline.slice(0,i).some(q=>spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))))){const mt=metrics(baseline,adj,samples,m.walls);if(!(o.maxX&&mt.maxX>+o.maxX+eps)&&!(o.maxY&&mt.maxY>+o.maxY+eps)){usedSchemes.add(baseline.map(c=>c.x+','+c.y+','+c.b+','+c.d).sort().join(';'));report.schemes.push({id:0,label:'保留現有柱位',family:'existing',columns:baseline,metrics:mt,unchanged:true,score:mt.maxReach*4+mt.meanReach+mt.unalignedAbove*.25+mt.unalignedBelow*.25+baseline.length*.15});}}
  for(const set of (network334.floors.length?sets.slice(0,1):sets)){const pool=[],seen=new Set(),gridPoints=coherentGrid331(set,b,d,min,allowed331),anchors=[...adj.above,...adj.below,...(set.label==='沿用建築軸網'||set.label==='只補上下層對齊'?existing.map(physical):[]),...gridPoints],routed334=routePool334(set.label==='只補上下層對齊'?{...network334,routes:[],floors:network334.floors.map(f=>({...f,routes:[]}))}:network334,anchors,b,d,o,p);for(const a of routed334){if(++evaluated>budget){report.limited=true;break;}if(fixed.some(c=>same(c,a)))continue;
    const old=existing.find(c=>same(physical(c),a)),c=old?physical(old):{x:round(a.x),y:round(a.y),b,d,...(a.grid331?{grid331:true}:{})};if(!allowed331(c))continue;const token=c.x+','+c.y;if(!seen.has(token)){seen.add(token);pool.push(c);if(!allPool.some(q=>same(q,c)))allPool.push(c);}}
    if(set.x.length&&set.y.length)gridPools.push(pool);
    for(const strategy of ['align','forward','reverse']){const cols=fixed.map(clone),pending=[...pool].sort((a,b)=>strategy==='reverse'?b.x-a.x||b.y-a.y:strategy==='forward'?a.x-b.x||a.y-b.y:((adj.above.some(q=>same(q,b))?1:0)+(adj.below.some(q=>same(q,b))?1:0))-((adj.above.some(q=>same(q,a))?1:0)+(adj.below.some(q=>same(q,a))?1:0))||a.x-b.x||a.y-b.y);for(const c of pending)if(!cols.some(q=>same(c,q)||spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))||set.label!=='只補上下層對齊'&&Math.hypot((c.x-q.x)/+o.targetX,(c.y-q.y)/+o.targetY)<.85))cols.push(c);if(!cols.length)continue;
      const mt=metrics(cols,adj,samples,m.walls);if((o.maxX&&mt.maxX>+o.maxX+eps)||(o.maxY&&mt.maxY>+o.maxY+eps))continue;const token=cols.map(c=>c.x+','+c.y+','+c.b+','+c.d).sort().join(';');if(usedSchemes.has(token))continue;usedSchemes.add(token);report.schemes.push({id:report.schemes.length+1,label:set.label+(strategy==='align'?' · 優先對齊':''),family:set.label,columns:cols,metrics:mt,score:mt.maxReach*4+mt.meanReach+mt.unalignedAbove*.25+mt.unalignedBelow*.25+cols.length*.15});}
    if(report.limited)break;
  }
  const directional=network334.floors.length?directional335(p,r,key,network334,fixed,adj,samples,contexts,min,o,b,d,allowed331,existing,xs,ys):null;
  if(directional?.limited)report.limited=true;
  const balancedVariants=(directional?[]:(gridPools.length?gridPools:[allPool])).map(pool=>supplement330(pool,fixed,adj,samples,contexts,min,o));
  const quality331=(mt,cols)=>{const c=coherence331(cols,o);return mt.maxReach*4+mt.meanReach+cols.length*.05+(mt.unalignedAbove+mt.unalignedBelow)*.1+(c.shortRows+c.shortColumns)*.5;};
  for(const v of balancedVariants){const mt=metrics(v.columns,adj,samples,m.walls);v.layoutScore330=quality331(mt,v.columns);}
  const balanced=balancedVariants.sort((a,b)=>a.layoutScore330-b.layoutScore330)[0];
  const identical=(a,b)=>a.length===b.length&&a.every(c=>b.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps));
  if(balanced?.columns.length&&!identical(balanced.columns,baseline)){ const mt=metrics(balanced.columns,adj,samples,m.walls);report.schemes.push({id:0,label:network334.floors.length?'上下層優先對齊＋沿 TB 支承線補柱':'上下層優先對齊＋補空位／轉換承托',family:'balanced330',...balanced,metrics:mt,score:mt.maxReach*4+mt.meanReach+balanced.columns.length*.15});}
  for(const [i,v]of (directional?.variants||[]).entries()){const mt=metrics(v.columns,adj,samples,m.walls);report.schemes.push({id:0,label:v.axis335+' 向 TB · 整排對齊'+(i===0?' · 較短跨度優先':''),family:i===0?'balanced330':'directional335-'+v.axis335,...v,metrics:mt});}
  report.directions335=(directional?.variants||[]).map(v=>({axis:v.axis335,maxSpan:v.maxTB335,totalSpan:v.totalTB335,routes:v.routeCount335,uncovered:v.coverageUnresolved330}));
  const lower336=[],lowerSeen336=new Set(),reuse336={total:0,retained:0,geometry:0,deleted:0,spacing:0,otherFloor:0};
  for(const a of adj.below){const token=round(a.x)+','+round(a.y);if(lowerSeen336.has(token))continue;lowerSeen336.add(token);reuse336.total++;const c={x:a.x,y:a.y,b,d};if(problemFor(c)||nearWall329(c,contexts)){reuse336.geometry++;continue;}if(blocked.some(q=>Engine.overlap(rect(c),q))){reuse336.deleted++;continue;}if(!routePool334({...network334,routes:[],floors:network334.floors.map(f=>({...f,routes:[]}))},[c],b,d,o,p).length){reuse336.otherFloor++;continue;}lower336.push(c);}
  // Favour complete lower rows; no target-density threshold may discard a legal centre.
  const reuseCols336=fixed.map(clone);for(const c of lower336.sort((a,b)=>a.x-b.x||a.y-b.y)){if(reuseCols336.some(q=>same(c,q))){reuse336.retained++;continue;}if(reuseCols336.some(q=>spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q)))){reuse336.spacing++;continue;}reuseCols336.push(c);reuse336.retained++;}
  report.reuse336=reuse336;if(reuse336.total){const mt=metrics(reuseCols336,adj,samples,m.walls);report.schemes.push({id:0,label:'優先沿用下層合法柱位',family:'reuse336',columns:reuseCols336,metrics:mt});report.messages.push('下層 '+reuse336.total+' 個不同柱位：沿用 '+reuse336.retained+'；範圍／Opening／牆／禁柱區略過 '+reuse336.geometry+'，停用柱 '+reuse336.deleted+'，最小柱距／重疊 '+reuse336.spacing+'，其他共用樓層支承 '+reuse336.otherFloor+'。');}
  const local336=localGrid336(m,b,d,min,o,allowed331,fixed,xs,ys);if(local336.length&&!identical(local336,baseline)){report.schemes.push({id:0,label:'本層規則柱網 · 四角優先／下層待配合',family:'local336',planning336:true,columns:local336,metrics:metrics(local336,adj,samples,m.walls)});}
  for(const s of report.schemes){s.coherence331=coherence331(s.columns,o);s.quality331=quality331(s.metrics,s.columns);s.limitedCoverage331=s.metrics.maxReach>Math.hypot(o.targetX,o.targetY)*.75;if(!adj.above.length&&!adj.below.length){s.label=s.family==='balanced330'&&!s.axis335?'規則補空位 · 由本層柱網開始':s.label.replace(' · 優先對齊','');}}
  const aligned=(a,b)=>(a.metrics.unalignedAbove+a.metrics.unalignedBelow)-(b.metrics.unalignedAbove+b.metrics.unalignedBelow)||a.quality331-b.quality331;
  // Reserve different purposes. Multiple traversal orders of one grid no longer
  // crowd out a useful interior arrangement simply because it needs transfers.
  const chosen=[],families=['reuse336','local336','existing','只補上下層對齊','沿用建築軸網','均勻柱網','較疏柱網','directional335-X','directional335-Y'];
  for(const family of families){const variants=report.schemes.filter(s=>s.family===family).sort(family==='只補上下層對齊'?aligned:(a,b)=>a.quality331-b.quality331);if(variants.length)chosen.push(variants[0]);}
  const balancedScheme=report.schemes.find(s=>s.family==='balanced330'),ordered=[...chosen.filter(s=>s.unchanged),...chosen.filter(s=>s.family==='reuse336'),...(balancedScheme?[balancedScheme]:[]),...chosen.filter(s=>!s.unchanged&&s.family!=='reuse336')],eligible=[];let rejected=0;
  const similar=(a,b)=>{if(a.axis335&&b.axis335&&a.axis335!==b.axis335)return false;const shared=a.columns.filter(c=>b.columns.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps)).length,union=a.columns.length+b.columns.length-shared;return shared===union||!a.unchanged&&!b.unchanged&&a.metrics.unalignedAbove===b.metrics.unalignedAbove&&a.metrics.unalignedBelow===b.metrics.unalignedBelow&&shared/union>=.8&&Math.abs(a.metrics.maxReach-b.metrics.maxReach)<.25;};
  for(const scheme of ordered){if(eligible.some(s=>similar(s,scheme)))continue;try{if(!scheme.unchanged)apply(clone(project),result,key,scheme,report,{confirmReset331:true});const diagnostic334=routeDiagnostics334(p,r,key,scheme.columns,scheme.planning336?{...network334,routes:[]}:network334,scheme.axis335);scheme.support330=diagnostic334.supports;if(scheme.planning336)for(const row of scheme.support330)row.planning336=true;scheme.routes334=diagnostic334.routes;scheme.unresolved334=diagnostic334.unresolved;if(!scheme.unchanged&&!scheme.planning336&&scheme.support330.some(row=>['missing','transfer','ambiguous'].includes(row.kind)&&!row.tb334&&!scheme.columns.find(c=>same(c,row))?.locked))throw Error('新增柱未找到明確承托路線');eligible.push(scheme);}catch(error){rejected++;}}
  // Compare full directions by maximum span, then total length. Direct-only and
  // existing arrangements remain explicit alternatives, not zero-span winners.
  const priority336=s=>s.unchanged?-2:s.family==='reuse336'&&!s.limitedCoverage331?-1:s.planning336&&!adj.below.length?0:s.axis335?1:s.family==='reuse336'?2:s.planning336?3:4;const compare335=(a,b)=>priority336(a)-priority336(b)||(a.axis335&&b.axis335?a.maxTB335-b.maxTB335||a.totalTB335-b.totalTB335||a.quality331-b.quality331:a.axis335?-1:b.axis335?1:a.quality331-b.quality331||aligned(a,b));
  eligible.sort(compare335);report.schemes=eligible.slice(0,4);const reserved=[eligible.find(s=>s.family==='local336'),eligible.find(s=>s.family==='reuse336'),eligible.find(s=>s.unchanged),eligible.find(s=>s.family==='balanced330')].filter(Boolean);for(const s of reserved)if(!report.schemes.includes(s)){const replace=report.schemes.findLastIndex(q=>!reserved.includes(q));if(replace>=0)report.schemes[replace]=s;}report.schemes.sort(compare335);report.blockedByDeleted331=blockedPoints331.size;
  if(network334.floors.length)report.messages.push('分開比較 X／Y 方向：先保留直接支承，再沿平行 TB 線以共同排位整排布柱。優先較短最大 TB 跨度，其次總長；不為填空混加另一方向的長跨 TB。缺口明示待調整下層支承，跨度仍未驗算。');if(network334.limited)report.messages.push('已達 TB 支承線搜尋上限；未列出不代表無解。');if(rejected)report.messages.push('已排除 '+rejected+' 個會改變既有梁或無法完整套用的候選；現有模型未改動。');
  report.schemes.forEach((s,i)=>s.id=i+1);report.messages.push(network334.floors.length?'直接支承／現況方案另列作比較，不以零條 TB 當作已解決空位。長跨須另核對，橙色上層柱不會縮短下層 TB 跨度。':'先比較樓面覆蓋及整排／整列一致性，再兼顧上下層對齊和柱數；相似方案合併。不是梁跨度或 RC 驗算。');
  if(!adj.above.length&&!adj.below.length)report.messages.push('鄰層未有可比較的柱位；上下對齊未作比較，不代表已完成垂直承托。');
  if(report.limited)report.messages.push('已達候選數上限；可先手動放置關鍵柱再試。');if(!report.schemes.length)report.messages.push('本次未找到符合限制的候選，並非已證明無解。');return report;
 }
 function apply(project,result,key,scheme,report,options={}){
  if(!report||report.key!==key||report.stamp!==JSON.stringify(project))throw Error('模型已改變，請重新產生柱位方案');if(!report.schemes.includes(scheme))throw Error('請重新選擇方案');if(scheme.unchanged)return {columns:scheme.columns.length,added:0};
  const trial=clone(project),t=trial.types[key],before=Engine.model(trial,key),byKey=new Map(before.columns.map(c=>[Engine.columnPositionKey(c),c])),chosen=new Set(scheme.columns.map(c=>c.existingKey).filter(Boolean));Engine.bindMainColumns164(trial,key,before);Engine.freezeAutoBeams(trial,key,before);
  t.columns=t.columns.filter(c=>!c.on||!c.scheme319||chosen.has('id:'+c.id));for(const c of t.columns)if(chosen.has('id:'+c.id))c.autoAdded=true;
  t.columnFrozen311={columns:before.columns.filter(c=>c.anchorX!==undefined&&(c.status==='上层柱'||chosen.has(Engine.columnPositionKey(c)))).map(c=>({...clone(c),reference311:Engine.columnReference(trial,key,c)}))};
  const ids=new Set([...before.columns,...t.columns].map(c=>c.id));for(const c of scheme.columns.filter(c=>!c.existingKey)){let n=1;while(ids.has('SC'+n))n++;const id='SC'+n;ids.add(id);t.columns.push({id,x:c.x,y:c.y,b:c.b*1000,d:c.d*1000,bMode201:'manual',dMode201:'manual',status:'上下贯通',on:true,autoAdded:true,scheme319:true});(t.columnPlacements??=[]).push({key:'id:'+id,x:c.x,y:c.y,explicit174:true});}
  t.columnSchemeDeleted319=[];t.suppressedColumns=[];
  Engine.validate(trial);const generated=Engine.generate(trial),after=generated.models[key],actual=after.columns.filter(c=>c.status!=='上层柱').map(physical),min={x:t.columnSpacing258?.x||0,y:t.columnSpacing258?.y||0};if(actual.length!==scheme.columns.length||scheme.columns.some(c=>!actual.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps)))throw Error('實際生成柱位與預覽不同；整批未套用');
  for(let i=0;i<actual.length;i++){const c=actual[i],problem=footprintProblem(trial,key,after,c);if(problem)throw Error(problem);if(!scheme.columns.find(q=>same(c,q))?.locked&&nearWall329(c,[after]))throw Error(c.id+'：新自動柱靠近牆身／牆端，請重新產生方案');for(const q of actual.slice(0,i))if(spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q)))throw Error('實際生成柱距／重疊核對失敗');}
  for(const c of scheme.columns.filter(c=>c.locked)){const a=byKey.get(c.existingKey),z=after.columns.find(q=>Engine.columnPositionKey(q)===c.existingKey);if(!a||!z||JSON.stringify(physical(a))!==JSON.stringify(physical(z)))throw Error('固定柱資料無法保留；整批未套用');}
  for(const c of before.columns.filter(c=>c.status==='上层柱')){const z=after.columns.find(q=>q.status===c.status&&Engine.columnPositionKey(q)===Engine.columnPositionKey(c));if(!z||JSON.stringify(physical(z))!==JSON.stringify(physical(c)))throw Error('上層參考柱無法保留；整批未套用');}
  for(const b of before.beams){const z=after.beams.find(q=>q.id===b.id&&(q.baseKind||q.kind)===(b.baseKind||b.kind));if(!z||Engine.sig(z.a,z.z)!==Engine.sig(b.a,b.z)||z.b!==b.b||z.d!==b.d)throw Error('既有梁 '+b.id+' 會改變；整批未套用，請先另存模型核對梁布置');}
  // Lower-wall alignment may give the same Framing different physical geometry
  // on different floors. Reject the entire transaction if any floor disagrees.
  for(const f of generated.floors.filter(f=>f.type===key)){
   const fm=Engine.floorModel(generated,f.n),fc=fm.columns.filter(c=>c.status!=='上层柱').map(physical);
   if(fc.length!==scheme.columns.length||scheme.columns.some(c=>!fc.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps)))throw Error(f.n+'/F 實際柱位與預覽不同；整批未套用');
   for(const c of fc){const problem=footprintProblem(trial,key,fm,c);if(problem)throw Error(f.n+'/F '+problem+'；整批未套用');if(!scheme.columns.find(q=>same(c,q))?.locked&&nearWall329(c,[fm]))throw Error(f.n+'/F '+c.id+'：新自動柱靠近實際牆位；整批未套用');}
  }
  if(scheme.family==='balanced330'||scheme.axis335||scheme.planning336)trial.types[key].columnSchemeReview330=true;if(scheme.planning336)trial.types[key].columnLocalPlanning336=true;else delete trial.types[key].columnLocalPlanning336;project.types[key]=trial.types[key];return {columns:actual.length,added:scheme.columns.filter(c=>!c.existingKey).length};
 }
 return {defaults,search,apply,support330,deletionInfo331,footprintProblem,spacingProblem,protectedColumn,wallNotes329,tbRoutes334,routeAt334,routeDiagnostics334};
})();

const ColumnSchemesUI319=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=v=>v==null?'—':Number(v.toFixed(2));
 const supportLabels330={base:'模型底層：另核對基礎',shared:'相鄰同 Framing 柱位對齊',column:'下層柱中心對齊','offset-column':'偏心落在下層柱截面，需核對',wall:'落在下層牆截面，需核對',beam:'落在既有下層梁，需核對轉換承托',ambiguous:'多個可能支承，需確認',transfer:'未有直接承托，需另設 TB／轉換結構',missing:'下層未有支承模型，需建立／核對'};
 const review330=r=>!['base','shared','column'].includes(r.kind);
 function supportPanel330(p,rows,title='逐層承托提示'){
  const review=rows.filter(review330),transfers=review.filter(r=>['transfer','missing'].includes(r.kind));
  return '<p style="color:#8a4a0c">需另設／補建承托 '+transfers.length+' 處；其他承托待核對 '+(review.length-transfers.length)+' 處（按樓層計）</p>'+(review.length?'<details><summary>'+title+' · '+review.length+' 處</summary><div style="max-height:220px;overflow:auto">'+review.map(r=>'<p>'+esc(FloorLevels.name(p,r.at))+' · '+(r.id?esc(r.id)+' · ':'')+'('+fmt(r.x)+', '+fmt(r.y)+') m → '+esc(FloorLevels.name(p,r.below))+'：'+(r.planning336&&['transfer','missing'].includes(r.kind)?'下層待布柱／建立支承，傳力路徑未完成':supportLabels330[r.kind])+(r.member?' '+esc(r.member):'')+(r.tb334?'；擬議 TB '+esc(r.tb334)+'（未建立／未驗算）':'')+'</p>').join('')+'</div></details>':'')+'<p class="muted">只識別幾何位置；柱牆承壓、TB 跨度／高度、承載力及穩定系統仍須核對。未建立支承不會當作已完成 Transfer。</p>';
 }
 function directionPanel335(x){return x.axis335?'<p data-direction335><b>'+x.axis335+' 向整排布柱 · 最大 TB 跨度 '+fmt(x.maxTB335)+' m</b><br>擬議新增 TB '+x.routeCount335+' 條 · 總長 '+fmt(x.totalTB335)+' m<br>共用排位，受限位置留空；不補另一方向的長跨 TB。'+(x.coverageUnresolved330?'仍有 '+x.coverageUnresolved330+' 個樓面抽樣位置超出排柱參考距離，請調整下層支承或手動安排。':'跨度較短僅為方案比較，未代表驗算通過。')+'</p>':'';}
 function routesPanel334(p,routes,unresolved=0){return '<section data-tb334-routes><b>擬議 TB 支承線 · '+routes.length+' 條</b><p class="muted">X／Y 中心線跨度；兩端為下層實際柱／牆。虛線只供布梁，套用柱位不會建立 TB，跨度及承載力未驗算。</p>'+routes.map(q=>'<p data-tb334-route="'+esc(q.id)+'">'+esc(q.id)+' · '+esc(FloorLevels.name(p,q.below))+' · '+q.axis+' 向 · '+esc(q.a.id)+' ('+q.a.point.map(fmt).join(', ')+') → '+esc(q.z.id)+' ('+q.z.point.map(fmt).join(', ')+') · 跨度 '+fmt(q.span)+' m</p>').join('')+(unresolved?'<p role="alert">'+unresolved+' 處未找到明確承托路線；保留原柱並待核對。</p>':'')+'</section>';}
 function create(host){const states=new Map();let busy=false,serial=0;
  function state(){const {p,key}=host.get();if(!states.has(key))states.set(key,{draft:ColumnSchemes319.defaults(p,key),open:false,report:null,preview:0,status:''});return states.get(key);}
  function panel(){
   const {p,key,result}=host.get(),s=state(),min=p.types[key].columnSpacing258||{},report=s.report,stamp=JSON.stringify(p),stale=report&&report.stamp!==stamp,status=s.applied331?.status===s.status&&s.applied331.stamp!==stamp?'模型已變更，請重新產生柱位方案。':s.status;
   const alignText=m=>'<span data-scheme331-alignment>'+(!report?.alignment331.aboveCount?'上層對齊：N/A（未有鄰層柱可比較）':'上層未中心對齊 '+m.unalignedAbove+' 處')+'；'+(!report?.alignment331.belowCount?'下層對齊：N/A（未有鄰層柱可比較）':'下層未中心對齊 '+m.unalignedBelow+' 處')+'</span>';
   const floorText=(report?.alignment331.floors||[]).map(f=>'<p class="muted" data-scheme331-floor="'+f.floor+'">'+esc(FloorLevels.name(p,f.floor))+'：上層'+(f.sharedAbove?'共用 Framing':f.aboveCount?'有 '+f.aboveCount+' 支柱':'未有可比較柱位')+'；下層'+(f.base?'為模型底部，另核對基礎':f.sharedBelow?'共用 Framing':f.belowCount?'有 '+f.belowCount+' 支柱':'未有可比較柱位')+'。</p>').join('');
   return '<details class="preview-fold" id="column-schemes319" '+(s.open?'open':'')+' style="margin:12px 0"><summary>柱位方案助手 · 離線預覽</summary><div class="preview-fold-body"><p>先比較候選，按套用才改柱位。保留手動、已輸入尺寸／荷載及已接梁的柱；共用 Framing 樓層同步。重新排柱不受舊刪柱位置限制；不想布柱的位置請設禁柱區。</p><p>沿用上方最小柱中心距：X '+(min.x??'未限制')+'／Y '+(min.y??'未限制')+' m；毋須另填目標柱距。</p><p class="muted">新增柱完整截面避開 Opening／禁柱區／牆／範圍外；距牆身及牆端留至少半個柱短邊淨距。候選柱網按整排／整列調整；手動柱及合法上下層對齊位置保持原位。</p>'
    +'<label><input type="checkbox" data-scheme319-keep '+(s.draft.keepAll?'checked':'')+' '+(busy?'disabled':'')+'>固定全部現有柱（只建議補柱）</label><div class="row" style="margin-top:10px"><button type="button" data-scheme319-generate '+(busy?'disabled':'')+'>產生柱位方案</button><button type="button" data-scheme319-clear>關閉預覽</button></div><p role="status" style="color:#126579">'+esc(busy?'正在搜尋／核對，請稍候…':status)+'</p>'+(s.applied331?.stamp===stamp&&s.applied331.status===status&&!busy?'<button type="button" data-scheme333-undo>撤銷套用</button>':'')
    +(report?'<p>固定 '+report.lockedCount+' 支柱；影響 '+report.affectedFloors.map(f=>esc(FloorLevels.name(p,f))).join('、')+'。</p><p data-scheme331-blocked>本次候選中 '+report.blockedByDeleted331+' 個位置被停用柱阻擋（不是可用柱數）。</p>'+floorText:'')+(stale?'<p role="alert" style="color:#a33">模型已改變，請重新產生方案。</p>':'')+(report?.messages||[]).map(v=>'<p class="muted">'+esc(v)+'</p>').join('')
    +(p.types[key].columnSchemeReview330&&!report?'<section class="notice"><b>已套用方案 · 承托仍需核對</b>'+(()=>{const q=ColumnSchemes319.routeDiagnostics334(p,result,key,Engine.model(p,key).columns.filter(c=>c.status!=='上层柱').map(c=>({id:c.id,x:Engine.columnRect(c).x,y:Engine.columnRect(c).y})),p.types[key].columnLocalPlanning336?{routes:[]}:undefined);if(p.types[key].columnLocalPlanning336)q.supports.forEach(r=>r.planning336=true);return supportPanel330(p,q.supports)+routesPanel334(p,q.routes,q.unresolved);})()+'</section>':'')
    +(report?.schemes||[]).map(x=>{const m=x.metrics;return '<section class="notice" style="margin:10px 0;border-color:'+(s.preview===x.id?'#1b8a71':'#c7dbe3')+'"><b>方案 '+x.id+' · '+esc(x.label)+'</b>'+(x.limitedCoverage331?'<p style="color:#8a4a0c">樓面仍有較大空位；此方案僅供受限佈置比較。</p>':'')+'<p>'+m.count+' 支柱 · 新增 '+x.columns.filter(c=>!c.existingKey).length+' 支<br>實際最小 X／Y：'+fmt(m.minX)+'／'+fmt(m.minY)+' m<br>同排／列最大柱距 X／Y（未扣牆，非梁跨）：'+fmt(m.maxX)+'／'+fmt(m.maxY)+' m<br>'+alignText(m)+'<br>樓面抽樣最遠距柱／牆 '+fmt(m.maxReach)+' m（僅排序）</p>'+(x.planning336?'<p class="notice" data-planning336>按本層最小柱距先排規則柱網；未安排下層支承的位置仍未解決，需向下延續柱位或另行建立支承。此方案不擬造 TB 路線。</p>':'')+directionPanel335(x)+(x.family==='balanced330'&&!x.axis335?'<p class="muted">先保留合法對齊位置；有下層模型時，沿兩端支承的 TB 候選線補柱。'+(x.coverageUnresolved330?'仍有 '+x.coverageUnresolved330+' 個抽樣位置超出排柱參考距離；請檢查受限空間。':'已改善抽樣空位；仍須布梁及驗算。')+'</p>':'')+supportPanel330(p,x.support330||[])+routesPanel334(p,x.routes334||[],x.unresolved334)+'<div class="row"><button type="button" data-scheme319-preview="'+x.id+'" '+(stale||busy?'disabled':'')+'>預覽方案 '+x.id+'</button><button type="button" data-scheme319-apply="'+x.id+'" '+(stale||busy||x.unchanged?'disabled':'')+'>'+(x.unchanged?'現況，無須套用':'套用方案 '+x.id)+'</button></div></section>';}).join('')+'<p class="muted">棕色虛線＝擬議 TB（白方框為下層兩端支承）；綠色虛線＝建議新增；橙色＝承托待核對（只顯示當層）；藍色＝保留柱；紅色叉＝將移除的未鎖定自動柱。方案柱位固定保存；可一次撤銷。新增柱後仍須檢查梁布置及傳荷。</p></div></details>';
  }
  document.addEventListener('toggle',e=>{if(e.target.id==='column-schemes319')state().open=e.target.open;},true);
  document.addEventListener('change',e=>{if(!e.target.matches('[data-scheme319-keep]'))return;const s=state();s.draft.keepAll=e.target.checked;s.report=null;s.preview=0;s.status='輸入已改變，請重新產生方案。';host.refresh();});
  const yieldPaint=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-scheme319-generate],[data-scheme319-clear],[data-scheme319-preview],[data-scheme319-apply],[data-scheme333-undo]');if(!b||host.get().tab!=='columns')return;const s=state();s.open=true;
   if(b.hasAttribute('data-scheme333-undo')){if(!busy&&s.applied331?.stamp===JSON.stringify(host.get().p)){const undo=document.getElementById('undo');if(undo&&!undo.disabled){undo.click();s.applied331=null;s.status='已撤銷套用，模型已還原。';host.refresh();}}return;}
   if(b.hasAttribute('data-scheme319-clear')){serial++;s.preview=0;s.report=null;s.status='已關閉預覽，模型未改動。';host.refresh();return;}if(busy)return;
   if(b.dataset.scheme319Preview){s.preview=+b.dataset.scheme319Preview;host.refresh();return;}
   const request=++serial,{p,result,key}=host.get();busy=true;host.refresh();await yieldPaint();
   try{if(b.hasAttribute('data-scheme319-generate')){const report=ColumnSchemes319.search(p,result,key,s.draft);if(request===serial&&host.get().p===p&&host.get().key===key){s.report=report;s.preview=report.schemes[0]?.id||0;s.status=report.schemes.length?'找到 '+report.schemes.length+' 個候選；尚未套用。':'未找到候選，請查看原因。';}}
    else{const selectedReport=s.report,scheme=selectedReport?.schemes.find(x=>x.id===+b.dataset.scheme319Apply);if(!scheme)throw Error('請重新產生方案');if(request!==serial)return;
     if(request!==serial||host.get().p!==p||host.get().key!==key||selectedReport.stamp!==JSON.stringify(host.get().p))throw Error('模型或 Framing 已改變，請重新產生柱位方案');let error;const applied=host.transact(()=>ColumnSchemes319.apply(host.get().p,host.get().result,key,scheme,selectedReport),e=>error=e);if(!applied)throw error||Error('套用失敗，模型已還原');s.preview=0;s.report=null;s.status='已套用 '+key+' 方案 '+scheme.id+'（'+scheme.columns.length+' 支柱）；共用樓層同步。';s.applied331={status:s.status,stamp:JSON.stringify(host.get().p)};}}
   catch(error){s.status=error.message;s.preview=0;}finally{busy=false;host.refresh();}
  });
  function overlay(ctx,plot){const {p,key,tab,mode,result}=host.get(),s=state(),report=s.report;if(tab!=='columns'||mode!=='plan'||!plot||!s.preview||!report||report.stamp!==JSON.stringify(p))return;const plan=report.schemes.find(x=>x.id===s.preview);if(!plan)return;ctx.save();ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.strokeStyle='#a45a0b';ctx.font='12px sans-serif';for(const route of (plan.routes334||[]).filter(q=>q.at===host.get().floor)){const pts=[route.a.point,route.z.point].map(q=>[plot.ox+q[0]*plot.scale,plot.oy+q[1]*plot.scale]);ctx.beginPath();ctx.moveTo(...pts[0]);ctx.lineTo(...pts[1]);ctx.stroke();ctx.save();ctx.setLineDash([]);for(let i=0;i<2;i++){const [x,y]=pts[i];ctx.fillStyle='#fff';ctx.fillRect(x-4,y-4,8,8);ctx.strokeRect(x-4,y-4,8,8);ctx.fillStyle='#713c06';ctx.fillText(String(i?route.z.id:route.a.id),x+6,y-6);}const text=route.id+' · '+fmt(route.span)+' m',w=ctx.measureText(text).width,x=(pts[0][0]+pts[1][0])/2+5,y=(pts[0][1]+pts[1][1])/2-6;ctx.fillStyle='#ffffffdd';ctx.fillRect(x-2,y-11,w+4,15);ctx.fillStyle='#713c06';ctx.fillText(text,x,y);ctx.restore();}ctx.setLineDash([5,3]);for(const c of plan.columns){const review=(plan.support330||[]).some(r=>r.at===host.get().floor&&review330(r)&&Math.hypot(r.x-c.x,r.y-c.y)<1e-7);ctx.strokeStyle=review?'#b96712':c.existingKey?'#2879bd':'#078163';ctx.fillStyle=review?'#e18a2233':c.existingKey?'#2879bd22':'#07816333';const x=plot.ox+(c.x-c.b/2)*plot.scale,y=plot.oy+(c.y-c.d/2)*plot.scale,w=c.b*plot.scale,d=c.d*plot.scale;ctx.fillRect(x,y,w,d);ctx.save();ctx.beginPath();ctx.rect(x,y,w,d);ctx.clip();ctx.strokeRect(x,y,w,d);ctx.restore();}
   const model=Engine.floorModel(result,host.get().floor,key),keep=new Set(plan.columns.map(c=>c.existingKey));ctx.setLineDash([]);ctx.strokeStyle='#c43c3c';for(const c of model.columns.filter(c=>c.status!=='上层柱'&&!keep.has(Engine.columnPositionKey(c)))){const r=Engine.columnRect(c),x=plot.ox+r.x*plot.scale,y=plot.oy+r.y*plot.scale;ctx.beginPath();ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x-6,y+6);ctx.lineTo(x+6,y-6);ctx.stroke();}ctx.restore();}
  function invalidate(){const s=state();serial++;s.report=null;s.preview=0;s.status='最小柱距已更新，請重新產生方案。';document.querySelectorAll('[data-scheme319-preview],[data-scheme319-apply]').forEach(b=>b.disabled=true);const box=document.querySelector('#column-schemes319 [role=status]');if(box)box.textContent=s.status;}
  return {panel,overlay,invalidate};
 }
 return {create};
})();
