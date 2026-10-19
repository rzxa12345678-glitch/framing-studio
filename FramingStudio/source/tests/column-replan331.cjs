// E2.331 offline replan transactions and layout-quality regressions. The optional
// exported model is read-only; no test changes the user's app/browser or source file.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./audit-performance247.cjs');
const {fixture,verifyPhysical}=require('./column-schemes319.cjs');
const {wideFixture,sparseFixture}=require('./column-transfer330.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6;
const position=q=>({x:q.cx??q.x,y:q.cy??q.y,b:q.b,d:q.d});
const signature=cols=>cols.map(q=>{const r=position(q);return [r.x,r.y,r.b,r.d].map(v=>Number(v.toFixed(6))).join(',');}).sort().join(';');
const overlaps=(a,b)=>Math.abs(a.x-b.x)<(a.b+(b.w??b.b))/2-1e-7&&Math.abs(a.y-b.y)<(a.d+b.d)/2-1e-7;
const inputColumn=(id,x,y,b=500,d=500)=>({id,x,y,b,d,on:true,status:'上下贯通'});
if(require.main===module){
 const c=context(),passed=[],timings=[];
 if(!c.run("typeof ColumnSchemes319!=='undefined'"))vm.runInContext(fs.readFileSync(path.join(__dirname,'../column-schemes319.js'),'utf8'),c.ctx,{filename:'column-schemes319.js'});
 const generate=p=>c.run('Engine.generate(Engine.clone(argument))',p);
 const deletion=p=>c.run('ColumnSchemes319.deletionInfo331(argument.p,argument.key)',p);
 const search=(p,key='F1',options={})=>{
  const before=JSON.stringify(p),result=generate(p),derived=JSON.stringify(result),start=performance.now();
  const report=c.run('ColumnSchemes319.search(argument.p,argument.result,argument.key,argument.options)',{p,result,key,options});
  assert.equal(JSON.stringify(p),before,'preview changed project');assert.equal(JSON.stringify(result),derived,'preview changed supplied results');
  assert.equal(report.stamp,before);assert(report.schemes.length<=4);assert.equal(new Set(report.schemes.map(q=>signature(q.columns))).size,report.schemes.length,'duplicate physical alternatives');
  for(const s of report.schemes){verifyPhysical(p,key,s.columns);assert.equal(s.metrics.count,s.columns.length);assert.equal(s.support330.length,s.columns.length*report.affectedFloors.length);}
  timings.push({key,reset:!!options.resetDeleted331,ms:Math.round(performance.now()-start)});return {report,result};
 };
 const apply=(p,key,s,out,confirmation={})=>c.run('ColumnSchemes319.apply(argument.p,argument.result,argument.key,argument.scheme,argument.report,argument.confirmation)',{p,key,scheme:s,result:out.result,report:out.report,confirmation});
 const choose=out=>{const s=out.report.schemes.find(q=>!q.unchanged);assert(s,'no applicable alternative: '+JSON.stringify(out.report.messages));return s;};
 const pass=s=>{passed.push(s);console.log('PASS '+s);};
 let deletedModel,originalPlan;
 {
  const p=fixture({spacing:{}}),corner=generate(p).models.F1.columns.find(q=>q.anchorX==='1'&&q.anchorY==='A'),r=position(corner);
  assert(!near(r.x,0)&&!near(r.y,0),'boundary fixture needs its actual inward column centre');
  p.types.F1.columnSchemeDeleted319=[{x:r.x,y:r.y,w:r.b,d:r.d}];p.types.F1.suppressedColumns=[{ax:'1',ay:'A'}];
  const before=JSON.stringify(p),info=deletion({p,key:'F1'});assert.equal(info.resettableCount,1,'physical and grid deletion records double-count the same boundary column');assert.equal(JSON.stringify(p),before);
  pass('Deletion summary deduplicates actual inward boundary-column footprints and grid suppression without mutating inputs');
 }
 {
  const p=fixture({levels:2,spacing:{x:5,y:5}});for(const t of Object.values(p.types))t.mode='manual';
  const initial=search(p),s=choose(initial);assert(s.columns.length>=8,'fixture lacks a useful regular column grid');apply(p,'F1',s,initial);
  const result=generate(p),members=result.models.F1.columns.filter(q=>q.status!=='上层柱');originalPlan=clone(members.map(position));
  c.run('FloorColumns101.removeMany(argument.p,argument.r,"F1",1,argument.members.map(q=>({kind:"COL",id:q.id,f:1})))',{p,r:result,members});
  assert.equal(generate(p).models.F1.columns.filter(q=>q.status!=='上层柱').length,0);assert(p.types.F1.columnSchemeDeleted319.length>=8);
  deletedModel=clone(p);const before=JSON.stringify(p),normal=search(p),reset=search(p,'F1',{resetDeleted331:true});
  assert.deepEqual(clone(normal.report.schemes),clone(reset.report.schemes),'normal and legacy-reset previews must now agree');
  assert.equal(reset.report.resetDeleted331,true);assert(reset.report.deletion331.resettableCount>=8,'reset preview does not disclose its exclusions');
  assert(reset.report.schemes.some(q=>q.columns.filter(col=>originalPlan.some(old=>near(col.x,old.x)&&near(col.y,old.y))).length>=originalPlan.length/2),'reset cannot reconsider the deleted regular grid');
  assert.equal(JSON.stringify(p),before);assert.deepEqual(clone(search(p,'F1',{resetDeleted331:true}).report.schemes),clone(reset.report.schemes),'reset preview is not deterministic');
  pass('Ordinary preview can reconsider the original grid without changing inputs');
 }
 {
  const p=clone(deletedModel);p.types.F2.columnSchemeDeleted319=[{x:6,y:6,w:.5,d:.5}];p.types.F2.suppressedColumns=[{ax:'2',ay:'B'}];
  const out=search(p,'F1',{resetDeleted331:true}),s=choose(out),before=JSON.stringify(p),other=JSON.stringify([p.types.F2,p.axes,p.groups,p.defaults,p.explorer]);
  assert.equal(JSON.stringify(p),before,'preview modified project');
  const result=apply(p,'F1',s,out,{confirmReset331:true});assert(result.added>0);assert.equal(p.types.F1.columnSchemeDeleted319?.length||0,0);assert.equal(p.types.F1.suppressedColumns?.length||0,0);
  assert.equal(JSON.stringify([p.types.F2,p.axes,p.groups,p.defaults,p.explorer]),other,'reset cleared another Framing or shared settings');
  assert.equal(signature(generate(clone(p)).models.F1.columns.filter(q=>q.status!=='上层柱')),signature(s.columns));
  const restored=JSON.parse(before);assert.equal(JSON.stringify(restored),before);assert.deepEqual(clone(restored.types.F1.columnSchemeDeleted319),deletedModel.types.F1.columnSchemeDeleted319,'undo snapshot cannot recover exclusions');
  pass('Apply needs no extra reset confirmation, clears only the intended Framing records, and preserves reopen/undo geometry and exclusions');
 }
 {
  const p=wideFixture({levels:2,spacing:{x:5,y:5}}),t=p.types.F1;
  t.columns=[{...inputColumn('KEEP',12,12,700,800),transferColumn:true},{...inputColumn('DISABLED',18,12),on:false},{...inputColumn('OFF_SCHEME',24,12),on:false,scheme319:true}];
  t.columnSchemeDeleted319=[{x:6,y:6,w:.5,d:.5}];t.suppressedColumns=[{ax:'3',ay:'B'}];t.noColumnZones=[{x0:27,x1:31,y0:5,y1:13}];
  t.walls=[{id:'W_KEEP',a:{x:3,y:18},z:{x:9,y:18},b:300,on:true,axisPosition:'center'}];
  p.types.F2.columnSchemeDeleted319=[{x:10,y:10,w:.7,d:.8}];p.explorer={members:{'1|COL|12,12':{sectionAAreaMode:'manual',sectionAArea:42}},selected:{},reportA:{},reportB:{}};
  const protectedRows=clone(t.columns),protectedSettings=JSON.stringify([t.noColumnZones,t.walls,p.types.F2,p.explorer,p.axes,p.defaults,p.groups]),info=deletion({p,key:'F1'});assert(info.resettableCount>0);assert(info.retainedDisabledCount>=2);
  const out=search(p,'F1',{resetDeleted331:true}),s=choose(out);assert(s.columns.some(q=>q.id==='KEEP'&&q.locked));
  for(const col of s.columns)for(const off of protectedRows.filter(q=>!q.on))assert(!overlaps(col,{x:off.x,y:off.y,w:off.b/1000,d:off.d/1000}),'reset preview resurrected a disabled manual/scheme column');
  apply(p,'F1',s,out,{confirmReset331:true});
  assert.equal(JSON.stringify([p.types.F1.noColumnZones,p.types.F1.walls,p.types.F2,p.explorer,p.axes,p.defaults,p.groups]),protectedSettings);
  for(const original of protectedRows){const actual=p.types.F1.columns.find(q=>q.id===original.id);assert(actual,'protected record removed '+original.id);for(const field of ['x','y','b','d','on','transferColumn','scheme319'])assert.equal(actual[field],original[field],original.id+'/'+field);}
  assert.equal(p.types.F1.columnSchemeDeleted319?.length||0,0);assert.equal(p.types.F1.suppressedColumns?.length||0,0);
  assert(!p.types.F1.columns.some(q=>q.id!=='KEEP'&&q.transferColumn),'reset guessed manual Transfer overrides');
  pass('Manual sections/Transfer marks, disabled manual and scheme records, no-column zones, walls and saved load/report inputs survive confirmed replan');
 }
 {
  const p=clone(deletedModel),out=search(p,'F1',{resetDeleted331:true}),s=choose(out);p.name+=' edited';const before=JSON.stringify(p);
  assert.throws(()=>apply(p,'F1',s,out,{confirmReset331:true}),/模型已改變/);assert.equal(JSON.stringify(p),before,'stale reset partially cleared exclusions');
  const fresh=clone(deletedModel),valid=search(fresh,'F1',{resetDeleted331:true}),bad=choose(valid);bad.columns[0]={...bad.columns[0],x:-100};const untouched=JSON.stringify(fresh);
  assert.throws(()=>apply(fresh,'F1',bad,valid,{confirmReset331:true}));assert.equal(JSON.stringify(fresh),untouched,'invalid candidate partially cleared exclusions or changed columns');
  pass('Stale input and independently invalid geometry reject the complete reset transaction atomically');
 }
 {
  const p=fixture({spacing:{x:5,y:5}});p.types.F1.mode='manual';const out=search(p),s=choose(out),cols=s.columns;
  assert(cols.length>=8);for(const col of cols){assert(cols.some(q=>near(q.x,18-col.x)&&near(q.y,col.y)),'symmetric floor has an unexplained X-mirror gap');assert(cols.some(q=>near(q.x,col.x)&&near(q.y,18-col.y)),'symmetric floor has an unexplained Y-mirror gap');}
  const xs=[...new Set(cols.map(q=>q.x.toFixed(6)))],ys=[...new Set(cols.map(q=>q.y.toFixed(6)))];assert.equal(cols.length,xs.length*ys.length,'unconstrained regular floor has broken rows/columns');
  const bestReach=Math.min(...out.report.schemes.map(q=>q.metrics.maxReach));assert(s.metrics.maxReach<=bestReach+1e-6,'poor sparse layout ranked above better ground-floor coverage');
  pass('Unconstrained symmetric floor yields coherent complete rows and mirror symmetry, with useful coverage ranked ahead of sparse alternatives');
 }
 {
  for(const shape of ['L','triangle','asymmetric-opening']){
   const p=fixture({spacing:{x:4,y:4},shape:shape==='asymmetric-opening'?'rect':shape}),t=p.types.F1;t.mode='manual';
   if(shape==='asymmetric-opening'){t.opening={'0,1':true};t.noColumnZones=[{x0:8,x1:11,y0:8,y1:15}];t.walls=[{id:'OFF_CENTRE',a:{x:12,y:3},z:{x:16,y:3},b:500,on:true,axisPosition:'center'}];}
   t.columnSchemeDeleted319=[{x:15,y:15,w:.5,d:.5}];const out=search(p,'F1',{resetDeleted331:true}),s=choose(out);verifyPhysical(p,'F1',s.columns);
   const copy=clone(p);apply(copy,'F1',s,out,{confirmReset331:true});const actual=generate(clone(copy)).models.F1.columns.filter(q=>q.status!=='上层柱');verifyPhysical(copy,'F1',actual);assert.equal(signature(actual),signature(s.columns));
  }
  pass('Replan remains valid on asymmetric openings, exclusion zones, L-shaped and diagonal floors without forcing false symmetry');
 }
 {
  const p=sparseFixture(),out=search(p,'F2'),s=choose(out),pure=out.report.schemes.find(q=>q.family==='只補上下層對齊');assert(s.columns.some(q=>q.x>6&&q.x<30&&q.y>6&&q.y<18),'first useful scheme leaves wide interior empty');
  if(pure)assert(s.metrics.maxReach<pure.metrics.maxReach,'uncovered pure-alignment layout displaced useful coverage');
  assert(s.support330.some(q=>q.kind==='transfer'),'quality ranking hides transfer-review obligations');
  pass('Coverage-aware ranking does not promote an almost empty aligned layout; added transfer obligations remain explicit');
 }
 if(process.argv[2]){
  const file=path.resolve(process.argv[2]),bytes=fs.readFileSync(file),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),before=JSON.stringify(p),key='F01';
  assert(p.types[key].columnSchemeDeleted319?.length,'optional diagnostic model needs deleted G/F positions');
  const normal=search(p,key),reset=search(p,key,{resetDeleted331:true}),s=choose(reset);assert.equal(normal.report.resetDeleted331,true);assert.equal(reset.report.resetDeleted331,true);
  assert.deepEqual(clone(normal.report.schemes),clone(reset.report.schemes));
  const normalFirst=choose(normal);for(const axis of ['x','y']){const lines=[...new Set(normalFirst.columns.map(q=>Number(q[axis].toFixed(6))))].sort((a,b)=>a-b);for(let i=1;i<lines.length;i++)assert(lines[i]-lines[i-1]>=1-1e-6,'current G/F has sub-metre row/column jogs instead of moving the whole row coherently');}
  assert.deepEqual(clone(choose(normal).columns),clone(s.columns));
  assert.equal(reset.report.deletion331.resettableCount,p.types[key].columnSchemeDeleted319.length,'current reset exclusions count is wrong');
  const trial=clone(p),other=JSON.stringify([Object.fromEntries(Object.entries(p.types).filter(([k])=>k!==key)),p.axes,p.groups,p.defaults,p.explorer]);apply(trial,key,s,reset,{confirmReset331:true});
  assert.equal(JSON.stringify([Object.fromEntries(Object.entries(trial.types).filter(([k])=>k!==key)),trial.axes,trial.groups,trial.defaults,trial.explorer]),other);assert.equal(trial.types[key].columnSchemeDeleted319?.length||0,0);assert.equal(signature(generate(clone(trial)).models[key].columns.filter(q=>q.status!=='上层柱')),signature(s.columns));
  const f03=search(p,'F03',{resetDeleted331:true}),upper=choose(f03);assert(upper.columns.some(q=>q.x>12&&q.x<40&&q.y>12&&q.y<22),'current F03 replan leaves the interior empty');const upperTrial=clone(p);apply(upperTrial,'F03',upper,f03,{confirmReset331:true});assert.equal(signature(generate(clone(upperTrial)).models.F03.columns.filter(q=>q.status!=='上层柱')),signature(upper.columns));
  assert.equal(JSON.stringify(p),before);assert.deepEqual(fs.readFileSync(file),bytes);
  console.log(JSON.stringify({currentModel:p.name,normalGF:normal.report.schemes.map(q=>({label:q.label,count:q.columns.length,reach:q.metrics.maxReach})),resetGF:reset.report.schemes.map(q=>({label:q.label,count:q.columns.length,reach:q.metrics.maxReach})),resetF03:f03.report.schemes.map(q=>({label:q.label,count:q.columns.length,reach:q.metrics.maxReach})),sourceUnchanged:true},null,2));
  pass('Optional current model: G/F reset restores coverage with ordinary preview also ignoring old exclusions; G/F/F03 apply/reopen preserve source and all other Framing');
 }
 console.log(JSON.stringify({passed,timings},null,2));
}
