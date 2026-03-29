/* ===========================
   BowlerStats - main.js
   Loads today.json and renders histograms
   =========================== */

// ---- Bowler color palette (cycles for up to 10 different bowlers)
const BOWLER_COLORS = [
  '#f5a623', '#22d3ee', '#a78bfa', '#34d399', '#fb7185',
  '#fbbf24', '#60a5fa', '#f472b6', '#4ade80', '#c084fc'
];

// ---- Utility: format date nicely
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// ---- Utility: map bowler names to colors (consistent per match)
function buildColorMap(overs1, overs2) {
  const map = {};
  let idx = 0;
  [...overs1, ...overs2].forEach(o => {
    if (!map[o.bowler]) {
      map[o.bowler] = BOWLER_COLORS[idx % BOWLER_COLORS.length];
      idx++;
    }
  });
  return map;
}

// ---- Compute summary stats from overs array
function computeStats(overs) {
  const totalRuns = overs.reduce((s, o) => s + o.runs, 0);
  const totalWickets = overs.reduce((s, o) => s + o.wickets, 0);
  const avgEcon = overs.length ? (totalRuns / overs.length).toFixed(1) : '0';
  const worstOver = overs.reduce((best, o) => o.runs > best.runs ? o : best, overs[0] || {runs: 0, over: '-'});
  return { totalRuns, totalWickets, avgEcon, worstOver };
}

// ---- Render Y-axis labels
function renderYAxis(maxRuns, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const steps = [0, Math.round(maxRuns * 0.33), Math.round(maxRuns * 0.67), maxRuns];
  steps.reverse().forEach(val => {
    const label = document.createElement('div');
    label.className = 'y-label';
    label.textContent = val;
    container.appendChild(label);
  });
}

