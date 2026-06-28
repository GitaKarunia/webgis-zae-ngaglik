// ============================================
// popup.js — Popup & Info Panel
// WebGIS ZAE · Monitoring Alih Fungsi Lahan
// ============================================

// Label kelas land cover
const labelLandCover = {
  1: '🌿 Vegetasi',
  2: '🟡 Lahan Terbuka',
  3: '🏘️ Bangunan',
  4: '💧 Air'
};

// Label zona urbanisasi
const labelUrbanisasi = {
  1: '🟢 Aman',
  2: '🟡 Mulai Terancam',
  3: '🔴 Urbanisasi Tinggi'
};

// Warna badge zona
const badgeColor = {
  1: '#22c55e',
  2: '#f59e0b',
  3: '#ef4444'
};

// ============================================
// UPDATE PANEL INFO KANAN
// ============================================

function updateInfoPanel(layerName, properties) {
  const panel = document.getElementById('info-content');

  let html = `<div class="info-layer-badge">${layerName}</div>`;
  html += '<table>';

  for (const [key, val] of Object.entries(properties)) {
    let displayVal = val;

    // Tampilkan label informatif untuk DN
    if (key === 'DN') {
      if (layerName.includes('Land') || layerName === 'Klasifikasi') {
        displayVal = labelLandCover[val] ?? val;
      } else if (layerName === 'Zona Urbanisasi') {
        displayVal = `<span style="color:${badgeColor[val] ?? '#fff'}">${labelUrbanisasi[val] ?? val}</span>`;
      }
    }

    html += `<tr><td>${key}</td><td>${displayVal ?? '—'}</td></tr>`;
  }

  html += '</table>';
  panel.innerHTML = html;
}

// ============================================
// FUNGSI POPUP & HIGHLIGHT — dipanggil onEachFeature
// ============================================

function popupLayer(layerName) {
  return function(feature, layer) {
    const props = feature.properties;

    // Simpan style asli
    const origStyle = layer.options.style
      ? layer.options.style(feature)
      : { weight: 0.5, color: '#888' };

    layer.on({
      mouseover(e) {
        e.target.setStyle({
          weight: 3,
          color: '#00e5ff',
          fillOpacity: 0.9
        });
        e.target.bringToFront();
      },
      mouseout(e) {
        // reset ke style asal
        if (e.target.options._layerRef) {
          e.target.options._layerRef.resetStyle(e.target);
        }
      },
      click(e) {
        updateInfoPanel(layerName, props);
        L.DomEvent.stopPropagation(e);
      }
    });

    // Tooltip ringan saat hover
    const dn = props.DN;
    let tooltipContent = '';

    if (layerName.includes('Land') || layerName === 'Klasifikasi') {
      tooltipContent = `<b>${layerName}</b><br>${labelLandCover[dn] ?? 'DN: ' + dn}`;
    } else if (layerName === 'Zona Urbanisasi') {
      tooltipContent = `<b>Zona Urbanisasi</b><br>${labelUrbanisasi[dn] ?? 'DN: ' + dn}`;
    } else if (layerName === 'Alih Fungsi') {
      tooltipContent = `<b>Alih Fungsi Lahan</b><br>🌾 → 🏙️`;
    } else {
      tooltipContent = `<b>${layerName}</b>`;
    }

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'custom-tooltip',
      offset: [12, 0]
    });
  };
}

// ============================================
// Reset info panel saat klik di luar layer
// ============================================

map.on('click', () => {
  const panel = document.getElementById('info-content');
  panel.innerHTML = `
    <div class="info-empty">
      <div class="info-empty-icon">🗺️</div>
      <p>Klik fitur di peta untuk melihat detail atributnya di sini.</p>
    </div>
  `;
});