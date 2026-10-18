// Disposable browser/WebView2 profile only. The private runner supplies
// window.wall329Fixture; never embed a user project in this distributable test.
// Keep ok=false so the host cannot start its legacy automatic dialog sweep.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[],metrics:{}};
(async()=>{
 const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>Math.abs(a-b)<1e-6;
 const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),snapshot=()=>stable(StudioHost.get().p);
 const check=(name,value)=>{if(!value)throw Error(name);o.passed.push(name);};
 const guard=()=>{if($('#studio-confirm316')&&getComputedStyle($('#studio-confirm316')).display!=='none')throw Error('Unexpected confirmation: test will not answer it');};
 const tick=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(resolve,35))));
 const wait=async fn=>{const end=Date.now()+60000;while(!fn()){guard();if(Date.now()>end)throw Error('Column UI timeout');await new Promise(r=>setTimeout(r,25));}await tick();guard();};
 const click=async selector=>{guard();const e=$(selector);if(!e||e.disabled)throw Error('Missing/enabled control: '+selector);e.click();await tick();guard();};
 const nav=async()=>{StudioHost.navigate('columns');await tick();if(getComputedStyle($('#side')).display==='none'){await click('#mobile-inputs');}guard();};
 const replace=async input=>{let error;const ok=StudioHost.transact(()=>{const p=StudioHost.get().p;for(const key of Object.keys(p))delete p[key];Object.assign(p,clone(input));},e=>error=e,false,true);if(!ok)throw error||Error('Fixture transaction rejected');StudioHost.viewFloor(1);await nav();};
 const actual=()=>{const {result,floor,key}=StudioHost.get();return Engine.floorModel(result,floor,key);};
 const rect=q=>({x:q.cx??q.x,y:q.cy??q.y,w:q.b,d:q.d});
 const wallRect=w=>({x:(w.a[0]+w.z[0])/2,y:(w.a[1]+w.z[1])/2,w:near(w.a[1],w.z[1])?Math.abs(w.z[0]-w.a[0]):w.b,d:near(w.a[0],w.z[0])?Math.abs(w.z[1]-w.a[1]):w.b});
 const gap=(a,b)=>Math.hypot(Math.max(0,Math.abs(a.x-b.x)-(a.w+b.w)/2),Math.max(0,Math.abs(a.y-b.y)-(a.d+b.d)/2));
 const clear=(columns,walls)=>columns.every(q=>walls.every(w=>gap(rect(q),wallRect(w))>=Math.min(q.b,q.d)/2-1e-7));
 const sections=m=>m.columns.filter(q=>q.status!=='上层柱').map(q=>({id:q.id,...rect(q)}));
 const proto=CanvasRenderingContext2D.prototype,originalFill=proto.fillRect,originalStroke=proto.strokeRect,originalClip=proto.clip,originalRect=proto.rect,originalPlan=Drawing.plan;
 let plot=null,rectangles=[],clipped=false,lastClipRect=null;
 Drawing.plan=function(...args){rectangles=[];plot=originalPlan.apply(this,args);return plot;};
 proto.fillRect=function(...args){if(this.canvas?.id==='canvas'&&['#078163','#2879bd'].includes(this.strokeStyle)&&this.getLineDash().join(',')==='5,3')rectangles.push({kind:'fill',args:[...args]});return originalFill.apply(this,args);};
 proto.rect=function(...args){lastClipRect=[...args];return originalRect.apply(this,args);};
 proto.clip=function(...args){clipped=true;return originalClip.apply(this,args);};
 proto.strokeRect=function(...args){if(this.canvas?.id==='canvas'&&['#078163','#2879bd'].includes(this.strokeStyle))rectangles.push({kind:'stroke',args:[...args],clipped,clip:lastClipRect&&[...lastClipRect]});return originalStroke.apply(this,args);};
 try{
  if(!window.wall329Fixture?.types)throw Error('Runner must supply wall329Fixture');const supplied=stable(window.wall329Fixture);
  await replace(window.wall329Fixture);const initial=snapshot(),initialSections=sections(actual()),key=StudioHost.get().key;
  check('Private current model loaded on the Columns page',key==='F01'&&!!$('[data-scheme319-generate]'));
  check('Automatic wall-clearance guidance is visible',$('#side').textContent.includes('半個柱短邊'));
  $('#column-schemes319').open=true;await click('[data-scheme319-generate]');await wait(()=>!$('[data-scheme319-generate]')?.disabled&&!!$('[data-scheme319-preview]'));
  check('Generate/preview leaves the current model unchanged',snapshot()===initial);
  const host=StudioHost.get(),report=ColumnSchemes319.search(host.p,host.result,key),first=report.schemes[0];
  check('All proposed ordinary column footprints clear finite wall sides and ends',report.schemes.length>0&&report.schemes.every(s=>clear(s.columns,actual().walls)));
  await click('[data-scheme319-preview="'+first.id+'"]');StudioHost.repaint();await tick();
  const expected=first.columns.map(q=>[plot.ox+(q.x-q.b/2)*plot.scale,plot.oy+(q.y-q.d/2)*plot.scale,q.b*plot.scale,q.d*plot.scale]);
  const fills=rectangles.filter(q=>q.kind==='fill'),strokes=rectangles.filter(q=>q.kind==='stroke'),matches=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>near(v,b[i]));
  check('Preview fill uses the actual physical column section',fills.length===expected.length&&fills.every((q,i)=>matches(q.args,expected[i])));
  check('Preview outline has no extra 2px expansion and is clipped to the section',strokes.length===expected.length&&strokes.every((q,i)=>matches(q.args,expected[i])&&q.clipped&&matches(q.clip,expected[i])));
  await click('[data-scheme319-apply="'+first.id+'"]');await wait(()=>!$('[data-scheme319-generate]')?.disabled);
  check('Applying the preview creates exactly its displayed physical sections',actual().columns.filter(q=>q.status!=='上层柱').length===first.columns.length&&first.columns.every(q=>actual().columns.some(a=>near(rect(a).x,q.x)&&near(rect(a).y,q.y)&&near(a.b,q.b)&&near(a.d,q.d))));
  check('Applied columns remain clear of walls',clear(actual().columns.filter(q=>q.status!=='上层柱'),actual().walls));
  await click('#undo');check('One Undo restores the original model after applying a scheme',snapshot()===initial&&stable(sections(actual()))===stable(initialSections));
  await click('[data-action=auto-columns311]');check('Ordinary automatic placement enables wall avoidance',StudioHost.get().p.types[key].columnWallPolicy329===true);
  check('Ordinary automatic columns clear actual wall faces and ends',clear(actual().columns.filter(q=>q.status!=='上层柱'),actual().walls));
  const autoCount=actual().columns.filter(q=>q.status!=='上层柱').length;await click('#undo');check('One Undo restores the original model after automatic placement',snapshot()===initial);
  // Find a legal touching position on this actual model. Hand-entered columns
  // remain explicit user input, even when ordinary automation avoids that spot.
  const m=actual(),b=.5,d=.5,candidates=[];
  for(const wall of m.walls){const r=wallRect(wall);candidates.push({x:r.x-r.w/2-b/2,y:r.y,b,d},{x:r.x+r.w/2+b/2,y:r.y,b,d},{x:r.x,y:r.y-r.d/2-d/2,b,d},{x:r.x,y:r.y+r.d/2+d/2,b,d});}
  const manual=candidates.find(q=>!ColumnSchemes319.footprintProblem(StudioHost.get().p,key,m,q)&&Engine.columnWallClearance329({x:q.x,y:q.y,w:q.b,d:q.d},m.walls));
  check('Actual model provides a valid manual touching-wall test position',!!manual);
  const manualId='QA_MANUAL_WALL329';let error;const added=StudioHost.transact(()=>{const t=StudioHost.get().p.types[key];t.columns.push({id:manualId,x:manual.x,y:manual.y,b:b*1000,d:d*1000,on:true,status:'上下贯通',autoAdded:true});},e=>error=e);
  if(!added)throw error||Error('Manual fixture rejected');await tick();check('Manual touching-wall column remains visible with an explicit warning',actual().columns.some(q=>q.id===manualId)&&$('#side').textContent.includes(manualId)&&$('#side').textContent.includes('牆邊柱／承托提示'));
  const withManual=snapshot(),manualBefore=sections(actual()).find(q=>q.id===manualId);await click('[data-action=auto-columns311]');
  check('Automatic placement preserves manual touching-wall geometry',stable(sections(actual()).find(q=>q.id===manualId))===stable(manualBefore));
  check('Preserved manual column still has a visible wall warning',$('#side').textContent.includes(manualId)&&$('#side').textContent.includes('牆邊柱／承托提示'));
  await click('#undo');check('Automatic layout Undo preserves the manual input snapshot',snapshot()===withManual);await click('#undo');check('Temporary manual test Undo restores the current model exactly',snapshot()===initial);
  check('Injected private source model was never mutated',stable(window.wall329Fixture)===supplied);
  $('#column-schemes319').open=true;await click('[data-scheme319-generate]');await wait(()=>!$('[data-scheme319-generate]')?.disabled);
  o.metrics={model:StudioHost.get().p.name,key,schemes:report.schemes.map(s=>({id:s.id,label:s.label,count:s.columns.length})),automaticCount:autoCount,previewFootprints:expected.length,originalModelRestored:snapshot()===initial};o.uiOK=true;
 }catch(error){o.error=error.stack||String(error);}
 finally{Drawing.plan=originalPlan;proto.fillRect=originalFill;proto.strokeRect=originalStroke;proto.clip=originalClip;proto.rect=originalRect;o.done=true;}
})();
