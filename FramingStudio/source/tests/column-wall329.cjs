// Offline geometry/transaction regression. Never edits a user project or browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context}=require('./audit-performance247.cjs'),{fixture,verifyPhysical}=require('./column-schemes319.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6,passed=[];
const generate=p=>c.run('Engine.generate(Engine.clone(argument))',p);
const model=(p,key='F1')=>c.run('Engine.model(Engine.clone(argument.p),argument.key)',{p,key});
const search=(p,key='F1')=>{
 const before=JSON.stringify(p),r=generate(p),derived=JSON.stringify(r);
 const report=c.run('ColumnSchemes319.search(argument.p,argument.r,argument.key)',{p,r,key});
 assert.equal(JSON.stringify(p),before,'search mutated source');assert.equal(JSON.stringify(r),derived,'search mutated result');
 return {report,result:r};
};
const apply=(p,key,s,r)=>c.run('ColumnSchemes319.apply(argument.p,argument.result,argument.key,argument.scheme,argument.report)',{p,key,result:r.result,scheme:s,report:r.report});
const physical=q=>({x:q.cx??q.x,y:q.cy??q.y,w:q.b,d:q.d});
// An independent rectangle-distance oracle: includes the ends and corners, not
// just a perpendicular distance to an infinite wall centreline.
function wallRect(w){return {x:(w.a[0]+w.z[0])/2,y:(w.a[1]+w.z[1])/2,w:near(w.a[1],w.z[1])?Math.abs(w.z[0]-w.a[0]):w.b,d:near(w.a[0],w.z[0])?Math.abs(w.z[1]-w.a[1]):w.b};}
function gap(a,b){return Math.hypot(Math.max(0,Math.abs(a.x-b.x)-(a.w+b.w)/2),Math.max(0,Math.abs(a.y-b.y)-(a.d+b.d)/2));}
function assertClear(columns,walls,label){for(const col of columns){const r=physical(col),limit=Math.min(r.w,r.d)/2;for(const wall of walls)assert(gap(r,wallRect(wall))>=limit-1e-7,`${label}: ${col.id||'candidate'} is ${gap(r,wallRect(wall))}m from ${wall.id}, below ${limit}m`);}}
function wallFixture({horizontal=false,thickness=300,position='center',reverse=false}={}){
 const p=fixture({spacing:{}}),a=horizontal?{x:6,y:6}:{x:6,y:6},z=horizontal?{x:12,y:6}:{x:6,y:12};
 p.types.F1.walls=[{id:'W',a:reverse?z:a,z:reverse?a:z,b:thickness,on:true,axisPosition:position}];p.types.F1.columnWallPolicy329=true;return p;
}

{
 const walls=[{id:'W',a:[4,6],z:[12,6],b:.4}];
 // Wall footprint [4,12] x [5.8,6.2]; physical column 0.6 x 0.8,
 // so the configured layout separation is 0.3m (not a structural design rule).
 for(const [name,r,blocked]of [
  ['side touching',{x:8,y:6.6,w:.6,d:.8},true],
  ['side 0.299m',{x:8,y:6.899,w:.6,d:.8},true],
  ['side exact 0.3m',{x:8,y:6.9,w:.6,d:.8},false],
  ['end touching',{x:12.3,y:6,w:.6,d:.8},true],
  ['end exact 0.3m',{x:12.6,y:6,w:.6,d:.8},false],
  ['corner 0.2/0.2m',{x:12.5,y:6.8,w:.6,d:.8},true],
  ['corner 0.2/0.25m',{x:12.5,y:6.85,w:.6,d:.8},false],
  ['past end, beyond infinite line',{x:20,y:6,w:.6,d:.8},false]
 ]){const hit=c.run('Engine.columnWallClearance329(argument.r,argument.walls)',{r,walls});assert.equal(!!hit,blocked,name);if(hit){assert.equal(hit.wallId,'W');assert(near(hit.gap,gap(r,wallRect(walls[0]))));assert(near(hit.required,.3));}}
 assert.equal(c.run('Engine.columnWallClearance329(argument.r,[])',{r:{x:8,y:6,w:.6,d:.8}}),null);
 pass('Finite footprint distance handles side/end touching, exact limits and diagonal corners; extending wall centrelines does not invent exclusions');
}
function pass(s){passed.push(s);console.log('PASS '+s);}

