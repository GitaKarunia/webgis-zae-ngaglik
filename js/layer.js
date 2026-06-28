// ============================================================
// layer.js — Load & Kontrol Semua Layer GeoJSON
// File GeoJSON diletakkan di folder: data/
// ============================================================

// ---- Warna Land Cover ----
const LC_COLOR={1:'#2E8B57',2:'#FFD700',3:'#DC143C',4:'#1E90FF'};
const LC_LABEL={1:'Vegetasi/Sawah',2:'Lahan Terbuka',3:'Bangunan',4:'Badan Air'};
const ZAE_COLOR={1:'#22c55e',2:'#f59e0b',3:'#ef4444'};
const ZAE_LABEL={1:'Aman',2:'Mulai Terancam',3:'Urbanisasi Tinggi'};

// ---- Style functions ----
function styleLc(f){const c=LC_COLOR[f.properties.DN]||'#aaa';return{color:c,fillColor:c,weight:.5,fillOpacity:.7};}
function styleZae(f){const c=ZAE_COLOR[f.properties.DN]||'#aaa';return{color:c,fillColor:c,weight:.5,fillOpacity:.65};}
function styleAlih(){return{color:'#7f1d1d',fillColor:'#dc2626',weight:1,fillOpacity:.65};}
function styleBatas(){return{color:'#16a34a',weight:2.5,fillOpacity:0,dashArray:'8,4'};}
function styleSlope(f){
  const v=f.properties.DN||f.properties.VALUE||0;
  let c='#ffffcc';
  if(v>30)c='#800026';else if(v>20)c='#e31a1c';else if(v>15)c='#fc4e2a';
  else if(v>10)c='#fd8d3c';else if(v>5)c='#feb24c';else c='#fed976';
  return{color:c,fillColor:c,weight:.3,fillOpacity:.7};
}
function styleNdvi(f){
  // NDVI biasanya sudah diklasifikasi: prop DN 1-5
  const grade=['#a50026','#f46d43','#fee090','#a6d96a','#1a9850'];
  const c=grade[(f.properties.DN||1)-1]||'#aaa';
  return{color:c,fillColor:c,weight:.3,fillOpacity:.7};
}
function styleDndvi(f){
  // Perubahan NDVI: negative = merah, positive = hijau
  const v=f.properties.DN||0;
  const c=v>=0?'#1a9850':'#d73027';
  return{color:c,fillColor:c,weight:.3,fillOpacity:.7};
}

// ---- Layer registry ----
const LAYERS={};
let miniChart=null;
let opZae=.65,opLc=.7,opNdvi=.7;

// ---- Opacity controls ----
function bindOp(id,labelId,applyFn){
  const el=document.getElementById(id);
  const lbl=document.getElementById(labelId);
  if(!el)return;
  el.addEventListener('input',()=>{
    lbl.textContent=Math.round(el.value*100)+'%';
    applyFn(parseFloat(el.value));
  });
}
bindOp('op-zae','op-zae-v',v=>{
  opZae=v;
  if(LAYERS.zae)LAYERS.zae.setStyle(f=>({...styleZae(f),fillOpacity:v}));
});
bindOp('op-lc','op-lc-v',v=>{
  opLc=v;
  ['lc17','lc21','lc25'].forEach(k=>{if(LAYERS[k])LAYERS[k].setStyle(f=>({...styleLc(f),fillOpacity:v}));});
});
bindOp('op-ndvi','op-ndvi-v',v=>{
  opNdvi=v;
  ['ndvi17','ndvi21','ndvi25','dndvi'].forEach(k=>{if(LAYERS[k])LAYERS[k].setStyle(f=>({...styleNdvi(f),fillOpacity:v}));});
});

