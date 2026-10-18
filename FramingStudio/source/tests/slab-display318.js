// Run in the packaged EXE's isolated WebView2 test profile. Fixtures are supplied
// by the caller; no production model or stored browser data is used or changed.
window.confirmSmoke316={done:false,ok:false,passed:[]};
(async()=>{
 const out=window.confirmSmoke316,$=s=>document.querySelector(s),check=(s,v)=>{if(!v)throw Error(s);out.passed.push(s);},wait=async fn=>{const end=Date.now()+15000;while(!fn()){if(Date.now()>end)throw Error('UI timeout');await new Promise(r=>setTimeout(r,25));}},tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),click=async s=>{$(s).click();await tick();},model=()=>JSON.stringify(StudioHost.get().p);
 const colours=()=>{const c=$('#canvas'),a=c.getContext('2d').getImageData(0,0,c.width,c.height).data,n={yellow:0,grey:0,white:0};for(let i=0;i<a.length;i+=4){if(a[i]===243&&a[i+1]===237&&a[i+2]===214)n.yellow++;if(a[i]===237&&a[i+1]===240&&a[i+2]===243)n.grey++;if(a[i]===255&&a[i+1]===255&&a[i+2]===255)n.white++;}return n;};
 const importFixture=async p=>{const d=new DataTransfer();d.items.add(new File([JSON.stringify(p)],'display-qa.framing.json',{type:'application/json'}));$('#file').files=d.files;$('#file').dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>$('#studio-confirm316')||$('#project-name').textContent===p.name);if($('#studio-confirm316'))await click('[data-confirm316=ok]');await wait(()=>$('#project-name').textContent===p.name);await tick();};
 const originalThree=Drawing.three;let slabFaces=0;Drawing.three=function(...args){const result=originalThree.apply(this,args);slabFaces=result.hits.filter(x=>x.kind==='SLAB').length;return result;};
 try{
  await importFixture({...qaCurrent318,name:'Current model display QA'});await click('[data-tab=regions]');await click('#plan');
  const before=model(),resultBefore=JSON.stringify(StudioHost.get().result);
  check('Region plan fill is checked and fixed',$('[data-kind=SLAB]').checked&&$('[data-kind=SLAB]').disabled);
  check('Current model building extent actually renders yellow',colours().yellow>1000);
  await click('[data-tab=columns]');check('Other plan pages retain default unfilled preference',!$('[data-kind=SLAB]').checked&&!$('[data-kind=SLAB]').disabled&&colours().yellow===0);
  await click('[data-kind=SLAB]');check('Plan checkbox renders yellow',colours().yellow>1000);
  await click('#three');check('Plan fill does not enable 3D slab bodies',!$('#slab-body318').checked&&slabFaces===0);
  await click('#slab-body318');await click('#plan');await click('[data-kind=SLAB]');
  check('Disabling plan fill retains independent 3D preference',$('#slab-body318').checked&&!$('[data-kind=SLAB]').checked&&colours().yellow===0);
  await click('[data-tab=regions]');check('Returning to regions forces yellow without changing preference',colours().yellow>1000&&$('[data-kind=SLAB]').disabled);
  await click('[data-tab=columns]');check('Leaving regions restores unfilled preference',!$('[data-kind=SLAB]').checked&&colours().yellow===0);
  check('Display toggles preserve complete current project',model()===before);
  check('Display toggles preserve generated calculation model',JSON.stringify(StudioHost.get().result)===resultBefore);
  const mixed=structuredClone(qaCurrent318),t=mixed.types[Object.keys(mixed.types)[0]];mixed.name='Opening and outside display QA';t.opening['0,0']=true;delete t.building['2,2'];
  await importFixture(mixed);await click('[data-tab=regions]');const c=colours();check('Opening stays white; outside stays grey; extent stays yellow',c.white>1000&&c.grey>1000&&c.yellow>1000);
  await importFixture({...qaDiagonal318,name:'Diagonal slab display QA'});await click('[data-tab=regions]');check('Diagonal extent renders yellow',colours().yellow>1000);
  const diagonalBefore=model();await click('#three');check('Enabled 3D checkbox produces actual slab faces',slabFaces>0);await click('#slab-body318');check('Disabled 3D checkbox removes slab faces',slabFaces===0);await click('#plan');check('3D toggle does not hide region fill',colours().yellow>1000);
  check('Diagonal model is unchanged by display toggles',model()===diagonalBefore);
  out.ok=true;StudioDialogs316.notice(out.passed.length+' display checks passed','E2.318 display verification');
 }catch(e){out.error=e.stack||String(e);}finally{Drawing.three=originalThree;out.done=true;}
})();
