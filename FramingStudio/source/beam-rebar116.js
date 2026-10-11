// Member Check interface only: reuse the original steel fields and save/check path.
const BeamRebar116=(()=>{
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const faces227=cb=>({upper:cb?'bottom':'top',lower:cb?'top':'bottom'});
 function status227(p,row,dirty){
  if(dirty)return {tone:'pending',text:'RC 待重新檢查',reasons:['配筋已修改；請保存配筋並檢查。']};
  if(!row)return {tone:'pending',text:'RC 待計算',reasons:['請到 Summary Check 更新全樓 Check。']};
  const rc=Loading.auditChecks205(p,row).b,ok=/^OK(?:$|[ (])/.test(rc.status);
  return {tone:ok?'pass':rc.status==='NOT OK'?'fail':'pending',text:ok?'RC 通過':rc.status==='NOT OK'?'RC 未通過':'RC 待確認',reasons:rc.reasons||[]};
 }
 function required234(row,part,dirty){
  const v=row?.result?.values?.[part==='top'?'K36':'K38'];
  return typeof v==='number'&&Number.isFinite(v)&&v>=0?(dirty?'上次 ':'')+'As req = '+BeamLoads.display208(v)+' mm²'+(dirty?' · 待更新':''):'As req · 待計算';
 }
 function diagram227(upper,lower,b,d,info={}){
  const step=30,top=100,upN=info.editable?8:Math.max(1,Math.min(8,upper.length)),lowN=info.editable?8:Math.max(1,Math.min(8,lower.length)),bottom=top+(upN+lowN-2)*step+110,base=bottom+28,height=base+144;
  const label=(x,y,text,attrs='')=>'<text x="'+x+'" y="'+y+'" '+attrs+'>'+esc(text)+'</text>';
  const editor=(key,value,x,y,width,title)=>'<foreignObject x="'+x+'" y="'+y+'" width="'+width+'" height="30"><div xmlns="http://www.w3.org/1999/xhtml" class="rebar-inline234"><input type="text" data-inline-rebar234="'+key+'" value="'+esc(info.drafts?.[key]??value)+'" aria-label="'+esc(title)+'" '+(info.errors?.[key]?'aria-invalid="true"':'')+' autocomplete="off" spellcheck="false"/></div></foreignObject>';
  const layers=(ns,up)=>{
   const tone=up?'#9c3d10':'#185ba2',part=up?info.upperPart:info.lowerPart,dia=up?info.upperDia:info.lowerDia,countLayers=up?upN:lowN;
   return Array.from({length:countLayers},(_,i)=>{
    const n=ns[i]||0,y=up?top+i*step:bottom-i*step,count=info.pending?0:Math.min(Math.max(0,n),12),dots=Number.isInteger(n)?Array.from({length:count},(_,j)=>'<circle cx="'+(count===1?302:200+j*204/(count-1))+'" cy="'+y+'" r="3.2" fill="'+tone+'"/>').join(''):'';
    const text=(i+1)+' · '+n+'T'+(dia||''),field=info.editable?label(19,y+6,i+1,'fill="'+tone+'"')+editor(part+':'+i,n+'T'+dia,38,y-15,122,(up?'上筋':'下筋')+'第 '+(i+1)+' 層，根數T直徑；同面同徑'):label(158,y+5,text,'text-anchor="end" fill="'+tone+'"');
    return '<g data-rebar-layer232="'+(up?'upper':'lower')+'" data-layer="'+(i+1)+'" data-rebar-edit232="'+esc(part||'')+'"><title>'+esc(text)+'</title>'+field+'<path d="M164 '+y+' H193" stroke="'+tone+'"/>'+dots+'</g>';
   }).join('');
  };
  const link=(part,y,title,value)=>info.editable?label(24,y+7,title)+editor(part,info[part+'Value']||'',98,y-16,294,title+'，肢數T直徑@間距 mm，間距最小 100 mm')+label(402,y+7,'mm'):label(24,y+7,title+' · '+value);
  return '<svg role="group" viewBox="0 0 520 '+height+'" aria-label="梁截面配筋編輯，上筋在上、下筋在下；直接輸入根數T直徑；不按比例">'+label(302,22,'B = '+Math.round(b*1000)+' mm','text-anchor="middle"')+'<rect x="180" y="40" width="244" height="'+(base-40)+'" rx="2" fill="#f3f6f8" stroke="#5c7181"/><rect x="190" y="80" width="224" height="'+(base-92)+'" rx="9" fill="none" stroke="#18736b" stroke-width="2"/>'+label(158,58,'上筋 · '+(info.upperRole||''),'text-anchor="end" fill="#9c3d10"')+label(302,62,info.upperRequired||'As req · 待計算','text-anchor="middle" class="rebar-required234" data-required234="upper"')+label(158,bottom-(lowN-1)*step-56,'下筋 · '+(info.lowerRole||''),'text-anchor="end" fill="#185ba2"')+label(302,bottom-(lowN-1)*step-30,info.lowerRequired||'As req · 待計算','text-anchor="middle" class="rebar-required234" data-required234="lower"')+layers(upper,true)+layers(lower,false)+label(452,(40+base)/2,'D = '+Math.round(d*1000)+' mm','text-anchor="middle" transform="rotate(90 452 '+((40+base)/2)+')"')+link('shear',base+38,'抗剪',info.shear||'待確認')+link('torsion',base+76,'抗扭',info.torsion||'待確認')+label(260,base+115,'同面同徑：修改 T 會同步該面各層；0 表示無筋','text-anchor="middle" class="rebar-svg-note227"')+label(260,base+137,'截面不按比例；圓點不代表實際根數 · 箍筋最小間距 100 mm','text-anchor="middle" class="rebar-svg-note227"')+'</svg>';
 }
 function decorate(h){
  const top=$('ex-top-counts'),bottom=$('ex-bottom-counts');if(!top||!bottom||$('beam-rebar116'))return;
  const model=Engine.floorModel(h.result,h.floor,h.key),beam=model.beams.find(b=>b.id===h.selected?.id&&b.kind===h.selected?.kind);if(!beam)return;
  const cb=(beam.displayKind||beam.kind)==='CB',{upper,lower}=faces227(cb),token=Loading.token(beam.kind,beam),row=h.memberResult?.(h.floor,token);
  const fieldRows={top:top.closest('.row'),bottom:bottom.closest('.row'),shear:$('ex-link-dia').closest('.row'),torsion:$('ex-tor-dia').closest('.row')};
  const first=fieldRows.top,previous=first.previousElementSibling;if(previous?.tagName==='P'&&previous.textContent.includes('每面最多'))previous.remove();
  const saveRow=fieldRows.torsion.nextElementSibling;
  const card=document.createElement('section');card.id='beam-rebar116';card.className='beam-rebar116';card.setAttribute('aria-label','梁 RC 結果與配筋編輯');
  card.innerHTML='<header class="rebar-heading227"><strong>'+esc(beam.displayId||beam.id)+' · '+Math.round(beam.b*1000)+' × '+Math.round(beam.d*1000)+' mm</strong><span class="rebar-rc227" aria-live="polite"></span></header><p class="rebar-reasons227" aria-live="polite"></p><div class="rebar-overview227"><div class="rebar-section227"></div><div class="rebar-summary227" aria-hidden="true"><p data-rebar-upper></p><p data-rebar-lower></p><p data-rebar-shear></p><p data-rebar-torsion></p></div></div><p class="rebar-ratio227"></p><div class="rebar-fields227" hidden></div><p class="rebar-status116" aria-live="polite"></p>';
  first.before(card);
  const titles={top:(cb?'下筋':'上筋')+' · 受壓面',bottom:(cb?'上筋':'下筋')+' · 受拉面',shear:'抗剪箍筋',torsion:'抗扭箍筋'};
  for(const part of [upper,lower,'shear','torsion']){
   const panel=document.createElement('section');panel.className='rebar-editor116';panel.id='rebar-editor116-'+part;
   const label=document.createElement('h4');label.textContent=titles[part];panel.append(label,fieldRows[part]);
   if(part==='shear'||part==='torsion'){const hint=document.createElement('small');hint.textContent='項目最小間距 100 mm。';panel.append(hint);}
   if(part==='top'||part==='bottom'){
    const hint=document.createElement('small');hint.id='rebar-hint227-'+part;hint.textContent='每層根數用逗號分隔，例如 4, 3；由該面向內，最多 8 層。';panel.append(hint);panel.querySelector('#ex-'+part+'-counts').setAttribute('aria-describedby',hint.id);
   }
   card.querySelector('.rebar-fields227').append(panel);
  }
  if(saveRow?.querySelector('[data-ex="steel"]'))card.append(saveRow);
  const counts=part=>$('ex-'+part+'-counts').value.split(/[,，]/).map(x=>Number(x.trim()));
  const countText=part=>{const ns=counts(part),dia=$('ex-'+part+'-dia').value;return ns.some(x=>!Number.isInteger(x)||x<0)||ns.length>8?'請輸入有效根數':ns.some(x=>x>0)?ns.map((n,i)=>n>0?'第 '+(i+1)+' 層 '+n+'T'+dia:'').filter(Boolean).join(' + '):'未配筋';};
  const fields231=[...Object.values(fieldRows)].flatMap(fields=>[...fields.querySelectorAll('input,select')]),initial231=fields231.map(field=>field.value),mode231=$('ex-steel-mode').value;
  const changed231=()=>$('ex-steel-mode').value!==mode231||fields231.some((field,i)=>field.value!==initial231[i]);
  let dirty=false;const drafts234={},errors234={};
  function draw(){
   const active=document.activeElement,key=active?.dataset?.inlineRebar234,selection=key?[active.selectionStart,active.selectionEnd]:null;

   const automatic=$('ex-steel-mode').value==='AUTO',awaitAuto=automatic&&(dirty||!row),status=status227(h.p,row,dirty);if(Object.keys(errors234).length)status.reasons=Object.values(errors234);
   const badge=card.querySelector('.rebar-rc227');badge.textContent=status.text;badge.dataset.tone=status.tone;
   card.querySelector('.rebar-reasons227').textContent=status.reasons.join('；');
   const linkText=prefix=>awaitAuto?'待自動選筋':$('ex-'+prefix+'-legs').value+' 肢 T'+$('ex-'+prefix+'-dia').value+' @ '+$('ex-'+prefix+'-space').value+' mm';
   card.querySelector('.rebar-section227').innerHTML=diagram227(awaitAuto?[]:counts(upper),awaitAuto?[]:counts(lower),beam.b,beam.d,{upperPart:upper,lowerPart:lower,upperDia:$('ex-'+upper+'-dia').value,lowerDia:$('ex-'+lower+'-dia').value,upperRole:cb?'受拉':'受壓',lowerRole:cb?'受壓':'受拉',pending:awaitAuto,editable:true,drafts:drafts234,errors:errors234,upperRequired:required234(row,upper,dirty),lowerRequired:required234(row,lower,dirty),shear:linkText('link'),torsion:linkText('tor'),shearValue:$('ex-link-legs').value+'T'+$('ex-link-dia').value+'@'+$('ex-link-space').value,torsionValue:$('ex-tor-legs').value+'T'+$('ex-tor-dia').value+'@'+$('ex-tor-space').value});
   card.querySelector('[data-rebar-upper]').textContent='上筋 · '+(awaitAuto?'待自動選筋':countText(upper));
   card.querySelector('[data-rebar-lower]').textContent='下筋 · '+(awaitAuto?'待自動選筋':countText(lower));
   card.querySelector('[data-rebar-shear]').textContent='抗剪 · '+(awaitAuto?'待自動選筋':$('ex-link-legs').value+' 肢 T'+$('ex-link-dia').value+' @ '+$('ex-link-space').value+' mm');
   card.querySelector('[data-rebar-torsion]').textContent='抗扭 · '+(awaitAuto?'待自動選筋':$('ex-tor-legs').value+' 肢 T'+$('ex-tor-dia').value+' @ '+$('ex-tor-space').value+' mm');
   const input=Loading.input(h.p,h.floor,token),L=Math.hypot(beam.rawZ[0]-beam.rawA[0],beam.rawZ[1]-beam.rawA[1]);
   try{const size=Reports.sizing(h.p,{kind:beam.kind,member:beam,floor:h.floor,input,loading:{L}});card.querySelector('.rebar-ratio227').textContent='Span/Depth · L/h = '+Number(size.ratio.toFixed(3))+' / '+size.limit+' · '+size.status+'（獨立判定）';}catch{card.querySelector('.rebar-ratio227').textContent='';}
   card.querySelector('.rebar-status116').textContent=automatic?(awaitAuto?'待自動選筋；圖中修改格為輸入預設值，修改即轉為手動。':'自動選筋結果；可直接修改，修改後轉為手動。'):'手動配筋；修改後按「保存配筋并检查」。';
   if(key){const replacement=card.querySelector('[data-inline-rebar234="'+key+'"]');replacement?.focus();if(selection&&replacement?.setSelectionRange)replacement.setSelectionRange(...selection);}
  }
  for(const fields of Object.values(fieldRows))for(const field of fields.querySelectorAll('input,select'))field.addEventListener('input',()=>{$('ex-steel-mode').value='MANUAL';dirty=changed231();draw();});
  card.addEventListener('input',e=>{
   const key=e.target.dataset?.inlineRebar234;if(!key)return;drafts234[key]=e.target.value;$('ex-steel-mode').value='MANUAL';dirty=true;
   const isLink=['shear','torsion'].includes(key),match=e.target.value.match(isLink?/^\s*(\d+)\s*T\s*(\d+)\s*@\s*(\d+(?:\.\d+)?)\s*$/i:/^\s*(\d+)\s*T\s*(\d+)\s*$/i);
   let error=isLink?'請輸入肢數T直徑@間距，例如 2T10@100。':'請輸入根數T直徑，例如 18T40。';
   if(match){
    const prefix=isLink?(key==='shear'?'link':'tor'):key.split(':')[0],dia=$('ex-'+prefix+'-dia'),validDia=[...dia.options].some(o=>Number(o.value)===Number(match[2]));
    if(!validDia)error='請使用原有可選鋼筋直徑。';
    else if(isLink&&(+match[1]<1||+match[3]<100))error='箍筋肢數須為正整數，間距不得小於 100 mm。';
    else{
     dia.value=match[2];
     if(isLink){$('ex-'+prefix+'-legs').value=match[1];$('ex-'+prefix+'-space').value=match[3];}
     else{const ns=Array.from({length:8},(_,i)=>counts(prefix)[i]||0);ns[Number(key.split(':')[1])]=Number(match[1]);$('ex-'+prefix+'-counts').value=ns.join(', ');for(const k of Object.keys(drafts234))if(k.startsWith(prefix+':')&&k!==key&&!errors234[k])delete drafts234[k];}
     error='';
    }
   }
   if(error)errors234[key]=error;else delete errors234[key];dirty=changed231()||Object.keys(errors234).length>0;draw();
  });
  card.addEventListener('click',e=>{if(e.target.closest('[data-ex="steel"]')&&Object.keys(errors234).length){e.preventDefault();e.stopPropagation();card.querySelector('[aria-invalid="true"]')?.focus();}});
  $('ex-steel-mode').addEventListener('change',()=>{if($('ex-steel-mode').value==='AUTO'){for(const key of Object.keys(drafts234))delete drafts234[key];for(const key of Object.keys(errors234))delete errors234[key];}if(mode231==='AUTO'&&$('ex-steel-mode').value==='AUTO')fields231.forEach((field,i)=>field.value=initial231[i]);dirty=changed231();draw();});draw();
 }
 return {decorate,faces227,status227,diagram227,required234};
})();
