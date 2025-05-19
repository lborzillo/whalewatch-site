// ===================== WHALE METER =====================
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((acc, t) => acc + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((acc, t) => acc + t.premium, 0);
    const total = calls + puts;
    const sentiment = total === 0 ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';

    const bar = document.getElementById('whale-meter-bar');
    const text = document.getElementById('whale-sentiment');
    const totalEl = document.getElementById('whale-premium-total');

    if (bar && text && totalEl) {
      bar.style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
      text.innerText = `Whale Sentiment: ${sentiment}`;
      totalEl.innerText = `Total Premium Traded: $${total.toLocaleString()}`;
    }

    const symbolTotals = {};
    data.whale_trades.forEach(t => {
      symbolTotals[t.symbol] = (symbolTotals[t.symbol] || 0) + t.premium;
    });

    const sorted = Object.entries(symbolTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const symbolDiv = document.getElementById('whale-top-symbols');
    if (symbolDiv) {
      symbolDiv.innerHTML = sorted.map(([sym, prem]) => `• ${sym}: $${prem.toLocaleString()}`).join('<br>');
    }
  });

// ===================== SENTIMENT TIMELINE =====================
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

// ===================== SHARK METER =====================
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('shark-meter');
    const trades = data.shark_trades;

    const grouped = trades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) acc[trade.symbol] = [];
      acc[trade.symbol].push(trade);
      return acc;
    }, {});

    const summaries = Object.entries(grouped).map(([symbol, group]) => {
      const totalVol = group.reduce((sum, t) => sum + t.total_volume, 0);
      const avgPrice = group.reduce((sum, t) => sum + (t.average_price * t.total_volume), 0) / totalVol;
      return { symbol, total_volume: totalVol, average_price: avgPrice };
    });

    summaries.sort((a, b) => b.total_volume - a.total_volume);

    container.innerHTML = summaries.slice(0, 5).map(t =>
      `🦈 ${t.symbol}: ${t.total_volume.toLocaleString()} shares @ $${t.average_price.toFixed(2)}`
    ).join('<br>');
  });

// ===================== SHARK ALERTS =====================
fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const alerts = document.getElementById('shark-alerts');
    const trades = data.shark_trades;

    const filtered = trades.filter(t => t.confidence && t.confidence.toUpperCase() !== 'LOW');

    const grouped = filtered.reduce((acc, trade) => {
      if (!acc[trade.symbol]) acc[trade.symbol] = [];
      acc[trade.symbol].push(trade);
      return acc;
    }, {});

    const summaries = Object.entries(grouped).map(([symbol, group]) => {
      const totalVol = group.reduce((sum, t) => sum + t.total_volume, 0);
      const avgPrice = group.reduce((sum, t) => sum + (t.average_price * t.total_volume), 0) / totalVol;
      const confidence = group[0].confidence || 'Unknown';
      return { symbol, volume: totalVol, price: avgPrice, confidence };
    });

    summaries.sort((a, b) => b.volume - a.volume);

    alerts.innerHTML = summaries.slice(0, 3).map(t =>
      `🔔 ${t.symbol} — ${t.volume.toLocaleString()} shares @ $${t.price.toFixed(2)} — Confidence: ${t.confidence}`
    ).join('<br>');
  });

// ===================== SUGGESTED TRADE =====================
Promise.all([
  fetch('whales.json').then(res => res.json()),
  fetch('sharks.json').then(res => res.json())
]).then(([whaleData, sharkData]) => {
  const tradeDiv = document.getElementById('suggested-trade');
  if (!tradeDiv) return;

  const whaleMap = {};
  whaleData.whale_trades.forEach(t => {
    whaleMap[t.symbol] = (whaleMap[t.symbol] || 0) + t.premium;
  });

  const sharkMap = {};
  sharkData.shark_trades.forEach(t => {
    if (t.confidence && t.confidence.toUpperCase() !== 'LOW') {
      sharkMap[t.symbol] = (sharkMap[t.symbol] || 0) + t.total_volume;
    }
  });

  const intersection = Object.keys(whaleMap).filter(sym => sharkMap[sym]);

  if (intersection.length > 0) {
    const top = intersection.sort((a, b) => (whaleMap[b] + sharkMap[b]) - (whaleMap[a] + sharkMap[a]))[0];
    tradeDiv.innerHTML = `Try selling a cash-secured PUT on ${top}. Both whales and sharks are circling.`;
  } else {
    tradeDiv.innerHTML = 'No overlapping signals right now. Stay alert for foam buildup!';
  }
});

// ===================== LIVE TRADER LOG =====================
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const log = document.getElementById('latest-trade');
    if (!log) return;

    const latest = data.trades[data.trades.length - 1];
    if (!latest) {
      log.innerText = 'No trades found.';
      return;
    }

    log.innerText = `${latest.date} | ${latest.symbol} | ${latest.size}x $${latest.strike} ${latest.type} | $${(latest.premium * latest.size).toFixed(2)}`;
  });

// ===================== WHALEBOT TOGGLE =====================
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
