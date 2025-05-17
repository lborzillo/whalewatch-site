import json
from datetime import datetime, timezone
import os
import random

# Simulated dark pool data
symbols = ["AAPL", "NVDA", "TSLA", "AMD", "META", "MSFT", "AMZN", "GOOG"]
shark_trades = []

for symbol in symbols:
    trades_today = random.randint(1, 3)
    for _ in range(trades_today):
        avg_price = round(random.uniform(100, 500), 2)
        volume = random.randint(50000, 500000)
        confidence = random.choice(["Low", "Medium", "High"])
        shark_trades.append({
            "symbol": symbol,
            "average_price": avg_price,
            "total_volume": volume,
            "average_volume": volume // 2,
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "confidence": confidence
        })

output = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "shark_trades": shark_trades
}

os.makedirs("public", exist_ok=True)
with open("public/sharks.json", "w") as f:
    json.dump(output, f, indent=2)
