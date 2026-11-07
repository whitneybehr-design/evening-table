const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=new Map(),handlers={};let persistedState;
function element(key){if(!elements.has(key))elements.set(key,{value:'',innerHTML:'',textContent:'',hidden:true,setAttribute(){},scrollIntoView(){}});return elements.get(key);}
const root={querySelector:element,querySelectorAll:()=>[],addEventListener:(k,f)=>handlers[k]=f};
const c={document:{getElementById:()=>root},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(k,v){persistedState=v;}},Date,console,FormData,Intl,setTimeout,TextEncoder,TextDecoder,Blob,CompressionStream,DecompressionStream,btoa,atob};vm.createContext(c);
let code=fs.readFileSync('build/meal-bundle.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.testAPI={get state(){return state},defaults,dates,slot,recipes,recipe,scaled,shopping,shoppingText,shoppingSnapshot,encodeShopping,decodeShopping,ensurePlan,candidates,populatePlan,isHidden,showDetails,complexity,fitsComplexity,render,ingredients,WEEKLY,RECIPES};})();');
vm.runInContext(code,c);const a=c.testAPI,s=a.state;
assert(a.recipes().length>=32);assert.equal(s.dinner+s.lunch,6);
assert.equal(a.WEEKLY.featuredIds.length,6);assert.equal(new Set(a.WEEKLY.featuredIds).size,6);
for(const id of a.WEEKLY.featuredIds)assert(a.recipe(id),'Missing featured recipe '+id);
assert.equal(new Set(a.RECIPES.map(r=>r.id)).size,a.RECIPES.length,'Duplicate recipe IDs');
assert.equal(a.dates().length,4);assert.equal(new Set(a.dates().map(d=>a.slot(d).recipe)).size,4);
for(const r of a.recipes()){assert(['simple','confident','ambitious'].includes(a.complexity(r)));assert(r.active<=r.total);assert(r.method&&r.method.length>70,'Missing concise cooking method: '+r.id);for(const [id,q] of Object.entries(r.ingredients)){assert(a.ingredients()[id],id);assert(q>0);}assert(!/asparagus|spargel|beef/i.test(r.name+Object.keys(r.ingredients).map(k=>a.ingredients()[k][0]).join(' ')));}
assert(a.recipes().filter(r=>r.protein==='pork').length>=4);
const pizza=a.recipe('pizza');assert(pizza.ingredients.flour&&pizza.ingredients.yeast&&pizza.ingredients.water&&pizza.ingredients.dough);assert(pizza.ingredients.pork&&pizza.ingredients.pesto&&pizza.ingredients.ham&&pizza.ingredients.pepperoni&&pizza.ingredients.pepper&&pizza.ingredients.mushroom);assert.match(pizza.method,/son/);
assert(!a.recipe('harira').prep);assert(!a.recipe('harira').ingredients.drychickpea);assert(a.recipe('harira').ingredients.chickpea);
s.start='2026-10-25';s.days=3;s.lighter=false;s.dinner=3;s.lunch=3;
const ds=a.dates();a.slot(ds[0]).recipe='burritos';a.slot(ds[1]).recipe='linguine';a.slot(ds[2]).recipe='couscous';
const ground=a.scaled(a.recipe('burritos')).find(i=>i.id==='ground');assert.equal(ground.qty,900);
const peppers=a.shopping().find(i=>i.id==='pepper');assert.equal(peppers.qty,1350);assert.equal(peppers.meals.length,2);
const oil=a.shopping().find(i=>i.id==='oil');assert.equal(oil.qty,130);assert.equal(oil.meals.length,3);
assert.equal(a.shopping().filter(i=>i.id==='oil').length,1);
assert.match(a.shoppingText(),/3 dinner \+ 3 lunch/);
s.checked.push(oil.key);assert(!a.shoppingText().includes('Olive oil'));s.checked=[];
s.days=4;assert.equal(a.dates().length,4);a.ensurePlan();assert(a.shopping().length>0);
s.days=3;s.lunch=0;assert.equal(a.scaled(a.recipe('burritos')).find(i=>i.id==='ground').qty,450);
s.lunch=3;s.lighter=true;assert.equal(a.scaled(a.recipe('burritos')).find(i=>i.id==='pepper').qty,937.5);
const slotDate=ds[1];a.slot(slotDate).time=15;a.ensurePlan();assert(a.recipe(a.slot(slotDate).recipe).total<=15);
const may='2027-05-03';a.slot(may).time=45;assert(a.candidates(may).some(r=>r.id==='peafrittata'));
const jan='2027-01-04';a.slot(jan).time=45;assert(!a.candidates(jan).some(r=>r.id==='peafrittata'));
s.saved.push('peafrittata');assert(a.candidates(jan).some(r=>r.id==='peafrittata'));
s.view='shop';a.render();assert.match(element('[data-content]').innerHTML,/One shop for 3 dinners/);
s.view='library';a.render();assert(element('[data-content]').innerHTML.includes('Recipe collection · '+a.recipes().length));
s.library='weekly';a.render();assert.equal((element('[data-content]').innerHTML.match(/class="recipe-card"/g)||[]).length,6);
const retired={...a.recipe('cabbage'),id:'test-retired',weekly:true,months:[0,1,2,3,4,5,6,7,8,9,10,11]};a.RECIPES.push(retired);
assert(!a.candidates(jan).some(r=>r.id===retired.id),'Retired discovery should leave automatic rotation');
s.saved.push(retired.id);assert(a.candidates(jan).some(r=>r.id===retired.id),'Saved weekly discoveries must remain available');
s.start='2027-01-04';s.days=3;a.slot(jan).recipe=retired.id;a.ensurePlan();assert.equal(a.slot(jan).recipe,retired.id,'Refreshing a collection must not replace an existing dinner');
s.view='plan';a.render();assert(!element('[data-content]').innerHTML.includes('day-expanded'));
handlers.click({target:{closest:()=>({dataset:{expand:jan},hasAttribute:()=>false})}});
assert(element('[data-content]').innerHTML.includes('day-expanded'));
s.start='2027-01-04';s.days=7;s.slots={};a.ensurePlan();const fullWeek=a.dates().map(d=>a.recipe(a.slot(d).recipe));assert.equal(fullWeek.filter(r=>r.protein==='vegetarian').length,1);assert.equal(fullWeek.filter(r=>r.protein!=='vegetarian').length,6);
console.log('PASS: all recipes have methods; pork options; two-version pizza; 6 meat/fish meals per full week; portion and bulk calculations; exclusions; weekly rotation; saved plans; compact controls.');


