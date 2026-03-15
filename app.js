
"use strict";
/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
/* Stamp/sig globals — must be declared before generatePDF */
let stampB64='', sigFileB64='';
const INR=n=>'\u20B9'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const rawINR=n=>Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const pn=v=>parseFloat(String(v).replace(/[^0-9.]/g,''))||0;
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return[String(d.getDate()).padStart(2,'0'),String(d.getMonth()+1).padStart(2,'0'),d.getFullYear()].join('/')};
const addDays=(s,n)=>{const[dd,mm,yy]=s.split('/').map(Number);const d=new Date(yy,mm-1,dd);d.setDate(d.getDate()+n);return[String(d.getDate()).padStart(2,'0'),String(d.getMonth()+1).padStart(2,'0'),d.getFullYear()].join('/')};
const genNum=()=>{const y=new Date().getFullYear();return`INV-${y}-${String(y+1).slice(2)}-${String(Math.floor(Math.random()*900)+100)}`};
const nowT=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
const getApiKey=()=>localStorage.getItem('inv-api-key')||'';
const setApiKey=k=>localStorage.setItem('inv-api-key',k.trim());

/* ══════════════════════════════════════════════════
   MATRIX RAIN
══════════════════════════════════════════════════ */
(function initMatrix(){
  const canvas=$('matrixCanvas');
  const ctx=canvas.getContext('2d');
  let W,H,cols,drops;
  const chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン∑∆∫Ω'.split('');
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;cols=Math.floor(W/18);drops=Array(cols).fill(1)}
  resize();
  window.addEventListener('resize',resize);
  setInterval(()=>{
    const isDark=document.documentElement.getAttribute('data-theme')==='dark';
    ctx.fillStyle=isDark?'rgba(6,8,15,.06)':'rgba(240,245,255,.06)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle=isDark?'#00e5ff':'#1a56db';
    ctx.font='14px JetBrains Mono,monospace';
    drops.forEach((y,i)=>{
      const c=chars[Math.floor(Math.random()*chars.length)];
      ctx.globalAlpha=Math.random()*.6+.1;
      ctx.fillText(c,i*18,y*18);
      ctx.globalAlpha=1;
      if(y*18>H&&Math.random()>.975) drops[i]=0;
      drops[i]++;
    });
  },55);
})();

/* ══════════════════════════════════════════════════
   MULTI-LANGUAGE SUPPORT
══════════════════════════════════════════════════ */
let currentLang='en';
const LANGS={
  en:{
    save_draft:'Save Draft',ai_email:'✨ AI Email',download:'Download PDF',new_inv:'New',editor:'Editor',preview:'Live Preview',analytics:'Analytics',crm:'Client CRM',drafts:'Drafts',
    your_biz:'Your Business',bill_to:'Bill To',line_items:'Services / Line Items',inv_details:'Invoice Details',summary:'Summary',analytics_title:'Invoice Analytics',crm_title:'Client CRM',crm_hint:'Click a client to load their details',drafts_title:'Saved Drafts',
    biz_name:'Business / Freelancer Name',address:'Address',gstin:'GSTIN',state:'State',email:'Email',phone:'Phone',upi:'UPI ID',bank:'Bank / IFSC (optional)',client_name:'Client / Company Name',gstin_opt:'GSTIN (Optional)',
    ai_autofill:'AI Auto-fill',description:'Description',qty:'Qty',rate:'Rate (₹)',gst_pct:'GST %',amount:'Amount (₹)',action:'Action',add_row:'Add Row',notes:'Notes / Terms & Conditions',ai_terms:'AI Generate Terms',
    gst_rate_lbl:'Default GST Rate (all rows)',subtotal:'Subtotal (excl. GST)',total_gst:'Total GST',grand_total:'Grand Total',igst_toggle:'Use IGST (inter-state)',health:'Invoice Health',download_pdf:'Download Invoice PDF',qr_pay:'QR Pay',
    biz_name_ph:'e.g. Ravi Kumar Design Studio',addr_ph:'Street, City, State – PIN',state_ph:'e.g. Maharashtra',client_ph:'e.g. Acme Technologies Pvt. Ltd.',notes_ph:'Payment due within 15 days.',
  },
  hi:{
    save_draft:'ड्राफ्ट सेव करें',ai_email:'✨ AI ईमेल',download:'PDF डाउनलोड',new_inv:'नया',editor:'संपादक',preview:'पूर्वावलोकन',analytics:'विश्लेषण',crm:'क्लाइंट CRM',drafts:'ड्राफ्ट',
    your_biz:'आपका व्यवसाय',bill_to:'बिल प्राप्तकर्ता',line_items:'सेवाएं / लाइन आइटम',inv_details:'चालान विवरण',summary:'सारांश',analytics_title:'चालान विश्लेषण',crm_title:'क्लाइंट CRM',crm_hint:'विवरण लोड करने के लिए क्लिक करें',drafts_title:'सहेजे गए ड्राफ्ट',
    biz_name:'व्यवसाय / फ्रीलांसर नाम',address:'पता',gstin:'GSTIN',state:'राज्य',email:'ईमेल',phone:'फ़ोन',upi:'UPI ID',bank:'बैंक / IFSC (वैकल्पिक)',client_name:'क्लाइंट / कंपनी का नाम',gstin_opt:'GSTIN (वैकल्पिक)',
    ai_autofill:'AI ऑटो-भरें',description:'विवरण',qty:'मात्रा',rate:'दर (₹)',gst_pct:'GST %',amount:'राशि (₹)',action:'कार्य',add_row:'पंक्ति जोड़ें',notes:'नोट्स / नियम और शर्तें',ai_terms:'✨ AI शर्तें',
    gst_rate_lbl:'डिफ़ॉल्ट GST दर (सभी पंक्तियां)',subtotal:'उप-योग (GST के बिना)',total_gst:'कुल GST',grand_total:'कुल राशि',igst_toggle:'IGST उपयोग करें (अंतर-राज्य)',health:'चालान स्वास्थ्य',download_pdf:'चालान PDF डाउनलोड करें',qr_pay:'QR भुगतान',
    biz_name_ph:'जैसे: रवि कुमार डिजाइन स्टूडियो',addr_ph:'गली, शहर, राज्य – पिन',state_ph:'जैसे: महाराष्ट्र',client_ph:'जैसे: Acme Technologies Pvt. Ltd.',notes_ph:'भुगतान 15 दिनों के भीतर देय है।',
  },
  ta:{
    save_draft:'வரைவை சேமி',ai_email:'✨ AI மின்னஞ்சல்',download:'PDF பதிவிறக்கம்',new_inv:'புதியது',editor:'தொகுப்பாளர்',preview:'நேர முன்னோட்டம்',analytics:'பகுப்பாய்வு',crm:'வாடிக்கையாளர் CRM',drafts:'வரைவுகள்',
    your_biz:'உங்கள் வணிகம்',bill_to:'யாருக்கு பில்',line_items:'சேவைகள் / உருப்படிகள்',inv_details:'விலைப்பட்டியல் விவரங்கள்',summary:'சுருக்கம்',analytics_title:'விலைப்பட்டியல் பகுப்பாய்வு',crm_title:'வாடிக்கையாளர் CRM',crm_hint:'விவரங்களை ஏற்ற கிளிக் செய்யவும்',drafts_title:'சேமிக்கப்பட்ட வரைவுகள்',
    biz_name:'வணிக / ஃப்ரீலான்சர் பெயர்',address:'முகவரி',gstin:'GSTIN',state:'மாநிலம்',email:'மின்னஞ்சல்',phone:'தொலைபேசி',upi:'UPI ID',bank:'வங்கி / IFSC (விருப்பம்)',client_name:'வாடிக்கையாளர் / நிறுவனம்',gstin_opt:'GSTIN (விருப்பம்)',
    ai_autofill:'AI தானாக நிரப்பு',description:'விளக்கம்',qty:'அளவு',rate:'விலை (₹)',gst_pct:'GST %',amount:'தொகை (₹)',action:'செயல்',add_row:'வரிசை சேர்',notes:'குறிப்புகள் / விதிகள்',ai_terms:'✨ AI விதிகள்',
    gst_rate_lbl:'இயல்புநிலை GST விகிதம்',subtotal:'துணை மொத்தம்',total_gst:'மொத்த GST',grand_total:'மொத்த தொகை',igst_toggle:'IGST பயன்படுத்து',health:'விலைப்பட்டியல் ஆரோக்கியம்',download_pdf:'விலைப்பட்டியல் PDF',qr_pay:'QR கட்டணம்',
    biz_name_ph:'எ.கா. ரவி குமார் டிசைன்',addr_ph:'தெரு, நகர், மாநிலம் – பின்',state_ph:'எ.கா. தமிழ்நாடு',client_ph:'எ.கா. Acme Technologies',notes_ph:'கட்டணம் 15 நாட்களுக்குள் செலுத்தவும்.',
  },
  te:{
    save_draft:'డ్రాఫ్ట్ సేవ్',ai_email:'✨ AI ఇమెయిల్',download:'PDF డౌన్లోడ్',new_inv:'కొత్తది',editor:'సంపాదకుడు',preview:'ప్రివ్యూ',analytics:'విశ్లేషణ',crm:'క్లయింట్ CRM',drafts:'డ్రాఫ్ట్లు',
    your_biz:'మీ వ్యాపారం',bill_to:'బిల్ టు',line_items:'సేవలు / లైన్ అంశాలు',inv_details:'ఇన్వాయిస్ వివరాలు',summary:'సారాంశం',analytics_title:'ఇన్వాయిస్ విశ్లేషణ',crm_title:'క్లయింట్ CRM',crm_hint:'వివరాలు లోడ్ చేయడానికి క్లిక్ చేయండి',drafts_title:'సేవ్ చేసిన డ్రాఫ్ట్లు',
    biz_name:'వ్యాపారం / ఫ్రీలాన్సర్ పేరు',address:'చిరునామా',gstin:'GSTIN',state:'రాష్ట్రం',email:'ఇమెయిల్',phone:'ఫోన్',upi:'UPI ID',bank:'బ్యాంక్ / IFSC (ఐచ్ఛికం)',client_name:'క్లయింట్ / కంపెనీ పేరు',gstin_opt:'GSTIN (ఐచ్ఛికం)',
    ai_autofill:'AI ఆటో-పూరించు',description:'వివరణ',qty:'పరిమాణం',rate:'రేటు (₹)',gst_pct:'GST %',amount:'మొత్తం (₹)',action:'చర్య',add_row:'వరుస జోడించు',notes:'గమనికలు / నిబంధనలు',ai_terms:'✨ AI నిబంధనలు',
    gst_rate_lbl:'డిఫాల్ట్ GST రేటు',subtotal:'ఉప-మొత్తం',total_gst:'మొత్తం GST',grand_total:'గ్రాండ్ టోటల్',igst_toggle:'IGST వాడు',health:'ఇన్వాయిస్ ఆరోగ్యం',download_pdf:'ఇన్వాయిస్ PDF',qr_pay:'QR చెల్లింపు',
    biz_name_ph:'ఉదా: రవి కుమార్ డిజైన్',addr_ph:'వీధి, నగరం, రాష్ట్రం – పిన్',state_ph:'ఉదా: తెలంగాణ',client_ph:'ఉదా: Acme Technologies',notes_ph:'చెల్లింపు 15 రోజులలోపు.',
  }
};

function setLang(lang){
  currentLang=lang;
  document.querySelectorAll('.lang-btn').forEach(b=>{b.classList.toggle('active',b.textContent.trim()===({en:'EN',hi:'हि',ta:'த',te:'తె'}[lang]))});
  const T=LANGS[lang]||LANGS.en;
  // Update all [data-t] elements
  document.querySelectorAll('[data-t]').forEach(el=>{
    const key=el.getAttribute('data-t');
    if(T[key]!==undefined) el.textContent=T[key];
  });
  // Update placeholders
  document.querySelectorAll('[data-ph]').forEach(el=>{
    const key=el.getAttribute('data-ph');
    if(T[key]) el.placeholder=T[key];
  });
  // Update thead th[data-t]
  document.querySelectorAll('th[data-t]').forEach(el=>{
    const key=el.getAttribute('data-t');
    if(T[key]) el.textContent=T[key];
  });
}

/* ══════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════ */
let theme=localStorage.getItem('inv-theme')||'dark';
function applyTheme(t){document.documentElement.setAttribute('data-theme',t);$('themeIco').textContent=t==='dark'?'🌙':'☀️';localStorage.setItem('inv-theme',t)}
function toggleTheme(){theme=theme==='dark'?'light':'dark';applyTheme(theme)}
applyTheme(theme);

/* ══════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════ */
/* switchTab() — defined below with all tabs */

/* Clock */
setInterval(()=>{$('sbTime').textContent=nowT()},30000);
$('sbTime').textContent=nowT();

/* ══════════════════════════════════════════════════
   ROW MANAGEMENT
══════════════════════════════════════════════════ */
let rowId=0;
function addRow(desc='',qty=1,rate='',gst=null){
  rowId++;const id=rowId;
  const dGST=gst!==null?String(gst):(document.querySelector('.gst-box select')?.value||'18');
  const tr=document.createElement('tr');tr.id=`row-${id}`;
  tr.innerHTML=`
    <td class="cn" style="text-align:center;color:var(--tx3);font-family:'JetBrains Mono',monospace;font-size:11px"></td>
    <td class="cd">
      <div style="position:relative">
        <input class="fin" type="text" placeholder="Type service…" value="${desc}" oninput="sp();showRateHint(${id},this.value);acSearch(${id},this.value)" onkeydown="acKey(event,${id})" onfocus="acSearch(${id},this.value)" onblur="setTimeout(()=>acHide(${id}),300)" autocomplete="off" style="width:100%"/>
        <div class="ac-drop" id="ac-${id}" style="position:absolute;top:100%;left:0;right:0;z-index:9999"></div>
        <div id="rh-${id}" class="rate-hint" style="position:absolute;bottom:-20px;left:8px;display:none;z-index:10" onclick="applyRate(${id})"></div>
      </div>
    </td>
    <td class="cq"><input class="fin" type="number" min="0" step="0.01" value="${qty}" style="text-align:center" oninput="calcRow(${id});recalc();sp()"/></td>
    <td class="cr"><input class="fin" type="number" min="0" step="0.01" placeholder="0.00" value="${rate}" style="text-align:right" oninput="calcRow(${id});recalc();sp()"/></td>
    <td class="cg"><select class="fsel" style="text-align:center;font-size:12.5px" onchange="calcRow(${id});recalc();sp()">
      <option value="0" ${dGST==='0'?'selected':''}>0%</option>
      <option value="5" ${dGST==='5'?'selected':''}>5%</option>
      <option value="12" ${dGST==='12'?'selected':''}>12%</option>
      <option value="18" ${dGST==='18'?'selected':''}>18%</option>
      <option value="28" ${dGST==='28'?'selected':''}>28%</option>
    </select></td>
    <td class="amt-c" id="amt-${id}">${INR(0)}</td>
    <td class="act-c"><button class="btn-rm" onclick="removeRow(${id})">
      <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Remove
    </button></td>`;
  $('itemsBody').appendChild(tr);calcRow(id);updateNums();recalc();
}
function removeRow(id){$(`row-${id}`)?.remove();updateNums();recalc();sp()}
function updateNums(){
  const rows=document.querySelectorAll('#itemsBody tr');
  rows.forEach((r,i)=>{r.querySelector('td:first-child').textContent=i+1});
  const n=rows.length;
  $('rowCount').textContent=n===0?'No items':n===1?'1 item':`${n} items`;
  $('sbItems').textContent=n;
  $('draftDot').style.display=localStorage.getItem('inv-drafts')?'':'none';
}
function calcRow(id){
  const tr=$(`row-${id}`);if(!tr)return;
  const ni=tr.querySelectorAll('input[type="number"]');
  const amt=pn(ni[0]?.value)*pn(ni[1]?.value);
  const c=$(`amt-${id}`);if(c)c.textContent=INR(amt);return amt;
}
function applyGlobalGST(){
  const v=document.querySelector('.gst-box select').value;
  document.querySelectorAll('#itemsBody tr select').forEach(s=>{s.value=v});
  recalc();sp();
}

