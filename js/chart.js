// ============================================================
// chart.js — Chart.js Grafik Dashboard
// ============================================================
Chart.defaults.font.family="'Plus Jakarta Sans',sans-serif";
Chart.defaults.color='#6b7280';
Chart.defaults.borderColor='rgba(0,0,0,0.06)';

// 1. Tren penggunaan lahan
const ctxTren=document.getElementById('chartTren');
if(ctxTren){
  new Chart(ctxTren,{
    type:'bar',
    data:{
      labels:['2017','2021','2025'],
      datasets:[
        {label:'Vegetasi/Sawah',data:[1240,980,740],backgroundColor:'rgba(46,139,87,.75)',borderColor:'#2E8B57',borderWidth:1,borderRadius:6},
        {label:'Bangunan',data:[420,680,960],backgroundColor:'rgba(220,20,60,.75)',borderColor:'#DC143C',borderWidth:1,borderRadius:6},
        {label:'Lahan Terbuka',data:[280,290,240],backgroundColor:'rgba(255,215,0,.8)',borderColor:'#DAA520',borderWidth:1,borderRadius:6},
        {label:'Air',data:[60,50,60],backgroundColor:'rgba(30,144,255,.75)',borderColor:'#1E90FF',borderWidth:1,borderRadius:6}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'bottom',labels:{padding:14,boxWidth:12,font:{size:12}}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{family:"'DM Mono',monospace",size:12}}},
        y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>v+' ha',font:{family:"'DM Mono',monospace",size:11}}}
      }
    }
  });
}

// 2. Komposisi ZAE
const ctxZona=document.getElementById('chartZona');
if(ctxZona){
  new Chart(ctxZona,{
    type:'doughnut',
    data:{
      labels:['Zona Aman','Mulai Terancam','Urbanisasi Tinggi'],
      datasets:[{
        data:[38,28,34],
        backgroundColor:['rgba(34,197,94,.8)','rgba(245,158,11,.8)','rgba(239,68,68,.8)'],
        borderColor:['#22c55e','#f59e0b','#ef4444'],
        borderWidth:2,hoverOffset:8
      }]
    },
    options:{
      responsive:true,cutout:'62%',
      plugins:{
        legend:{position:'bottom',labels:{padding:14,boxWidth:12,font:{size:12}}},
        tooltip:{callbacks:{label:c=>` ${c.label}: ${c.parsed}%`}}
      }
    }
  });
}

// 3. Tren NDVI rata-rata
const ctxNdvi=document.getElementById('chartNdvi');
if(ctxNdvi){
  new Chart(ctxNdvi,{
    type:'line',
    data:{
      labels:['2017','2021','2025'],
      datasets:[
        {label:'NDVI Rata-rata',data:[0.52,0.41,0.31],borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,.1)',fill:true,tension:.4,pointRadius:5,pointBackgroundColor:'#16a34a'},
        {label:'NDVI Sawah',data:[0.68,0.58,0.44],borderColor:'#2E8B57',borderDash:[5,3],fill:false,tension:.4,pointRadius:4},
        {label:'NDVI Bangunan',data:[0.12,0.09,0.08],borderColor:'#DC143C',borderDash:[5,3],fill:false,tension:.4,pointRadius:4}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'bottom',labels:{padding:12,boxWidth:12,font:{size:12}}}},
      scales:{
        x:{grid:{display:false}},
        y:{min:0,max:.8,grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>v.toFixed(1)}}
      }
    }
  });
}

// 4. Laju alih fungsi
const ctxLaju=document.getElementById('chartLaju');
if(ctxLaju){
  new Chart(ctxLaju,{
    type:'bar',
    data:{
      labels:['2017–2018','2018–2019','2019–2020','2020–2021','2021–2022','2022–2023','2023–2024','2024–2025'],
      datasets:[{
        label:'Alih Fungsi (ha/thn)',
        data:[42,55,60,53,68,74,78,70],
        backgroundColor:ctx=>{
          const v=ctx.raw;
          if(v>70)return'rgba(239,68,68,.8)';
          if(v>55)return'rgba(245,158,11,.8)';
          return'rgba(34,197,94,.8)';
        },
        borderRadius:5
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:10}}},
        y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>v+' ha'}}
      }
    }
  });
}