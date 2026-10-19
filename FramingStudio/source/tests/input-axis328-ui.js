// Isolated WebView2/browser fixture; never answer application dialogs automatically.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),tick=()=>new Promise(r=>setTimeout(r,100)),check=(n,v)=>{if(!v)throw Error(n);o.passed.push(n);};
try{
for(const [tab,selector] of [['axes','input[data-action=axisy][data-i="1"][data-f=gap]'],['floors','input[data-action=group][data-i="0"][data-f=headroom]'],['parameters','input[data-action=default][data-f=slab]'],['columns','input[data-action=default][data-f=cb]'],['walls','input[data-action=default][data-f=wall]']]){
 StudioHost.navigate(tab);await tick();if(getComputedStyle($('#side')).display==='none'){$('#mobile-inputs').click();await tick();}
 const e=$(selector);for(let n=e.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;
 e.focus();e.value='1234';e.dispatchEvent(new Event('input',{bubbles:true}));e.select();StudioHost.transact(()=>{});await tick();
 check(tab+' active number remains connected',e===$(selector)&&document.activeElement===e);document.execCommand('insertText',false,'9');check(tab+' first select-all survives update',e.value==='9');
}
StudioHost.navigate('floors');await tick();$('[data-action=cancelgroups]')?.click();await tick();StudioHost.navigate('axes');await tick();
let source=StudioHost.get().key;StudioHost.transact(()=>{const p=StudioHost.get().p;for(const t of Object.values(p.types))t.axes=Engine.clone(Engine.axisData(p,source));const ar=Engine.axes(p,'y',source);Engine.insertAxis291(p,source,'y',1,'COPY328',(ar[0].v+ar[1].v)/2);});await tick();
const before=JSON.stringify(StudioHost.get().p),button=$('[data-action=copyaxisy][data-i="1"]');check('Each grid row has copy-all button',!!button&&!!$('[data-action=copyaxisx]'));button.click();await tick();
check('UI copies selected grid into every Framing',Object.keys(StudioHost.get().p.types).every(k=>Engine.axes(StudioHost.get().p,'y',k).some(a=>a.id==='COPY328')));
$('#undo').click();await tick();check('Single Undo restores entire batch',JSON.stringify(StudioHost.get().p)===before);
check('No native/in-page confirmations auto-accepted',!document.querySelector('dialog[open]'));o.uiOK=true;
}catch(e){o.error=e.stack||String(e);}finally{o.done=true;}})();