/* ══════════════════════════════════════════════════
   AI RATE SUGGESTER — inline hints while typing
══════════════════════════════════════════════════ */
const RATE_DB={
  'logo':['₹5,000–12,000','Logo design, 2 revisions'],
  'web':['₹15,000–60,000','Website design & development'],
  'seo':['₹8,000–25,000/mo','SEO optimization services'],
  'app':['₹50,000–2,00,000','Mobile app development'],
  'content':['₹2,000–8,000','Content writing per article'],
  'video':['₹5,000–20,000','Video editing / production'],
  'social':['₹8,000–20,000/mo','Social media management'],
  'ui':['₹10,000–40,000','UI/UX design project'],
  'consult':['₹2,000–5,000/hr','Consulting services'],
  'photo':['₹5,000–25,000','Photography services'],
  'brand':['₹20,000–80,000','Branding package'],
  'copy':['₹3,000–10,000','Copywriting services'],
  'data':['₹500–2,000/hr','Data entry / analysis'],
  'account':['₹3,000–15,000/mo','Accounting & bookkeeping'],
  'tax':['₹2,000–10,000','Tax filing services'],
  'legal':['₹5,000–30,000','Legal documentation'],
  'train':['₹2,000–8,000/session','Training / coaching'],
  'market':['₹15,000–50,000/mo','Digital marketing'],
  'print':['₹3,000–12,000','Print design services'],
  'illustr':['₹5,000–20,000','Illustration services'],
};
let rateHintMap={};
function showRateHint(id,val){
  const v=val.toLowerCase();
  const match=Object.keys(RATE_DB).find(k=>v.includes(k));
  const hint=$(`rh-${id}`);
  if(!hint) return;
  if(match&&val.length>3){
    const[range,desc]=RATE_DB[match];
    hint.textContent=`💡 Market rate: ${range}`;
    hint.style.display='block';
    rateHintMap[id]={range,desc};
  } else {
    hint.style.display='none';
    delete rateHintMap[id];
  }
}
function applyRate(id){
  const data=rateHintMap[id];if(!data) return;
  // Extract lower bound number
  const nums=data.range.match(/[\d,]+/g);
  if(!nums) return;
  const num=parseInt(nums[0].replace(/,/g,''));
  const tr=$(`row-${id}`);if(!tr) return;
  const rateIn=tr.querySelectorAll('input[type="number"]')[1];
  if(rateIn){rateIn.value=num;calcRow(id);recalc();sp()}
  $(`rh-${id}`).style.display='none';
  showToast('💰',`Rate set to ₹${num.toLocaleString('en-IN')} (market suggestion)`,'ai');
}

/* ══════════════════════════════════════════════════
   HEALTH SCORE
══════════════════════════════════════════════════ */
function computeHealth(){
  const d=collectData();
  let score=0;const tips=[];
  if(d.sellerName){score+=15}else tips.push({e:'⚠️',t:'Add your business name'});
  if(d.sellerGSTIN&&d.sellerGSTIN.length===15){score+=15}else tips.push({e:'⚠️',t:'Add valid GSTIN (15 chars)'});
  if(d.clientName){score+=15}else tips.push({e:'⚠️',t:'Add client name'});
  if(d.items.length>0){score+=15}else tips.push({e:'⚠️',t:'Add at least one line item'});
  if(d.dueDate){score+=10}else tips.push({e:'💡',t:'Set a due date'});
  if(d.note){score+=10}else tips.push({e:'💡',t:'Add payment terms'});
  if(d.sub>0){score+=10}else tips.push({e:'⚠️',t:'No amounts entered'});
  if(d.sellerUPI||d.sellerBank){score+=10}else tips.push({e:'💡',t:'Add UPI/bank for easy payment'});
  const fill=$('healthFill');const pct=$('healthPct');const tipsEl=$('healthTips');
  fill.style.width=score+'%';
  fill.style.background=score>=80?'var(--ne3)':score>=50?'var(--ac)':'var(--rd)';
  pct.textContent=score+'%';
  tipsEl.innerHTML=tips.slice(0,3).map(t=>`<div class="health-tip"><span>${t.e}</span><span style="font-size:10.5px;color:var(--tx3)">${t.t}</span></div>`).join('');
}

/* ══════════════════════════════════════════════════
   RECALCULATE + ANIMATED COUNTERS
══════════════════════════════════════════════════ */
function anim(id,txt){const el=$(id);if(!el||el.textContent===txt)return;el.classList.remove('counting');void el.offsetWidth;el.classList.add('counting');el.textContent=txt;setTimeout(()=>el.classList.remove('counting'),350)}
/* recalc() — defined below with discount support */

/* ══════════════════════════════════════════════════
   COLLECT DATA
══════════════════════════════════════════════════ */
function collectData(){
  const rows=document.querySelectorAll('#itemsBody tr');
  const items=[];let sub=0,gst=0;
  rows.forEach((tr,i)=>{
    const ni=tr.querySelectorAll('input[type="number"]');
    const desc=tr.querySelector('input[type="text"]')?.value.trim()||`Item ${i+1}`;
    const qty=pn(ni[0]?.value),rate=pn(ni[1]?.value),gstPct=pn(tr.querySelector('select')?.value);
    const amt=qty*rate,gstAmt=amt*(gstPct/100);
    sub+=amt;gst+=gstAmt;
    items.push({desc,qty,rate,gstPct,amt,gstAmt,total:amt+gstAmt});
  });
  return{
    sellerName:$('sellerName')?.value.trim()||'Your Business',
    sellerAddr:$('sellerAddress')?.value.trim()||'',
    sellerGSTIN:$('sellerGSTIN')?.value.trim().toUpperCase()||'',
    sellerState:$('sellerState')?.value.trim()||'',
    sellerEmail:$('sellerEmail')?.value.trim()||'',
    sellerPhone:$('sellerPhone')?.value.trim()||'',
    sellerUPI:$('sellerUPI')?.value.trim()||'',
    sellerBank:$('sellerBank')?.value.trim()||'',
    clientName:$('clientName')?.value.trim()||'Client',
    clientAddr:$('clientAddress')?.value.trim()||'',
    clientGSTIN:$('clientGSTIN')?.value.trim().toUpperCase()||'',
    clientState:$('clientState')?.value.trim()||'',
    invNum:$('invoiceNumber')?.value.trim()||'INV-0001',
    invDate:$('invoiceDate')?.value.trim()||today(),
    dueDate:$('dueDate')?.value.trim()||'',
    note:$('invoiceNote')?.value.trim()||'',
    isIGST:$('igstToggle')?.checked||false,
    items,sub,gst,total:sub+gst
  };
}
function getRawRows(){return Array.from(document.querySelectorAll('#itemsBody tr')).map(tr=>{const ni=tr.querySelectorAll('input[type="number"]');return{desc:tr.querySelector('input[type="text"]')?.value||'',qty:ni[0]?.value||1,rate:ni[1]?.value||'',gst:tr.querySelector('select')?.value||'18'}})}

/* ══════════════════════════════════════════════════
   DRAFTS CRUD
══════════════════════════════════════════════════ */
function saveDraft(){
  const d=collectData();
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  const idx=drafts.findIndex(x=>x.invNum===d.invNum);
  const entry={...d,savedAt:new Date().toISOString(),rowsRaw:getRawRows()};
  if(idx>=0)drafts[idx]=entry;else drafts.unshift(entry);
  localStorage.setItem('inv-drafts',JSON.stringify(drafts.slice(0,30)));
  $('draftDot').style.display='';$('autosaveLbl').textContent=`Saved · ${nowT()}`;
  showToast('✓','Draft saved: '+d.invNum,'');
}
function saveDraftSilent(){
  const d=collectData();
  if(!d.sellerName&&!d.clientName&&!d.items.length)return;
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  const idx=drafts.findIndex(x=>x.invNum===d.invNum);
  const entry={...d,savedAt:new Date().toISOString(),rowsRaw:getRawRows()};
  if(idx>=0)drafts[idx]=entry;else drafts.unshift(entry);
  localStorage.setItem('inv-drafts',JSON.stringify(drafts.slice(0,30)));
  $('autosaveLbl').textContent=`Auto-saved · ${nowT()}`;$('draftDot').style.display='';
}
function loadDraft(d){
  $('sellerName').value=d.sellerName||'';$('sellerAddress').value=d.sellerAddr||'';
  $('sellerGSTIN').value=d.sellerGSTIN||'';$('sellerState').value=d.sellerState||'';
  $('sellerEmail').value=d.sellerEmail||'';$('sellerPhone').value=d.sellerPhone||'';
  $('sellerUPI').value=d.sellerUPI||'';$('sellerBank').value=d.sellerBank||'';
  $('clientName').value=d.clientName||'';$('clientAddress').value=d.clientAddr||'';
  $('clientGSTIN').value=d.clientGSTIN||'';$('clientState').value=d.clientState||'';
  $('invoiceNumber').value=d.invNum||genNum();$('invoiceDate').value=d.invDate||today();
  $('dueDate').value=d.dueDate||'';$('invoiceNote').value=d.note||'';
  $('igstToggle').checked=d.isIGST||false;
  $('itemsBody').innerHTML='';rowId=0;
  (d.rowsRaw||[]).forEach(r=>addRow(r.desc,r.qty,r.rate,r.gst));
  if(!d.rowsRaw?.length)addRow('',1,'');
  recalc();switchTab('editor');showToast('✓','Draft loaded: '+d.invNum,'');
}
function renderDrafts(){
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  const el=$('draftContent');
  if(!drafts.length){el.innerHTML='<div class="no-drafts">No saved drafts yet.</div>';return}
  el.innerHTML='<div class="draft-list">'+drafts.map((d,i)=>`
    <div class="draft-item" onclick='loadDraft(${JSON.stringify(d).replace(/'/g,"&#39;")})'>
      <div><div class="d-name">${d.invNum}</div><div class="d-meta">${d.clientName} · ${INR(d.total)} · ${new Date(d.savedAt).toLocaleDateString('en-IN')}</div></div>
      <button class="d-del" onclick="event.stopPropagation();delDraft(${i})">Delete</button>
    </div>`).join('')+'</div>';
}
function delDraft(i){
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  drafts.splice(i,1);localStorage.setItem('inv-drafts',JSON.stringify(drafts));
  renderDrafts();if(!drafts.length)$('draftDot').style.display='none';
}

/* ══════════════════════════════════════════════════
   CLIENT CRM
══════════════════════════════════════════════════ */
function saveCRM(){
  const name=($('clientName')?.value||'').trim();
  if(!name){showToast('⚠️','Enter client name first','warn');return}
  const clients=JSON.parse(localStorage.getItem('inv-crm')||'[]');
  const entry={
    name,addr:$('clientAddress')?.value||'',
    gstin:$('clientGSTIN')?.value||'',state:$('clientState')?.value||'',
    savedAt:new Date().toISOString()
  };
  const idx=clients.findIndex(c=>c.name.toLowerCase()===name.toLowerCase());
  if(idx>=0)clients[idx]=entry;else clients.unshift(entry);
  localStorage.setItem('inv-crm',JSON.stringify(clients.slice(0,50)));
  $('crmDot').style.display='';
  showToast('👥','Client saved to CRM: '+name,'ai');
}
function loadCRM(c){
  $('clientName').value=c.name||'';$('clientAddress').value=c.addr||'';
  $('clientGSTIN').value=c.gstin||'';$('clientState').value=c.state||'';
  sp();checkDup();switchTab('editor');
  showToast('👥','Client loaded: '+c.name,'');
}
function renderCRM(){
  const clients=JSON.parse(localStorage.getItem('inv-crm')||'[]');
  const el=$('crmContent');
  if(!clients.length){el.innerHTML='<div class="crm-empty">No saved clients yet. Fill in client details and click 💾 to save.</div>';return}
  el.innerHTML='<div class="crm-grid">'+clients.map((c,i)=>`
    <div class="crm-card" onclick='loadCRM(${JSON.stringify(c).replace(/'/g,"&#39;")})'>
      <div class="crm-name">${c.name}</div>
      <div class="crm-meta">${c.state||'—'} · ${c.gstin?c.gstin.slice(0,8)+'…':'No GSTIN'}</div>
      <button class="crm-del" onclick="event.stopPropagation();delCRM(${i})">✕</button>
    </div>`).join('')+'</div>';
}
function delCRM(i){
  const clients=JSON.parse(localStorage.getItem('inv-crm')||'[]');
  clients.splice(i,1);localStorage.setItem('inv-crm',JSON.stringify(clients));
  renderCRM();if(!clients.length)$('crmDot').style.display='none';
}

/* ══════════════════════════════════════════════════
   ANALYTICS DASHBOARD
══════════════════════════════════════════════════ */
let charts={};
/* renderAnalytics() — defined below with full KPI support */

/* ══════════════════════════════════════════════════
   QR CODE (UPI)
══════════════════════════════════════════════════ */
function showQRModal(){
  const d=collectData();
  const upi=d.sellerUPI;
  if(!upi){showToast('⚠️','Add your UPI ID in the business details section first','warn');return}
  const upiStr=`upi://pay?pa=${upi}&pn=${encodeURIComponent(d.sellerName)}&am=${d.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Invoice '+d.invNum)}`;
  $('qrOutput').innerHTML='';
  $('qrSub').textContent=`${upi} · ${INR(d.total)}`;
  new QRCode($('qrOutput'),{text:upiStr,width:180,height:180,colorDark:'#00e5ff',colorLight:'#0f1520',correctLevel:QRCode.CorrectLevel.H});
  $('qrModal').classList.add('open');
}
function closeQR(){$('qrModal').classList.remove('open')}

