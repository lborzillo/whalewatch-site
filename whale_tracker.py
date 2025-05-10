import yfinance as yf
import json
import pandas as pd
from datetime import datetime
import os

# Choose your stock symbol
symbol = "NVDA"

# Load the ticker
ticker = yf.Ticker(symbol)

# Get available options expiration dates
expiration_dates = ticker.options
if not expiration_dates:
    raise ValueError(f"No options data found for {symbol}")

print(f"Found expiration dates: {expiration_dates}")

# Pick the nearest expiration date
nearest_exp = expiration_dates[0]
print(f"Using nearest expiration: {nearest_exp}")

# Fetch the option chain
opt_chain = ticker.option_chain(nearest_exp)

# Combine calls and puts into a single DataFrame using pd.concat
all_options = pd.concat([
    opt_chain.calls.assign(type='CALL'),
    opt_chain.puts.assign(type='PUT')
])

# Add a 'premium' column (open interest * last price)
all_options['premium'] = all_options['openInterest'] * all_options['lastPrice']

# Filter out rows where data might be missing
all_options = all_options.dropna(subset=['strike', 'premium'])

# Sort by biggest premium first
biggest_whales = all_options.sort_values(by='premium', ascending=False).head(5)

# Prepare data for saving
whale_trades = []
for _, row in biggest_whales.iterrows():
    whale_trades.append({
        "symbol": symbol,
        "type": row['type'],
        "strike": float(row['strike']),
        "expiration": nearest_exp,
        "premium": float(row['premium']),
        "open_interest": int(row['openInterest']),
        "last_price": float(row['lastPrice'])
    })

# Save to whales.json
output = {
    "timestamp": datetime.utcnow().isoformat(),
    "whale_trades": whale_trades
}

# Ensure the public directory exists before writing
if not os.path.isdir('public'):
    os.mkdir('public')

with open("public/whales.json", "w") as f:
    json.dump(output, f, indent=2)

print("✅ Whale data saved to public/whales.json")