// Baseline captured from E2.328 before this change.
{
 const p=fixture(),m=model(p),expected=[['AC1',.25,.25],['AC3',.25,12],['AC9',12,.25],['AC11',12,12]];
 assert.deepEqual(clone(m.columns.map(q=>[q.id,physical(q).x,physical(q).y])),expected);
 const {report}=search(p);assert(report.schemes.some(s=>s.unchanged&&s.columns.length===expected.length));for(const scheme of report.schemes)verifyPhysical(p,'F1',scheme.columns);
 pass('No-wall automatic columns retain E2.328 geometry; E2.330 alternatives remain legal with a preservation option');
}

for(const horizontal of [false,true])for(const thickness of [200,700])for(const reverse of [false,true])for(const position of horizontal?['up','center','down']:['left','center','right']){
 const p=wallFixture({horizontal,thickness,reverse,position}),m=model(p);
 assert.equal(m.walls.length,1);assertClear(m.columns.filter(q=>q.status!=='上层柱'),m.walls,'ordinary automatic generation');
 const {report,result}=search(p);assert(report.schemes.length,'no candidates for wall '+JSON.stringify({horizontal,thickness,reverse,position}));
 for(const s of report.schemes){assertClear(s.columns.map(q=>({...q,cx:q.x,cy:q.y})),m.walls,'scheme');verifyPhysical(p,'F1',s.columns);
  const trial=clone(p);apply(trial,'F1',s,{report,result});const after=model(trial);assertClear(after.columns.filter(q=>q.status!=='上层柱'),after.walls,'applied scheme');
 }
}
pass('Automatic and scheme columns keep full-footprint clearance from wall sides/ends/corners for both axes, reversed endpoints, 200/700mm thickness and all explicit offsets');

{
 const p=wallFixture({thickness:200,position:'left'});delete p.types.F1.columnWallPolicy329;
 const before=model(p),close=before.columns.filter(q=>before.walls.some(w=>gap(physical(q),wallRect(w))<Math.min(q.b,q.d)/2-1e-7));assert(close.length,'legacy fixture must contain near-wall columns');
 const original=JSON.stringify(p);assert.deepEqual(clone(model(JSON.parse(original)).columns),clone(before.columns),'opening legacy model silently changes existing columns');
 c.run("FloorColumns101.update311(argument,'F1',1,false,true)",p);assert.equal(p.types.F1.columnWallPolicy329,true);const after=model(p);assertClear(after.columns.filter(q=>q.status!=='上层柱'),after.walls,'explicit auto update');
 pass('Legacy load/reopen preserves existing geometry; an explicit automatic layout action enables the new wall-clearance rule');
}

{
 const p=wallFixture({horizontal:true,thickness:100}),t=p.types.F1;t.mode='manual';
 t.columns=[{id:'MANUAL',x:9,y:5.7,b:500,d:500,on:true,status:'上下贯通'},{id:'DELETED',x:14,y:14,b:500,d:500,on:false,status:'上下贯通'}];
 t.suppressedColumns=[{ax:'3',ay:'C'}];
 const source=JSON.stringify(p),m=model(p);assert(m.columns.some(q=>q.id==='MANUAL'));assert(!m.columns.some(q=>q.id==='DELETED'));
 const {report,result}=search(p);assert(report.schemes.length,'near-wall manual column must not make all schemes disappear');
 for(const s of report.schemes){const manual=s.columns.find(q=>q.id==='MANUAL');assert(manual?.locked,'near-wall manual column dropped/unlocked');assert.equal(manual.x,9);assert.equal(manual.y,5.7);assert.equal(manual.b,.5);assert.equal(manual.d,.5);
  assert(!s.columns.some(q=>near(q.x,12)&&near(q.y,12)),'suppressed grid intersection repopulated');assert(!s.columns.some(q=>near(q.x,14)&&near(q.y,14)),'disabled manual column repopulated');
  const trial=clone(p);apply(trial,'F1',s,{report,result});assert.deepEqual(clone(trial.types.F1.suppressedColumns),t.suppressedColumns);const rawColumns=rows=>clone(rows.filter(q=>['MANUAL','DELETED'].includes(q.id)).map(q=>({id:q.id,x:q.x,y:q.y,b:q.b,d:q.d,on:q.on,status:q.status})));assert.deepEqual(rawColumns(trial.types.F1.columns),rawColumns(t.columns));
 }
 assert.equal(JSON.stringify(p),source);assert((report.messages||[]).some(q=>/MANUAL/.test(q)&&/牆/.test(q)),'near-wall manual preservation has no visible warning');
 pass('Near-wall manual geometry/identity and genuine deletion records survive every proposal/apply, with an explicit warning');
}

