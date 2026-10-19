(() => {
  if (location.origin !== 'https://framing-studio.invalid') return;
  const post = (kind, value) => window.chrome.webview.postMessage({kind, value});
  // WebView2 focus does not dispatch Ctrl+O to the WinForms menu shortcut.
  // Route only this desktop shortcut through the existing native open flow.
  window.addEventListener('keydown', e => {
    if (!e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.isComposing ||
        e.key?.toLowerCase() !== 'o') return;
    e.preventDefault();
    if (e.repeat || document.querySelector('dialog[open]')) return;
    post('open-project332', null);
  }, true);
  window.addEventListener('error', e => post('error', `${e.message} @ ${e.filename}:${e.lineno}`));
  window.addEventListener('unhandledrejection', e => post('error', String(e.reason?.stack || e.reason)));
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    original.call(this, key, value);
    if (this === localStorage && key === 'framing-studio-explorer-e2') post('backup', String(value));
  };
})();
