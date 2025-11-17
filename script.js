const VERSION = 'V.1.0 (GH)';

// ##################################################################
// #  สำคัญมาก: ใส่ URL ของ V.1.0 API ที่คุณเพิ่ง Deploy ลงที่นี่ #
// ##################################################################
const API_URL = "https://script.google.com/macros/s/AKfycbyKRFPK4hw0eGcwiiK4v4Bm6atFruhv6d4CAf6_w6H_kPRO3cwymBUoBpOQpitiZ2fK/exec"; 
// ##################################################################


// --- API Helper Function ---
async function apiCall(action, payload = {}) {
    ldBtn('b-log', 1); ldBtn('b-reg', 1); ldBtn('b-fog', 1); 
    ldBtn('b-pdpa', 1); ldBtn('b-res', 1); ldBtn('b-can', 1); 
    ldBtn('b-apt', 1); ldBtn('b-sav', 1);
    
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: action, payload: payload })
        });
        
        if (!res.ok) throw new Error('Network error: ' + res.statusText);
        
        const r = await res.json();
        
        ldBtn('b-log', 0); ldBtn('b-reg', 0); ldBtn('b-fog', 0); ldBtn('b-pdpa', 0);
        ldBtn('b-res', 0); ldBtn('b-can', 0); ldBtn('b-apt', 0); ldBtn('b-sav', 0);

        if (r.status === 'error') {
            tst(r.message, 'e');
            return null;
        }
        return r;
        
    } catch (e) {
        console.error('API Call Error:', e);
        tst('System Error: ' + e.message, 'e');
        ldBtn('b-log', 0); ldBtn('b-reg', 0); ldBtn('b-fog', 0); ldBtn('b-pdpa', 0);
        ldBtn('b-res', 0); ldBtn('b-can', 0); ldBtn('b-apt', 0); ldBtn('b-sav', 0);
        return null;
    }
}

// --- Original Functions (Refactored for API) ---

const el=i=>document.getElementById(i), cl=i=>el(i).style.display='none';
let u=null, iv=null, ld="", exp=false, aps=[], cIdx=-1;

const nav=v=>{['login-view','register-view','forgot-view'].forEach(i=>el(i).classList.add('hidden'));el(v).classList.remove('hidden')};
const ldBtn=(b,s)=>{const x=el(b);if(x){x.disabled=s;x.querySelector('.load').style.display=s?'inline-block':'none'}};
const tst=(m,t='n')=>{const d=document.createElement('div');d.className='tst';d.style.border=`1px solid ${t=='e'?'var(--red)':'var(--green)'}`;d.innerHTML=`<span>${t=='e'?'⚠️':'✅'} ${m}</span>`;el('toast-bin').appendChild(d);setTimeout(()=>{d.style.animation='fadeOut 0.3s';setTimeout(()=>d.remove(),300)},3000)};

function init(){
    document.querySelectorAll('.no').forEach(i=>i.oninput=function(){this.value=this.value.replace(/[^0-9]/g,'')});
    document.querySelectorAll('.ip').forEach(i=>i.oninput=function(){this.classList.remove('err')});
    try{const s=sessionStorage.getItem('m_u');if(s){u=JSON.parse(s);chk()}else nav('login-view')}catch(e){nav('login-view')}
    document.addEventListener("visibilitychange",()=>{if(document.hidden)stp();else if(u&&!el('dashboard-layer').classList.contains('hidden')){getA(true);strt()}});
}

function chk(){
    el('auth-layer').classList.add('hidden');
    if(!u.pdpa){el('m-pdpa').style.display='flex';return}
    if(!u.has){tst('กรุณาลงทะเบียนเวชระเบียน','e');opProf(true);return}
    if(u.has&&!u.comp){tst('กรอกข้อมูลให้ครบ','e');opProf(true);return}
    dash();
}

function dash(){
    el('dashboard-layer').classList.remove('hidden'); el('navbar').classList.remove('hidden');
    const w=el('n-wel'), box=el('n-box'); 
    w.innerText='ยินดีต้อนรับ '+u.name;
    setTimeout(()=>{if(w.offsetWidth>box.offsetWidth)w.className='marquee'},100);
    el('n-hn').innerText=u.hn; getA(); strt();
}

function logout(){stp();sessionStorage.removeItem('m_u');location.reload()}
function strt(){if(iv)clearInterval(iv);iv=setInterval(()=>{if(!document.hidden)getA(true)},3000)}
function stp(){if(iv)clearInterval(iv)}

