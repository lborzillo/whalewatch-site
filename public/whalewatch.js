// WhaleWatch JS loader

function toggleWhaleBot() {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Whale Meter
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const meterCard = document.getElementById('whale-meter-card');
    const totalCalls = data.whale_trades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.premium, 0);
    const totalPuts = data.whale_trades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.premium, 0);
    const total = totalCalls + totalPuts;
    const callPct = total > 0 ? Math.round((totalCalls / total) * 100) : 50;
    const putPct = 100 - callPct;
    const gradient = `linear-gradient(to right, #00ff99 ${callPct}%, #ff3366 ${putPct}%)`;
    meterCard.innerHTML = `
      <h2>💨 Whale Meter</h2>
      <div style="height: 20px; background: ${gradient}; border-radius: 10px;"></div>
      <p>🟢 Green = Bullish (Calls) · 🔴 Red = Bearish (Puts)</p>
      <p>Total Premium: $${total.toLocaleString()}</p>
    `;
  }).catch(() => {
    document.getElementById('whale-meter-card').innerHTML = '<p>Error loading whale data.</p>';
  });

// Top Whale Symbols
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const symbols = {};
    data.whale_trades.forEach(t => {
      symbols[t.symbol] = (symbols[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbols).sort((a, b) => b[1] - a[1]).slice(0, 10);
    document.getElementById('top-whales').innerHTML = '<h2>📈 Top 10 Whale Symbols by Premium</h2><ul>' +
      sorted.map(([s, p]) => `<li>${s}: $${p.toLocaleString()}</li>`).join('') + '</ul>';
  });

// Sentiment Timeline
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    const bar = `<div style="height: 20px; background: linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%); border-radius: 10px;"></div>`;
    document.getElementById('sentiment-timeline').innerHTML = `
      <h2>🌐 Sentiment Timeline</h2>
      ${bar}
      <p>🐂 Bullish: ${latest.bullish_pct.toFixed(1)}% | 🐻 Bearish: ${latest.bearish_pct.toFixed(1)}%</p>
    `;
  });

// Shark Meter
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const count = data.trades.length;
    document.getElementById('shark-meter').innerHTML = `<h2>🦈 Shark Meter</h2><p>${count} dark pool trades logged.</p>`;
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = data.alerts || [];
    document.getElementById('shark-alerts').innerHTML = alerts.length ?
      `<h2>⚡ Shark Alerts</h2><ul>${alerts.map(a => `<li>${a.symbol} – ${a.volume} shares @ $${a.price} (Confidence: ${a.confidence})</li>`).join('')}</ul>` :
      '<p>No Shark Alerts</p>';
  });

// Suggested Trade
fetch('suggested.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('suggested-trade').innerHTML = `<p>${data.trade || 'No alignment today.'}</p>`;
  });

// Live Trades
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const t = data.trades[0];
    document.getElementById('live-trades').innerText = `${t.date} | ${t.type} | ${t.size}x $${t.strike} | $${(t.premium * t.size).toFixed(2)}`;
  });
