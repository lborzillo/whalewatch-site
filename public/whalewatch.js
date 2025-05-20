// Toggle the WhaleBot panel
function toggleWhaleBot() {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Load Whale Meter and Top Symbols
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const meter = document.getElementById('whale-meter');
    const totalPremium = data.whale_trades.reduce((sum, trade) => sum + trade.premium, 0);
    const callPremium = data.whale_trades
      .filter(t => t.type === 'CALL')
      .reduce((sum, t) => sum + t.premium, 0);
    const putPremium = totalPremium - callPremium;
    const callPct = (callPremium / totalPremium) * 100;
    const putPct = 100 - callPct;

    let gradient;
    if (callPct > 60) {
      gradient = `linear-gradient(to right, #00ff99 ${callPct}%, #002b3f ${putPct}%)`;
    } else if (putPct > 60) {
      gradient = `linear-gradient(to right, #ff3366 ${putPct}%, #002b3f ${callPct}%)`;
    } else {
      gradient = `linear-gradient(to right, #00ff99 ${callPct}%, #ff3366 ${putPct}%)`;
    }

    meter.innerHTML = `
      <div style="height: 20px; background: ${gradient}; border-radius: 10px; margin-bottom: 0.5em;"></div>
      <div style="font-size: 0.95em; color: #ccc;">Total Premium: $${totalPremium.toLocaleString()}</div>
    `;

    // Top 10 Symbols
    const symbols = {};
    data.whale_trades.forEach(t => {
      symbols[t.symbol] = (symbols[t.symbol] || 0) + t.premium;
    });

    const sorted = Object.entries(symbols)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([s, v]) => `<li>${s}: $${v.toLocaleString()}</li>`).join('');

    document.getElementById('top-whales').innerHTML = `<ul>${sorted}</ul>`;
  });

// Load Sentiment Timeline
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    const bull = latest.bullish_pct;
    const bear = latest.bearish_pct;
    document.getElementById('sentiment-timeline').innerHTML = `
      <div style="height: 20px; border-radius: 10px; overflow: hidden; background: linear-gradient(to right, #00ffcc ${bull}%, #002b3f ${bear}%); margin-bottom: 0.5em;"></div>
      <div>🐂 Bullish: ${bull.toFixed(1)}% | 🐻 Bearish: ${bear.toFixed(1)}%</div>
    `;
  });

// Load Shark Meter
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const sharkBox = document.getElementById('shark-meter');
    sharkBox.innerHTML = data.trades && data.trades.length
      ? `<div>${data.trades.length} dark pool trades loaded.</div>`
      : 'No dark pool activity detected.';

    const alerts = document.getElementById('shark-alerts');
    alerts.innerHTML = data.alerts && data.alerts.length
      ? `<strong>${data.alerts[0].symbol}</strong> | Volume: ${data.alerts[0].volume.toLocaleString()} | Confidence: ${data.alerts[0].confidence}`
      : 'No Shark Alerts today.';
  });

// Load Suggested Trade
fetch('suggested.json')
  .then(res => res.json())
  .then(data => {
    const block = document.getElementById('suggested-trade');
    block.innerText = data.trade || 'No alignment today. Explore other setups!';
  });

// Load Live Trade Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const t = data.trades[0];
    const date = new Date(t.date).toLocaleDateString('en-US');
    document.getElementById('live-trades').innerText = `${date} | ${t.size}x $${t.strike} ${t.type} | Premium: $${(t.size * t.premium).toFixed(2)}`;
  });
