
document.addEventListener("DOMContentLoaded", async () => {
  const $ = (id) => document.getElementById(id);

  async function fetchAndRender(url, targetId, parser) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      $(targetId).innerHTML = parser(data);
    } catch (e) {
      $(targetId).innerHTML = "<p>Failed to load data.</p>";
    }
  }

  function formatTimestamp(ts) {
    return new Date(ts).toLocaleString();
  }

  function whaleMeter(data) {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.premium, 0);
    const total = calls + puts;
    const greenWidth = Math.round((calls / total) * 100);
    const redWidth = 100 - greenWidth;
    const sentiment = greenWidth > 60 ? 'Bullish' : redWidth > 60 ? 'Bearish' : 'Mixed';
    return \`
      <h2>🐳 Whale Meter</h2>
      <div style="display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 1em;">
        <div style="background-color: green; width: \${greenWidth}%"></div>
        <div style="background-color: red; width: \${redWidth}%"></div>
      </div>
      <p>Whale Sentiment: <strong>\${sentiment}</strong></p>
      <p>Total Premium Traded: \$\${total.toLocaleString()}</p>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p><strong>What does this mean?</strong><br/>
        The Whale Meter shows where the biggest option trades are flowing.<br/>
        🟢 Green = Whales buying CALLS (bullish bets)<br/>
        🔴 Red = Whales buying PUTS (bearish bets)<br/>
        🎨 A split bar means whales are divided — expect volatility or a turning point.
      </p>
    \`;
  }

  function sentimentTimeline(data) {
    return \`
      <h2>📈 Sentiment Timeline</h2>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p>[Timeline chart will be rendered here]</p>
    \`;
  }

  function sharkMeter(data) {
    return \`
      <h2>🦈 Shark Meter</h2>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p>[Dark pool volume visual goes here]</p>
    \`;
  }

  function sharkAlerts(data) {
    return \`
      <h2>🚨 Shark Alerts</h2>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p>[Alerts based on dark pool anomaly logic]</p>
    \`;
  }

  function suggestedTrade(data) {
    return \`
      <h2>📊 Suggested Trade Based on Whale + Shark Signals</h2>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p>[Example: Consider selling PUTS on TSLA if whales and sharks show accumulation]</p>
    \`;
  }

  function liveTraderLog(data) {
    return \`
      <h2>📘 Live Trader Log</h2>
      <p class="timestamp">Last updated: \${formatTimestamp(data.latest_update)}</p>
      <p>Total Premium Today: \$\${data.total_premium.toLocaleString()}<br/>
         Trade Types: \${data.calls} CALLS / \${data.puts} PUTS</p>
    \`;
  }

  await fetchAndRender("whales.json", "whale-meter", whaleMeter);
  await fetchAndRender("sentiment.json", "sentiment-timeline", sentimentTimeline);
  await fetchAndRender("sharks.json", "shark-meter", sharkMeter);
  await fetchAndRender("sharks.json", "shark-alerts", sharkAlerts);
  await fetchAndRender("suggested.json", "suggested-trade", suggestedTrade);
  await fetchAndRender("trades.json", "live-trader-log", liveTraderLog);
});
