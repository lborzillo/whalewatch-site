function toggleWhaleBot() {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const label = document.getElementById('whale-meter-label');
    const meta = document.getElementById('whale-meter-meta');
    const bar = document.getElementById('whale-meter-bar');

    const calls = data.whale_trades.filter(t => t.type === 'CALL');
    const puts = data.whale_trades.filter(t => t.type === 'PUT');
    const total = calls.length + puts.length;

    const callPct = total > 0 ? (calls.length / total) * 100 : 50;
    const putPct = 100 - callPct;

    bar.style.background = `linear-gradient(to right, #00ff99 ${callPct}%, #ff3366 ${putPct}%)`;

    meta.innerText = `Total Premium: $${data.whale_trades.reduce((sum, t) => sum + t.premium, 0).toLocaleString()}`;
    label.innerText = callPct > 55 ? 'Whale Sentiment: Bullish' : putPct > 55 ? 'Whale Sentiment: Bearish' : 'Whale Sentiment: Mixed';

    const symbols = {};
    data.whale_trades.forEach(t => {
      symbols[t.symbol] = (symbols[t.symbol] || 0) + t.premium;
    });

    const sorted = Object.entries(symbols).sort((a, b) => b[1] - a[1]).slice(0, 10);
    document.getElementById('top-whales').innerHTML =
      '<ul>' + sorted.map(([sym, amt]) => `<li>${sym}: $${amt.toLocaleString()}</li>`).join('') + '</ul>';
  });

fetch('sentiment.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.sentiment_timeline[data.sentiment_timeline.length - 1];
    const bull = latest.bullish_pct;
    const bear = latest.bearish_pct;
    document.getElementById('sentiment-bar').style.background = `linear-gradient(to right, #00ffcc ${bull}%, #002b3f ${bear}%)`;
    document.getElementById('sentiment-timeline-label').innerText = 'Updated';
    document.getElementById('bullish-pct').innerText = `${bull}%`;
    document.getElementById('bearish-pct').innerText = `${bear}%`;
  });

fetch('sharks.json')
  .then(res => res.json())
  .then(data => {
    const label = document.getElementById('shark-meter-label');
    label.innerText = `${data.trades.length} dark pool trades logged`;

    if (data.alerts?.length) {
      const a = data.alerts[0];
      document.getElementById('shark-alerts').innerHTML =
        `<div style="background:#013344;padding:1em;border-radius:8px">
          <strong>${a.symbol}</strong> — <strong>${a.frequency}x</strong> — Volume: ${a.volume.toLocaleString()}<br>
          Last Seen: ${a.last_seen} @ $${a.price} — Confidence: ${a.confidence}
        </div>`;
    } else {
      document.getElementById('shark-alerts').innerText = 'No Shark Alerts';
    }
  });

fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const t = data.trades[0];
    document.getElementById('live-trades').innerText =
      `${t.date} | ${t.symbol || 'HIDDEN'} | ${t.size}x $${t.strike} ${t.type} | $${(t.premium * t.size).toFixed(2)}`;
  });

fetch('suggested.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('suggested-trade').innerText = data.trade || 'No signal match found today.';
  });