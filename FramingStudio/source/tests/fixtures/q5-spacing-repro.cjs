// Portable synthetic reproduction of the recorded Q5 column-spacing defect.
// Only the recorded centres (47, 5.5), (46.5, 12) and 7 m minimum come from
// the defect report. The surrounding grid/wall are synthetic test geometry.
// This is NOT the missing original Q5 model or a verified engineering scheme.
const {fixture}=require('../column-schemes319.cjs');
module.exports=function q5SpacingRepro(){
 const p=fixture({levels:2,spacing:{x:7,y:7}});
 p.name='Q5 spacing defect - synthetic regression';
 p.axes={
  x:[{id:'1',gap:0},{id:'2',gap:12},{id:'3',gap:12},{id:'4',gap:12},{id:'5',gap:10.5},{id:'6',gap:13.5}],
  y:[{id:'A',gap:0},{id:'B',gap:5.5},{id:'C',gap:6.5},{id:'D',gap:9},{id:'E',gap:9}]
 };
 p.types={F04:p.types.F1,F05:p.types.F2};
 p.groups[0].type='F04';p.groups[1].type='F05';
 for(const t of Object.values(p.types)){
  t.building=Object.fromEntries(Array.from({length:20},(_,i)=>[Math.floor(i/4)+','+i%4,true]));
  t.walls=[{id:'W_SYNTHETIC',a:{x:24,y:12},z:{x:24,y:21},b:300,on:true}];
 }
 p.types.F04.mode='manual';
 p.types.F04.columns=[{id:'LOWER',x:46.5,y:12,b:500,d:500,on:true,status:'上下贯通'}];
 p.types.F05.columns=[{id:'PINNED',x:47,y:5.5,b:500,d:500,on:true,status:'上下贯通',autoAdded:true}];
 p.types.F05.suppressedColumns=[{ax:'2',ay:'D'}];
 return p;
};
