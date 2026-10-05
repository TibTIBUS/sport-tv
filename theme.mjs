const storageKey='sport-tv-theme';
export function initTheme(root,button,surface,storage){
 let theme='dark',touch;
 try{const saved=storage?.getItem(storageKey);if(saved==='light')theme=saved;}catch{}
 const apply=value=>{
  theme=value;root.dataset.theme=theme;
  button.setAttribute('aria-pressed',String(theme==='light'));
  button.setAttribute('aria-label',theme==='dark'?'Passer au thème clair':'Passer au thème sombre');
  button.title=theme==='dark'?'Thème 2 · Clair':'Thème 1 · Sombre';
  button.querySelector('.theme-label').textContent=theme==='dark'?'Clair':'Sombre';
  const page=root.ownerDocument,timer=page.querySelector('.timer-card'),heading=page.querySelector('.session-heading'),footer=page.querySelector('.session-footer');
  if(timer&&heading&&footer){
   const target=page.getElementById('target'),motivation=page.getElementById('motivation');
   if(theme==='light'){timer.append(target,motivation);}else{heading.append(target);footer.before(motivation);}
  }
  try{storage?.setItem(storageKey,theme);}catch{}
 };
 apply(theme);
 button.addEventListener('click',()=>apply(theme==='dark'?'light':'dark'));
 // Swipe only from non-interactive page content; leave video gestures and scrolling alone.
 surface.addEventListener('touchstart',e=>{
  touch=null;if(e.touches.length!==1||e.target.closest('button,a,input,select,textarea,iframe,.video-frame,dialog'))return;
  const t=e.touches[0];touch={x:t.clientX,y:t.clientY};
 },{passive:true});
 surface.addEventListener('touchend',e=>{
  if(!touch)return;const start=touch;touch=null;if(e.touches.length||e.changedTouches.length!==1)return;
  const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(Math.abs(dx)>=85&&Math.abs(dx)>Math.abs(dy)*2)apply(dx<0?'light':'dark');
 },{passive:true});
 surface.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
}
