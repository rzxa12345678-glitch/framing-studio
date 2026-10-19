const assert=require('node:assert/strict'),fs=require('node:fs');
const {context}=require('./audit-performance247.cjs'),{fixture}=require('./column-schemes319.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),passed=[],same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-6;
function search(p,key){const before=JSON.stringify(p),r=c.run('Engine.generate(Engine.clone(argument))',p),report=c.run('ColumnSchemes319.search(argument.p,argument.r,argument.key)',{p,r,key});assert.equal(JSON.stringify(p),before);assert(report.schemes.length,report.messages.join(';'));return {r,report};}
function empty(p){for(const t of Object.values(p.types)){t.mode='manual';t.columns=[];t.columnFrozen311={columns:[]};}return p;}
const cols=points=>points.map(([x,y],i)=>({id:'C'+i,x,y,b:500,d:500,on:true,status:'上下贯通'}));
function first(p,key){const q=search(p,key),s=q.report.schemes[0];assert.equal(s.family,'adjacent340');return {...q,s};}
{
 const p=empty(fixture({levels:3,spacing:{x:4,y:4}}));p.types.F3.columns=cols([[2,2],[8,2],[14,2],[2,8],[8,8],[14,8]]);
 const {r,report,s}=first(p,'F2');assert.equal(s.columns.length,6);assert.equal(s.metrics.unalignedAbove,0);assert(s.support330.some(q=>['transfer','missing'].includes(q.kind)));assert.equal(s.routes334.length,0);
 const q=clone(p);c.run('ColumnSchemes319.apply(argument.q,argument.r,"F2",argument.s,argument.report)',{q,r,s,report});assert.deepEqual(q.types.F1,p.types.F1);assert.deepEqual(q.types.F3,p.types.F3);assert(q.types.F2.columnSchemeReview330);passed.push('Upper-only floor continues all six legal centres and retains unresolved lower support, without invented TB');
 p.types.F1.columns=cols([[2,2],[8,2],[14,2],[2,8],[8,8],[14,8]]);const both=first(p,'F2');assert.equal(both.s.columns.length,6);assert.equal(both.s.metrics.unalignedAbove+both.s.metrics.unalignedBelow,0);passed.push('Common upper/lower centres align both sides without duplicate columns');
 p.types.F2.noColumnZones=[{x0:7,x1:9,y0:7,y1:9}];const blocked=first(p,'F2');assert.equal(blocked.report.reuse340.geometry,1);assert(!blocked.s.columns.some(q=>same(q,{x:8,y:8})));assert.equal(blocked.s.columns.length,5);passed.push('Forbidden adjacent position is skipped; other five positions do not move');
 p.types.F2.columns=cols([[12,14]]);const fixed=first(p,'F2');assert(fixed.s.columns.some(q=>same(q,{x:12,y:14})&&q.locked));passed.push('Manual/fixed column retained while adjacent centres are inherited');
}
{
 const p=empty(fixture({levels:3,spacing:{x:4,y:4}}));p.types.F1.columns=cols([[2,2],[8,2]]);p.types.F3.columns=cols([[3,2],[8,2],[14,2]]);const {s,report}=first(p,'F2');assert(s.columns.some(q=>same(q,{x:2,y:2})));assert(!s.columns.some(q=>same(q,{x:3,y:2})));assert(s.columns.some(q=>same(q,{x:14,y:2})));assert.equal(report.reuse340.spacing,1);passed.push('Conflicting upper/lower centres prefer common and direct lower supports, with spacing exclusion counted');
 const lower=clone(p);lower.types.F3.columns=[];const lo=first(lower,'F2');assert.equal(lo.s.metrics.unalignedBelow,0);passed.push('Lower-only reuse retains both legal centres');
 const blank=empty(fixture());const local=search(blank,'F1').report.schemes[0];assert(local.columns.length>4);assert.notEqual(local.family,'adjacent340');passed.push('No adjacent columns retains regular-grid fallback');
}
if(process.argv[2]){
 const bytes=fs.readFileSync(process.argv[2]),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),results=[];
 for(const key of ['F01','F03','F04','F05','F08']){const {r,report}=search(p,key),s=report.schemes[0];if(key==='F04'){assert.equal(s.family,'adjacent340');assert.equal(s.metrics.unalignedAbove,0);assert.equal(report.reuse340.retained,28);assert.equal(s.columns.length,28);}
  for(const scheme of report.schemes){const q=clone(p);if(!scheme.unchanged)c.run('ColumnSchemes319.apply(argument.q,argument.r,argument.key,argument.s,argument.report)',{q,r,key,s:scheme,report});for(const k of Object.keys(p.types))if(k!==key)assert.deepEqual(q.types[k],p.types[k]);assert.deepEqual(clone(q.types[key].beams),p.types[key].beams);}
  results.push({key,reuse:report.reuse340,schemes:report.schemes.map(s=>({family:s.family,columns:s.columns.length,unalignedAbove:s.metrics.unalignedAbove,unalignedBelow:s.metrics.unalignedBelow,unresolved:s.unresolved334}))});
 }
 assert.deepEqual(fs.readFileSync(process.argv[2]),bytes);console.log(JSON.stringify({currentModel:results}));passed.push('Current model G/F, F03, F04, F05 and F08 preview/application preserve other Framings and beams; F04 inherits all 28 upper columns');
}
console.log(JSON.stringify({ok:true,passed},null,2));

