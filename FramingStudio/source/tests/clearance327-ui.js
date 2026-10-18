// Disposable browser/WebView2 only. No automatic dialog answers.
window.confirmSmoke316={done:false,ok:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),tick=()=>new Promise(r=>setTimeout(r,110)),check=(s,v)=>{if(!v)throw Error(s);o.passed.push(s);},field=f=>'input[data-action=group][data-i="0"][data-f='+f+']',g=()=>StudioHost.get().p.groups[0];
async function edit(f,v,next){const a=$(field(f));a.focus();a.value=v;a.dispatchEvent(new Event('input',{bubbles:true}));a.dispatchEvent(new Event('change',{bubbles:true}));if(next)$(field(next)).focus();await tick();}
try{
StudioHost.transact(()=>{const p=StudioHost.get().p;p.groups[0].h=5.5;p.groups[0].sh=600;delete p.groups[0].headroom;delete p.groups[0].em;});StudioHost.navigate('floors');await tick();if(getComputedStyle($('#side')).display==='none'){$('#mobile-inputs').click();await tick();}
check('Legacy manual structural height retained before editing',g().sh===600&&g().headroom==null&&g().em==null);
await edit('headroom','4','em');check('Headroom alone applies with empty E&M as zero',g().headroom===4&&g().em===0&&g().sh===1500);check('Next field retains focus',document.activeElement===$(field('em')));check('No paired-input error',!$('[aria-invalid=true]'));
await edit('em','0.5','headroom');check('E&M subsequently updates same formula',g().sh===1000);
await edit('headroom','','em');check('Cleared headroom is zero',g().headroom===0&&g().sh===5000);
await edit('em','','headroom');check('Both explicitly cleared become zero',g().headroom===0&&g().em===0&&g().sh===5500);
$('#undo').click();await tick();check('Undo restores prior clearance',g().em===.5&&g().headroom===0&&g().sh===5000);
const before=JSON.stringify(StudioHost.get().p);await edit('headroom','6','em');check('Excess clearance still rejected',JSON.stringify(StudioHost.get().p)===before&&!!$('[aria-invalid=true]'));
await edit('headroom','4','em');check('Correction applies and clears error',g().sh===1000&&!$('[aria-invalid=true]'));
const valid=JSON.stringify(StudioHost.get().p);await edit('em','-1','headroom');check('Negative input still rejected',JSON.stringify(StudioHost.get().p)===valid&&!!$('[aria-invalid=true]'));
await edit('em','','headroom');check('Clear invalid E&M recovers with zero',g().em===0&&g().sh===1500&&!$('[aria-invalid=true]'));
$('[data-lh-action=add]').click();await tick();let local=$('[data-lh-field=headroom]');check('Local clearance input exists',!!local);local.focus();local.value='';local.dispatchEvent(new Event('input',{bubbles:true}));local.dispatchEvent(new Event('change',{bubbles:true}));await tick();check('Explicitly cleared local headroom is zero',StudioHost.get().p.localHeights96[0].headroom===0);
local=$('[data-lh-field=em]');local.focus();local.value='';local.dispatchEvent(new Event('input',{bubbles:true}));local.dispatchEvent(new Event('change',{bubbles:true}));await tick();check('Explicitly cleared local E&M is zero',StudioHost.get().p.localHeights96[0].em===0);
o.uiOK=true;
}catch(e){o.error=e.stack||String(e);}finally{o.done=true;}})();