/* ══════════════════════════════════════════════════
   DUPLICATE DETECTOR
══════════════════════════════════════════════════ */
function checkDup(){
  const name=($('clientName')?.value||'').toLowerCase();
  const num=($('invoiceNumber')?.value||'').trim();
  if(!name){$('dupBanner').classList.remove('show');return}
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  const dups=drafts.filter(d=>d.clientName?.toLowerCase()===name&&d.invNum!==num);
  if(dups.length){
    $('dupMsg').textContent=`⚠️ ${dups.length} existing invoice(s) for "${dups[0].clientName}" — ${dups.map(d=>`${d.invNum} (${INR(d.total)})`).join(', ')}`;
    $('dupBanner').classList.add('show');
  } else $('dupBanner').classList.remove('show');
}

/* ══════════════════════════════════════════════════
   LIVE PREVIEW
══════════════════════════════════════════════════ */
let prevTimer=null;
function sp(){clearTimeout(prevTimer);prevTimer=setTimeout(()=>{if($('panel-preview').classList.contains('active'))refreshPreview()},380);$('sbNum').textContent=$('invoiceNumber')?.value||'—'}
function refreshPreview(){
  const d=collectData();
  const blob=new Blob([buildPreviewHTML(d)],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  $('previewFrame').src=url;
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function buildPreviewHTML(d){
  const rows=d.items.map((it,i)=>`<tr style="background:${i%2?'#f8fafc':'#fff'}"><td style="padding:9px 10px;text-align:center;color:#94a3b8;font-size:12px">${i+1}</td><td style="padding:9px 10px;font-size:13px">${it.desc}</td><td style="padding:9px 10px;text-align:center;font-size:13px">${it.qty%1===0?it.qty:it.qty.toFixed(2)}</td><td style="padding:9px 10px;text-align:right;font-size:13px">₹${rawINR(it.rate)}</td><td style="padding:9px 10px;text-align:center;font-size:13px">${it.gstPct}%</td><td style="padding:9px 10px;text-align:right;font-size:13px">₹${rawINR(it.gstAmt)}</td><td style="padding:9px 10px;text-align:right;font-weight:700;font-size:13px;color:#0a1628">₹${rawINR(it.total)}</td></tr>`).join('');
  const gstL=d.isIGST?`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">IGST</span><span style="font-weight:600">₹${rawINR(d.gst)}</span></div>`:`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">CGST</span><span style="font-weight:600">₹${rawINR(d.gst/2)}</span></div><div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">SGST</span><span style="font-weight:600">₹${rawINR(d.gst/2)}</span></div>`;
  return`<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body><div style="background:#06080f;padding:30px 38px 26px;position:relative"><div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#00e5ff,#8b5cf6)"></div><table style="width:100%"><tr><td style="vertical-align:top"><div style="display:flex;align-items:center;gap:12px;margin-bottom:7px">${getBPLogo()?`<img src="${getBPLogo()}" style="width:48px;height:48px;border-radius:8px;object-fit:contain;background:#fff;border:1px solid #223"/>`:''}
<div style="font-size:19px;font-weight:700;color:#fff">${d.sellerName}</div></div><div style="font-size:9px;color:#94a3b8;line-height:1.7">${d.sellerAddr?d.sellerAddr+'<br>':''}${d.sellerState?'State: '+d.sellerState+'<br>':''}${d.sellerGSTIN?'GSTIN: '+d.sellerGSTIN+'<br>':''}${d.sellerEmail?d.sellerEmail+'<br>':''}${d.sellerPhone?d.sellerPhone:''}</div></td><td style="text-align:right;vertical-align:top"><div style="font-size:21px;font-weight:700;color:#f59e0b;margin-bottom:7px">TAX INVOICE</div><div style="font-size:10px;color:#94a3b8;line-height:1.9;font-family:monospace">${d.invNum}<br>Date: ${d.invDate}<br>${d.dueDate?'Due: '+d.dueDate:''}</div></td></tr></table></div><div style="padding:22px 38px"><div style="background:#f8fafc;border-radius:8px;padding:15px 18px;margin-bottom:22px;display:inline-block;min-width:250px"><div style="font-size:9px;font-weight:700;letter-spacing:.6px;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">Bill To</div><div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:5px">${d.clientName}</div><div style="font-size:10px;color:#64748b;line-height:1.8">${d.clientAddr?d.clientAddr+'<br>':''}${d.clientState?'State: '+d.clientState+'<br>':''}${d.clientGSTIN?'GSTIN: '+d.clientGSTIN:''}</div></div><table style="width:100%;border-collapse:collapse;margin-bottom:18px"><thead><tr style="background:#06080f"><th style="padding:9px;color:#fff;font-size:10px;letter-spacing:.5px;text-align:center;border-radius:6px 0 0 6px">#</th><th style="padding:9px;color:#fff;font-size:10px;text-align:left">Description</th><th style="padding:9px;color:#fff;font-size:10px;text-align:center">Qty</th><th style="padding:9px;color:#fff;font-size:10px;text-align:right">Rate</th><th style="padding:9px;color:#fff;font-size:10px;text-align:center">GST%</th><th style="padding:9px;color:#fff;font-size:10px;text-align:right">GST Amt</th><th style="padding:9px;color:#fff;font-size:10px;text-align:right;border-radius:0 6px 6px 0">Total</th></tr></thead><tbody>${rows}</tbody></table><div style="display:flex;justify-content:flex-end"><div style="min-width:230px"><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">Subtotal</span><span style="font-weight:600">₹${rawINR(d.sub)}</span></div>${gstL}<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px"><span style="color:#64748b">Total GST</span><span style="font-weight:600">₹${rawINR(d.gst)}</span></div><div style="background:#06080f;border-radius:8px;padding:12px 15px;margin-top:7px;display:flex;justify-content:space-between;align-items:center"><span style="color:#fff;font-weight:700;font-size:15px">Grand Total</span><span style="color:#f59e0b;font-weight:700;font-size:19px">₹${rawINR(d.total)}</span></div></div></div>${d.note?`<div style="margin-top:20px;padding:12px 15px;background:#f8fafc;border-radius:8px;border-left:3px solid #00e5ff"><div style="font-size:9px;font-weight:700;letter-spacing:.5px;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">Notes</div><div style="font-size:12px;color:#475569">${d.note}</div></div>`:''}</div><div style="background:#06080f;padding:13px 38px;text-align:center;font-size:9px;color:#4a6080">Computer-generated invoice · InvoiceIN AI Ultra · Generated ${today()}</div></body></html>`;
}

/* ══════════════════════════════════════════════════
   PDF THEME ENGINE
══════════════════════════════════════════════════ */
let activePDFTheme='neon';

// Theme definitions — each has full color palette
const PDF_THEMES={
  neon:{
    name:'Neon Dark',
    headerBg:[6,8,15],headerBg2:[10,14,24],
    accentA:[0,229,255],accentB:[139,92,246],
    titleColor:[245,158,11],
    bodyBg:[255,255,255],rowAlt:[248,250,252],
    borderColor:[220,228,240],
    textMain:[20,30,50],textMuted:[90,110,140],textLight:[160,190,220],
    totalBg:[6,8,15],totalText:[255,255,255],totalAmt:[245,158,11],
    footerBg:[6,8,15],footerText:[80,110,150],
    billBoxBg:[241,245,249],
    stripe:'dual',   // dual = two-color top stripe
  },
  minimal:{
    name:'Minimal White',
    headerBg:[248,250,255],headerBg2:[235,242,255],
    accentA:[26,86,219],accentB:[26,86,219],
    titleColor:[26,86,219],
    bodyBg:[255,255,255],rowAlt:[250,252,255],
    borderColor:[210,220,240],
    textMain:[15,23,42],textMuted:[70,90,130],textLight:[100,130,180],
    totalBg:[26,86,219],totalText:[255,255,255],totalAmt:[255,255,255],
    footerBg:[235,242,255],footerText:[100,130,180],
    billBoxBg:[235,242,255],
    stripe:'solid',
    headerTextDark:true,  // dark text on light header
  },
  gold:{
    name:'Luxury Gold',
    headerBg:[14,10,2],headerBg2:[24,18,4],
    accentA:[245,158,11],accentB:[217,119,6],
    titleColor:[245,158,11],
    bodyBg:[255,255,255],rowAlt:[255,252,245],
    borderColor:[230,215,185],
    textMain:[30,20,5],textMuted:[110,85,40],textLight:[180,150,90],
    totalBg:[14,10,2],totalText:[255,255,255],totalAmt:[245,158,11],
    footerBg:[14,10,2],footerText:[120,95,50],
    billBoxBg:[255,250,235],
    stripe:'solid',
  },
  forest:{
    name:'Forest Green',
    headerBg:[4,14,10],headerBg2:[7,22,16],
    accentA:[16,185,129],accentB:[5,150,105],
    titleColor:[16,185,129],
    bodyBg:[255,255,255],rowAlt:[245,255,250],
    borderColor:[200,230,215],
    textMain:[5,30,20],textMuted:[50,110,80],textLight:[100,160,130],
    totalBg:[4,14,10],totalText:[255,255,255],totalAmt:[16,185,129],
    footerBg:[4,14,10],footerText:[60,130,100],
    billBoxBg:[235,255,245],
    stripe:'dual',
  },
  corporate:{
    name:'Corporate Blue',
    headerBg:[12,28,60],headerBg2:[18,40,85],
    accentA:[59,130,246],accentB:[37,99,235],
    titleColor:[147,197,253],
    bodyBg:[255,255,255],rowAlt:[248,250,255],
    borderColor:[210,225,248],
    textMain:[15,25,55],textMuted:[70,95,155],textLight:[130,160,210],
    totalBg:[12,28,60],totalText:[255,255,255],totalAmt:[147,197,253],
    footerBg:[12,28,60],footerText:[90,120,185],
    billBoxBg:[235,242,255],
    stripe:'solid',
  }
};

function selectPDFTheme(tid){
  activePDFTheme=tid;
  document.querySelectorAll('.tp-swatch').forEach(s=>s.classList.toggle('active',s.getAttribute('data-tid')===tid));
  $('tpNameLbl').textContent=PDF_THEMES[tid]?.name||tid;
  showToast('🎨','Theme: '+PDF_THEMES[tid]?.name,'ai');
}

/* ── Themed PDF builder ── */
function buildThemedPDF(d,sigDataURL){
  const T=PDF_THEMES[activePDFTheme]||PDF_THEMES.neon;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();

  // ── HEADER ──
  doc.setFillColor(...T.headerBg);doc.rect(0,0,W,112,'F');

  // Top stripe(s)
  if(T.stripe==='dual'){
    doc.setFillColor(...T.accentA);doc.rect(0,0,W/2,3.5,'F');
    doc.setFillColor(...T.accentB);doc.rect(W/2,0,W/2,3.5,'F');
  } else {
    doc.setFillColor(...T.accentA);doc.rect(0,0,W,3.5,'F');
  }

  // Embed business profile logo if available
  const bpLogo = getBPLogo();
  let nameX = 38;  // x-position for business name text
  if(bpLogo){
    try{
      doc.addImage(bpLogo,'',10,10,68,68);
      nameX = 88;  // shift right to make room for logo
    }catch(e){}
  }

  // Business name
  const nameColor=T.headerTextDark?T.textMain:T.totalText;
  doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor(...nameColor);
  doc.text(d.sellerName,nameX,44);

  // Business details
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...T.textLight);
  let sy=60;
  if(d.sellerAddr){const l=doc.splitTextToSize(d.sellerAddr,240-nameX+38);doc.text(l,nameX,sy);sy+=l.length*11+1}
  if(d.sellerState){doc.text('State: '+d.sellerState,nameX,sy);sy+=11}
  if(d.sellerGSTIN){doc.text('GSTIN: '+d.sellerGSTIN,nameX,sy);sy+=11}
  if(d.sellerEmail){doc.text(d.sellerEmail,nameX,sy);sy+=11}
  if(d.sellerPhone){doc.text(d.sellerPhone,nameX,sy)}

  // TAX INVOICE title
  doc.setFont('helvetica','bold');doc.setFontSize(22);doc.setTextColor(...T.titleColor);
  doc.text('TAX INVOICE',W-38,46,{align:'right'});

  // Invoice meta right
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...T.textLight);
  doc.text('Invoice #  '+d.invNum,W-38,63,{align:'right'});
  doc.text('Date: '+d.invDate,W-38,76,{align:'right'});
  if(d.dueDate)doc.text('Due: '+d.dueDate,W-38,90,{align:'right'});

  // ── BILL TO BOX ──
  let cY=128;
  doc.setFillColor(...T.billBoxBg);doc.roundedRect(28,cY-9,255,94,4,4,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...T.textMuted);doc.text('BILL TO',38,cY+3);
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...T.textMain);doc.text(d.clientName,38,cY+19);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...T.textMuted);
  let cy=cY+34;
  if(d.clientAddr){const cl=doc.splitTextToSize(d.clientAddr,225);doc.text(cl,38,cy);cy+=cl.length*11}
  if(d.clientState){doc.text('State: '+d.clientState,38,cy);cy+=11}
  if(d.clientGSTIN){doc.text('GSTIN: '+d.clientGSTIN,38,cy)}

  // ── LINE ITEMS TABLE ──
  // Use 'Rs.' prefix since jsPDF helvetica doesn't render ₹ (shows as ¹)
  const RS = 'Rs.';
  const WHITE=[255,255,255];
  const tb=d.items.map((it,i)=>[
    i+1,
    it.desc,
    it.qty%1===0?String(it.qty):it.qty.toFixed(2),
    RS+rawINR(it.rate),
    it.gstPct+'%',
    RS+rawINR(it.gstAmt),
    RS+rawINR(it.total)
  ]);
  doc.autoTable({
    startY:238, margin:{left:28,right:28},
    head:[['#','Description','Qty','Rate (Rs.)','GST%','GST Amt','Total']],
    body:tb,
    styles:{font:'helvetica',fontSize:9,cellPadding:6,textColor:T.textMain,lineColor:T.borderColor,lineWidth:0.5,overflow:'linebreak'},
    headStyles:{fillColor:T.headerBg,textColor:T.headerTextDark?T.textMain:WHITE,fontStyle:'bold',fontSize:8.5},
    alternateRowStyles:{fillColor:T.rowAlt},
    columnStyles:{
      0:{cellWidth:20,  halign:'center'},
      1:{cellWidth:'auto'},
      2:{cellWidth:28,  halign:'center'},
      3:{cellWidth:72,  halign:'right'},   // wider for Rs.1,00,000.00
      4:{cellWidth:30,  halign:'center'},
      5:{cellWidth:68,  halign:'right'},
      6:{cellWidth:76,  halign:'right', fontStyle:'bold'}
    }
  });

  const aft=doc.lastAutoTable.finalY+20;
  const bx=W-226,bw=196;let by=aft;

  function drow(lbl,val,bold=false,hl=false){
    if(hl){
      doc.setFillColor(...T.totalBg);
      doc.roundedRect(bx-7,by-13,bw+14,22,3,3,'F');
      doc.setTextColor(...T.totalText);
    } else doc.setTextColor(...T.textMain);
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(bold?10.5:9.5);
    doc.text(lbl,bx,by);doc.text(val,bx+bw,by,{align:'right'});by+=22;
  }

  drow('Subtotal (excl. GST)', RS+rawINR(d.sub));
  if(d.isIGST) drow('IGST', RS+rawINR(d.gst));
  else{ drow('CGST', RS+rawINR(d.gst/2)); drow('SGST', RS+rawINR(d.gst/2)); }
  drow('Total GST', RS+rawINR(d.gst));
  doc.setDrawColor(...T.accentA);doc.setLineWidth(0.8);
  doc.line(bx-7,by-6,bx+bw+7,by-6);by+=6;
  drow('GRAND TOTAL', RS+rawINR(d.total),true,true);

  // Grand Total in accent color
  doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.setTextColor(...T.totalAmt);
  doc.text(RS+rawINR(d.total),bx+bw,by-22,{align:'right'});

  // ── NOTES ──
  if(d.note){
    const ny=Math.max(aft,by)+18;
    // Max notes box bottom = H-200 so it doesn't push into signature/QR area
    const maxBottom = H-205;
    if(ny < maxBottom){
      const noteLines = doc.splitTextToSize(d.note, W-80);
      const noteH = Math.min(noteLines.length*12+24, maxBottom-ny);
      doc.setFillColor(...T.billBoxBg);
      doc.roundedRect(28,ny-8,W-56,noteH,4,4,'F');
      doc.setFillColor(...T.accentA);
      doc.rect(28,ny-8,3,noteH,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...T.textMuted);
      doc.text('NOTES / TERMS',36,ny+4);
      doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...T.textMain);
      // Clip notes text to available height
      const maxLines = Math.floor((noteH-20)/12);
      const visibleLines = noteLines.slice(0,maxLines);
      doc.text(visibleLines,36,ny+16);
    }
  }

  // ── BOTTOM SECTION LAYOUT ──
  // Page bottom: footer=36pt. Safe area ends at H-44.
  // Bottom section height needed: ~145pt
  // So bottom section starts at: H-44-145 = H-189
  const BOTTOM_Y = H - 195; // top of the entire bottom section

  // ── SIGNATURE (right side) ──
  // Occupies right half: x from W/2+20 to W-28
  if(sigDataURL){
    const sx = W/2 + 20;           // left edge of signature area
    const sW = W - sx - 28;        // width available
    const sCX = sx + sW/2;         // center X
    // Signature image
    try{ doc.addImage(sigDataURL,'PNG', sx, BOTTOM_Y, sW, 44); }catch(e){}
    // Underline
    doc.setDrawColor(...T.borderColor);
    doc.setLineWidth(0.5);
    doc.line(sx, BOTTOM_Y+52, sx+sW, BOTTOM_Y+52);
    // Labels
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...T.textMuted);
    doc.text('Authorised Signatory', sCX, BOTTOM_Y+63, {align:'center'});
    doc.text(d.sellerName,           sCX, BOTTOM_Y+74, {align:'center'});
  } else {
    // No signature image — just draw the line and labels
    const sx = W/2 + 20;
    const sW = W - sx - 28;
    const sCX = sx + sW/2;
    doc.setDrawColor(...T.borderColor);
    doc.setLineWidth(0.5);
    doc.line(sx, BOTTOM_Y+52, sx+sW, BOTTOM_Y+52);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...T.textMuted);
    doc.text('Authorised Signatory', sCX, BOTTOM_Y+63, {align:'center'});
    doc.text(d.sellerName,           sCX, BOTTOM_Y+74, {align:'center'});
  }

  // ── UPI QR CODE (left side, bottom) ──
  // QR box occupies left side: x=28, width=140
  return new Promise(resolve=>{
    if(d.sellerUPI){
      try{
        const qel=document.createElement('div');
        document.body.appendChild(qel);
        new QRCode(qel,{
          text:`upi://pay?pa=${d.sellerUPI}&pn=${encodeURIComponent(d.sellerName)}&am=${d.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Invoice '+d.invNum)}`,
          width:86,height:86,
          colorDark:'#000000',colorLight:'#ffffff',
          correctLevel:QRCode.CorrectLevel.M
        });
        setTimeout(()=>{
          const img=qel.querySelector('img')||qel.querySelector('canvas');
          if(img){
            const url=img.tagName==='CANVAS'?img.toDataURL():img.src;
            const qy = BOTTOM_Y;        // align top with bottom section
            doc.setFillColor(...T.billBoxBg);
            doc.roundedRect(28, qy, 138, 120, 4,4,'F');
            // Label
            doc.setFont('helvetica','bold');doc.setFontSize(8);
            doc.setTextColor(...T.textMuted);
            doc.text('PAY VIA UPI', 38, qy+13);
            // QR image
            try{ doc.addImage(url,'PNG', 34, qy+18, 86, 86); }catch(e){}
            // UPI ID — truncate to fit
            doc.setFont('helvetica','normal');doc.setFontSize(7);
            doc.setTextColor(...T.textMuted);
            const upiTxt = d.sellerUPI.length > 24
              ? d.sellerUPI.slice(0,24)+'...'
              : d.sellerUPI;
            doc.text(upiTxt, 34, qy+111);
          }
          document.body.removeChild(qel);
          resolve(doc);
        },300);
      }catch(e){resolve(doc)}
    } else resolve(doc);
  });
}

