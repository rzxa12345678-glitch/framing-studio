// Synthetic offline column-layout cases. No user project or browser is modified.
const assert=require('node:assert/strict');
const {context}=require('./audit-performance247.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const near=(a,b)=>Math.abs(a-b)<1e-6;
function fixture({levels=1,spacing={x:6,y:6},shape='rect'}={}){
 const p={format:'framing-app',version:1,name:'Column schemes regression',total:levels,
  axes:{x:[{id:'1',gap:0},{id:'2',gap:6},{id:'3',gap:6},{id:'4',gap:6}],y:[{id:'A',gap:0},{id:'B',gap:6},{id:'C',gap:6},{id:'D',gap:6}]},
  defaults:{cb:500,cd:500,gap:3000,direction:'X',mb:300,sb:300,tb:600,tbd:1200,slab:200,wall:300},groups:[],types:{}};
 for(let f=1;f<=levels;f++){
  const key='F'+f;
  p.groups.push({end:f===levels?'顶层':f,h:4,type:key,sh:800,min:0,headroom:3,em:.2});
  p.types[key]={mode:'auto',autoBeams101:false,building:Object.fromEntries(Array.from({length:9},(_,i)=>[Math.floor(i/3)+','+i%3,true])),opening:{},columns:[],walls:[],beams:[],suppressed:[],suppressedColumns:[],columnSpacing258:clone(spacing)};
  if(shape==='L')for(const k of ['1,1','1,2','2,1','2,2'])delete p.types[key].building[k];
  if(shape==='triangle')p.types[key].diagonal315={outline:[[18,0],[18,18],[0,18]],direction:'X'};
 }
 return p;
}
function section(c){return {x:c.cx??c.x,y:c.cy??c.y,w:c.b,d:c.d};}
function areaOverlap(a,b){return Math.max(0,Math.min(a.x+a.w/2,b.x1)-Math.max(a.x-a.w/2,b.x0))*Math.max(0,Math.min(a.y+a.d/2,b.y1)-Math.max(a.y-a.d/2,b.y0));}
function axisValues(p,key,d){let v=(p.types[key].axes||p.axes).origin?.[d]||0;return (p.types[key].axes||p.axes)[d].map((a,i)=>({id:a.id,v:v+=(i?a.gap:0)}));}
function verifyPhysical(p,key,columns){
 const t=p.types[key],x=axisValues(p,key,'x'),y=axisValues(p,key,'y'),tiles=[];
 for(let i=0;i<x.length-1;i++)for(let j=0;j<y.length-1;j++)if(t.building[i+','+j]&&!t.opening[i+','+j])tiles.push({x0:x[i].v,x1:x[i+1].v,y0:y[j].v,y1:y[j+1].v});
 for(const c of columns){
  const r=section(c),covered=tiles.reduce((a,q)=>a+areaOverlap(r,q),0);
  assert(Math.abs(covered-r.w*r.d)<1e-7,`${key}/${c.id}: full section crosses exterior or Opening`);
  for(const z of t.noColumnZones||[])assert(areaOverlap(r,z)<1e-9,`${key}/${c.id}: full section overlaps no-column zone`);
  if(t.diagonal315)for(const dx of [-r.w/2,r.w/2])for(const dy of [-r.d/2,r.d/2])assert(r.x+dx+r.y+dy>=18-1e-6,`${key}/${c.id}: corner crosses diagonal outline`);
 }
 for(let i=0;i<columns.length;i++)for(let j=i+1;j<columns.length;j++){
  const a=columns[i],b=columns[j],r=section(a),s=section(b);
  assert(!(Math.abs(r.x-s.x)<(r.w+s.w)/2-1e-6&&Math.abs(r.y-s.y)<(r.d+s.d)/2-1e-6),`${key}: overlapping column sections`);
  for(const [d,cross,anchor]of [['x','y','anchorY'],['y','x','anchorX']])if(t.columnSpacing258?.[d]!=null&&(near(r[cross],s[cross])||a[anchor]!==undefined&&a[anchor]===b[anchor]))assert(Math.abs(r[d]-s[d])>=t.columnSpacing258[d]-1e-6,`${key}/${a.id}/${b.id}: actual ${d} centre spacing below limit`);
 }
}
module.exports={fixture,verifyPhysical};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),c=context(),passed=[],failures=[];
 if(!c.run("typeof ColumnSchemes319!=='undefined'"))vm.runInContext(fs.readFileSync(path.join(__dirname,'../column-schemes319.js'),'utf8'),c.ctx,{filename:'column-schemes319.js'});
 const model=p=>c.run('Engine.generate(Engine.clone(argument))',p);
 const search=(p,key='F1',options={})=>{
  const result=model(p),before=JSON.stringify(p),derived=JSON.stringify(result);
  const report=c.run('ColumnSchemes319.search(argument.p,argument.result,argument.key,argument.options)',{p,result,key,options});
  assert.equal(JSON.stringify(p),before,'search changes source project');assert.equal(JSON.stringify(result),derived,'search changes supplied results');
  assert.equal(report.stamp,before);assert.equal(report.key,key);assert(Array.isArray(report.schemes));assert(report.schemes.length<=3);
  for(const s of report.schemes){assert.equal(s.metrics.count,s.columns.length);verifyPhysical(p,key,s.columns);}
  return {report,result};
 };
 const apply=(p,result,key,scheme,report)=>c.run('ColumnSchemes319.apply(argument.p,argument.result,argument.key,argument.scheme,argument.report)',{p,result,key,scheme,report});
 const requireSchemes=out=>{assert(out.report.schemes.length>0,JSON.stringify(out.report.messages));return out;};
 const physical=m=>m.columns.filter(v=>v.status!=='上层柱').map(v=>({id:v.id,...section(v)}));
 {
  const p=fixture(),out=requireSchemes(search(p));
  assert(out.report.schemes.some(s=>s.columns.length>=4),'no useful rectangle arrangement');
  const again=search(p);assert.deepEqual(clone(out.report.schemes),clone(again.report.schemes),'search is not deterministic');
  assert.equal(out.report.lockedCount,0);
  passed.push('Search leaves untouched raw inputs/results, provides at most three deterministic physical arrangements');
 }
 {
  const p=fixture({spacing:{x:5,y:5}}),t=p.types.F1;
  t.columns=[{id:'MANUAL',x:6,y:6,b:700,d:800,on:true,autoAdded:true,status:'上下贯通'}];
  t.suppressedColumns=[{ax:'3',ay:'C'}];
  const out=requireSchemes(search(p));assert(out.report.lockedCount>=1);
  for(const s of out.report.schemes){
   const manual=s.columns.find(q=>q.id==='MANUAL');assert(manual&&manual.locked,'manual column is not locked');
   assert.equal(manual.x,6);assert.equal(manual.y,6);assert.equal(manual.b,.7);assert.equal(manual.d,.8);
   assert(!s.columns.some(q=>near(q.x,12)&&near(q.y,12)),'deleted automatic intersection repopulated');
  }
  const before=clone(p),axes=JSON.stringify(p.axes),records=JSON.stringify(t.suppressedColumns);
  apply(p,out.result,'F1',out.report.schemes[0],out.report);
  assert.equal(JSON.stringify(p.axes),axes,'architectural axes changed');assert.equal(JSON.stringify(p.types.F1.suppressedColumns),records);
  const saved=model(p),manual=saved.models.F1.columns.find(q=>q.id==='MANUAL');assert(manual);assert.deepEqual(section(manual),{x:6,y:6,w:.7,d:.8});
  verifyPhysical(p,'F1',saved.models.F1.columns.filter(q=>q.status!=='上层柱'));
  const reopened=model(JSON.parse(JSON.stringify(p)));assert.deepEqual(clone(physical(reopened.models.F1)),clone(physical(saved.models.F1)));
  const restored=clone(before);assert.deepEqual(physical(model(restored).models.F1),physical(model(before).models.F1),'transaction snapshot cannot restore original arrangement');
  passed.push('Manual identity/section, suppression and original axes survive search/apply/reopen; pre-apply snapshot restores geometry');
 }
 {
  const p=fixture({spacing:{x:4,y:4}}),t=p.types.F1;t.opening={'1,1':true};t.noColumnZones=[{x0:0,x1:6,y0:10,y1:14},{x0:12,x1:14,y0:0,y1:8}];
  requireSchemes(search(p));
  for(const shape of ['L','triangle'])requireSchemes(search(fixture({shape,spacing:{x:4,y:4}})));
  passed.push('Full physical sections avoid Openings, exterior, exclusion zones, concave L corners and diagonal boundaries');
 }
 {
  const p=fixture({spacing:{x:4,y:4}});p.types.F1.walls=[{id:'W',a:{x:2,y:9},z:{x:16,y:9},b:300,on:true}];
  const out=requireSchemes(search(p));
  for(const s of out.report.schemes)for(const col of s.columns)assert(areaOverlap(section(col),{x0:2,x1:16,y0:8.85,y1:9.15})<1e-9,'new section overlaps a wall footprint');
  passed.push('Proposed sections avoid actual wall footprints, including off-grid candidate rows');
 }
 {
  for(const issue of ['spacing','exclusion','outside','far-outside','wall']){
   const p=fixture({spacing:{x:6,y:6}}),t=p.types.F1;t.mode='manual';t.columns=[{id:'LOCK1',x:6,y:6,b:500,d:500,on:true,status:'上下贯通'}];
   if(issue==='spacing')t.columns.push({id:'LOCK2',x:7,y:6,b:500,d:500,on:true,status:'上下贯通'});
   if(issue==='exclusion')t.noColumnZones=[{x0:5,x1:7,y0:5,y1:7}];
   if(issue==='outside')t.columns[0].x=.1;
   if(issue==='far-outside')t.columns[0].x=20;
   if(issue==='wall')t.walls=[{id:'W',a:{x:2,y:6},z:{x:10,y:6},b:300,on:true}];
   const out=search(p);assert.equal(out.report.schemes.length,0,'conflicting locked input silently moved/dropped: '+issue);assert(out.report.messages.length,'missing conflict reason: '+issue);
  }
  passed.push('Conflicting locked spacing, exclusion/exterior and walls stay unchanged; model-filtered manual columns remain explicit errors');
 }
 for(const removePath of ['member','batch']){
  const p=fixture(),out=requireSchemes(search(p)),scheme=out.report.schemes.find(s=>s.columns.some(q=>!q.existingKey));assert(scheme,'fixture needs a proposal with new columns');apply(p,out.result,'F1',scheme,out.report);
  const result=model(p),target=result.models.F1.columns.find(q=>!scheme.columns.find(s=>s.existingKey&&near(s.x,section(q).x)&&near(s.y,section(q).y)));
  assert(target,'fixture has no new proposal column to delete');const removed=section(target);
  if(removePath==='member')c.run("Engine.removeMember(argument.p,'F1',{kind:'COL',id:argument.id,f:1})",{p,id:target.id});
  else c.run("FloorColumns101.removeMany(argument.p,argument.result,'F1',1,[{kind:'COL',id:argument.id,f:1}])",{p,result,id:target.id});
  assert(p.types.F1.columnSchemeDeleted319?.length,'physical deletion record not retained via '+removePath);
  const after=requireSchemes(search(p));
  for(const s of after.report.schemes)assert(!s.columns.some(q=>areaOverlap(section(q),{x0:removed.x-removed.w/2,x1:removed.x+removed.w/2,y0:removed.y-removed.d/2,y1:removed.y+removed.d/2})>1e-9),'manually deleted proposal column regenerated');
  passed.push('A newly proposed column removed by the '+removePath+' delete path retains its physical deletion record and remains deleted');
 }
 {
  const p=fixture({levels:3,spacing:{x:4,y:4}}),neutral=requireSchemes(search(p,'F2',{targetX:7,targetY:7}));
  assert(neutral.report.schemes.length>=2,'alignment fixture needs distinct layouts');const chosen=neutral.report.schemes.at(-1);
  for(const k of ['F1','F3']){p.types[k].mode='manual';p.types[k].columns=chosen.columns.map((q,i)=>({id:k+'C'+i,x:q.x,y:q.y,b:q.b*1000,d:q.d*1000,on:true,status:'上下贯通'}));}
  const ranked=requireSchemes(search(p,'F2',{targetX:7,targetY:7}));
  assert(ranked.report.schemes.some(q=>q.metrics.unalignedAbove===0&&q.metrics.unalignedBelow===0),'aligned candidate was not considered');
  if(ranked.report.schemes[0].metrics.unalignedAbove+ranked.report.schemes[0].metrics.unalignedBelow!==0)failures.push('ranking prefers an unnecessary unmatched column above a completely aligned candidate');
  if(!failures.length)passed.push('Ranking considers both upper and lower column alignment rather than optimizing each Framing in isolation');
 }
 {
  const p=fixture({levels:3,spacing:{x:4,y:4}});p.total=4;p.groups[1].end=3;
  p.types.F2.axes=clone(p.axes);p.types.F2.axes.origin={x:2,y:1};
  const other=JSON.stringify([p.types.F1,p.types.F3,p.axes,p.defaults,p.groups]),out=requireSchemes(search(p,'F2'));
  assert.equal(out.report.affectedFloors.length,2);apply(p,out.result,'F2',out.report.schemes[0],out.report);
  assert.equal(JSON.stringify([p.types.F1,p.types.F3,p.axes,p.defaults,p.groups]),other);
  const result=model(p),shared=c.run('Engine.floorModel(argument,2).columns',result),sharedAgain=c.run('Engine.floorModel(argument,3).columns',result);assert.deepEqual(clone(shared),clone(sharedAgain));
  passed.push('Owned-axis origins and shared floors work, while all other Framing/global settings are preserved');
 }
 for(const mode of ['manual','auto']){
  const p=fixture({spacing:{x:4,y:4}}),t=p.types.F1;t.mode=mode;t.columns=[{id:'MANUAL',x:6,y:6,b:700,d:800,on:true,status:'上下贯通',autoAdded:true},{id:'UPPER',x:9,y:9,b:600,d:700,on:true,status:'上层柱',autoAdded:true}];
  const original=c.run("Engine.model(Engine.clone(argument),'F1').columns.filter(q=>q.status==='上层柱')",p),out=requireSchemes(search(p)),scheme=out.report.schemes.find(q=>q.columns.some(v=>!v.existingKey));assert(scheme,'reference fixture needs added columns');
  apply(p,out.result,'F1',scheme,out.report);
  assert.equal(p.types.F1.mode,mode,'apply changed the legacy placement mode');
  const after=c.run("Engine.model(Engine.clone(argument),'F1').columns.filter(q=>q.status==='上层柱')",p);assert.deepEqual(clone(after),clone(original),'upper reference column lost/duplicated/changed');
  const reloaded=JSON.parse(JSON.stringify(p));c.run('Engine.validate(argument)',reloaded);
  assert.deepEqual(clone(c.run("Engine.model(argument,'F1').columns",reloaded)),clone(c.run("Engine.model(Engine.clone(argument),'F1').columns",p)),'save/load altered applied/reference columns');
  passed.push(mode+' placement mode, upper reference columns and serialized reopening remain intact after apply');
 }
 {
  const p=fixture(),out=search(p,'F1',{maxCandidates:1});assert(out.report.limited,'bounded search did not report its limit');
  assert(!out.report.messages.some(x=>/無解|无解|infeasible/i.test(typeof x==='string'?x:JSON.stringify(x))),'bounded search claims proven infeasibility');
  const valid=requireSchemes(search(p));p.name+=' edited';const before=JSON.stringify(p);assert.throws(()=>apply(p,valid.result,'F1',valid.report.schemes[0],valid.report));assert.equal(JSON.stringify(p),before,'stale apply partially mutated project');
  passed.push('Limited search stays explicitly incomplete; stale proposals reject atomically');
 }
 {
  const p=fixture({spacing:{x:4,y:4}}),out=requireSchemes(search(p,'F1',{targetX:5,targetY:5,maxX:6,maxY:6,keepAll:true}));
  const original=physical(model(p).models.F1);
  assert.equal(out.report.lockedCount,original.length);
  for(const s of out.report.schemes){assert(s.metrics.maxX<=6+1e-6&&s.metrics.maxY<=6+1e-6);for(const q of original)assert(s.columns.some(z=>z.id===q.id&&near(z.x,q.x)&&near(z.y,q.y)),'keepAll moved/dropped an existing column');}
  for(const options of [{targetX:0},{targetY:3},{maxX:2},{maxY:-1}])assert.throws(()=>search(p,'F1',options),'invalid target/maximum spacing accepted');
  passed.push('Keep-all protection and maximum row/column spacing are enforced; impossible numeric settings reject clearly');
 }
 if(process.argv[2]){
  const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,'')),key='F03',original=model(p).models[key].columns.filter(q=>q.status!=='上层柱'),out=requireSchemes(search(p,key));
  assert.equal(out.report.lockedCount,original.length,'current model beam-connected columns must be fixed');
  assert(out.report.schemes.some(s=>s.columns.length===original.length),'completed current model lacks a preserve-current option');
  const saved=JSON.stringify(p),protectedInputs=JSON.stringify(p.explorer),otherTypes=JSON.stringify(Object.entries(p.types).filter(([k])=>k!==key)),applied=[];
  for(const scheme of out.report.schemes){const trial=clone(p);try{
    apply(trial,out.result,key,scheme,out.report);assert.equal(JSON.stringify(p),saved);assert.equal(JSON.stringify(trial.explorer),protectedInputs);assert.equal(JSON.stringify(Object.entries(trial.types).filter(([k])=>k!==key)),otherTypes);
    const original=out.result.models[key].beams,next=model(trial).models[key].beams;
    for(const b of original){const n=next.find(v=>v.id===b.id);assert(n,'existing beam removed');assert.deepEqual(clone([n.a,n.z,n.b,n.d]),clone([b.a,b.z,b.b,b.d]),'existing beam geometry/section changed');}
    applied.push({id:scheme.id,applied:true});
   }catch(error){assert.equal(JSON.stringify(trial),saved,'rejected current-model proposal partially applied');assert.match(error.message,/既有梁.*會改變|實際生成|固定柱/);applied.push({id:scheme.id,applied:false,reason:error.message});}
  }
  console.log(JSON.stringify({currentModel:p.name,key,locked:out.report.lockedCount,proposals:out.report.schemes.map(s=>({label:s.label,...s.metrics})),trialApplications:applied},null,2));
  passed.push('Current HKIE model: all connected columns fixed, preservation alternative offered, trial applications preserve existing beams or reject atomically');
 }
 console.log(passed.map(s=>'PASS '+s).join('\n'));
 assert.deepEqual(failures,[]);
}