async function doLog(){
    const n=el('nid').value,p=el('pass').value;
    if(n.length!=13||!p)return tst('กรอกข้อมูลให้ครบ','e');
    const r = await apiCall('login', { nid: n, pass: p });
    if(r && r.status=='success'){
        u={name:r.username,hn:r.hn,nid:r.nationalID,has:r.hasMedicalRecord,comp:r.isProfileComplete,pdpa:r.pdpaConsented,old:r.oldData};
        sessionStorage.setItem('m_u',JSON.stringify(u));
        tst('ยินดีต้อนรับ','s');chk();
    }
}

async function doRegister(){
    const n=el('rn').value,nm=el('ru').value,p=el('rp').value;
    if(n.length!=13||!nm||!p)return tst('กรอกให้ครบ','e');
    const r = await apiCall('register', {nationalID:n,username:nm,password:p});
    if(r && r.status=='success'){tst('สำเร็จ','s');nav('login-view')}
}

async function doForgot(){
    const n=el('fn').value; if(n.length!=13)return tst('เลขบัตร 13 หลัก','e');
    const r = await apiCall('forgotPassword', { nid: n });
    if(r && r.status=='success'){ tst('รหัส: '+r.password, 's'); }
}

async function okPDPA(){
    const r = await apiCall('acceptPDPA', { nid: u.nid });
    if(r && r.status=='success'){u.pdpa=true;sessionStorage.setItem('m_u',JSON.stringify(u));el('m-pdpa').style.display='none';chk()}
}

async function getA(bg=false){
    if(!bg)el('ls-appt').innerHTML='<div style="color:var(--txt-s);">กำลังโหลด...</div>';
    
    try {
      const res = await fetch(API_URL, {
          method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getAppointments', payload: { nid: u.nid } })
      });
      const r = await res.json();

      if(bg && JSON.stringify(r)===ld)return; ld=JSON.stringify(r);
      if(r.status=='success'&&r.hasAppointment){
          aps=r.appointments; renderAps();
      }else {
          aps=[]; renderAps();
      }
    } catch(e) {
      console.log("Polling error", e.message);
    }
}

function renderAps(){
    if(aps.length==0) return el('ls-appt').innerHTML='<div style="color:var(--txt-s);margin-top:10px;">ไม่มีนัดหมาย</div>';
    let h=gi(aps[0],0);
    if(aps.length>1){
        h+=`<div id="m-box" class="mw ${exp?'open':''}"><br>`; for(let i=1;i<aps.length;i++)h+=gi(aps[i],i);
        h+=`</div><div class="tog" onclick="tog()">${exp?'ซ่อน':'แสดงเพิ่มเติม'} <span style="margin-left:5px;display:inline-block;transform:${exp?'rotate(180deg)':''};transition:0.3s">▼</span></div>`;
    }
    el('ls-appt').innerHTML=h;
}
const gi=(a,i)=>`<div class="ai" onclick="mng(${i})"><div class="ac"><div class="ad">${new Date(a.date).toLocaleDateString('th-TH')} เวลา ${a.time}</div><div class="at">${a.dept} (${a.symptom})</div></div><div class="ar">›</div></div>`;
function tog(){exp=!exp;renderAps()}

function mng(i){cIdx=i;const a=aps[i];el('mn-det').innerHTML=`<strong>${new Date(a.date).toLocaleDateString('th-TH')} ${a.time}</strong><br>${a.dept} (${a.symptom})`;toMain();el('m-man').style.display='flex'}
function toMain(){el('mv-main').className='';el('mv-re').className='hidden';el('mv-c1').className='hidden';el('mv-c2').className='hidden'}
function toRe(){const d=new Date();d.setDate(d.getDate()+1);el('r-da').min=d.toISOString().split('T')[0];el('mv-main').className='hidden';el('mv-re').className=''}
function toCan1(){el('mv-main').className='hidden';el('mv-c1').className=''}
function toCan2(){el('mv-c1').className='hidden';el('mv-c2').className=''}

async function doRes(){
    const d=el('r-da').value,t=el('r-ti').value; if(!d||!t)return tst('เลือกวันเวลา','e');
    const payload = {nationalID:u.nid,oldDate:aps[cIdx].date,oldTime:aps[cIdx].time,newDate:d,newTime:t};
    const r = await apiCall('reschedule', payload);
    if(r && r.status=='success'){tst('เลื่อนนัดสำเร็จ','s');cl('m-man');getA(false)}
}

