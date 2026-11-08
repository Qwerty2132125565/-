(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const app=document.getElementById('app');if(!app)return;
/* полоса прокрутки */
const bar=document.createElement('div');bar.id='fxBar';document.body.appendChild(bar);
addEventListener('scroll',()=>{const h=document.documentElement;bar.style.width=(h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});
/* конфетти */
const cv=document.createElement('canvas');cv.id='fxCanvas';document.body.appendChild(cv);const cx=cv.getContext('2d');
let P=[],run=false;
const size=()=>{cv.width=innerWidth;cv.height=innerHeight};size();addEventListener('resize',size);
const COL=['#b7a2ff','#7ce1b2','#ffa0ad','#f4caa2','#8fd8ef','#ffffff'];
function burst(x,y,n=26,pow=9){if(RM)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*pow+2;P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-pow*.5,w:5+Math.random()*5,h:3+Math.random()*4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:COL[Math.random()*COL.length|0],l:1})}if(!run){run=true;requestAnimationFrame(loop)}}
function loop(){cx.clearRect(0,0,cv.width,cv.height);P=P.filter(p=>p.l>0&&p.y<cv.height+30);P.forEach(p=>{p.vy+=.3;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l-=.008;cx.save();cx.globalAlpha=Math.max(p.l,0);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()});if(P.length)requestAnimationFrame(loop);else{run=false;cx.clearRect(0,0,cv.width,cv.height)}}
/* подсветка и наклон карточек */
const CARD='.subject-card,.test-card';
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest&&e.target.closest(CARD);if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');if(!RM){c.style.setProperty('--ry',((x/r.width-.5)*8)+'deg');c.style.setProperty('--rx',((.5-y/r.height)*8)+'deg')}});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest(CARD);if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
/* волна при нажатии */
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button.primary,'+CARD);if(!b||b.disabled)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='fx-rip';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),700)});
/* поочерёдное появление */
const GROUPS='.subject-grid,.test-grid,.options,.intro-grid,.stats,.order-list,.result-actions,.course-tabs,.topic-group,.review-wrap';
function stagger(){document.querySelectorAll(GROUPS).forEach(g=>{if(g.dataset.fx)return;g.dataset.fx=1;[...g.children].forEach((c,i)=>c.style.setProperty('--i',Math.min(i,12)))});document.querySelectorAll('.mistake').forEach((m,i)=>{if(!m.style.getPropertyValue('--i'))m.style.setProperty('--i',Math.min(i,10))})}
/* реакция на ответы и результат */
let streak=0;const seen=new WeakSet();
function toast(t){const d=document.createElement('div');d.className='fx-toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)}
function scan(){
  stagger();
  const f=document.querySelector('.quiz-screen .feedback:not([hidden])');
  if(f&&!seen.has(f)&&(f.classList.contains('good')||f.classList.contains('bad'))){
    seen.add(f);
    if(f.classList.contains('good')){streak++;const r=f.getBoundingClientRect();burst(innerWidth/2,Math.min(Math.max(r.top,90),innerHeight-90),20+streak*2,8);if(streak>=3)toast('🔥 Серия: '+streak)}
    else{streak=0;const c=f.closest('.card');if(c){c.classList.add('fx-shake');setTimeout(()=>c.classList.remove('fx-shake'),500)}}
  }
  const res=document.querySelector('.result');
  if(res&&!seen.has(res)){
    seen.add(res);streak=0;
    const h=res.querySelector('h1'),n=h&&h.firstChild,m=h&&h.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    if(m&&n&&n.nodeType===3){
      const g=+m[1],t=+m[2];
      if(!RM&&g>0){let k=0;n.nodeValue='0';const step=()=>{k=Math.min(g,k+Math.max(1,(g/25)|0));n.nodeValue=k;if(k<g)setTimeout(step,40)};step()}
      if(t&&g/t>=.7)setTimeout(()=>{burst(innerWidth*.2,innerHeight*.5,70,13);burst(innerWidth*.8,innerHeight*.5,70,13);burst(innerWidth*.5,innerHeight*.3,80,14)},400);
    }
  }
}
let raf;
new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(scan)}).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
scan();
})();
