import json
from datetime import datetime

# Dummy whale tracking data (placeholder logic)
whale_data = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "whale_trades": [
        {"symbol": "AAPL", "type": "CALL", "strike": 180, "expiry": "2025-05-17", "premium": 1500000},
        {"symbol": "TSLA", "type": "PUT", "strike": 170, "expiry": "2025-06-21", "premium": 1100000}
    ]
}

# Save to whales.json
with open("whales.json", "w") as f:
    json.dump(whale_data, f, indent=2)

print("Whale data updated successfully.")
