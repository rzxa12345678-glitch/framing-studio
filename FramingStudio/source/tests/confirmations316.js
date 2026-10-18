// Executed by the actual Windows WebView2 host's isolated --self-test runner.
window.confirmSmoke316={done:false,ok:false,passed:[]};
(async()=>{
 const out=window.confirmSmoke316,$=s=>document.querySelector(s),wait=async fn=>{const end=Date.now()+10000;while(!fn()){if(Date.now()>end)throw Error('Timed out waiting for UI');await new Promise(r=>setTimeout(r,25));}},check=(label,value)=>{if(!value)throw Error(label);out.passed.push(label);},click=s=>{const e=$(s);if(!e)throw Error('Missing '+s);e.click();},stored=()=>localStorage.getItem('framing-studio-explorer-e2'),choice=s=>click('[data-confirm316="'+s+'"]');
 try{
  if(window.qaFixture316){const files=new DataTransfer();files.items.add(new File([JSON.stringify(qaFixture316)],'qa-current.framing.json',{type:'application/json'}));$('#file').files=files.files;$('#file').dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>$('#project-name').textContent===qaFixture316.name);check('Current exam model imported in EXE',true);}
  check('All calculation/report modules loaded',typeof Engine==='object'&&typeof Reports==='object');
  const promise=StudioDialogs316.confirm('<b>literal text</b>','Confirmation test');
  check('In-page native WebView2 dialog visible',$('#studio-confirm316').open);
  check('Message is text, not injected HTML',!$('#studio-confirm316 b'));
  check('Cancel receives initial focus',document.activeElement.dataset.confirm316==='cancel');
  check('Duplicate requests cancel safely',await StudioDialogs316.confirm('duplicate')===false);
  choice('cancel');check('Cancel resolves false',await promise===false);
  const esc=StudioDialogs316.confirm('Escape');$('#studio-confirm316').dispatchEvent(new Event('cancel',{cancelable:true}));check('Escape cancels',await esc===false);
  const prompt=StudioDialogs316.prompt('Name','F99',v=>v==='F99'?'Duplicate':null);choice('ok');check('Invalid prompt stays open',$('#studio-confirm316').open&&$('#studio-confirm316 [role=alert]').textContent==='Duplicate');$('#studio-confirm-input316').value='F_QA';choice('ok');check('Valid prompt returns value',await prompt==='F_QA');
  click('#copytype');$('#copy-type-name').value='F_QA';$('#copy-type-form').requestSubmit();await wait(()=>$('#type').value==='F_QA');
  const before=stored();click('#deletetype');check('Delete opens in-page confirmation',$('#studio-confirm316').textContent.includes('F_QA'));choice('cancel');await wait(()=>!$('#studio-confirm316'));check('Delete cancellation preserves model',stored()===before);
  click('#deletetype');choice('ok');await wait(()=>![...$('#type').options].some(o=>o.value==='F_QA'));check('Confirmed delete removes only chosen type',!JSON.parse(stored()).types.F_QA);click('#undo');check('Single undo restores entire model',stored()===before);
  click('[data-tab=floors]');click('[data-action=newtype]');check('New type uses in-page prompt',!!$('#studio-confirm-input316'));$('#studio-confirm-input316').value='F_TEST';choice('ok');await wait(()=>[...$('#type').options].some(o=>o.value==='F_TEST'));click('#undo');check('New-type undo restores model',stored()===before);
  click('#newproject');$('#newname').value='Desktop QA replacement';click('#newcreate');check('Dirty new-project replacement asks in-page',$('#studio-confirm316').open);choice('cancel');await wait(()=>!$('#studio-confirm316'));check('New project cancel preserves model',stored()===before);click('#newcancel');
  // File input follows the same path as native ImportProject; cancellation must retain the model.
  const replacement=JSON.parse(before);replacement.name='Desktop QA imported';const transfer=new DataTransfer();transfer.items.add(new File([JSON.stringify(replacement)],'qa.framing.json',{type:'application/json'}));$('#file').files=transfer.files;$('#file').dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>$('#studio-confirm316'));choice('cancel');await wait(()=>$('#file').value==='');check('Open-project cancellation preserves model',stored()===before);
  const transfer2=new DataTransfer();transfer2.items.add(new File([JSON.stringify(replacement)],'qa.framing.json',{type:'application/json'}));$('#file').files=transfer2.files;$('#file').dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>$('#studio-confirm316'));choice('ok');await wait(()=>$('#project-name').textContent==='Desktop QA imported');check('Open-project confirmation imports',JSON.parse(stored()).name==='Desktop QA imported');click('#undo');check('Import undo preserves previous model',stored()===before);
  check('Save acknowledgement rejects stale content',window.savedFramingProject316('{}')===false);
  click('#save');await wait(()=>$('#savestatus').textContent.includes('文件已保存'));check('Native project save completes',true);
  click('#newproject');$('#newname').value='Desktop QA saved replacement';click('#newcreate');await wait(()=>$('#project-name').textContent==='Desktop QA saved replacement');check('Successful native save clears dirty state',!$('#studio-confirm316'));click('#undo');
  click('#help');check('In-page help opens',$('#helpdialog').open);click('#helpclose');
  out.ok=true;
  StudioDialogs316.request({title:'EXE 確認面板驗證完成',message:out.passed.length+' 項檢查通過。取消、確認、撤銷及原生儲存均已驗證。',choices:[['ok','知道了']]});
 }catch(e){out.error=e.stack||String(e);}finally{out.done=true;}
})();