/* ── Updated generatePDF — uses themed builder ── */
function generatePDF(){
  const d=collectData();

  // 1. Save to history (safely — may not be defined on first load)
  if(typeof addToHistory==='function') addToHistory(d);

  // 2. Use uploaded signature file if no drawn signature exists
  const drawnSig=localStorage.getItem('inv-signature')||null;
  const sigDataURL=drawnSig||sigFileB64||null;

  // 3. Build PDF with current theme
  buildThemedPDF(d,sigDataURL).then(doc=>{
    const H=doc.internal.pageSize.getHeight();
    const W=doc.internal.pageSize.getWidth();
    const T=PDF_THEMES[activePDFTheme]||PDF_THEMES.neon;

    // 4. Embed company stamp — bottom-right, below signature line
    // Signature occupies W/2+20 to W-28 at BOTTOM_Y
    // Stamp goes right side, below signature text (BOTTOM_Y + 80 approx)
    if(stampB64){
      try{
        const stampSize = 80;
        const stampX = W - stampSize - 30;   // right-aligned with margin
        const stampY = H - 195 + 70;         // below the signature image+line+text, above footer
        doc.addImage(stampB64,'', stampX, stampY, stampSize, stampSize);
      }catch(e){}
    }

    // 5. Add discount line if applicable
    const _cfg=typeof CFG!=='undefined'?CFG:{sym:'Rs.',curr:'INR'};
    const disc=typeof calcDiscount==='function'?calcDiscount(d.sub):0;
    if(disc>0){
      try{
        const reason=($('discReason')?.value||'Discount').slice(0,40);
        const aft=doc.lastAutoTable?.finalY||240;
        doc.setFont('helvetica','normal');doc.setFontSize(9);
        doc.setTextColor(220,60,60);
        doc.text(reason+': -Rs.'+rawINR(disc), W-232, aft+10);
        doc.setTextColor(30,41,59);
      }catch(e){}
    }

    // 6. Footer
    doc.setFillColor(...T.footerBg);
    doc.rect(0,H-36,W,36,'F');
    doc.setFont('helvetica','normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...T.footerText);
    doc.text('Computer-generated invoice · No signature required · InvoiceIN AI Ultra',W/2,H-22,{align:'center'});
    doc.text('Theme: '+T.name+' · Generated '+today(),W/2,H-11,{align:'center'});

    // 7. Save
    const fname=d.invNum.replace(/\//g,'-')+'.pdf';
    doc.save(fname);
    launchConfetti();
    showToast('🎉','Downloaded: '+fname,'');
  }).catch(err=>{
    console.error('PDF error:',err);
    showToast('⚠️','PDF error — check console','warn');
  });
}

/* ══════════════════════════════════════════════════
   DIGITAL SIGNATURE ENGINE
══════════════════════════════════════════════════ */
let sigMode='draw';
let sigDrawing=false;
let sigTypedFont="'Brush Script MT',cursive";
let sigHasContent=false;

function showSigModal(){
  $('sigModal').classList.add('open');
  initSigCanvas();
  // If saved sig exists, show preview
  const saved=localStorage.getItem('inv-signature');
  if(saved){
    $('sigPrevImg').src=saved;
    $('sigPrevWrap').classList.add('show');
  }
}
function closeSigModal(){$('sigModal').classList.remove('open')}

function setSigMode(mode){
  sigMode=mode;
  document.querySelectorAll('.sig-tab').forEach((t,i)=>t.classList.toggle('active',i===(mode==='draw'?0:1)));
  $('sigDrawWrap').style.display=mode==='draw'?'block':'none';
  $('sigTypeWrap').classList.toggle('show',mode==='type');
  if(mode==='type') updateTypedSig();
}

/* ── Canvas draw ── */
function initSigCanvas(){
  const canvas=$('sigCanvas');
  const ctx=canvas.getContext('2d');
  // Scale for retina
  const rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*2||912;canvas.height=156*2;
  canvas.style.width='100%';canvas.style.height='156px';
  ctx.scale(2,2);
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#111827';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';

  function getPos(e){
    const r=canvas.getBoundingClientRect();
    const src=e.touches?e.touches[0]:e;
    return{x:(src.clientX-r.left),y:(src.clientY-r.top)};
  }
  canvas.onmousedown=canvas.ontouchstart=e=>{
    e.preventDefault();sigDrawing=true;sigHasContent=true;
    canvas.classList.add('on');
    const{x,y}=getPos(e);ctx.beginPath();ctx.moveTo(x,y);
  };
  canvas.onmousemove=canvas.ontouchmove=e=>{
    if(!sigDrawing)return;e.preventDefault();
    const{x,y}=getPos(e);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);
  };
  canvas.onmouseup=canvas.ontouchend=()=>{sigDrawing=false;ctx.beginPath()};
  canvas.onmouseleave=()=>{sigDrawing=false};
}

/* ── Type signature ── */
function updateTypedSig(){
  const name=($('sigTypeIn')?.value||'Your Name').trim()||'Your Name';
  const canvas=document.createElement('canvas');
  canvas.width=400;canvas.height=100;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,400,100);
  ctx.fillStyle='#111';ctx.font=`38px ${sigTypedFont}`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(name,200,52);
  sigHasContent=true;
  // Show preview in typed area
  const prev=document.createElement('img');
  prev.src=canvas.toDataURL();prev.style.cssText='max-width:100%;margin-top:8px;border-radius:6px;background:#fff;padding:6px';
  const wrap=$('sigTypeWrap');
  const old=wrap.querySelector('.sig-preview-typed');if(old)old.remove();
  prev.className='sig-preview-typed';
  wrap.appendChild(prev);
}
function setSigFont(btn,fontName){
  document.querySelectorAll('.sfb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  sigTypedFont=btn.getAttribute('data-font');
  $('sigTypeIn').style.fontFamily=sigTypedFont;
  updateTypedSig();
}

function saveSig(){
  let dataURL=null;
  if(sigMode==='draw'){
    if(!sigHasContent){showToast('⚠️','Draw your signature first','warn');return}
    dataURL=$('sigCanvas').toDataURL('image/png');
  } else {
    const name=($('sigTypeIn')?.value||'').trim();
    if(!name){showToast('⚠️','Type your name first','warn');return}
    const canvas=document.createElement('canvas');canvas.width=420;canvas.height=110;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,420,110);
    ctx.fillStyle='#111';ctx.font=`42px ${sigTypedFont}`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(name,210,58);
    dataURL=canvas.toDataURL('image/png');
  }
  localStorage.setItem('inv-signature',dataURL);
  $('sigPrevImg').src=dataURL;$('sigPrevWrap').classList.add('show');
  showToast('✍️','Signature saved — will appear on all PDFs','ai');
  closeSigModal();
}

function clearSig(){
  if(sigMode==='draw'){
    const canvas=$('sigCanvas');const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
    canvas.classList.remove('on');sigHasContent=false;
  } else {
    if($('sigTypeIn'))$('sigTypeIn').value='';
    const p=$('sigTypeWrap').querySelector('.sig-preview-typed');if(p)p.remove();
    sigHasContent=false;
  }
}

/* ══════════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════════ */
function launchConfetti(){
  const canvas=$('cfCanvas');const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const colors=['#00e5ff','#8b5cf6','#f59e0b','#10b981','#f87171','#ffffff'];
  const pieces=Array.from({length:180},()=>({x:Math.random()*canvas.width,y:-20,w:Math.random()*11+4,h:Math.random()*7+3,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,rv:Math.random()*8-4,vx:Math.random()*4-2,vy:Math.random()*5+3,alpha:1}));
  let f=0;
  function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);let alive=false;
    pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=p.rv;if(f>80)p.alpha-=.013;if(p.alpha>0&&p.y<canvas.height+20)alive=true;ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()});
    f++;if(alive)requestAnimationFrame(draw);else ctx.clearRect(0,0,canvas.width,canvas.height);}
  draw();
}

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
function showToast(ico,msg,type){
  const el=$('toast');$('toastMsg').textContent=msg;$('toastIco').textContent=ico;
  $('toastIco').className='ti'+(type==='warn'?' warn':type==='ai'?' ai':'');
  el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),3500);
}

/* ══════════════════════════════════════════════════
   RESET
══════════════════════════════════════════════════ */
function resetForm(){
  if(!confirm('Start a new invoice? Unsaved data will be lost.'))return;
  ['sellerName','sellerAddress','sellerGSTIN','sellerState','sellerEmail','sellerPhone','sellerUPI','sellerBank','clientName','clientAddress','clientGSTIN','clientState','invoiceNote'].forEach(id=>{const el=$(id);if(el)el.value=''});
  $('itemsBody').innerHTML='';rowId=0;$('dupBanner').classList.remove('show');
  initDefaults();addRow('',1,'');recalc();
}
/* initDefaults() — defined below with auto-numbering */

/* ══════════════════════════════════════════════════
   AI PANEL
══════════════════════════════════════════════════ */
let aiOpen=false;let aiHistory=[];
function toggleAI(){aiOpen=!aiOpen;if(aiOpen){$('aiPanel').classList.add('open');$('fabBadge').style.display='none'}else $('aiPanel').classList.remove('open')}
function chip(txt){$('aiInp').value=txt;sendAI()}

/* ── Local AI engine ── */
async function callAI(sysprompt,msg,hist){
  const key=getApiKey();
  if(key){
    try{
      const proxy='https://corsproxy.io/?'+encodeURIComponent('https://api.anthropic.com/v1/messages');
      const msgs=(hist||[]).concat([{role:'user',content:msg}]);
      const res=await fetch(proxy,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sysprompt,messages:msgs})});
      if(res.ok){const data=await res.json();return{text:data.content?.[0]?.text||'',real:true}}
    }catch(e){}
  }
  await new Promise(r=>setTimeout(r,500+Math.random()*700));
  return{text:localAI(msg),real:false};
}

