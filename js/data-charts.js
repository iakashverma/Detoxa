// ============================================================
// DETOXA — Data page charts (Chart.js)
// All numbers below are computed directly from the cleaned
// 277-respondent dataset. See clean_analyze.py / stats.json.
// ============================================================

const PALETTE = {
  clay: '#C1554A',
  clayDim: '#E8C9C4',
  sage: '#5C7F66',
  sageDim: '#D7E0D9',
  gold: '#B98B2E',
  ink: '#1B2230',
  inkSoft: '#3D4456',
  gray: '#6B6F76',
  line: '#DCD6C9',
  paper: '#F7F5F1',
};

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = PALETTE.inkSoft;
Chart.defaults.font.size = 12.5;

const baseGrid = { color: PALETTE.line, drawBorder: false };

document.addEventListener('DOMContentLoaded', () => {

  // ---------- 1. Jeopardized (doughnut) ----------
  new Chart(document.getElementById('chartJeopardized'), {
    type: 'doughnut',
    data: {
      labels: ['Yes — definitely', 'Maybe', 'No', 'Unknown'],
      datasets: [{
        data: [140, 67, 69, 1],
        backgroundColor: [PALETTE.clay, PALETTE.gold, PALETTE.sage, PALETTE.line],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} respondents (${(ctx.parsed/277*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  // ---------- 2. Quit consistency groups (doughnut) ----------
  new Chart(document.getElementById('chartConsistency'), {
    type: 'doughnut',
    data: {
      labels: ['Never tried', 'Tried inconsistently', 'Tried consistently'],
      datasets: [{
        data: [46, 138, 85],
        backgroundColor: [PALETTE.line, PALETTE.gold, PALETTE.sage],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} respondents (${(ctx.parsed/269*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  // ---------- 3. Frequency bars (Never..Always) ----------
  new Chart(document.getElementById('chartFreqBars'), {
    type: 'bar',
    data: {
      labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
      datasets: [{
        label: 'Respondents',
        data: [46, 45, 93, 45, 40],
        backgroundColor: [PALETTE.line, PALETTE.gold, PALETTE.clay, PALETTE.sage, PALETTE.sage],
        borderRadius: 4,
        maxBarThickness: 46,
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: (ctx) => `${ctx.parsed.y} respondents (${(ctx.parsed.y/269*100).toFixed(1)}%)`
      }}},
      scales: {
        y: { beginAtZero: true, grid: baseGrid, ticks: { stepSize: 20 } },
        x: { grid: { display: false } }
      }
    }
  });

  // ---------- 4. Awareness vs Action crosstab (stacked bar) ----------
  new Chart(document.getElementById('chartCrosstab'), {
    type: 'bar',
    data: {
      labels: ['Jeopardized: No', 'Jeopardized: Maybe', 'Jeopardized: Yes'],
      datasets: [
        { label: 'Tried to quit', data: [46, 39, 93], backgroundColor: PALETTE.sage, borderRadius: 4 },
        { label: 'Did not try', data: [35, 28, 34], backgroundColor: PALETTE.clayDim, borderRadius: 4 },
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } } },
      scales: {
        x: { stacked: true, grid: baseGrid },
        y: { stacked: true, grid: { display: false } }
      }
    }
  });

  // ---------- 5. Platform (horizontal bar) ----------
  new Chart(document.getElementById('chartPlatform'), {
    type: 'bar',
    data: {
      labels: ['Instagram', 'YouTube', 'WhatsApp', 'Snapchat', 'Facebook'],
      datasets: [{
        data: [135, 62, 62, 12, 6],
        backgroundColor: PALETTE.clay,
        borderRadius: 4,
        maxBarThickness: 28,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: (ctx) => `${ctx.parsed.x} respondents (${(ctx.parsed.x/277*100).toFixed(1)}%)`
      }}},
      scales: {
        x: { beginAtZero: true, grid: baseGrid },
        y: { grid: { display: false } }
      }
    }
  });

  // ---------- 6. Daily hours bucket (horizontal bar) ----------
  new Chart(document.getElementById('chartHours'), {
    type: 'bar',
    data: {
      labels: ['Less than 1 hr', '1–3 hrs', '3–5 hrs', 'More than 5 hrs'],
      datasets: [{
        data: [32, 149, 65, 31],
        backgroundColor: PALETTE.sage,
        borderRadius: 4,
        maxBarThickness: 28,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: (ctx) => `${ctx.parsed.x} respondents (${(ctx.parsed.x/277*100).toFixed(1)}%)`
      }}},
      scales: {
        x: { beginAtZero: true, grid: baseGrid },
        y: { grid: { display: false } }
      }
    }
  });

  // ---------- 7. Measures taken (horizontal bar) ----------
  new Chart(document.getElementById('chartMeasures'), {
    type: 'bar',
    data: {
      labels: [
        'Other genuine attempt',
        'Deleted / uninstalled apps',
        'Replaced with other activities',
        'App time limits / screen-time tools',
        'Sought support / talked to someone',
        'Digital detox / no-phone periods',
      ],
      datasets: [{
        data: [93, 28, 12, 9, 8, 5],
        backgroundColor: PALETTE.gold,
        borderRadius: 4,
        maxBarThickness: 26,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: (ctx) => `${ctx.parsed.x} mentions (of 155 valid free-text responses)`
      }}},
      scales: {
        x: { beginAtZero: true, grid: baseGrid },
        y: { grid: { display: false } }
      }
    }
  });

  // ---------- 8. Symptoms (doughnut, sparse base footnoted in copy) ----------
  new Chart(document.getElementById('chartSymptoms'), {
    type: 'doughnut',
    data: {
      labels: ['Anxiety', 'Depression', 'Other', 'ADHD'],
      datasets: [{
        data: [28, 18, 7, 6],
        backgroundColor: [PALETTE.clay, PALETTE.gold, PALETTE.line, PALETTE.sage],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} of 59 respondents (${(ctx.parsed/59*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

});