async function doCan(){
    const payload = {nationalID:u.nid,date:aps[cIdx].date,time:aps[cIdx].time};
    const r = await apiCall('cancel', payload);
    if(r && r.status=='success'){tst('ยกเลิกสำเร็จ','s');cl('m-man');getA(false)}
}

async function saveAppt(){
    const d=el('a-da').value,t=el('a-ti').value,s=el('a-sy').value; if(!d||!t)return tst('เลือกวันเวลา','e');
    const payload = {hn:u.hn,nationalID:u.nid,username:u.name,department:'ผิวหนัง',symptom:s,date:d,time:t};
    const r = await apiCall('makeAppointment', payload);
    if(r && r.status=='success'){tst('จองสำเร็จ','s');cl('m-appt');getA(false)}
}

async function saveProf(){
    const ids=['pf-ti','pf-fi','pf-la','pf-do','pf-ag','pf-ge','pf-ma','pf-na','pf-re','pf-oc','pf-ph','pf-ad','pf-bl','pf-we','pf-he','pf-di','pf-en','pf-er','pf-ep'];
    let v=true,err=null; ids.forEach(i=>{const e=el(i);if(!e.value){e.classList.add('err');if(!err)err=e;v=false}else e.classList.remove('err')});
    if(!v){tst('กรอกให้ครบ','e');if(err)err.scrollIntoView({behavior:'smooth',block:'center'});return}
    
    const d={nationalID:u.nid,title:el('pf-ti').value,firstName:el('pf-fi').value,lastName:el('pf-la').value,phone:el('pf-ph').value,address:el('pf-ad').value,dob:el('pf-do').value,age:el('pf-ag').value,gender:el('pf-ge').value,marital:el('pf-ma').value,nation:el('pf-na').value,religion:el('pf-re').value,occupation:el('pf-oc').value,blood:el('pf-bl').value,weight:el('pf-we').value,height:el('pf-he').value,disease:el('pf-di').value,emerName:el('pf-en').value,emerRelation:el('pf-er').value,emerPhone:el('pf-ep').value};
    
    const r = await apiCall('saveProfile', d);
    if(r && r.status=='success'){
        u.comp=true; u.has=true; u.hn=r.hn; u.name=`${d.title} ${d.firstName} ${d.lastName}`;
        u.old={title:d.title,first:d.firstName,last:d.lastName,phone:d.phone,dob:d.dob,age:d.age,gender:d.gender,marital:d.marital,nation:d.nation,religion:d.religion,occupation:d.occupation,address:d.address,blood:d.blood,weight:d.weight,height:d.height,disease:d.disease,emerName:d.emerName,emerRel:d.emerRelation,emerPhone:d.emerPhone};
        sessionStorage.setItem('m_u',JSON.stringify(u));
        tst('บันทึกสำเร็จ','s'); cl('m-prof'); el('b-c-pr').style.display='block'; dash();
    }
}

function calAge(){const d=el('pf-do').value;el('pf-ag').value=d?Math.abs(new Date(Date.now()-new Date(d).getTime()).getUTCFullYear()-1970):''}
function opAppt(){const d=new Date();d.setDate(d.getDate()+1);el('a-da').min=d.toISOString().split('T')[0];el('m-appt').style.display='flex'}
function opProf(f=false){
    if(u&&u.old){const d=u.old;el('pf-ti').value=d.title;el('pf-fi').value=d.first;el('pf-la').value=d.last;el('pf-ph').value=d.phone;if(d.dob){el('pf-do').value=d.dob;calAge()}el('pf-ge').value=d.gender;el('pf-ma').value=d.marital;el('pf-na').value=d.nation;el('pf-re').value=d.religion;el('pf-oc').value=d.occupation;el('pf-ad').value=d.address;el('pf-bl').value=d.blood;el('pf-we').value=d.weight;el('pf-he').value=d.height;el('pf-di').value=d.disease;el('pf-en').value=d.emerName;el('pf-er').value=d.emerRel;el('pf-ep').value=d.emerPhone}
    else if(u)el('pf-fi').value=u.name.split(' ')[0]||'';
    el('b-c-pr').style.display=f?'none':'block'; el('m-prof').style.display='flex';
}

// เริ่มการทำงานของสคริปต์
init();