function localAI(userMsg){
  const msg=userMsg.toLowerCase();const d=collectData();
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');

  if(msg.includes('auto-fill')||msg.includes('autofill')){
    const n=d.clientName||'the client';const st=guessState(n);
    const addr=genAddr(n,st);const gstin=genGSTIN(st);
    return`AUTO_FILL_JSON:{"address":"${addr}","state":"${st}","gstin":"${gstin}"}\nGenerated realistic Indian business details for **${n}**. Review before applying.`;
  }
  if(msg.includes('payment term')||msg.includes('generate term')){
    const adv=d.total>50000?'50% advance required before work begins. ':'';
    const pen=d.total>10000?'Late payment penalty of 2% per month on overdue amounts. ':'';
    const terms=`${adv}Full payment of ₹${rawINR(d.total)} (incl. GST) is due by ${d.dueDate||'the agreed date'}. Payment via NEFT/IMPS/UPI. ${pen}All disputes subject to ${d.sellerState||'Mumbai'} jurisdiction.`;
    return`PAYMENT_TERMS:${terms}\nProfessional payment terms generated for ₹${rawINR(d.total)}.`;
  }
  if(msg.includes('rate')||msg.includes('suggest')||msg.includes('price')||msg.includes('how much charge')){
    return`💰 **Indian Freelancer Market Rates (2024–25):**\n\n**Design & Creative:**\n• Logo Design: ₹5,000–15,000\n• UI/UX Design: ₹15,000–60,000\n• Branding Package: ₹25,000–1,00,000\n\n**Development:**\n• Website (WordPress): ₹15,000–50,000\n• Custom Web App: ₹50,000–3,00,000\n• Mobile App: ₹80,000–5,00,000\n\n**Marketing & Content:**\n• SEO: ₹8,000–30,000/mo\n• Content Writing: ₹2,000–8,000/article\n• Social Media: ₹10,000–30,000/mo\n\n**Consulting:** ₹2,000–8,000/hour\n\nWant rates for a specific service? Just ask!`;
  }
  if(msg.includes('email')||msg.includes('compose')||msg.includes('write email')){
    if(!d.clientName||d.clientName==='Client')return`Please add client details first, then I can compose the email for you.`;
    const emailTxt=`Subject: Invoice ${d.invNum} — ₹${rawINR(d.total)}\n\nDear ${d.clientName},\n\nI hope this message finds you well. Please find attached Invoice ${d.invNum} for services rendered.\n\nInvoice Summary:\n• Invoice No.: ${d.invNum}\n• Date: ${d.invDate}\n• Due Date: ${d.dueDate||'As agreed'}\n• Amount: ₹${rawINR(d.sub)} + GST ₹${rawINR(d.gst)} = ₹${rawINR(d.total)}\n\nPlease process the payment by the due date. ${d.sellerUPI?`\nUPI Payment: ${d.sellerUPI}`:''}\n\nFor any queries, feel free to reach out.\n\nThank you for your business!\n\nWarm regards,\n${d.sellerName}\n${d.sellerPhone||''}\n${d.sellerEmail||''}`;
    return`EMAIL_DRAFT:${emailTxt}\n\nProfessional email composed for ${d.clientName}. Click to open in email client.`;
  }
  if(msg.includes('duplicate')||msg.includes('check dup')){
    const name=d.clientName.toLowerCase();
    const dups=drafts.filter(dr=>dr.clientName?.toLowerCase()===name&&dr.invNum!==d.invNum);
    if(!name||name==='client')return`Enter a client name first.`;
    if(!dups.length)return`✅ No duplicate invoices for **${d.clientName}**. You're good!`;
    return`⚠️ **${dups.length}** existing invoice(s) for **${d.clientName}**:\n\n${dups.map(dr=>`• **${dr.invNum}** — ${INR(dr.total)}`).join('\n')}\n\nDouble check before sending to avoid billing twice.`;
  }
  if(msg.includes('summarize')||msg.includes('summary')){
    if(!d.items.length)return`No line items yet. Add services first!`;
    const top=d.items.reduce((a,b)=>a.total>b.total?a:b);
    return`📊 **Invoice ${d.invNum}**\n\n**From:** ${d.sellerName}\n**To:** ${d.clientName}\n**Items:** ${d.items.length} service(s)\n**Subtotal:** ₹${rawINR(d.sub)}\n**GST:** ₹${rawINR(d.gst)}\n**Grand Total:** ₹${rawINR(d.total)}\n**Due:** ${d.dueDate||'Not set'}\n\nLargest item: **${top.desc}** — ₹${rawINR(top.total)}`;
  }
  if(msg.includes('gst')||msg.includes('tax')){
    return`**Your GST breakdown:**\n\n• Subtotal: ₹${rawINR(d.sub)}\n• ${d.isIGST?`IGST: ₹${rawINR(d.gst)}`:`CGST: ₹${rawINR(d.gst/2)}\n• SGST: ₹${rawINR(d.gst/2)}`}\n• **Total GST: ₹${rawINR(d.gst)}**\n\n${d.isIGST?'IGST = inter-state (client in different state)':'CGST+SGST = intra-state. Toggle IGST if client is in another state.'}`;
  }
  if(msg.includes('api key')||msg.includes('connect')||msg.includes('real claude')){
    return`To connect **real Claude AI**, enter your key:\n\n<input id="apiKeyIn" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid #334;background:#141e2e;color:#dde6f0;font-size:13px;margin-top:6px;font-family:monospace" placeholder="sk-ant-..." /><button class="ai-apply" style="margin-top:8px" onclick="const k=document.getElementById('apiKeyIn').value;if(k){setApiKey(k);addMsg('ai','✅ API key saved! Next messages will use real Claude.',false);}">Save Key</button>\n\nGet your key at **console.anthropic.com**.`;
  }
  const greets=['hi','hello','hey','hii'];
  if(greets.some(g=>msg.trim()===g||msg.startsWith(g+' '))){
    return`Hi! 👋 Your invoice **${d.invNum}** for **${d.clientName||'[no client]'}** totals **${INR(d.total)}**.\n\nWhat can I help with?`;
  }
  return`I'm your invoice AI! I can help with:\n\n💰 **Rate suggestions** — market rates for any service\n✉️ **Email composer** — professional invoice email\n✨ **Auto-fill client** — address & GSTIN from name\n📝 **Payment terms** — professional legal terms\n🔍 **Duplicate check** — scan existing drafts\n📊 **Invoice summary** — plain-English overview\n\nCurrent total: **${INR(d.total)}**. What do you need?`;
}

/* ── Helpers ── */
function guessState(n){
  const m=n.toLowerCase();
  if(m.includes('mumbai')||m.includes('pune')||m.includes('maharashtra'))return'Maharashtra';
  if(m.includes('delhi')||m.includes('gurgaon')||m.includes('noida'))return'Delhi';
  if(m.includes('bengaluru')||m.includes('bangalore')||m.includes('karnatak'))return'Karnataka';
  if(m.includes('chennai')||m.includes('tamil'))return'Tamil Nadu';
  if(m.includes('hyderabad')||m.includes('telangana'))return'Telangana';
  if(m.includes('ahmedabad')||m.includes('gujarat'))return'Gujarat';
  if(m.includes('kolkata')||m.includes('bengal'))return'West Bengal';
  const s=($('sellerState')?.value||'').trim();return s||'Maharashtra';
}
function genAddr(name,state){
  const map={'Maharashtra':['Plot 12, MIDC Andheri East, Mumbai – 400093','Office 304, FC Road, Pune – 411004'],'Delhi':['B-45, Connaught Place, New Delhi – 110001','501, Nehru Place, New Delhi – 110019'],'Karnataka':['42, 5th Block Koramangala, Bengaluru – 560034','Embassy Tech Village, Outer Ring Road, Bengaluru – 560037'],'Tamil Nadu':['8, Anna Salai, Chennai – 600002','15, Tidel Park, Taramani, Chennai – 600113'],'Telangana':['Plot 44, HITEC City, Hyderabad – 500081','6-3-248, Banjara Hills, Hyderabad – 500034'],'Gujarat':['CG Road, Ahmedabad – 380009','Ring Road, Surat – 395002'],'West Bengal':['12, Park Street, Kolkata – 700016','Salt Lake Sector V, Kolkata – 700091']};
  const pool=map[state]||[`Business Park, ${state} – 400001`];
  return pool[Math.floor(Math.random()*pool.length)];
}
function genGSTIN(state){
  const codes={'Maharashtra':'27','Delhi':'07','Karnataka':'29','Tamil Nadu':'33','Telangana':'36','Gujarat':'24','West Bengal':'19','Rajasthan':'08','Uttar Pradesh':'09'};
  const c=codes[state]||'27';
  const L='ABCDEFGHJKLMNPQRSTUVWXYZ';const D='0123456789';
  const r=(a,n)=>Array.from({length:n},()=>a[Math.floor(Math.random()*a.length)]).join('');
  return`${c}${r(L,5)}${r(D,4)}${r(L,1)}1Z${r(D,1)}`;
}

/* ── Typing effect ── */
function typeText(el,text,onDone){
  el.innerHTML='';let i=0;
  const interval=setInterval(()=>{
    el.innerHTML=text.slice(0,i).replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')+
      `<span style="border-right:2px solid var(--ne2);animation:pulse 1s infinite;display:inline-block;height:1em;vertical-align:text-bottom;width:2px;margin-left:1px"></span>`;
    i++;
    if(i>text.length){clearInterval(interval);el.innerHTML=text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>');if(onDone)onDone()}
  },14);
}

/* ── Main send ── */
async function sendAI(){
  const inp=$('aiInp');const msg=inp.value.trim();if(!msg)return;
  addMsg('user',msg);inp.value='';inp.style.height='auto';
  $('typingInd').classList.add('show');$('aiSendBtn').disabled=true;
  aiHistory.push({role:'user',content:msg});
  const sys=`You are an expert AI invoice assistant for Indian freelancers. Current invoice context:\n${buildCtx()}`;
  try{
    const histForAPI=aiHistory.slice(0,-1).map(m=>({role:m.role,content:m.content}));
    const result=await callAI(sys,msg,histForAPI);
    aiHistory.push({role:'assistant',content:result.text});
    if(aiHistory.length>20)aiHistory=aiHistory.slice(-20);
    handleReply(result.text,result.real);
  }catch(e){
    $('typingInd').classList.remove('show');$('aiSendBtn').disabled=false;
    addMsg('ai',`⚠️ Error: ${e.message}`);
  }
}

function buildCtx(){
  const d=collectData();const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  return`Invoice: ${d.invNum} | From: ${d.sellerName} | To: ${d.clientName} | Items: ${d.items.map(it=>`${it.desc} ₹${rawINR(it.total)}`).join(', ')||'none'} | Total: ₹${rawINR(d.total)} | Drafts: ${drafts.length}`;
}

function handleReply(reply,isReal){
  $('typingInd').classList.remove('show');$('aiSendBtn').disabled=false;

  if(reply.includes('AUTO_FILL_JSON:')){
    try{
      const js=reply.match(/AUTO_FILL_JSON:(\{[\s\S]*?\})/)?.[1];
      const cd=JSON.parse(js);
      const clean=reply.replace(/AUTO_FILL_JSON:[\s\S]*?\}/,'').trim();
      const el=addMsg('ai',clean||"Found details — click to apply:",isReal);
      const btn=document.createElement('button');btn.className='ai-apply';btn.textContent='✓ Apply Client Details';
      btn.onclick=()=>{
        if(cd.address)$('clientAddress').value=cd.address;
        if(cd.state)$('clientState').value=cd.state;
        if(cd.gstin)$('clientGSTIN').value=cd.gstin.toUpperCase();
        sp();btn.textContent='✓ Applied!';btn.disabled=true;showToast('✨','Client auto-filled by AI','ai');
      };
      const w=document.createElement('div');w.className='ai-act-btns';w.appendChild(btn);
      el.querySelector('.mbbl').appendChild(w);return;
    }catch(e){}
  }

  if(reply.includes('PAYMENT_TERMS:')){
    const terms=reply.match(/PAYMENT_TERMS:([\s\S]+?)(\n|$)/)?.[1]?.trim();
    const clean=reply.replace(/PAYMENT_TERMS:[\s\S]+?(\n|$)/,'').trim();
    const el=addMsg('ai',(clean||'Payment terms generated:')+'\n\n"'+(terms||'')+'"',isReal);
    if(terms){
      const btn=document.createElement('button');btn.className='ai-apply';btn.textContent='✓ Apply to Notes';
      btn.onclick=()=>{$('invoiceNote').value=terms;sp();btn.textContent='✓ Applied!';btn.disabled=true;showToast('✨','Payment terms applied','ai')};
      const w=document.createElement('div');w.className='ai-act-btns';w.appendChild(btn);
      el.querySelector('.mbbl').appendChild(w);
    }
    return;
  }

  if(reply.includes('EMAIL_DRAFT:')){
    const emailBody=reply.match(/EMAIL_DRAFT:([\s\S]+?)(\n\n[^E])/)?.[1]?.trim();
    const clean=reply.replace(/EMAIL_DRAFT:[\s\S]+/,'').trim();
    const d=collectData();
    const el=addMsg('ai',clean||'Professional email composed!',isReal);
    if(emailBody){
      const btn=document.createElement('button');btn.className='ai-apply';btn.textContent='📧 Open in Email Client';
      btn.onclick=()=>{
        const subj=encodeURIComponent(`Invoice ${d.invNum} from ${d.sellerName} — ₹${rawINR(d.total)}`);
        const body=encodeURIComponent(emailBody);
        const mailto=`mailto:?subject=${subj}&body=${body}`;
        window.location.href=mailto;showToast('📧','Email client opened','warn');
      };
      const w=document.createElement('div');w.className='ai-act-btns';w.appendChild(btn);
      el.querySelector('.mbbl').appendChild(w);
    }
    return;
  }

  addMsg('ai',reply,isReal);
}

function addMsg(role,text,isReal){
  const c=$('aiMsgs'),ind=$('typingInd');
  const div=document.createElement('div');div.className=`msg ${role}`;
  const bbl=document.createElement('div');bbl.className='mbbl';
  const tim=document.createElement('div');tim.className='mtime';

  if(role==='ai'){
    if(text.includes('<input')||text.includes('<button')){
      bbl.innerHTML=text;
    } else {
      // Typing effect for AI messages
      typeText(bbl,text);
    }
    const badge=isReal
      ?`<span style="background:linear-gradient(135deg,#8b5cf6,#00e5ff);color:#fff;font-size:9px;padding:1px 6px;border-radius:10px;margin-left:5px;font-weight:700">Claude AI</span>`
      :`<span style="background:rgba(16,185,129,.2);color:#10b981;font-size:9px;padding:1px 6px;border-radius:10px;margin-left:5px;font-weight:700">Local AI</span>`;
    tim.innerHTML=nowT()+badge;
  } else {
    bbl.textContent=text;
    tim.textContent=nowT();
  }

  div.appendChild(bbl);div.appendChild(tim);
  c.insertBefore(div,ind);
  c.scrollTop=c.scrollHeight;
  return div;
}

