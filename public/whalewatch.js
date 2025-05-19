// === Whale Meter ===
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((acc, t) => acc + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((acc, t) => acc + t.premium, 0);
    const total = calls + puts;
    const sentiment = total === 0 ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';

    document.getElementById('whale-meter-bar').style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
    document.getElementById('whale-sentiment').innerText = `Whale Sentiment: ${sentiment}`;
    document.getElementById('whale-premium-total').innerText = `Total Premium Traded: $${total.toLocaleString()}`;
    document.getElementById('whale-last-updated').innerText = `Last updated: ${new Date(data.timestamp).toLocaleString()}`;

    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const container = document.getElementById('whale-top-symbols');
    container.innerHTML = '';
    sorted.forEach(([symbol, premium]) => {
      const div = document.createElement('div');
      div.textContent = `• ${symbol}: $${premium.toLocaleString()}`;
      container.appendChild(div);
    });
  });

// === Sentiment Timeline ===
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    document.getElementById('sentiment-bar').style.background = `linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%)`;
    document.getElementById('sentiment-text').innerHTML = `🐂 Bullish: ${latest.bullish_pct}% | 🐻 Bearish: ${latest.bearish_pct}%`;
    document.getElementById('sentiment-last-updated').innerText = `Last updated: ${latest.timestamp}`;
  });

// === Shark Meter ===
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const top5 = data.shark_trades.sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);
    const container = document.getElementById('shark-meter');
    container.innerHTML = '';
    top5.forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${t.symbol}: ${t.total_volume.toLocaleString()} shares @ $${t.average_price}`;
      container.appendChild(div);
    });
    document.getElementById('shark-last-updated').innerText = `Last updated: ${new Date(data.timestamp).toLocaleString()}`;
  });

// === Shark Alerts ===
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-alerts');
    container.innerHTML = '';
    const highConfidence = data.shark_trades.filter(t => t.confidence && t.confidence.toUpperCase() !== 'LOW');
    if (!highConfidence.length) {
      container.innerHTML = 'No high-confidence shark activity detected.';
      return;
    }
    highConfidence.slice(0, 3).forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `🔔 ${t.symbol} — ${t.total_volume.toLocaleString()} shares @ $${t.average_price} — Confidence: ${t.confidence}`;
      container.appendChild(div);
    });
  });

// === Suggested Trade ===
Promise.all([
  fetch('sharks.json').then(res => res.json()),
  fetch('whales.json').then(res => res.json())
]).then(([sharks, whales]) => {
  const topShark = sharks.shark_trades.find(t => t.confidence === 'High');
  const whaleNames = whales.whale_trades.map(t => t.symbol);
  const match = topShark && whaleNames.includes(topShark.symbol);
  const suggestion = document.getElementById('suggested-trade');
  if (match) {
    suggestion.innerText = `Try selling a cash-secured PUT on ${topShark.symbol}. Both whales and sharks are circling.`;
  } else {
    suggestion.innerText = `No overlapping whale and shark activity detected at this time. Stay alert for foam.`;
  }
});

// === Live Trader Log ===
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.trades[0];
    const log = document.getElementById('live-trade');
    if (!latest) {
      log.innerText = 'No trades found.';
      return;
    }
    const total = latest.premium * latest.size;
    const entry = `${latest.date} | ${latest.symbol} | ${latest.size}× $${latest.strike} ${latest.type} | $${total.toFixed(2)}`;
    log.innerText = entry;
  });

// === WhaleBot Toggle ===
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
