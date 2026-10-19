// Offline geometry regression; no engineering equations or production model edits.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {context}=require('./audit-performance247.cjs');
const {wideFixture,sparseFixture}=require('./column-transfer330.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),passed=[];
const run=(s,x)=>c.run(s,x),gen=p=>run('Engine.generate(Engine.clone(argument))',p);
const network=(p,r,key='F2')=>run('ColumnSchemes319.tbRoutes334(argument.p,argument.r,argument.key)',{p,r,key});
const search=(p,r,key)=>run('ColumnSchemes319.search(argument.p,argument.r,argument.key)',{p,r,key});
const near=(a,b)=>Math.abs(a-b)<1e-6;
function checkScheme(p,r,key,s){
 for(const row of s.support330){if(['base','shared'].includes(row.kind))continue;const col=s.columns.find(q=>near(q.x,row.x)&&near(q.y,row.y));if(col.locked)continue;
  assert(!['missing','ambiguous'].includes(row.kind),'new unsupported or ambiguous point');
  if(row.kind==='transfer'){const route=s.routes334.find(q=>q.id===row.tb334&&q.at===row.at);assert(route,'new transfer point lacks a route');assert(route.span>0);const a=route.a.point,z=route.z.point,v=[row.x,row.y],axis=route.axis==='X'?0:1;assert(near(v[1-axis],a[1-axis]));assert(v[axis]>a[axis]&&v[axis]<z[axis]);assert(near(route.span,Math.hypot(z[0]-a[0],z[1]-a[1])));}
 }
}
{
 const p=wideFixture({levels:2,spacing:{},nx:4,ny:3}),r=gen(p),m=r.models.F1;
 const col=(id,x,y)=>({id,x,y,b:.5,d:.5,status:'上下贯通'});
 r.floorModels[1]={...m,columns:[col('A',2,3),col('B',12,3),col('C',22,3),col('D',2,15),col('E',22,15)],walls:[],beams:[]};
 let n=network(p,r);assert(n.routes.some(q=>q.a.id==='A'&&q.z.id==='B'));assert(!n.routes.some(q=>q.a.id==='A'&&q.z.id==='C'),'must split at intermediate support');assert(!n.routes.some(q=>q.a.id==='B'&&q.z.id==='D'),'do not invent diagonal support');
 const before=JSON.stringify(r);assert.deepEqual(clone(network(p,r)),clone(n));assert.equal(JSON.stringify(r),before);passed.push('Routes connect adjacent real physical supports deterministically, split at intermediate support, and leave the model unchanged');
 r.floorModels[1]={...r.floorModels[1],columns:[col('A',2,3)],walls:[{id:'W',a:[14,1],z:[14,10],b:.3}]};
 n=network(p,r);assert(n.routes.some(q=>q.a.id==='A'&&q.z.id==='W'&&near(q.z.point[1],3)&&near(q.span,12)));passed.push('Column-to-wall route ends on the finite wall at the actual axis intersection');
 r.floorModels[1]={...r.floorModels[1],columns:[],walls:[{id:'W1',a:[2,1],z:[2,10],b:.3},{id:'W2',a:[14,1],z:[14,10],b:.3}]};assert(network(p,r).routes.some(q=>q.a.id==='W1'&&q.z.id==='W2'));passed.push('Wall-to-wall candidate lines have two distinct finite wall supports');
 r.floorModels[1]={...r.floorModels[1],columns:[col('A',2,3),col('DUP',2,3),col('B',22,3)],walls:[]};assert.equal(network(p,r).routes.length,0);passed.push('Ambiguous coincident supports do not silently form a route');
 r.floorModels[1]={...r.floorModels[1],columns:[col('A',2,3),col('B',22,3)],floorPolygons315:[[[0,0],[8,0],[8,18],[0,18]],[[8.001,0],[24,0],[24,18],[8.001,18]]]};assert.equal(network(p,r).routes.length,0);passed.push('Exact interval coverage rejects even a narrow gap/Opening in a candidate line');
}
{
 const p=sparseFixture(),r=gen(p),before=JSON.stringify(p),report=search(p,r,'F2'),s=report.schemes.find(q=>q.family==='balanced330');assert(s&&s.routes334.length);for(const s of report.schemes)checkScheme(p,r,'F2',s);assert.equal(JSON.stringify(p),before);passed.push('All newly proposed upper transfer columns have a finite lower-floor route, including the balanced interior candidate');
 const base=search(p,r,'F1');assert(base.schemes.every(q=>!q.routes334.length));passed.push('Model base floor has no invented lower supports or TB routes');
 const noLower=clone(p);noLower.types.F1.columns=[];noLower.types.F1.walls=[];noLower.types.F1.beams=[];const empty=search(noLower,gen(noLower),'F2');assert(empty.schemes.every(q=>q.columns.every(c=>c.locked)));passed.push('No lower supports does not produce unrouteable automatic transfer columns');
}
{
 const p=wideFixture({levels:4,spacing:{}});p.groups[3].type='F2';p.types.F1.columns=[{id:'A',x:6,y:6,b:500,d:500,on:true},{id:'B',x:30,y:6,b:500,d:500,on:true}];p.types.F3.columns=[{id:'C',x:6,y:18,b:500,d:500,on:true},{id:'D',x:30,y:18,b:500,d:500,on:true}];
 for(const key of ['F1','F3'])for(const col of p.types[key].columns)col.status='上下贯通';
 const r=gen(p),report=search(p,r,'F2');assert.deepEqual(clone(report.affectedFloors),[2,4]);assert(report.schemes.every(s=>s.columns.every(q=>q.locked)),'a shared Framing cannot use a route supported at only one occurrence');passed.push('Nonconsecutive shared Framing checks every actual lower floor, not only the first occurrence');
}
if(process.argv[2]){
 const bytes=fs.readFileSync(process.argv[2]),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),before=JSON.stringify(p),r=gen(p),metrics=[];
 for(const key of ['F01','F03']){const report=search(p,r,key);assert(report.schemes.length);for(const s of report.schemes)checkScheme(p,r,key,s);const s=report.schemes.find(q=>q.family==='balanced330')||report.schemes[0],trial=clone(p),others=clone(trial);delete others.types[key];
  run('ColumnSchemes319.apply(argument.p,argument.r,argument.key,argument.s,argument.report)',{p:trial,r,key,s,report});const preserved=clone(trial);delete preserved.types[key];assert.deepEqual(preserved,others);assert.deepEqual(clone(trial.types[key].beams),p.types[key].beams,'candidate routes must not build beams');
  const reopened=gen(JSON.parse(JSON.stringify(trial)));assert.equal(reopened.models[key].columns.filter(q=>q.status!=='上层柱').length,s.columns.length);
  if(key==='F03'){assert(s.routes334.length);assert(s.columns.some(q=>q.x>12&&q.x<40&&q.y>12&&q.y<22));}
  metrics.push({key,columns:s.columns.length,routes:s.routes334.map(q=>({id:q.id,ends:[q.a.id,q.z.id],axis:q.axis,span:q.span})),unresolved:s.unresolved334,applyReopen:true});
 }
 assert.equal(JSON.stringify(p),before);assert.deepEqual(fs.readFileSync(process.argv[2]),bytes);passed.push('Current G/F and F03: preview/apply/reopen, route endpoints/spans, interior coverage, beam and other Framing preservation');console.log(JSON.stringify({currentModel:metrics}));
}
console.log(JSON.stringify({ok:true,passed},null,2));
