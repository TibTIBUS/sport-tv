const storageKey = 'sport-tv-remote';
// A hint only: many TV browsers identify themselves as ordinary Chrome.
export function detectTV(userAgent = '') {
 return /smart[- ]?tv|hbbtv|googletv|google tv|android tv|\btizen\b|webos|web0s|netcast|viera|bravia|aft[a-z0-9]+|tv bro|tclbrowser/i.test(userAgent);
}
export function remoteKey(event) {
 const aliases = {Left:'ArrowLeft',Right:'ArrowRight',Up:'ArrowUp',Down:'ArrowDown',Select:'Enter',Accept:'Enter',Back:'Escape',GoBack:'Escape',BrowserBack:'Escape'};
 return aliases[event.key] || (event.key && event.key !== 'Unidentified' ? event.key :
  ({13:'Enter',23:'Enter',32:' ',37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',27:'Escape',461:'Escape',10009:'Escape'}[event.keyCode] || ''));
}
export function initTV(doc, {storage, search = globalThis.location?.search || '', userAgent = globalThis.navigator?.userAgent || ''} = {}) {
 const root = doc.documentElement, toggle = doc.getElementById('tv-toggle');
 const panel = doc.getElementById('tv-options'), options = doc.getElementById('tv-option-list');
 const title = doc.getElementById('tv-options-title'), hint = doc.getElementById('tv-help');
 let enabled = false, editing = null, saved;
 const view = doc.defaultView;
 function sizeViewport() {
  if (!enabled) return;
  const height = Math.floor(view?.visualViewport?.height || view?.innerHeight || 0);
  if (height > 0) {
   root.style.setProperty('--tv-height', height + 'px');
   root.style.setProperty('--tv-vh', height / 100 + 'px');
  }
 }
 view?.addEventListener('resize', sizeViewport);
 view?.visualViewport?.addEventListener('resize', sizeViewport);
 try { saved = storage?.getItem(storageKey); } catch {}
 const forced = new URLSearchParams(search).get('tv');
 const initial = forced === '1' || (forced !== '0' && (saved === 'on' || (saved !== 'off' && detectTV(userAgent))));
 const pairs = [...doc.querySelectorAll('select')].map(select => {
  const button = doc.createElement('button');
  button.type = 'button'; button.className = 'tv-setting'; button.hidden = true;
  button.id = 'tv-' + select.id;
  button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-controls', panel.id);
  select.after(button);
  const label = select.closest('label');
  const name = label ? [...label.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim() : select.id;
  function sync() {
   const value = select.selectedOptions[0]?.textContent || 'Choisir';
   button.textContent = value + ' ▾'; button.setAttribute('aria-label', name + ' : ' + value);
  }
  select.addEventListener('change', sync); sync();
  button.onclick = () => open(select, button, name);
  return {select, button, sync};
 });
 const visible = node => !!node && !node.disabled && !node.closest('[hidden]') && node.getClientRects().length > 0;
 function focus(node) { if (visible(node)) { node.focus(); node.scrollIntoView({block:'nearest', inline:'nearest'}); } }
 function controls() {
  const scope = !panel.hidden ? panel : doc.querySelector('dialog[open]') || doc;
  return [...scope.querySelectorAll('button,select,a[href]')].filter(visible);
 }
 function close() {
  const origin = editing?.button; panel.hidden = true; editing = null;
  focus(origin);
 }
 function open(select, button, name) {
  editing = {select, button}; title.textContent = name;
  options.replaceChildren(...[...select.options].map(option => {
   const choice = doc.createElement('button'); choice.type = 'button';
   choice.textContent = option.textContent; choice.disabled = option.disabled;
   choice.setAttribute('aria-pressed', String(option.selected));
   choice.onclick = () => {
    select.value = option.value;
    select.dispatchEvent(new Event('change', {bubbles:true}));
    close();
   };
   return choice;
  }));
  panel.hidden = false;
  focus(options.querySelector('[aria-pressed="true"]') || options.querySelector('button'));
 }
 function focusView(id) {
  if (!enabled) return;
  const preferred = id === 'player' ? 'pause' : id === 'finish' ? 'tv-difficulty' : 'tv-session';
  focus(doc.getElementById(preferred));
 }
 function apply(value, persist = false) {
  close(); enabled = value; root.classList.toggle('tv-mode', value);
  sizeViewport();
  doc.dispatchEvent(new Event('sport-tv-layout-change'));
  toggle.setAttribute('aria-pressed', String(value)); toggle.textContent = value ? 'Mode TV : actif' : 'Mode TV';
  hint.hidden = !value;
  doc.querySelector('.keyboard-hint').hidden = value; doc.querySelector('.remote-hint').hidden = !value;
  for (const {select, button, sync} of pairs) { select.hidden = value; button.hidden = !value; sync(); }
  if (persist) { try { storage?.setItem(storageKey, value ? 'on' : 'off'); } catch {} }
 }
 toggle.onclick = () => { apply(!enabled, true); if (enabled) focusView(doc.body.classList.contains('session-active') ? 'player' : doc.getElementById('finish').hidden ? 'setup' : 'finish'); else focus(toggle); };
 doc.getElementById('tv-options-close').onclick = close;
 panel.addEventListener('click', event => { if (event.target === panel) close(); });
 function move(key) {
  const list = controls(), current = doc.activeElement;
  if (!list.includes(current)) { focus(list[0]); return; }
  if (!panel.hidden) {
   const offset = key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1;
   focus(list[(list.indexOf(current) + offset + list.length) % list.length]); return;
  }
  const a = current.getBoundingClientRect(), x = a.left + a.width / 2, y = a.top + a.height / 2;
  const horizontal = key === 'ArrowLeft' || key === 'ArrowRight', sign = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
  let best, score = Infinity;
  for (const node of list) {
   if (node === current) continue;
   const b = node.getBoundingClientRect(), dx = b.left + b.width / 2 - x, dy = b.top + b.height / 2 - y;
   const forward = (horizontal ? dx : dy) * sign, sideways = Math.abs(horizontal ? dy : dx);
   if (forward <= 1) continue;
   const candidate = forward + sideways * 4;
   if (candidate < score) { score = candidate; best = node; }
  }
  focus(best);
 }
 doc.addEventListener('keydown', event => {
  if (!enabled || event.altKey || event.ctrlKey || event.metaKey) return;
  const key = remoteKey(event), arrow = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key);
  const dialog = doc.querySelector('dialog[open]');
  if (key === 'Escape') {
   if (!panel.hidden) { event.preventDefault(); event.stopPropagation(); close(); }
   else if (dialog) { event.preventDefault(); event.stopPropagation(); dialog.close(); }
   return; // Never hijack the browser Back key outside a dialog.
  }
  if (key === 'Tab' && (!panel.hidden || dialog)) {
   const list = controls(), index = list.indexOf(doc.activeElement);
   event.preventDefault(); focus(list[(index + (event.shiftKey ? -1 : 1) + list.length) % list.length]); return;
  }
  if (!arrow && key !== 'Enter' && key !== ' ') return;
  event.preventDefault(); event.stopPropagation();
  if (arrow) { move(key); return; }
  if (event.repeat) return;
  const list = controls();
  if (!list.includes(doc.activeElement)) { focus(list[0]); return; }
  doc.activeElement.click();
  // A render can replace the focused demo-choice button.
  if (!visible(doc.activeElement) || doc.activeElement === doc.body) focusView(doc.getElementById('player').hidden ? 'setup' : 'player');
 }, true);
 apply(initial);
 if (enabled) focusView('setup');
 return {get enabled() { return enabled; }, focusView};
}
