// Isolated Edge run. Supply a local exported project; it is never modified/uploaded.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
if(!process.argv[2])throw Error('Usage: node column-wall329-browser.cjs model.json output-dir');
const input=path.resolve(process.argv[2]),bytes=fs.readFileSync(input),fixture=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
const root=path.resolve(__dirname,'../../assets'),out=path.resolve(process.argv[3]||'output/E2.329-verification');fs.mkdirSync(out,{recursive:true});
let browser,server;const result={errors:[]};
(async()=>{try{
 server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1441,height:884}});page.on('pageerror',e=>result.errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.StudioHost);
 await page.evaluate(p=>{window.wall329Fixture=p;},fixture);
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'column-wall329-ui.js'),'utf8')});
 await page.waitForFunction(()=>window.confirmSmoke316?.done,{},{timeout:120000});
 Object.assign(result,await page.evaluate(()=>window.confirmSmoke316));
 result.originalFileUnchanged=bytes.equals(fs.readFileSync(input));result.ok=result.uiOK&&result.originalFileUnchanged&&result.errors.length===0;
 await page.screenshot({path:path.join(out,'browser-columns.png'),fullPage:false});
 if(!result.ok)process.exitCode=1;
 }catch(e){result.error=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser?.close();server?.close();}
})();
