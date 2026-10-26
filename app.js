(()=>{'use strict';
const stage=document.getElementById('stage'),eyesRoot=document.getElementById('eyes'),dock=document.getElementById('dock'),canvas=document.getElementById('atmosphere'),ctx=canvas.getContext('2d');
const defaults=[[41.866,22.742],[57.177,22.742],[36.184,32.2],[44.856,29.649],[54.964,29.649],[63.636,32.306],[30.622,44.846],[39.653,41.339],[60.167,41.233],[68.301,44.74],[34.39,51.647],[64.653,51.86]];
let coords;try{coords=JSON.parse(localStorage.getItem('ohmu-eyes-v013')||localStorage.getItem('ohmu-eyes-v015')||'null')}catch(_){coords=null}if(!Array.isArray(coords)||coords.length!==12)coords=defaults.map(p=>p.slice());
const apps=[['youtube','YouTube','▶'],['netflix','Netflix','N'],['disney','Disney+','✦'],['ytmusic','YT Music','♫'],['cable','Cable TV','▤'],['appletvbox','Apple TV Box','▣'],['apps','All Apps','▦'],['settings','Settings','⚙']];
const otherApps=[['prime','Prime Video','↗'],['spotify','Spotify','≋'],['appletvapp','Apple TV App','●']];

// Self-contained vector icon designs, no remote files or image downloads required.
// Home labels stay English; icons are iOS-inspired interpretations.
const iconSVG={
 youtube:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="12" fill="#FF0033"/><path d="M28 23.5 43 32 28 40.5Z" fill="white"/></svg>`,
 netflix:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 9h10l16 46H35z" fill="#B00613"/><path d="M19 9h10v46H19z" fill="#E50914"/><path d="M35 9h10v46H35z" fill="#E50914"/><path d="M19 9h10l16 46H35z" fill="#8C0610" opacity=".55"/></svg>`,
 disney:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 27C17 12 38 7 55 19" fill="none" stroke="#E8F3FF" stroke-width="2.3" stroke-linecap="round"/><text x="31.5" y="37" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-style="italic" font-size="15" fill="white">Disney</text><path d="M50 23h7m-3.5-3.5v7" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
 ytmusic:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="none" stroke="white" stroke-width="3.5"/><circle cx="32" cy="32" r="11" fill="white"/><path d="M29 25.7 39.2 32 29 38.3Z" fill="#E90021"/></svg>`,
 cable:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="16" width="40" height="29" rx="5" stroke="white" fill="none" stroke-width="3"/><path d="M23 51h18M32 45v6" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="m19 26 7-5" stroke="#D3F5FF" stroke-width="2.3" stroke-linecap="round" opacity=".65"/></svg>`,
 appletvbox:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22.6 27c-4.1-2.8-9.6.3-9.6 7.4 0 7.2 4.2 15.2 8.3 15.2 2 0 3.7-1.4 6.3-1.4 2.3 0 3.7 1.4 5.9 1.4 3.1 0 6-4.7 7.2-8-3.7-1.8-5-6.3-2.7-9.3 1-1.5 2.4-2.4 3.9-2.8-2.1-2.7-4.8-3.9-7.7-3.7-3 .2-4.2 1.6-6.4 1.6-2.1 0-3.2-1.4-5.2-1.4Z" fill="white" transform="translate(0,-4) scale(.83) translate(2,8)"/><path d="M28 20c.3-4.8 3.4-7.5 7.4-8.2-.3 4.5-3.3 7.7-7.4 8.2" fill="white"/><text x="43" y="44" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle" font-size="22" fill="white">tv</text></svg>`,
 appletvapp:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22.6 27c-4.1-2.8-9.6.3-9.6 7.4 0 7.2 4.2 15.2 8.3 15.2 2 0 3.7-1.4 6.3-1.4 2.3 0 3.7 1.4 5.9 1.4 3.1 0 6-4.7 7.2-8-3.7-1.8-5-6.3-2.7-9.3 1-1.5 2.4-2.4 3.9-2.8-2.1-2.7-4.8-3.9-7.7-3.7-3 .2-4.2 1.6-6.4 1.6-2.1 0-3.2-1.4-5.2-1.4Z" fill="white" transform="translate(0,-4) scale(.83) translate(2,8)"/><path d="M28 20c.3-4.8 3.4-7.5 7.4-8.2-.3 4.5-3.3 7.7-7.4 8.2" fill="white"/><text x="43" y="44" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle" font-size="22" fill="white">tv</text></svg>`,
 apps:`<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="white" stroke-width="3"><rect x="14" y="14" width="15" height="15" rx="3"/><rect x="35" y="14" width="15" height="15" rx="3"/><rect x="14" y="35" width="15" height="15" rx="3"/><rect x="35" y="35" width="15" height="15" rx="3"/></g></svg>`,
 settings:`<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round"><circle cx="32" cy="32" r="15"/><circle cx="32" cy="32" r="6"/><path d="M32 9v8m0 30v8M9 32h8m30 0h8M16 16l6 6m20 20 6 6m0-32-6 6M22 42l-6 6"/></g></svg>`,
 prime:`<svg viewBox="0 0 64 64" aria-hidden="true"><text x="32" y="31" font-family="Arial,sans-serif" font-size="17" fill="#fff" text-anchor="middle" font-weight="700">prime</text><path d="M18 39c9 7 21 7 29 0m-5-2 5 2-2 5" fill="none" stroke="#6FD1FF" stroke-width="2.5" stroke-linecap="round"/></svg>`,
 spotify:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="25" fill="#1ED760"/><g fill="none" stroke="#101810" stroke-linecap="round"><path d="M17 26c13-5 26-3 34 2" stroke-width="5"/><path d="M19 34c11-3 23-2 30 3" stroke-width="4"/><path d="M21 42c9-2 19-1 26 3" stroke-width="3.2"/></g></svg>`
};
function renderIcon(id,label,fallback){
 const artwork=iconSVG[id]||`<span class="fallback-symbol">${fallback}</span>`;
 return `<span class="symbol app-icon ${id}-icon" aria-hidden="true">${artwork}</span><span class="name">${label}</span>`;
}

let selected=0,lastAction=Date.now(),immersive=false,calibrate=false,glow=95,fog=75,idle=60,toastTimer;
const eyeGeometry=[[74,58,-24],[77,61,24],[55,63,-26],[77,62,-23],[75,64,23],[59,65,28],[61,70,-27],[70,69,-21],[70,69,23],[62,70,27],[75,73,-22],[74,74,23]];
const defaultSizes=eyeGeometry.map(([w,h])=>[w,h]);
let eyeSizes;try{eyeSizes=JSON.parse(localStorage.getItem('ohmu-eye-sizes-v014')||localStorage.getItem('ohmu-eye-sizes-v015')||'null')}catch(_){eyeSizes=null}
if(!Array.isArray(eyeSizes)||eyeSizes.length!==12||!eyeSizes.every(a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite)))eyeSizes=defaultSizes.map(a=>a.slice());
const eyeNodes=coords.map((p,i)=>{const e=document.createElement('div');e.className='eye';e.dataset.index=i;e.style.setProperty('--eye-rot',eyeGeometry[i][2]+'deg');eyesRoot.appendChild(e);return e});
function place(){eyeNodes.forEach((e,i)=>{e.style.left=coords[i][0]+'%';e.style.top=coords[i][1]+'%';e.style.setProperty('--eye-w',(eyeSizes[i][0]/1672*100)+'%');e.style.setProperty('--eye-h',(eyeSizes[i][1]/941*100)+'%')})}place();
function persistCoords(){localStorage.setItem('ohmu-eyes-v015',JSON.stringify(coords));localStorage.setItem('ohmu-eyes-v013',JSON.stringify(coords))}
function persistSizes(){localStorage.setItem('ohmu-eye-sizes-v015',JSON.stringify(eyeSizes));localStorage.setItem('ohmu-eye-sizes-v014',JSON.stringify(eyeSizes))}
const eyePicker=document.getElementById('eyePicker'),eyeWidth=document.getElementById('eyeWidth'),eyeHeight=document.getElementById('eyeHeight');
let editingEye=0;
for(let i=0;i<12;i++){const o=document.createElement('option');o.value=String(i);o.textContent='Eye '+(i+1);eyePicker.appendChild(o)}
function syncSizeUI(){eyePicker.value=String(editingEye);eyeWidth.value=String(eyeSizes[editingEye][0]);eyeHeight.value=String(eyeSizes[editingEye][1]);document.getElementById('eyeWidthOut').textContent=eyeSizes[editingEye][0]+' px';document.getElementById('eyeHeightOut').textContent=eyeSizes[editingEye][1]+' px';eyeNodes.forEach((e,i)=>e.classList.toggle('editing',calibrate&&i===editingEye))}
eyePicker.onchange=e=>{editingEye=+e.target.value;syncSizeUI()};
eyeWidth.oninput=e=>{eyeSizes[editingEye][0]=+e.target.value;place();persistSizes();syncSizeUI()};
eyeHeight.oninput=e=>{eyeSizes[editingEye][1]=+e.target.value;place();persistSizes();syncSizeUI()};
syncSizeUI();
apps.forEach(([id,name,symbol],i)=>{const b=document.createElement('button');b.className='app';b.dataset.id=id;b.innerHTML=renderIcon(id,name,symbol);b.setAttribute('aria-label',name);b.addEventListener('click',()=>{wake();if(selected===i)activate();else choose(i)});dock.appendChild(b)});
const buttons=[...dock.children];
let appEffects=localStorage.getItem('ohmu-app-effects-v016')!=='off';
// All twelve eyes illuminate together. Apps vary by color and temporal rhythm only.
// Blue = calm; red = alert. No traveling dots or artificial white centers.
const effectSettings={
 youtube:{color:'blue',pattern:[[0,420,0.70]]},
 netflix:{color:'red',pattern:[[0,180,.72],[265,420,.86]]},
 disney:{color:'blue',pattern:[[0,850,.57]]},
 ytmusic:{color:'red',pattern:[[0,145,.64],[245,145,.64],[490,310,.70]]},
 cable:{color:'blue',pattern:[[0,250,.68],[360,490,.56]]},
 appletvbox:{color:'blue',pattern:[[0,970,.53]]},
 apps:{color:'blue',pattern:[[0,260,.60],[350,260,.64]]},
 settings:{color:'blue',pattern:[[0,160,.55]]},
 prime:{color:'blue',pattern:[[0,480,.68]]},
 spotify:{color:'blue',pattern:[[0,190,.60],[290,190,.60],[580,370,.54]]},
 appletvapp:{color:'blue',pattern:[[0,850,.55]]}
};
let flashTimers=[];
function flash(id='youtube'){
 flashTimers.forEach(clearTimeout);flashTimers=[];
 eyesRoot.classList.remove('flash-on');
 eyeNodes.forEach(e=>e.classList.remove('active'));
 void eyesRoot.offsetWidth;
 const ef=appEffects?(effectSettings[id]||effectSettings.youtube):{color:'blue',pattern:[[0,590,.65]]};
 const rgb=ef.color==='red'?'224,52,57':'47,159,245';
 eyesRoot.style.setProperty('--pulse-color',rgb);
 for(const [delay,duration,intensity] of ef.pattern){
  flashTimers.push(setTimeout(()=>{
   eyesRoot.style.setProperty('--pulse-strength',String(intensity*glow/100));
   eyeNodes.forEach(e=>e.classList.add('active'));
  },delay));
  flashTimers.push(setTimeout(()=>eyeNodes.forEach(e=>e.classList.remove('active')),delay+duration));
 }
}
function choose(i,animate=true){selected=(i+apps.length)%apps.length;buttons.forEach((b,j)=>{b.classList.toggle('selected',j===selected);b.setAttribute('aria-pressed',String(j===selected))});if(animate)flash(apps[selected][0])}

function notify(s){const t=document.getElementById('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
function activate(){
 const [id,name]=apps[selected];if(id==='settings'){openPanel();return}
 if(id==='apps'){flash(id);openAllApps();return}
 flash(id);
 if(id==='cable'||id==='appletvbox'){
 const port=id==='cable'?document.getElementById('boxHdmi').value:document.getElementById('appleHdmi').value;
 notify(name+' · HDMI '+port+' (preview only)');return;
 }
 notify(name+' · Animation preview only');
}
const allApps=document.getElementById('allApps'),drawerItems=document.getElementById('drawerItems');
for(const [id,name,symbol] of otherApps){let b=document.createElement('button');b.className='drawer-app';b.innerHTML=renderIcon(id,name,symbol);b.addEventListener('click',()=>{closeAllApps();flash(id);wake();notify(name+' · Animation preview only')});drawerItems.appendChild(b)}
function openAllApps(){allApps.hidden=false;document.getElementById('closeApps').focus();wake()}
function closeAllApps(){allApps.hidden=true;stage.focus();wake()}
document.getElementById('closeApps').onclick=closeAllApps;
const effectsToggle=document.getElementById('effectsToggle');effectsToggle.checked=appEffects;effectsToggle.onchange=e=>{appEffects=e.target.checked;localStorage.setItem('ohmu-app-effects-v016',appEffects?'on':'off')};
for(const [id,key] of [['boxHdmi','ohmu-box-hdmi-v016'],['appleHdmi','ohmu-apple-hdmi-v016']]){
 const el=document.getElementById(id),saved=localStorage.getItem(key);if(saved&&['1','2','3','4'].includes(saved))el.value=saved;
 el.onchange=()=>localStorage.setItem(key,el.value);
}

function wake(){lastAction=Date.now();if(immersive){immersive=false;stage.classList.remove('immersive')}}
function openPanel(){wake();document.getElementById('panel').hidden=false;document.getElementById('editBack').hidden=true}
function closePanel(){document.getElementById('panel').hidden=true;document.getElementById('editBack').hidden=!calibrate;stage.focus()}
document.getElementById('settings').onclick=openPanel;document.getElementById('close').onclick=closePanel;document.getElementById('editBack').onclick=openPanel;
const glowInput=document.getElementById('glow');glowInput.value=95;document.getElementById('glowOut').textContent='95%';
glowInput.oninput=e=>{glow=+e.target.value;document.getElementById('glowOut').textContent=glow+'%'};
const fogInput=document.getElementById('fog');fogInput.value=75;document.getElementById('fogOut').textContent='75%';
fogInput.oninput=e=>{fog=+e.target.value;document.getElementById('fogOut').textContent=fog+'%'};
document.getElementById('idle').onchange=e=>idle=+e.target.value;
document.getElementById('calibrate').onchange=e=>{calibrate=e.target.checked;eyesRoot.classList.toggle('calibrating',calibrate);eyeNodes.forEach(n=>n.classList.toggle('calibrate',calibrate));document.getElementById('eyeSizeControls').hidden=!calibrate;syncSizeUI();notify(calibrate?'Drag an eye to move; adjust its width and height':'Eye settings saved')};
document.getElementById('reset').onclick=()=>{coords=defaults.map(p=>p.slice());eyeSizes=defaultSizes.map(a=>a.slice());localStorage.removeItem('ohmu-eyes-v013');localStorage.removeItem('ohmu-eyes-v015');localStorage.removeItem('ohmu-eye-sizes-v014');localStorage.removeItem('ohmu-eye-sizes-v015');place();syncSizeUI();notify('Eye positions and sizes reset')};
let dragging=-1;eyeNodes.forEach((e,i)=>{e.addEventListener('pointerdown',ev=>{if(!calibrate)return;dragging=i;editingEye=i;syncSizeUI();e.setPointerCapture(ev.pointerId);ev.preventDefault()});e.addEventListener('pointermove',ev=>{if(dragging!==i)return;const r=eyesRoot.getBoundingClientRect();coords[i]=[Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100)),Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100))];place()});e.addEventListener('pointerup',()=>{dragging=-1;persistCoords()});e.addEventListener('pointercancel',()=>{dragging=-1})});
window.addEventListener('keydown',e=>{if(!document.getElementById('panel').hidden){if(e.key==='Escape')closePanel();return}if(!allApps.hidden){if(e.key==='Escape')closeAllApps();return}if(['ArrowRight','ArrowLeft','Enter',' ','Escape'].includes(e.key)){e.preventDefault();if(immersive){wake();return}wake();if(e.key==='ArrowRight')choose(selected+1);else if(e.key==='ArrowLeft')choose(selected-1);else if(e.key==='Enter'||e.key===' ')activate();else{stage.classList.add('immersive');immersive=true}}});
let startX=0;stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',e=>{if(!document.getElementById('panel').hidden||!allApps.hidden)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40){wake();choose(selected+(dx<0?1:-1))}else if(immersive)wake()},{passive:true});

const W=1672,H=941;
const farSpores=Array.from({length:44},()=>({x:Math.random()*W,y:Math.random()*H*.82,r:1+Math.random()*2.2,s:.08+Math.random()*.22,phase:Math.random()*6.28,a:.12+Math.random()*.15}));
const nearSpores=Array.from({length:30},()=>({x:Math.random()*W,y:H*.18+Math.random()*H*.72,r:2.2+Math.random()*4.8,s:.16+Math.random()*.42,phase:Math.random()*6.28,a:.15+Math.random()*.22}));
const fogBands=[
  {y:H*.77,h:H*.13,speed:.055,amp:16,alpha:.17,blur:28,offset:Math.random()*999},
  {y:H*.82,h:H*.11,speed:.035,amp:20,alpha:.14,blur:36,offset:Math.random()*999},
  {y:H*.87,h:H*.09,speed:.025,amp:13,alpha:.11,blur:22,offset:Math.random()*999},
];
const beams=[
  {x:.18,w:.12,a:.11,speed:.00028,phase:0.2},
  {x:.36,w:.1,a:.14,speed:.00031,phase:1.4},
  {x:.53,w:.16,a:.12,speed:.00025,phase:2.1},
  {x:.69,w:.11,a:.13,speed:.00029,phase:3.1},
  {x:.84,w:.09,a:.10,speed:.00033,phase:4.4},
];
let last=0;
function drawBeamLayer(t,density){ctx.save();ctx.globalCompositeOperation='screen';for(const b of beams){const twinkle=(0.7+0.3*Math.sin(t*b.speed+b.phase));const alpha=b.a*density*twinkle;const x=b.x*W;const w=b.w*W;const grad=ctx.createLinearGradient(x,0,x+w,H*.62);grad.addColorStop(0,`rgba(190,235,255,${alpha*.95})`);grad.addColorStop(.35,`rgba(125,205,255,${alpha*.45})`);grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.92,0);ctx.lineTo(x+w*.58,H*.56);ctx.lineTo(x+w*.16,H*.56);ctx.closePath();ctx.fill();}
ctx.restore();}
function drawSporeSet(arr,t,density,shadowBlur){ctx.save();ctx.globalCompositeOperation='screen';for(const p of arr){p.y-=p.s*(.18+density*.32);p.x+=Math.sin(t*.00035+p.phase)*(arr===nearSpores?.48:.24);if(p.y<-12)p.y=H+12;if(p.x<0)p.x=W;if(p.x>W)p.x=0;const pulse=(1+Math.sin(t*.0014+p.phase))*0.5;const alpha=p.a*density*(.5+.7*pulse);ctx.beginPath();ctx.fillStyle=`rgba(${arr===nearSpores?'137,235,255':'109,203,245'},${alpha})`;ctx.shadowBlur=shadowBlur;ctx.shadowColor=arr===nearSpores?'rgba(96,212,255,.75)':'rgba(88,176,230,.45)';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
ctx.restore();}
// Soft billowing layers, positioned beneath the face and above the baked-in dock.
// Drawn as drifting low-contrast volume instead of near-invisible rectangles.
function drawFog(t,density){
 ctx.save();ctx.globalCompositeOperation='screen';
 const time=t*.001;
 const clouds=[
  {baseY:.66,rx:300,ry:58,alpha:.15,drift:11},
  {baseY:.72,rx:350,ry:74,alpha:.19,drift:-9},
  {baseY:.78,rx:325,ry:68,alpha:.20,drift:13},
  {baseY:.83,rx:330,ry:70,alpha:.15,drift:-7}
 ];
 for(let layer=0;layer<clouds.length;layer++){
  const c=clouds[layer];
  for(let k=0;k<5;k++){
   const x=((k*W/3 + time*c.drift*8 + Math.sin(k*2.7+layer)*130)%(W+900)+W+900)%(W+900)-450;
   const y=c.baseY*H + Math.sin(time*.36+k*1.8+layer)*18;
   const a=c.alpha*density*(.83+.17*Math.sin(time*.45+k));
   ctx.save();ctx.translate(x,y);ctx.scale(1,c.ry/c.rx);
   const g=ctx.createRadialGradient(0,0,0,0,0,c.rx);
   g.addColorStop(0,`rgba(185,223,231,${a})`);
   g.addColorStop(.36,`rgba(135,190,205,${a*.75})`);
   g.addColorStop(.7,`rgba(92,148,169,${a*.25})`);
   g.addColorStop(1,'rgba(90,140,150,0)');
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,c.rx,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 }
 ctx.restore();
}
function draw(t){if(t-last<32){requestAnimationFrame(draw);return}last=t;ctx.clearRect(0,0,W,H);const density=Math.max(.05,fog/100);drawBeamLayer(t,density*.95);drawSporeSet(farSpores,t,density*.95,7);drawFog(t,density);drawSporeSet(nearSpores,t,density,12);if(idle&&!immersive&&document.getElementById('panel').hidden&&Date.now()-lastAction>idle*1000){immersive=true;stage.classList.add('immersive')}requestAnimationFrame(draw)}
choose(0,false);requestAnimationFrame(draw);stage.focus();
})();

