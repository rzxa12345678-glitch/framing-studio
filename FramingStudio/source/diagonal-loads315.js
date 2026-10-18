// Exact integration of nonnegative piecewise linear line loads.
// The legacy constant-load solver remains untouched unless a varying load exists.
const DiagonalLoads315=(()=>{
 const varying=l=>Number.isFinite(l.gEnd315)||Number.isFinite(l.qEnd315);
 const reverse=(l,L)=>({...l,start:L-l.end,end:L-l.start,...(varying(l)?{g:l.gEnd315??l.g,q:l.qEnd315??l.q,gEnd315:l.g,qEnd315:l.q}:{})});
 function diagram(L,rows,{reverse:flip=false,cb=false,fixedEnd=null,service=false}={}){
  if(!(L>0)||cb&&!['a','z'].includes(fixedEnd))throw Error('跨度／固定端待确认');const points=[],lines=[];
  for(let r of rows){if(flip)r=r.x==null?reverse(r,L):{...r,x:L-r.x};const f=service?[1,1]:[1.4,1.6],v=f[0]*r.g+f[1]*r.q,w=f[0]*(r.gEnd315??r.g)+f[1]*(r.qEnd315??r.q);if(!Number.isFinite(v)||v<0||!Number.isFinite(w)||w<0)throw Error('线性荷载端值无效');if(r.x!=null){if(!Number.isFinite(r.x)||r.x<0||r.x>L)throw Error('集中荷载位置无效');points.push({x:r.x,v});}else{if(!(r.start>=0&&r.end>r.start&&r.end<=L+1e-7))throw Error('线荷载位置无效');lines.push({a:r.start,b:Math.min(L,r.end),v,k:(w-v)/(r.end-r.start)});}}
  const force=(l,t)=>l.v*t+l.k*t*t/2,localMoment=(l,t)=>l.v*t*t/2+l.k*t**3/3;
  const total=points.reduce((s,p)=>s+p.v,0)+lines.reduce((s,l)=>s+force(l,l.b-l.a),0),moment=points.reduce((s,p)=>s+p.v*p.x,0)+lines.reduce((s,l)=>s+l.a*force(l,l.b-l.a)+localMoment(l,l.b-l.a),0),fixedLeft=cb&&((fixedEnd==='a')!==flip),RA=cb?(fixedLeft?total:0):total-moment/L,RB=total-RA,M0=fixedLeft?-moment:0;
  const at=x=>{x=Math.max(0,Math.min(L,x));let V=RA,M=M0+RA*x;for(const l of lines){const t=Math.max(0,Math.min(x,l.b)-l.a),F=force(l,t);V-=F;M-=(x-l.a)*F-localMoment(l,t);}const before=V-points.filter(p=>p.x<x).reduce((s,p)=>s+p.v,0),after=V-points.filter(p=>p.x<=x).reduce((s,p)=>s+p.v,0);M-=points.reduce((s,p)=>s+p.v*Math.max(0,x-p.x),0);return {x,before,after,M};};
  const cuts=[...new Set([0,L,...points.map(p=>p.x),...lines.flatMap(l=>[l.a,l.b])])].sort((a,b)=>a-b),critical=[...cuts],segments=[];
  for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i],mid=(a+b)/2,ls=lines.filter(l=>l.a<mid&&l.b>mid),q0=ls.reduce((s,l)=>s+l.v+l.k*(a-l.a),0),k=ls.reduce((s,l)=>s+l.k,0);segments.push({a:at(a),b:at(b),mid:at(mid),q0,k});if(at(a).after>0&&at(b).before<0){let lo=a,hi=b;for(let j=0;j<60;j++){const x=(lo+hi)/2;if(at(x).after>0)lo=x;else hi=x;}critical.push((lo+hi)/2);}}
  const sections=critical.sort((a,b)=>a-b).map(at),extreme=vs=>({min:vs.reduce((a,b)=>a.value<b.value?a:b),max:vs.reduce((a,b)=>a.value>b.value?a:b)}),V=extreme(sections.flatMap(s=>[...(s.x>0?[{x:s.x,value:s.before}]:[]),...(s.x<L?[{x:s.x,value:s.after}]:[])])),M=extreme(sections.map(s=>({x:s.x,value:s.M})));
  return {L,RA,RB,M0,cb,fixedLeft,total,moment,cuts,sections,segments,at,V,M,linear315:true};
 }
 function actions(L,gd,ql,points,cb,lines){const rows=[{start:0,end:L,g:gd,q:ql},...points,...lines],one=(gf,qf)=>{const d=diagram(L,rows.map(r=>({...r,g:gf*r.g+qf*r.q,q:0,...(varying(r)?{gEnd315:gf*(r.gEnd315??r.g)+qf*(r.qEnd315??r.q),qEnd315:0}:{})})),{service:true,cb,fixedEnd:cb?'a':null});return {left:d.RA,right:d.RB,M:Math.max(Math.abs(d.M.min.value),Math.abs(d.M.max.value)),V:Math.max(Math.abs(d.V.min.value),Math.abs(d.V.max.value))};},dead=one(1,0),live=one(0,1);return {dead,live,...one(1.4,1.6),factoredDead:one(1.4,0),factoredLive:one(0,1.6),fullPrecision208:true,linear315:true,udlDead:gd,udlLive:ql,points,lines,totalDead:dead.left+dead.right,totalLive:live.left+live.right};}
 // Existing Excel accepts constant segments. Split at every governing section,
 // then use two positive half-segment UDLs with equal force and first moment.
 // This preserves reactions, total G/Q and governing ULS M/V exactly, without
 // changing Excel formulas or pretending the intervening curve is identical.
 function nativeLines(L,gd,ql,points,cb,lines){if(!lines.some(varying))return lines;const d=diagram(L,[{start:0,end:L,g:gd,q:ql},...points,...lines],{cb,fixedEnd:cb?'a':null}),cuts=d.sections.map(s=>s.x),out=[];for(const r of lines){if(!varying(r)){out.push(r);continue;}const xs=[r.start,...cuts.filter(x=>x>r.start+1e-9&&x<r.end-1e-9),r.end];for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],mid=(a+b)/2,vals=k=>{const v=r[k],s=((r[k==='g'?'gEnd315':'qEnd315']??v)-v)/(r.end-r.start),lo=v+s*(a-r.start),delta=s*(b-a);return [Math.max(0,lo+delta/6),Math.max(0,lo+5*delta/6)];},g=vals('g'),q=vals('q');for(let j=0;j<2;j++)out.push({start:j?mid:a,end:j?b:mid,g:g[j],q:q[j],label:r.label});}}return out;}
 function display(rows){const out=[];for(const r of rows){if(!r.polygonLoad315||r.x!=null){out.push(r);continue;}const prior=out.find(v=>v.parts315&&v.label===r.label&&v.auto===r.auto);if(prior){prior.parts315.push(r);prior.start=Math.min(prior.start,r.start);prior.end=Math.max(prior.end,r.end);}else out.push({...r,parts315:[r]});}return out;}
 return {varying,reverse,diagram,actions,nativeLines,display};
})();
if(typeof module!=='undefined')module.exports=DiagonalLoads315;
