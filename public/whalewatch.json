// Whale Meter
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.premium, 0);
    const total = calls + puts;
    const sentiment = total === 0 ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';

    document.getElementById('whale-sentiment').innerText = `Whale Sentiment: ${sentiment}`;
    document.getElementById('whale-premium-total').innerText = `Total Premium Traded: $${total.toLocaleString()}`;

    const bar = document.getElementById('whale-meter-bar');
    if (bar) {
      bar.style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
    }

    // Top 10 Symbols by Premium
    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const ul = document.getElementById('whale-symbols');
    if (ul) {
      ul.innerHTML = '';
      sorted.forEach(([symbol, premium]) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${symbol}</strong>: $${premium.toLocaleString()}`;
        ul.appendChild(li);
      });
    }
  });

// Sentiment Timeline
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    document.getElementById('sentiment-bar').style.background = `linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%)`;
    document.getElementById('sentiment-text').innerText = `🐂 Bullish: ${latest.bullish_pct}% | 🐻 Bearish: ${latest.bearish_pct}%`;
  });

// Shark Meter
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-meter');
    container.innerHTML = '';
    data.trades?.forEach(t => {
      const block = document.createElement('div');
      block.innerHTML = `<strong>${t.symbol}</strong> — ${t.volume.toLocaleString()} shares @ $${t.average_price}`;
      container.appendChild(block);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alertBox = document.getElementById('shark-alerts');
    alertBox.innerHTML = '';
    const alert = data.alerts?.[0];
    if (alert) {
      const block = document.createElement('div');
      block.innerHTML = `
        <strong>${alert.symbol}</strong> appeared <strong>${alert.frequency}x</strong> this week.<br>
        Total volume: <strong>${alert.total_volume.toLocaleString()}</strong><br>
        Most recent: ${alert.last_seen} @ $${alert.average_price}<br>
        Confidence Level: <strong>${alert.confidence}</strong>
      `;
      alertBox.appendChild(block);
    } else {
      alertBox.innerText = 'No high-confidence shark activity detected today.';
    }
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon')?.addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  }
});
