// Exercise shipped snap/creation code, including diagonal-outline bypass protection.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const functions=app.slice(app.indexOf(' function gridPoint(q)'),app.indexOf(' function tileAt(q)'));
const creation=app.slice(app.indexOf("  if(['walls','beams','beamLayout'].includes(tab)&&g){"),app.indexOf("  if(['beams','beamLayout'].includes(tab)&&start&&!g)"));
const result=c.run(`(()=>{
 let p,key='F1',floor=1,tab='beamLayout',beamKind='MB',beamDiagonal337=false,start,result,plot={scale:50},showColumnGrid=false;
 const reset=()=>{p=Engine.clone(loading115Tests().projects.slab);let t=p.types.F1;t.beams=[];t.walls=[];t.columns=[{id:'A',x:2,y:1.5,b:250,d:250,on:true,status:'上下贯通'},{id:'D',x:4,y:3,b:250,d:250,on:true,status:'上下贯通'}];start=[2,1.5];result=Engine.generate(p);};reset();
 ${functions}
 const checks=[],check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
 check('Off rejects diagonal column',beamPoint([4,3])===null);
 beamDiagonal337=true;check('On accepts diagonal column',beamPoint([4,3])?.x===4);
 beamDiagonal337=false;
 p.types.F1.columns.push({id:'NEAR',x:2.1,y:4,b:100,d:100,on:true,status:'上下贯通'});result=Engine.generate(p);
 const near=beamPoint([2.1,4]);check('Off ignores closer off-axis column and selects vertical grid',near&&near.x===2&&near.y===4);
 const create=(kind,allowed,force=false)=>{reset();beamKind=kind;beamDiagonal337=allowed;const t=p.types.F1,g=force?{x:4,y:3}:beamPoint([4,3]);let error=null;const refresh=()=>{},toast=()=>{},nextId=(_,prefix)=>prefix+'337',transact=fn=>{try{fn();result=Engine.generate(p);return true;}catch(e){error=e.message;return false;}};(()=>{${creation}})();return {error,beams:t.beams};};
 for(const k of ['MB','SB','TB','CB']){const off=create(k,false),guard=create(k,false,true),on=create(k,true);check(k+' off creates no diagonal',off.beams.length===0);check(k+' final guard rejects forced diagonal',guard.beams.length===0&&guard.error?.includes('斜梁已關閉'));check(k+' on creates exact diagonal',on.beams.length===1&&on.beams[0].z.x===4&&on.beams[0].z.y===3);}
 reset();p.types.F1.diagonal315={outline:[[0,0],[6,0],[6,4],[0,4]],direction:'X'};result=Engine.generate(p);beamDiagonal337=false;check('Existing diagonal outline cannot bypass off mode',beamPoint([4,3])===null);beamDiagonal337=true;check('Diagonal outline still accepts on mode',beamPoint([4,3])?.x===4);
 return checks;
})()`);
console.log(JSON.stringify({passed:result}));
