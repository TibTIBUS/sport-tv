import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {validate,plan} from '../planner.mjs';
const data=validate(JSON.parse(readFileSync(new URL('../data/program.json',import.meta.url),'utf8')));
for(const ids of [data.gentle,data.afterRun])assert(ids.length&&ids.every(id=>data.exercises[id]));
for(let day=0;day<6;day++)for(const minutes of [20,25,30])for(const energy of ['good','medium','tired'])for(const knee of ['ok','discomfort','pain'])for(const run of ['no','yes']){
 const p=plan(data,{day,minutes,energy,knee,run});
 if(knee==='pain')assert.equal(p.steps.length,0);else{assert.equal(p.steps.reduce((s,e)=>s+e.seconds,0),minutes*60);assert(p.steps.every(s=>s.seconds>0&&s.cue&&s.easy));}
}
assert.equal(plan(data,{day:6,minutes:25,energy:'good',knee:'ok',run:'no'}).steps.length,0);
assert(plan(data,{day:0,minutes:25,energy:'good',knee:'ok',run:'yes'}).title.includes('Après la course'));
assert.throws(()=>validate({...data,days:[]}));
console.log('OK : programme, 324 adaptations, durées, repos et blocage douleur.');
