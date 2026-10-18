export function validate(data){
 if(data.version!==1||!Array.isArray(data.days)||data.days.length!==7||!data.exercises)throw Error('Format de programme invalide.');
 for(const e of Object.values(data.exercises))if(!e.name||!e.cue||!e.easy)throw Error('Exercice incomplet.');
 for(const d of data.days){if(!d.title||!Array.isArray(d.exercises)||d.exercises.some(id=>!data.exercises[id]))throw Error('Séance invalide.');if(!d.rest&&!d.exercises.length)throw Error('Séance vide.');}
 if(data.circuit){const c=data.circuit;
  if(!Number.isInteger(c.rounds)||c.rounds<3||!Number.isInteger(c.prepareSeconds)||c.prepareSeconds<10||!Number.isInteger(c.restSeconds)||c.restSeconds<15||!Array.isArray(c.exercises)||!c.exercises.length||c.exercises.some(id=>!data.exercises[id]||!Number.isInteger(data.exercises[id].seconds)||data.exercises[id].seconds<=0))throw Error('Circuit invalide.');
 }
 return data;
}
export function plan(data,{day,minutes,energy,knee,run}){
 if(!Number.isInteger(day)||day<0||day>6||![20,25,30].includes(minutes))throw Error('Choix de séance invalide.');
 const chosen=data.days[day];if(chosen.rest)return{title:chosen.title,steps:[],notice:'Aujourd’hui : repos. Tu peux consulter les autres jours.'};
 if(knee==='pain')return{title:chosen.title,steps:[],notice:'Douleur signalée : séance suspendue. Ne force pas et demande conseil si elle persiste.'};
 const gentle=knee!=='ok'||energy==='tired';
 const ids=gentle?data.gentle:(run==='yes'&&chosen.strength?data.afterRun:chosen.exercises);
 const title=gentle?'Mobilité douce':run==='yes'&&chosen.strength?'Après la course : haut du corps et tronc':chosen.title;
 const steps=[];const add=(id,seconds,phase)=>steps.push({...data.exercises[id],id,seconds,phase});
 const circuit=!gentle&&run!=='yes'&&chosen.strength?data.circuit:null;
 if(circuit){
  const circuitSeconds=circuit.rounds*circuit.exercises.reduce((total,id)=>total+data.exercises[id].seconds+circuit.prepareSeconds+circuit.restSeconds,0);
  const available=minutes*60-420-circuitSeconds;
  if(available<0)return{title,steps:[],notice:'Le circuit complet de 3 passages nécessite au moins 25 minutes, échauffement et pauses inclus. Choisis 25 ou 30 minutes.'};
  add('warm',240,'Échauffement');
  // Répartir les autres exercices entre les trois passages, sans raccourcir le circuit.
  const extras=Math.floor(available/60),remainder=available%60;
  let extraIndex=0;
  for(let round=1;round<=circuit.rounds;round++){
   const count=Math.floor(extras*round/circuit.rounds)-Math.floor(extras*(round-1)/circuit.rounds);
   for(let n=0;n<count;n++){
    const id=ids[extraIndex++%ids.length],work=energy==='medium'?30:40;
    add(id,10,'Préparation');add(id,work,'Exercice');add('rest',50-work,'Récupération');
   }
   for(const id of circuit.exercises){
    const first=steps.length;
    add(id,circuit.prepareSeconds,'Préparation');add(id,data.exercises[id].seconds,'Exercice');add('rest',circuit.restSeconds,'Récupération');
    for(let i=first;i<steps.length;i++){steps[i].round=round;steps[i].rounds=circuit.rounds;}
   }
  }
  if(remainder)add('rest',remainder,'Récupération');
  add('cool',180,'Retour au calme');
  return{title,steps,circuitRounds:circuit.rounds,notice:'3 passages de gainage et chaise · 10 s pour te placer, puis 15 s de repos entre les exercices. Pauses supplémentaires possibles à tout moment.'};
 }
 add('warm',240,'Échauffement');
 // Un cycle de 60 s : 10 s de préparation, 30/40 s de mouvement, 20/10 s de repos.
 const work=gentle||energy==='medium'?30:40;
 for(let n=0;n<minutes-7;n++){const id=ids[n%ids.length];add(id,10,'Préparation');add(id,work,'Exercice');add('rest',50-work,'Récupération');}
 add('cool',180,'Retour au calme');
 return{title,steps,notice:gentle?'Séance allégée. Tout mouvement doit rester confortable.':'Garde des mouvements contrôlés et termine chaque série avant de perdre la bonne technique.'};
}

