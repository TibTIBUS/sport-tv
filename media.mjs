let api;
function youtube(){
 if(globalThis.YT?.Player)return Promise.resolve(globalThis.YT);
 if(api)return api;
 api=new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Le lecteur vidéo ne répond pas.')),15000);
  const previous=globalThis.onYouTubeIframeAPIReady;
  globalThis.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve(globalThis.YT);};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);reject(Error('Impossible de charger YouTube.'));};document.head.append(script);
 });return api;
}
export function validateDemos(demos,exercises){
 for(const [id,d] of Object.entries(demos)){
  if(!exercises[id]||!/^[-\w]{11}$/.test(d.videoId)||!d.publisher||!d.name||!Array.isArray(d.points)||d.points.length!==2||d.points.some(p=>typeof p!=='string'||!p)||!d.avoid||!d.note)throw Error('Démonstration invalide : '+id);
  if(new URL(d.source).protocol!=='https:')throw Error('Source non sécurisée.');
 }return demos;
}
export class DemoPlayer{
 constructor(container,status){this.container=container;this.status=status;this.token=0;this.playing=false;}
 stop(){this.token++;this.player?.destroy();this.player=null;this.container.replaceChildren();this.key=null;this.playing=false;}
 playback(playing){this.playing=playing;if(this.player?.getPlayerState){try{if(playing){this.player.mute();this.player.playVideo();}else this.player.pauseVideo();}catch{}}}
 async load(d,playing=true){
  if(this.key===d.videoId){this.playback(playing);return;}
  this.stop();const token=this.token;this.key=d.videoId;this.playing=playing;this.status.textContent='Chargement de la démonstration…';
  try{
   const YT=await youtube();if(token!==this.token)return;
   const mount=document.createElement('div');this.container.append(mount);
   this.player=new YT.Player(mount,{host:'https://www.youtube-nocookie.com',videoId:d.videoId,width:'100%',height:'100%',playerVars:{playsinline:1,controls:1,rel:0,enablejsapi:1,origin:location.origin},events:{
    onReady:e=>{if(token!==this.token)return;e.target.getIframe().title='Démonstration : '+d.name;e.target.mute();this.status.textContent='Vidéo muette · consignes en français ci-dessous';this.playback(this.playing);},
    onStateChange:e=>{if(token!==this.token)return;if(e.data===0&&this.playing){e.target.seekTo(0);e.target.playVideo();}},
    onError:()=>{if(token!==this.token)return;this.status.textContent='Vidéo indisponible ici. Utilise le lien vers la vidéo originale ou les consignes.';}
   }});
  }catch(e){if(token===this.token)this.status.textContent=e.message+' Les consignes restent disponibles.';}
 }
}
