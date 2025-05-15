import yfinance as yf
import json
import pandas as pd
from datetime import datetime
import os

def fetch_whale_trades(symbol="NVDA", top_n=5):
    # Load ticker
    ticker = yf.Ticker(symbol)

    # Get expiration dates
    expiration_dates = ticker.options
    if not expiration_dates:
        raise ValueError(f"No options data found for {symbol}")
    
    nearest_exp = expiration_dates[0]
    print(f"Using nearest expiration: {nearest_exp}")

    # Fetch option chain
    opt_chain = ticker.option_chain(nearest_exp)

    # Combine calls and puts
    all_options = pd.concat([
        opt_chain.calls.assign(type='CALL'),
        opt_chain.puts.assign(type='PUT')
    ])

    # Calculate premium
    all_options['premium'] = all_options['openInterest'] * all_options['lastPrice']
    all_options = all_options.dropna(subset=['strike', 'premium'])

    # Sort by biggest premiums
    biggest_whales = all_options.sort_values(by='premium', ascending=False).head(top_n)

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

    return whale_trades

def save_whales_json(data, output_path="public/whales.json"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    output = {
        "timestamp": datetime.utcnow().isoformat(),
        "whale_trades": data
    }
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"✅ Whale data saved to {output_path}")

if __name__ == "__main__":
    try:
        whale_data = fetch_whale_trades("NVDA")
        save_whales_json(whale_data)
    except Exception as e:
        print(f"❌ Error: {e}")
