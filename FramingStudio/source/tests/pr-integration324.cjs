// Integration regressions for the E2.320 polygon model and offline column proposals.
const assert=require('node:assert/strict'),{context}=require('./audit-performance247.cjs'),{fixture}=require('./diagonal315.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),triangle=[[9,0],[9,9],[0,9]],square=[[0,0],[9,0],[9,9],[0,9]];
function project(building=triangle,floor=building){const p=fixture(c),t=p.types.F1;delete t.diagonal315;t.beams=[];t.walls=[];t.columns=[];t.regions319={building:[clone(building)],floor:[clone(floor)]};return p;}
function problem(p,col){return c.run("ColumnSchemes319.footprintProblem(argument.p,'F1',Engine.model(argument.p,'F1'),argument.col)",{p,col});}
// Independent half-plane test: all corners of this square must be in x+y>=9.
const cross={x:4.6,y:4.6,b:1,d:1};assert(cross.x-cross.b/2+cross.y-cross.d/2<9);
let p=project();assert(problem(p,cross));assert.equal(problem(p,{x:5,y:5,b:1,d:1}),'','exact slanted boundary contact is allowed');
p.types.F1.columns=[{id:'EDGE',x:4.6,y:4.6,b:1000,d:1000,on:true,status:'上下贯通'}];
let before=JSON.stringify(p),r=c.run("ColumnSchemes319.search(argument,Engine.generate(Engine.clone(argument)),'F1')",p);assert.equal(r.schemes.length,0);assert(r.messages.some(x=>/EDGE.*截面/.test(x)));assert.equal(JSON.stringify(p),before);
console.log('PASS 0.32 m2 triangular-edge overhang rejects retained/manual scheme without editing project; exact edge contact remains valid');
// Four corners and the centre can be inside while the section crosses a small hole.
p=project(square);p.types.F1.regions319.floor=c.run('Diagonal315.difference([argument.outer],[argument.hole])',{outer:square,hole:[[4.6,4.8],[4.8,4.8],[4.8,5.2],[4.6,5.2]]});
assert(problem(p,{x:5,y:5,b:2,d:2}));assert.equal(problem(p,{x:2,y:2,b:1,d:1}),'');
// Crossing an internal seam between allowed pieces must not be rejected.
p=project(square);p.types.F1.regions319.floor=[[[0,0],[4.5,0],[4.5,9],[0,9]],[[4.5,0],[9,0],[9,9],[4.5,9]]];assert.equal(problem(p,{x:4.5,y:4.5,b:1,d:1}),'');
p.types.F1.regions319.floor=[[[0,0],[4,0],[4,9],[0,9]],[[5,0],[9,0],[9,9],[5,9]]];assert(problem(p,{x:4.5,y:4.5,b:2,d:2}));
console.log('PASS complete footprint detects enclosed polygon Opening and disjoint gap, while shared allowed seams stay valid');
p=project();r=c.run("ColumnSchemes319.search(argument,Engine.generate(Engine.clone(argument)),'F1')",p);assert(r.schemes.length);
for(const s of r.schemes){for(const col of s.columns)for(const dx of [-col.b/2,col.b/2])for(const dy of [-col.d/2,col.d/2])assert(col.x+dx>=-1e-6&&col.x+dx<=9+1e-6&&col.y+dy<=9+1e-6&&col.x+dx+col.y+dy>=9-1e-6);}
const outcome=c.run(`(()=>{const p=argument,r=Engine.generate(p),report=ColumnSchemes319.search(p,r,'F1'),s=report.schemes.find(s=>!s.unchanged);ColumnSchemes319.apply(p,r,'F1',s,report);const a=Engine.generate(p).models.F1.columns,b=Engine.generate(JSON.parse(JSON.stringify(p))).models.F1.columns;return {a,b};})()`,clone(p));assert.equal(JSON.stringify(outcome.a),JSON.stringify(outcome.b));
console.log('PASS every generated triangular proposal fits independently checked half-planes and survives apply/save/reopen');
// Shared F2 has a valid representative floor but a different lower-wall offset later.
const shared=require('./wall-follow322.cjs').fixture();shared.total=4;shared.groups=[{end:1,h:4,type:'F1',sh:600,min:0},{end:2,h:4,type:'F2',sh:600,min:0},{end:3,h:4,type:'F3',sh:600,min:0},{end:'顶层',h:4,type:'F2',sh:600,min:0}];shared.types.F3=clone(shared.types.F1);shared.types.F1.walls[0].axisPosition='left';shared.types.F3.walls[0].axisPosition='right';
const variant=c.run(`(()=>{const p=argument,r=Engine.generate(p),a=Engine.floorModel(r,2),b=Engine.floorModel(r,4),col={x:5.2,y:4,b:.1,d:.1};return {first:ColumnSchemes319.footprintProblem(p,'F2',a,col),later:ColumnSchemes319.footprintProblem(p,'F2',b,col),centres:[a.walls[0].a[0],b.walls[0].a[0]],report:ColumnSchemes319.search(p,r,'F2',{targetX:2,targetY:2})};})()`,shared);
assert.equal(variant.first,'');assert(/牆/.test(variant.later));assert.notEqual(...variant.centres);
for(const s of variant.report.schemes)for(const col of s.columns)assert(!c.run("ColumnSchemes319.footprintProblem(argument.p,'F2',Engine.floorModel(Engine.generate(argument.p),4),argument.col)",{p:shared,col}));
console.log('PASS candidate validation includes each shared-Framing floor and its actual lower-wall offset');
const clipped=require('./wall-follow322.cjs').fixture();clipped.types.F2.regions319={building:[[[0,0],[5.1,0],[5.1,8],[0,8]]],floor:[[[0,0],[5.1,0],[5.1,8],[0,8]]]};
const walls=c.run(`(()=>{const p=argument,before=JSON.stringify(p.types.F2.walls),r=Engine.generate(p),again=Engine.generate(JSON.parse(JSON.stringify(p)));return {unchanged:before===JSON.stringify(p.types.F2.walls),walls:[2,3].map(f=>Engine.floorModel(r,f).walls),reopened:[2,3].map(f=>Engine.floorModel(again,f).walls),issues:r.issues};})()`,clipped);
assert(walls.unchanged);for(const list of walls.walls){assert.equal(list.length,1);assert.equal(list[0].a[0],5);}
assert.equal(walls.walls[0][0].wallFollow322.status,'blocked');assert(walls.issues.some(x=>/實際點選／斜邊範圍/.test(x.msg)));assert.equal(JSON.stringify(walls.walls),JSON.stringify(walls.reopened));
console.log('PASS inherited wall offset beyond point-selected exterior stays in its original position with explicit diagnostic; shared floors/reopen stay consistent');
