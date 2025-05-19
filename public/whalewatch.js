
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
    const updated = document.getElementById('whale-last-updated');

    if (whaleMeterBar && whaleMeterText && premiumTotal && updated) {
      whaleMeterBar.style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
      whaleMeterText.innerText = `Whale Sentiment: ${sentiment}`;
      premiumTotal.innerText = `Total Premium Traded: $${total.toLocaleString()}`;
      updated.innerText = `Last updated: 2025-05-19 16:01:45`;
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
      whaleSymbols.innerHTML = sorted.map(([symbol, premium]) =>
        `<li>• ${symbol}: ${premium.toLocaleString()}</li>`
      ).join('');
    }
  });

// Sentiment Timeline
fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    const bar = document.getElementById('sentiment-bar');
    const text = document.getElementById('sentiment-text');
    const updated = document.getElementById('sentiment-last-updated');
    if (bar && text && updated) {
      bar.style.background = `linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%)`;
      text.innerHTML = `🐂 Bullish: ${latest.bullish_pct}% | 🐻 Bearish: ${latest.bearish_pct}%`;
      updated.innerText = `Last updated: 2025-05-19 16:01:45`;
    }
  });

// Shark Meter
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-meter');
    const updated = document.getElementById('shark-last-updated');
    if (container && updated) {
      const byVolume = data.shark_trades
        .sort((a, b) => b.total_volume - a.total_volume)
        .slice(0, 5);
      container.innerHTML = byVolume.map(t =>
        `🦈 ${t.symbol}: ${t.total_volume.toLocaleString()} shares @ $${t.average_price}`
      ).join('<br>');
      updated.innerText = `Last updated: 2025-05-19 16:01:45`;
    }
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-alerts');
    if (!container) return;
    const alerts = data.shark_trades.filter(t =>
      t.confidence && t.confidence.toLowerCase() !== 'low'
    ).sort((a, b) => b.total_volume - a.total_volume).slice(0, 3);
    container.innerHTML = alerts.length
      ? alerts.map(t => `🔔 ${t.symbol} — ${t.total_volume.toLocaleString()} shares @ $${t.average_price} — Confidence: ${t.confidence}`).join('<br>')
      : 'No high-confidence shark activity detected.';
  });

// Suggested Trade
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const suggestion = document.getElementById('suggested-trade');
    if (!suggestion) return;
    const target = data.shark_trades.find(t => t.confidence === 'High');
    suggestion.innerText = target
      ? `Try selling a cash-secured PUT on ${target.symbol}. Both whales and sharks are circling.`
      : `No ideal alignment found. Explore the meter for individual ideas.`;
  });

// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.trades.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestDay = latest[0]?.date;
    const sameDayTrades = latest.filter(t => t.date === latestDay);

    const puts = sameDayTrades.filter(t => t.type === 'PUT');
    const calls = sameDayTrades.filter(t => t.type === 'CALL');
    const total = sameDayTrades.reduce((acc, t) => acc + (t.premium * t.size), 0);

    const container = document.getElementById('live-trade');
    if (container) {
      container.innerHTML = `
        <strong>${latestDay}</strong><br>
        PUTS: ${puts.length} trades<br>
        CALLS: ${calls.length} trades<br>
        Total Premium: $${total.toFixed(2)}<br>
        <em>Symbol hidden — upgrade to unlock full access.</em>`;
    }
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
