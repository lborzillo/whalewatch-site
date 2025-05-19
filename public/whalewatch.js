
fetch('whales.json')
  .then(res => res.json())
  .then(data => {
    const calls = data.whale_trades.filter(t => t.type === 'CALL').reduce((acc, t) => acc + t.premium, 0);
    const puts = data.whale_trades.filter(t => t.type === 'PUT').reduce((acc, t) => acc + t.premium, 0);
    const total = calls + puts;

    let sentiment;
    const diff = Math.abs(calls - puts) / total;
    if (total === 0) {
      sentiment = "Mixed";
    } else if (diff < 0.10) {
      sentiment = "Mixed";
    } else {
      sentiment = calls > puts ? "Bullish" : "Bearish";
    }

    const whaleMeterBar = document.getElementById('whale-meter-bar');
    const whaleMeterText = document.getElementById('whale-sentiment');
    const premiumTotal = document.getElementById('whale-premium-total');
    const lastUpdated = document.getElementById('whale-last-updated');

    if (whaleMeterBar && whaleMeterText && premiumTotal) {
      whaleMeterBar.style.background = `linear-gradient(to right, green ${calls / total * 100}%, red ${puts / total * 100}%)`;
      whaleMeterText.innerText = `Whale Sentiment: ${sentiment}`;
      premiumTotal.innerText = `Total Premium Traded: $${total.toLocaleString()}`;
      lastUpdated.innerText = `Last updated: ${new Date(data.latest_update).toLocaleString()}`;
    }
  });
