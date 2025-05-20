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

    // Timestamp
    const whaleStamp = document.getElementById('timestamp-whales');
    if (data.timestamp && whaleStamp) {
      whaleStamp.innerText = `Last Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }

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
    const latest = data?.sentiment_timeline?.at(-1);
    if (!latest) {
      document.getElementById('sentiment-timeline').innerText = 'No sentiment data available.';
      return;
    }

    const bull = latest.bullish_pct;
    const bear = latest.bearish_pct;

    document.getElementById('sentiment-timeline').innerHTML = `
      <div style="height: 20px; border-radius: 10px; overflow: hidden; background: linear-gradient(to right, #00ffcc ${bull}%, #002b3f ${bear}%); margin-bottom: 0.5em;"></div>
      <div>🐂 Bullish: ${bull.toFixed(1)}% | 🐻 Bearish: ${bear.toFixed(1)}%</div>
    `;

    const stamp = document.getElementById('timestamp-sentiment');
    if (data.timestamp && stamp) {
      stamp.innerText = `Last Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
  });

// Load Shark Meter and Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const sharkBox = document.getElementById('shark-meter');
    const alerts = document.getElementById('shark-alerts');

    if (data.trades && data.trades.length) {
      sharkBox.innerHTML = `<div>${data.trades.length} dark pool trades loaded.</div>`;
    } else {
      sharkBox.innerHTML = 'No dark pool activity detected.';
    }

    if (data.alerts && data.alerts.length) {
      const a = data.alerts[0];
      alerts.innerHTML = `<strong>${a.symbol}</strong> | Volume: ${a.volume.toLocaleString()} | Confidence: ${a.confidence}`;
    } else {
      alerts.innerText = 'No Shark Alerts today.';
    }

    const stamp = document.getElementById('timestamp-sharks');
    if (data.timestamp && stamp) {
      stamp.innerText = `Last Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
  });

// Load Suggested Trade
fetch('suggested.json')
  .then(res => res.json())
  .then(data => {
    const block = document.getElementById('suggested-trade');
    block.innerText = data.trade || 'No alignment today. Explore other setups!';

    const stamp = document.getElementById('timestamp-suggested');
    if (data.timestamp && stamp) {
      stamp.innerText = `Last Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
  });

// Load Live Trade Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const t = data.trades?.[0];
    const log = document.getElementById('live-trades');
    if (!t || !log) {
      log.innerText = 'No recent trades logged.';
      return;
    }

    const date = new Date(t.date).toLocaleDateString('en-US');
    log.innerText = `${date} | ${t.size}x $${t.strike} ${t.type} | Premium: $${(t.size * t.premium).toFixed(2)}`;

    const stamp = document.getElementById('timestamp-trades');
    if (data.timestamp && stamp) {
      stamp.innerText = `Last Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
  });
