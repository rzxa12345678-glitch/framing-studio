// Isolated WebView2 fixture only. Keep ok=false: do not trigger the legacy
// harness's automatic dialog-answer sweep. uiOK is this suite's result.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),tick=()=>new Promise(r=>setTimeout(r,90)),check=(n,v)=>{if(!v)throw Error(n);o.passed.push(n);};
const nav=async t=>{StudioHost.navigate(t);await tick();if(getComputedStyle($('#side')).display==='none'&&!['steel','foundation'].includes(t)){$('#mobile-inputs').click();await tick();}};
async function probe(n,t,a,b){await nav(t);let x=$(a),y=$(b);check(n+' fields present',!!x&&!!y);for(let n=x.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;x.scrollIntoView({block:'center'});x.focus();x.value=String((Number(x.value)||0)+.1);x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));y.focus();const top=y.getBoundingClientRect().top;await tick();y=$(b);check(n+' focus retained',document.activeElement===y);check(n+' scroll retained',Math.abs(top-y.getBoundingClientRect().top)<2);y.value='7';y.dispatchEvent(new Event('input',{bubbles:true}));await tick();check(n+' draft retained',$(b).value==='7');}
try{
await probe('Floors','floors','[data-action=group][data-i="0"][data-f=h]','[data-action=group][data-i="0"][data-f=headroom]');
await probe('Incomplete floor clearance','floors','[data-action=group][data-i="0"][data-f=headroom]','[data-action=group][data-i="0"][data-f=em]');
$('[data-action=cancelgroups]')?.click();await tick();
await probe('Axes','axes','[data-action=axisx][data-i="1"][data-f=gap]','[data-action=axisx][data-i="2"][data-f=gap]');
await probe('Parameters','parameters','[data-action=default][data-f=slab]','[data-action=default][data-f=cb]');
await probe('Walls','walls','[data-action=default][data-f=wall]','[data-action=walls][data-i="0"][data-f=b]');
await probe('Columns','columns','[data-action=default][data-f=cb]','[data-action=default][data-f=cd]');
await probe('Steel workspace','steel','[data-field=E]','[data-field=limit1]');
await probe('Foundation workspace','foundation','[data-fn=bell]','[data-fn=shaft]');
await nav('parameters');const before=JSON.stringify(StudioHost.get().p),field=$('[data-action=default][data-f=slab]');field.focus();field.value='-1';field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));await tick();
check('Rejected input keeps original model',JSON.stringify(StudioHost.get().p)===before);check('Rejected input and message survive repaint',$('[data-action=default][data-f=slab]').value==='-1'&&!!$('[aria-invalid=true]'));
o.uiOK=true;
}catch(e){o.error=e.stack||String(e);}finally{o.done=true;}})();
