import json
import requests
from datetime import datetime
import random
import os

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

# ✅ Write to the GitHub Actions workspace directory (repo root)
repo_dir = os.environ.get("GITHUB_WORKSPACE", os.getcwd())
output_path = os.path.join(repo_dir, "whales.json")

with open(output_path, "w") as f:
    json.dump(whale_data, f, indent=2)

print(f"✅ Live whale data saved to {output_path}")
print(json.dumps(whale_data, indent=2))  # Debug print to see content in workflow logs
