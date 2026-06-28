// ============================================================
// compare.js — Split Map Side-by-Side (FINAL)
// ============================================================

window._cmp = window._cmp || {};
if (!window._cmp.loaded) {
window._cmp.loaded = true;

let mapL = null, mapR = null;
let cmpLayerL = null, cmpLayerR = null;
let batasLayerL = null, batasLayerR = null;
let mapsInitialized = false;

const LC_COLOR  = { 1:'#2E8B57', 2:'#FFD700', 3:'#DC143C', 4:'#1E90FF' };
const ZAE_COLOR = { 1:'#22c55e', 2:'#f59e0b', 3:'#ef4444' };

function styleLcCmp(f)   { const c = LC_COLOR[f.properties.DN]  || '#aaa'; return { color:c, fillColor:c, weight:.5, fillOpacity:.7 }; }
function styleZaeCmp(f)  { const c = ZAE_COLOR[f.properties.DN] || '#aaa'; return { color:c, fillColor:c, weight:.5, fillOpacity:.65 }; }
function styleAlihCmp()  { return { color:'#7f1d1d', fillColor:'#dc2626', weight:1, fillOpacity:.65 }; }
function styleNdviCmp(f) {
  const grade = ['#a50026','#f46d43','#fee090','#a6d96a','#1a9850'];
  const c = grade[(f.properties.DN || 1) - 1] || '#aaa';
  return { color:c, fillColor:c, weight:.3, fillOpacity:.7 };
}

function getStyleFn(val) {
  if (val.startsWith('lc'))   return styleLcCmp;
  if (val.startsWith('ndvi')) return styleNdviCmp;
  if (val === 'zae')          return styleZaeCmp;
  if (val === 'alih')         return styleAlihCmp;
  return () => ({ color:'#888', fillOpacity:.5, weight:.5 });
}

function getPath(val) {
  const paths = {
    lc2017:'data/land2017.geojson', lc2021:'data/land2021.geojson', lc2025:'data/land2025.geojson',
    ndvi2017:'data/ndvi2017.geojson', ndvi2021:'data/ndvi2021.geojson', ndvi2025:'data/ndvi2025.geojson',
    zae:'data/zae.geojson', alih:'data/alihfungsi.geojson'
  };
  return paths[val] || null;
}

function getLabelText(val) {
  const labels = {
    lc2017:'Land Cover 2017', lc2021:'Land Cover 2021', lc2025:'Land Cover 2025',
    ndvi2017:'NDVI 2017', ndvi2021:'NDVI 2021', ndvi2025:'NDVI 2025',
    zae:'Zona Agro Ekologi', alih:'Alih Fungsi'
  };
  return labels[val] || val;
}

function loadLayer(val) {
  const path = getPath(val);
  if (!path) return Promise.resolve(null);
  return fetch(path)
    .then(r => r.json())
    .then(data => L.geoJSON(data, { style: getStyleFn(val) }))
    .catch(() => null);
}

function forceContainerHeight() {
  const shell = document.querySelector('.cmp-shell');
  const ml    = document.getElementById('map-l');
  const mr    = document.getElementById('map-r');
  if (shell) { shell.style.height = '520px'; shell.style.display = 'grid'; }
  if (ml)    { ml.style.height = '520px'; ml.style.minHeight = '520px'; ml.style.display = 'block'; }
  if (mr)    { mr.style.height = '520px'; mr.style.minHeight = '520px'; mr.style.display = 'block'; }
}

function initMaps() {
  if (mapsInitialized) {
    setTimeout(() => { mapL.invalidateSize(); mapR.invalidateSize(); }, 150);
    return;
  }

  forceContainerHeight();

  mapL = L.map('map-l', { center:[-7.692,110.410], zoom:13, zoomControl:false, attributionControl:false });
  mapR = L.map('map-r', { center:[-7.692,110.410], zoom:13, zoomControl:false, attributionControl:false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(mapL);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(mapR);

  let syncing = false;
  mapL.on('moveend', () => {
    if (syncing) return; syncing = true;
    mapR.setView(mapL.getCenter(), mapL.getZoom(), { animate:false });
    syncing = false;
  });
  mapR.on('moveend', () => {
    if (syncing) return; syncing = true;
    mapL.setView(mapR.getCenter(), mapR.getZoom(), { animate:false });
    syncing = false;
  });

  mapsInitialized = true;

  setTimeout(() => {
    mapL.invalidateSize();
    mapR.invalidateSize();
    applyCompare();
  }, 200);
}

function applyCompare() {
  if (!mapsInitialized) { initMaps(); return; }

  const valL = document.getElementById('sel-left')?.value  || 'lc2017';
  const valR = document.getElementById('sel-right')?.value || 'lc2025';

  document.getElementById('cmp-lbl-l').textContent = getLabelText(valL);
  document.getElementById('cmp-lbl-r').textContent = getLabelText(valR);

  if (cmpLayerL)  { mapL.removeLayer(cmpLayerL);  cmpLayerL  = null; }
  if (cmpLayerR)  { mapR.removeLayer(cmpLayerR);  cmpLayerR  = null; }
  if (batasLayerL){ mapL.removeLayer(batasLayerL); batasLayerL = null; }
  if (batasLayerR){ mapR.removeLayer(batasLayerR); batasLayerR = null; }

  fetch('data/batas.geojson')
    .then(r => r.json())
    .then(d => {
      const s = { color:'#16a34a', weight:2, fillOpacity:0, dashArray:'8,4' };
      batasLayerL = L.geoJSON(d, { style:s }).addTo(mapL);
      batasLayerR = L.geoJSON(d, { style:s }).addTo(mapR);
      try { mapL.fitBounds(batasLayerL.getBounds(), { padding:[20,20] }); } catch(_) {}
      try { mapR.fitBounds(batasLayerR.getBounds(), { padding:[20,20] }); } catch(_) {}
    })
    .catch(() => {});

  Promise.all([loadLayer(valL), loadLayer(valR)]).then(([gl, gr]) => {
    if (gl) { cmpLayerL = gl; gl.addTo(mapL); }
    if (gr) { cmpLayerR = gr; gr.addTo(mapR); }
  });
}

document.getElementById('btn-apply-cmp')?.addEventListener('click', () => {
  if (!mapsInitialized) initMaps();
  else applyCompare();
});

const cmpEl = document.getElementById('compare');
if (cmpEl) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      initMaps();
      observer.disconnect();
    }
  }, { threshold: 0.05 });
  observer.observe(cmpEl);
}

document.querySelectorAll('a[href="#compare"]').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(() => {
      if (!mapsInitialized) initMaps();
      else { mapL?.invalidateSize(); mapR?.invalidateSize(); }
    }, 300);
  });
});

} // end if !window._cmp.loaded