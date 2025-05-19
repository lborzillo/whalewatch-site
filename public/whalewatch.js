
// Whale Meter
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((acc, t) => acc + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((acc, t) => acc + t.premium, 0);
    const total = calls + puts;

    const sentiment = total === 0 ? 'Mixed' : calls > puts ? 'Bullish' : 'Bearish';
    const callPct = total ? (calls / total) * 100 : 50;
    const putPct = 100 - callPct;

    const whaleMeterBar = document.getElementById('whale-meter-bar');
    const whaleMeterText = document.getElementById('whale-sentiment');
    const premiumTotal = document.getElementById('whale-premium-total');
    const whaleUpdated = document.getElementById('whale-last-updated');

    if (whaleMeterBar) {
      whaleMeterBar.style.background = total === 0
        ? 'gray'
        : `linear-gradient(to right, green ${callPct}%, red ${putPct}%)`;
    }
    if (whaleMeterText) whaleMeterText.textContent = `Whale Sentiment: ${sentiment}`;
    if (premiumTotal) premiumTotal.textContent = `Total Premium Traded: $${total.toLocaleString()}`;
    if (whaleUpdated && data.timestamp) {
      const raw = new Date(data.timestamp);
      whaleUpdated.textContent = `Last updated: ${raw.toLocaleString()}`;
    }
  });
