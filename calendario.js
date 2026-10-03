/* Calendario semanal. Estado guardado en localStorage (por dispositivo).
   Las claves de progreso de OpenFing tienen la forma
   openfing:video-progreso-reproduccion:/media/<curso>/<curso>_<NN> (valor: segundos). */
const FIN=5; // "vista" = el progreso llegó al final de la clase, con FIN segundos de tolerancia (el progreso se guarda cada tanto, no en cada instante)
const KEY="openfing-semana-v2",DAYS=["L","M","M","J","V","S","D"];
let items=[];
try{items=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){items=[]}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){say("No se pudo guardar en este navegador.")}};
const $=id=>document.getElementById(id);
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const monday=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
let wk=monday(new Date());
const fmt=d=>d.toLocaleDateString("es-UY",{day:"numeric",month:"short"});
const say=t=>$("msg").textContent=t;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LBL={p:"Pendiente",e:"En progreso",v:"Vista"};
function cell(it){
 const at=it.status==="e"&&it.at?`<br><span class="nb">min ${esc(it.at)}</span>${it.pct!=null?` <span class="nb">(${it.pct} %)</span>`:""}`:"";
 const a=it.url?`<a href="${esc(it.url)}" target="_blank" rel="noopener">${it.status==="e"?"Seguir viendo":"Ver clase"}</a>`:"";
 return `<div class="cl ${it.status}"><b>${esc(it.title)}</b>${it.status==="v"?"":a}<button class="st" data-st="${it.id}" aria-label="Cambiar estado de ${esc(it.title)}">${LBL[it.status]}${at}</button><button class="st" data-del="${it.id}">Quitar</button></div>`;
}
function render(){
 const k=iso(wk),list=items.filter(i=>i.week===k);
 $("range").textContent=fmt(wk)+" – "+fmt(addDays(wk,6));
 const courses=[...new Set(list.map(i=>i.course))];
 $("courses").innerHTML=[...new Set(items.map(i=>i.course))].map(c=>`<option value="${esc(c)}">`).join("");
 let h="<thead><tr><th class='c'></th>"+DAYS.map((d,i)=>`<th scope="col" title="${fmt(addDays(wk,i))}">${d}</th>`).join("")+"</tr></thead><tbody>";
 if(!courses.length) h+=`<tr><td class="empty" colspan="8">Todavía no hay clases en esta semana. Tocá + para agregar la primera.</td></tr>`;
 courses.forEach(c=>{h+=`<tr><th scope="row" class="c">${esc(c)}</th>`;
  for(let d=0;d<7;d++)h+=`<td>${list.filter(i=>i.course===c&&i.day===d).map(cell).join("")}</td>`;
  h+="</tr>"});
 $("tb").innerHTML=h+"</tbody>";
}
document.addEventListener("click",e=>{const t=e.target;
 if(t.dataset.del){items=items.filter(i=>i.id!==t.dataset.del);save();render();return}
 if(t.dataset.st){const it=items.find(i=>i.id===t.dataset.st);
  if(it.status==="p"){const m=prompt("¿En qué minuto quedaste? (ej. 23:10). Dejalo vacío si no lo sabés.","");if(m===null)return;it.status="e";it.pct=null;it.at=m.trim()}
  else if(it.status==="e"){it.status="v";it.at=""}
  else it.status="p";
  save();render()}});
$("open").onclick=()=>{$("dlg").showModal();$("course").focus()};
$("cancel").onclick=()=>$("dlg").close();
$("f").addEventListener("submit",()=>{
 items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),week:iso(wk),day:+$("day").value,course:$("course").value.trim(),title:$("title").value.trim(),url:$("url").value.trim(),status:"p",at:""});
 save();$("title").value="";$("url").value="";render();say("Clase agregada.")});
$("prev").onclick=()=>{wk=addDays(wk,-7);render()};
$("next").onclick=()=>{wk=addDays(wk,7);render()};
$("today").onclick=()=>{wk=monday(new Date());render()};
$("carry").onclick=()=>{const k=iso(wk),n=iso(addDays(wk,7));const p=items.filter(i=>i.week===k&&i.status!=="v");
 p.forEach(i=>i.week=n);save();say(p.length?`${p.length} clase(s) pasadas a la semana siguiente.`:"No hay clases para pasar.");render()};
$("exp").onclick=async()=>{const j=JSON.stringify(items);try{await navigator.clipboard.writeText(j);say("Progreso copiado. Pegalo en otro dispositivo con Importar.")}catch(e){prompt("Copiá este texto:",j)}};
$("imp").onclick=()=>{const t=prompt("Pegá el progreso copiado:");if(!t)return;
 try{const d=JSON.parse(t);
 if(d&&typeof d==="object"&&!Array.isArray(d)){const clean=o=>Object.fromEntries(Object.entries(o).map(([a,b])=>[a.replace(/"/g,""),b])),P=clean(d.p||d),D=clean(d.d||{});let n=0;
  items.forEach(it=>{const m=(it.url||"").match(/courses\/([^\/]+)\/(\d+)/);if(!m)return;
   const k=m[1]+"/"+m[1]+"_"+m[2].padStart(2,"0"),s=P[k],dur=D[k];
   if(s>0&&it.status!=="v"){if(dur&&s>=dur-FIN){it.status="v";it.at="";it.pct=null;n++;return}it.status="e";it.pct=dur?Math.min(99,Math.floor(100*s/dur)):null;it.at=Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");n++}});
  save();render();say(n?n+" clase(s) actualizadas con tu progreso en OpenFing. Marcá como vistas las que terminaste.":!Object.keys(P).length?"Lo que pegaste no trae progreso de OpenFing. Repetí el comando en la Consola de open.fing.edu.uy.":"No encontré clases con links de OpenFing (ej. open.fing.edu.uy/courses/pye-2022/8/) en tu calendario.");return}
 if(!Array.isArray(d))throw 0;const ids=new Set(items.map(i=>i.id));d.forEach(i=>{if(i&&i.id&&!ids.has(i.id))items.push(i)});save();render();say("Progreso importado.")}catch(e){say("El texto no es un progreso válido.")}};
render();
