/* French workout announcements generated with ElevenLabs via HeyGen.
   Voice: Marc Aurèle; model: eleven_multilingual_v2; 2026-10-18.
   Packed from one generation; offsets use the supplied word timestamps. */
export const coachClips={
 "C’est parti, Thibaut. Échauffement.": [
  0,
  2.205
 ],
 "À toi de jouer.": [
  2.205,
  0.878
 ],
 "Repos.": [
  3.083,
  0.634
 ],
 "Retour au calme. Ralentis doucement.": [
  3.717,
  2.933
 ],
 "Séance terminée. Bravo Thibaut !": [
  6.65,
  2.515
 ],
 "Le son est activé, Thibaut.": [
  9.165,
  1.575
 ],
 "Premier passage sur 3, Thibaut.": [
  10.74,
  1.957
 ],
 "Deuxième passage sur 3, Thibaut.": [
  12.697,
  2.016
 ],
 "3e passage sur 3, Thibaut.": [
  14.713,
  2.225
 ],
 "Prépare-toi : Échauffement.": [
  16.938,
  1.865
 ],
 "Prépare-toi : Retour au calme.": [
  18.803,
  1.935
 ],
 "Prépare-toi : Squat contrôlé.": [
  20.738,
  2.155
 ],
 "Prépare-toi : Pompes au mur.": [
  22.893,
  2.051
 ],
 "Prépare-toi : Tirage avec haltère.": [
  24.944,
  2.33
 ],
 "Prépare-toi : Hanches en arrière.": [
  27.274,
  2.283
 ],
 "Prépare-toi : Pont de hanches.": [
  29.557,
  1.9
 ],
 "Prépare-toi : Stabilité du tronc.": [
  31.457,
  2.562
 ],
 "Prépare-toi : Flexion des bras.": [
  34.019,
  2.364
 ],
 "Prépare-toi : Marche active sur place.": [
  36.383,
  3.003
 ],
 "Prépare-toi : Pas latéraux.": [
  39.386,
  1.993
 ],
 "Prépare-toi : Mobilité des épaules.": [
  41.379,
  2.701
 ],
 "Prépare-toi : Mobilité des chevilles.": [
  44.08,
  2.481
 ],
 "Prépare-toi : Gainage sur les coudes.": [
  46.561,
  2.701
 ],
 "Prépare-toi : Gainage côté gauche.": [
  49.262,
  2.84
 ],
 "Prépare-toi : Gainage côté droit.": [
  52.102,
  2.596
 ],
 "Prépare-toi : Gainage dynamique sur les coudes.": [
  54.698,
  3.49
 ],
 "Prépare-toi : Chaise contre le mur.": [
  58.188,
  2.922
 ]
};

export function coachParts(text){
 if(coachClips[text])return [text];
 for(const prefix of ['Premier passage sur 3, Thibaut.','Deuxième passage sur 3, Thibaut.','3e passage sur 3, Thibaut.']){
  if(text.startsWith(prefix+' ')&&coachClips[text.slice(prefix.length+1)])return [prefix,text.slice(prefix.length+1)];
 }
 return null;
}

export class RecordedCoach {
 constructor({view=globalThis,onChange=()=>{}}={}){
  this.view=view;this.onChange=onChange;this.bytes=null;this.buffer=null;this.context=null;
  this.promise=null;this.decode=null;this.failed=false;this.token=0;this.sources=new Set();
  this.supported=!!view.fetch&&!!(view.AudioContext||view.webkitAudioContext);
 }
 get ready(){return !!this.bytes&&!this.failed;}
 preload(){
  if(!this.supported)return Promise.resolve(null);
  if(!this.promise)this.promise=(async()=>{
   let timeout;const controller=this.view.AbortController?new this.view.AbortController():null;
   try{
    const bytes=await Promise.race([(async()=>{
     const response=await this.view.fetch(new URL('./assets/coach-fr.mp3',import.meta.url),controller?{signal:controller.signal}:{});
     if(!response.ok)throw Error('coach audio unavailable');return response.arrayBuffer();
    })(),new Promise((_,reject)=>{timeout=setTimeout(()=>{controller?.abort();reject(Error('coach audio timeout'));},10000);})]);
    if(!bytes.byteLength)throw Error('empty coach audio');
    this.bytes=bytes;this.failed=false;this.onChange();return bytes;
   }catch{this.failed=true;this.onChange();return null;}finally{clearTimeout(timeout);}
  })();
  return this.promise;
 }
 stop(){
  this.token++;
  for(const source of this.sources){try{source.stop();source.disconnect();}catch{}}
  this.sources.clear();
 }
 retry(){
  if(this.failed){this.failed=false;this.promise=null;this.decode=null;this.buffer=null;}
 }
 speak(text,{context,volume,onFallback=()=>{}}){
  const parts=coachParts(text);
  if(!this.supported||this.failed||!parts||!context?.decodeAudioData||!context.createBufferSource)return false;
  const token=this.token;
  (async()=>{
   try{
    const bytes=await this.preload();if(token!==this.token)return;if(!bytes)throw Error('coach download failed');
    if(this.context!==context){this.context=context;this.buffer=null;this.decode=null;}
    if(!this.decode)this.decode=new Promise((resolve,reject)=>{
     const decoded=context.decodeAudioData(bytes.slice(0),resolve,reject);decoded?.then?.(resolve,reject);
    });
    const buffer=await this.decode;if(token!==this.token)return;this.buffer=buffer;
    let at=context.currentTime;
    for(const part of parts){
     const [offset,duration]=coachClips[part];
     if(offset+duration>buffer.duration+.05)throw Error('coach clip outside audio');
     const source=context.createBufferSource(),gain=context.createGain();
     source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(context.destination);
     this.sources.add(source);source.onended=()=>{this.sources.delete(source);try{source.disconnect();gain.disconnect();}catch{}};
     source.start(at,offset,duration);at+=duration+.1;
    }
   }catch{
    if(token!==this.token)return;this.stop();this.failed=true;this.onChange();onFallback();
   }
  })();
  return true;
 }
}
