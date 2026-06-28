// ============================================================
// ui.js — Animasi, Scroll, Counter, Navbar, PDF
// ============================================================

// ---- NAVBAR scroll ----
const navbar=document.getElementById('navbar');
const sections=document.querySelectorAll('section[id]');
const navLinks=document.querySelectorAll('.nav-links a');
window.addEventListener('scroll',()=>{
  navbar.classList.toggle('scrolled',window.scrollY>40);
  let cur='';
  sections.forEach(s=>{if(window.scrollY>=s.offsetTop-90)cur=s.id;});
  navLinks.forEach(a=>a.classList.toggle('active',a.dataset.s===cur));
});

// ---- Hamburger ----
const ham=document.getElementById('hamburger');
const nl=document.querySelector('.nav-links');
ham?.addEventListener('click',()=>{
  const open=nl.style.display==='flex';
  Object.assign(nl.style,{display:open?'none':'flex',flexDirection:'column',position:'absolute',top:'68px',left:'0',right:'0',background:'rgba(255,255,255,.97)',padding:'16px 24px',borderBottom:'1px solid #e5e7eb',zIndex:'999',boxShadow:'0 8px 24px rgba(0,0,0,.1)'});
  if(open)nl.style.display='none';
});
navLinks.forEach(a=>a.addEventListener('click',()=>{if(window.innerWidth<=768)nl.style.display='none';}));

// ---- Reveal on scroll ----
const revEls=document.querySelectorAll('.reveal');
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const sibs=[...e.target.parentElement.querySelectorAll('.reveal')];
      e.target.style.transitionDelay=(sibs.indexOf(e.target)*80)+'ms';
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
  });
},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
revEls.forEach(el=>revObs.observe(el));

// ---- Animated counter ----
function animCount(el,target,dur=1400){
  const start=performance.now();
  const isLarge=target>100;
  (function tick(now){
    const p=Math.min((now-start)/dur,1);
    const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(e*target);
    if(p<1)requestAnimationFrame(tick);else el.textContent=target;
  })(start);
}
const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      animCount(e.target,parseInt(e.target.dataset.t));
      cntObs.unobserve(e.target);
    }
  });
},{threshold:.5});
document.querySelectorAll('[data-t]').forEach(el=>cntObs.observe(el));

// ---- Smooth scroll ----
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-68,behavior:'smooth'});}
  });
});

// ---- Inject Leaflet tooltip style (light) ----
const tipStyle=document.createElement('style');
tipStyle.textContent=`.tip-custom{background:#fff!important;border:1px solid #e5e7eb!important;color:#111827!important;border-radius:8px!important;font-family:'Plus Jakarta Sans',sans-serif!important;font-size:13px!important;padding:8px 12px!important;box-shadow:0 4px 16px rgba(0,0,0,.1)!important}.tip-custom::before{border-right-color:#e5e7eb!important}`;
document.head.appendChild(tipStyle);

