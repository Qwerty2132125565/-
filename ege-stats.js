(()=>{
'use strict';
const KEY='ege_stats_v1',$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const SUBJ={russian:'Русский язык',history:'История',social:'Обществознание'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const fmt=s=>{s=Math.max(0,Math.round(s));const h=s/3600|0,m=(s%3600)/60|0,x=s%60;return h?`${h}:${pad(m)}:${pad(x)}`:`${m}:${pad(x)}`};
const date=ts=>new Date(ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
const TESTS=()=>window.EGE_TESTS||[];
let _map=null;const T=id=>{if(!_map||_map.size!==TESTS().length)_map=new Map(TESTS().map(t=>[t.id,t]));return _map.get(id)};
if(!document.getElementById('app'))return;
let mem={name:'',runs:[]};
try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&Array.isArray(d.runs))mem=d}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){}};
const rank=rs=>rs.slice().sort((a,b)=>b.pct-a.pct||a.time-b.time||a.ts-b.ts);
const better=(a,b)=>a.pct>b.pct||(a.pct===b.pct&&a.time<b.time);
function stat(id){const rs=mem.runs.filter(r=>r.id===id);if(!rs.length)return null;const top=rank(rs)[0];return{n:rs.length,best:top.pct,time:top.time}}
/* стили */
const st=document.createElement('style');st.textContent=`
.st-badge{align-self:flex-start;margin:0 0 14px;padding:4px 11px;border-radius:99px;font-size:13px;font-weight:700;color:#7ce1b2;background:#7ce1b214;border:1px solid #7ce1b255;animation:stPop .5s cubic-bezier(.3,1.5,.5,1)}
.test-card.st-done{border-color:#7ce1b244}
.st-topic{float:right;font-size:13px;font-weight:600;color:#7ce1b2;margin-top:6px}
.st-note{margin:10px 0 0;padding:10px 14px;border-radius:12px;background:#7ce1b210;border:1px solid #7ce1b240;color:#bfeedd;font-size:15px}
.st-prog{height:6px;border-radius:9px;background:#ffffff14;margin:-14px 0 18px;position:relative}
.st-prog i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#8e77e8,#7ce1b2);transition:width 1s cubic-bezier(.2,.8,.2,1)}
.st-prog em{position:absolute;right:0;top:10px;font-style:normal;font-size:11px;color:var(--muted)}
.st-board{margin:22px 0;padding:18px;border:1px solid #b7a2ff40;border-radius:18px;background:#b7a2ff0b;text-align:left;animation:stUp .6s .4s cubic-bezier(.2,.8,.2,1) backwards}
.st-board h3{margin:0 0 6px;font-size:20px}
.st-badges{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.st-badges b{padding:5px 12px;border-radius:99px;background:linear-gradient(90deg,#8e77e8,#e0785f);color:#fff;font-size:14px;animation:stPop .6s .9s cubic-bezier(.3,1.5,.5,1) backwards}
.st-table{width:100%;border-collapse:collapse;font-size:15px;table-layout:auto;border:0;border-radius:0}
.st-table th,.st-table td{padding:9px 6px;border-top:1px solid #ffffff14;background:none;font-size:15px;text-align:left}
.st-table th{font-size:12px;border-top:0}
.st-table td:last-child,.st-table th:last-child{text-align:right}
.st-table tr{animation:stUp .45s backwards}
.st-table tr.me td{background:#b7a2ff22;font-weight:700}
.st-name{width:100%;margin:8px 0 4px;min-height:44px;padding:9px 13px;font-size:16px;border-radius:12px;background:#101625;border:1px solid #48516b;color:var(--text)}
#stFab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:55;width:54px;height:54px;border-radius:50%;padding:0;font-size:24px;background:linear-gradient(135deg,#8e77e8,#5b8ee6);border:0;box-shadow:0 10px 28px #0008;transition:transform .2s}
#stFab:hover:not(:disabled){transform:scale(1.1) rotate(-6deg);background:linear-gradient(135deg,#8e77e8,#5b8ee6)}
#stTimer{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:55;padding:8px 14px;border-radius:99px;background:#171c2bee;border:1px solid var(--line);font-weight:700;font-variant-numeric:tabular-nums;animation:stPop .4s}
#stOv{position:fixed;inset:0;z-index:90;background:#05070dd9;backdrop-filter:blur(8px);overflow:auto;padding:max(16px,env(safe-area-inset-top)) 14px 30px;animation:stFade .25s}
#stOv .panel{max-width:760px;margin:0 auto;background:linear-gradient(145deg,#1b2132,#151a27);border:1px solid var(--line);border-radius:24px;padding:22px;animation:stUp .45s cubic-bezier(.2,.8,.2,1)}
#stOv h2{margin:0 0 4px;font-size:26px}#stOv h3{margin:26px 0 10px;font-size:18px}
.st-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.st-tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:16px 0}
@media(min-width:600px){.st-tiles{grid-template-columns:repeat(4,1fr)}}
.st-tile{background:#161b28;border:1px solid #2a3142;border-radius:14px;padding:12px 8px;text-align:center;font-size:12px;color:var(--muted);animation:stUp .5s backwards}
.st-tile b{display:block;font-size:24px;color:var(--text)}
.st-row{margin:12px 0;animation:stUp .5s backwards}
.st-row .l{display:flex;justify-content:space-between;gap:10px;font-size:15px;margin-bottom:5px}
.st-row .l small{color:var(--muted);white-space:nowrap}
.st-bar{height:9px;border-radius:9px;background:#ffffff14;overflow:hidden}
.st-bar i{display:block;height:100%;width:0;border-radius:9px;transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.st-empty{color:var(--muted);padding:14px 0}
@keyframes stPop{from{transform:scale(.5);opacity:0}}
@keyframes stUp{from{opacity:0;transform:translateY(16px)}}
@keyframes stFade{from{opacity:0}}`;
document.head.appendChild(st);
/* отслеживание прохождения */
let lastId=null,run=null,lastEntry=null;const seen=new WeakSet();
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-test]');if(c)lastId=c.dataset.test},true);
function idByTitle(title){if(lastId&&T(lastId)&&T(lastId).title===title)return lastId;const f=TESTS().find(x=>x.title===title);return f?f.id:lastId}
function finishRun(res){
  if(seen.has(res))return;seen.add(res);
  const g=+(($('.stat.good b',res)||{}).textContent||0),b=+(($('.stat.bad b',res)||{}).textContent||0),total=g+b;
  if(!total)return;
  const id=idByTitle(($('.type',res)||{}).textContent||'');if(!id)return;
  const e={id,good:g,total,pct:Math.round(g/total*100),time:Math.round((Date.now()-run.t0)/1000),ts:Date.now(),name:mem.name||'Я'};
  mem.runs.push(e);if(mem.runs.length>600)mem.runs.splice(0,mem.runs.length-600);save();lastEntry=e;renderBoard(res,e);
}
function rowsHTML(entry){
  const rk=rank(mem.runs.filter(r=>r.id===entry.id)),pos=rk.indexOf(entry),med=['🥇','🥈','🥉'];
  let list=rk.slice(0,5).map((r,i)=>[r,i]);if(pos>4)list.push([entry,pos]);
  return list.map(([r,i],k)=>`<tr class="${r===entry?'me':''}" style="animation-delay:${.7+k*.08}s"><td>${med[i]||i+1}</td><td>${esc(r.name||'Я')} <small class="muted">${date(r.ts)}</small></td><td>${r.good}/${r.total} · ${r.pct}%</td><td>${fmt(r.time)}</td></tr>`).join('');
}
function renderBoard(res,e){
  $$('.st-board',res).forEach(x=>x.remove());
  const rs=mem.runs.filter(r=>r.id===e.id),prev=rank(rs.filter(r=>r!==e))[0],pos=rank(rs).indexOf(e)+1;
  const prevT=rs.filter(r=>r!==e&&r.pct>=70).map(r=>r.time),fast=e.pct>=70&&(!prevT.length||e.time<Math.min(...prevT));
  const badges=[];if(!prev)badges.push('🏆 Первый результат в таблице');else if(better(e,prev))badges.push('🏆 Новый рекорд!');
  if(fast&&prev)badges.push('⚡ Рекорд времени');
  const box=document.createElement('section');box.className='st-board';
  box.innerHTML=`<h3>Рекорды на этом устройстве</h3><div class="muted" style="font-size:14px">Сначала по результату, при равенстве — по времени. Твоё время: <b style="color:var(--text)">${fmt(e.time)}</b>${rs.length>1?` · место ${pos} из ${rs.length}`:''}</div>${badges.length?`<div class="st-badges">${badges.map(x=>`<b>${x}</b>`).join('')}</div>`:''}<input class="st-name" id="stName" maxlength="16" placeholder="Твоё имя в таблице" value="${esc(e.name==='Я'&&!mem.name?'':e.name)}" aria-label="Имя в таблице"><table class="st-table"><thead><tr><th>#</th><th>Игрок</th><th>Результат</th><th>Время</th></tr></thead><tbody>${rowsHTML(e)}</tbody></table>`;
  const anchor=$('.stats',res)||$('.result',res);anchor.after(box);
  $('#stName',box).oninput=ev=>{const v=ev.target.value.trim().slice(0,16);mem.name=v;e.name=v||'Я';save();$('tbody',box).innerHTML=rowsHTML(e)};
}
/* оформление карточек */
function decorate(){
  $$('.test-card[data-test]').forEach(c=>{
    const s=stat(c.dataset.test);let b=$('.st-badge',c);
    if(!s){if(b)b.remove();c.classList.remove('st-done');return}
    const txt=`✓ Пройден · ${s.best}% · ${fmt(s.time)}`+(s.n>1?` · ${s.n}×`:'');
    if(!b){b=document.createElement('div');b.className='st-badge';c.insertBefore(b,$('.test-card-bottom',c))}
    if(b.textContent!==txt)b.textContent=txt;c.classList.add('st-done');
  });
  $$('.topic-group').forEach(g=>{const h=$('.topic-heading',g);if(!h)return;const all=$$('.test-card',g).length,done=$$('.test-card.st-done',g).length;let c=$('.st-topic',h);
    if(!done){if(c)c.remove();return}if(!c){c=document.createElement('span');c.className='st-topic';h.appendChild(c)}const t=`✓ ${done} из ${all}`;if(c.textContent!==t)c.textContent=t});
  $$('.subject-card[data-subject]').forEach(c=>{const sub=c.dataset.subject,ts=TESTS().filter(t=>t.subject===sub),done=ts.filter(t=>stat(t.id)).length;if(!done){const p=$('.st-prog',c);if(p)p.remove();return;}
    let p=$('.st-prog',c);if(!p){p=document.createElement('div');p.className='st-prog';p.innerHTML='<i></i><em></em>';c.insertBefore(p,$('.subject-bottom',c))}
    const w=Math.max(4,done/ts.length*100)+'%',t=`пройдено ${done} из ${ts.length}`;if(p.firstChild.style.width!==w)p.firstChild.style.width=w;if(p.lastChild.textContent!==t)p.lastChild.textContent=t});
  const ih=$('.test-intro h1'),hero=$('.test-intro .hero');
  if(ih&&hero&&!$('.st-note',hero)){const id=idByTitle(ih.textContent),s=id&&stat(id);
    if(s){const n=document.createElement('p');n.className='st-note';n.textContent=`✓ Ты уже проходил этот тест: ${s.n} ${s.n===1?'раз':s.n<5?'раза':'раз'}. Лучший результат — ${s.best}%, время — ${fmt(s.time)}. Побьёшь рекорд?`;($('.pill',hero)||hero.firstChild).after(n)}}
}
/* таймер и сканирование */
const tm=document.createElement('div');tm.id='stTimer';tm.hidden=true;tm.setAttribute('aria-live','off');document.body.appendChild(tm);
function scan(){
  const q=$('.quiz-screen'),res=$('.result-screen');
  if(q){if(!run)run={t0:Date.now()}}
  else if(res){if(run){finishRun(res);run=null}else if(lastEntry&&!$('.st-board',res)&&seen.has(res)===false&&mem.runs.includes(lastEntry))renderBoard(res,lastEntry)}
  else run=null;
  tm.hidden=!run;decorate();
}
setInterval(()=>{if(run)tm.textContent='⏱ '+fmt((Date.now()-run.t0)/1000)},500);
let raf;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(scan)}).observe(document.getElementById('app'),{childList:true,subtree:true});
/* окно статистики */
const col=p=>p>=80?'#7ce1b2':p>=60?'#f4caa2':'#ffa0ad';
const bar=(p,d)=>`<div class="st-bar"><i style="background:${col(p)}" data-w="${p}" ></i></div>`;
function statsHTML(){
  const runs=mem.runs,ts=TESTS(),done=new Set(runs.map(r=>r.id)),avg=runs.length?Math.round(runs.reduce((a,r)=>a+r.pct,0)/runs.length):0,time=runs.reduce((a,r)=>a+r.time,0);
  let h=`<div class="st-top"><div><h2>Моя статистика</h2><div class="muted" style="font-size:14px">Данные хранятся в этом браузере</div></div><button id="stClose" aria-label="Закрыть">✕</button></div>`;
  if(!runs.length)return h+`<p class="st-empty">Пока пусто. Пройди любой тест, и здесь появятся результаты, время и таблица рекордов.</p>`;
  h+=`<div class="st-tiles">${[[done.size+' / '+ts.length,'тестов пройдено'],[runs.length,'прохождений'],[avg+'%','средний результат'],[fmt(time),'время в тестах']].map((x,i)=>`<div class="st-tile" style="animation-delay:${i*.07}s"><b>${x[0]}</b>${x[1]}</div>`).join('')}</div>`;
  h+=`<h3>По предметам</h3>`+Object.keys(SUBJ).map((s,i)=>{const list=ts.filter(t=>t.subject===s),d=list.filter(t=>stat(t.id)),a=d.length?Math.round(d.reduce((x,t)=>x+stat(t.id).best,0)/d.length):0;
    return `<div class="st-row" style="animation-delay:${.2+i*.08}s"><div class="l"><span>${SUBJ[s]}</span><small>${d.length} из ${list.length} · лучший средний ${a}%</small></div>${bar(Math.max(a,d.length?4:0))}</div>`}).join('');
  const tp={};ts.forEach(t=>{const k=t.subject+'|'+t.topic;(tp[k]=tp[k]||{subject:t.subject,topic:t.topic,list:[]}).list.push(t)});
  const rows=Object.values(tp).map(o=>{const d=o.list.filter(t=>stat(t.id));if(!d.length)return null;return{...o,d:d.length,a:Math.round(d.reduce((x,t)=>x+stat(t.id).best,0)/d.length)}}).filter(Boolean).sort((a,b)=>a.a-b.a);
  const row=o=>`<div class="st-row"><div class="l"><span>${esc(o.topic)} <small>· ${SUBJ[o.subject]}</small></span><small>${o.d} из ${o.list.length} · ${o.a}%</small></div>${bar(o.a)}</div>`;
  h+=`<h3>Темы: сначала слабые</h3>`+rows.slice(0,8).map(row).join('')+(rows.length>8?`<details><summary>Ещё ${rows.length-8}</summary>${rows.slice(8).map(row).join('')}</details>`:'');
  const fast=runs.filter(r=>r.pct>=70).sort((a,b)=>a.time-b.time).slice(0,10);
  h+=`<h3>⚡ Рекорды времени (от 70%)</h3>`+(fast.length?`<table class="st-table"><thead><tr><th>#</th><th>Тест</th><th>Результат</th><th>Время</th></tr></thead><tbody>${fast.map((r,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||i+1}</td><td>${esc((T(r.id)||{}).title||r.id)}</td><td>${r.pct}%</td><td>${fmt(r.time)}</td></tr>`).join('')}</tbody></table>`:`<p class="st-empty">Пока нет прохождений на 70% и выше.</p>`);
  h+=`<h3>Последние попытки</h3><table class="st-table"><tbody>${runs.slice(-8).reverse().map(r=>`<tr><td>${esc((T(r.id)||{}).title||r.id)}</td><td>${r.pct}%</td><td>${fmt(r.time)}</td><td>${date(r.ts)}</td></tr>`).join('')}</tbody></table>`;
  return h+`<button id="stReset" style="margin-top:22px;width:100%">Сбросить статистику</button>`;
}
function openStats(){
  closeStats();const ov=document.createElement('div');ov.id='stOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  ov.innerHTML=`<div class="panel">${statsHTML()}</div>`;document.body.appendChild(ov);
  requestAnimationFrame(()=>$$('.st-bar i',ov).forEach(i=>i.style.width=i.dataset.w+'%'));
  ov.onclick=e=>{if(e.target===ov||e.target.id==='stClose')closeStats();if(e.target.id==='stReset'&&confirm('Удалить всю статистику и таблицу лидеров на этом устройстве?')){mem.runs=[];lastEntry=null;save();openStats();decorate()}};
}
function closeStats(){const o=$('#stOv');if(o)o.remove()}
addEventListener('keydown',e=>{if(e.key==='Escape')closeStats()});
const fab=document.createElement('button');fab.id='stFab';fab.type='button';fab.textContent='📊';fab.title='Моя статистика';fab.setAttribute('aria-label','Моя статистика');fab.onclick=openStats;document.body.appendChild(fab);
scan();
})();