assert(a.recipes().length>=60,'Expanded recipe variety');
s.start='2026-10-27';s.days=4;s.slots={};s.weekdaySettings={};
const mixedDates=a.dates();
a.slot(mixedDates[0]).time=15;a.slot(mixedDates[0]).complexity='simple';
a.slot(mixedDates[1]).time=35;a.slot(mixedDates[1]).complexity='confident';
a.slot(mixedDates[2]).time=120;a.slot(mixedDates[2]).complexity='ambitious';
a.slot(mixedDates[3]).time=30;a.slot(mixedDates[3]).complexity='simple';
a.populatePlan();
for(const d of mixedDates){const sl=a.slot(d),r=a.recipe(sl.recipe);assert(r,'Each day has a matching meal');assert(r.total<=sl.time);assert.equal(r.complexity,sl.complexity);assert(a.candidates(d).every(x=>x.total<=sl.time&&x.complexity===sl.complexity));}
assert(a.candidates(mixedDates[2]).some(r=>r.id==='pizza'),'Projects remain available only on a suitable day');
assert.equal(new Set(mixedDates.map(d=>a.slot(d).recipe)).size,4);
const untouched=mixedDates.slice(1).map(d=>a.slot(d).recipe);
handlers.change({target:{dataset:{slotComplexity:mixedDates[0]},value:'confident'}});
assert.equal(a.slot(mixedDates[0]).complexity,'confident');assert.deepEqual(mixedDates.slice(1).map(d=>a.slot(d).recipe),untouched,'One day must not change other dinners');
assert.equal(a.slot(mixedDates[3]).complexity,'simple','Different day keeps its own complexity');
const firstPlan=mixedDates.map(d=>a.slot(d).recipe);a.populatePlan();assert(firstPlan.filter(Boolean).every(id=>s.recentPlans.includes(id)));assert(mixedDates.some((d,i)=>a.slot(d).recipe!==firstPlan[i]),'New mix must provide fresh variety');
a.render();assert.equal((element('[data-day-settings]').innerHTML.match(/data-slot-complexity=/g)||[]).length,4);
assert.equal((element('[data-day-settings]').innerHTML.match(/data-slot-time=/g)||[]).length,4);
s.custom.push({...a.recipe('greek'),id:'future-recipe',complexity:undefined});assert.equal(a.complexity(a.recipe('future-recipe')),'confident');
a.slot(mixedDates[0]).time=1;a.ensurePlan();assert.equal(a.slot(mixedDates[0]).recipe,null);a.render();assert.match(element('[data-content]').innerHTML,/No meal fits/);
s.view='library';s.library='all';a.render();assert.match(element('[data-content]').innerHTML,/pizza/i);
console.log('PASS: 60 recipes; independent daily time and complexity; matching swaps; fresh mixes; empty states; full collection.');

