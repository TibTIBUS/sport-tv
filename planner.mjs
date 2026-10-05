export function validate(data){
 if(data.version!==1||!Array.isArray(data.days)||data.days.length!==7||!data.exercises)throw Error('Format de programme invalide.');
 for(const e of Object.values(data.exercises))if(!e.name||!e.cue||!e.easy)throw Error('Exercice incomplet.');
 for(const d of data.days){if(!d.title||!Array.isArray(d.exercises)||d.exercises.some(id=>!data.exercises[id]))throw Error('Séance invalide.');if(!d.rest&&!d.exercises.length)throw Error('Séance vide.');}
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
 add('warm',240,'Échauffement');
 // Un cycle de 60 s : 10 s de préparation, 30/40 s de mouvement, 20/10 s de repos.
 const work=gentle||energy==='medium'?30:40;
 for(let n=0;n<minutes-7;n++){const id=ids[n%ids.length];add(id,10,'Préparation');add(id,work,'Exercice');add('rest',50-work,'Récupération');}
 add('cool',180,'Retour au calme');
 return{title,steps,notice:gentle?'Séance allégée. Tout mouvement doit rester confortable.':'Garde des mouvements contrôlés et termine chaque série avant de perdre la bonne technique.'};
}
