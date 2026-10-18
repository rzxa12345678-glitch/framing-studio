const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../assets'),out=path.resolve(process.argv[2]||'output/E2.328-verification');fs.mkdirSync(out,{recursive:true});
const results={passed:[],cases:[]};let browser,server;
const check=(n,v)=>{if(!v)throw Error(n);results.passed.push(n);};
(async()=>{try{
server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!f.startsWith(root)){res.writeHead(403).end();return;}try{res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1441,height:884}});page.on('pageerror',e=>(results.errors??=[]).push(String(e)));
await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.StudioHost);await page.waitForTimeout(300);
await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'input-axis328-ui.js'),'utf8')});await page.waitForFunction(()=>window.confirmSmoke316.done);const result=await page.evaluate(()=>confirmSmoke316);results.shared=result;check('Shared input and axis suite',result.uiOK);results.passed.push(...result.passed);
await page.evaluate(()=>StudioHost.navigate('axes'));await page.waitForTimeout(150);
const target=page.locator('input[data-action=axisy][data-i="1"][data-f=gap]');
await target.fill('1234');await target.press('Home');await target.press('Shift+ArrowRight');await target.press('Shift+ArrowRight');await page.evaluate(()=>StudioHost.transact(()=>{}));await page.waitForTimeout(100);await page.keyboard.press('9');check('Partial keyboard selection retained',await target.inputValue()==='934');
await target.fill('1234');let box=await target.boundingBox();await page.mouse.move(box.x+6,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+34,box.y+box.height/2,{steps:10});await page.mouse.up();await page.evaluate(()=>StudioHost.transact(()=>{}));await page.waitForTimeout(100);await page.keyboard.press('9');check('Mouse drag selection retained',await target.inputValue()!=='12349'&&await target.inputValue()!=='91234');
await target.fill('6');await page.locator('h2').filter({hasText:'轴线'}).click();await page.waitForTimeout(150);
const copy=page.locator('[data-action=copyaxisy][data-i="1"]');await copy.click();await page.waitForTimeout(150);check('Actual mouse copy button works',await page.evaluate(()=>Object.keys(StudioHost.get().p.types).every(k=>Engine.axes(StudioHost.get().p,'y',k).some(a=>a.id==='COPY328'))));
await page.screenshot({path:path.join(out,'browser-axes.png')});check('No JavaScript errors',!results.errors?.length);results.ok=true;
}catch(e){results.error=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));await browser?.close();server?.close();}})();
