const apis={};
function sdk(provider){
 const ready=()=>provider==='vimeo'?globalThis.Vimeo:globalThis.YT;
 if(ready()?.Player)return Promise.resolve(ready());
 if(apis[provider])return apis[provider];
 apis[provider]=new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Le lecteur vidéo ne répond pas.')),15000);
  const done=()=>{clearTimeout(timeout);resolve(ready());};
  const script=document.createElement('script');
  if(provider==='youtube'){
   const previous=globalThis.onYouTubeIframeAPIReady;
   globalThis.onYouTubeIframeAPIReady=()=>{previous?.();done();};script.src='https://www.youtube.com/iframe_api';
  }else{script.src='https://player.vimeo.com/api/player.js';script.onload=done;}
  script.onerror=()=>{clearTimeout(timeout);reject(Error('Impossible de charger le lecteur vidéo.'));};document.head.append(script);
 }).catch(e=>{delete apis[provider];throw e;});return apis[provider];
}
export const demoVideos=d=>[d,...(d.more||[])];
export const videoUrl=d=>d.provider==='vimeo'?`https://vimeo.com/${d.videoId}`:`https://www.youtube.com/watch?v=${d.videoId}`;
export function validateDemos(demos,exercises){
 for(const [id,reference] of Object.entries(demos)){
  if(!exercises[id]||(reference.more&&!Array.isArray(reference.more)))throw Error('Démonstration invalide : '+id);
  for(const d of demoVideos(reference)){
   const provider=d.provider||'youtube';
   if(!['youtube','vimeo'].includes(provider)||!(provider==='vimeo'?/^\d+$/:/^[-\w]{11}$/).test(d.videoId)||!d.publisher||!d.name||!Array.isArray(d.points)||d.points.length!==2||d.points.some(p=>typeof p!=='string'||!p)||!d.avoid||!d.note||(d!==reference&&d.more))throw Error('Démonstration invalide : '+id);
   if(new URL(d.source).protocol!=='https:')throw Error('Source non sécurisée.');
  }
 }return demos;
}
function inlineFrame(iframe,name){
 iframe.title='Démonstration : '+name;
 iframe.removeAttribute('allowfullscreen');iframe.removeAttribute('webkitallowfullscreen');iframe.removeAttribute('mozallowfullscreen');
 iframe.setAttribute('allow',"autoplay; encrypted-media; fullscreen 'none'; picture-in-picture 'none'; remote-playback 'none'; presentation 'none'");
}
export class DemoPlayer{
 constructor(container,status){this.container=container;this.status=status;this.token=0;this.playing=false;}
 stop(){this.token++;try{const result=this.player?.destroy();result?.catch?.(()=>{});}catch{}this.player=null;this.container.replaceChildren();this.key=null;this.playing=false;}
 playback(playing){
  this.playing=playing;const player=this.player,token=this.token;if(!player)return;
  try{if(this.provider==='vimeo'){
   const action=playing?player.play():player.pause();action.catch(()=>{if(token===this.token&&playing)this.status.textContent='Clique sur Lecture dans la vidéo pour démarrer la démonstration.';});
  }else if(player.getPlayerState){if(playing){player.mute();player.playVideo();}else player.pauseVideo();}}catch{}
 }
 async load(d,playing=true){
  const key=videoUrl(d);if(this.key===key){this.playback(playing);return;}
  this.stop();const token=this.token;this.key=key;this.playing=playing;this.provider=d.provider||'youtube';this.status.textContent='Chargement de la démonstration…';
  const unavailable=()=>{if(token===this.token)this.status.textContent='Vidéo indisponible ici. Utilise le lien vers la vidéo originale ou les consignes.';};
  try{
   const API=await sdk(this.provider);if(token!==this.token)return;
   const mount=document.createElement('div');this.container.append(mount);
   if(this.provider==='vimeo'){
    const frame=document.createElement('iframe');inlineFrame(frame,d.name);
    frame.src=`https://player.vimeo.com/video/${d.videoId}?loop=1&muted=1&playsinline=1&dnt=1&chromecast=0&airplay=0&fullscreen=0&pip=0`;
    mount.replaceWith(frame);const player=new API.Player(frame);this.player=player;player.on('error',unavailable);
    await player.ready();if(token!==this.token)return;
    const iframe=this.container.querySelector('iframe');if(iframe)inlineFrame(iframe,d.name);
    await player.setVolume(0);if(token!==this.token)return;
    this.status.textContent='Vidéo muette · consignes en français ci-dessous';this.playback(this.playing);
   }else this.player=new API.Player(mount,{host:'https://www.youtube.com',videoId:d.videoId,width:'100%',height:'100%',playerVars:{playsinline:1,fs:0,controls:1,rel:0,enablejsapi:1,origin:location.origin},events:{
    onReady:e=>{if(token!==this.token)return;inlineFrame(e.target.getIframe(),d.name);e.target.mute();this.status.textContent='Vidéo muette · consignes en français ci-dessous';this.playback(this.playing);},
    onStateChange:e=>{if(token!==this.token)return;if(e.data===0&&this.playing){e.target.seekTo(0);e.target.playVideo();}},onError:unavailable
   }});
  }catch(e){if(token===this.token)this.status.textContent=e.message+' Les consignes restent disponibles.';}
 }
}