{
 const p=require('./wall-follow322.cjs').fixture();p.total=4;p.groups=[{...p.groups[0],end:1},{...p.groups[1],end:2},{...p.groups[1],end:3,type:'F3'},{...p.groups[1],end:'顶层',type:'F2'}];
 p.types.F3=clone(p.types.F1);p.types.F3.walls[0].id='OTHER';p.types.F3.walls[0].b=600;p.types.F3.walls[0].axisPosition='left';p.types.F2.mode='auto';p.types.F2.columnWallPolicy329=true;
 const raw=JSON.stringify(p.types.F2.walls),r=generate(p),floors=[2,4].map(f=>c.run('Engine.floorModel(argument.r,argument.f)',{r,f}));
 assert(near(floors[0].walls[0].a[0],5.2));assert(near(floors[1].walls[0].a[0],4.7));
 for(const m of floors)assertClear(m.columns.filter(q=>q.status!=='上层柱'),m.walls,'shared floor after lower-wall following');
 assert.equal(JSON.stringify(p.types.F2.walls),raw);
 const out=search(p,'F2');assert(out.report.schemes.length);
 for(const s of out.report.schemes){for(const m of floors)assertClear(s.columns.map(q=>({...q,cx:q.x,cy:q.y})),m.walls,'shared scheme');const trial=clone(p);apply(trial,'F2',s,out);const reopened=generate(JSON.parse(JSON.stringify(trial)));for(const f of [2,4]){const m=c.run('Engine.floorModel(argument.r,argument.f)',{r:reopened,f});assertClear(m.columns.filter(q=>q.status!=='上层柱'),m.walls,'shared applied/reopened');}}
 pass('Shared Framing checks both occurrences against their own lower-wall offsets; raw walls and reopened geometry remain intact');
}

{
 const p=fixture({levels:2,spacing:{}});p.types.F1.walls=[{id:'W',a:{x:6,y:6},z:{x:12,y:6},b:100,on:true,axisPosition:'center'}];
 p.types.F2.mode='manual';p.types.F2.columns=[{id:'UPPER_SUPPORT',x:9,y:5.7,b:500,d:500,on:true,status:'上下贯通'}];
 const out=search(p);assert(out.report.schemes.length);assert(out.report.messages.some(q=>q.includes('UPPER_SUPPORT')&&/承托|上層/.test(q)),'near-wall upper-column support need missing explicit warning');
 for(const s of out.report.schemes)assert(!s.columns.some(q=>near(q.x,9)&&near(q.y,5.7)),'upper-column candidate silently bypassed wall clearance');
 pass('Upper-column alignment near a wall is reported for support review rather than silently adding an ordinary column');
}

{
 const p=fixture({spacing:{}}),t=p.types.F1;t.walls=[{id:'W',a:{x:6,y:6.3},z:{x:12,y:6.3},b:100,on:true,axisPosition:'center'}];t.transferColumns=[{ax:'2',ay:'B'}];
 const original=model(p).columns.find(q=>q.anchorX==='2'&&q.anchorY==='B');assert(original?.transferManual,'transfer fixture not recognized');const point=physical(original);
 c.run("FloorColumns101.update311(argument,'F1',1,true,true)",p);const m=model(p),retained=m.columns.find(q=>q.anchorX==='2'&&q.anchorY==='B');assert(retained,'explicit transfer column removed');assert.deepEqual(physical(retained),point);
 const r=generate(p),notes=c.run("ColumnSchemes319.wallNotes329(argument.p,argument.r,'F1')",{p,r});assert(notes.some(q=>q.includes(retained.id)&&q.includes('Transfer')),'transfer-column support warning absent');
 const out=search(p);assert(out.report.schemes.length);for(const s of out.report.schemes)assert(s.columns.some(q=>q.locked&&near(q.x,point.x)&&near(q.y,point.y)),'special support changed in scheme');
 pass('Explicit transfer support is kept in place through automatic refresh and schemes, with a specific support warning');
}

