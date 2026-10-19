const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context}=require('./audit-performance247.cjs'),{fixture}=require('./column-schemes319.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),passed=[];
const p=fixture({spacing:{x:7,y:7}});p.types.F1.mode='manual';p.types.F1.columns=[{id:'C1',x:3,y:3,b:500,d:500,on:true,status:'上下贯通'},{id:'C2',x:10,y:3,b:500,d:500,on:true,status:'上下贯通'}];
const move=(q,id,dx,dy,copy=false)=>c.run("FloorColumns101.transform308(argument.p,Engine.generate(Engine.clone(argument.p)),'F1',1,[{kind:'COL',id:argument.id,f:1}],argument.dx,argument.dy,argument.copy)",{p:q,id,dx,dy,copy});
for(const [dx,dy,copy] of [[.1,0,false],[.5,1,false],[0,6.9,true]]){const q=clone(p),before=JSON.stringify(q);assert.throws(()=>move(q,'C1',dx,dy,copy),/中心距/);assert.equal(JSON.stringify(q),before);}
passed.push('Same-row, staggered and copied destinations below 7m rejected atomically');
for(const [dx,dy,copy]of [[-.1,0,false],[0,7,true]]){const q=clone(p);move(q,'C1',dx,dy,copy);assert.deepEqual(clone(q.types.F1.columnSpacing258),{x:7,y:7});assert.equal(c.run("Engine.model(argument,'F1').columns.length",q),copy?3:2);}
passed.push('Legal move/copy keeps saved spacing, identities and dimensions');
for(const issue of ['zone','boundary','wall']){const q=clone(p);delete q.types.F1.columnSpacing258;if(issue==='zone')q.types.F1.noColumnZones=[{x0:2,x1:4,y0:7,y1:9}];if(issue==='wall')q.types.F1.walls=[{id:'W1',a:{x:1,y:8},z:{x:5,y:8},b:300,on:true}];if(issue==='opening')q.types.F1.opening={'0,1':true};const before=JSON.stringify(q);assert.throws(()=>move(q,'C1',0,issue==='boundary'?-4:5));assert.equal(JSON.stringify(q),before);}
passed.push('Wall, no-column zone and exterior remain atomic blockers');
const actual=c.run("FloorColumns101.spacingProblem325({x:47,y:5.5},{x:46.5,y:12},{x:7,y:7})");assert.match(actual,/6\.519/);
passed.push('Recorded 6.519m staggered-column defect now produces an explicit conflict');
// A checkout must not depend on a private file outside the repository.
// The original Q5 project is optional and must be supplied explicitly.
const q5=require('./fixtures/q5-spacing-repro.cjs')();
function checkQ5(project,label){
 const before=JSON.stringify(project),report=c.run("ColumnSchemes319.search(argument,null,'F05')",project);assert(report.schemes.length,label);
 const verify=cols=>{for(let i=0;i<cols.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(cols[i].x-cols[j].x,cols[i].y-cols[j].y)>=7-1e-7,label+' centre spacing');};
 for(const s of report.schemes){
  verify(s.columns);
  const trial=clone(project),result=c.run('Engine.generate(Engine.clone(argument))',trial);
  c.run("ColumnSchemes319.apply(argument.p,argument.result,'F05',argument.scheme,argument.report)",{p:trial,result,scheme:s,report});
  const shape=p=>c.run("Engine.model(argument,'F05').columns.filter(c=>c.status!=='上层柱').map(c=>({x:c.cx??c.x,y:c.cy??c.y,b:c.b,d:c.d}))",p);
  const applied=shape(trial);verify(applied);assert.equal(applied.length,s.columns.length);
  assert.deepEqual(clone(shape(clone(trial))),clone(applied),label+' save/reopen');
  assert.equal(JSON.stringify(trial.types.F05.suppressedColumns),JSON.stringify(project.types.F05.suppressedColumns),label+' deleted positions');
 }
 assert.equal(JSON.stringify(project),before);assert.equal(report.options.targetX,7);assert.equal(report.options.targetY,7);
 return report.schemes.map(s=>({label:s.label,count:s.columns.length}));
}
const synthetic=checkQ5(q5,'Portable Q5 defect reproduction');
passed.push('Portable Q5 defect reproduction: candidate/apply/reopen centres >=7m; inputs and deleted positions preserved');
// Explicitly retained close columns must be rejected rather than silently moved.
const invalid=clone(q5);invalid.types.F05.mode='manual';invalid.types.F05.columns.push({id:'TOO_CLOSE',x:46.5,y:12,b:500,d:500,on:true,status:'上下贯通'});
const invalidBefore=JSON.stringify(invalid),rejected=c.run("ColumnSchemes319.search(argument,null,'F05')",invalid);
assert.equal(rejected.schemes.length,0);assert(rejected.messages.some(s=>/中心距/.test(s)));assert.equal(JSON.stringify(invalid),invalidBefore);
passed.push('Recorded 6.519m pair cannot be retained as a legal 7m scheme; source remains intact');
let original={status:'not supplied',note:'Synthetic regression is not a full original-Q5 model verification.'};
if(process.env.FRAMING_Q5_MODEL){
 const filename=path.resolve(process.env.FRAMING_Q5_MODEL),bytes=fs.readFileSync(filename);
 const model=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
 original={status:'passed',schemes:checkQ5(model,'Explicit original Q5 model')};
 assert(bytes.equals(fs.readFileSync(filename)),'Original Q5 file changed');
 passed.push('Explicit original Q5 model passed without changing its file');
}
console.log(JSON.stringify({passed,synthetic,original},null,2));
