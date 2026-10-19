const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../../desktop-bridge.js'), 'utf8');
function boot(origin = 'https://framing-studio.invalid') {
  const handlers = {}, messages = [], writes = [];
  function Storage() {}
  Storage.prototype.setItem = function(k,v) { writes.push([k,v]); };
  let modal = false;
  const window = {addEventListener(k,fn) {handlers[k]=fn;}, chrome:{webview:{postMessage(m){messages.push(m);}}}};
  const localStorage = new Storage();
  vm.runInNewContext(code,{location:{origin},window,Storage,localStorage,document:{querySelector(){return modal;}}});
  return {handlers,messages,writes,localStorage,setModal(v){modal=v;},key(overrides={}){
    let prevented=false;
    handlers.keydown?.({key:'o',ctrlKey:true,altKey:false,shiftKey:false,metaKey:false,isComposing:false,repeat:false,preventDefault(){prevented=true;},...overrides});
    return prevented;
  }};
}
const checks=[];
function check(name,fn){fn();checks.push(name);}
check('Ctrl+O and uppercase O route one native request per press',()=>{
  const b=boot(); assert.equal(b.key(),true); assert.equal(b.key({key:'O'}),true);
  assert.deepEqual(JSON.parse(JSON.stringify(b.messages)),[{kind:'open-project332',value:null},{kind:'open-project332',value:null}]);
});
check('Other keys and modifiers are untouched',()=>{
  const b=boot();for(const override of [{key:'s'},{key:'z'},{key:'o',ctrlKey:false},{altKey:true},{shiftKey:true},{metaKey:true},{isComposing:true},{key:undefined}])assert.equal(b.key(override),false);
  assert.equal(b.messages.length,0);
});
check('Held-key repeat does not reopen the picker',()=>{
  const b=boot();assert.equal(b.key({repeat:true}),true);assert.equal(b.messages.length,0);
});
check('An in-page modal blocks open without consuming its answer',()=>{
  const b=boot();b.setModal(true);assert.equal(b.key(),true);assert.equal(b.messages.length,0);
  b.setModal(false);b.key();assert.equal(b.messages.length,1);
});
check('Browser origin receives no desktop shortcut or storage patch',()=>{
  const b=boot('http://127.0.0.1:8783');assert.equal(b.handlers.keydown,undefined);
  b.localStorage.setItem('framing-studio-explorer-e2','{}');assert.equal(b.messages.length,0);assert.equal(b.writes.length,1);
});
check('Existing native backup and error forwarding are preserved',()=>{
  const b=boot();b.localStorage.setItem('framing-studio-explorer-e2','{}');b.handlers.error({message:'test',filename:'test.js',lineno:1});
  assert.deepEqual(b.messages.map(m=>m.kind),['backup','error']);assert.equal(b.writes.length,1);
});
console.log(JSON.stringify({ok:true,checks},null,2));