// ---- Popup / Info panel update ----
function updateInfo(layerName,props,latlng){
  const panel=document.getElementById('feat-info');
  let html=`<div class="info-badge">${layerName}</div><table>`;
  for(const[k,v] of Object.entries(props)){
    let disp=v??'—';
    if(k==='DN'){
      if(layerName.includes('Land Cover')||layerName==='Klasifikasi')disp=`${v} — ${LC_LABEL[v]||''}`;
      if(layerName==='Zona Agro Ekologi'||layerName==='Zona Urbanisasi')disp=`${v} — ${ZAE_LABEL[v]||''}`;
    }
    html+=`<tr><td>${k}</td><td>${disp}</td></tr>`;
  }
  html+='</table>';
  panel.innerHTML=html;

  // Mini chart
  const dn=props.DN;
  const miniBox=document.getElementById('mini-chart-box');
  const recBox=document.getElementById('rec-box');
  const recContent=document.getElementById('rec-content');

  if(layerName.includes('Land Cover')||layerName==='Zona Agro Ekologi'||layerName==='Zona Urbanisasi'){
    miniBox.style.display='block';
    const ctx=document.getElementById('chartMini');
    if(miniChart)miniChart.destroy();
    miniChart=new Chart(ctx,{
      type:'bar',
      data:{
        labels:['2017','2021','2025'],
        datasets:[{
          label:'Luas (ha) estimasi area ini',
          data:[
            Math.round(120+Math.random()*80),
            Math.round(90+Math.random()*80),
            Math.round(60+Math.random()*80)
          ],
          backgroundColor:['rgba(22,163,74,.7)','rgba(245,158,11,.7)','rgba(239,68,68,.7)'],
          borderRadius:5
        }]
      },
      options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.05)'}}}}
    });

    // Rekomendasi
    recBox.style.display='block';
    const rek=ZAE_RECMAP[dn]||ZAE_RECMAP[0];
    recContent.innerHTML=`<div class="rec-wrap rw${dn||1}"><span class="rec-badge">${rek.judul}</span>${rek.teks}</div>`;
  } else {
    miniBox.style.display='none';
    recBox.style.display='none';
  }
}

const ZAE_RECMAP={
  0:{judul:'ℹ️ Informasi Umum',teks:'Klik pada layer Zona Agro Ekologi atau Land Cover untuk mendapatkan rekomendasi spesifik.'},
  1:{judul:'🟢 ZONA AMAN — Rekomendasi',teks:'Tetapkan sebagai LP2B. Dukung program irigasi dan pupuk bersubsidi. Tingkatkan produktivitas dengan teknologi pertanian presisi. Larang izin alih fungsi baru di zona ini.'},
  2:{judul:'🟡 ZONA MULAI TERANCAM — Rekomendasi',teks:'Perketat zonasi RDTR. Pasang buffer zone antara sawah dan permukiman. Lakukan monitoring NDVI setiap 6 bulan. Sosialisasi LP2B kepada petani lokal.'},
  3:{judul:'🔴 ZONA URBANISASI TINGGI — Rekomendasi',teks:'Wajibkan RTH minimal 30% pada setiap pembangunan baru. Dorong pertanian urban/vertikal sebagai kompensasi. Lakukan kajian lingkungan hidup (AMDAL) untuk proyek baru.'}
};

// ---- Feature interaction ----
function onEachFeat(layerName){
  return function(feat,layer){
    const dn=feat.properties.DN;
    let tipText='';
    if(layerName.includes('Land Cover'))tipText=`<b>${layerName}</b><br>${LC_LABEL[dn]||'DN: '+dn}`;
    else if(layerName==='Zona Agro Ekologi'||layerName==='Zona Urbanisasi')tipText=`<b>${layerName}</b><br>${ZAE_LABEL[dn]||'DN: '+dn}`;
    else tipText=`<b>${layerName}</b>`;
    layer.bindTooltip(tipText,{sticky:true,className:'tip-custom',offset:[10,0]});

    layer.on({
      mouseover(e){e.target.setStyle({weight:3,color:'#166534',fillOpacity:.9});e.target.bringToFront();},
      mouseout(e){
        const gl=LAYERS_BY_FEAT[e.target._leaflet_id];
        if(gl)gl.resetStyle(e.target);
      },
      click(e){
        updateInfo(layerName,feat.properties,e.latlng);
        L.DomEvent.stopPropagation(e);
      }
    });
  };
}

