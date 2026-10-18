const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict'),{square}=require('./diagonal318.cjs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1650,height:1050}}),errors=[],out=path.resolve('tmp/slanted318/ui');fs.mkdirSync(out,{recursive:true});page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.accept());
 await page.goto(pathToFileURL(path.resolve(__dirname,'../../assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);
 await page.evaluate(()=>{const old=Drawing.plan;Drawing.plan=(...args)=>window.plot318=old(...args);});
 const load=async p=>{await page.locator('#file').setInputFiles({name:'trial.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await require('./project-import324.cjs').confirmProjectImport324(page);await page.waitForFunction(()=>StudioHost.get().p.types.F1);};
 const click=async q=>{await page.waitForTimeout(120);const pos=await page.evaluate(q=>({x:plot318.ox+q[0]*plot318.scale,y:plot318.oy+q[1]*plot318.scale}),q);await page.locator('#canvas').click({position:pos});};
 for(const withOutline of [false,true]){
  const p=square();p.types.F1.beams=p.types.F1.beams.filter(b=>b.id!=='D1');if(withOutline)p.types.F1.diagonal315={outline:[[0,0],[9,0],[9,9],[0,9]],direction:'X'};await load(p);await page.evaluate(()=>StudioHost.navigate('beamLayout'));await page.locator('#drawtool').click();await click([9,0]);await click([0,9]);
  const info=await page.evaluate(()=>{const h=StudioHost.get(),m=Engine.floorModel(h.result,1);return {diag:m.beams.filter(b=>b.diagonal315).map(b=>b.id),slabs:m.slabs.length,area:Diagonal315.sum(m.floorPolygons315),explicit:!!h.p.types.F1.diagonal315};});assert.equal(info.diag.length,1);assert.equal(info.slabs,2);assert.equal(info.area,81);assert.equal(info.explicit,withOutline);
  await page.locator('#undo').click();assert(!(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.some(b=>b.diagonal315))));await click([9,0]);await click([0,9]);
 }
 await page.screenshot({path:path.join(out,'direct-diagonal.png')});
 await page.evaluate(()=>StudioHost.navigate('regions'));await page.locator('[data-diagonal315="remove"]').click();assert(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.some(b=>b.diagonal315)));await page.screenshot({path:path.join(out,'regions.png')});
 await page.evaluate(()=>StudioHost.navigate('beamLayout'));await page.locator('#drawtool').click();await page.locator('#beamkind').evaluate(el=>{for(let v=el.parentElement;v;v=v.parentElement)if(v.tagName==='DETAILS')v.open=true;});await page.locator('#beamkind').selectOption('SB');await click([6,3]);await click([9,3]);assert(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.some(b=>b.kind==='SB'&&b.supportStatus==='connected')));
 await page.evaluate(()=>StudioHost.navigate('regions'));await page.locator('.diagonal315-panel>summary').click();await page.locator('[data-diagonal315="draw"]').click();for(const q of [[9,0],[9,9],[0,9]])await click(q);await page.locator('[data-diagonal315="apply"]').click();assert.equal(await page.evaluate(()=>Diagonal315.sum(Engine.floorModel(StudioHost.get().result,1).floorPolygons315)),40.5);await page.screenshot({path:path.join(out,'triangle-region.png')});
 await page.evaluate(()=>StudioHost.transact(()=>{const h=StudioHost.get(),m=Engine.floorModel(h.result,1),s=m.slabs.find(s=>s.polygon315);Engine.removeMember(h.p,h.key,{kind:'SLAB',slabId:s.id});}));
 await page.evaluate(()=>StudioHost.navigate('review'));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'drawing.png')});
 // Print and SVG use the same actual drawing, while the native report is untouched.
 await page.evaluate(()=>{window.print=()=>window.printed318=true;});
 const svgButton=page.locator('[data-action="svg"]');
 const available=await svgButton.count();assert(available,'Geometry SVG action is available');
 const [svgDownload]=await Promise.all([page.waitForEvent('download'),svgButton.click()]);await svgDownload.saveAs(path.join(out,'trial.svg'));
 await page.locator('[data-action="print"]').click();assert(await page.evaluate(()=>window.printed318));
 const printSvg=await page.locator('#printpage>svg').evaluate(el=>el.outerHTML);assert.equal(printSvg,await page.evaluate(s=>{const el=document.createElement('div');el.innerHTML=s;return el.firstElementChild.outerHTML},fs.readFileSync(path.join(out,'trial.svg'),'utf8')));
 const [saved]=await Promise.all([page.waitForEvent('download'),page.locator('#save').click()]);await saved.saveAs(path.join(out,'saved.framing.json'));await load(JSON.parse(fs.readFileSync(path.join(out,'saved.framing.json'),'utf8')));assert(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.some(b=>b.diagonal315)));assert.deepEqual(errors,[]);
 console.log('PASS direct diagonal in plain and rectangular-outline projects, undo, outline restore retains beam, geometry preview, SVG/print parity, save/reopen, zero browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