/* ══════════════════════════════════════════════════
   AI QUICK ACTIONS (form buttons)
══════════════════════════════════════════════════ */
async function aiAutoFillClient(){
  const n=($('clientName')?.value||'').trim();
  if(!n){showToast('⚠️','Enter client name first','warn');return}
  $('autofillBtn').disabled=true;$('autofillBtn').textContent='⏳';
  if(!aiOpen)toggleAI();
  $('aiInp').value=`Auto-fill client details for: "${n}"`;
  await sendAI();
  $('autofillBtn').disabled=false;$('autofillBtn').textContent='✨ AI Auto-fill';
}
async function aiPayTerms(){
  $('payTermsBtn').disabled=true;$('payTermsBtn').textContent='⏳';
  if(!aiOpen)toggleAI();
  $('aiInp').value='Generate professional payment terms for this invoice';
  await sendAI();
  $('payTermsBtn').disabled=false;$('payTermsBtn').textContent='✨ AI Terms';
}
async function aiEmailComposer(){
  if(!aiOpen)toggleAI();
  $('aiInp').value='Compose a professional email for this invoice';
  await sendAI();
}

/* ══════════════════════════════════════════════════
   BUSINESS PROFILE SYSTEM
   - Stores name, address, gstin, state, email, phone,
     upi, bank, and logo (as Base64) in localStorage.
   - Auto-loads on page start.
   - Card is locked after save; Edit button unlocks it.
   - Panel tab gives a dedicated full-page editor.
══════════════════════════════════════════════════ */

const BP_KEY = 'inv-biz-profile';  // localStorage key
let bpLogoBase64 = '';              // current logo in memory (Base64)
let bpPanelLogoBase64 = '';         // panel editor logo

/* ── Save profile from the inline card (Editor tab) ── */
function bpSaveProfile(){
  const name = ($('sellerName')?.value||'').trim();
  if(!name){ showToast('⚠️','Enter your business name first','warn'); return; }

  const profile = {
    name,
    address : $('sellerAddress')?.value||'',
    gstin   : $('sellerGSTIN')?.value||'',
    state   : $('sellerState')?.value||'',
    email   : $('sellerEmail')?.value||'',
    phone   : $('sellerPhone')?.value||'',
    upi     : $('sellerUPI')?.value||'',
    bank    : $('sellerBank')?.value||'',
    logo    : bpLogoBase64,
    savedAt : new Date().toISOString()
  };

  localStorage.setItem(BP_KEY, JSON.stringify(profile));
  bpApplyLockState(profile);
  showToast('🏢', 'Business profile saved', 'ai');
  $('bpDot').style.display = '';
}

/* ── Save profile from the dedicated panel tab ── */
function bpSaveFromPanel(){
  const name = ($('bpPanelName')?.value||'').trim();
  if(!name){ showToast('⚠️','Enter your business name first','warn'); return; }

  const profile = {
    name,
    address : $('bpPanelAddress')?.value||'',
    gstin   : $('bpPanelGSTIN')?.value||'',
    state   : $('bpPanelState')?.value||'',
    email   : $('bpPanelEmail')?.value||'',
    phone   : $('bpPanelPhone')?.value||'',
    upi     : $('bpPanelUPI')?.value||'',
    bank    : $('bpPanelBank')?.value||'',
    logo    : bpPanelLogoBase64,
    savedAt : new Date().toISOString()
  };

  localStorage.setItem(BP_KEY, JSON.stringify(profile));

  // Sync back to the invoice editor fields
  bpFillEditorFields(profile);
  bpLogoBase64 = bpPanelLogoBase64;
  bpApplyLockState(profile);
  bpRefreshPanelSavedBar(profile);
  showToast('🏢', 'Business profile saved', 'ai');
  $('bpDot').style.display = '';
}

/* ── Load profile on page boot ── */
function bpLoadOnBoot(){
  const raw = localStorage.getItem(BP_KEY);
  if(!raw) return;
  try{
    const p = JSON.parse(raw);
    bpFillEditorFields(p);
    bpLogoBase64 = p.logo||'';
    bpPanelLogoBase64 = p.logo||'';
    bpApplyLockState(p);
    bpRefreshPanelSavedBar(p);
    $('bpDot').style.display = '';
  }catch(e){}
}

/* ── Fill the invoice editor fields from a profile object ── */
function bpFillEditorFields(p){
  if($('sellerName'))    $('sellerName').value    = p.name||'';
  if($('sellerAddress')) $('sellerAddress').value = p.address||'';
  if($('sellerGSTIN'))   $('sellerGSTIN').value   = p.gstin||'';
  if($('sellerState'))   $('sellerState').value   = p.state||'';
  if($('sellerEmail'))   $('sellerEmail').value   = p.email||'';
  if($('sellerPhone'))   $('sellerPhone').value   = p.phone||'';
  if($('sellerUPI'))     $('sellerUPI').value     = p.upi||'';
  if($('sellerBank'))    $('sellerBank').value    = p.bank||'';

  // Show logo in the inline upload zone
  if(p.logo){
    const thumb = $('bpLogoThumb');
    const ph    = $('bpLogoPlaceholder');
    const clr   = $('bpLogoClear');
    if(thumb){ thumb.src = p.logo; thumb.classList.add('show'); }
    if(ph)    ph.style.display = 'none';
    if(clr)   clr.classList.add('show');
  }

  // Show mini logo in header
  const hdrLogo = $('bpHeaderLogo');
  if(hdrLogo && p.logo){
    hdrLogo.src = p.logo;
    hdrLogo.classList.add('show');
  } else if(hdrLogo){
    hdrLogo.classList.remove('show');
  }
}

/* ── Lock the inline card fields after save ── */
function bpApplyLockState(p){
  const fields  = $('bpFields');
  const savedBar= $('bpSavedBar');
  const editBtn = $('bpEditBtn');
  const saveBtn = $('bpSaveBtn');

  if(!fields) return;

  // Show saved bar
  const savedName = $('bpSavedName');
  const savedSub  = $('bpSavedSub');
  const savedLogo = $('bpSavedLogo');

  if(savedName) savedName.textContent = p.name || '—';
  if(savedSub)  savedSub.textContent  = [p.email, p.phone, p.gstin].filter(Boolean).join(' · ') || p.address || '—';
  if(savedLogo){
    if(p.logo){ savedLogo.src = p.logo; savedLogo.style.display = 'block'; }
    else savedLogo.style.display = 'none';
  }

  savedBar?.classList.add('show');
  fields.classList.add('locked');
  if(editBtn) editBtn.style.display = 'inline-flex';
  if(saveBtn) saveBtn.style.display = 'none';
}

/* ── Unlock the inline card so the user can edit ── */
function bpStartEdit(){
  const fields  = $('bpFields');
  const editBtn = $('bpEditBtn');
  const saveBtn = $('bpSaveBtn');

  if(fields)  fields.classList.remove('locked');
  if(editBtn) editBtn.style.display = 'none';
  if(saveBtn) saveBtn.style.display = 'inline-flex';

  // Scroll card into view
  $('bpCard')?.scrollIntoView({behavior:'smooth', block:'start'});
}

/* ── Sync the panel tab fields with current localStorage data ── */
function bpSyncPanelFields(){
  const raw = localStorage.getItem(BP_KEY);
  if(!raw) return;
  try{
    const p = JSON.parse(raw);
    if($('bpPanelName'))    $('bpPanelName').value    = p.name||'';
    if($('bpPanelAddress')) $('bpPanelAddress').value = p.address||'';
    if($('bpPanelGSTIN'))   $('bpPanelGSTIN').value   = p.gstin||'';
    if($('bpPanelState'))   $('bpPanelState').value   = p.state||'';
    if($('bpPanelEmail'))   $('bpPanelEmail').value   = p.email||'';
    if($('bpPanelPhone'))   $('bpPanelPhone').value   = p.phone||'';
    if($('bpPanelUPI'))     $('bpPanelUPI').value     = p.upi||'';
    if($('bpPanelBank'))    $('bpPanelBank').value    = p.bank||'';
    bpPanelLogoBase64 = p.logo||'';
    if(p.logo){
      const t=$('bpPanelLogoThumb'), ph=$('bpPanelLogoPlaceholder'), clr=$('bpPanelLogoClear');
      if(t){ t.src=p.logo; t.classList.add('show'); }
      if(ph) ph.style.display='none';
      if(clr) clr.classList.add('show');
    }
    bpRefreshPanelSavedBar(p);
  }catch(e){}
}

/* ── Refresh the saved bar inside the panel ── */
function bpRefreshPanelSavedBar(p){
  const bar  = $('bpPanelSavedBar');
  const nm   = $('bpPanelSavedName');
  const sub  = $('bpPanelSavedSub');
  const logo = $('bpPanelSavedLogo');
  if(!bar) return;
  if(nm)  nm.textContent  = p.name||'—';
  if(sub) sub.textContent = [p.email,p.phone].filter(Boolean).join(' · ')||p.address||'—';
  if(logo){
    if(p.logo){ logo.src=p.logo; logo.style.display='block'; }
    else logo.style.display='none';
  }
  bar.classList.add('show');
}

