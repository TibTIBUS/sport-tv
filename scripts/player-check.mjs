import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {validate,plan} from '../planner.mjs';
import {parseSettings} from '../settings.mjs';
import {initTheme} from '../theme.mjs';
import {DemoPlayer,validateDemos,videoUrl,demoVideos} from '../media.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const nodes=new Map();
class Element{
 constructor(){this.children=[];this.dataset={};this.style={setProperty(){}};this.attributes={};this.hidden=false;this.disabled=false;this.value='';this.listeners={};this.classList={toggle(){},add(){}};}
 replaceChildren(...nodes){this.children=nodes;} append(...nodes){this.children.push(...nodes);} before(){}
 setAttribute(k,v){this.attributes[k]=v;} removeAttribute(k){delete this.attributes[k];}
 addEventListener(k,fn){this.listeners[k]=fn;} click(){this.onclick?.();this.listeners.click?.();}
 querySelector(){return new Element();} showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();}
 get selectedOptions(){return [{textContent:this.value}];}
}
for(const [,id] of html.matchAll(/id="([^"]+)"/g))nodes.set(id,new Element());
const selectors=new Map();
const document={getElementById:id=>{assert(nodes.has(id),'Unknown element '+id);return nodes.get(id);},createElement:()=>new Element(),querySelector:s=>{if(!selectors.has(s))selectors.set(s,new Element());return selectors.get(s);},addEventListener(){},body:new Element(),documentElement:new Element(),activeElement:{tagName:'BODY'}};
document.documentElement.ownerDocument=document;
const program=JSON.parse(readFileSync(new URL('../data/program.json',import.meta.url),'utf8'));
const demos=JSON.parse(readFileSync(new URL('../data/demos.json',import.meta.url),'utf8'));
let interval,now=0;
class QuietPlayer{stop(){} playback(){} load(d){this.reference=d;}}
const context={initTV:()=>({enabled:false,focusView(){}}),document,validate,plan,parseSettings,initTheme,DemoPlayer:QuietPlayer,validateDemos,videoUrl,demoVideos,location:{search:'?jour=lundi&duree=25&forme=bonne&genou=ok&course=non'},localStorage:{getItem(){},setItem(){}},fetch:async url=>({ok:true,json:async()=>url.includes('program')?program:demos}),performance:{now:()=>now},setInterval:fn=>interval=fn,setTimeout(){},console,assert,URL,Blob,Date};
let source=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
source+=String.raw`
assert.equal($('start').disabled,false);
assert.match($('summary').textContent,/25 minutes.*3 passages/);
assert.equal($('preview').children.filter(e=>e.textContent.includes('× 3')).length,5);
$('start').click();assert.equal(steps[0].id,'warm');
$('skip').click();assert.equal(steps[index].id,'plank');
assert.match($('phase').textContent,/Passage 1 \/ 3/);
$('skip').click();assert.equal($('clock').textContent,'00:45');assert.match($('stage-help').textContent,/Tiens la position/);
$('pause').click();assert.equal(running,false);const before=remaining;
$('theme-toggle').click();assert.equal(document.documentElement.dataset.theme,'light');assert.equal(remaining,before);
$('pause').click();assert.equal(running,true);
$('skip').click();assert.equal(steps[index].id,'rest');assert.equal($('clock').textContent,'00:15');
$('skip').click();assert.equal(steps[index].id,'side_left');$('skip').click();assert.equal($('clock').textContent,'00:30');
$('watch').click();assert.equal(running,false);assert.equal(watching,true);
$('easy').click();assert.equal(steps[index].easier,true);assert.equal($('watch').disabled,true);
$('stop').click();assert.equal(active,false);assert.equal($('finish').hidden,false);
$('back').click();$('duration').value='20';$('duration').onchange();assert.equal($('start').disabled,true);assert.match($('notice').textContent,/25 minutes/);
$('duration').value='25';$('duration').onchange();$('knee').value='pain';$('knee').onchange();assert.equal($('start').disabled,true);
`;
await vm.runInNewContext('(async()=>{'+source+'})()',context);
// Exercise the real local illustration renderer without a video SDK.
const container=new Element(),status=new Element();
const oldDocument=globalThis.document;globalThis.document=document;
try{const player=new DemoPlayer(container,status);await player.load(demos.plank_dynamic,true);assert.equal(container.children[0].src,'assets/plank_dynamic.svg');player.playback(false);player.stop();assert.equal(container.children.length,0);}finally{globalThis.document=oldDocument;}
console.log('OK : lecteur simulé, 45/30 s, passages, pause/reprise, saut, thèmes, variante, arrêt, durée courte, douleur et schéma local.');
