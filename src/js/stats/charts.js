/* global Chart */
const styleVars = getComputedStyle(document.documentElement);
export const CHART_COLORS = {
  distance: styleVars.getPropertyValue('--accent-color').trim() || '#0d6efd',
  putt: styleVars.getPropertyValue('--chart-putt-color').trim() || '#32CD32',
  bar18: styleVars.getPropertyValue('--chart-18-color').trim() || '#006400',
  bar9: styleVars.getPropertyValue('--chart-9-color').trim() || '#32CD32',
  hcp: styleVars.getPropertyValue('--chart-hcp-color').trim() || '#FFA500',
  fw: styleVars.getPropertyValue('--chart-fw-color').trim() || '#1E90FF',
  gir: styleVars.getPropertyValue('--chart-gir-color').trim() || '#FF4500',
  trend: styleVars.getPropertyValue('--chart-trend-color').trim() || '#8A2BE2',
  sg: styleVars.getPropertyValue('--chart-sg-color').trim() || '#FF1493'
};

let hcpChart, puttChart, clubDistanceChart, fwGirChart, scoreTrendChart, sgChart;

function formatDate(d){
  return d.toLocaleDateString('it-IT');
}

export function drawClubDistanceChart(distances){
  if(clubDistanceChart){
    clubDistanceChart.destroy();
    clubDistanceChart = null;
  }
  if(!distances || !distances.length) return;
  const binSize = 10;
  const bins = {};
  distances.forEach(d=>{
    const b = Math.floor(d/binSize)*binSize;
    bins[b] = (bins[b]||0)+1;
  });
  const keys = Object.keys(bins).sort((a,b)=>a-b);
  const labels = keys.map(k=>`${k}-${Number(k)+binSize-1}`);
  const data = keys.map(k=>bins[k]);
  clubDistanceChart = new Chart(document.getElementById('club-distance-chart'),{
    type:'bar',
    data:{ labels, datasets:[{ label:'Distanza (m)', data, backgroundColor:CHART_COLORS.distance }]},
    options:{ scales:{ y:{ beginAtZero:true } } }
  });
}

export function renderClubDistanceChart(clubDistances, club){
  const distances = club === 'all'
    ? Object.values(clubDistances).flat()
    : (clubDistances[club] || []);
  drawClubDistanceChart(distances);
}

export function drawCharts(rounds, validRounds){
  const labels = rounds.map(r=>formatDate(r.date));
  const puttPct = rounds.map(r=>((r.putts / r.score)*100).toFixed(1));

  if(puttChart) puttChart.destroy();
  puttChart = new Chart(document.getElementById('puttChart'), {
    type:'bar',
    data:{ labels, datasets:[{ label:'% Putt', data: puttPct, backgroundColor:CHART_COLORS.putt }]},
    options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
  });

  if(hcpChart) hcpChart.destroy();
  const allLabels = rounds.map(r=>formatDate(r.date));
  const data18 = rounds.map(r=>r.format===18? r.score - r.par : null);
  const data9 = rounds.map(r=>r.format===9? r.score - r.par : null);

  const hcpData = allLabels.map(label=>{
    const match = validRounds.find(r=>formatDate(r.date)===label);
    return match ? ((match.holes.reduce((s,h)=>s+h.score,0) - match.totalPar)) : null;
  });

  hcpChart = new Chart(document.getElementById('hcpChart'), {
    type:'bar',
    data:{
      labels: allLabels,
      datasets:[
        { label:'18 buche', data:data18, backgroundColor:CHART_COLORS.bar18 },
        { label:'9 buche', data:data9, backgroundColor:CHART_COLORS.bar9 },
        { label:'Valido per Handicap', type:'line', data:hcpData, borderColor:CHART_COLORS.hcp, borderWidth:2, fill:false, tension:0.3 }
      ]
    },
    options:{ responsive:true, plugins:{ legend:{ position:'top' } } }
  });
}

export function drawFwGirChart(rounds){
  if(fwGirChart){
    fwGirChart.destroy();
    fwGirChart = null;
  }
  const labels = rounds.map(r=>formatDate(r.date));
  const fwPct = rounds.map(r=>{
    const total = r.holes.filter(h=>h.fairway!=='na').length;
    const hit = r.holes.filter(h=>h.fairway==='yes').length;
    return total?((hit/total)*100).toFixed(1):0;
  });
  const girPct = rounds.map(r=>{
    const count = r.holes.filter(h=>(h.score - h.putts)<=h.par-2).length;
    return r.holes.length?((count/r.holes.length)*100).toFixed(1):0;
  });
  fwGirChart = new Chart(document.getElementById('fwGirChart'), {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'% Fairway', data:fwPct, borderColor:CHART_COLORS.fw, fill:false },
        { label:'% GIR', data:girPct, borderColor:CHART_COLORS.gir, fill:false }
      ]
    },
    options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
  });
}

export function drawScoreTrendChart(trend){
  if(scoreTrendChart){
    scoreTrendChart.destroy();
    scoreTrendChart = null;
  }
  const labels = trend.map(t=>formatDate(t.date));
  const data = trend.map(t=>t.avg.toFixed(2));
  scoreTrendChart = new Chart(document.getElementById('scoreTrendChart'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Media Mobile Netto', data, borderColor:CHART_COLORS.trend, fill:false }]},
    options:{ scales:{ y:{ beginAtZero:false } } }
  });
}

export function drawSgChart(dataArr){
  if(sgChart){
    sgChart.destroy();
    sgChart = null;
  }
  const labels = dataArr.map(t=>formatDate(t.date));
  const data = dataArr.map(t=>t.sg.toFixed(2));
  sgChart = new Chart(document.getElementById('sgTrendChart'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Strokes Gained', data, borderColor:CHART_COLORS.sg, fill:false }]},
    options:{ scales:{ y:{ beginAtZero:false } } }
  });
}