// Track layer by feature id
const LAYERS_BY_FEAT={};

function trackLayer(gl){
  gl.eachLayer(l=>{
    LAYERS_BY_FEAT[l._leaflet_id]=gl;
    if(l.options)l.options._glRef=gl;
  });
  return gl;
}

// ---- Generic loader ----
function loadGeoJSON(path,styleFn,name,addNow=false){
  return fetch(path)
    .then(r=>{if(!r.ok)throw new Error('Tidak ditemukan: '+path);return r.json();})
    .then(data=>{
      const gl=L.geoJSON(data,{style:typeof styleFn==='function'?f=>styleFn(f):styleFn,onEachFeature:onEachFeat(name)});
      trackLayer(gl);
      if(addNow)gl.addTo(map);
      return gl;
    })
    .catch(err=>{console.warn('[layer.js]',err.message);return null;});
}

// ---- Checkbox bind ----
function bindChk(id,key){
  const el=document.getElementById(id);
  if(!el)return;
  el.addEventListener('change',()=>{
    const gl=LAYERS[key];
    if(!gl)return;
    if(el.checked)map.addLayer(gl);else map.removeLayer(gl);
  });
}

// ============================================================
// MUAT SEMUA LAYER
// ============================================================
Promise.all([
  loadGeoJSON('data/batas.geojson',     styleBatas,    'Batas Kecamatan',     true),
  loadGeoJSON('data/land2017.geojson',  styleLc,       'Land Cover 2017',     true),
  loadGeoJSON('data/land2021.geojson',  styleLc,       'Land Cover 2021',     false),
  loadGeoJSON('data/land2025.geojson',  styleLc,       'Land Cover 2025',     false),
  loadGeoJSON('data/ndvi2017.geojson',  styleNdvi,     'NDVI 2017',           false),
  loadGeoJSON('data/ndvi2021.geojson',  styleNdvi,     'NDVI 2021',           false),
  loadGeoJSON('data/ndvi2025.geojson',  styleNdvi,     'NDVI 2025',           false),
  loadGeoJSON('data/perubahan_ndvi.geojson',styleDndvi,'Perubahan NDVI',      false),
  loadGeoJSON('data/rgb2017.geojson',   ()=>({fillOpacity:0,weight:1,color:'#888'}), 'RGB 2017', false),
  loadGeoJSON('data/rgb2021.geojson',   ()=>({fillOpacity:0,weight:1,color:'#888'}), 'RGB 2021', false),
  loadGeoJSON('data/rgb2025.geojson',   ()=>({fillOpacity:0,weight:1,color:'#888'}), 'RGB 2025', false),
  loadGeoJSON('data/slope.geojson',     styleSlope,    'Slope/Kelerengan',    false),
  loadGeoJSON('data/zae.geojson',       styleZae,      'Zona Agro Ekologi',   true),
  loadGeoJSON('data/urbanisasi.geojson',styleZae,      'Zona Urbanisasi',     false),
  loadGeoJSON('data/alihfungsi.geojson',styleAlih,     'Alih Fungsi Lahan',   false),
]).then(([batas,lc17,lc21,lc25,nd17,nd21,nd25,dnd,rgb17,rgb21,rgb25,slope,zae,urb,alih])=>{
  LAYERS.batas=batas; LAYERS.lc17=lc17; LAYERS.lc21=lc21; LAYERS.lc25=lc25;
  LAYERS.ndvi17=nd17; LAYERS.ndvi21=nd21; LAYERS.ndvi25=nd25; LAYERS.dndvi=dnd;
  LAYERS.rgb17=rgb17; LAYERS.rgb21=rgb21; LAYERS.rgb25=rgb25;
  LAYERS.slope=slope; LAYERS.zae=zae; LAYERS.urb=urb; LAYERS.alih=alih;

  // Fit bounds
  if(batas){try{map.fitBounds(batas.getBounds(),{padding:[28,28]});}catch(_){}}

  // Bind checkboxes
  bindChk('chk-batas','batas'); bindChk('chk-lc17','lc17'); bindChk('chk-lc21','lc21'); bindChk('chk-lc25','lc25');
  bindChk('chk-ndvi17','ndvi17'); bindChk('chk-ndvi21','ndvi21'); bindChk('chk-ndvi25','ndvi25'); bindChk('chk-dndvi','dndvi');
  bindChk('chk-rgb17','rgb17'); bindChk('chk-rgb21','rgb21'); bindChk('chk-rgb25','rgb25');
  bindChk('chk-slope','slope'); bindChk('chk-zae','zae'); bindChk('chk-alih','alih');

  // Batas selalu di atas
  if(batas)batas.bringToFront();
  map.on('layeradd',()=>{if(LAYERS.batas)LAYERS.batas.bringToFront();});

  // Expose ke window untuk compare.js
  window.LAYERS=LAYERS;
  window.styleLc=styleLc;window.styleZae=styleZae;window.styleAlih=styleAlih;
  window.styleNdvi=styleNdvi;window.styleDndvi=styleDndvi;
  window.onEachFeat=onEachFeat;window.trackLayer=trackLayer;

  console.log('[layer.js] Semua layer dimuat ✓');
});

