// Derived per-floor wall geometry. Shared Framing input records are never rewritten.
const WallFollow322=(()=>{
 'use strict';
 const eps=1e-6,near=(a,b)=>Math.abs(a-b)<eps,engine=()=>typeof Engine!=='undefined'?Engine:require('./engine.js');
 const orientation=(a,z)=>near(a[1],z[1])&&Math.abs(a[0]-z[0])>eps?0:near(a[0],z[0])&&Math.abs(a[1]-z[1])>eps?1:null;
 function matching(a,z,walls){const along=orientation(a,z);if(along===null)return [];const cross=1-along,lo=Math.min(a[along],z[along]),hi=Math.max(a[along],z[along]);return walls.filter(w=>w.rawA&&w.rawZ&&orientation(w.rawA,w.rawZ)===along&&near(w.rawA[cross],a[cross])&&Math.min(hi,Math.max(w.rawA[along],w.rawZ[along]))-Math.max(lo,Math.min(w.rawA[along],w.rawZ[along]))>eps).sort((a,b)=>a.id.localeCompare(b.id));}
 function placement(ts,a,z,b,position='auto',below=[]){
  if(position!=='auto')return null;const E=engine(),hits=matching(a,z,below);if(!hits.length)return null;
  const along=orientation(a,z),cross=1-along,normal=()=>E.wallPosition(ts,a,z,b,'auto'),meta={status:'aligned',lowerIds:hits.map(w=>w.id)};
  if(hits.some(w=>!near(w.a[cross],hits[0].a[cross])))return {pos:normal(),meta:{...meta,status:'conflict'},message:'下層同軸牆有不同偏移，未自動對齊；請分段或手動指定軸線位置'};
  const offset=Number((hits[0].a[cross]-a[cross]).toFixed(9)),aa=[...a],zz=[...z];aa[cross]+=offset;zz[cross]+=offset;const pos={a:aa,z:zz},r=E.rect({...pos,b});
  if(!E.wallPosition(ts,a,z,b,'center')||!E.rectAllowed(ts,r.x,r.y,r.w,r.d,true))return {pos:normal(),meta:{...meta,status:'blocked',requestedOffset:offset},message:'下層牆偏移會使牆越出本層有效建築範圍，未自動對齊；請核對範圍或手動指定'};
  return {pos,meta:{...meta,offset}};
 }
 const signature=q=>{const E=engine();return JSON.stringify([E.floors(q).map(f=>[f.n,f.type]),q.axes,q.defaults,q.types]);};
 function changed(p,before){return signature(p)!==signature(before);}
 function transferMetadata(p,f,m,source,lower){const E=engine(),t=p.types[f.type],previous=new Map(source.columns.map(c=>[E.columnPositionKey(c),c]));
  for(const c of m.columns){const old=previous.get(E.columnPositionKey(c)),manual=old?.transferManual||c.transferColumn||(t.transferColumns||[]).some(a=>a.ax===c.anchorX&&a.ay===c.anchorY);
   if(manual){c.isTransferColumn=true;c.transferManual=true;c.transferReason='手动标记 · 不参与上下层对齐';continue;}
   if(old&&JSON.stringify(E.columnRect(old))===JSON.stringify(E.columnRect(c))){for(const k of ['isTransferColumn','transferManual','transferReason'])if(old[k]!==undefined)c[k]=old[k];continue;}
   delete c.isTransferColumn;delete c.transferManual;delete c.transferReason;
   const support=c.status==='上层柱'?m:lower,ref=E.columnReference(p,f.type,c);if(support.columns.some(d=>d.status!=='上层柱'&&E.columnReference(p,support.key,d).every((v,i)=>near(v,ref[i]))))continue;
   const beams=support.beams.filter(b=>b.kind==='TB'&&E.on([c.x,c.y],b));if(beams.length){c.isTransferColumn=true;c.transferReason=beams.length===1?'几何识别：'+(c.status==='上层柱'?f.n+1:f.n)+'/F 柱落在 '+support.key+' / '+beams[0].id+'，无直接下层柱；不参与对齐':'柱下有多根 TB，转移关系待确认；暂不参与对齐';}
  }
 }
 function build(p,result,make){
  const E=engine(),base={...result.models},original={...result.floorModels},cache=new WeakMap(),plans=new WeakMap();
  for(let i=0;i<result.floors.length;i++){
   const f=result.floors[i],source=original[f.n]?.key===f.type?original[f.n]:base[f.type];let m=source;
   if(i){const lower=E.floorModel(result,result.floors[i-1].n),t=p.types[f.type];let byType=plans.get(lower.walls);if(!byType)plans.set(lower.walls,byType=new Map());let plan=byType.get(f.type);
    if(!plan){plan=new Map();for(const w of t.walls.filter(w=>w.on&&(w.axisPosition??'auto')==='auto')){const a=E.resolve(p,w.a,f.type),z=E.resolve(p,w.z,f.type),decision=placement(source.ts,a,z,w.b/1000,'auto',lower.walls);if(!decision)continue;decision.meta.lowerKey=lower.key;
      if(decision.meta.status==='aligned'&&decision.pos){
       const box=E.rect({...decision.pos,b:w.b/1000}),boundary=source.buildingPolygons319||(source.diagonal315?.outline?[source.diagonal315.outline]:null);
       if(boundary&&Diagonal315.sum(Diagonal315.difference([Diagonal315.box(box)],boundary))>eps){
        const original=source.walls.find(q=>q.id===w.id);decision.pos=original?{a:[...original.a],z:[...original.z]}:null;decision.meta.status='blocked';decision.message='跟隨下層牆會越出本層實際點選／斜邊範圍，已保留原牆位置；請核對範圍或手動指定';
       }
      }
      if(decision.meta.status==='aligned'&&decision.pos){const box=E.rect({...decision.pos,b:w.b/1000}),fixed=source.columns.filter(c=>t.mode!=='auto'||t.columnFrozen311||c.autoAdded||c.axisPosition||c.alignmentReference);if(fixed.some(c=>E.overlap(box,E.columnRect(c)))){decision.pos=E.wallPosition(source.ts,a,z,w.b/1000,'auto');decision.meta.status='blocked';decision.message='跟隨下層牆會與本層手動／固定柱重疊，未自動對齊；請先核對柱牆位置';}}
      plan.set(w.id,decision);
     }byType.set(f.type,plan);}
    if(plan.size){let variants=cache.get(source);if(!variants)cache.set(source,variants=new Map());const sig=JSON.stringify([...plan]);m=variants.get(sig);
     if(!m){const old=new Map(source.walls.map(w=>[w.id,w])),different=[...plan].some(([id,d])=>{const w=old.get(id);return !!w!==!!d.pos||w&&d.pos&&['a','z'].some(e=>w[e].some((v,j)=>!near(v,d.pos[e][j])));});
      if(different){m=make(p,f.type,[],null,plan);transferMetadata(p,f,m,source,lower);}
      else m={...source,walls:source.walls.map(w=>plan.has(w.id)?{...w,wallFollow322:plan.get(w.id).meta}:w)};
      variants.set(sig,m);
     }
     for(const [id,d]of plan)if(d.message)result.issues.push({type:f.type,floor:f.n,id,msg:d.message});
    }
   }
   result.floorModels[f.n]=m;
  }
  const seen=new Set();for(const f of result.floors)if(!seen.has(f.type)){seen.add(f.type);result.models[f.type]=result.floorModels[f.n];}
  return result;
 }
 function binding(entries,end){if(!entries.length)return null;const E=engine(),first=entries[0],axis=orientation(first.b.rawA,first.b.rawZ),cross=1-axis,faces=entries.map(({w,b})=>{const side=Math.sign(b[end==='a'?'z':'a'][axis]-w.a[axis]);return side?w.a[axis]+side*w.b/2:null;});
  if(entries.some(({w,b},i)=>orientation(w.rawA,w.rawZ)!==cross||!near(w.rawA[axis],first.w.rawA[axis])||faces[i]===null||!near(faces[i],faces[0])))return null;
  const intervals=entries.map(({w})=>[Math.min(w.rawA[cross],w.rawZ[cross]),Math.max(w.rawA[cross],w.rawZ[cross])]).sort((a,b)=>a[0]-b[0]);let reach=intervals[0][1];for(const [lo,hi]of intervals){if(lo>reach+eps)return null;reach=Math.max(reach,hi);}
  const members=entries.map(({w})=>({id:w.id,signature:E.sig(w.rawA,w.rawZ)}));return {...members[0],raw:E.clone(first.b[end==='a'?'rawA':'rawZ']),...(members.length>1?{members322:members}:{})};
 }
 // A lower-floor edit can move an upper wall even when that Framing's raw input is unchanged.
 function bind(p,before){
  if(!changed(p,before))return;const E=engine(),old=E.generate(E.clone(before)),next=E.generate(E.clone(p));
  const raw=(q,key)=>JSON.stringify([q.types[key].walls,q.types[key].building,q.types[key].opening,q.types[key].axes||q.axes]),geometry=(r,key)=>JSON.stringify(r.floors.filter(f=>f.type===key).map(f=>[f.n,E.floorModel(r,f.n).walls.map(w=>[w.id,w.rawA,w.rawZ,w.a,w.z,w.b])]));
  for(const [key,t]of Object.entries(p.types)){
   if(!before.types[key]||raw(p,key)===raw(before,key)&&geometry(old,key)===geometry(next,key))continue;const variants=[...new Set([old.models[key],...old.floors.filter(f=>f.type===key).map(f=>E.floorModel(old,f.n))])].filter(Boolean),records=[...t.beams,...t.autoBeamSnapshot?.main||[],...t.autoBeamSnapshot?.primary||[],...t.autoBeamSnapshot?.secondary||[]];
   for(const record of records){if(record.positionMode175==='fixed')continue;
    for(const end of ['a','z']){const contacts=new Map();for(const m of variants){const b=m.beams.find(b=>b.id===record.id&&(b.baseKind||b.kind)===record.kind);if(!b||orientation(b.rawA,b.rawZ)===null)continue;for(const w of m.walls)if(orientation(b.rawA,b.rawZ)!==orientation(w.rawA,w.rawZ)&&E.on(b[end],w)){const id=w.id+'|'+E.sig(w.rawA,w.rawZ);contacts.set(id,{w,b});}}
     const link=binding([...contacts.values()],end);if(link)(record.wallSupports302??={})[end]=link;
    }
   }
  }
 }
 function support(beam,end,wall,legacy){const E=engine(),point=beam[end];if(wall.wallFollow322?.status==='aligned')return !!point&&E.on(point,wall);if(legacy)return true;const link=beam.wallSupports302?.[end],raw=beam[end==='a'?'rawA':'rawZ']||point;return beam.positionMode175!=='fixed'&&!!link&&(link.members322||[link]).some(m=>m.id===wall.id&&m.signature===E.sig(wall.rawA,wall.rawZ))&&link.raw?.length===2&&link.raw.every((v,i)=>near(v,raw[i]))&&E.on(point,wall);}
 return {matching,placement,changed,build,bind,support};
})();
if(typeof module!=='undefined')module.exports=WallFollow322;
