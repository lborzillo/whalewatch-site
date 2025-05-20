
// WhaleWatch.js — Production Version
// Includes: Whale Meter, Sentiment Timeline, Shark Meter, Shark Alerts, Suggested Trade, Live Trader Log

document.addEventListener("DOMContentLoaded", () => {
  // Whale Meter
  fetch('whales.json')
    .then(res => res.json())
    .then(data => {
      const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.premium, 0);
      const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.premium, 0);
      const total = calls + puts;
      const sentiment = calls === puts ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';
      const updated = new Date(data.latest_update).toLocaleString();

      const meter = document.getElementById('whale-meter-bar');
      const sentimentText = document.getElementById('whale-sentiment');
      const totalText = document.getElementById('whale-premium-total');
      const updateText = document.getElementById('whale-last-updated');

      meter.style.background = total === 0
        ? 'gray'
        : `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
      sentimentText.innerText = `Whale Sentiment: ${sentiment}`;
      totalText.innerText = `Total Premium Traded: $${total.toLocaleString()}`;
      updateText.innerText = `Last updated: ${updated}`;
    });

  // Sentiment Timeline
  fetch('sentiment.json')
    .then(res => res.json())
    .then(data => {
      const latest = data.sentiment_timeline.at(-1);
      const bar = document.getElementById('sentiment-bar');
      const label = document.getElementById('sentiment-text');
      bar.style.background = `linear-gradient(to right, #00ffcc ${latest.bullish_pct}%, #002b3f ${latest.bearish_pct}%)`;
      label.innerHTML = `🐂 Bullish: ${latest.bullish_pct}% | 🐻 Bearish: ${latest.bearish_pct}%`;
    });

  // Shark Meter
  fetch('sharks.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('shark-meter');
      container.innerHTML = '';
      const sorted = Object.entries(data).sort((a, b) => b[1].total_volume - a[1].total_volume);
      sorted.slice(0, 5).forEach(([symbol, info]) => {
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
      const items = Object.entries(data).filter(([_, d]) => d.confidence !== 'Low');
      items.sort((a, b) => b[1].total_volume - a[1].total_volume);
      items.forEach(([symbol, info]) => {
        const div = document.createElement('div');
        div.innerHTML = `🔔 ${symbol} — ${info.total_volume.toLocaleString()} shares @ $${info.average_price} — Confidence: ${info.confidence}`;
        alerts.appendChild(div);
      });
      if (!items.length) {
        alerts.innerHTML = 'No high-confidence shark alerts found today.';
      } else {
        const explanation = document.createElement('div');
        explanation.innerHTML = `<strong>Confidence:</strong> High = repeat large trades, Medium = volume spike, Low = uncertain. Use caution.`;
        alerts.appendChild(explanation);
      }
    });

  // Suggested Trade
  fetch('suggested.json')
    .then(res => res.json())
    .then(data => {
      const block = document.getElementById('suggested-trade');
      if (data.symbol && data.strategy) {
        block.innerHTML = `Try selling a ${data.strategy.toUpperCase()} on ${data.symbol}. Both whales and sharks are circling.`;
      } else {
        block.innerHTML = 'No high-confidence overlaps found today. Explore the data for opportunities.';
      }
    });

  // Live Trader Log
  fetch('trades.json')
    .then(res => res.json())
    .then(data => {
      const latest = data.trades.at(-1);
      const block = document.getElementById('live-trades');
      if (!latest) return;
      const total = (latest.premium * latest.size).toFixed(2);
      const tradeLine = `${latest.date} | HIDDEN | ${latest.size}× $${latest.strike} ${latest.type} | $${total}`;
      block.innerHTML = `
        <strong>${tradeLine}</strong><br>
        Symbol hidden — upgrade for full trade details.
      `;
    });

  // WhaleBot toggle
  document.getElementById('whalebot-icon').addEventListener('click', () => {
    const panel = document.getElementById('whalebotPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  });
});