// ---- Render histogram bars
function renderBars(overs, colorMap, barsContainerId, xLabelsId) {
  const barsContainer = document.getElementById(barsContainerId);
  const xLabels = document.getElementById(xLabelsId);
  if (!barsContainer || !xLabels) return;

  barsContainer.innerHTML = '';
  xLabels.innerHTML = '';

  const maxRuns = Math.max(...overs.map(o => o.runs), 1);

  // Tooltip element (shared)
  let tooltip = document.getElementById('barTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'bar-tooltip';
    tooltip.id = 'barTooltip';
    document.body.appendChild(tooltip);
  }

  overs.forEach((over, i) => {
    const heightPct = (over.runs / maxRuns) * 100;
    const color = colorMap[over.bowler] || BOWLER_COLORS[0];

    // Bar wrapper
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';

    // Wicket badge
    if (over.wickets > 0) {
      const badge = document.createElement('div');
      badge.className = 'wicket-badge';
      badge.textContent = `W${over.wickets > 1 ? over.wickets : ''}`;
      wrap.appendChild(badge);
    }

    // Run value label
    const val = document.createElement('div');
    val.className = 'bar-value';
    val.textContent = over.runs;
    wrap.appendChild(val);

    // Bar
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = heightPct + '%';
    bar.style.background = `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`;
    bar.style.boxShadow = `0 0 8px ${color}44`;
    wrap.appendChild(bar);

    // Tooltip
    wrap.addEventListener('mousemove', (e) => {
      tooltip.innerHTML = `
        <strong>Over ${over.over}</strong><br>
        Bowler: ${over.bowler}<br>
        Runs: <span style="color:${color};font-weight:700">${over.runs}</span>
        ${over.wickets > 0 ? `<br>Wickets: <span style="color:#e03e3e;font-weight:700">${over.wickets}</span>` : ''}
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 40) + 'px';
    });

    wrap.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    // Touch support
    wrap.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      tooltip.innerHTML = `<strong>Over ${over.over}</strong> | ${over.bowler}<br>Runs: ${over.runs}${over.wickets > 0 ? ` | W${over.wickets}` : ''}`;
      tooltip.style.display = 'block';
      tooltip.style.left = (t.clientX + 12) + 'px';
      tooltip.style.top = (t.clientY - 60) + 'px';
      setTimeout(() => tooltip.style.display = 'none', 2500);
    }, { passive: true });

    barsContainer.appendChild(wrap);

    // X label
    const xl = document.createElement('div');
    xl.className = 'x-label';
    xl.textContent = over.over;
    xLabels.appendChild(xl);
  });
}

// ---- Render bowler legend
function renderLegend(colorMap, legendId) {
  const container = document.getElementById(legendId);
  if (!container) return;
  container.innerHTML = '';
  Object.entries(colorMap).forEach(([bowler, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${bowler}`;
    container.appendChild(item);
  });
}

// ---- Main: Load and render today's match
async function loadTodayMatch() {
  try {
    const res = await fetch('data/today.json');
    if (!res.ok) throw new Error('Match data not found');
    const match = await res.json();

    // Hero section
    document.getElementById('tournamentBadge').textContent = match.tournament;
    document.getElementById('matchTitle').textContent = `${match.team1} VS ${match.team2}`;
    document.getElementById('venueText').textContent = match.venue;
    document.getElementById('dateText').textContent = formatDate(match.date);

    const statusBadge = document.getElementById('statusBadge');
    if (match.status === 'live') {
      statusBadge.textContent = '🔴 LIVE MATCH';
      statusBadge.className = 'status-badge status-live';
    } else {
      statusBadge.textContent = match.result || 'Completed';
      statusBadge.className = 'status-badge status-completed';
    }

    // Stats
    const allOvers = [...match.team1Bowling.overs, ...match.team2Bowling.overs];
    const stats1 = computeStats(match.team1Bowling.overs);
    const stats2 = computeStats(match.team2Bowling.overs);
    const totalRuns = stats1.totalRuns + stats2.totalRuns;
    const totalWickets = stats1.totalWickets + stats2.totalWickets;
    const avgEcon = ((stats1.totalRuns / 20 + stats2.totalRuns / 20) / 2).toFixed(1);
    const worst = allOvers.reduce((b, o) => o.runs > b.runs ? o : b, allOvers[0]);

    document.getElementById('statTotalRuns').textContent = totalRuns;
    document.getElementById('statWickets').textContent = totalWickets;
    document.getElementById('statAvgEcon').textContent = avgEcon;
    document.getElementById('statWorstOver').textContent = `${worst.runs} (O${worst.over})`;
    document.getElementById('statsOverview').style.display = 'grid';

    // Build color maps
    const colorMap1 = buildColorMap(match.team1Bowling.overs, []);
    const colorMap2 = buildColorMap(match.team2Bowling.overs, []);

    // Max runs for consistent Y-axis
    const maxRuns1 = Math.max(...match.team1Bowling.overs.map(o => o.runs));
    const maxRuns2 = Math.max(...match.team2Bowling.overs.map(o => o.runs));

    // Labels
    document.getElementById('team1Label').textContent = match.team1Bowling.label;
    document.getElementById('team2Label').textContent = match.team2Bowling.label;

    // Render
    renderYAxis(maxRuns1, 'yAxis1');
    renderBars(match.team1Bowling.overs, colorMap1, 'bars1', 'xLabels1');
    renderLegend(colorMap1, 'legend1');

    renderYAxis(maxRuns2, 'yAxis2');
    renderBars(match.team2Bowling.overs, colorMap2, 'bars2', 'xLabels2');
    renderLegend(colorMap2, 'legend2');

    // Show charts
    document.getElementById('chartSection').style.display = 'flex';

    // Description
    document.getElementById('matchDescription').textContent = match.description || '';
    if (match.result) {
      document.getElementById('resultTag').textContent = '🏆 ' + match.result;
    } else {
      document.getElementById('resultTag').style.display = 'none';
    }
    document.getElementById('matchDescSection').style.display = 'block';

    // Update page title for SEO
    document.title = `${match.team1} vs ${match.team2} Bowler Stats | ${match.tournament} | BowlerStats`;

  } catch (err) {
    console.error('Error loading match:', err);
    document.getElementById('matchTitle').textContent = 'No Match Today';
    document.getElementById('matchMeta').style.display = 'none';
    document.getElementById('statusBadge').style.display = 'none';
  }
}

// ---- Load previous matches list
async function loadPreviousMatches() {
  const grid = document.getElementById('previousMatchesGrid');
  if (!grid) return;

  try {
    const res = await fetch('data/matches-index.json');
    if (!res.ok) throw new Error();
    const matches = await res.json();

    if (!matches.length) {
      grid.innerHTML = '<p class="loading-text">No previous matches yet.</p>';
      return;
    }

    grid.innerHTML = '';
    matches.forEach(m => {
      const card = document.createElement('a');
      card.className = 'match-card';
      card.href = `pages/match.html?id=${m.matchId}`;
      card.innerHTML = `
        <div>
          <div class="match-card-teams">${m.team1} VS ${m.team2}</div>
          <div class="match-card-meta">📍 ${m.venue} &nbsp;|&nbsp; ${m.tournament}</div>
        </div>
        <div>
          <div class="match-card-result">${m.result || 'View Analysis'}</div>
          <div class="match-card-date">${formatDate(m.date)}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = '<p class="loading-text">No previous matches yet.</p>';
  }
}

// ---- Mobile nav toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('open');
});

// ---- Init
loadTodayMatch();
loadPreviousMatches();
