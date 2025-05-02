import json
import requests
from datetime import datetime
import random

symbol = "AAPL"
url = f"https://query2.finance.yahoo.com/v7/finance/options/{symbol}"

response = requests.get(url)
data = response.json()

options = data.get("optionChain", {}).get("result", [{}])[0]
calls = options.get("options", [{}])[0].get("calls", [])
puts = options.get("options", [{}])[0].get("puts", [])

whale_trades = []

# Pick a random call (if available)
if calls:
    call = random.choice(calls)
    whale_trades.append({
        "symbol": symbol,
        "type": "CALL",
        "strike": call["strike"],
        "expiration": call["expirationDate"],
        "premium": call.get("ask", 0) * 100  # simple estimate
    })

# Pick a random put (if available)
if puts:
    put = random.choice(puts)
    whale_trades.append({
        "symbol": symbol,
        "type": "PUT",
        "strike": put["strike"],
        "expiration": put["expirationDate"],
        "premium": put.get("ask", 0) * 100
    })

whale_data = {
    "timestamp": datetime.utcnow().isoformat(),
    "whale_trades": whale_trades
}

with open("whales.json", "w") as f:
    json.dump(whale_data, f, indent=2)

print("✅ Live whale data saved to whales.json")
