// Offline E2.330 layout/diagnostic regressions. Synthetic inputs only unless an
// optional model filename is supplied; search/apply always use isolated copies.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context}=require('./audit-performance247.cjs');
const {fixture,verifyPhysical}=require('./column-schemes319.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6;
const position=q=>({x:q.cx??q.x,y:q.cy??q.y,b:q.b,d:q.d});
function wideFixture({levels=3,nx=6,ny=4,spacing={x:6,y:6}}={}){
 const p=fixture({levels,spacing});
 p.name='Synthetic alignment and transfer alternatives';
 p.axes={x:Array.from({length:nx+1},(_,i)=>({id:String(i+1),gap:i?6:0})),y:Array.from({length:ny+1},(_,i)=>({id:String.fromCharCode(65+i),gap:i?6:0}))};
 for(const t of Object.values(p.types)){t.mode='manual';t.building=Object.fromEntries(Array.from({length:nx*ny},(_,i)=>[Math.floor(i/ny)+','+i%ny,true]));}
 return p;
}
function inputColumn(id,x,y,b=500,d=500){return {id,x,y,b,d,on:true,status:'上下贯通'};}
function sparseFixture(){
 const p=wideFixture(),xs=[.25,6,12,18,24,30,35.75],ys=[.25,6,12,18,23.75];
 for(const key of ['F1','F3'])p.types[key].columns=xs.flatMap((x,i)=>ys.flatMap((y,j)=>i===0||i===xs.length-1||j===0||j===ys.length-1?[inputColumn(key+'_'+i+'_'+j,x,y)]:[]));
 return p;
}
function supportFixture(){
 const p=wideFixture({levels:2,nx:8,ny:3,spacing:{}});
 p.types.F1.columns=[inputColumn('DIRECT',6,6),inputColumn('OFFSET',12.1,6,1000,1000),inputColumn('SMALL',30,6,300,300),inputColumn('AMB_A',41.9,6,1000,1000),inputColumn('AMB_B',42.1,6,1000,1000)];
 p.types.F1.walls=[{id:'LOW_WALL',a:{x:18,y:3},z:{x:18,y:9},b:900,on:true,axisPosition:'center'}];
 p.types.F1.beams=[{id:'LOW_TB',kind:'TB',a:{x:21,y:6},z:{x:27,y:6},b:1000,d:1500,on:true,widthMode:'manual',positionMode175:'fixed',fixedA175:[21,6],fixedZ175:[27,6]}];
 p.types.F2.columns=[6,12,18,24,30,36,42].map(x=>inputColumn('TOP_'+x,x,6));
 return p;
}
module.exports={wideFixture,sparseFixture,supportFixture};
if(require.main===module){
 const c=context(),passed=[],timings=[];
 const generate=p=>c.run('Engine.generate(Engine.clone(argument))',p);
 const apply=(p,key,scheme,out)=>c.run('ColumnSchemes319.apply(argument.p,argument.result,argument.key,argument.scheme,argument.report)',{p,key,scheme,result:out.result,report:out.report});
 const supports=(p,result,key,columns)=>c.run('ColumnSchemes319.support330(argument.p,argument.result,argument.key,argument.columns)',{p,result,key,columns});
 const signature=cols=>cols.map(q=>{const r=position(q);return [r.x,r.y,r.b,r.d].map(v=>Number(v.toFixed(6))).join(',');}).sort().join(';');
 const search=(p,key='F2',options={})=>{
  const before=JSON.stringify(p),result=generate(p),derived=JSON.stringify(result),start=performance.now();
  const report=c.run('ColumnSchemes319.search(argument.p,argument.result,argument.key,argument.options)',{p,result,key,options});
  timings.push({key,ms:Math.round(performance.now()-start)});
  assert.equal(JSON.stringify(p),before,'search changes input project');assert.equal(JSON.stringify(result),derived,'search changes supplied results');
  assert(report.schemes.length<=4,'more than four alternatives');assert.equal(report.stamp,before);
  assert.equal(new Set(report.schemes.map(s=>signature(s.columns))).size,report.schemes.length,'duplicate physical layouts shown');
  assert.equal(new Set(report.schemes.map(s=>s.family)).size,report.schemes.length,'same strategy family occupies multiple cards');
  for(const s of report.schemes){
   verifyPhysical(p,key,s.columns);assert.equal(s.metrics.count,s.columns.length);
   assert(Array.isArray(s.support330),'support diagnostics missing');
   assert.equal(s.support330.length,s.columns.length*report.affectedFloors.length,'a shared occurrence has been omitted/double counted');
   for(const f of report.affectedFloors)for(const col of s.columns)assert.equal(s.support330.filter(row=>row.at===f&&near(row.x,col.x)&&near(row.y,col.y)).length,1,'support diagnostic does not identify exactly one column/floor');
  }
  return {report,result};
 };
 const balanced=out=>{const s=out.report.schemes.find(s=>s.family==='balanced330');assert(s,'coverage/transfer family was lost: '+JSON.stringify(out.report.messages));return s;};
 const pass=s=>{passed.push(s);console.log('PASS '+s);};
 {
  const p=sparseFixture(),out=search(p),s=balanced(out),aligned=out.report.schemes.find(q=>['只補上下層對齊','reuse336','adjacent340'].includes(q.family));
  assert(aligned,'pure alignment comparison missing');
  assert(s.columns.filter(q=>q.x>6&&q.x<30&&q.y>6&&q.y<18).length>=1,'large central region is still empty');
  assert(s.metrics.maxReach<aligned.metrics.maxReach-1,'interior infill does not materially improve coverage');
  assert(s.support330.some(q=>q.kind==='transfer'),'interior columns need explicit transfer review');
  assert(s.support330.some(q=>q.kind==='column'),'feasible lower alignment was not retained');
  assert.deepEqual(clone(search(p).report.schemes),clone(out.report.schemes),'offline candidate generation is not deterministic');
  pass('Balanced candidate retains feasible alignment, fills a wide empty interior, and survives ranking despite new transfer-review points');
 }
 {
  const p=fixture({spacing:{x:5,y:5}}),t=p.types.F1,values=[.25,6.083333,11.916667,17.75];t.mode='manual';
  t.columns=values.flatMap((x,i)=>values.map((y,j)=>inputColumn('FIXED_'+i+'_'+j,x,y)));
  const before=JSON.stringify(p),out=search(p,'F1'),existing=out.report.schemes.find(q=>q.unchanged);
  assert.equal(out.report.lockedCount,16,'dense manual layout lost protection');
  assert(existing,'unchanged dense layout lacks a preserve-current card');
  assert.equal(existing.family,'existing');assert.equal(existing.columns.length,16);
  assert(!out.report.schemes.some(q=>q.family==='balanced330'&&signature(q.columns)===signature(existing.columns)),'unchanged layout is offered as an enabled balanced action');
  const noOp=apply(p,'F1',existing,out);assert.equal(noOp.added,0);assert.equal(JSON.stringify(p),before,'preserve-current action changes model metadata');
  pass('Dense protected layout retains its unchanged baseline instead of an enabled balanced action with zero additions');
 }
 {
  const p=supportFixture(),result=generate(p),cols=result.models.F2.columns.filter(q=>q.status!=='上层柱').map(position),before=JSON.stringify(p),derived=JSON.stringify(result),rows=supports(p,result,'F2',cols);
  const expected=new Map([[6,'column'],[12,'offset-column'],[18,'wall'],[24,'beam'],[30,'column'],[36,'transfer'],[42,'ambiguous']]);
  for(const [x,kind]of expected){const row=rows.find(q=>near(q.x,x)&&q.at===2);assert(row,'missing support point '+x);assert.equal(row.kind,kind,'wrong lower support class at '+x);assert.equal(row.below,1);}
  // "column" means centre alignment only. A smaller lower section must not
  // acquire a fabricated capacity/bearing approval or alter either section.
  assert.equal(p.types.F1.columns.find(q=>q.id==='SMALL').b,300);
  assert(!rows.some(q=>q.capacityPassed||q.rcPassed||q.bearingPassed),'layout diagnostic claims a capacity check');
  assert.equal(JSON.stringify(p),before);assert.equal(JSON.stringify(result),derived);
  const base=supports(p,result,'F1',result.models.F1.columns.map(position));assert(base.every(q=>q.kind==='base'&&q.below===0));
  pass('Distinct centre alignment, eccentric footprint, wall, TB, unsupported and ambiguous landings are classified without capacity claims or input mutation');
 }
 {
  const p=wideFixture({levels:2}),r=generate(p),point={x:12,y:12,b:.5,d:.5};
  assert.equal(supports(p,r,'F2',[point])[0].kind,'missing','an empty lower layout must be reported as incomplete');
  // An unrelated isolated support cannot make a missing landing look connected.
  p.types.F1.columns=[inputColumn('REMOTE',6,6)];const partial=generate(p);
  assert.equal(supports(p,partial,'F2',[point])[0].kind,'transfer');
  pass('Empty lower Framing remains explicitly incomplete; a modeled but unsupported interior requires transfer review');
 }
 {
  const p=supportFixture();p.types.F1.beams.push({id:'CROSS_TB',kind:'TB',a:{x:24,y:3},z:{x:24,y:9},b:1000,d:1500,on:true,widthMode:'manual',positionMode175:'fixed',fixedA175:[24,3],fixedZ175:[24,9]});
  const result=generate(p),columns=[{x:24,y:6,b:.5,d:.5},{x:12.7,y:6,b:.5,d:.5},{x:18,y:10,b:.5,d:.5},{x:24,y:6.6,b:.5,d:.5}],rows=supports(p,result,'F2',columns);
  assert.equal(rows[0].kind,'ambiguous','crossing beam landings were arbitrarily resolved');
  assert.equal(rows[1].kind,'transfer','nearby lower column was treated as centre-bearing');
  assert.equal(rows[2].kind,'transfer','a finite wall was extended beyond its end');
  assert.equal(rows[3].kind,'beam','a unique physical beam landing was lost');
  pass('Crossing beams remain ambiguous; column proximity and finite wall extensions never create a false landing');
 }
 {
  const p=wideFixture({levels:2}),result=generate(p),wall={id:'DIAGONAL_WALL',a:[2,2],z:[14,14],b:.5,diagonal315:true};
  // Supply a physical lower wall directly to isolate landing geometry from
  // input-layer wall creation rules. The off-diagonal point is inside its bbox.
  result.floorModels[1]={...result.models.F1,key:'F1',columns:[],beams:[],walls:[wall]};
  const columns=[{x:8,y:8,b:.5,d:.5},{x:3,y:13,b:.5,d:.5},{x:8,y:8.2,b:.5,d:.5},{x:15,y:15,b:.5,d:.5}],before=JSON.stringify(result),rows=supports(p,result,'F2',columns);
  assert.deepEqual(clone(rows.map(q=>q.kind)),['wall','transfer','wall','transfer'],'diagonal-wall landing uses its bounding box or infinite extension');
  assert.equal(JSON.stringify(result),before);
  pass('Diagonal lower-wall landings use the finite physical strip, excluding bounding-box corners and end extensions');
 }
 {
  const p=supportFixture();p.total=3;p.groups[1].end='顶层';const out=search(p),s=out.report.schemes.find(s=>s.family==='balanced330')||out.report.schemes.find(s=>s.unchanged);assert(s,'shared protected layout must remain available even when no extra supported position exists');
  assert.deepEqual(clone(out.report.affectedFloors),[2,3]);
  assert(s.support330.filter(q=>q.at===2).some(q=>q.kind==='transfer'),'first occurrence lost its real lower support gap');
  assert(s.support330.filter(q=>q.at===3).every(q=>q.kind==='shared'&&q.below===2),'shared next floor was classified against unrelated lower Framing');
  const trial=clone(p),protectedInputs=JSON.stringify([p.types.F1,p.axes,p.defaults,p.groups]);apply(trial,'F2',s,out);
  assert.equal(JSON.stringify([trial.types.F1,trial.axes,trial.defaults,trial.groups]),protectedInputs);
  const reopened=generate(clone(trial));
  for(const f of [2,3])assert.equal(signature(c.run('Engine.floorModel(argument.r,argument.f).columns.filter(q=>q.status!=="上层柱")',{r:reopened,f})),signature(s.columns));
  pass('Every occurrence of shared Framing receives its own support diagnostics; apply/reopen preserves identical physical columns on both floors');
 }
 {
  const p=sparseFixture(),t=p.types.F2;t.columns=[{...inputColumn('KEEP',12,12,700,800),transferColumn:true},{...inputColumn('DELETED',18,12),on:false}];t.suppressedColumns=[{ax:'3',ay:'B'}];
  p.explorer={members:{'1|COL|6,6':{sectionAAreaMode:'manual',sectionAArea:42}},selected:{},reportA:{},reportB:{}};
  const original=clone(p),out=search(p),s=balanced(out),source=JSON.stringify(p),other=JSON.stringify([p.types.F1,p.types.F3,p.axes,p.defaults,p.groups,p.explorer]);
  assert(s.columns.some(q=>q.id==='KEEP'&&q.locked&&near(q.b,.7)&&near(q.d,.8)));
  assert(!s.columns.some(q=>near(q.x,18)&&near(q.y,12)),'disabled manual column repopulated');
  const trial=clone(p);apply(trial,'F2',s,out);
  assert.equal(JSON.stringify(p),source);assert.equal(JSON.stringify([trial.types.F1,trial.types.F3,trial.axes,trial.defaults,trial.groups,trial.explorer]),other);
  assert.deepEqual(clone(trial.types.F2.suppressedColumns),[],'E2.338 explicit apply clears obsolete grid deletion records');
  assert.deepEqual(clone(trial.types.F2.transferColumns||[]),t.transferColumns||[],'proposal inferred manual Transfer overrides');
  assert(trial.types.F2.columns.find(q=>q.id==='KEEP').transferColumn,'explicit manual Transfer mark lost');
  assert(!trial.types.F2.columns.some(q=>q.id!=='KEEP'&&(q.transferManual||q.transferColumn)),'proposal wrote a guessed manual transfer flag');
  const reopened=generate(clone(trial));assert.equal(signature(reopened.models.F2.columns.filter(q=>q.status!=='上层柱')),signature(s.columns));
  assert.equal(JSON.stringify(original),source,'undo snapshot changed');
  pass('Manual geometry, disabled columns, other Framing and load/report inputs survive apply/reopen; obsolete deletion records clear only on apply');
 }
 {
  const p=sparseFixture(),out=search(p),s=balanced(out),trial=clone(p);apply(trial,'F2',s,out);
  const result=generate(trial),target=result.models.F2.columns.find(q=>q.scheme319);assert(target);
  const removed=position(target);c.run('FloorColumns101.removeMany(argument.p,argument.r,"F2",2,[{kind:"COL",id:argument.id,f:2}])',{p:trial,r:result,id:target.id});
  assert(trial.types.F2.columnSchemeDeleted319?.length,'applied proposal deletion was not recorded');
  const again=search(trial);assert(again.report.schemes.some(next=>next.columns.some(q=>near(q.x,removed.x)&&near(q.y,removed.y))),'explicit new search should allow reusing the deleted position');
  pass('E2.338 deletion remains in the model until an explicit new proposal is applied; subsequent proposals may reuse that centre');
 }
 {
  for(const shape of ['L','triangle','opening','disjoint','exclusion','wall']){
   const p=fixture({spacing:{x:4,y:4},shape:['L','triangle'].includes(shape)?shape:'rect'}),t=p.types.F1;t.mode='manual';
   if(shape==='opening')t.opening={'1,1':true};
   if(shape==='disjoint')t.building={'0,0':true,'2,2':true};
   if(shape==='exclusion')t.noColumnZones=[{x0:4,x1:8,y0:4,y1:14}];
   if(shape==='wall')t.walls=[{id:'OBSTACLE',a:{x:2,y:9},z:{x:16,y:9},b:700,on:true,axisPosition:'center'}];
   const out=search(p,'F1'),s=balanced(out);assert(s.columns.length>0,shape+' has no proposal');
   if(shape==='disjoint'){assert(s.columns.some(q=>q.x<6&&q.y<6),'first detached piece omitted');assert(s.columns.some(q=>q.x>12&&q.y>12),'second detached piece omitted');}
   const walls=out.result.models.F1.walls;
   for(const q of s.columns)assert(!c.run('Engine.columnWallClearance329({x:argument.q.x,y:argument.q.y,w:argument.q.b,d:argument.q.d},argument.walls)',{q,walls}),'new balanced column crowds a wall side/end');
   const copy=clone(p);apply(copy,'F1',s,out);const reopened=generate(clone(copy));verifyPhysical(copy,'F1',reopened.models.F1.columns.filter(q=>q.status!=='上层柱'));
  }
  pass('Balanced infill respects full sections at L corners, triangular edges, holes, detached floor pieces, no-column areas and finite wall ends');
 }
 {
  const p=sparseFixture(),limited=search(p,'F2',{maxCandidates:1});assert(limited.report.limited,'candidate budget ignored');
  assert(!limited.report.messages.some(q=>/已證明無解|proven infeasible/i.test(q)&&!q.includes('並非')),'limited search claims infeasibility');
  const out=search(p),s=balanced(out);p.name+=' changed';const before=JSON.stringify(p);
  assert.throws(()=>apply(p,'F2',s,out),/模型已改變/);assert.equal(JSON.stringify(p),before);
  pass('Bounded search stays explicitly incomplete; stale proposal application is rejected atomically');
 }
 if(process.argv[2]){
  const file=path.resolve(process.argv[2]),bytes=fs.readFileSync(file),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),key='F03',before=JSON.stringify(p),out=search(p,key),s=balanced(out),other=JSON.stringify([Object.fromEntries(Object.entries(p.types).filter(([k])=>k!==key)),p.axes,p.defaults,p.groups,p.explorer]);
  const aligned=out.report.schemes.find(q=>['只補上下層對齊','reuse336'].includes(q.family));if(aligned)assert(s.metrics.maxReach<aligned.metrics.maxReach,'current empty interior not improved');
  assert(s.support330.some(q=>['transfer','missing','offset-column','wall','beam','ambiguous'].includes(q.kind)),'current transfer candidate has no visible support review');
  const trial=clone(p);apply(trial,key,s,out);assert.equal(JSON.stringify([Object.fromEntries(Object.entries(trial.types).filter(([k])=>k!==key)),trial.axes,trial.defaults,trial.groups,trial.explorer]),other);
  const reopened=generate(clone(trial));assert.equal(signature(reopened.models[key].columns.filter(q=>q.status!=='上层柱')),signature(s.columns));
  assert.deepEqual(clone(trial.types[key].transferColumns||[]),p.types[key].transferColumns||[]);assert.equal(JSON.stringify(p),before);assert.deepEqual(fs.readFileSync(file),bytes);
  console.log(JSON.stringify({currentModel:p.name,key,schemes:out.report.schemes.map(q=>({family:q.family,label:q.label,...q.metrics,supportKinds:q.support330.reduce((a,r)=>(a[r.kind]=(a[r.kind]||0)+1,a),{})})),sourceUnchanged:true},null,2));
  pass('Optional current model: balanced layout improves interior coverage, applies/reopens identically and preserves original file and unrelated settings');
 }
 console.log(JSON.stringify({passed,timings},null,2));
}
