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
 function deletedRects(p,key,b,d){const t=p.types[key],xs=Engine.axes(p,'x',key),ys=Engine.axes(p,'y',key),out=(t.columnSchemeDeleted319||[]).map(x=>({...x}));for(const s of t.suppressedColumns||[]){const x=xs.find(a=>a.id===s.ax),y=ys.find(a=>a.id===s.ay);if(x&&y){const size=t.columnSizes?.find(q=>q.ax===s.ax&&q.ay===s.ay),w=size?.bMode201!=='default'&&size?.b?size.b/1000:b,h=size?.dMode201!=='default'&&size?.d?size.d/1000:d,pk='axis:'+s.ax+'|'+s.ay,place=t.columnPlacements?.find(q=>q.key===pk),pos=t.columnAxisPositions?.find(q=>q.key===pk),dir=Engine.columnDirections[pos?.position]||[0,0];out.push({x:place?.x??x.v+dir[0]*w/2,y:place?.y??y.v+dir[1]*h/2,w,d:h});}}for(const c of t.columns.filter(c=>!c.on))out.push({x:c.x,y:c.y,w:(c.b||b*1000)/1000,d:(c.d||d*1000)/1000});return out;}
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
 const pointDistance330=(s,c)=>Math.hypot(c.x-s[0],c.y-s[1]);
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
 function search(project,result,key,options={}){
  const stamp=JSON.stringify(project),p=clone(project),t=p.types[key];if(!t)throw Error('Framing 已不存在');const o={...options,...defaults(p,key),keepAll:!!options.keepAll,maxCandidates:options.maxCandidates??1800},min={x:t.columnSpacing258?.x||0,y:t.columnSpacing258?.y||0};for(const [k,limit]of [['targetX',min.x],['targetY',min.y]])if(!Number.isFinite(+o[k])||+o[k]<=0||+o[k]<limit)throw Error('目標柱距須大於 0 並不少於該方向最小柱距');for(const [k,limit]of [['maxX',min.x],['maxY',min.y]])if(o[k]!==''&&o[k]!=null&&(!Number.isFinite(+o[k])||+o[k]<=0||+o[k]<limit))throw Error('最大柱距須大於 0 並不少於最小柱距');
  const r=result||Engine.generate(clone(p)),m=Engine.model(p,key),existing=m.columns.filter(c=>c.status!=='上层柱'),fixed=existing.filter(c=>protectedColumn(p,key,m,c,o.keepAll)).map(c=>({...physical(c),locked:true})),adj=adjacent(p,r,key),report={stamp,key,options:o,schemes:[],messages:[],limited:false,lockedCount:fixed.length,affectedFloors:adj.floors};
  const contexts=[...new Set([m,...r.floors.filter(f=>f.type===key).map(f=>Engine.floorModel(r,f.n))])],problemFor=c=>contexts.map(model=>footprintProblem(p,key,model,c)).find(Boolean)||'';
  for(const c of t.columns.filter(c=>c.on&&(t.mode!=='auto'||c.autoAdded)))if(!m.columns.some(q=>q.id===c.id&&q.anchorX===undefined))report.messages.push(c.id+'：手動柱輸入未能生成，請先核對牆／範圍／柱重疊；未忽略此柱');
  for(let i=0;i<fixed.length;i++){const c=fixed[i],problem=problemFor(c);if(problem)report.messages.push(c.id+'：'+problem+'；保留固定柱，請先處理');for(const q of fixed.slice(0,i)){const s=spacingProblem(c,q,min);if(s||Engine.overlap(rect(c),rect(q)))report.messages.push(c.id+'／'+q.id+'：'+(s||'柱截面重疊'));}}if(report.messages.length)return report;
  const b=(t.columnDefaults101?.cb??p.defaults.cb)/1000,d=(t.columnDefaults101?.cd??p.defaults.cd)/1000,xs=Engine.axes(p,'x',key).map(x=>x.v),ys=Engine.axes(p,'y',key).map(x=>x.v),blocked=deletedRects(p,key,b,d),samples=[];
  for(const cell of m.ts.filter(c=>c.state===1)){const nx=Math.min(30,Math.max(3,Math.ceil((cell.x1-cell.x0)/o.targetX*2))),ny=Math.min(30,Math.max(3,Math.ceil((cell.y1-cell.y0)/o.targetY*2)));for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++){const s=[cell.x0+(cell.x1-cell.x0)*(ix+.5)/nx,cell.y0+(cell.y1-cell.y0)*(iy+.5)/ny];if(m.floorPolygons315?m.floorPolygons315.some(poly=>Diagonal315.inside(s,poly)):!t.diagonal315||Diagonal315.inside(s,t.diagonal315.outline))samples.push(s);}}
  if(samples.length>600){const stride=Math.ceil(samples.length/600);samples.splice(0,samples.length,...samples.filter((_,i)=>i%stride===0));}
  const grid=(a,width,target)=>{const lo=a[0]+width/2,hi=a.at(-1)-width/2;if(hi<lo)return [];const n=Math.min(39,Math.max(1,Math.floor((hi-lo)/target)));return Array.from({length:n+1},(_,i)=>lo+(hi-lo)*i/n);};
  const sets=[{label:'只補上下層對齊',x:[],y:[]},{label:'沿用建築軸網',x:xs,y:ys},{label:'均勻柱網',x:grid(xs,b,+o.targetX),y:grid(ys,d,+o.targetY)},{label:'較疏柱網',x:grid(xs,b,+o.targetX*1.2),y:grid(ys,d,+o.targetY*1.2)}],usedSchemes=new Set(),budget=Math.max(1,Math.min(4000,Number(o.maxCandidates)||1800));let evaluated=0;const allPool=[],gridPools=[];
  report.messages.push(...wallNotes329(p,r,key));
  const baseline=existing.map(c=>({...physical(c),locked:fixed.some(q=>q.existingKey===Engine.columnPositionKey(c))}));if(baseline.length&&!baseline.some((c,i)=>problemFor(c)||!c.locked&&nearWall329(c,contexts)||baseline.slice(0,i).some(q=>spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))))){const mt=metrics(baseline,adj,samples,m.walls);if(!(o.maxX&&mt.maxX>+o.maxX+eps)&&!(o.maxY&&mt.maxY>+o.maxY+eps)){usedSchemes.add(baseline.map(c=>c.x+','+c.y+','+c.b+','+c.d).sort().join(';'));report.schemes.push({id:0,label:'保留現有柱位',family:'existing',columns:baseline,metrics:mt,unchanged:true,score:mt.maxReach*4+mt.meanReach+mt.unalignedAbove*.25+mt.unalignedBelow*.25+baseline.length*.15});}}
  for(const set of sets){const pool=[],seen=new Set(),anchors=[...adj.above,...adj.below,...(set.label==='沿用建築軸網'||set.label==='只補上下層對齊'?existing.map(physical):[]),...set.x.flatMap(x=>set.y.map(y=>({x,y})))];for(const a of anchors){if(++evaluated>budget){report.limited=true;break;}if(fixed.some(c=>same(c,a)))continue;
    const old=existing.find(c=>same(physical(c),a)),base=old?physical(old):{x:a.x,y:a.y,b,d},choices=[];for(const dx of [0,base.b/2,-base.b/2])for(const dy of [0,base.d/2,-base.d/2]){if(old&&(dx||dy))continue;const c={...base,x:round(base.x+dx),y:round(base.y+dy)};if(problemFor(c)||nearWall329(c,contexts)||blocked.some(q=>Engine.overlap(rect(c),q))||fixed.some(q=>spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))))continue;choices.push(c);}choices.sort((a,b)=>(adj.above.some(q=>same(q,b))?1:0)-(adj.above.some(q=>same(q,a))?1:0)||Math.hypot(a.x-base.x,a.y-base.y)-Math.hypot(b.x-base.x,b.y-base.y));const c=choices[0];if(c){const token=c.x+','+c.y;if(!seen.has(token)){seen.add(token);pool.push(c);if(!allPool.some(q=>same(q,c)))allPool.push(c);}}}
    if(set.x.length&&set.y.length)gridPools.push(pool);
    for(const strategy of ['align','forward','reverse']){const cols=fixed.map(clone),pending=[...pool].sort((a,b)=>strategy==='reverse'?b.x-a.x||b.y-a.y:strategy==='forward'?a.x-b.x||a.y-b.y:((adj.above.some(q=>same(q,b))?1:0)+(adj.below.some(q=>same(q,b))?1:0))-((adj.above.some(q=>same(q,a))?1:0)+(adj.below.some(q=>same(q,a))?1:0))||a.x-b.x||a.y-b.y);for(const c of pending)if(!cols.some(q=>same(c,q)||spacingProblem(c,q,min)||Engine.overlap(rect(c),rect(q))||Math.hypot((c.x-q.x)/+o.targetX,(c.y-q.y)/+o.targetY)<.85))cols.push(c);if(!cols.length)continue;
      const mt=metrics(cols,adj,samples,m.walls);if((o.maxX&&mt.maxX>+o.maxX+eps)||(o.maxY&&mt.maxY>+o.maxY+eps))continue;const token=cols.map(c=>c.x+','+c.y+','+c.b+','+c.d).sort().join(';');if(usedSchemes.has(token))continue;usedSchemes.add(token);report.schemes.push({id:report.schemes.length+1,label:set.label+(strategy==='align'?' · 優先對齊':''),family:set.label,columns:cols,metrics:mt,score:mt.maxReach*4+mt.meanReach+mt.unalignedAbove*.25+mt.unalignedBelow*.25+cols.length*.15});}
    if(report.limited)break;
  }
  const balancedVariants=(gridPools.length?gridPools:[allPool]).map(pool=>supplement330(pool,fixed,adj,samples,contexts,min,o));
  for(const v of balancedVariants){const mt=metrics(v.columns,adj,samples,m.walls);v.layoutScore330=mt.maxReach*4+mt.meanReach+v.columns.length*.1;}
  const balanced=balancedVariants.sort((a,b)=>a.layoutScore330-b.layoutScore330)[0];
  const identical=(a,b)=>a.length===b.length&&a.every(c=>b.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps));
  if(balanced.columns.length&&!identical(balanced.columns,baseline)){ const mt=metrics(balanced.columns,adj,samples,m.walls);report.schemes.push({id:0,label:'上下層優先對齊＋補空位／轉換承托',family:'balanced330',...balanced,metrics:mt,score:mt.maxReach*4+mt.meanReach+balanced.columns.length*.15});}
  const aligned=(a,b)=>(a.metrics.unalignedAbove+a.metrics.unalignedBelow)-(b.metrics.unalignedAbove+b.metrics.unalignedBelow)||a.score-b.score;
  // Reserve different purposes. Multiple traversal orders of one grid no longer
  // crowd out a useful interior arrangement simply because it needs transfers.
  const chosen=[],families=['existing','只補上下層對齊','沿用建築軸網','均勻柱網','較疏柱網'];
  for(const family of families){const variants=report.schemes.filter(s=>s.family===family).sort(family==='只補上下層對齊'?aligned:(a,b)=>a.score-b.score);if(variants.length)chosen.push(variants[0]);}
  const balancedScheme=report.schemes.find(s=>s.family==='balanced330'),ordered=[...(balancedScheme?[balancedScheme]:[]),...chosen],eligible=[];let rejected=0;
  const similar=(a,b)=>{const shared=a.columns.filter(c=>b.columns.some(q=>same(c,q)&&Math.abs(c.b-q.b)<eps&&Math.abs(c.d-q.d)<eps)).length,union=a.columns.length+b.columns.length-shared;return shared===union||shared/union>=.8&&Math.abs(a.metrics.maxReach-b.metrics.maxReach)<.25;};
  for(const scheme of ordered){if(eligible.some(s=>similar(s,scheme)))continue;try{if(!scheme.unchanged)apply(clone(project),result,key,scheme,report);scheme.support330=support330(p,r,key,scheme.columns);eligible.push(scheme);if(eligible.length===4)break;}catch(error){rejected++;}}
  // Show the aligned/architectural alternatives first, the supplemented option last.
  eligible.sort((a,b)=>(a.family==='balanced330')-(b.family==='balanced330')||aligned(a,b));report.schemes=eligible;
  if(rejected)report.messages.push('已排除 '+rejected+' 個會改變既有梁或無法完整套用的候選；現有模型未改動。');
  report.schemes.forEach((s,i)=>s.id=i+1);report.messages.push('比較不同取向的有限候選；相似方案合併。補空位方案先保留合法對齊柱，再改善樓面距柱／牆距離；不是梁跨度或 RC 驗算。');
  if(report.limited)report.messages.push('已達候選數上限；可先手動放置關鍵柱再試。');if(!report.schemes.length)report.messages.push('本次未找到符合限制的候選，並非已證明無解。');return report;
 }
 function apply(project,result,key,scheme,report){
  if(!report||report.key!==key||report.stamp!==JSON.stringify(project))throw Error('模型已改變，請重新產生柱位方案');if(!report.schemes.includes(scheme))throw Error('請重新選擇方案');if(scheme.unchanged)return {columns:scheme.columns.length,added:0};
  const trial=clone(project),t=trial.types[key],before=Engine.model(trial,key),byKey=new Map(before.columns.map(c=>[Engine.columnPositionKey(c),c])),chosen=new Set(scheme.columns.map(c=>c.existingKey).filter(Boolean));Engine.bindMainColumns164(trial,key,before);Engine.freezeAutoBeams(trial,key,before);
  t.columns=t.columns.filter(c=>!c.scheme319||chosen.has('id:'+c.id));for(const c of t.columns)if(chosen.has('id:'+c.id))c.autoAdded=true;
  t.columnFrozen311={columns:before.columns.filter(c=>c.anchorX!==undefined&&(c.status==='上层柱'||chosen.has(Engine.columnPositionKey(c)))).map(c=>({...clone(c),reference311:Engine.columnReference(trial,key,c)}))};
  const ids=new Set([...before.columns,...t.columns].map(c=>c.id));for(const c of scheme.columns.filter(c=>!c.existingKey)){let n=1;while(ids.has('SC'+n))n++;const id='SC'+n;ids.add(id);t.columns.push({id,x:c.x,y:c.y,b:c.b*1000,d:c.d*1000,bMode201:'manual',dMode201:'manual',status:'上下贯通',on:true,autoAdded:true,scheme319:true});(t.columnPlacements??=[]).push({key:'id:'+id,x:c.x,y:c.y,explicit174:true});}
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
  if(scheme.family==='balanced330')trial.types[key].columnSchemeReview330=true;project.types[key]=trial.types[key];return {columns:actual.length,added:scheme.columns.filter(c=>!c.existingKey).length};
 }
 return {defaults,search,apply,support330,footprintProblem,spacingProblem,protectedColumn,wallNotes329};
})();

