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
const root=path.resolve(__dirname,'../../../../..'),q5=JSON.parse(fs.readFileSync(path.join(root,'output/HKIE_2025_Q5_column_trial/02_column_scheme_start.framing.json'),'utf8'));
const before=JSON.stringify(q5),report=c.run("ColumnSchemes319.search(argument,null,'F05')",q5);assert(report.schemes.length);
for(const s of report.schemes)for(let i=0;i<s.columns.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(s.columns[i].x-s.columns[j].x,s.columns[i].y-s.columns[j].y)>=7-1e-7);
assert.equal(JSON.stringify(q5),before);assert.equal(report.options.targetX,7);assert.equal(report.options.targetY,7);
passed.push('Current Q5 F05 proposals read saved minima and every pair is >=7m; source unchanged');
console.log(JSON.stringify({passed,q5:report.schemes.map(s=>({label:s.label,count:s.columns.length}))},null,2));
