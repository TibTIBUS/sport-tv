const storageKey='sport-tv-audio-v1';
const patterns={
 tick:[[0,660,.08]],prepare:[[0,620,.1]],go:[[0,880,.13],[.17,1100,.15]],
 rest:[[0,550,.15],[.19,440,.2]],cool:[[0,660,.18],[.23,523,.22]],
 finish:[[0,523,.14],[.18,659,.14],[.36,784,.3]]
};
export class WorkoutAudio {
 constructor({storage,view=globalThis,onChange=()=>{}}={}){
  this.storage=storage;this.view=view;this.onChange=onChange;this.mode='voice';this.volume=.5;
  this.context=null;this.nodes=new Set();this.unlocked=false;this.lastTick='';this.round=0;this.voiceFailed=false;this.audioFailed=false;
  try{const saved=JSON.parse(storage?.getItem(storageKey)||'null');if(saved&&['mute','beep','voice'].includes(saved.mode))this.mode=saved.mode;if(saved&&Number.isFinite(saved.volume)&&saved.volume>=0&&saved.volume<=1)this.volume=saved.volume;}catch{}
  try{view.speechSynthesis?.addEventListener?.('voiceschanged',()=>this.onChange());}catch{}
 }
 frenchVoice(){
  try{const voices=(this.view.speechSynthesis?.getVoices()||[]).filter(v=>/^fr(?:[-_]|$)/i.test(v.lang));return voices.find(v=>v.localService&&v.lang==='fr-FR')||voices.find(v=>v.localService)||voices[0];}catch{return null;}
 }
 get canSpeak(){return !this.voiceFailed&&!!this.view.SpeechSynthesisUtterance&&!!this.frenchVoice();}
 get canBeep(){return !this.audioFailed&&!!(this.view.AudioContext||this.view.webkitAudioContext);}
 get status(){
  if(this.mode==='mute'||this.volume===0)return 'Son désactivé.';
  if(this.mode==='voice'&&this.canSpeak)return this.canBeep?'Bips et voix française activés.':'Voix française activée ; bips indisponibles ici.';
  if(!this.canBeep)return 'Le son n’est pas disponible dans ce navigateur.';
  return this.mode==='voice'?'Voix française indisponible ici : bips seuls.':'Bips activés.';
 }
 configure(mode,volume){
  if(!['mute','beep','voice'].includes(mode)||!Number.isFinite(volume)||volume<0||volume>1)return;
  this.clear();this.mode=mode;this.volume=volume;
  try{this.storage?.setItem(storageKey,JSON.stringify({mode,volume}));}catch{}
  this.onChange();
 }
 unlock(){
  this.unlocked=true;
  if(this.mode==='mute'||this.volume===0)return;
  if(!this.canBeep)return;
  try{
   const Context=this.view.AudioContext||this.view.webkitAudioContext;
   this.context??=new Context();
   const resumed=this.context.resume();
   resumed?.catch?.(()=>{this.audioFailed=true;this.onChange();});
  }catch{this.audioFailed=true;this.onChange();}
 }
 clearSpeech(){try{this.view.speechSynthesis?.cancel();}catch{}}
 clear(){
  this.clearSpeech();
  for(const node of this.nodes){try{node.stop();}catch{}try{node.disconnect();}catch{}}
  this.nodes.clear();
 }
 reset(){this.clear();this.lastTick='';this.round=0;}
 tone(kind){
  if(!this.unlocked||this.mode==='mute'||this.volume===0||!this.context||this.audioFailed)return;
  try{
   const context=this.context,start=context.currentTime;
   for(const [offset,frequency,duration] of patterns[kind]||[]){
    const node=context.createOscillator(),gain=context.createGain(),at=start+offset;
    node.type='sine';node.frequency.value=frequency;
    node.connect(gain);gain.connect(context.destination);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12*this.volume,at+.01);gain.gain.linearRampToValueAtTime(0,at+duration);
    this.nodes.add(node);node.onended=()=>{this.nodes.delete(node);try{node.disconnect();gain.disconnect();}catch{}};
    node.start(at);node.stop(at+duration+.02);
   }
  }catch{this.audioFailed=true;this.onChange();}
 }
 say(text){
  if(!this.unlocked||this.mode!=='voice'||this.volume===0||!this.canSpeak)return;
  try{
   this.clearSpeech();
   const utterance=new this.view.SpeechSynthesisUtterance(text);
   utterance.lang='fr-FR';utterance.voice=this.frenchVoice();utterance.rate=1;utterance.volume=this.volume;
   utterance.onerror=event=>{if(!['canceled','interrupted'].includes(event.error)){this.voiceFailed=true;this.onChange();}};
   this.view.speechSynthesis.speak(utterance);
  }catch{this.voiceFailed=true;this.onChange();}
 }
 step(step){
  this.clear();
  if(step.phase==='Échauffement'){this.tone('go');this.say('C’est parti, Thibaut. Échauffement.');}
  else if(step.phase==='Préparation'){
   let round='';
   if(step.round&&step.round!==this.round){this.round=step.round;round=(step.round===1?'Premier passage':step.round===2?'Deuxième passage':`${step.round}e passage`)+` sur ${step.rounds}, Thibaut. `;}
   this.tone('prepare');this.say(round+'Prépare-toi : '+step.name+'.');
  }else if(step.phase==='Exercice'){this.tone('go');this.say('À toi de jouer.');}
  else if(step.phase==='Récupération'){this.tone('rest');this.say('Repos.');}
  else if(step.phase==='Retour au calme'){this.tone('cool');this.say('Retour au calme. Ralentis doucement.');}
 }
 tick(index,remaining,next){
  const second=Math.ceil(remaining);
  if(next?.phase!=='Exercice'||second<1||second>3)return;
  const key=index+':'+second;if(this.lastTick===key)return;this.lastTick=key;
  this.clearSpeech();this.tone('tick');
 }
 complete(){this.clear();this.tone('finish');this.say('Séance terminée. Bravo Thibaut !');}
 test(){this.clear();this.unlock();this.tone('go');this.say('Le son est activé, Thibaut.');}
}
export function initAudio(doc,{storage,onOpen=()=>{},view=globalThis}={}){
 const $=id=>doc.getElementById(id),panel=$('sound-dialog'),button=$('sound-toggle');
 const render=()=>{
  $('sound-mode').value=sound.mode;$('sound-volume').value=String(Math.round(sound.volume*100));
  const label=sound.mode==='mute'||sound.volume===0?'muet':sound.mode==='voice'?'voix':'bips';
  button.textContent='Son : '+label;button.setAttribute('aria-label','Réglages du son : '+label);
  $('sound-status').textContent=sound.status;
 };
 const sound=new WorkoutAudio({storage,view,onChange:render});
 const close=()=>{sound.clear();panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus?.();};
 button.onclick=()=>{
  if(!panel.hidden){close();return;}
  onOpen();panel.hidden=false;button.setAttribute('aria-expanded','true');
  const mode=$('sound-mode');(mode.hidden?$('tv-sound-mode'):mode)?.focus?.();
 };
 $('close-sound').onclick=close;
 $('test-sound').onclick=()=>sound.test();
 const change=()=>sound.configure($('sound-mode').value,Number($('sound-volume').value)/100);
 $('sound-mode').addEventListener('change',change);$('sound-volume').addEventListener('change',change);
 panel.addEventListener('click',event=>{if(event.target===panel)close();});
 doc.addEventListener('keydown',event=>{
  if(panel.hidden||event.defaultPrevented)return;
  if(event.key==='Escape'){event.preventDefault();close();}
  if(event.key==='Tab'){
   const list=[...panel.querySelectorAll('button,select')].filter(e=>!e.hidden&&!e.disabled&&e.getClientRects().length);
   const index=list.indexOf(doc.activeElement),next=(index+(event.shiftKey?-1:1)+list.length)%list.length;
   event.preventDefault();list[next]?.focus();
  }
 });
 render();return sound;
}
