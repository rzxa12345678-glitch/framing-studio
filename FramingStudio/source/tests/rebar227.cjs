// DOM-only integration test (no browser). Install linkedom 0.18.12 and set NODE_PATH.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>');
// linkedom's select has a getter only; supply the browser-standard value setter.
const descriptor=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value');
if(!descriptor.set)Object.defineProperty(window.HTMLSelectElement.prototype,'value',{...descriptor,set(value){const options=[...this.querySelectorAll('option')];for(const o of options)o.removeAttribute('selected');const selected=options.find(o=>o.value===String(value));if(selected)selected.setAttribute('selected','');}});
c.ctx.document=document;c.ctx.setTimeout=setTimeout;c.ctx.clearTimeout=clearTimeout;
// linkedom does not switch to HTMLInputElement inside SVG foreignObject.
Object.defineProperty(window.SVGElement.prototype,'value',{configurable:true,get(){return this.getAttribute('value')||'';},set(v){this.setAttribute('value',String(v));}});
let active234=null;Object.defineProperty(document,'activeElement',{get(){return active234?.isConnected?active234:document.body;}});
window.SVGElement.prototype.focus=function(){active234=this;};window.SVGElement.prototype.setSelectionRange=function(a,b){this.selectionStart=a;this.selectionEnd=b;};
const pending=[],listen=document.addEventListener.bind(document);document.addEventListener=(type,fn,...args)=>listen(type,e=>{const p=fn(e);if(p?.then)pending.push(p);},...args);
const $=s=>document.querySelector(s),input=(id,value)=>{const el=$('#'+id);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));};
async function click(s){$(s).dispatchEvent(new window.Event('click',{bubbles:true}));await Promise.all(pending.splice(0));}
(async()=>{
 c.run(`globalThis.test227={p:Engine.clone(argument),floor:1,key:'F1',messages:[]};test227.result=Engine.generate(test227.p);test227.host={get:()=>test227,repaint(){},refresh(){},toast:s=>test227.messages.push(s),transact(fn){fn();return true;},floor(f){test227.floor=f;},focusMember(){}};test227.ui=ExplorerUI(test227.host);test227.ui.selectPlanMember({kind:'MB',id:'B1'});`,fixture.p);
 const render=()=>c.run(`(()=>{const t=test227;document.getElementById('side').innerHTML=t.ui.render('checks');BeamRebar116.decorate({...t,selected:{kind:'MB',id:'B1'},memberResult:(f,k)=>t.ui.getMemberResult227(t.p,f,k)});})()`);
 render();assert.equal($('.rebar-rc227').textContent,'RC 待計算');assert.equal($('#beam-rebar116 svg circle'),null);assert($('.rebar-summary227').textContent.includes('待自動選筋'));
 await c.run('test227.ui.calculate()');render();assert(!$('.rebar-rc227').textContent.includes('待計算'));
 for(const [side,part]of [['upper','top'],['lower','bottom']])assert.equal($('[data-required234='+side+']').textContent,c.run('BeamRebar116.required234(test227.ui.getOutput().rows.find(r=>r.id==="B1"),argument,false)',part));
 assert($('[data-member-deflection231]').textContent.includes('δmax ='));
 // Member deflection uses the same emphasis and existing strict L/250 criterion.
 c.run('globalThis.originalDeflection232=BeamLoadUI.summary211');
 for(const [max,status,colour] of [[39.999,'OK','#176b46'],[40,'NOT OK','#b42318'],[41,'NOT OK','#b42318']]){
  c.run('BeamLoadUI.summary211=((max)=>()=>({state:"available",L:10,max}))(argument)',max);render();
  const box=$('[data-member-deflection231] .sizing-result176');assert(box.textContent.endsWith(status));assert(box.getAttribute('style').includes(colour));
  for(const rule of ['font-size:22px','font-weight:700','padding:12px','border-left:4px solid'])assert(box.getAttribute('style').includes(rule));
 }
 c.run('BeamLoadUI.summary211=()=>({state:"missing",reason:"No current loading"})');render();assert($('[data-member-deflection231]').textContent.includes('待確認'));assert($('[data-member-deflection231]').textContent.includes('No current loading'));assert(!$('[data-member-deflection231]').textContent.includes('δmax'));
 c.run('BeamLoadUI.summary211=originalDeflection232');render();

 const detail235=$('[data-beam-detail235]');assert(detail235&&!detail235.hasAttribute('open'));assert(detail235.querySelector('h3'));assert(detail235.querySelector('table'));assert.equal(detail235.querySelector('.notice'),null,'Repeated reinforcement prose removed');assert(![...document.querySelectorAll('#side > h3')].some(h=>h.textContent.includes('B1 ·')),'Raw result heading is only inside details');
 assert.equal($('select#ex-steel-mode'),null);assert.equal($('#ex-steel-mode').getAttribute('type'),'hidden');assert($('#rebar-mode235').textContent.includes('自動'));assert($('#beam-rebar116 [data-ex=auto-steel]'));
 const previousRC=$('.rebar-rc227').textContent,previousDiagram=$('#beam-rebar116 svg').outerHTML,previousDeflection=$('[data-member-deflection231]').textContent;
 $('#ex-steel-mode').dispatchEvent(new window.Event('change',{bubbles:true}));assert.equal($('.rebar-rc227').textContent,previousRC,'No-op AUTO change must not dirty RC');assert.equal($('#beam-rebar116 svg').outerHTML,previousDiagram);
 const scopeSnapshot=c.run('JSON.stringify(test227.p)');
 for(const selector of ['#ex-include','[data-report=A]','[data-report=B]']){
  const el=$(selector);el.checked=!el.checked;el.dispatchEvent(new window.Event('change',{bubbles:true}));render();
  assert.equal($('.rebar-rc227').textContent,previousRC,'Scope change retains RC');assert.equal($('#beam-rebar116 svg').outerHTML,previousDiagram);assert.equal($('[data-member-deflection231]').textContent,previousDeflection);
  const parity=c.run('test227.ui.getOutput().rows.every(row=>row.checked===(test227.p.explorer.selected[row.floor+"|"+row.token]===true))');assert(parity,'Check scope must update checked rows');
 }

 const key233=c.run("(()=>{const t=test227,m=Loading.members(t.p,t.result,1).find(m=>m.id==='B1'),key='1|'+m.token;for(const k of ['selected','reportA','reportB'])t.p.explorer[k][key]=true;return key;})()");render();
 const removalSnapshot233=c.run('JSON.stringify(test227.p)'),model233=c.run('JSON.stringify(test227.p.types)'),inputs233=c.run('JSON.stringify(test227.p.explorer.members)');
 const removeSelector233='[data-ex="remove-member233"][data-token="'+key233.slice(2)+'"]',remove233=$(removeSelector233);assert(remove233);assert.equal(remove233.closest('td'),remove233.closest('tr').firstElementChild,'Remove action is visible in the first column');
 await click(removeSelector233);render();
 assert(c.run("['selected','reportA','reportB'].every(k=>!test227.p.explorer[k][argument])",key233));assert.equal(c.run('JSON.stringify(test227.p.types)'),model233);assert.equal(c.run('JSON.stringify(test227.p.explorer.members)'),inputs233);assert.equal($(removeSelector233),null);assert.equal($('.rebar-rc227').textContent,previousRC,'Removal does not invalidate calculations');
 c.run('test227.p=JSON.parse(argument)',removalSnapshot233);render();assert($(removeSelector233),'Undo restores list item');
 c.run('test227.p=JSON.parse(argument);',scopeSnapshot);render();assert.equal($('.rebar-rc227').textContent,previousRC,'Undo of selection retains result');
 const summary=c.run('test227.ui.beamInputs(null)');assert(!summary.includes('以下為上次檢查結果'),'Scope changes do not stale Summary');c.run("test227.ui.selectPlanMember({kind:'MB',id:'B1'});");render();
 input('ex-top-counts','99');$('#ex-steel-mode').value='AUTO';$('#ex-steel-mode').dispatchEvent(new window.Event('change',{bubbles:true}));assert.equal($('.rebar-rc227').textContent,previousRC);assert.equal($('#beam-rebar116 svg').outerHTML,previousDiagram,'Returning to original AUTO restores original bars');
 assert.equal(document.querySelectorAll('#beam-rebar116 .rebar-editor116').length,4);assert.equal(document.querySelectorAll('#beam-rebar116 [hidden]').length,1);assert($('.rebar-fields227').hasAttribute('hidden'));assert.equal(document.querySelectorAll('[data-inline-rebar234]').length,18);assert($('#beam-rebar116 [data-ex=steel]'));assert.equal(document.querySelectorAll('[data-rebar-edit]').length,0);
 const ids=Array.from(document.querySelectorAll('[id]'),x=>x.id);assert.equal(ids.length,new Set(ids).size);
 const before=c.run('JSON.stringify(test227.p)'),maps=c.run('JSON.stringify([test227.p.explorer.selected,test227.p.explorer.reportA,test227.p.explorer.reportB])');
 input('ex-top-counts','2, 0, 0, 0, 1');input('ex-top-dia','20');input('ex-bottom-counts','4, 3');input('ex-bottom-dia','25');input('ex-link-space','150');
 assert.equal($('#ex-steel-mode').value,'MANUAL');assert($('#rebar-mode235').textContent.includes('手動（已修改，待保存）'));assert.equal($('.rebar-rc227').textContent,'RC 待重新檢查');assert.equal($('.rebar-rc227').dataset.tone,'pending');assert($('[data-rebar-upper]').textContent.includes('第 5 層 1T20'));assert($('[data-rebar-lower]').textContent.includes('4T25'));assert.equal(c.run('JSON.stringify(test227.p)'),before,'Draft does not mutate saved project');

 assert($('#beam-rebar116 svg [data-rebar-layer232="upper"][data-layer="5"]').textContent.includes('5 · 1T20'));
 assert($('#beam-rebar116 svg [data-rebar-layer232="lower"][data-layer="1"]').textContent.includes('4T25'));
 assert.equal($('[data-inline-rebar234=shear]').value,$('#ex-link-legs').value+'T'+$('#ex-link-dia').value+'@150');
 // Edit directly in the diagram. Hidden original fields remain the single save source.
 const inline234=(key,value)=>{const el=$('[data-inline-rebar234="'+key+'"]');el.focus();el.value=value;el.setSelectionRange(value.length,value.length);el.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(document.activeElement.dataset.inlineRebar234,key);assert.equal(document.activeElement.selectionStart,value.length);assert.equal(document.activeElement.value,value);};
 assert($('[data-required234=upper]').textContent.includes('As req'));
 const req234=c.run('(()=>{const t=test227,r=t.ui.getOutput().rows.find(r=>r.id==="B1");return {upper:BeamRebar116.required234(r,"top",false),lower:BeamRebar116.required234(r,"bottom",false),raw:r.result.values.K36};})()');
 assert.equal(typeof req234.raw,'number');assert(req234.upper.includes('mm²'));
 for(const value of ['1','18','18T','18T4','18T40'])inline234('top:0',value);
 inline234('top:0','2T20');inline234('bottom:0','4T25');inline234('shear','2T10@150');inline234('torsion','2T8@100');
 assert.equal($('#ex-top-counts').value.split(',')[0],'2');assert.equal($('#ex-link-space').value,'150');assert.equal($('#ex-tor-space').value,'100');
 assert($('[data-required234=upper]').textContent.startsWith('上次 '));assert($('[data-required234=upper]').textContent.includes('待更新'));
 for(const [key,bad] of [['top:0','2T'],['top:0','2T99'],['shear','2T10@75'],['torsion','0T8@100']]){const unchanged=c.run('JSON.stringify(test227.p)');inline234(key,bad);assert.equal($('[data-inline-rebar234="'+key+'"]').getAttribute('aria-invalid'),'true');await click('[data-ex=steel]');assert.equal(c.run('JSON.stringify(test227.p)'),unchanged,'Invalid inline edit cannot save the previous valid value');inline234(key,key==='top:0'?'2T20':key==='shear'?'2T10@150':'2T8@100');}
 inline234('top:4','1T25');assert.equal($('#ex-top-dia').value,'25');assert.equal($('[data-inline-rebar234="top:0"]').value,'2T25','Diameter change synchronizes the same face');inline234('top:4','1T20');
 const dense232=c.run('BeamRebar116.diagram227(Array(8).fill(18),Array(8).fill(18),1.8,3.2,{upperDia:40,lowerDia:40})');const denseDoc232=parseHTML(dense232).document;
 assert.equal(denseDoc232.querySelectorAll('[data-rebar-layer232]').length,16);assert.equal(denseDoc232.querySelectorAll('[data-layer="8"]').length,2);assert(denseDoc232.querySelector('svg').textContent.includes('8 · 18T40'));
 await click('#beam-rebar116 [data-ex=steel]');
 const result=c.run(`(()=>{const t=test227,m=Loading.members(t.p,t.result,1).find(x=>x.id==='B1');return {steel:Loading.input(t.p,1,m.token).steel,row:t.ui.getMemberResult227(t.p,1,m.token),maps:JSON.stringify([t.p.explorer.selected,t.p.explorer.reportA,t.p.explorer.reportB])};})()`);
 assert.equal(result.steel.C40,2);assert.equal(result.steel.C110,1);assert.equal(result.steel.D110,20);assert.equal(result.steel.C44,4);assert.equal(result.steel.C45,3);assert.equal(result.steel.D44,25);assert.equal(result.steel.H58,150);assert(result.row);assert.equal(result.maps,maps);render();assert(!$('.rebar-rc227').textContent.includes('重新'));assert.equal($('#rebar-mode235').textContent,'配筋：手動');

 assert.equal($('#ex-link-space').getAttribute('min'),'100');assert.equal($('#ex-tor-space').getAttribute('min'),'100');
 for(const id of ['ex-link-space','ex-tor-space']){const saved233=c.run('JSON.stringify(test227.p)');input(id,'75');await click('[data-ex=steel]');assert.equal(c.run('JSON.stringify(test227.p)'),saved233);assert(c.run("test227.messages.at(-1).includes('100 mm')"));render();}
 const saved=c.run('JSON.stringify(test227.p)');input('ex-bottom-counts','-1');await click('[data-ex=steel]');assert.equal(c.run('JSON.stringify(test227.p)'),saved);assert(c.run("test227.messages.at(-1).includes('非负整数')"));
 render();c.run("Engine.floorModel(test227.result,1).beams.find(b=>b.id==='B1').displayKind='CB'");render();assert.equal($('#rebar-editor116-bottom h4').textContent,'上筋 · 受拉面');assert.equal($('.rebar-fields227').firstElementChild.id,'rebar-editor116-bottom');assert($('[data-rebar-upper]').textContent.includes('4T25'));
 input('ex-bottom-counts','6');assert($('[data-rebar-upper]').textContent.includes('6T25'));assert($('#beam-rebar116 svg [data-rebar-layer232=upper]').textContent.includes('6T25'));assert.equal($('#beam-rebar116 svg [data-rebar-layer232=upper]').dataset.rebarEdit232,'bottom');assert.equal($('[data-required234=upper]').textContent,c.run('BeamRebar116.required234(test227.ui.getOutput().rows.find(r=>r.id==="B1"),"bottom",true)'));inline234('bottom:0','6T25');assert.equal($('#ex-bottom-counts').value.split(',')[0],'6');assert.equal(document.querySelectorAll('circle[fill="#9c3d10"]').length,6);
 c.run("delete Engine.floorModel(test227.result,1).beams.find(b=>b.id==='B1').displayKind");await click('[data-ex=auto-steel]');assert.equal(c.run(`(()=>{const t=test227,m=Loading.members(t.p,t.result,1).find(x=>x.id==='B1');return Loading.input(t.p,1,m.token).steel;})()`),null);
 render();assert.equal($('#rebar-mode235').textContent,'配筋：自動選筋');c.run("test227.p.name+=' changed'");render();assert.equal($('.rebar-rc227').textContent,'RC 待計算');assert($('[data-member-deflection231]').textContent.includes('待更新'));assert(!$('[data-member-deflection231]').textContent.includes('δmax'));
 // RC status must use the same L/d-excluding criterion as Summary Check.
 const statuses=c.run(`(()=>{const values=Object.fromEntries(['N40','N44','N52','N59','N69','N77','N78'].map(k=>[k,'OKAY']));values.N87='NOT OKAY';const row={kind:'MB',result:{status:'NOT OK',fail:['挠度'],values}};return {ok:BeamRebar116.status227({},row,false),dirty:BeamRebar116.status227({},row,true),pending:BeamRebar116.status227({},null,false)};})()`);
 assert.equal(statuses.ok.tone,'pass');assert.equal(statuses.dirty.tone,'pending');assert.equal(statuses.pending.tone,'pending');
 const fail=c.run(`BeamRebar116.status227({}, {kind:'MB',result:{status:'NOT OK',fail:['最大剪应力']}},false)`);assert.equal(fail.tone,'fail');assert.equal(fail.text,'RC 未通過');
 console.log('PASS Member Check DOM: inline diagram editing, typing/caret retention, As required/fresh/stale/CB mapping, hidden duplicate editors, same-face diameter sync, invalid save guards, 8-layer save mapping, AUTO restoration and selection preservation');
})().catch(e=>{console.error(e);process.exitCode=1;});