// Hidden recipes must be excluded everywhere suggestions can come from, even saved favourites.
s.start='2026-11-04';s.days=4;s.slots={};s.view='plan';s.lighter=false;a.ensurePlan();
const hiddenDate=a.dates()[0],hiddenId=a.slot(hiddenDate).recipe;
const previousOtherMeals=a.dates().slice(1).map(d=>a.slot(d).recipe);
if(!s.saved.includes(hiddenId))s.saved.push(hiddenId);
s.checked=['oil|ml'];s.dinner=3;s.lunch=3;
handlers.click({target:{closest:()=>({dataset:{toggleHidden:hiddenId},hasAttribute:()=>false})}});
assert(a.isHidden(hiddenId));assert(a.recipe(hiddenId),'Keep recipe data for restoring');assert(s.saved.includes(hiddenId),'Preserve favourite status for undo');
assert(!a.dates().some(d=>a.slot(d).recipe===hiddenId),'Replace a disliked planned dinner');
assert.deepEqual(a.dates().slice(1).map(d=>a.slot(d).recipe),previousOtherMeals,'Keep other planned dinners');
assert.deepEqual(s.checked,['oil|ml']);assert.equal(s.dinner+s.lunch,6);
for(const d of a.dates())assert(!a.candidates(d,'surprise').some(r=>r.id===hiddenId));
s.view='library';s.library='weekly';a.render();assert(!element('[data-content]').innerHTML.includes('data-detail="'+hiddenId+'"'));
s.library='all';a.render();assert(!element('[data-content]').innerHTML.includes('data-detail="'+hiddenId+'"'));
s.library='favourites';a.render();assert(!element('[data-content]').innerHTML.includes('data-detail="'+hiddenId+'"'));
s.library='hidden';a.render();assert.match(element('[data-content]').innerHTML,/Restore to rotation/);assert(element('[data-content]').innerHTML.includes('data-detail="'+hiddenId+'"'));
a.showDetails(hiddenId);assert.match(element('[data-details]').innerHTML,/Restore to rotation/);
s.view='plan';a.render();handlers.click({target:{closest:()=>({dataset:{expand:hiddenDate},hasAttribute:()=>false})}});
assert(!element('[data-content]').innerHTML.includes('<option value="'+hiddenId+'"'));
const snapshot=persistedState;assert(JSON.parse(snapshot).hiddenRecipes.includes(hiddenId),'Persist exclusions');
const reloadContext={...c,localStorage:{getItem:k=>k==='evening-table-v4'?snapshot:null,setItem(){}}};vm.createContext(reloadContext);vm.runInContext(code,reloadContext);assert(reloadContext.testAPI.isHidden(hiddenId),'Exclusion survives reload');
handlers.click({target:{closest:()=>({dataset:{toggleHidden:hiddenId},hasAttribute:()=>false})}});
assert(!reloadContext.testAPI.isHidden(hiddenId),'Restore works after reload');
assert(reloadContext.testAPI.candidates(hiddenDate).some(r=>r.id===hiddenId),'Restored recipe can rotate again');
console.log('PASS: hidden favourites and discoveries excluded from suggestions and manual choices; planned replacement; other dinners and shopping checks preserved; restore and reload.');

