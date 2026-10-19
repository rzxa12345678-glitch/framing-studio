const assert=require('node:assert/strict'),fs=require('node:fs');
const {context}=require('./audit-performance247.cjs'),{fixture,verifyPhysical}=require('./column-schemes319.cjs');
const c=context(),clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-7,near=(a,b)=>Math.abs(a-b)<1e-7,passed=[];
function search(p,key){const before=JSON.stringify(p),r=c.run('Engine.generate(Engine.clone(argument))',p),report=c.run('ColumnSchemes319.search(argument.p,argument.r,argument.key)',{p,r,key});assert.equal(JSON.stringify(p),before);return {r,report};}
function compare(p,key){const {r,report}=search(p,key),base=report.schemes.find(s=>s.family==='adjacent340'),s=report.schemes.find(s=>s.family==='local336');assert(base&&s,'inherited and aligned infill alternatives required');assert(base.columns.every(q=>s.columns.some(z=>same(q,z))));verifyPhysical(p,key,s.columns);return {r,report,base,s};}
{
 const p=fixture({levels:2,spacing:{}});for(const t of Object.values(p.types)){t.mode='manual';t.columns=[];t.columnFrozen311={columns:[]};}
 const xs=[.25,6.083333333,11.916666667,17.75],ys=[6,12];p.types.F2.columns=xs.flatMap((x,i)=>ys.map((y,j)=>({id:'U'+i+j,x,y,b:500,d:500,on:true,status:'上下贯通'})));
 const {s,base}=compare(p,'F1'),added=s.columns.filter(q=>!base.columns.some(z=>same(q,z)));assert(added.length>0);assert(added.every(q=>xs.some(x=>near(x,q.x))),'new rows must use inherited X centres, including sub-micrometre precision');passed.push('Infill extends inherited physical X axes exactly, including non-rounded centres');
 p.types.F1.noColumnZones=[{x0:5,x1:7,y0:0,y1:2}];const blocked=compare(p,'F1');assert(!blocked.s.columns.some(q=>q.x>5&&q.x<7&&q.y<2));assert(blocked.base.columns.every(q=>blocked.s.columns.some(z=>same(q,z))));passed.push('Forbidden position leaves a gap rather than shifting the row or existing column');
 const rotate=clone(p);for(const t of Object.values(rotate.types)){t.columns.forEach(q=>{[q.x,q.y]=[q.y,q.x];});t.noColumnZones=[];}const other=compare(rotate,'F1');assert(other.s.columns.filter(q=>!other.base.columns.some(z=>same(q,z))).every(q=>xs.some(y=>near(y,q.y))));passed.push('Rotated layout extends inherited Y axes with the same rule');
}
if(process.argv[2]){
 const file=process.argv[2],bytes=fs.readFileSync(file),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),{r,report,base,s}=compare(p,'F04');assert.equal(base.columns.length,28);assert.equal(s.columns.length,44);const added=s.columns.filter(q=>!base.columns.some(z=>same(q,z)));assert.equal(added.length,16);assert(added.every(q=>base.columns.some(z=>near(z.x,q.x))),'A/F infill does not align with inherited interior column rows');
 const q=clone(p);c.run('ColumnSchemes319.apply(argument.q,argument.r,"F04",argument.s,argument.report)',{q,r,s,report});const actual=c.run('Engine.model(argument,"F04").columns.filter(q=>q.status!=="上层柱").map(q=>Engine.columnRect(q))',q);assert(actual.every(a=>s.columns.some(z=>same(a,z))));for(const key of Object.keys(p.types))if(key!=='F04')assert.deepEqual(q.types[key],p.types[key]);assert.deepEqual(fs.readFileSync(file),bytes);passed.push('Current F04 retains 28 centres and adds 16 A/F edge columns on exactly the same X axes; applied geometry matches preview');
}
console.log(JSON.stringify({ok:true,passed},null,2));