/* ── Logo upload handler — inline card ── */
function bpHandleLogo(event){
  const file = event.target.files?.[0];
  if(!file) return;
  if(file.size > 2*1024*1024){ showToast('⚠️','Logo must be under 2MB','warn'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    bpLogoBase64 = e.target.result;  // store Base64

    // Show preview instantly
    const thumb = $('bpLogoThumb');
    const ph    = $('bpLogoPlaceholder');
    const clr   = $('bpLogoClear');
    if(thumb){ thumb.src = bpLogoBase64; thumb.classList.add('show'); }
    if(ph)    ph.style.display = 'none';
    if(clr)   clr.classList.add('show');
  };
  reader.readAsDataURL(file);  // converts to Base64
}

/* ── Remove logo — inline card ── */
function bpClearLogo(event){
  event.stopPropagation();
  bpLogoBase64 = '';
  const thumb=$('bpLogoThumb'), ph=$('bpLogoPlaceholder'), clr=$('bpLogoClear'), inp=$('bpLogoInput');
  if(thumb){ thumb.src=''; thumb.classList.remove('show'); }
  if(ph)    ph.style.display='flex';
  if(clr)   clr.classList.remove('show');
  if(inp)   inp.value='';
}

/* ── Logo upload handler — panel tab ── */
function bpHandleLogoPanel(event){
  const file = event.target.files?.[0];
  if(!file) return;
  if(file.size > 2*1024*1024){ showToast('⚠️','Logo must be under 2MB','warn'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    bpPanelLogoBase64 = e.target.result;
    const t=$('bpPanelLogoThumb'), ph=$('bpPanelLogoPlaceholder'), clr=$('bpPanelLogoClear');
    if(t){ t.src=bpPanelLogoBase64; t.classList.add('show'); }
    if(ph) ph.style.display='none';
    if(clr) clr.classList.add('show');
  };
  reader.readAsDataURL(file);
}

/* ── Remove logo — panel ── */
function bpClearLogoPanel(event){
  event.stopPropagation();
  bpPanelLogoBase64='';
  const t=$('bpPanelLogoThumb'), ph=$('bpPanelLogoPlaceholder'), clr=$('bpPanelLogoClear'), inp=$('bpPanelLogoInput');
  if(t){ t.src=''; t.classList.remove('show'); }
  if(ph) ph.style.display='flex';
  if(clr) clr.classList.remove('show');
  if(inp) inp.value='';
}

/* ── Clear / delete the entire saved profile ── */
function bpClearProfile(){
  if(!confirm('Clear saved business profile? This cannot be undone.')) return;
  localStorage.removeItem(BP_KEY);
  bpLogoBase64=''; bpPanelLogoBase64='';

  // Reset inline card
  const fields=$('bpFields'), savedBar=$('bpSavedBar'), editBtn=$('bpEditBtn'), saveBtn=$('bpSaveBtn');
  if(fields)  fields.classList.remove('locked');
  if(savedBar) savedBar.classList.remove('show');
  if(editBtn) editBtn.style.display='none';
  if(saveBtn) saveBtn.style.display='inline-flex';

  // Reset panel saved bar
  $('bpPanelSavedBar')?.classList.remove('show');

  // Hide header logo
  const hdr=$('bpHeaderLogo'); if(hdr){ hdr.src=''; hdr.classList.remove('show'); }

  // Clear all fields
  ['sellerName','sellerAddress','sellerGSTIN','sellerState','sellerEmail','sellerPhone','sellerUPI','sellerBank',
   'bpPanelName','bpPanelAddress','bpPanelGSTIN','bpPanelState','bpPanelEmail','bpPanelPhone','bpPanelUPI','bpPanelBank']
    .forEach(id=>{ const el=$(id); if(el) el.value=''; });

  // Reset logo zones
  bpClearLogo({stopPropagation:()=>{}});
  bpClearLogoPanel({stopPropagation:()=>{}});

  $('bpDot').style.display='none';
  showToast('🗑️','Business profile cleared','warn');
}

/* ══ Expose bpLogoBase64 for PDF generation ══ */
function getBPLogo(){ return bpLogoBase64||bpPanelLogoBase64||''; }

/* ════════════════════════════════════════════════
   SETTINGS MODULE
════════════════════════════════════════════════ */
const SK='inv-settings2';
let CFG={prefix:'INV',startNum:1,gst:'18',due:15,curr:'INR',sym:'₹',matrix:true,autosave:true};

function loadSettings(){
  try{const s=localStorage.getItem(SK);if(s)Object.assign(CFG,JSON.parse(s));}catch(e){}
  if($('setPfx'))  $('setPfx').value=CFG.prefix;
  if($('setStart'))$('setStart').value=CFG.startNum;
  if($('setGST'))  $('setGST').value=CFG.gst;
  if($('setDue'))  $('setDue').value=CFG.due;
  document.querySelectorAll('.curbtn').forEach(b=>b.classList.toggle('active',b.dataset.curr===CFG.curr));
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  if($('tglDark'))  $('tglDark').checked=dark;
  if($('tglMatrix'))$('tglMatrix').checked=CFG.matrix!==false;
  if($('tglAS'))    $('tglAS').checked=CFG.autosave!==false;
  applyMatrixOpacity();
}
function saveSettings(){
  CFG.prefix=$('setPfx')?.value||'INV';
  CFG.startNum=parseInt($('setStart')?.value)||1;
  CFG.gst=$('setGST')?.value||'18';
  CFG.due=parseInt($('setDue')?.value)||15;
  localStorage.setItem(SK,JSON.stringify(CFG));
}
function setCurrency(btn){
  CFG.curr=btn.dataset.curr; CFG.sym=btn.dataset.sym;
  document.querySelectorAll('.curbtn').forEach(b=>b.classList.toggle('active',b===btn));
  saveSettings(); recalc();
  showToast('💱','Currency: '+CFG.curr,'ai');
}
function tglTheme(){
  theme=theme==='dark'?'light':'dark'; applyTheme(theme);
  if($('tglDark'))$('tglDark').checked=(theme==='dark');
}
function tglMatrix(){
  CFG.matrix=$('tglMatrix').checked; saveSettings(); applyMatrixOpacity();
}
function applyMatrixOpacity(){
  const c=$('matrixCanvas'); if(!c) return;
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  c.style.opacity=CFG.matrix===false?'0':(dark?'.07':'.03');
}
function tglAutosave(){CFG.autosave=$('tglAS').checked; saveSettings();}

/* ════════════════════════════════════════════════
   AUTO INVOICE NUMBER
════════════════════════════════════════════════ */
function nextInvNum(){
  const pfx=CFG.prefix||'INV';
  const c=JSON.parse(localStorage.getItem('inv-counter2')||'{}');
  if(!c[pfx])c[pfx]=(CFG.startNum||1)-1;
  c[pfx]++;
  localStorage.setItem('inv-counter2',JSON.stringify(c));
  return pfx+'-'+String(c[pfx]).padStart(4,'0');
}
/* Override initDefaults to use auto number */
function initDefaults(){
  const n=nextInvNum();
  $('invoiceNumber').value=n;
  $('invoiceDate').value=today();
  $('dueDate').value=addDays(today(),CFG.due||15);
  $('sbNum').textContent=n;
}

/* ════════════════════════════════════════════════
   CURRENCY-AWARE FORMAT
════════════════════════════════════════════════ */
function cfmt(n){
  const v=Number(n||0);
  if(CFG.curr==='INR') return CFG.sym+v.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  return CFG.sym+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}

/* ════════════════════════════════════════════════
   DISCOUNT MODULE
════════════════════════════════════════════════ */
function calcDiscount(sub){
  const t=$('discType')?.value||'none';
  const v=parseFloat($('discVal')?.value)||0;
  if(t==='none'||v<=0) return 0;
  if(t==='pct') return Math.min(sub*v/100,sub);
  return Math.min(v,sub);
}

/* RECALC — single source of truth, includes discount */
function recalc(){
  const rows=document.querySelectorAll('#itemsBody tr');
  let sub=0;
  rows.forEach(tr=>{
    const ni=tr.querySelectorAll('input[type="number"]');
    sub+=pn(ni[0]?.value)*pn(ni[1]?.value);
  });
  const disc=calcDiscount(sub);
  const afterDisc=sub-disc;
  // Recalculate GST on discounted subtotal proportionally
  let gst=0;
  rows.forEach(tr=>{
    const ni=tr.querySelectorAll('input[type="number"]');
    const sel=tr.querySelector('select');
    const rowAmt=pn(ni[0]?.value)*pn(ni[1]?.value);
    const rowFrac=sub>0?rowAmt/sub:0;
    const discRow=disc*rowFrac;
    gst+=(rowAmt-discRow)*(pn(sel?.value)/100);
  });
  const total=afterDisc+gst;
  const isIGST=$('igstToggle').checked;
  anim('sumSub',INR(sub));
  anim('sumGST',INR(gst));
  anim('sumTotal',INR(total));
  $('sbTotal').textContent=INR(total);
  if(isIGST){
    $('cgstRow').style.display='none';$('sgstRow').style.display='none';
    $('igstRow').style.display='';anim('sumIGST',INR(gst));
  } else {
    $('igstRow').style.display='none';$('cgstRow').style.display='';$('sgstRow').style.display='';
    anim('sumCGST',INR(gst/2));anim('sumSGST',INR(gst/2));
  }
  computeHealth();
  // Update discount result panel
  const dr=$('discResult');
  if(dr){
    if(disc>0){
      dr.style.display='';
      if($('drSub'))  $('drSub').textContent=INR(sub);
      if($('drDisc')) $('drDisc').textContent='-'+INR(disc);
      if($('drAfter'))$('drAfter').textContent=INR(afterDisc);
      if($('drGST'))  $('drGST').textContent=INR(gst);
      if($('drGrand'))$('drGrand').textContent=INR(total);
    } else dr.style.display='none';
  }
}

/* ════════════════════════════════════════════════
   PRODUCT DATABASE + AUTOCOMPLETE
════════════════════════════════════════════════ */
const PK='inv-products2';
let acIdx={};

function getProds(){return JSON.parse(localStorage.getItem(PK)||'[]')}
function setProds(a){localStorage.setItem(PK,JSON.stringify(a));if($('prodDot'))$('prodDot').style.display=a.length?'':'none';}

function quickAddProduct(){
  const nm=($('qpName')?.value||'').trim();
  if(!nm){showToast('⚠️','Enter product name','warn');return;}
  const p=[{id:Date.now(),name:nm,price:parseFloat($('qpPrice')?.value)||0,gst:$('qpGST')?.value||'18',desc:$('qpDesc')?.value||''},...getProds()];
  setProds(p); renderProducts();
  $('qpName').value=''; $('qpPrice').value=''; $('qpDesc').value='';
  showToast('📦','Product added','ai');
}
function openProdModal(id){
  $('prodModal').classList.add('open');
  $('pmEditId').value=id||'';
  if(id){
    const p=getProds().find(x=>x.id===id)||{};
    $('pmTitle').textContent='Edit Product';
    $('pmName').value=p.name||''; $('pmPrice').value=p.price||'';
    $('pmGST').value=p.gst||'18'; $('pmDesc').value=p.desc||'';
  } else {
    $('pmTitle').textContent='Add Product / Service';
    $('pmName').value=''; $('pmPrice').value=''; $('pmDesc').value=''; $('pmGST').value='18';
  }
}
function closeProdModal(){$('prodModal').classList.remove('open')}
function saveProd(){
  const nm=($('pmName')?.value||'').trim();
  if(!nm){showToast('⚠️','Enter name','warn');return;}
  const prods=getProds();
  const eid=parseInt($('pmEditId')?.value)||0;
  const e={id:eid||Date.now(),name:nm,price:parseFloat($('pmPrice')?.value)||0,gst:$('pmGST')?.value||'18',desc:$('pmDesc')?.value||''};
  if(eid){const i=prods.findIndex(x=>x.id===eid);if(i>=0)prods[i]=e;else prods.unshift(e);}
  else prods.unshift(e);
  setProds(prods); closeProdModal(); renderProducts();
  showToast('📦',eid?'Product updated':'Product saved','ai');
}
function delProd(id){
  if(!confirm('Delete this product?'))return;
  setProds(getProds().filter(x=>x.id!==id)); renderProducts();
}
function useProd(id){
  const p=getProds().find(x=>x.id===id); if(!p)return;
  addRow(p.name,1,p.price,p.gst); switchTab('editor');
  showToast('📦','Added to invoice','');
}
function renderProducts(){
  const prods=getProds();
  const g=$('prodGrid'); if(!g)return;
  if(!prods.length){g.innerHTML='<div style="color:var(--tx3);font-size:13px;text-align:center;padding:30px;grid-column:1/-1">No products yet.</div>';return;}
  g.innerHTML=prods.map(p=>`
    <div class="pcard">
      <div class="pname" title="${p.name}">${p.name}</div>
      <div class="pprice">${cfmt(p.price)} · GST ${p.gst}%</div>
      <div class="pmeta">${p.desc||'—'}</div>
      <div class="pacts">
        <button class="pb pb-use" onclick="useProd(${p.id})">+ Add</button>
        <button class="pb pb-edit" onclick="openProdModal(${p.id})">Edit</button>
        <button class="pb pb-del" onclick="delProd(${p.id})">Del</button>
      </div>
    </div>`).join('');
}

/* Autocomplete while typing */
function acSearch(rowId,val){
  const drop=$('ac-'+rowId); if(!drop)return;
  if(!val||val.length<1){acHide(rowId);return;}
  const q=val.toLowerCase();
  const m=getProds().filter(p=>p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)).slice(0,7);
  if(!m.length){acHide(rowId);return;}
  acIdx[rowId]=-1;
  drop.innerHTML=m.map((p,i)=>
    `<div class="ac-item" data-i="${i}" onmousedown="event.preventDefault();acApply(event,${rowId},${p.id})">
       <span class="ac-nm">${p.name}</span>
       <span class="ac-pr">${cfmt(p.price)} · ${p.gst}%</span>
     </div>`).join('');
  drop._m=m; drop.classList.add('open');
}
function acHide(id){const d=$('ac-'+id);if(d){d.classList.remove('open');d.innerHTML='';}}
function acApply(e,rowId,pid){
  e.preventDefault();
  const p=getProds().find(x=>x.id===pid); if(!p)return;
  const tr=$('row-'+rowId); if(!tr)return;
  const txt=tr.querySelector('input[type="text"]');
  const nums=tr.querySelectorAll('input[type="number"]');
  const sel=tr.querySelector('select');
  if(txt)txt.value=p.name;
  if(nums[1])nums[1].value=p.price;
  if(sel)sel.value=p.gst;
  calcRow(rowId); recalc(); sp(); acHide(rowId);
}
function acKey(e,rowId){
  const drop=$('ac-'+rowId); if(!drop||!drop.classList.contains('open'))return;
  const items=drop.querySelectorAll('.ac-item');
  if(e.key==='ArrowDown'){e.preventDefault();acIdx[rowId]=Math.min((acIdx[rowId]||0)+1,items.length-1);}
  else if(e.key==='ArrowUp'){e.preventDefault();acIdx[rowId]=Math.max((acIdx[rowId]||-1)-1,-1);}
  else if(e.key==='Enter'&&acIdx[rowId]>=0){e.preventDefault();const it=items[acIdx[rowId]];if(it)it.dispatchEvent(new MouseEvent('mousedown'));}
  else if(e.key==='Escape'){acHide(rowId);return;}
  items.forEach((it,i)=>it.classList.toggle('sel',i===acIdx[rowId]));
}

/* ════════════════════════════════════════════════
   INVOICE HISTORY + PAYMENT STATUS
════════════════════════════════════════════════ */
const HK='inv-history2';
function getHist(){return JSON.parse(localStorage.getItem(HK)||'[]');}
function setHist(a){
  localStorage.setItem(HK,JSON.stringify(a.slice(0,500)));
  if($('histDot'))$('histDot').style.display=a.length?'':'none';
}
function addToHistory(d){
  const h=getHist();
  const i=h.findIndex(x=>x.invNum===d.invNum);
  const e={invNum:d.invNum,clientName:d.clientName,date:d.invDate,dueDate:d.dueDate||'',
    total:d.total,gst:d.gst,sub:d.sub,status:i>=0?h[i].status:'pending',
    savedAt:new Date().toISOString(),snapshot:JSON.stringify(d)};
  if(i>=0)h[i]=e; else h.unshift(e);
  setHist(h);
  if($('histDot'))$('histDot').style.display='';
}
function setStatus(invNum,status){
  const h=getHist();
  const i=h.findIndex(x=>x.invNum===invNum);
  if(i>=0){h[i].status=status;setHist(h);}
}
function statusBadge(s){
  const m={paid:'badge-paid',pending:'badge-pending',overdue:'badge-overdue',partial:'badge-partial'};
  const l={paid:'✓ Paid',pending:'⏳ Pending',overdue:'⚠ Overdue',partial:'◑ Partial'};
  return`<span class="badge ${m[s]||'badge-pending'}">${l[s]||s}</span>`;
}
function renderHistory(){
  const q=($('histSearch')?.value||'').toLowerCase();
  const filt=$('histFilter')?.value||'all';
  const sort=$('histSort')?.value||'newest';
  let h=getHist();
  if(q) h=h.filter(x=>(x.invNum+x.clientName).toLowerCase().includes(q));
  if(filt!=='all') h=h.filter(x=>x.status===filt);
  if(sort==='newest')  h.sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt));
  if(sort==='oldest')  h.sort((a,b)=>new Date(a.savedAt)-new Date(b.savedAt));
  if(sort==='highest') h.sort((a,b)=>b.total-a.total);
  if(sort==='lowest')  h.sort((a,b)=>a.total-b.total);
  const tb=$('histBody'),em=$('histEmpty');
  if(!tb)return;
  if(!h.length){tb.innerHTML='';if(em)em.style.display='';return;}
  if(em)em.style.display='none';
  tb.innerHTML=h.map(x=>`
    <tr>
      <td><span class="hinvnum">${x.invNum}</span></td>
      <td style="font-weight:500">${x.clientName}</td>
      <td style="color:var(--tx2)">${x.date||'—'}</td>
      <td style="color:var(--tx2)">${x.dueDate||'—'}</td>
      <td style="text-align:right"><span class="hamt">${INR(x.total)}</span></td>
      <td>${statusBadge(x.status)}</td>
      <td style="white-space:nowrap;display:flex;gap:5px;align-items:center">
        <select class="ssel" onchange="setStatus('${x.invNum}',this.value);renderHistory()">
          <option value="pending" ${x.status==='pending'?'selected':''}>Pending</option>
          <option value="paid"    ${x.status==='paid'   ?'selected':''}>Paid</option>
          <option value="overdue" ${x.status==='overdue'?'selected':''}>Overdue</option>
          <option value="partial" ${x.status==='partial'?'selected':''}>Partial</option>
        </select>
        ${x.snapshot?`<button class="pb pb-use" onclick="reDownload('${x.invNum}')">↓PDF</button>`:''}
      </td>
    </tr>`).join('');
}
function reDownload(invNum){
  const e=getHist().find(x=>x.invNum===invNum);
  if(!e?.snapshot){showToast('⚠️','No data available','warn');return;}
  try{const d=JSON.parse(e.snapshot);loadDraft(d);setTimeout(generatePDF,400);}catch(e){showToast('⚠️','Could not re-download','warn');}
}
function flagOverdue(){
  const h=getHist();let changed=false;
  const td=(s)=>{if(!s)return null;const[dd,mm,yy]=s.split('/').map(Number);return new Date(yy,mm-1,dd);};
  const now=new Date();
  h.forEach(x=>{if(x.status==='pending'&&x.dueDate){const d=td(x.dueDate);if(d&&d<now){x.status='overdue';changed=true;}}});
  if(changed)setHist(h);
}