// Find meals must leave impossible settings empty, even when a simpler recipe fits.
const live=reloadContext.testAPI;
Object.assign(live.state,{start:'2026-11-07',days:3,slots:{},weekdaySettings:{}});
const [short,flexible]=live.dates();
Object.assign(live.slot(short),{time:15,complexity:'ambitious'});
Object.assign(live.slot(flexible),{time:15,complexity:'any'});
handlers.click({target:{closest:()=>({dataset:{action:'populate'},hasAttribute:()=>false})}});
assert.equal(live.slot(short).recipe,null);
assert(live.recipe(live.slot(flexible).recipe).total<=15);
assert.match(element('[data-message]').textContent,/no exact match/);
console.log('PASS: Find meals enforces exact complexity and leaves unmatched days empty.');

// Repeated clicks must use the controls as shown, even if no change event was received.
const third=live.dates()[2];
const settings=[[short,15,'ambitious'],[flexible,45,'confident'],[third,25,'simple']];
root.querySelectorAll=selector=>selector==='[data-slot-time],[data-slot-complexity]'?settings.flatMap(([date,time,level])=>[
 {dataset:{slotTime:date},value:String(time)}, {dataset:{slotComplexity:date},value:level}
]):[];
for(let i=0;i<25;i++){
 handlers.click({target:{closest:()=>({dataset:{action:'populate'},hasAttribute:()=>false})}});
 assert.equal(live.slot(short).recipe,null);
 for(const [date,time,level] of settings.slice(1)){
  const r=live.recipe(live.slot(date).recipe);
  assert(r && r.total<=time && r.complexity===level, 'Repeated Find meals must obey the controls');
 }
}
console.log('PASS: 25 consecutive Find meals clicks use the visible settings.');

// An explicit pick can exceed the time limit; regeneration still obeys it.
handlers.click({target:{closest:()=>({dataset:{expand:third},hasAttribute:()=>false})}});
assert.match(element('[data-content]').innerHTML,/All other recipes/);
assert.match(element('[data-content]').innerHTML,/<option value="pizza"/);
handlers.change({target:{dataset:{slotRecipe:third},value:'pizza'}});
assert.equal(live.slot(third).recipe,'pizza');
assert.match(element('[data-content]').innerHTML,/Outside settings/);
handlers.click({target:{closest:()=>({dataset:{action:'populate'},hasAttribute:()=>false})}});
assert.notEqual(live.slot(third).recipe,'pizza');
assert(live.recipe(live.slot(third).recipe).total<=25);
console.log('PASS: manual choices can override daily settings without changing automatic matching.');

(async()=>{
 const current=JSON.stringify(live.state);
 const snapshot=live.shoppingSnapshot();
 const payload=await live.encodeShopping(snapshot);
 assert(payload.startsWith('z')&&payload.length<5000);
 assert.equal(JSON.stringify(await live.decodeShopping(payload)),JSON.stringify(snapshot));
 assert.equal(JSON.stringify(live.state),current,'Sharing must not modify the plan');
 await assert.rejects(live.decodeShopping('pbad'));
 console.log('PASS: compressed shopping links preserve meals, quantities and checks without modifying the plan.');
})().catch(e=>{console.error(e);process.exitCode=1;});
