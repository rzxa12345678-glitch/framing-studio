window.confirmSmoke316={done:false,uiOK:false,passed:[]};
(async()=>{const o=window.confirmSmoke316,$=s=>document.querySelector(s),clone=x=>JSON.parse(JSON.stringify(x)),snap=()=>JSON.stringify(StudioHost.get().p),check=(s,b)=>{if(!b)throw Error(s);o.passed.push(s);},tick=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30))),guard=()=>{if($('dialog[open]'))throw Error('Unexpected confirmation; not answered');};
 const click=async s=>{guard();const e=$(s);if(!e||e.disabled)throw Error('Missing '+s);e.click();await tick();guard();},wait=async fn=>{const until=Date.now()+60000;while(!fn()){guard();if(Date.now()>until)throw Error('Timeout');await tick();}};
 const original=ColumnSchemes319.search;let report;ColumnSchemes319.search=function(...args){return report=original.apply(this,args);};
 try{
 check('Private current model accepted',StudioHost.transact(()=>{const p=StudioHost.get().p;Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,clone(window.replan331Fixture));},null,false,true));
 StudioHost.viewFloor(10);StudioHost.navigate('columns');await tick();const before=snap(),count=()=>Engine.floorModel(StudioHost.get().result,10,'F08').columns.length;
 check('F08 begins with zero columns and 28 deleted positions',count()===0&&StudioHost.get().p.types.F08.columnSchemeDeleted319.length===28);
 StudioHost.navigate('columns');await tick();check('Refresh does not restore deleted columns',count()===0&&snap()===before);
 await click('[data-action=auto-columns311]');check('Single Auto Columns click generates 28 columns',count()===28);check('Applied Auto clears only current deletion restrictions',StudioHost.get().p.types.F08.columnSchemeDeleted319.length===0);
 const other=p=>JSON.stringify(Object.fromEntries(Object.entries(p.types).filter(([k])=>k!=='F08')));check('Other Framings preserved',other(StudioHost.get().p)===other(JSON.parse(before)));
 await window.replan331Checkpoint('auto-columns-F08');await click('#undo');check('Auto undo restores exact whole project',snap()===before);
 $('#column-schemes319').open=true;await tick();check('Reset button and deletion count panel removed',!$('[data-scheme331-replan]')&&!$('[data-scheme331-deletion-count]'));
 report=null;await click('[data-scheme319-generate]');await wait(()=>report&&!$('[data-scheme319-generate]').disabled);check('Ordinary scheme preview ignores deleted positions',report.schemes.some(s=>!s.unchanged&&s.columns.length>=20));check('Preview preserves exact original project',snap()===before);
 const scheme=report.schemes.find(s=>!s.unchanged&&s.columns.length>=20);await click('[data-scheme319-apply="'+scheme.id+'"]');await wait(()=>!$('[data-scheme319-generate]').disabled);check('Scheme applies without reset confirmation',count()===scheme.columns.length&&!!$('[data-scheme333-undo]'));await click('[data-scheme333-undo]');check('Scheme undo restores exact project including old compatibility records',snap()===before);
 check('Source project is retained',snap()===before);o.uiOK=true;
 }catch(e){o.error=e.stack||String(e);}finally{ColumnSchemes319.search=original;o.done=true;}
})();
