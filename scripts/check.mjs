import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {validate,plan} from '../planner.mjs';
import {parseSettings} from '../settings.mjs';
const data=validate(JSON.parse(readFileSync(new URL('../data/program.json',import.meta.url),'utf8')));
for(const ids of [data.gentle,data.afterRun])assert(ids.length&&ids.every(id=>data.exercises[id]));
for(let day=0;day<6;day++)for(const minutes of [20,25,30])for(const energy of ['good','medium','tired'])for(const knee of ['ok','discomfort','pain'])for(const run of ['no','yes']){
 const p=plan(data,{day,minutes,energy,knee,run});
 if(knee==='pain')assert.equal(p.steps.length,0);else{assert.equal(p.steps.reduce((s,e)=>s+e.seconds,0),minutes*60);assert(p.steps.every(s=>s.seconds>0&&s.cue&&s.easy));}
}
assert.equal(plan(data,{day:6,minutes:25,energy:'good',knee:'ok',run:'no'}).steps.length,0);
assert(plan(data,{day:0,minutes:25,energy:'good',knee:'ok',run:'yes'}).title.includes('Après la course'));
assert.throws(()=>validate({...data,days:[]}));
const jours=data.days.map(d=>d.day);
let r=parseSettings('?jour=vendredi&duree=25&forme=bonne&genou=ok&course=non',jours);
assert.deepEqual(r.values,{day:4,minutes:25,energy:'good',knee:'ok',run:'no'});assert.equal(r.bad.length,0);
r=parseSettings('?jour=Vendredi&duree=20&forme=Fatigué&genou=gêne&course=OUI',jours);
assert.deepEqual(r.values,{day:4,minutes:20,energy:'tired',knee:'discomfort',run:'yes'});
r=parseSettings('?duree=45&forme=constructor&genou=douleur',jours);
assert.deepEqual(r.bad,['duree','forme']);assert.equal(r.values.knee,'pain');
assert.deepEqual(parseSettings('',jours),{values:{},bad:[]});
assert.deepEqual(parseSettings('?jour=lundiii',jours).bad,['jour']);
console.log('OK : programme, 324 adaptations, durées, repos, blocage douleur et réglages par l’adresse.');
