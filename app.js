(()=>{'use strict';
const stage=document.getElementById('stage'),eyesRoot=document.getElementById('eyes'),dock=document.getElementById('dock'),canvas=document.getElementById('atmosphere'),ctx=canvas.getContext('2d');
const defaults=[[41.866,22.742],[57.177,22.742],[36.184,32.2],[44.856,29.649],[54.964,29.649],[63.636,32.306],[30.622,44.846],[39.653,41.339],[60.167,41.233],[68.301,44.74],[34.39,51.647],[64.653,51.86]];
let coords;try{coords=JSON.parse(localStorage.getItem('ohmu-eyes-v013')||localStorage.getItem('ohmu-eyes-v015')||'null')}catch(_){coords=null}if(!Array.isArray(coords)||coords.length!==12)coords=defaults.map(p=>p.slice());
const apps=[['youtube','YouTube','▶'],['netflix','Netflix','N'],['disney','Disney+','✦'],['ytmusic','YT Music','♫'],['cable','Cable TV','▤'],['appletvbox','Apple TV Box','▣'],['apps','All Apps','▦'],['settings','Settings','⚙']];
const otherApps=[['prime','Prime Video','↗'],['spotify','Spotify','≋'],['appletvapp','Apple TV App','●']];

let selected=0,lastAction=Date.now(),immersive=false,calibrate=false,glow=95,fog=60,idle=60,toastTimer;
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
apps.forEach(([id,name,symbol],i)=>{const b=document.createElement('button');b.className='app';b.dataset.id=id;b.innerHTML=`<span class="symbol">${symbol}</span><span class="name">${name}</span>`;b.setAttribute('aria-label',name);b.addEventListener('click',()=>{wake();if(selected===i)activate();else choose(i)});dock.appendChild(b)});
const buttons=[...dock.children];let flashTimers=[];
let appEffects=localStorage.getItem('ohmu-app-effects-v016')!=='off';
const effectSettings={
 youtube:{color:[95,218,255],sequence:[0,1,2,3,4,5,6,7,8,9,10,11],step:58,hold:520},
 netflix:{color:[255,67,57],sequence:[0,1,2,3,4,5,6,7,8,9,10,11],step:40,hold:620},
 disney:{color:[116,172,255],sequence:[11,10,9,8,7,6,5,4,3,2,1,0],step:74,hold:670},
 ytmusic:{color:[240,83,121],sequence:[0,3,6,9,1,4,7,10,2,5,8,11],step:78,hold:660},
 cable:{color:[130,224,245],sequence:[0,5,6,11,1,4,7,10,2,3,8,9],step:53,hold:660},
 appletvbox:{color:[220,238,255],sequence:[0,11,1,10,2,9,3,8,4,7,5,6],step:64,hold:670},
 apps:{color:[74,215,209],sequence:[0,1,2,3,4,5,6,7,8,9,10,11],step:63,hold:500},
 settings:{color:[70,230,168],sequence:[0,5,6,11,1,4,7,10,2,3,8,9],step:42,hold:550},
 prime:{color:[105,203,255],sequence:[11,10,9,8,7,6,5,4,3,2,1,0],step:47,hold:650},
 spotify:{color:[94,231,143],sequence:[0,6,1,7,2,8,3,9,4,10,5,11],step:84,hold:600},
 appletvapp:{color:[220,238,255],sequence:[0,2,4,6,8,10,1,3,5,7,9,11],step:50,hold:680}
};
function flash(id='youtube'){
 flashTimers.forEach(clearTimeout);flashTimers=[];eyeNodes.forEach(e=>{e.classList.remove('active');e.style.removeProperty('--pulse-color')});void eyesRoot.offsetWidth;
 const ef=appEffects?(effectSettings[id]||effectSettings.youtube):{color:[60,192,255],sequence:[0,1,2,3,4,5,6,7,8,9,10,11],step:50,hold:650};
 for(const [rank,i] of ef.sequence.entries()){
   const e=eyeNodes[i];const delay=rank*ef.step;
   flashTimers.push(setTimeout(()=>{const [r,g,b]=ef.color;e.style.setProperty('--pulse-color',`${r},${g},${b}`);e.classList.add('active');flashTimers.push(setTimeout(()=>e.classList.remove('active'),ef.hold))},delay));
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
for(const [id,name,symbol] of otherApps){let b=document.createElement('button');b.textContent=symbol+'  '+name;b.addEventListener('click',()=>{closeAllApps();flash(id);wake();notify(name+' · Animation preview only')});drawerItems.appendChild(b)}
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
const fogInput=document.getElementById('fog');fogInput.value=60;document.getElementById('fogOut').textContent='60%';
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
  {x:.18,w:.12,a:.06,speed:.00028,phase:0.2},
  {x:.36,w:.1,a:.09,speed:.00031,phase:1.4},
  {x:.53,w:.16,a:.07,speed:.00025,phase:2.1},
  {x:.69,w:.11,a:.08,speed:.00029,phase:3.1},
  {x:.84,w:.09,a:.05,speed:.00033,phase:4.4},
];
let last=0;
function drawBeamLayer(t,density){ctx.save();ctx.globalCompositeOperation='screen';for(const b of beams){const twinkle=(0.7+0.3*Math.sin(t*b.speed+b.phase));const alpha=b.a*density*twinkle;const x=b.x*W;const w=b.w*W;const grad=ctx.createLinearGradient(x,0,x+w,H*.62);grad.addColorStop(0,`rgba(190,235,255,${alpha*.95})`);grad.addColorStop(.35,`rgba(125,205,255,${alpha*.45})`);grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.92,0);ctx.lineTo(x+w*.58,H*.56);ctx.lineTo(x+w*.16,H*.56);ctx.closePath();ctx.fill();}
ctx.restore();}
function drawSporeSet(arr,t,density,shadowBlur){ctx.save();ctx.globalCompositeOperation='screen';for(const p of arr){p.y-=p.s*(.18+density*.32);p.x+=Math.sin(t*.00035+p.phase)*(arr===nearSpores?.48:.24);if(p.y<-12)p.y=H+12;if(p.x<0)p.x=W;if(p.x>W)p.x=0;const pulse=(1+Math.sin(t*.0014+p.phase))*0.5;const alpha=p.a*density*(.5+.7*pulse);ctx.beginPath();ctx.fillStyle=`rgba(${arr===nearSpores?'137,235,255':'109,203,245'},${alpha})`;ctx.shadowBlur=shadowBlur;ctx.shadowColor=arr===nearSpores?'rgba(96,212,255,.75)':'rgba(88,176,230,.45)';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
ctx.restore();}
function drawFog(t,density){ctx.save();ctx.globalCompositeOperation='screen';for(const band of fogBands){const y=band.y + Math.sin(t*band.speed*0.08 + band.offset)*band.amp;const drift=(t*band.speed)%(W*1.4);const grad=ctx.createLinearGradient(0,y,0,y+band.h);const a=band.alpha*density;grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(.18,`rgba(180,225,240,${a*.18})`);grad.addColorStop(.5,`rgba(140,205,228,${a})`);grad.addColorStop(.82,`rgba(120,180,210,${a*.45})`);grad.addColorStop(1,'rgba(0,0,0,0)');ctx.filter=`blur(${band.blur}px)`;for(let k=-1;k<=1;k++){const x=-W*.35 + (drift + k*W*.9);ctx.fillStyle=grad;ctx.fillRect(x,y-band.h*.35,W*.95,band.h*1.7);} }
ctx.restore();ctx.filter='none';}
function draw(t){if(t-last<32){requestAnimationFrame(draw);return}last=t;ctx.clearRect(0,0,W,H);const density=Math.max(.05,fog/100);drawBeamLayer(t,density*.95);drawSporeSet(farSpores,t,density*.95,7);drawFog(t,density);drawSporeSet(nearSpores,t,density,12);eyesRoot.style.setProperty('--pulse-strength',String(glow/100));if(idle&&!immersive&&document.getElementById('panel').hidden&&Date.now()-lastAction>idle*1000){immersive=true;stage.classList.add('immersive')}requestAnimationFrame(draw)}
choose(0,false);requestAnimationFrame(draw);stage.focus();
})();

