import json
import requests
from datetime import datetime
import random
import os

symbol = "AAPL"
url = f"https://query2.finance.yahoo.com/v7/finance/options/{symbol}"

headers = {"User-Agent": "Mozilla/5.0"}  # <- FIX: Yahoo blocks requests without this
response = requests.get(url, headers=headers)

try:
    data = response.json()
except json.JSONDecodeError:
    print("❌ Failed to parse JSON. Response content:")
    print(response.text)
    raise

options = data.get("optionChain", {}).get("result", [{}])[0]
calls = options.get("options", [{}])[0].get("calls", [])
puts = options.get("options", [{}])[0].get("puts", [])

whale_trades = []

if calls:
    call = random.choice(calls)
    whale_trades.append({
        "symbol": symbol,
        "type": "CALL",
        "strike": call["strike"],
        "expiration": datetime.utcfromtimestamp(call["expirationDate"]).isoformat(),
        "premium": call.get("ask", 0) * 100  # estimate per contract
    })

if puts:
    put = random.choice(puts)
    whale_trades.append({
        "symbol": symbol,
        "type": "PUT",
        "strike": put["strike"],
        "expiration": datetime.utcfromtimestamp(put["expirationDate"]).isoformat(),
        "premium": put.get("ask", 0) * 100
    })

whale_data = {
    "timestamp": datetime.utcnow().isoformat(),
    "build_time": datetime.utcnow().isoformat(),
    "whale_trades": whale_trades
}

# ✅ Ensure writing to repo root in GitHub Actions
repo_dir = os.environ.get("GITHUB_WORKSPACE", os.getcwd())
output_path = os.path.join(repo_dir, "whales.json")

with open(output_path, "w") as f:
    json.dump(whale_data, f, indent=2)

print(f"✅ Whale data saved to {output_path}")
print(json.dumps(whale_data, indent=2))
