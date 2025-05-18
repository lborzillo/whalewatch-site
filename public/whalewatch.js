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

    // Top 10 Whale Symbols by Premium
    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const whaleSymbols = document.getElementById('whale-symbols');
    const loadingMsg = document.getElementById('whale-loading'); // New: Remove the loading message
    if (loadingMsg) loadingMsg.remove();

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
    const totals = {};

    data.shark_trades.forEach(t => {
      if (!totals[t.symbol]) {
        totals[t.symbol] = { volume: 0, total: 0 };
      }
      totals[t.symbol].volume += t.total_volume;
      totals[t.symbol].total += t.total_volume * t.average_price;
    });

    const ranked = Object.entries(totals)
      .map(([symbol, { volume, total }]) => ({
        symbol,
        total_volume: volume,
        average_price: (total / volume).toFixed(2)
      }))
      .sort((a, b) => b.total_volume - a.total_volume)
      .slice(0, 5);

    ranked.forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${t.symbol}: ${t.total_volume.toLocaleString()} shares @ $${t.average_price}`;
      container.appendChild(div);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = document.getElementById('shark-alerts');
    alerts.innerHTML = '';

    const frequencyMap = {};

    data.shark_trades.forEach(t => {
      const key = `${t.symbol}-${t.confidence}`;
      if (!frequencyMap[key]) {
        frequencyMap[key] = {
          symbol: t.symbol,
          confidence: t.confidence,
          last_seen: t.last_seen,
          total_volume: 0,
          frequency: 0
        };
      }
      frequencyMap[key].total_volume += t.total_volume;
      frequencyMap[key].frequency += 1;
    });

    const sorted = Object.values(frequencyMap)
      .filter(t => t.confidence && t.confidence.toUpperCase() !== 'LOW')
      .sort((a, b) => b.total_volume - a.total_volume);

    if (sorted.length === 0) {
      alerts.innerHTML = 'No high-confidence shark activity detected.';
      return;
    }

    sorted.forEach(info => {
      const div = document.createElement('div');
      div.innerHTML = `🔔 ${info.symbol} appeared ${info.frequency}x — Latest @ $${info.last_seen} — Confidence: ${info.confidence}`;
      alerts.appendChild(div);
    });
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
