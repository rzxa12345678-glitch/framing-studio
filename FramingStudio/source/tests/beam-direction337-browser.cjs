// Run only in a fresh isolated local browser profile; never access the user tab.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
if(!process.argv[2])throw Error('Usage: node column-replan331-browser.cjs model.json output-dir [Framing-keys comma separated]');
const input=path.resolve(process.argv[2]),bytes=fs.readFileSync(input),fixture=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),keys=(process.argv[4]||'F01,F03').split(',');
const root=path.resolve(__dirname,'../../assets'),out=path.resolve(process.argv[3]||'output/E2.331-verification');fs.mkdirSync(out,{recursive:true});
let browser,server;const result={errors:[],externalRequests:[],screenshots:[]};
(async()=>{try{
 server=http.createServer((req,res)=>{const relative=decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]),f=path.resolve(root,'.'+relative);if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'}[path.extname(f)]||'application/octet-stream';res.setHeader('Content-Type',mime);res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1441,height:884}});page.on('pageerror',e=>result.errors.push(String(e)));
 await page.route('**/*',route=>{if(new URL(route.request().url()).origin===origin)return route.continue();result.externalRequests.push(route.request().url());return route.abort('blockedbyclient');});
 await page.exposeFunction('replan331Checkpoint',async tag=>{if(!/^[A-Za-z0-9_-]+$/.test(tag))throw Error('Invalid QA screenshot tag');const file='browser-replan-'+tag+'.png';await page.screenshot({path:path.join(out,file),fullPage:false});result.screenshots.push(file);});
 await page.exposeFunction('beam337Click',async q=>{const pos=await page.evaluate(q=>({x:window.beam337Plot.ox+q[0]*window.beam337Plot.scale,y:window.beam337Plot.oy+q[1]*window.beam337Plot.scale}),q);await page.locator('#canvas').click({position:pos});});
 await page.goto(origin);await page.waitForFunction(()=>window.StudioHost);
 await page.evaluate(({fixture,keys})=>{window.replan331Fixture=fixture;window.replan331Keys=keys;},{fixture,keys});
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'beam-direction337-ui.js'),'utf8')});
 await page.waitForFunction(()=>window.confirmSmoke316?.done,{},{timeout:240000});
 Object.assign(result,await page.evaluate(()=>window.confirmSmoke316));
 result.originalFileUnchanged=bytes.equals(fs.readFileSync(input));result.ok=result.uiOK&&result.originalFileUnchanged&&result.errors.length===0&&result.externalRequests.length===0;
 await page.screenshot({path:path.join(out,'browser-replan.png'),fullPage:false});
 if(!result.ok)process.exitCode=1;
 }catch(error){result.error=error.stack||String(error);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'browser-replan-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser?.close();server?.close();}
})();
