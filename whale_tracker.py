import os
import json
from datetime import datetime

# Ensure public/ exists
os.makedirs("public", exist_ok=True)

whale_data = {
    "timestamp": datetime.utcnow().isoformat(),
    "whale_trades": [
        {"symbol": "AAPL", "type": "CALL", "strike": 180, "expiration": "2025-05-17", "premium": 1500000},
        {"symbol": "TSLA", "type": "PUT", "strike": 170, "expiration": "2025-06-21", "premium": 1100000}
    ]
}

with open("public/whales.json", "w") as f:
    json.dump(whale_data, f, indent=2)

print("✅ whale data saved to public/whales.json")
