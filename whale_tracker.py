import yfinance as yf
import json
import pandas as pd
from datetime import datetime, timezone
import os

def fetch_whale_trades(symbol, expiration_index=0):
    ticker = yf.Ticker(symbol)
    expiration_dates = ticker.options

    if not expiration_dates:
        return []

    nearest_exp = expiration_dates[expiration_index]
    chain = ticker.option_chain(nearest_exp)

    # Get live stock price
    try:
        last_price = ticker.history(period="1d")["Close"].iloc[-1]
    except:
        last_price = None

    all_options = pd.concat([
        chain.calls.assign(type='CALL'),
        chain.puts.assign(type='PUT')
    ])

    # Filter unrealistic strikes (±50% of current price)
    if last_price:
        all_options = all_options[
            (all_options['strike'] >= 0.5 * last_price) &
            (all_options['strike'] <= 1.5 * last_price)
        ]

    # Calculate premium and drop rows with missing data
    all_options = all_options.dropna(subset=['strike', 'lastPrice', 'openInterest'])
    all_options['premium'] = all_options['openInterest'] * all_options['lastPrice']

    whale_trades = []
    for _, row in all_options.iterrows():
        if row['premium'] > 100000:  # Only include trades with meaningful size
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

def save_whales_json(trades, output_path="public/whales.json"):
    output = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "whale_trades": trades
    }
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"✅ whales.json updated with {len(trades)} trades at {output['timestamp']}")

if __name__ == "__main__":
    symbols = ["NVDA", "AAPL", "TSLA", "AMD", "AMZN", "GOOGL", "MSFT", "META"]
    all_trades = []

    for sym in symbols:
        try:
            print(f"🔍 Fetching: {sym}")
            all_trades.extend(fetch_whale_trades(sym))
        except Exception as e:
            print(f"⚠️ Failed to fetch for {sym}: {e}")

    top_whales = sorted(all_trades, key=lambda x: x['premium'], reverse=True)[:10]
    save_whales_json(top_whales)
