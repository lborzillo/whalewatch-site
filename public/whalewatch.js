
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

    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const whaleSymbols = document.getElementById('whale-top-symbols');
    if (whaleSymbols) {
      whaleSymbols.innerHTML = '';
      sorted.forEach(([symbol, premium]) => {
        const li = document.createElement('div');
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
    if (!container) return;
    container.innerHTML = '';
    const counts = {};

    data.shark_trades.forEach(trade => {
      counts[trade.symbol] = counts[trade.symbol] || { total_volume: 0, price_sum: 0, count: 0 };
      counts[trade.symbol].total_volume += trade.total_volume;
      counts[trade.symbol].price_sum += trade.average_price;
      counts[trade.symbol].count += 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1].total_volume - a[1].total_volume).slice(0, 5);

    sorted.forEach(([symbol, info]) => {
      const avgPrice = info.price_sum / info.count;
      const div = document.createElement('div');
      div.textContent = `🦈 ${symbol}: ${info.total_volume.toLocaleString()} shares @ $${avgPrice.toFixed(2)}`;
      container.appendChild(div);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-alerts');
    if (!container) return;
    container.innerHTML = '';
    const alerts = {};

    data.shark_trades.forEach(trade => {
      if (trade.confidence.toUpperCase() !== 'LOW') {
        if (!alerts[trade.symbol]) {
          alerts[trade.symbol] = { volume: 0, price: trade.average_price, confidence: trade.confidence };
        }
        alerts[trade.symbol].volume += trade.total_volume;
      }
    });

    Object.entries(alerts).forEach(([symbol, alert]) => {
      const div = document.createElement('div');
      div.textContent = `🔔 ${symbol} — ${alert.volume.toLocaleString()} shares @ $${alert.price.toFixed(2)} — Confidence: ${alert.confidence}`;
      container.appendChild(div);
    });
  });

// Suggested Trade
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const suggestion = document.getElementById('suggested-trade');
    if (!suggestion) return;

    const highConfidence = data.shark_trades.filter(t => t.confidence === 'High');
    const symbols = [...new Set(highConfidence.map(t => t.symbol))];

    if (symbols.includes('TSLA')) {
      suggestion.textContent = 'Try selling a cash-secured PUT on TSLA. Both whales and sharks are circling.';
    } else {
      suggestion.textContent = 'No high-confidence overlaps found today. Explore the data for opportunities.';
    }
  });

// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('live-trade');
    if (!container) return;

    const today = data.trades.filter(t => t.date === '2025-05-15');
    const calls = today.filter(t => t.type === 'CALL').reduce((acc, t) => acc + (t.premium * t.size), 0);
    const puts = today.filter(t => t.type === 'PUT').reduce((acc, t) => acc + (t.premium * t.size), 0);
    const total = calls + puts;

    container.innerHTML = `
      <strong>Calls:</strong> $${calls.toFixed(2)} | <strong>Puts:</strong> $${puts.toFixed(2)}<br>
      <strong>Total Premium:</strong> $${total.toFixed(2)}<br>
      <em>Symbols hidden — upgrade to see full trade details.</em>
    `;
  });

// WhaleBot Panel Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