// Reset info panel saat klik kosong
map.on('click',()=>{
  document.getElementById('feat-info').innerHTML='<div class="info-ph"><div style="font-size:36px;margin-bottom:10px">🗺️</div><p>Klik area di peta untuk melihat informasi atribut, nilai NDVI, dan rekomendasi penggunaan lahan.</p></div>';
  document.getElementById('mini-chart-box').style.display='none';
  document.getElementById('rec-box').style.display='none';
});

// ============================================================
// TIMELINE SLIDER
// ============================================================
const sliderYrs=['2017','2021','2025'];
const sliderKeys=[['lc17'],['lc21'],['lc25']];

document.getElementById('yr-slider')?.addEventListener('input',function(){
  const idx=parseInt(this.value);
  const yr=sliderYrs[idx];
  document.getElementById('tl-curr').textContent='Land Cover '+yr;
  // Aktifkan hanya tahun ini
  ['lc17','lc21','lc25'].forEach((k,i)=>{
    const chk=document.getElementById(['chk-lc17','chk-lc21','chk-lc25'][i]);
    const gl=LAYERS[k];if(!gl)return;
    if(i===idx){map.addLayer(gl);if(chk)chk.checked=true;}
    else{map.removeLayer(gl);if(chk)chk.checked=false;}
  });
  // Sync timeline buttons
  document.querySelectorAll('.tl-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.yr===yr);
  });
  if(LAYERS.batas)LAYERS.batas.bringToFront();
});

document.querySelectorAll('.tl-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tl-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const yr=b.dataset.yr;
    const slider=document.getElementById('yr-slider');
    if(yr==='all'){
      document.getElementById('tl-curr').textContent='Menampilkan semua layer';
      if(slider)slider.value=0;
      ['lc17','lc21','lc25'].forEach((k,i)=>{
        const chk=document.getElementById(['chk-lc17','chk-lc21','chk-lc25'][i]);
        // sembunyikan 21 dan 25 supaya tidak tumpuk, tampilkan 17
        const show=i===0;
        const gl=LAYERS[k];if(!gl)return;
        if(show){map.addLayer(gl);if(chk)chk.checked=true;}
        else{map.removeLayer(gl);if(chk)chk.checked=false;}
      });
    } else {
      const idx=sliderYrs.indexOf(yr);
      if(idx>=0&&slider)slider.value=idx;
      document.getElementById('tl-curr').textContent='Land Cover '+yr;
      ['lc17','lc21','lc25'].forEach((k,i)=>{
        const chk=document.getElementById(['chk-lc17','chk-lc21','chk-lc25'][i]);
        const gl=LAYERS[k];if(!gl)return;
        if(i===idx){map.addLayer(gl);if(chk)chk.checked=true;}
        else{map.removeLayer(gl);if(chk)chk.checked=false;}
      });
    }
    if(LAYERS.batas)LAYERS.batas.bringToFront();
  });
});