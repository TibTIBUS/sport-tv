import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {validate,plan,sessions} from '../planner.mjs';
import {parseSettings} from '../settings.mjs';
const data=validate(JSON.parse(readFileSync(new URL('../data/program.json',import.meta.url),'utf8')));
for(const ids of [data.gentle,data.afterRun])assert(ids.length&&ids.every(id=>data.exercises[id]));
for(let day=0;day<6;day++)for(const minutes of [20,25,30])for(const energy of ['good','medium','tired'])for(const knee of ['ok','discomfort','pain'])for(const run of ['no','yes']){
 const p=plan(data,{day,minutes,energy,knee,run});
 if(knee==='pain'||(data.days[day].strength&&minutes===20&&energy!=='tired'&&knee==='ok'&&run==='no')){assert.equal(p.steps.length,0);if(knee!=='pain')assert.match(p.notice,/25 minutes/);}else{assert.equal(p.steps.reduce((s,e)=>s+e.seconds,0),minutes*60);assert(p.steps.every(s=>s.seconds>0&&s.cue&&s.easy));}
}
assert(plan(data,{day:6,minutes:25,energy:'good',knee:'ok',run:'no'}).steps.length>0,'Sunday bookmark must allow a session');
assert(plan(data,{day:0,minutes:25,energy:'good',knee:'ok',run:'yes'}).title.includes('Après la course'));
assert.throws(()=>validate({...data,days:[]}));
const {validateDemos}=await import('../media.mjs');
const demos=validateDemos(JSON.parse(readFileSync(new URL('../data/demos.json',import.meta.url),'utf8')),data.exercises);
assert.deepEqual(Object.keys(demos).sort(),Object.keys(data.exercises).filter(id=>id!=='rest').sort());
assert.throws(()=>validateDemos({squat:{...demos.squat,videoId:'invalid'}},data.exercises));
assert.throws(()=>validateDemos({march:{...demos.march,provider:'unknown'}},data.exercises));
assert.throws(()=>validateDemos({warm:{...demos.warm,more:[{...demos.curl,videoId:'bad'}]}},data.exercises));
const jours=data.days.map(d=>d.day);
let r=parseSettings('?jour=vendredi&duree=25&forme=bonne&genou=ok&course=non',jours);
assert.deepEqual(r.values,{day:4,minutes:25,energy:'good',knee:'ok',run:'no'});assert.equal(r.bad.length,0);
r=parseSettings('?jour=Vendredi&duree=20&forme=Fatigué&genou=gêne&course=OUI',jours);
assert.deepEqual(r.values,{day:4,minutes:20,energy:'tired',knee:'discomfort',run:'yes'});
r=parseSettings('?duree=45&forme=constructor&genou=douleur',jours);
assert.deepEqual(r.bad,['duree','forme']);assert.equal(r.values.knee,'pain');
assert.deepEqual(parseSettings('',jours),{values:{},bad:[]});
assert.deepEqual(parseSettings('?jour=lundiii',jours).bad,['jour']);
for(const session of sessions.map(s=>s.id))for(const difficulty of ['easy','normal','hard'])for(const minutes of [20,25,30])for(const energy of ['good','medium','tired'])for(const knee of ['ok','discomfort','pain'])for(const run of ['no','yes']){
 const p=plan(data,{session,difficulty,minutes,energy,knee,run});
 if(p.steps.length)assert.equal(p.steps.reduce((n,s)=>n+s.seconds,0),minutes*60);
 else assert(knee==='pain'||(minutes===20&&session.startsWith('renforcement')&&energy!=='tired'&&knee==='ok'&&run==='no'));
}
for(const [difficulty,seconds] of [['easy',30],['normal',35],['hard',40]]){
 const p=plan(data,{session:'cardio',difficulty,minutes:20,energy:'good',knee:'ok',run:'no'});
 assert(p.steps.filter(s=>s.phase==='Exercice').every(s=>s.seconds===seconds));
 assert.equal(p.steps.filter(s=>s.phase==='Exercice').every(s=>s.easier===true),difficulty==='easy');
 const circuit=plan(data,{session:'renforcement-a',difficulty,minutes:25,energy:'good',knee:'ok',run:'no'});
 for(const id of data.circuit.exercises){const efforts=circuit.steps.filter(s=>s.id===id&&s.phase==='Exercice');assert.equal(efforts.length,3);assert(efforts.every(s=>s.seconds===data.exercises[id].seconds));}
}
assert.deepEqual(parseSettings('?seance=cardio-tronc&difficulte=soutenue',jours).values,{session:'cardio-tronc',difficulty:'hard'});
assert.deepEqual(parseSettings('?seance=inconnue&difficulte=extreme',jours).bad,['seance','difficulte']);
assert.throws(()=>plan(data,{session:'inconnue',minutes:25}));
assert.throws(()=>plan(data,{session:'cardio',difficulty:'extreme',minutes:25}));
console.log('OK : 810 réglages libres, dimanche autorisé, difficultés 30/35/40 s, durées fixes du circuit, adaptations et anciennes adresses.');


// Exact prescribed durations, three rounds, preparation and recovery for each gesture.
for(const day of [0,2,4])for(const minutes of [25,30])for(const energy of ['good','medium']){
 const p=plan(data,{day,minutes,energy,knee:'ok',run:'no'});
 for(const id of data.circuit.exercises){
  const efforts=p.steps.filter(s=>s.id===id&&s.phase==='Exercice');
  assert.equal(efforts.length,3);assert.deepEqual(efforts.map(s=>s.round),[1,2,3]);
  for(const e of efforts){assert.equal(e.seconds,data.exercises[id].seconds);const n=p.steps.indexOf(e);assert.equal(p.steps[n-1].seconds,10);assert.equal(p.steps[n+1].seconds,15);}
 }
 assert.equal(p.steps.filter(s=>s.round&&s.phase==='Exercice').reduce((n,s)=>n+s.seconds,0),585);
}
for(let day=0;day<7;day++)for(const options of [{energy:'tired',knee:'ok',run:'no'},{energy:'good',knee:'discomfort',run:'no'},{energy:'good',knee:'ok',run:'yes'}]){
 const p=plan(data,{day,minutes:25,...options});assert(!p.steps.some(s=>data.circuit.exercises.includes(s.id)));
}
for(const id of ['side_left','side_right','plank_dynamic'])assert(readFileSync(new URL('../'+demos[id].asset,import.meta.url),'utf8').includes('<svg'));
assert.throws(()=>validateDemos({plank_dynamic:{...demos.plank_dynamic,asset:'https://example.com/a.svg'}},data.exercises));
assert.throws(()=>validate({...data,circuit:{...data.circuit,rounds:0}}));
console.log('OK : 3 passages, 585 s de gainage/chaise, préparations/repos, schémas et adaptations conservées.');
