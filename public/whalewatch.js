async function loadWhaleWatchData() {
  try {
    const [trades, harvest, sentiment, sharks, whales, leaderboard] = await Promise.all([
      fetch('trades.json').then(res => res.json()),
      fetch('harvest.json').then(res => res.json()),
      fetch('sentiment.json').then(res => res.json()),
      fetch('sharks.json').then(res => res.json()),
      fetch('whales.json').then(res => res.json()),
      fetch('leaderboard.json').then(res => res.json())
    ]);

    // Whale Meter
    const total = whales.whale_trades.reduce((sum, t) => sum + t.premium, 0);
    const calls = whales.whale_trades.filter(t => t.type === "CALL").reduce((sum, t) => sum + t.premium, 0);
    const puts = total - calls;
    const callPct = (calls / total) * 100;
    const putPct = 100 - callPct;

    const gradient = callPct > 60
      ? `linear-gradient(to right, #00ff99 ${callPct}%, #002b3f ${putPct}%)`
      : putPct > 60
      ? `linear-gradient(to right, #ff3366 ${putPct}%, #002b3f ${callPct}%)`
      : `linear-gradient(to right, #00ff99 ${callPct}%, #ff3366 ${putPct}%)`;

    document.querySelector('#whaleMeter > div').style.background = gradient;
    document.getElementById('whaleMeterStats').innerHTML = `
      <strong>Total Premium Traded:</strong> $${total.toLocaleString()}<br>
      <span style="font-size: 0.8em; color: #aaa;">Last updated: ${new Date(whales.timestamp).toLocaleString()}</span>
    `;

    // Whale Trades
    const whaleMap = {};
    whales.whale_trades.forEach(w => {
      if (!whaleMap[w.symbol]) whaleMap[w.symbol] = 0;
      whaleMap[w.symbol] += w.premium;
    });
    const whaleHTML = Object.entries(whaleMap).map(
      ([sym, prem]) => `<div><strong>${sym}</strong> — Total Premium: $${prem.toLocaleString()}</div>`
    ).join('<hr>');
    document.getElementById("whaleTrades").innerHTML = whaleHTML;

    // Remaining blocks (existing logic unchanged)
    const t = trades.trades?.[0];
    if (t) {
      document.getElementById("liveTrade").innerHTML = `
        <strong>${t.symbol}</strong> — ${t.type}<br>
        Strike: $${t.strike ?? 'N/A'}, Exp: ${t.expiration}<br>
        Premium: $${t.premium} × ${t.size} = <strong>$${(t.premium * t.size).toFixed(2)}</strong><br>
        Status: <span style="color:${t.status === 'OPEN' ? '#00ff88' : '#ccc'}">${t.status}</span> (Date: ${t.date})
      `;
    }

    let planHTML = `<p><strong>Week:</strong> ${harvest.week}</p>`;
    planHTML += `<p><strong>Target:</strong> $${harvest.premium_goal} | <strong>Total:</strong> $${harvest.total_premium}</p>`;
    for (const [acct, data] of Object.entries(harvest.accounts)) {
      planHTML += `<h3>${acct}</h3>`;
      if (data.puts) {
        planHTML += `<strong>Puts:</strong><ul>`;
        data.puts.forEach(p => {
          const total = p.premium * p.contracts * 100;
          planHTML += `<li>${p.contracts}x ${p.symbol} $${p.strike} @ $${p.premium} = $${total.toFixed(2)}</li>`;
        });
        planHTML += `</ul>`;
      }
      if (data.calls) {
        planHTML += `<strong>Calls:</strong><ul>`;
        data.calls.forEach(c => {
          const total = c.premium * c.contracts * 100;
          planHTML += `<li>${c.contracts}x ${c.symbol} $${c.strike} @ $${c.premium} = $${total.toFixed(2)}</li>`;
        });
        planHTML += `</ul>`;
      }
    }
    document.getElementById("harvestPlan").innerHTML = planHTML;

    const timeline = sentiment.sentiment_timeline.map(d =>
      `<div>${d.timestamp}: 🐂 ${d.bullish_pct}% | 🐻 ${d.bearish_pct}%</div>`
    ).join('');
    document.getElementById("sentimentTimeline").innerHTML = timeline;

    let leaderboardHTML = '<ol>';
    for (const [symbol, stats] of Object.entries(leaderboard.top_10)) {
      leaderboardHTML += `<li>${symbol}: $${stats.total_premium.toLocaleString()} (${stats.count} trades)</li>`;
    }
    leaderboardHTML += '</ol>';
    document.getElementById("leaderboard").innerHTML = leaderboardHTML;

    const match = sharks.trades.find(s => whales.whale_trades.some(w => w.symbol === s.symbol));
    document.getElementById("suggestedTrade").innerHTML = match
      ? `📌 Based on aligned activity in <strong>${match.symbol}</strong>, consider selling a cash-secured put near $${Math.floor(match.average_price)}.`
      : 'No alignment today. Explore other setups.';

    document.getElementById("sharkList").innerHTML = sharks.trades.map(s =>
      `<div><strong>${s.symbol}</strong> | Vol: ${s.volume.toLocaleString()} | Confidence: ${s.confidence}</div>`
    ).join('<hr>');

    const alert = sharks.alerts?.[0];
    if (alert) {
      document.getElementById("sharkAlert").innerHTML = `
        <strong>${alert.symbol}</strong> | Vol: ${alert.volume.toLocaleString()}<br>
        Confidence: <span style="color:#ffaa00">${alert.confidence}</span>
      `;
    }

  } catch (err) {
    console.error("Error loading WhaleWatch data:", err);
  }
}

loadWhaleWatchData();