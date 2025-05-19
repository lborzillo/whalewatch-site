// Live Trader Log
fetch('trades.json')
  .then(res => res.json())
  .then(data => {
    const log = document.getElementById('live-trader-log');
    if (!log || !data.trades || data.trades.length === 0) return;

    const latest = data.trades[0];
    const date = latest.date;
    const puts = latest.puts || 0;
    const calls = latest.calls || 0;
    const premium = latest.premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    log.innerHTML = `
      <strong>${date}</strong> | PUTs: ${puts}× | CALLs: ${calls}× | Total Premium: $${premium}<br>
      <small>Symbol hidden — upgrade for full trade details.</small>
    `;
  });
