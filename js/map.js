// ============================================================
// map.js — Inisialisasi Peta Utama
// ============================================================
const map = L.map('map',{center:[-7.692,110.410],zoom:13,zoomControl:false,attributionControl:false});

// BASEMAP
const bmOsm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OSM'}).addTo(map);
const bmSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{subdomains:['mt0','mt1','mt2','mt3'],maxZoom:20});
const bmHyb = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',{subdomains:['mt0','mt1','mt2','mt3'],maxZoom:20});
const bmTopo= L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenTopoMap'});

const basemaps={osm:bmOsm,satellite:bmSat,hybrid:bmHyb,topo:bmTopo};
let activeBm='osm';

// Controls
L.control.zoom({position:'bottomright'}).addTo(map);
L.control.scale({metric:true,imperial:false,position:'bottomright'}).addTo(map);
L.control.attribution({position:'bottomleft',prefix:''}).addTo(map);
map.attributionControl.addAttribution('© OSM | Sentinel-2 | DEMNAS');

// Koordinat mouse
const coordEl=document.getElementById('coord-box');
let cTimer;
map.on('mousemove',e=>{
  coordEl.textContent=`📍 ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
  coordEl.classList.add('show');
  clearTimeout(cTimer);
  cTimer=setTimeout(()=>coordEl.classList.remove('show'),2000);
});
map.on('mouseout',()=>coordEl.classList.remove('show'));

// Basemap switcher
document.querySelectorAll('.bmap-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    if(b.dataset.bm===activeBm)return;
    map.removeLayer(basemaps[activeBm]);
    map.addLayer(basemaps[b.dataset.bm]);
    activeBm=b.dataset.bm;
    document.querySelectorAll('.bmap-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
});

// Reset view
document.getElementById('btn-home')?.addEventListener('click',()=>map.flyTo([-7.692,110.410],13,{duration:1.2}));

// Fullscreen
document.getElementById('btn-fs')?.addEventListener('click',()=>{
  const el=document.getElementById('peta');
  if(!document.fullscreenElement)el.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// Geolocation
document.getElementById('btn-locate')?.addEventListener('click',()=>{
  map.locate({setView:true,maxZoom:15});
  map.once('locationfound',e=>{
    L.circleMarker(e.latlng,{radius:10,color:'#16a34a',fillColor:'#22c55e',fillOpacity:.8}).addTo(map)
      .bindPopup('📍 Lokasi Kamu').openPopup();
    showToast('📍 Lokasi ditemukan!');
  });
  map.once('locationerror',()=>showToast('❌ Lokasi tidak dapat diakses'));
});

// Measure tool (sederhana toggle)
let measMode=false;let measPts=[];let measLine=null;
document.getElementById('btn-measure')?.addEventListener('click',function(){
  measMode=!measMode;
  this.classList.toggle('active-tool',measMode);
  if(!measMode){
    measPts=[];
    if(measLine){map.removeLayer(measLine);measLine=null;}
    showToast('📏 Mode ukur dimatikan');
  } else {
    measPts=[];
    showToast('📏 Klik dua titik di peta untuk mengukur jarak');
  }
});
map.on('click',e=>{
  if(!measMode)return;
  measPts.push(e.latlng);
  if(measLine){map.removeLayer(measLine);}
  if(measPts.length>=2){
    measLine=L.polyline(measPts,{color:'#16a34a',weight:2,dashArray:'6,4'}).addTo(map);
    const d=measPts[0].distanceTo(measPts[measPts.length-1]);
    const dist=d>1000?(d/1000).toFixed(2)+' km':d.toFixed(0)+' m';
    L.popup().setLatLng(measPts[measPts.length-1]).setContent(`<b>📏 Jarak:</b> ${dist}`).openOn(map);
    measPts=[];
  }
});

// Toast helper
function showToast(msg){
  const t=document.getElementById('toast-box');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}
window.showToast=showToast;