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
    const topSymbols = {};

    // Aggregate volume by symbol
    data.shark_trades.forEach(t => {
      if (!topSymbols[t.symbol]) {
        topSymbols[t.symbol] = { volume: 0, priceTotal: 0, count: 0 };
      }
      topSymbols[t.symbol].volume += t.total_volume;
      topSymbols[t.symbol].priceTotal += t.average_price;
      topSymbols[t.symbol].count += 1;
    });

    const sorted = Object.entries(topSymbols)
      .sort((a, b) => b[1].volume - a[1].volume)
      .slice(0, 5);

    sorted.forEach(([symbol, info]) => {
      const avgPrice = (info.priceTotal / info.count).toFixed(2);
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${symbol}: ${info.volume.toLocaleString()} shares @ $${avgPrice}`;
      container.appendChild(div);
    });
  });

// Shark Alerts
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = document.getElementById('shark-alerts');
    alerts.innerHTML = '';

    const highConfidence = data.shark_trades
      .filter(t => t.confidence && t.confidence.toUpperCase() !== 'LOW')
      .sort((a, b) => b.total_volume - a.total_volume);

    if (highConfidence.length === 0) {
      alerts.innerHTML = 'No high-confidence shark activity detected.';
      return;
    }

    highConfidence.forEach(info => {
      const div = document.createElement('div');
      div.innerHTML = `🔔 ${info.symbol} — ${info.total_volume.toLocaleString()} shares @ $${info.average_price} — Confidence: ${info.confidence}`;
      alerts.appendChild(div);
    });
  });

// Suggested Trade (Whale + Shark alignment)
Promise.all([
  fetch('whales.json').then(res => res.json()),
  fetch('sharks.json').then(res => res.json())
]).then(([whales, sharks]) => {
  const suggestion = document.getElementById('suggested-trade');
  const sharkSymbols = sharks.shark_trades.map(t => t.symbol);
  const whaleSymbols = whales.whale_trades.map(t => t.symbol);

  const overlap = sharkSymbols.find(sym => whaleSymbols.includes(sym));
  if (overlap) {
    suggestion.innerText = `🧠 Consider selling a PUT on ${overlap}. Whales and sharks are both circling.`;
  } else {
    suggestion.innerText = `No overlap today between whale and shark signals. Stay alert for foam.`;
  }
});

// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.trades[0];
    const log = document.getElementById('live-trade');
    log.innerText = `${latest.symbol} — ${latest.type} ${latest.strike}, Exp: ${latest.expiration}, Premium: $${latest.premium} × ${latest.size}, Status: ${latest.status}`;
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
