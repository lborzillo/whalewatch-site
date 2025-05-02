import json
import requests
from datetime import datetime
import random
import os

symbol = "AAPL"
api_key = os.environ.get("ALPHA_VANTAGE_API_KEY")  # get API key from environment

if not api_key:
    raise ValueError("ALPHA_VANTAGE_API_KEY not found in environment variables")

url = f"https://www.alphavantage.co/query?function=OPTION_CHAIN&symbol={symbol}&apikey={api_key}"

response = requests.get(url)
response.raise_for_status()

data = response.json()

if "optionChain" not in data or "options" not in data["optionChain"]:
    print("❌ Unexpected API response:")
    print(json.dumps(data, indent=2))
    raise ValueError("Invalid response from Alpha Vantage API")

options = data["optionChain"]["options"]

whale_trades = []

# Example: Pick a random call/put from the first expiry
if options:
    calls = options[0].get("calls", [])
    puts = options[0].get("puts", [])

    if calls:
        call = random.choice(calls)
        whale_trades.append({
            "symbol": symbol,
            "type": "CALL",
            "strike": call.get("strikePrice"),
            "expiration": call.get("expirationDate"),
            "premium": call.get("askPrice", 0) * 100
        })

    if puts:
        put = random.choice(puts)
        whale_trades.append({
            "symbol": symbol,
            "type": "PUT",
            "strike": put.get("strikePrice"),
            "expiration": put.get("expirationDate"),
            "premium": put.get("askPrice", 0) * 100
        })

whale_data = {
    "timestamp": datetime.utcnow().isoformat(),
    "whale_trades": whale_trades
}

repo_dir = os.environ.get("GITHUB_WORKSPACE", os.getcwd())
output_path = os.path.join(repo_dir, "whales.json")

with open(output_path, "w") as f:
    json.dump(whale_data, f, indent=2)

print(f"✅ Whale data saved to {output_path}")
print(json.dumps(whale_data, indent=2))
