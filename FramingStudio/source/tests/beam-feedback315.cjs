const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'beam-layout116.js'),'utf8');
// Exercise delayed paint, duplicate submission, failure, focus and prior inert state.
const frames=[],timers=[],listeners=new Map(),status={dataset:{beamUpdate315:'F02'},setAttribute(){}};
const focus={isConnected:true,id:'',getAttribute(){return null},focus(){this.focused=true}},prior=[{inert:false},{inert:true}];
let mask,visible=false;
const document={activeElement:focus,body:{children:prior,appendChild(el){visible=true;mask=el;}},querySelectorAll(selector){return selector==='[data-beam-update315]'?[status]:[];},getElementById(){return null;},querySelector(){return null;},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name){listeners.delete(name)},createElement(){const p={textContent:''},section={focus(){}};return {querySelector:s=>s==='section'?section:p,remove(){visible=false}}}};
const ctx=vm.createContext({document,performance,requestAnimationFrame:fn=>frames.push(fn),setTimeout:fn=>timers.push(fn)});
vm.runInContext(source,ctx);const ui=vm.runInContext('BeamUpdate315',ctx);
async function paint(){assert(frames.length);frames.shift()();assert(frames.length);frames.shift()();timers.shift()();await Promise.resolve();}
(async()=>{
 let calls=0;const job=ui.run('F02',5,()=>{assert(visible);calls++;return {ok:true,count:5}});
 assert.equal(calls,0);assert(ui.busy());assert(prior.every(e=>e.inert));assert(mask.innerHTML.includes('progress'));
 assert.equal(await ui.run('F02',5,()=>{calls++}),false);await paint();assert.equal(calls,1);assert(ui.busy());
 let prevented=0;listeners.get('click')({preventDefault(){prevented++},stopImmediatePropagation(){prevented++}});assert.equal(prevented,2);
 await paint();assert.equal(await job,true);assert.equal(calls,1);assert(!visible&&!ui.busy());assert.deepEqual(prior.map(e=>e.inert),[false,true]);assert.equal(listeners.size,0);assert(focus.focused);assert(status.textContent.includes('已更新 5 根梁'));assert(status.textContent.includes('耗時'));
 for(const edit of [()=>({ok:false,error:'深度超過上限'}),()=>{throw Error('test exception')}]){const failed=ui.run('F02',5,edit);await paint();await paint();assert.equal(await failed,false);assert.equal(status.dataset.error,'true');assert(status.textContent.includes('未套用'));assert(!ui.busy());assert.equal(listeners.size,0);}
 const noop=ui.run('F02',1,()=>({ok:true,count:0}));await paint();await paint();await noop;assert(status.textContent.includes('未新增撤銷'));
 console.log('PASS paint before work, busy guard, queued clicks, five-member success, retained status, failure/exception cleanup, focus, inert restoration, no-op');
})().catch(e=>{console.error(e);process.exitCode=1});