const ColumnSchemesUI319=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=v=>v==null?'—':Number(v.toFixed(2));
 const supportLabels330={base:'模型底層：另核對基礎',shared:'相鄰同 Framing 柱位對齊',column:'下層柱中心對齊','offset-column':'偏心落在下層柱截面，需核對',wall:'落在下層牆截面，需核對',beam:'落在既有下層梁，需核對轉換承托',ambiguous:'多個可能支承，需確認',transfer:'未有直接承托，需另設 TB／轉換結構',missing:'下層未有支承模型，需建立／核對'};
 const review330=r=>!['base','shared','column'].includes(r.kind);
 function supportPanel330(p,rows,title='逐層承托提示'){
  const review=rows.filter(review330),transfers=review.filter(r=>['transfer','missing'].includes(r.kind));
  return '<p style="color:#8a4a0c">需另設／補建承托 '+transfers.length+' 處；其他承托待核對 '+(review.length-transfers.length)+' 處（按樓層計）</p>'+(review.length?'<details><summary>'+title+' · '+review.length+' 處</summary><div style="max-height:220px;overflow:auto">'+review.map(r=>'<p>'+esc(FloorLevels.name(p,r.at))+' · '+(r.id?esc(r.id)+' · ':'')+'('+fmt(r.x)+', '+fmt(r.y)+') m → '+esc(FloorLevels.name(p,r.below))+'：'+supportLabels330[r.kind]+(r.member?' '+esc(r.member):'')+'</p>').join('')+'</div></details>':'')+'<p class="muted">只識別幾何位置；柱牆承壓、TB 跨度／高度、承載力及穩定系統仍須核對。未建立支承不會當作已完成 Transfer。</p>';
 }
 function create(host){const states=new Map();let busy=false,serial=0;
  function state(){const {p,key}=host.get();if(!states.has(key))states.set(key,{draft:ColumnSchemes319.defaults(p,key),open:false,report:null,preview:0,status:''});return states.get(key);}
  function panel(){const {p,key,result}=host.get(),s=state(),min=p.types[key].columnSpacing258||{},report=s.report,stale=report&&report.stamp!==JSON.stringify(p);
   return '<details class="preview-fold" id="column-schemes319" '+(s.open?'open':'')+' style="margin:12px 0"><summary>柱位方案助手 · 離線預覽</summary><div class="preview-fold-body"><p>先比較候選，按套用才改柱位。保留手動、已輸入尺寸／荷載及已接梁的柱；保留刪柱紀錄。共用 Framing 樓層同步。</p><p>沿用上方最小柱中心距：X '+(min.x??'未限制')+'／Y '+(min.y??'未限制')+' m；毋須另填目標柱距。</p><p class="muted">新增柱完整截面避開 Opening／禁柱區／牆／範圍外；距牆身及牆端留至少半個柱短邊淨距（自動佈置偏好）。留空方向按既有軸網提出候選。</p><label><input type="checkbox" data-scheme319-keep '+(s.draft.keepAll?'checked':'')+' '+(busy?'disabled':'')+'>固定全部現有柱（只建議補柱）</label><div class="row" style="margin-top:10px"><button type="button" data-scheme319-generate '+(busy?'disabled':'')+'>產生柱位方案</button><button type="button" data-scheme319-clear>關閉預覽</button></div><p role="status" style="color:#126579">'+esc(busy?'正在搜尋／核對，請稍候…':s.status)+'</p>'+(report?'<p>固定 '+report.lockedCount+' 支柱；影響 '+report.affectedFloors.map(f=>esc(FloorLevels.name(p,f))).join('、')+'。</p>':'')+(stale?'<p role="alert" style="color:#a33">模型已改變，請重新產生方案。</p>':'')+(report?.messages||[]).map(v=>'<p class="muted">'+esc(v)+'</p>').join('')+(p.types[key].columnSchemeReview330&&!report?'<section class="notice"><b>已套用方案 · 承托仍需核對</b>'+supportPanel330(p,ColumnSchemes319.support330(p,result,key,Engine.model(p,key).columns.filter(c=>c.status!=='上层柱').map(c=>({id:c.id,x:Engine.columnRect(c).x,y:Engine.columnRect(c).y}))))+'</section>':'')+(report?.schemes||[]).map(x=>{const m=x.metrics;return '<section class="notice" style="margin:10px 0;border-color:'+(s.preview===x.id?'#1b8a71':'#c7dbe3')+'"><b>方案 '+x.id+' · '+esc(x.label)+'</b><p>'+m.count+' 支柱 · 新增 '+x.columns.filter(c=>!c.existingKey).length+' 支<br>實際最小 X／Y：'+fmt(m.minX)+'／'+fmt(m.minY)+' m<br>同排／列最大柱距 X／Y（未扣牆，非梁跨）：'+fmt(m.maxX)+'／'+fmt(m.maxY)+' m<br>上層未中心對齊 '+m.unalignedAbove+' 處；下層未中心對齊 '+m.unalignedBelow+' 處<br>樓面抽樣最遠距柱／牆 '+fmt(m.maxReach)+' m（僅排序）</p>'+(x.family==='balanced330'?'<p class="muted">先保留合法對齊位置，再補樓面空位。'+(x.coverageUnresolved330?'仍有 '+x.coverageUnresolved330+' 個抽樣位置超出排柱參考距離；請檢查受限空間。':'已改善抽樣空位；仍須布梁及驗算。')+'</p>':'')+supportPanel330(p,x.support330||[])+'<div class="row"><button type="button" data-scheme319-preview="'+x.id+'" '+(stale||busy?'disabled':'')+'>預覽方案 '+x.id+'</button><button type="button" data-scheme319-apply="'+x.id+'" '+(stale||busy||x.unchanged?'disabled':'')+'>'+(x.unchanged?'現況，無須套用':'套用方案 '+x.id)+'</button></div></section>';}).join('')+'<p class="muted">綠色虛線＝建議新增；橙色＝承托待核對（只顯示當層）；藍色＝保留柱；紅色叉＝將移除的未鎖定自動柱。方案柱位固定保存；可一次撤銷。新增柱後仍須檢查梁布置及傳荷。</p></div></details>';
  }
  document.addEventListener('toggle',e=>{if(e.target.id==='column-schemes319')state().open=e.target.open;},true);
  document.addEventListener('change',e=>{if(!e.target.matches('[data-scheme319-keep]'))return;const s=state();s.draft.keepAll=e.target.checked;s.report=null;s.preview=0;s.status='輸入已改變，請重新產生方案。';host.refresh();});
  const yieldPaint=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-scheme319-generate],[data-scheme319-clear],[data-scheme319-preview],[data-scheme319-apply]');if(!b||host.get().tab!=='columns')return;const s=state();s.open=true;
   if(b.hasAttribute('data-scheme319-clear')){serial++;s.preview=0;s.report=null;s.status='已關閉預覽，模型未改動。';host.refresh();return;}if(busy)return;
   if(b.dataset.scheme319Preview){s.preview=+b.dataset.scheme319Preview;host.refresh();return;}
   const request=++serial,{p,result,key}=host.get();busy=true;host.refresh();await yieldPaint();
   try{if(b.hasAttribute('data-scheme319-generate')){const report=ColumnSchemes319.search(p,result,key,s.draft);if(request===serial&&host.get().p===p&&host.get().key===key){s.report=report;s.preview=report.schemes[0]?.id||0;s.status=report.schemes.length?'找到 '+report.schemes.length+' 個候選；尚未套用。':'未找到候選，請查看原因。';}}
    else{const scheme=s.report?.schemes.find(x=>x.id===+b.dataset.scheme319Apply);if(!scheme)throw Error('請重新產生方案');if(request!==serial)return;let error;const applied=host.transact(()=>ColumnSchemes319.apply(host.get().p,host.get().result,key,scheme,s.report),e=>error=e);if(!applied)throw error||Error('套用失敗，模型已還原');s.preview=0;s.report=null;s.status='已套用 '+key+' 柱位方案；共用樓層同步，可一次撤銷。';}}
   catch(error){s.status=error.message;s.preview=0;}finally{busy=false;host.refresh();}
  });
  function overlay(ctx,plot){const {p,key,tab,mode,result}=host.get(),s=state(),report=s.report;if(tab!=='columns'||mode!=='plan'||!plot||!s.preview||!report||report.stamp!==JSON.stringify(p))return;const plan=report.schemes.find(x=>x.id===s.preview);if(!plan)return;ctx.save();ctx.lineWidth=2;ctx.setLineDash([5,3]);for(const c of plan.columns){const review=(plan.support330||[]).some(r=>r.at===host.get().floor&&review330(r)&&Math.hypot(r.x-c.x,r.y-c.y)<1e-7);ctx.strokeStyle=review?'#b96712':c.existingKey?'#2879bd':'#078163';ctx.fillStyle=review?'#e18a2233':c.existingKey?'#2879bd22':'#07816333';const x=plot.ox+(c.x-c.b/2)*plot.scale,y=plot.oy+(c.y-c.d/2)*plot.scale,w=c.b*plot.scale,d=c.d*plot.scale;ctx.fillRect(x,y,w,d);ctx.save();ctx.beginPath();ctx.rect(x,y,w,d);ctx.clip();ctx.strokeRect(x,y,w,d);ctx.restore();}
   const model=Engine.floorModel(result,host.get().floor,key),keep=new Set(plan.columns.map(c=>c.existingKey));ctx.setLineDash([]);ctx.strokeStyle='#c43c3c';for(const c of model.columns.filter(c=>c.status!=='上层柱'&&!keep.has(Engine.columnPositionKey(c)))){const r=Engine.columnRect(c),x=plot.ox+r.x*plot.scale,y=plot.oy+r.y*plot.scale;ctx.beginPath();ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x-6,y+6);ctx.lineTo(x+6,y-6);ctx.stroke();}ctx.restore();}
  function invalidate(){const s=state();serial++;s.report=null;s.preview=0;s.status='最小柱距已更新，請重新產生方案。';document.querySelectorAll('[data-scheme319-preview],[data-scheme319-apply]').forEach(b=>b.disabled=true);const box=document.querySelector('#column-schemes319 [role=status]');if(box)box.textContent=s.status;}
  return {panel,overlay,invalidate};
 }
 return {create};
})();
