// Whale Meter
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((acc, t) => acc + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((acc, t) => acc + t.premium, 0);
    const total = calls + puts;
    const sentiment = total === 0 ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';

    const whaleMeterBar = document.getElementById('whale-meter-bar');
    const whaleMeterText = document.getElementById('whale-sentiment');
    const premiumTotal = document.getElementById('whale-premium-total');

    if (whaleMeterBar && whaleMeterText && premiumTotal) {
      whaleMeterBar.style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
      whaleMeterText.innerText = `Whale Sentiment: ${sentiment}`;
      premiumTotal.innerText = `Total Premium Traded: $${total.toLocaleString()}`;
    }

    // Top 10 Symbols
    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const whaleSymbols = document.getElementById('whale-symbols');
    if (whaleSymbols) {
      whaleSymbols.innerHTML = '';
      sorted.forEach(([symbol, premium]) => {
        const li = document.createElement('li');
        li.textContent = `${symbol}: $${premium.toLocaleString()}`;
        whaleSymbols.appendChild(li);
      });
    }
  });

// Sentiment Timeline
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    const bar = document.getElementById('sentiment-bar');
    const text = document.getElementById('sentiment-text');

    if (bar && text) {
      bar.style.background = `linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%)`;
      text.innerHTML = `🐂 Bullish: ${latest.bullish_pct}% | 🐻 Bearish: ${latest.bearish_pct}%`;
    }
  });

// Shark Meter
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-meter');
    container.innerHTML = '';
    const symbols = Object.entries(data).sort((a, b) => b[1].total_volume - a[1].total_volume);

    symbols.slice(0, 5).forEach(([symbol, info]) => {
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${symbol}: ${info.total_volume.toLocaleString()} shares @ $${info.average_price}`;
      container.appendChild(div);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = document.getElementById('shark-alerts');
    alerts.innerHTML = '';

    const sorted = Object.entries(data)
      .filter(([_, v]) => v.confidence && v.confidence.toUpperCase() !== 'LOW')
      .sort((a, b) => b[1].total_volume - a[1].total_volume);

    if (sorted.length === 0) {
      alerts.innerHTML = 'No high-confidence shark activity detected.';
      return;
    }

    sorted.forEach(([symbol, info]) => {
      const div = document.createElement('div');
      div.innerHTML = `🔔 ${symbol} appeared ${info.frequency}x — Latest @ $${info.last_seen} — Confidence: ${info.confidence}`;
      alerts.appendChild(div);
    });
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
