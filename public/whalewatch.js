document.addEventListener("DOMContentLoaded", () => {
  const loadJSON = async (url) => {
    const res = await fetch(url);
    return await res.json();
  };

  const setTimestamp = (selector, timestamp) => {
    const el = document.querySelector(selector);
    if (el) {
      const div = document.createElement("div");
      div.className = "timestamp";
      div.textContent = `Last Updated: ${timestamp} UTC`;
      el.appendChild(div);
    }
  };

  // Whale Meter
  loadJSON("whales.json").then(data => {
    const total = data.whale_trades.reduce((acc, t) => acc + (t.premium || 0), 0);
    const bullish = data.whale_trades.filter(t => t.type === "CALL").reduce((acc, t) => acc + t.premium, 0);
    const bearish = data.whale_trades.filter(t => t.type === "PUT").reduce((acc, t) => acc + t.premium, 0);
    const whaleMeter = document.getElementById("whale-meter-fill");
    const percent = bullish / (bullish + bearish);
    whaleMeter.style.width = (percent * 100) + "%";
    whaleMeter.style.background = percent > 0.6 ? "lime" : percent < 0.4 ? "red" : "orange";
    document.getElementById("whale-meter-text").textContent = `Total Premium: $${total.toLocaleString()}`;
    setTimestamp("#whale-meter", data.timestamp);
  }).catch(() => {});

  // Top 10 Whale Symbols
  loadJSON("whales.json").then(data => {
    const symbolMap = {};
    data.whale_trades.forEach(t => {
      symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.premium;
    });
    const sorted = Object.entries(symbolMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const list = document.getElementById("whale-top-symbols");
    list.innerHTML = "";
    sorted.forEach(([sym, val]) => {
      const li = document.createElement("li");
      li.textContent = `${sym} — $${val.toLocaleString()}`;
      list.appendChild(li);
    });
  }).catch(() => {});

  // Sentiment Timeline
  loadJSON("sentiment.json").then(data => {
    const timeline = document.getElementById("sentiment-bar");
    const val = data.bullish_percent;
    timeline.style.width = `${val}%`;
    document.getElementById("sentiment-text").textContent = `🐂 Bullish: ${val}% | 🐻 Bearish: ${100 - val}%`;
    setTimestamp("#sentiment-timeline", data.timestamp);
  }).catch(() => {});

  // Shark Meter
  loadJSON("sharks.json").then(data => {
    const block = document.getElementById("shark-meter");
    const text = block.querySelector(".shark-meter-body");
    if (data.trades && data.trades.length > 0) {
      text.innerHTML = data.trades.map(t => `<div>${t.symbol} — ${t.total_volume.toLocaleString()} shares at ${t.average_price}</div>`).join("");
    } else {
      text.textContent = "No dark pool activity detected.";
    }
    setTimestamp("#shark-meter", data.timestamp);
  }).catch(() => {});

  // Shark Alerts
  loadJSON("sharks.json").then(data => {
    const alerts = document.getElementById("shark-alerts");
    if (!data.alerts || data.alerts.length === 0) {
      alerts.textContent = "No Shark Alerts today.";
      return;
    }
    alerts.innerHTML = "";
    data.alerts.forEach(a => {
      const div = document.createElement("div");
      div.textContent = `⚠️ ${a.symbol} — ${a.description}`;
      alerts.appendChild(div);
    });
    setTimestamp("#shark-alerts", data.timestamp);
  }).catch(() => {});

  // Suggested Trade
  loadJSON("suggested.json").then(data => {
    const block = document.getElementById("suggested-trade");
    block.textContent = data.trade ? data.trade.description : "No high-confidence overlaps found today. Explore the data for opportunities.";
    setTimestamp("#suggested-trade", data.timestamp);
  }).catch(() => {});

  // Live Trader Log
  loadJSON("trades.json").then(data => {
    const latest = data.trades[0];
    const log = document.getElementById("live-trader-log");
    if (latest) {
      log.textContent = `🧾 ${latest.date}: Collected $${latest.total_premium.toFixed(2)} across ${latest.type} trades.`;
    } else {
      log.textContent = "No trades found.";
    }
    setTimestamp("#live-trader-log", data.timestamp);
  }).catch(() => {});
});
