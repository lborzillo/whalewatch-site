
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
    const sorted = Object.entries(symbolMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const whaleSymbols = document.getElementById('whale-top-symbols');
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
    const trades = data.shark_trades || [];
    const grouped = {};

    trades.forEach(t => {
      if (!grouped[t.symbol]) grouped[t.symbol] = [];
      grouped[t.symbol].push(t);
    });

    const summarized = Object.entries(grouped).map(([symbol, entries]) => {
      const total_volume = entries.reduce((acc, t) => acc + t.total_volume, 0);
      const avg_price = entries.reduce((acc, t) => acc + t.average_price * t.total_volume, 0) / total_volume;
      const last_seen = entries[entries.length - 1].last_seen;
      const confidence = entries[entries.length - 1].confidence;
      return { symbol, total_volume, average_price: avg_price, last_seen, confidence };
    });

    summarized.sort((a, b) => b.total_volume - a.total_volume);
    summarized.slice(0, 5).forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${t.symbol}: ${t.total_volume.toLocaleString()} shares @ $${t.average_price.toFixed(2)}`;
      container.appendChild(div);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = document.getElementById('shark-alerts');
    alerts.innerHTML = '';
    const trades = data.shark_trades || [];

    const highConfidence = trades.filter(t => t.confidence === 'High' || t.confidence === 'Medium');

    if (highConfidence.length === 0) {
      alerts.innerHTML = 'No high-confidence shark activity detected.';
      return;
    }

    highConfidence.slice(0, 3).forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `🔔 ${t.symbol} — ${t.total_volume.toLocaleString()} shares @ $${t.average_price.toFixed(2)} — Confidence: ${t.confidence}`;
      alerts.appendChild(div);
    });
  });

// Suggested Trade
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const suggestion = document.getElementById('suggested-trade');
    const trades = data.shark_trades || [];
    const good = trades.find(t => t.confidence === 'High');
    suggestion.innerText = good ? `Try selling a cash-secured PUT on ${good.symbol}. Both whales and sharks are circling.` : 'No alignment found. Explore manually.';
  });

// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.trades[data.trades.length - 1];
    const log = document.getElementById('live-trader-log');

    if (log && latest) {
      const total = (latest.premium * latest.size).toFixed(2);
      const line = `${latest.date} | HIDDEN | ${latest.size}× $${latest.strike} ${latest.type} | $${total}`;
      log.innerHTML = line + '<br><span style="font-size: 0.9em; color: #ccc;">Symbol hidden — upgrade for full trade details.</span>';
    }
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