// ---- PDF Download ----
async function downloadPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF('p','mm','a4');
  const W=210,margin=20;
  let y=margin;

  // Header
  doc.setFillColor(22,101,52);
  doc.rect(0,0,W,40,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);doc.setFont('helvetica','bold');
  doc.text('WebGIS ZAE — Laporan Monitoring Lahan',W/2,18,{align:'center'});
  doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text('Monitoring Alih Fungsi Lahan Pertanian · Kecamatan Ngaglik, Sleman',W/2,28,{align:'center'});
  doc.text('Teknik Geomatika · UPN "Veteran" Yogyakarta · '+new Date().toLocaleDateString('id-ID'),W/2,36,{align:'center'});
  y=52;

  // Ringkasan
  doc.setTextColor(22,101,52);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('1. Ringkasan Statistik',margin,y);y+=8;
  doc.setTextColor(55,65,81);doc.setFontSize(10);doc.setFont('helvetica','normal');
  const stats=[
    ['Lahan Pertanian Potensial (2017)','62%'],
    ['Area Mulai Terancam Urbanisasi','28%'],
    ['Total Alih Fungsi 2017–2025','41%'],
    ['Resolusi Data Sentinel-2','10 m'],
    ['Layer Data Tersedia','16+ layer'],
  ];
  stats.forEach(([k,v])=>{
    doc.setFont('helvetica','bold');doc.text(k+':',margin,y);
    doc.setFont('helvetica','normal');doc.text(v,margin+90,y);y+=7;
  });y+=6;

  // Tabel perubahan
  doc.setTextColor(22,101,52);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('2. Tabel Perubahan Penggunaan Lahan',margin,y);y+=8;
  const heads=['Kelas Tutupan','2017 (ha)','2021 (ha)','2025 (ha)','Δ 2017–2025'];
  const rows=[
    ['Vegetasi/Sawah','1.240','980','740','−500 ha'],
    ['Bangunan/Permukiman','420','680','960','+540 ha'],
    ['Lahan Terbuka','280','290','240','−40 ha'],
    ['Badan Air','60','50','60','±0 ha'],
  ];
  const cw=[55,28,28,28,35];
  doc.setFillColor(22,101,52);doc.rect(margin,y-5,W-2*margin,8,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(9);doc.setFont('helvetica','bold');
  let cx=margin;
  heads.forEach((h,i)=>{doc.text(h,cx+2,y);cx+=cw[i];});y+=5;
  rows.forEach((row,ri)=>{
    doc.setFillColor(ri%2===0?248:255,ri%2===0?250:255,ri%2===0?252:255);
    doc.rect(margin,y-4,W-2*margin,7,'F');
    doc.setTextColor(55,65,81);doc.setFont('helvetica','normal');
    cx=margin;
    row.forEach((cell,i)=>{doc.text(cell,cx+2,y);cx+=cw[i];});
    y+=7;
  });y+=8;

  // Zona ZAE
  doc.setTextColor(22,101,52);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('3. Klasifikasi Zona ZAE',margin,y);y+=8;
  const zonas=[
    {z:'ZONA AMAN (DN=1)',c:[22,163,74],t:'Lahan masih potensial untuk pertanian. Belum terdampak urbanisasi. Perlu dipertahankan melalui program LP2B dan larangan alih fungsi.'},
    {z:'ZONA MULAI TERANCAM (DN=2)',c:[217,119,6],t:'Mulai dekat permukiman dan jalan utama. Terdapat tekanan urbanisasi. Perlu monitoring intensif dan perketat zonasi RDTR.'},
    {z:'ZONA URBANISASI TINGGI (DN=3)',c:[220,38,38],t:'Alih fungsi lahan sudah signifikan. Didominasi bangunan dan permukiman. Perlu evaluasi dan penerapan RTH minimal 30%.'},
  ];
  zonas.forEach(({z,c,t})=>{
    doc.setFillColor(...c);doc.rect(margin,y-4,4,6,'F');
    doc.setTextColor(...c);doc.setFontSize(10);doc.setFont('helvetica','bold');
    doc.text(z,margin+7,y);y+=6;
    doc.setTextColor(75,85,99);doc.setFont('helvetica','normal');doc.setFontSize(9);
    const lines=doc.splitTextToSize(t,W-2*margin-10);
    doc.text(lines,margin+7,y);y+=lines.length*5+5;
  });y+=5;

  // Stakeholder
  doc.setTextColor(22,101,52);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('4. Stakeholder Terkait',margin,y);y+=8;
  doc.setTextColor(75,85,99);doc.setFont('helvetica','normal');doc.setFontSize(10);
  ['BAPPEDA Kabupaten Sleman','Dinas Pertanian Pangan & Perikanan','Pemerintah Kecamatan/Desa','Petani & Masyarakat Setempat','Akademisi & Peneliti'].forEach(s=>{
    doc.text('• '+s,margin+4,y);y+=6;
  });y+=6;

  // Footer
  doc.setFillColor(243,244,246);doc.rect(0,280,W,17,'F');
  doc.setTextColor(107,114,128);doc.setFontSize(9);doc.setFont('helvetica','italic');
  doc.text('Laporan ini digenerate otomatis dari WebGIS ZAE · Teknik Geomatika UPN Veteran Yogyakarta',W/2,290,{align:'center'});

  doc.save('Laporan_WebGIS_ZAE_Ngaglik.pdf');
  if(window.showToast)showToast('✅ Laporan PDF berhasil diunduh!');
}

document.getElementById('btn-pdf')?.addEventListener('click',downloadPDF);
document.getElementById('btn-pdf2')?.addEventListener('click',downloadPDF);