// Explicitly confirm only a requested fixture replacement. Unexpected dialogs fail.
const assert=require('node:assert/strict');
async function confirmProjectImport324(page){
 await page.waitForFunction(()=>!document.getElementById('file').value||document.querySelector('#studio-confirm316[open]'));
 const panel=page.locator('#studio-confirm316[open]');
 if(await panel.count()){
  assert.match(await panel.innerText(),/打开项目将替换当前编辑内容/);
  await panel.locator('[data-confirm316="ok"]').click();
  await page.waitForFunction(()=>!document.getElementById('file').value);
 }
}
module.exports={confirmProjectImport324};
