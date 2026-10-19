// Run against an isolated local server/profile. Supply a private exported model;
// it is injected only into this test page and never copied into source/output.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
if(!process.argv[2])throw Error('Usage: node column-transfer330-browser.cjs model.json output-dir [Framing-key]');
const input=path.resolve(process.argv[2]),bytes=fs.readFileSync(input),fixture=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),key=process.argv[4]||'F03';
const root=path.resolve(__dirname,'../../assets'),out=path.resolve(process.argv[3]||'output/E2.330-verification');fs.mkdirSync(out,{recursive:true});
let browser,server;const result={errors:[],externalRequests:[]};
(async()=>{try{
 server=http.createServer((req,res)=>{const relative=decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]),f=path.resolve(root,'.'+relative);if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'}[path.extname(f)]||'application/octet-stream';res.setHeader('Content-Type',mime);res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1441,height:884}});page.on('pageerror',e=>result.errors.push(String(e)));
 await page.route('**/*',route=>{if(new URL(route.request().url()).origin===origin)return route.continue();result.externalRequests.push(route.request().url());return route.abort('blockedbyclient');});
 await page.goto(origin);await page.waitForFunction(()=>window.StudioHost);
 await page.evaluate(({fixture,key})=>{window.transfer330Fixture=fixture;window.transfer330Key=key;},{fixture,key});
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'column-transfer330-ui.js'),'utf8')});
 await page.waitForFunction(()=>window.confirmSmoke316?.done,{},{timeout:180000});
 Object.assign(result,await page.evaluate(()=>window.confirmSmoke316));
 result.originalFileUnchanged=bytes.equals(fs.readFileSync(input));result.ok=result.uiOK&&result.originalFileUnchanged&&result.errors.length===0&&result.externalRequests.length===0;
 await page.screenshot({path:path.join(out,'browser-transfer.png'),fullPage:false});
 if(!result.ok)process.exitCode=1;
 }catch(error){result.error=error.stack||String(error);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'browser-transfer-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser?.close();server?.close();}
})();
