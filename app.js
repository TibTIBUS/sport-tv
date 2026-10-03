import {validate,plan} from './planner.mjs';
import {parseSettings} from './settings.mjs';
import {DemoPlayer,validateDemos,videoUrl,demoVideos} from './media.mjs?v=gestes-complets-2';
const $=id=>document.getElementById(id);let data,current,steps=[],index=0,remaining=0,deadline=0,running=false,active=false,elapsed=0,last=0,audio,started,completed=false;
let demos={},watching=false,demoExercise=null,demoSelection=0;
const inlineDemo=new DemoPlayer($('demo-video'),$('demo-status'));
const dialogDemo=new DemoPlayer($('dialog-video'),$('dialog-status'));
function demoText(prefix,d){$(prefix+'-points').replaceChildren(...d.points.map(point=>{const li=document.createElement('li');li.textContent=point;return li;}));$(prefix+'-avoid').textContent=d.avoid;$(prefix+'-note').textContent=d.note;$(prefix+'-source').href=d.source;$(prefix+'-source').textContent=d.publisher;$(prefix+'-original').href=videoUrl(d);}
function updateDemo(s){
 const reference=demos[s.id];
 const visible=!!reference&&s.id!=='rest';
 $('demo-panel').hidden=!visible;
 if(!visible){inlineDemo.stop();demoExercise=null;return;}
 if(demoExercise!==s.id){demoExercise=s.id;demoSelection=0;}
 const videos=demoVideos(reference),d=videos[demoSelection]||reference;
 demoText('demo',d);
 $('demo-choices').replaceChildren(...(s.easier?[]:videos.length>1?videos.map((v,n)=>{
  const b=document.createElement('button');b.textContent=v.name;b.setAttribute('aria-pressed',String(n===demoSelection));
  b.onclick=()=>{if(running)$('pause').click();demoSelection=n;watching=true;render();};return b;
 }):[]));
 if(s.easier){inlineDemo.stop();$('demo-status').textContent='Variante facile : vidéo de référence retirée. Suis les consignes affichées à gauche.';}else inlineDemo.load(d,running||watching);
 $('watch').disabled=!!s.easier;
}
function openDemo(d){$('dialog-title').textContent=d.name;demoText('dialog',d);$('demo-dialog').showModal();dialogDemo.load(d,true);}
function renderLibrary(){
 const ids=[...new Set(current.steps.map(s=>s.id))].filter(id=>demos[id]);
 const videos=[...new Map(ids.flatMap(id=>demoVideos(demos[id])).map(d=>[videoUrl(d),d])).values()];
 $('demo-list').replaceChildren(...videos.map(d=>{const b=document.createElement('button');b.textContent='Voir : '+d.name;b.onclick=()=>openDemo(d);return b;}));
 document.querySelector('.demo-library').hidden=!videos.length;
}
$('close-demo').onclick=()=>$('demo-dialog').close();$('demo-dialog').addEventListener('close',()=>dialogDemo.stop());
$('watch').onclick=()=>{if(running)$('pause').click();watching=true;inlineDemo.playback(true);$('demo-status').textContent='Observe à ton rythme. Clique sur Reprendre quand tu es prêt.';};
for(const id of ['demo-original','demo-source'])$(id).onclick=()=>{if(running)$('pause').click();};
const fmt=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.ceil(s%60).toString().padStart(2,'0')}`;
function beep(){try{if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);g.gain.value=.08;o.frequency.value=660;o.start();o.stop(audio.currentTime+.15);}catch{}}
function show(id){for(const s of ['setup','player','finish'])$(s).hidden=s!==id;}
function refresh(){try{current=plan(data,{day:Number($('day').value),minutes:Number($('duration').value),energy:$('energy').value,knee:$('knee').value,run:$('run').value});$('title').textContent=current.title;$('summary').textContent=current.steps.length?`${$('duration').value} minutes · Échauffement et pauses inclus · Deux haltères de 5 kg si adaptés`:'Jour de repos';$('notice').textContent=current.notice;$('start').disabled=!current.steps.length;$('preview').replaceChildren(...[...new Set(current.steps.filter(s=>s.phase==='Exercice').map(s=>s.name))].map(name=>{const li=document.createElement('li');li.textContent=name;return li;}));renderLibrary();}catch(e){$('error').textContent=e.message;$('start').disabled=true;}}
const phaseTitles={Préparation:'Prépare-toi',Exercice:'À toi de jouer',Récupération:'Repos',Échauffement:'Échauffe-toi', 'Retour au calme':'Ralentis doucement'};
const encouragements=[
 'Allez Thibaut, une répétition après l’autre !',
 'Thibaut, avance à ton rythme : chaque effort compte.',
 'Garde le contrôle, Thibaut. La qualité du geste passe avant la vitesse.',
 'Tu prends du temps pour toi, Thibaut. Continue tranquillement.',
 'Respire, Thibaut, et garde un mouvement fluide.',
 'Thibaut, la régularité se construit séance après séance.'
];
function motivate(){
 const s=steps[index],message=$('motivation');
 message.hidden=s.phase!=='Exercice';
 if(message.hidden){message.textContent='';return;}
 if(!running){message.textContent='Prends ton temps, Thibaut. Reprends quand tu es prêt.';return;}
 const exerciseNumber=steps.slice(0,index).filter(step=>step.phase==='Exercice').length;
 const moment=Math.floor(Math.max(0,s.seconds-remaining)/10);
 message.textContent=s.easier?'Thibaut, adapte le geste à ton énergie. Bouger avec contrôle, c’est déjà avancer.':encouragements[(exerciseNumber+moment)%encouragements.length];
}
function render(){
 const s=steps[index],next=steps[index+1],preparing=s.phase==='Préparation';
 $('phase').textContent=`${s.phase} · Étape ${index+1} / ${steps.length}`;
 $('stage').dataset.phase=s.phase;
 $('stage-title').textContent=phaseTitles[s.phase]||s.phase;
 $('stage-help').textContent=preparing?'Ne commence pas encore les répétitions. Regarde le geste et place-toi ; le départ arrive à la fin du compte à rebours.':s.phase==='Exercice'?'Fais le mouvement maintenant, à ton rythme. Termine les répétitions indiquées, puis repose-toi si du temps reste.':s.phase==='Récupération'?'Relâche les muscles. Cette pause fait partie de la séance.':s.phase==='Échauffement'?'Commence à bouger doucement. Augmente le rythme progressivement.':'Marche lentement et laisse ta respiration ralentir.';
 $('exercise').textContent=s.name;$('cue').textContent=s.cue;
 $('target').textContent=preparing?`À suivre : ${next?.seconds||0} secondes de mouvement · ${next?.target||'À ton rythme'}`:s.target||'À ton rythme';
 $('clock').setAttribute('aria-label',preparing?'Temps avant le départ':'Temps restant');$('clock').textContent=fmt(Math.ceil(remaining));
 $('next').textContent=next?`Ensuite : ${phaseTitles[next.phase]||next.phase} · ${next.name} · ${next.seconds} s`:'Dernière étape';
 $('progress').value=100*(index/steps.length);$('pause').textContent=running?'Pause':'Reprendre';updateDemo(s);motivate();
}
function finish(done){inlineDemo.stop();watching=false;running=false;active=false;completed=done;$('result').textContent=done?'Séance terminée.':'Séance arrêtée.';show('finish');}
function advance(){watching=false;if(++index>=steps.length){finish(true);return;}remaining=steps[index].seconds;deadline=performance.now()+remaining*1000;last=performance.now();render();beep();}
$('start').onclick=()=>{steps=current.steps.map(s=>({...s}));watching=false;index=0;remaining=steps[0].seconds;elapsed=0;started=new Date().toISOString();active=true;running=true;last=performance.now();deadline=last+remaining*1000;try{audio??=new AudioContext();audio.resume();}catch{}show('player');render();};
$('pause').onclick=()=>{if(!active)return;watching=false;if(running){remaining=Math.max(0,(deadline-performance.now())/1000);running=false;}else{running=true;last=performance.now();deadline=last+remaining*1000;}render();};
$('skip').onclick=()=>{if(active)advance();};$('stop').onclick=()=>{if(active)finish(false);};
$('easy').onclick=()=>{for(let n=index;n<steps.length;n++)if(steps[n].phase==='Exercice'||steps[n].phase==='Préparation'){steps[n].easier=true;steps[n].cue=steps[n].easy;steps[n].target='Variante facile · À ton rythme';}render();};
setInterval(()=>{if(!active||!running)return;const now=performance.now(),gap=now-last;if(gap>5000){remaining=Math.max(0,(deadline-last)/1000);running=false;render();$('next').textContent='Séance mise en pause après une interruption. Reprends quand tu es prêt.';return;}elapsed+=gap/1000;last=now;remaining=Math.max(0,(deadline-now)/1000);if(remaining<=0)advance();else {$('clock').textContent=fmt(Math.ceil(remaining));motivate();}},100);
$('back').onclick=()=>{show('setup');refresh();};
$('download').onclick=()=>{const report={version:1,started,session:current.title,completed,activeSeconds:Math.round(elapsed),difficulty:$('difficulty').value,kneeDuring:$('feedback-knee').value,kneeNextMorning:null};const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`bilan-${started.slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('error').textContent='Le plein écran n’est pas disponible dans ce navigateur.';}};
document.addEventListener('keydown',e=>{if(!active||['SELECT','INPUT','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();$('pause').click();}if(e.code==='ArrowRight'){e.preventDefault();$('skip').click();}});
try{const response=await fetch('./data/program.json',{cache:'no-store'});if(!response.ok)throw Error('Programme indisponible.');data=validate(await response.json());try{const dr=await fetch('./data/demos.json',{cache:'no-store'});if(!dr.ok)throw Error('Démonstrations indisponibles.');demos=validateDemos(await dr.json(),data.exercises);}catch{$('error').textContent='Les vidéos sont indisponibles. Les séances et les consignes restent accessibles.';}data.days.forEach((d,i)=>{const o=document.createElement('option');o.value=i;o.textContent=d.day;$('day').append(o);});$('day').value=(new Date().getDay()+6)%7;const {values,bad}=parseSettings(location.search,data.days.map(d=>d.day));if('day' in values)$('day').value=values.day;if('minutes' in values)$('duration').value=values.minutes;if('energy' in values)$('energy').value=values.energy;if('knee' in values)$('knee').value=values.knee;if('run' in values)$('run').value=values.run;for(const id of ['day','duration','energy','knee','run'])$(id).onchange=()=>{$('error').textContent='';$('applied').textContent='';refresh();};refresh();if(Object.keys(values).length)$('applied').textContent='Réglages reçus par l’adresse : '+['day','duration','energy','knee','run'].map(id=>$(id).selectedOptions[0].textContent).join(' · ');if(bad.length){$('error').textContent=`Réglage non reconnu dans l’adresse : ${bad.join(', ')}. Corrige-le ou choisis à la main.`;$('start').disabled=true;}}catch(e){$('error').textContent=`Impossible de charger les séances : ${e.message} Lance ce site avec un serveur HTTP.`;}
