// Réglages de séance passés dans l'adresse : ?jour=vendredi&duree=25&forme=bonne&genou=ok&course=non
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const MAPS={
 duree:['minutes',{20:20,25:25,30:30}],
 forme:['energy',{bonne:'good',good:'good',moyenne:'medium',medium:'medium',fatigue:'tired',tired:'tired'}],
 genou:['knee',{ok:'ok',gene:'discomfort',discomfort:'discomfort',douleur:'pain',pain:'pain'}],
 course:['run',{oui:'yes',yes:'yes',non:'no',no:'no'}]
};
export function parseSettings(search,dayNames){
 const q=new URLSearchParams(search),values={},bad=[];
 if(q.has('jour')){const i=dayNames.findIndex(d=>norm(d)===norm(q.get('jour')));if(i<0)bad.push('jour');else values.day=i;}
 for(const [key,[field,map]] of Object.entries(MAPS))if(q.has(key)){const v=norm(q.get(key));if(Object.hasOwn(map,v))values[field]=map[v];else bad.push(key);}
 return {values,bad};
}
