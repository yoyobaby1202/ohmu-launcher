(()=>{'use strict';
const stage=document.getElementById('stage'),eyesRoot=document.getElementById('eyes'),dock=document.getElementById('dock'),canvas=document.getElementById('atmosphere'),ctx=canvas.getContext('2d');
const defaults=[[29.2,36.5],[36.4,34.2],[43.2,33],[56.8,33],[63.6,34.2],[70.8,36.5],[30.4,48.5],[37.8,47],[44.5,45.8],[55.5,45.8],[62.2,47],[69.6,48.5]];
let coords=JSON.parse(localStorage.getItem('ohmu-eyes')||'null');if(!Array.isArray(coords)||coords.length!==12)coords=defaults.map(p=>p.slice());
const apps=[['youtube','YouTube','▶'],['netflix','Netflix','N'],['disney','Disney+','✦'],['apple','Apple TV','●'],['prime','Prime Video','↗'],['spotify','Spotify','≋'],['apps','全部 App','▦'],['settings','設定','⚙']];
let selected=0,lastAction=Date.now(),immersive=false,calibrate=false,glow=55,fog=35,idle=60,toastTimer;
const eyeNodes=coords.map((p,i)=>{const e=document.createElement('div');e.className='eye';e.dataset.index=i;eyesRoot.appendChild(e);return e});
function place(){eyeNodes.forEach((e,i)=>{e.style.left=coords[i][0]+'%';e.style.top=coords[i][1]+'%'})}place();
apps.forEach(([id,name,symbol],i)=>{const b=document.createElement('button');b.className='app';b.dataset.id=id;b.innerHTML=`<span class="symbol">${symbol}</span><span class="name">${name}</span>`;b.setAttribute('aria-label',name);b.addEventListener('click',()=>{wake();if(selected===i)activate();else choose(i)});dock.appendChild(b)});
const buttons=[...dock.children];function flash(direction=0){eyeNodes.forEach((e,i)=>{e.classList.remove('active');setTimeout(()=>{e.classList.add('active');setTimeout(()=>e.classList.remove('active'),320)},direction>0?i*24:direction<0?(11-i)*24:0)})}
function choose(i){selected=(i+apps.length)%apps.length;buttons.forEach((b,j)=>{b.classList.toggle('selected',j===selected);b.setAttribute('aria-pressed',String(j===selected))});flash(i%2===0?1:-1)}
function notify(s){const t=document.getElementById('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
function activate(){if(apps[selected][0]==='settings'){openPanel();return}flash();notify(apps[selected][1]+' · 啟動效果預覽（未連接實際 App）')}
function wake(){lastAction=Date.now();if(immersive){immersive=false;stage.classList.remove('immersive')}}
function openPanel(){wake();document.getElementById('panel').hidden=false}function closePanel(){document.getElementById('panel').hidden=true;stage.focus()}
document.getElementById('settings').onclick=openPanel;document.getElementById('close').onclick=closePanel;
document.getElementById('glow').oninput=e=>{glow=+e.target.value;document.getElementById('glowOut').textContent=glow+'%'};
document.getElementById('fog').oninput=e=>{fog=+e.target.value;document.getElementById('fogOut').textContent=fog+'%'};
document.getElementById('idle').onchange=e=>idle=+e.target.value;
document.getElementById('calibrate').onchange=e=>{calibrate=e.target.checked;eyeNodes.forEach(n=>n.classList.toggle('calibrate',calibrate));notify(calibrate?'拖動光點至圖片中的眼睛位置':'眼睛位置已儲存')};
document.getElementById('reset').onclick=()=>{coords=defaults.map(p=>p.slice());localStorage.removeItem('ohmu-eyes');place();notify('已重設眼睛位置')};
let dragging=-1;eyeNodes.forEach((e,i)=>{e.addEventListener('pointerdown',ev=>{if(!calibrate)return;dragging=i;e.setPointerCapture(ev.pointerId);ev.preventDefault()});e.addEventListener('pointermove',ev=>{if(dragging!==i)return;const r=stage.getBoundingClientRect();coords[i]=[Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100)),Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100))];place()});e.addEventListener('pointerup',()=>{dragging=-1;localStorage.setItem('ohmu-eyes',JSON.stringify(coords))})});
window.addEventListener('keydown',e=>{if(!document.getElementById('panel').hidden){if(e.key==='Escape')closePanel();return}if(['ArrowRight','ArrowLeft','Enter',' ','Escape'].includes(e.key)){e.preventDefault();if(immersive){wake();return}wake();if(e.key==='ArrowRight')choose(selected+1);else if(e.key==='ArrowLeft')choose(selected-1);else if(e.key==='Enter'||e.key===' ')activate();else{stage.classList.add('immersive');immersive=true}}});
let startX=0;stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',e=>{if(!document.getElementById('panel').hidden)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40){wake();choose(selected+(dx<0?1:-1))}else if(immersive)wake()},{passive:true});
const particles=Array.from({length:55},(_,i)=>({x:Math.random()*1672,y:Math.random()*941,r:1+Math.random()*3,s:.15+Math.random()*.55,phase:Math.random()*6.28}));let last=0;
function draw(t){if(t-last<32){requestAnimationFrame(draw);return}last=t;ctx.clearRect(0,0,1672,941);const density=fog/100;ctx.save();ctx.globalCompositeOperation='screen';particles.forEach((p,i)=>{p.y-=p.s*(.2+density);p.x+=Math.sin(t*.00035+p.phase)*.28;if(p.y<0)p.y=941;if(p.x<0)p.x=1672;if(p.x>1672)p.x=0;const alpha=(.08+.18*(1+Math.sin(t*.001+p.phase))/2)*density;ctx.beginPath();ctx.fillStyle=`rgba(117,223,244,${alpha})`;ctx.shadowBlur=9;ctx.shadowColor='#68c5e2';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});ctx.restore();const breath=.35+.15*Math.sin(t*.0007);eyeNodes.forEach((e,i)=>{if(!e.classList.contains('active')&&!calibrate)e.style.opacity=String((glow/100)*breath)});if(idle&&!immersive&&document.getElementById('panel').hidden&&Date.now()-lastAction>idle*1000){immersive=true;stage.classList.add('immersive')}requestAnimationFrame(draw)}
choose(0);requestAnimationFrame(draw);stage.focus();
})();