{
 const p=wallFixture({horizontal:true,thickness:100});p.types.F1.mode='manual';const out=search(p),s=out.report.schemes.find(q=>!q.unchanged);assert(s);
 // A report is not authority: apply must independently validate its geometry.
 s.columns=[{x:9,y:5.7,b:.5,d:.5}];const before=JSON.stringify(p);assert.throws(()=>apply(p,'F1',s,out),/牆|柱距|預覽/);assert.equal(JSON.stringify(p),before,'failed wall revalidation partially applied');
 const fresh=search(p),proposal=fresh.report.schemes.find(q=>!q.unchanged);p.types.F1.walls[0].b=200;const edited=JSON.stringify(p);assert.throws(()=>apply(p,'F1',proposal,fresh),/模型已改變/);assert.equal(JSON.stringify(p),edited);
 pass('Apply independently rejects an unsafe candidate and a stale wall edit atomically');
}

{
 const editedFixture=()=>{const p=fixture({spacing:{}});p.types.F1.walls=[{id:'W',a:{x:0,y:5.3},z:{x:18,y:5.3},b:300,on:true,axisPosition:'center'}];c.run("FloorColumns101.update311(argument,'F1',1,true,true)",p);return p;};
 const target=p=>model(p).columns.find(q=>q.anchorX==='2'&&q.anchorY==='B');
 const p=editedFixture(),before=physical(target(p));assert.deepEqual(before,{x:6,y:6,w:.5,d:.5});
 c.run("Engine.editSize(argument.p,'F1',{kind:'COL',id:argument.id},{b:1000,d:1000})",{p,id:target(p).id});
 assert.deepEqual(physical(target(p)),{x:6,y:6,w:1,d:1},'a later manual resize silently moved the column for wall clearance');
 assert(model(p).walls.every(w=>gap(physical(target(p)),wallRect(w))>0),'resize fixture must not overlap the wall');
 for(const kind of ['transfer','manual-beam','saved-beam-link','members','selected','reportA','reportB','foundation']){
  const q=editedFixture(),t=q.types.F1,col=target(q);
  if(kind==='transfer')c.run("Engine.setTransferColumn(argument.p,'F1',{kind:'COL',id:argument.id},true)",{p:q,id:col.id});
  else if(kind==='manual-beam')t.beams.push({id:'B',kind:'MB',a:{x:6,y:6},z:{x:12,y:6},b:300,d:800,on:true});
  else if(kind==='saved-beam-link')t.autoBeamSnapshot={main:[{id:'SAVED',kind:'MB',a:[12,12],z:[18,12],rawA:[12,12],rawZ:[18,12],b:.3,d:.8,columnSupports164:[{key:'axis:2|B',reference:[6,6]},null]}]};
  else{const token=c.run("'1|'+Loading.token('COL',argument)",col);if(kind==='foundation')q.foundation={column:token};else(q.explorer??={})[kind]={[token]:kind==='members'?{sectionAAreaMode:'manual'}:true};}
  t.walls[0].b=500;const next=target(q);assert(next,kind+' added after enabling auto avoidance was dropped');assert.deepEqual(physical(next),before,kind+' added after enabling auto avoidance moved');
 }
 const plain=editedFixture();plain.types.F1.walls[0].b=500;const ordinary=target(plain);assert(!ordinary||!near(physical(ordinary).y,6),'ordinary auto column should still avoid the newly widened wall');
 const deletedBeam=editedFixture();deletedBeam.types.F1.autoBeamSnapshot={secondary:[{id:'DELETED',kind:'SB',a:[6,6],z:[12,6],rawA:[6,6],rawZ:[12,6],b:.3,d:.8,deleted304:true}]};deletedBeam.types.F1.walls[0].b=500;const orphan=target(deletedBeam);assert(!orphan||!near(physical(orphan).y,6),'a deleted beam record incorrectly exempted ordinary automatic placement');
 const unrelated=editedFixture();unrelated.total=2;unrelated.groups=[{...unrelated.groups[0],end:1},{...unrelated.groups[0],end:'顶层',type:'F2'}];unrelated.types.F2=clone(unrelated.types.F1);unrelated.types.F2.walls=[];unrelated.explorer={members:{'2|COL|6,6':{sectionAAreaMode:'manual'}}};unrelated.types.F1.walls[0].b=500;const other=target(unrelated);assert(!other||!near(physical(other).y,6),'another Framing load record incorrectly exempted ordinary automatic placement');
 const explicit=fixture({levels:2,spacing:{}});explicit.types.F1.walls=[{id:'W',a:{x:0,y:5.3},z:{x:18,y:5.3},b:500,on:true,axisPosition:'center'}];explicit.explorer={members:{'2|COL|6,6':{sectionAAreaMode:'manual'}}};assert(near(physical(target(explicit)).y,6),'explicit-update fixture must start with an ordinary near-wall column');c.run("FloorColumns101.update311(argument,'F1',1,true,true)",explicit);const updated=target(explicit);assert(!updated||!near(physical(updated).y,6),'another Framing load record incorrectly pinned a column during explicit automatic update');assert(!explicit.types.F1.columnPlacements?.some(q=>q.key==='axis:2|B'),'explicit automatic update saved a false cross-Framing protection');
 const reserved=editedFixture();reserved.types.F1.columnSizes=[{ax:'2',ay:'B',b:500,d:500,bMode201:'manual',dMode201:'manual'}];reserved.types.F1.noColumnZones=[{x0:5.9,x1:6.1,y0:5.9,y1:6.1}];assert(!target(reserved),'near-wall exception incorrectly bypassed the existing no-column-zone rule');
 pass('Later manual resize, transfer marks, saved/manual beam supports and same-Framing load/report/foundation records survive wall avoidance; ordinary candidates and no-column checks still apply');
}

