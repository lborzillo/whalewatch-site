// ======================
// 🐋 Whale Meter + Top 10
// ======================
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

    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });

    const sorted = Object.entries(symbolMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topDiv = document.getElementById('whale-top-symbols');
    topDiv.innerHTML = sorted.map(([s, p]) => `• ${s}: $${p.toLocaleString()}`).join('<br>');
  });

// ======================
// 🌐 Sentiment Timeline
// ======================
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

// ======================
// 🦈 Shark Meter
// ======================
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-meter');
    container.innerHTML = '';

    const grouped = {};
    data.shark_trades.forEach(t => {
      if (!grouped[t.symbol]) {
        grouped[t.symbol] = { total_volume: 0, total_price: 0, trades: 0 };
      }
      grouped[t.symbol].total_volume += t.total_volume;
      grouped[t.symbol].total_price += t.average_price;
      grouped[t.symbol].trades += 1;
    });

    const sorted = Object.entries(grouped).sort((a, b) => b[1].total_volume - a[1].total_volume).slice(0, 5);
    sorted.forEach(([symbol, info]) => {
      const avgPrice = info.total_price / info.trades;
      const div = document.createElement('div');
      div.innerHTML = `🦈 ${symbol}: ${info.total_volume.toLocaleString()} shares @ $${avgPrice.toFixed(2)}`;
      container.appendChild(div);
    });
  });

// ======================
// ⚡ Shark Alerts
// ======================
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alertBox = document.getElementById('shark-alerts');
    alertBox.innerHTML = '';

    const alerts = data.shark_trades
      .filter(t => t.confidence && t.confidence.toUpperCase() !== 'LOW')
      .sort((a, b) => b.total_volume - a.total_volume)
      .slice(0, 3);

    if (alerts.length === 0) {
      alertBox.innerHTML = 'No high-confidence shark activity detected.';
    } else {
      alerts.forEach(t => {
        const div = document.createElement('div');
        div.innerHTML = `🔔 ${t.symbol} — ${t.total_volume.toLocaleString()} shares @ $${t.average_price.toFixed(2)} — Confidence: ${t.confidence}`;
        alertBox.appendChild(div);
      });
    }
  });

// ======================
// 🧠 Suggested Trade
// ======================
Promise.all([
  fetch('whales.json').then(res => res.json()),
  fetch('sharks.json').then(res => res.json())
]).then(([whales, sharks]) => {
  const suggestion = document.getElementById('suggested-trade');
  const whaleCounts = whales.whale_trades.reduce((acc, t) => {
    acc[t.symbol] = (acc[t.symbol] || 0) + t.premium;
    return acc;
  }, {});

  const sharkCounts = sharks.shark_trades.reduce((acc, t) => {
    acc[t.symbol] = (acc[t.symbol] || 0) + t.total_volume;
    return acc;
  }, {});

  const matches = Object.keys(whaleCounts).filter(sym => sharkCounts[sym]);

  if (matches.length === 0) {
    suggestion.innerText = 'No alignment between whale and shark activity found. Keep scanning for foam buildup!';
  } else {
    const best = matches.sort((a, b) => whaleCounts[b] + sharkCounts[b] - whaleCounts[a] - sharkCounts[a])[0];
    suggestion.innerText = `Try selling a cash-secured PUT on ${best}. Both whales and sharks are circling.`;
  }
});

// ======================
// 📄 Live Trader Log
// ======================
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const log = document.getElementById('live-trader-log');
    const latest = data.trades[0];
    if (!latest) {
      log.innerText = 'No trades available yet.';
    } else {
      const total = (latest.premium * latest.size).toFixed(2);
      log.innerText = `${latest.date}: Sold ${latest.size} ${latest.symbol} ${latest.type} ${latest.strike} @ $${latest.premium} = $${total} (${latest.status})`;
    }
  });

// ======================
// 🤖 WhaleBot Toggle
// ======================
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
