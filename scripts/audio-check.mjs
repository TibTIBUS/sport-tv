import assert from 'node:assert/strict';
import {WorkoutAudio} from '../audio.mjs';
const notes=[],said=[],saved=new Map();let canceled=0,resumes=0,updates=0,voices=[{lang:'en-US'},{lang:'fr-FR',localService:true}];
class Context{
 constructor(){this.currentTime=0;this.destination={};}
 resume(){resumes++;return Promise.resolve();}
 createOscillator(){const note={frequency:{},connect(){},disconnect(){},start(at){this.at=at;notes.push(this);},stop(){this.stopped=true;}};return note;}
 createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(value){if(value>0)this.peak=value;}},connect(){},disconnect(){}};}
}
const speech={getVoices:()=>voices,addEventListener(type,fn){this.changed=fn;},cancel(){canceled++;},speak(u){said.push(u);}};
const view={AudioContext:Context,speechSynthesis:speech,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
const audio=new WorkoutAudio({view,storage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},onChange:()=>updates++});
assert.equal(audio.mode,'voice');assert.equal(audio.volume,.5);assert.equal(audio.canSpeak,true);
audio.step({phase:'Échauffement'});assert.equal(notes.length,0);assert.equal(said.length,0,'no autoplay before gesture');
audio.reset();audio.unlock();audio.step({phase:'Échauffement'});assert.equal(notes.length,2);assert.match(said.at(-1).text,/Échauffement/);assert.equal(said.at(-1).lang,'fr-FR');assert.equal(said.at(-1).voice.localService,true);assert.equal(said.at(-1).volume,.5);
audio.step({phase:'Préparation',round:1,rounds:3,name:'Gainage sur les coudes'});assert.match(said.at(-1).text,/Premier passage.*Gainage/);
audio.step({phase:'Préparation',round:1,rounds:3,name:'Gainage côté gauche'});assert(!said.at(-1).text.includes('Premier passage'));
audio.step({phase:'Préparation',round:2,rounds:3,name:'Gainage sur les coudes'});assert.match(said.at(-1).text,/Deuxième passage/);
const before=notes.length;
for(const remaining of [3,2.9,2.8,2,1.9,1,0])audio.tick(4,remaining,{phase:'Exercice'});
assert.equal(notes.length-before,3,'one beep for each of 3, 2, 1');
const paused=notes.length;audio.clear();audio.tick(4,1,{phase:'Exercice'});assert.equal(notes.length,paused,'no duplicate countdown after pause');
audio.tick(5,3,{phase:'Préparation'});assert.equal(notes.length,paused,'no countdown over a recovery/preparation boundary');
audio.step({phase:'Récupération'});assert.equal(said.at(-1).text,'Repos.');
audio.complete();assert.match(said.at(-1).text,/Bravo Thibaut/);assert(notes.slice(-3).every(n=>n.frequency.value>0));
audio.clear();assert.equal(audio.nodes.size,0);
audio.configure('beep',.25);const voicesBefore=said.length;audio.test();assert.equal(said.length,voicesBefore);assert(resumes>=2);
audio.configure('mute',1);const mutedNotes=notes.length;audio.test();audio.step({phase:'Exercice'});audio.complete();assert.equal(notes.length,mutedNotes);assert.equal(said.length,voicesBefore);
audio.configure('voice',0);audio.test();assert.equal(notes.length,mutedNotes);assert.equal(said.length,voicesBefore);
assert.equal(new WorkoutAudio({view,storage:{getItem:k=>saved.get(k)}}).volume,0,'zero volume persists');
audio.configure('voice',.75);assert.equal(new WorkoutAudio({view,storage:{getItem:k=>saved.get(k)}}).mode,'voice');
voices=[];assert.match(audio.status,/bips seuls/);audio.test();assert.equal(said.length,voicesBefore);assert(notes.length>mutedNotes);
voices=[{lang:'fr-FR',localService:true}];speech.changed();audio.test();assert.equal(said.at(-1).volume,.75);
said.at(-1).onerror({error:'interrupted'});assert.equal(audio.canSpeak,true);
said.at(-1).onerror({error:'synthesis-failed'});assert.equal(audio.canSpeak,false);assert.match(audio.status,/bips seuls/);
const unsupported=new WorkoutAudio({view:{}});unsupported.unlock();unsupported.test();assert.match(unsupported.status,/pas disponible/);
const denied=new WorkoutAudio({view:{AudioContext:class{constructor(){throw Error('unsupported');}}}});denied.unlock();assert.match(denied.status,/pas disponible/);
let attempts=0;
class RetriableContext extends Context{resume(){return ++attempts===1?Promise.reject(Error('not allowed yet')):Promise.resolve();}}
const retry=new WorkoutAudio({view:{AudioContext:RetriableContext}});retry.unlock();await Promise.resolve();assert.equal(retry.audioFailed,true);retry.test();await Promise.resolve();assert.equal(retry.audioFailed,false);assert.equal(attempts,2);
const corrupt=new WorkoutAudio({view,storage:{getItem:()=>'{bad'}});assert.equal(corrupt.volume,.5);
audio.configure('invalid',-1);assert.equal(audio.volume,.75);
assert(canceled>0&&updates>0);
console.log('OK : activation sur geste, voix française, passages, 3/2/1 sans doublon, pause, fin, modes/volume mémorisés, annulation et repli sans voix/audio.');