if(process.argv[2]){
 const filename=path.resolve(process.argv[2]),bytes=fs.readFileSync(filename),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),before=JSON.stringify(p),key='F01',out=search(p,key),m=model(p,key);
 assert(out.report.schemes.length,'current F01 needs at least one usable proposal');
 const tested=[];for(const s of out.report.schemes){assertClear(s.columns.map(q=>({...q,cx:q.x,cy:q.y})),m.walls,'current model preview');const trial=clone(p),others=JSON.stringify(Object.fromEntries(Object.entries(trial.types).filter(([k])=>k!==key))),metadata=JSON.stringify([trial.axes,trial.groups,trial.defaults,trial.explorer]);apply(trial,key,s,out);assert.equal(JSON.stringify(Object.fromEntries(Object.entries(trial.types).filter(([k])=>k!==key))),others);assert.equal(JSON.stringify([trial.axes,trial.groups,trial.defaults,trial.explorer]),metadata);const r=generate(trial);for(const f of r.floors.filter(f=>f.type===key)){const fm=c.run('Engine.floorModel(argument.r,argument.f)',{r,f:f.n});assertClear(fm.columns.filter(q=>q.status!=='上层柱'),fm.walls,'current applied model');}tested.push({label:s.label,count:s.columns.length});}
 const auto=clone(p);c.run('FloorColumns101.update311(argument.p,argument.key,1,false,true)',{p:auto,key});const automatic=model(auto,key);assertClear(automatic.columns.filter(q=>q.status!=='上层柱'),automatic.walls,'current explicit auto');
 assert.equal(JSON.stringify(p),before);assert.deepEqual(fs.readFileSync(filename),bytes);console.log(JSON.stringify({currentModel:p.name,key,schemes:tested,automaticCount:automatic.columns.length,sourceUnchanged:true},null,2));
 pass('Current exported model: all F01 proposals and ordinary auto layout clear actual walls; apply/reopen leaves other Framing, settings and original file intact');
}

module.exports={gap,wallRect,assertClear,wallFixture};
console.log(JSON.stringify({passed},null,2));

