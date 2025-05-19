
// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const log = document.getElementById('live-trader-log');
    if (!log || !data.trades || data.trades.length === 0) return;

    const latest = data.trades[0];
    const puts = latest.puts || 0;
    const calls = latest.calls || 0;
    const premium = latest.premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    log.innerHTML = `
      <strong>${latest.date}</strong><br>
      PUTs: ${puts}×<br>
      CALLs: ${calls}×<br>
      Total Premium: $${premium}<br>
      <small>Symbol hidden — upgrade for full trade details.</small>
    `;
  });

// WhaleBot Toggle
document.getElementById('whalebot-icon').addEventListener('click', () => {
  const panel = document.getElementById('whalebotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
