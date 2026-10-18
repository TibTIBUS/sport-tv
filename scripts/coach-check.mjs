import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RecordedCoach,coachClips,coachParts} from '../coach.mjs';
import {WorkoutAudio} from '../audio.mjs';
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const made=[];let release,network=0;
const context={currentTime:10,destination:{},state:'running',resume:()=>Promise.resolve(),
 decodeAudioData:async()=>({duration:61.16}),
 createBufferSource(){const source={connect(){},disconnect(){},start(...args){this.args=args;made.push(this);},stop(){this.stopped=true;}};return source;},
 createGain(){return {gain:{},connect(){},disconnect(){}};}
};
const view={AudioContext:class{constructor(){return context;}},fetch:()=>{network++;return new Promise(r=>release=r);}};
const coach=new RecordedCoach({view});
coach.speak('À toi de jouer.',{context,volume:.25});coach.stop();
release({ok:true,arrayBuffer:async()=>new ArrayBuffer(2)});await settle();
assert.equal(made.length,0,'pause cancels speech waiting for download');assert(coach.ready);
assert(coach.speak('Premier passage sur 3, Thibaut. Prépare-toi : Gainage sur les coudes.',{context,volume:.25}));await settle();
assert.equal(made.length,2);assert(made[1].args[0]>made[0].args[0]);assert.equal(network,1,'audio reused');
coach.stop();assert(made.every(s=>s.stopped));
assert.equal(coachParts('Une annonce inconnue.'),null);
const program=JSON.parse(fs.readFileSync(new URL('../data/program.json',import.meta.url)));
for(const movement of Object.values(program.exercises).filter(e=>e.name!=='Repos'))assert(coachParts('Prépare-toi : '+movement.name+'.'));
for(const [offset,duration] of Object.values(coachClips)){assert(offset>=0&&duration>0);assert(offset+duration<=61.16);}
let fallback=0;
const invalid=new RecordedCoach({view:{...view,fetch:async()=>({ok:false})}});
invalid.speak('Repos.',{context,volume:1,onFallback:()=>fallback++});await settle();assert.equal(fallback,1);assert(invalid.failed);
const brokenDecode=new RecordedCoach({view:{...view,fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)})}});
brokenDecode.speak('Repos.',{context:{...context,decodeAudioData(){throw Error('unsupported mp3');}},volume:1,onFallback:()=>fallback++});await settle();assert.equal(fallback,2);
const playbackView={...view,fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(2)})};
const sound=new WorkoutAudio({view:playbackView});await settle();sound.unlock();
const before=made.length;sound.say('Repos.');await settle();assert.equal(made.length,before+1,'recorded voice works without speechSynthesis');
sound.clear();assert(made.at(-1).stopped);
sound.configure('mute',1);sound.say('Repos.');await settle();assert.equal(made.length,before+1);
sound.configure('voice',0);sound.say('Repos.');await settle();assert.equal(made.length,before+1);
console.log('OK : voix enregistrée sans synthèse système, 27 annonces, exercices couverts, passages enchaînés, annulation en chargement et lecture, muet/volume nul, repli sur erreurs de téléchargement/décodage.');
