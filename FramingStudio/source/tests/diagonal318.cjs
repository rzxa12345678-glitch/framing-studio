const assert=require('node:assert/strict'),{context}=require('./audit-performance247.cjs'),{fixture}=require('./diagonal315.cjs');
const c=context(),plain=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function square(){const p=fixture(c),t=p.types.F1;delete t.diagonal315;t.columns.push({...t.columns[0],id:'C4',x:0,y:0});t.beams.push(...[{id:'T1',a:{x:0,y:0},z:{x:9,y:0}},{id:'L1',a:{x:0,y:0},z:{x:0,y:9}}].map(b=>({...t.beams[1],...b})));return p;}
module.exports={square};
if(require.main===module){
 const p=square(),before=JSON.stringify(p),v=c.run(`(()=>{const p=argument,r=Engine.generate(p),m=r.models.F1;return {m,loads:Loading.run(p,r,'B').rows,area:Diagonal315.sum(m.floorPolygons315)}})()`,p);
 assert.equal(JSON.stringify(p),before);assert(v.m.diagonal315.building318);near(v.area,81);assert.equal(v.m.slabs.length,2);assert(v.m.beams.some(b=>b.id==='D1'&&b.diagonal315));
 for(const s of v.m.slabs)assert(s.polygon315);
 const reloaded=c.run('Engine.generate(argument).models.F1',JSON.parse(before));assert.deepEqual(plain(reloaded),plain(v.m));
 const rect=square();rect.types.F1.diagonal315={outline:[[0,0],[9,0],[9,9],[0,9]],direction:'X'};assert(c.run('Engine.generate(argument).models.F1.beams.some(b=>b.id==="D1")',rect));
 const noDiagonal=square();noDiagonal.types.F1.beams=noDiagonal.types.F1.beams.filter(b=>b.id!=='D1');assert(!c.run('Engine.generate(argument).models.F1.diagonal315',noDiagonal));
 // Undoing an outline retains the independent diagonal and restores the full footprint.
 const removed=c.run(`(()=>{const p=argument;delete p.types.F1.diagonal315;return Engine.generate(p).models.F1})()`,fixture(c));assert(removed.beams.some(b=>b.id==='D1'));near(c.run('Diagonal315.sum(argument.floorPolygons315)',removed),81);
 const opening=c.run(`(()=>{const m=Engine.generate(argument).models.F1;m.ts=[{x0:0,x1:3,y0:0,y1:9,state:1},{x0:3,x1:6,y0:0,y1:9,state:2},{x0:6,x1:9,y0:0,y1:9,state:1}];try{Diagonal315.checkBeam([0,1],[9,8],m);return ''}catch(e){return e.message}})()`,noDiagonal);assert.match(opening,/Opening/);
 const missing=c.run(`(()=>{const p=argument;p.types.F1.beams=p.types.F1.beams.filter(b=>b.id==='D1');const r=Engine.generate(p);return r.models.F1.slabs.map(s=>Diagonal315.slabSpan(s,s.direction116,r.models.F1))})()`,square());assert(missing.some(s=>s.errors.length),'Missing slab edges must remain unresolved');
 const lshape=c.run(`(()=>{const p=argument;p.axes.x.push({id:'3',gap:9});p.axes.y.push({id:'C',gap:9});p.types.F1.building={'0,0':true,'1,0':true,'0,1':true};const m=Engine.generate(p).models.F1;return {area:Diagonal315.sum(m.floorPolygons315),m}})()`,square());near(lshape.area,243);assert(lshape.m.beams.some(b=>b.id==='D1'));
 console.log('PASS direct diagonal without outline, unchanged building area, full rectangular outline, concave occupied grid, save/reopen, removal fallback and missing-support/Opening safeguards');
 // Default symbol calls retain the existing native report path; opt-in drawings
 // have exact beam hit polygons and slab symbols entirely inside actual slab pieces.
 const drawing=c.run(`(()=>{const p=argument,r=Engine.generate(p),m=r.models.F1,scale=40,v=FramingSymbols98.members(p,m,1,r,x=>x*scale,y=>y*scale,scale,{geometry318:true,drawingOffsets191:{}});return {m,v,svg:Drawing.svg(p,m,100,true,{}, {size:'A3',floor:1})}})()`,square());
 for(const h of drawing.v.hits.filter(h=>h.kind!=='COL'))assert(h.polygon315);
 for(const s of drawing.m.slabs){const shapes=drawing.v.shapes.filter(v=>v.slabMark99===s.id),bb=shapes[0].slabBounds99;assert(s.polygons315.some(poly=>c.run('Diagonal315.rectangle(argument.bb).every(q=>Diagonal315.inside(q,argument.poly))',{bb:Object.fromEntries(Object.entries(bb).map(([k,v])=>[k,v/40])),poly})));}
 assert(drawing.svg.includes('<polygon'));
 const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../framing-symbols98.js'),'utf8');
 c.run(source.replace('const FramingSymbols98=','const Symbols318Test=').replace('return {beamRects108,','return {scene,beamRects108,'));
 const voided=c.run(`(()=>{const p=argument,r=Engine.generate(p);Engine.removeMember(p,'F1',{kind:'SLAB',slabId:r.models.F1.slabs[0].id});const next=Engine.generate(p),m=next.models.F1;return {p,m,scene:Symbols318Test.scene(p,m,1,next,x=>x,y=>y,1,{geometry318:true,drawingOffsets191:{}}),svg:Drawing.svg(p,m,100,true,{}, {size:'A3',floor:1})}})()`,square());
 assert(voided.svg.includes('NO SLAB'));assert.equal(voided.m.slabs.length,1);
 const voidLines=voided.scene.shapes.filter(s=>s.type==='line'&&s.void318);assert(voidLines.length>0);for(const l of voidLines)assert(c.run('[[argument.x,argument.y],[argument.x2,argument.y2]].every(q=>Diagonal315.inside(q,argument.void318))',l),'No-slab lines stay inside the actual polygon');
 console.log('PASS diagonal drawing polygons, interior slab marks, exact no-slab export and independent saved geometry');
}
