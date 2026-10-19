// Whole-layout direction/row regressions; no capacity equations or report edits.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {context}=require('./audit-performance247.cjs'),{sparseFixture,wideFixture}=require('./column-transfer330.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6,passed=[];
function search(p,key='F2',options={}){const before=JSON.stringify(p),r=c.run('Engine.generate(Engine.clone(argument))',p),derived=JSON.stringify(r),report=c.run('ColumnSchemes319.search(argument.p,argument.r,argument.key,argument.options)',{p,r,key,options});assert.equal(JSON.stringify(p),before);assert.equal(JSON.stringify(r),derived);return {r,report};}
function verify(s){
 const moving=s.columns.filter(q=>!q.locked),routes=s.routes334.filter(r=>s.support330.some(q=>q.tb334===r.id&&moving.some(c=>near(q.x,c.x)&&near(q.y,c.y))));
 assert(routes.length);assert(routes.every(r=>r.axis===s.axis335),'direction mixed into a complete layout');assert.equal(s.maxTB335,Math.max(...routes.map(r=>r.span)));
 for(const row of s.support330.filter(q=>q.kind==='transfer')){const col=s.columns.find(q=>near(q.x,row.x)&&near(q.y,row.y));if(col.locked)continue;const route=routes.find(q=>q.id===row.tb334&&q.at===row.at);assert(route);assert(s.stations335.some(v=>near(v,s.axis335==='X'?row.x:row.y)),'isolated point shifted off shared rows');assert(near(route.span,Math.hypot(route.z.point[0]-route.a.point[0],route.z.point[1]-route.a.point[1])),'upper load point split a TB span');}
}
{
 const p=sparseFixture(),a=search(p).report,b=search(p).report;assert.deepEqual(clone(a),clone(b));const dirs=a.schemes.filter(q=>q.axis335);assert.equal(dirs.length,2);dirs.forEach(verify);assert.equal(dirs[0].axis335,'Y');assert(dirs[0].maxTB335<dirs[1].maxTB335);passed.push('Rectangle: shorter Y whole-layout precedes longer X; common rows, no mixed directions, deterministic and read-only');
 const rotated=clone(p);rotated.axes={x:p.axes.y.map(a=>({...a})),y:p.axes.x.map(a=>({...a}))};for(const t of Object.values(rotated.types)){t.building=Object.fromEntries(Object.entries(t.building).map(([k,v])=>[k.split(',').reverse().join(','),v]));for(const col of t.columns)[col.x,col.y]=[col.y,col.x];}
 const r=search(rotated).report,rd=r.schemes.filter(q=>q.axis335);assert.equal(rd[0].axis335,'X');assert(near(rd[0].maxTB335,dirs[0].maxTB335));rd.forEach(verify);passed.push('Rotating a different model selects X instead; no hardcoded preferred axis or exam dimensions');
 const disabled=clone(p);disabled.types.F2.columns=[{id:'OFF',x:12,y:12,b:500,d:500,on:false,status:'上下贯通'}];disabled.types.F2.columnSchemeDeleted319=[{x:18,y:12,w:1,d:1}];const report=search(disabled).report;for(const s of report.schemes.filter(s=>s.axis335)){verify(s);assert(!s.columns.some(q=>near(q.x,12)&&near(q.y,12)));assert(!s.columns.some(q=>near(q.x,18)&&near(q.y,12)));}passed.push('Deleted and disabled positions remain gaps, not shifted or silently restored');
 const fixed=clone(p);fixed.types.F2.columns=[{id:'MANUAL',x:9,y:9,b:500,d:500,on:true,status:'上下贯通'}];const out=search(fixed);for(const s of out.report.schemes){assert(s.columns.some(q=>q.id==='MANUAL'&&near(q.x,9)&&near(q.y,9)));}assert(out.report.schemes.some(s=>s.support330.some(q=>q.id==='MANUAL'&&!q.tb334)));passed.push('Off-route manual column preserved and explicitly unresolved rather than inventing a long route');
}
{
 const p=wideFixture({levels:2,nx:6,ny:4,spacing:{x:4,y:4}});p.types.F1.columns=[{id:'A',x:6,y:.25,b:500,d:500,on:true,status:'上下贯通'},{id:'B',x:6,y:23.75,b:500,d:500,on:true,status:'上下贯通'},{id:'C',x:18,y:.25,b:500,d:500,on:true,status:'上下贯通'},{id:'D',x:18,y:17.75,b:500,d:500,on:true,status:'上下贯通'}];
 const report=search(p).report,s=report.schemes.find(s=>s.axis335==='Y');assert(s);verify(s);const rows=x=>s.support330.filter(q=>q.kind==='transfer'&&near(q.x,x)).map(q=>q.y);assert(rows(6).length>1&&rows(18).length>1);assert(rows(18).every(y=>rows(6).some(q=>near(q,y))));passed.push('Unequal parallel spans share the same row positions instead of independently subdividing each TB');
}
if(process.argv[2]){
 const bytes=fs.readFileSync(process.argv[2]),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),metrics=[];
 for(const key of ['F01','F03']){const {r,report}=search(p,key),dirs=report.schemes.filter(s=>s.axis335);if(key==='F01'){assert(report.schemes[0].unchanged);assert.equal(report.schemes[0].columns.length,38);assert.equal(dirs.length,0);}else{assert.equal(dirs.length,2);assert.equal(dirs[0].axis335,'Y');assert.equal(dirs[0].maxTB335,33);assert.equal(dirs[1].maxTB335,42);for(const s of dirs){verify(s);const model=clone(p),before=clone(p);c.run('ColumnSchemes319.apply(argument.model,argument.r,argument.key,argument.s,argument.report)',{model,r,key,s,report});assert.deepEqual(clone(model.types[key].beams),p.types[key].beams);delete model.types[key];delete before.types[key];assert.deepEqual(model,before);}}
  metrics.push({key,candidates:report.schemes.map(s=>({id:s.id,axis:s.axis335||'direct/existing',columns:s.columns.length,maxTB:s.maxTB335||0,totalTB:s.totalTB335||0,routes:s.routes334.map(q=>({axis:q.axis,span:q.span,ends:[q.a.id,q.z.id]})),rows:s.stations335,uncovered:s.coverageUnresolved330||0}))});
 }
 assert.deepEqual(fs.readFileSync(process.argv[2]),bytes);passed.push('Current G/F retains 38 protected columns; F03 prefers Y 33m over X 42m with regular rows, preserving beams and all other Framing/report settings');console.log(JSON.stringify({currentModel:metrics}));
}
console.log(JSON.stringify({ok:true,passed},null,2));