/* ════════════════════════════════════════════════
   WHATSAPP + EMAIL SHARE
════════════════════════════════════════════════ */
function shareWhatsApp(){
  const d=collectData();
  const sym=CFG.sym||'₹';
  const lines=[
    'Hello '+d.clientName+',',
    '',
    'Here are your invoice details:',
    '',
    '📄 Invoice: '+d.invNum,
    '📅 Date: '+d.invDate,
    '📅 Due: '+(d.dueDate||'As agreed'),
    '💰 Amount: '+sym+rawINR(d.total)+' (incl. GST)',
    '',
    '• Subtotal: '+sym+rawINR(d.sub),
    '• GST: '+sym+rawINR(d.gst),
    '• *Total: '+sym+rawINR(d.total)+'*',
    '',
    d.sellerUPI?'💳 UPI: '+d.sellerUPI:'',
    '',
    'Thank you for your business!',
    '— '+d.sellerName,
    d.sellerPhone?'📞 '+d.sellerPhone:'',
  ].filter(x=>x!==null).join('\n');
  window.open('https://wa.me/?text='+encodeURIComponent(lines),'_blank');
  showToast('💬','Opening WhatsApp…','');
}
function shareEmail(){
  const d=collectData();
  const sym=CFG.sym||'₹';
  const subj=encodeURIComponent('Invoice '+d.invNum+' from '+d.sellerName+' — '+sym+rawINR(d.total));
  const body=encodeURIComponent([
    'Dear '+d.clientName+',',
    '',
    'Please find the details for Invoice '+d.invNum+' below.',
    '',
    '  Invoice No. : '+d.invNum,
    '  Date        : '+d.invDate,
    '  Due Date    : '+(d.dueDate||'As agreed'),
    '  Subtotal    : '+sym+rawINR(d.sub),
    '  GST         : '+sym+rawINR(d.gst),
    '  Grand Total : '+sym+rawINR(d.total),
    '',
    d.note?'Terms: '+d.note:'',
    d.sellerUPI?'UPI Payment: '+d.sellerUPI:'',
    '',
    'Please process payment by the due date.',
    '',
    'Warm regards,',
    d.sellerName,
    d.sellerPhone||'',
    d.sellerEmail||'',
  ].filter(x=>x!==null).join('\n'));
  window.location.href='mailto:?subject='+subj+'&body='+body;
  showToast('📧','Email client opened','warn');
}

/* ════════════════════════════════════════════════
   SHARE LINK
════════════════════════════════════════════════ */
function generateShareLink(){
  const d=collectData();
  try{
    const payload=btoa(unescape(encodeURIComponent(JSON.stringify(d))));
    const url=window.location.href.split('#')[0]+'#inv/'+payload;
    if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(()=>showToast('🔗','Link copied!','ai')).catch(()=>prompt('Copy link:',url));
    } else prompt('Copy this link:',url);
  }catch(e){showToast('⚠️','Could not generate link','warn');}
}

/* ════════════════════════════════════════════════
   STAMP + SIGNATURE FILE
════════════════════════════════════════════════ */

function handleStamp(e){
  const f=e.target.files?.[0]; if(!f) return;
  if(f.size>2*1024*1024){showToast('⚠️','Max 2MB','warn');return;}
  const r=new FileReader();
  r.onload=ev=>{stampB64=ev.target.result;localStorage.setItem('inv-stamp2',stampB64);
    const t=$('stThumb');if(t){t.src=stampB64;t.classList.add('show');}showToast('🏅','Stamp saved','ai');};
  r.readAsDataURL(f);
}
function handleSigFile(e){
  const f=e.target.files?.[0]; if(!f) return;
  if(f.size>2*1024*1024){showToast('⚠️','Max 2MB','warn');return;}
  const r=new FileReader();
  r.onload=ev=>{sigFileB64=ev.target.result;localStorage.setItem('inv-sigfile2',sigFileB64);
    const t=$('sfThumb');if(t){t.src=sigFileB64;t.classList.add('show');}showToast('✍️','Signature saved','ai');};
  r.readAsDataURL(f);
}
function clearStamp(){stampB64='';localStorage.removeItem('inv-stamp2');const t=$('stThumb');if(t){t.src='';t.classList.remove('show');}const i=$('stInput');if(i)i.value='';}
function clearSigFile(){sigFileB64='';localStorage.removeItem('inv-sigfile2');const t=$('sfThumb');if(t){t.src='';t.classList.remove('show');}const i=$('sfInput');if(i)i.value='';}
function loadStampSig(){
  const s=localStorage.getItem('inv-stamp2');   if(s){stampB64=s;  const t=$('stThumb'); if(t){t.src=s; t.classList.add('show');}}
  const g=localStorage.getItem('inv-sigfile2'); if(g){sigFileB64=g;const t=$('sfThumb'); if(t){t.src=g; t.classList.add('show');}}
}

/* ════════════════════════════════════════════════
   CSV EXPORT
════════════════════════════════════════════════ */
function exportCSV(type){
  let rows=[],fn='';
  if(type==='invoices'){
    const h=getHist();
    rows=[['Invoice#','Client','Date','Due','Subtotal','GST','Total','Status'],
          ...h.map(x=>[x.invNum,x.clientName,x.date,x.dueDate,x.sub,x.gst,x.total,x.status])];
    fn='invoices.csv';
  } else if(type==='clients'){
    const c=JSON.parse(localStorage.getItem('inv-crm')||'[]');
    rows=[['Name','Address','State','GSTIN'],
          ...c.map(x=>[x.name,x.addr,x.state,x.gstin])];
    fn='clients.csv';
  } else if(type==='products'){
    rows=[['Name','Price','GST%','Description'],
          ...getProds().map(p=>[p.name,p.price,p.gst,p.desc])];
    fn='products.csv';
  }
  if(!rows.length){showToast('⚠️','No data to export','warn');return;}
  const csv=rows.map(r=>r.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download=fn; a.click();
  showToast('📊','Exported: '+fn,'');
}

/* ════════════════════════════════════════════════
   CLEAR ALL DATA
════════════════════════════════════════════════ */
function clearAllData(){
  if(!confirm('Delete ALL data? This cannot be undone!'))return;
  ['inv-drafts','inv-crm','inv-products2','inv-history2','inv-settings2',
   'inv-counter2','inv-biz-profile','inv-stamp2','inv-sigfile2','inv-theme',
   'inv-signature'].forEach(k=>localStorage.removeItem(k));
  location.reload();
}

/* ════════════════════════════════════════════════
   ENHANCED ANALYTICS
════════════════════════════════════════════════ */
function renderAnalytics(){
  const drafts=JSON.parse(localStorage.getItem('inv-drafts')||'[]');
  const hist=getHist();
  // Merge: history is primary, add drafts not in history
  const hNums=new Set(hist.map(h=>h.invNum));
  const all=[...hist,...drafts.filter(d=>!hNums.has(d.invNum)).map(d=>({
    invNum:d.invNum,clientName:d.clientName,date:d.invDate,dueDate:d.dueDate||'',
    total:d.total||0,gst:d.gst||0,sub:d.sub||0,status:'pending',savedAt:d.savedAt||new Date().toISOString()
  }))];
  const el=$('analyticsContent');
  if(!all.length){el.innerHTML='<div style="text-align:center;padding:40px;color:var(--tx3)">No data yet. Save invoices to see analytics.</div>';return;}
  const totRev=all.reduce((a,x)=>a+(x.total||0),0);
  const totGST=all.reduce((a,x)=>a+(x.gst||0),0);
  const paid=all.filter(x=>x.status==='paid').reduce((a,x)=>a+(x.total||0),0);
  const pending=all.filter(x=>x.status!=='paid').reduce((a,x)=>a+(x.total||0),0);
  const sym=CFG.sym||'₹';
  // Monthly buckets (6 months)
  const mo={};
  for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);mo[d.toLocaleDateString('en-IN',{month:'short',year:'2-digit'})]=0;}
  all.forEach(x=>{if(!x.savedAt)return;const k=new Date(x.savedAt).toLocaleDateString('en-IN',{month:'short',year:'2-digit'});if(k in mo)mo[k]+=(x.total||0);});
  // Client totals
  const cm=all.reduce((m,x)=>{m[x.clientName]=(m[x.clientName]||0)+(x.total||0);return m;},{});
  const top5=Object.entries(cm).sort((a,b)=>b[1]-a[1]).slice(0,5);
  // Service frequency
  const sm={};
  drafts.forEach(d=>{(d.items||[]).forEach(it=>{if(it.desc)sm[it.desc]=(sm[it.desc]||0)+1;});});
  const topSvc=Object.entries(sm).sort((a,b)=>b[1]-a[1]).slice(0,5);
  // Status counts
  const sc={paid:0,pending:0,overdue:0,partial:0};
  all.forEach(x=>{const s=x.status||'pending';if(sc[s]!==undefined)sc[s]++;});
  el.innerHTML=`
    <div class="kpirow">
      <div class="kpibox"><div class="kpival">${sym}${Number(totRev).toLocaleString('en-IN',{maximumFractionDigits:0})}</div><div class="kpilbl">Total Revenue</div><div class="kpisub">${all.length} invoices</div></div>
      <div class="kpibox"><div class="kpival">${sym}${Number(paid).toLocaleString('en-IN',{maximumFractionDigits:0})}</div><div class="kpilbl">Collected</div><div class="kpisub">${sc.paid} paid</div></div>
      <div class="kpibox"><div class="kpival">${sym}${Number(pending).toLocaleString('en-IN',{maximumFractionDigits:0})}</div><div class="kpilbl">Outstanding</div><div class="kpisub">${sc.pending+sc.overdue} pending</div></div>
      <div class="kpibox"><div class="kpival">${sym}${Number(totGST).toLocaleString('en-IN',{maximumFractionDigits:0})}</div><div class="kpilbl">Total GST</div><div class="kpisub">${top5[0]?'Top: '+top5[0][0].slice(0,10):''}</div></div>
    </div>
    <div class="analytics-grid">
      <div class="chart-wrap" style="grid-column:span 2"><div class="chart-title">Monthly Revenue</div><canvas id="cRev" height="110"></canvas></div>
      <div class="chart-wrap"><div class="chart-title">By Client</div><canvas id="cCli" height="150"></canvas></div>
      <div class="chart-wrap"><div class="chart-title">Payment Status</div><canvas id="cStat" height="150"></canvas></div>
      ${topSvc.length?`<div class="chart-wrap"><div class="chart-title">Top Services</div><canvas id="cSvc" height="150"></canvas></div>`:''}
    </div>`;
  Object.values(charts).forEach(c=>{try{c.destroy();}catch(e){}});charts={};
  const dk=document.documentElement.getAttribute('data-theme')==='dark';
  const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)';
  const tc=dk?'#7a90b0':'#3a5070';
  Chart.defaults.color=tc;
  charts.rev=new Chart($('cRev'),{type:'bar',data:{labels:Object.keys(mo),datasets:[{label:'Revenue',data:Object.values(mo),backgroundColor:'rgba(0,229,255,.22)',borderColor:'#00e5ff',borderWidth:2,borderRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:gc}},y:{grid:{color:gc},ticks:{callback:v=>sym+Number(v).toLocaleString('en-IN')}}}}});
  const cc=['#00e5ff99','#8b5cf699','#10b98199','#f59e0b99','#f8717199'];
  const ccb=['#00e5ff','#8b5cf6','#10b981','#f59e0b','#f87171'];
  charts.cli=new Chart($('cCli'),{type:'doughnut',data:{labels:top5.map(c=>c[0].slice(0,14)),datasets:[{data:top5.map(c=>c[1]),backgroundColor:cc,borderColor:ccb,borderWidth:2}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:10}}}}});
  charts.stat=new Chart($('cStat'),{type:'pie',data:{labels:['Paid','Pending','Overdue','Partial'],datasets:[{data:Object.values(sc),backgroundColor:['#10b98177','#f59e0b77','#f8717177','#818cf877'],borderColor:['#10b981','#f59e0b','#f87171','#818cf8'],borderWidth:2}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:10}}}}});
  if(topSvc.length&&$('cSvc')){charts.svc=new Chart($('cSvc'),{type:'bar',data:{labels:topSvc.map(s=>s[0].slice(0,13)),datasets:[{label:'Uses',data:topSvc.map(s=>s[1]),backgroundColor:'rgba(16,185,129,.3)',borderColor:'#10b981',borderWidth:2,borderRadius:6}]},options:{responsive:true,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:gc}},y:{grid:{color:gc}}}}});}
}

/* ════════════════════════════════════════════════
   PDF: stamp + history integration
   (generatePDF is defined once below — no patch)
════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════
   TAB SWITCH — extended
════════════════════════════════════════════════ */
function switchTab(name){
  const all=['editor','preview','analytics','crm','drafts','bizprofile','history','products','settings'];
  all.forEach(t=>{
    const p=$('panel-'+t),tb=$('tab-'+t);
    if(p)p.classList.remove('active');
    if(tb)tb.classList.remove('active');
  });
  const panel=$('panel-'+name),tab=$('tab-'+name);
  if(panel)panel.classList.add('active');
  if(tab)tab.classList.add('active');
  if(name==='preview')   refreshPreview();
  if(name==='analytics') renderAnalytics();
  if(name==='crm')       renderCRM();
  if(name==='drafts')    renderDrafts();
  if(name==='bizprofile')bpSyncPanelFields();
  if(name==='history')   renderHistory();
  if(name==='products')  renderProducts();
  if(name==='settings')  loadSettings();
}

/* ════════════════════════════════════════════════
   5-SECOND AUTO-SAVE
════════════════════════════════════════════════ */
let as5timer=null;
function startAutoSave5(){
  clearInterval(as5timer);
  as5timer=setInterval(()=>{
    if(CFG.autosave===false)return;
    const d=collectData();
    if(!d.sellerName&&!d.clientName&&!d.items.length)return;
    saveDraftSilent();
  },5000);
}

/* ════════════════════════════════════════════════
   HANDLE SHARED INVOICE LINK
════════════════════════════════════════════════ */
function checkShareLink(){
  if(!location.hash.startsWith('#inv/'))return;
  try{
    const d=JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(5)))));
    loadDraft(d);
    showToast('🔗','Shared invoice loaded','ai');
  }catch(e){}
}


setInterval(saveDraftSilent,2*60*1000);
window.addEventListener('DOMContentLoaded',()=>{
  // 1. Load settings (currency, prefix, GST defaults, toggles)
  loadSettings();

  // 2. Init defaults — uses auto invoice number from settings
  initDefaults();

  // 3. Add starter row
  addRow('Website Design & Development',1,'');
  recalc();

  // 4. Load saved business profile
  bpLoadOnBoot();

  // 5. Load stamp & signature
  loadStampSig();

  // 6. Tab dot indicators
  if(localStorage.getItem('inv-drafts'))   {try{$('draftDot').style.display='';}catch(e){}}
  if(localStorage.getItem('inv-crm'))      {try{$('crmDot').style.display='';}catch(e){}}
  if(getProds().length)                    {try{$('prodDot').style.display='';}catch(e){}}
  if(getHist().length)                     {try{$('histDot').style.display='';}catch(e){}}
  if(localStorage.getItem('inv-biz-profile')){try{$('bpDot').style.display='';}catch(e){}}

  // 7. Language
  setLang('en');

  // 8. Dark toggle sync
  const isdark=document.documentElement.getAttribute('data-theme')==='dark';
  if($('tglDark'))$('tglDark').checked=isdark;

  // 9. Start 5-second autosave
  startAutoSave5();

  // 10. Flag overdue invoices
  flagOverdue();

  // 11. Check for shared invoice in URL hash
  checkShareLink();
});
