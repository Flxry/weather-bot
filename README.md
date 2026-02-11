# ⚡ Polymarket Weather Edge Bot

A real-time weather trading dashboard that scans Polymarket temperature markets, computes edges using GFS + ECMWF ensemble forecasts, and paper-trades automatically.

## Quick Start

```bash
# Install dependencies
npm install

# Start the dashboard
npm run dev
```

Opens at **http://localhost:3000**

## What It Does

1. **Scans** Polymarket for all active weather/temperature markets
2. **Fetches** 82-member ensemble forecasts (31 GFS + 51 ECMWF) from Open-Meteo
3. **Computes** calibrated bucket probabilities using Gaussian CDF with spread inflation
4. **Detects** edges where model probability diverges from market price
5. **Paper-trades** automatically (or manually) using quarter-Kelly position sizing
6. **Tracks** all trades, P&L, win rate with full history

## Dashboard Tabs

| Tab | What it shows |
|-----|---------------|
| **Scanner** | All weather markets (active + resolved) with status indicators |
| **Analysis** | Selected market deep-dive: ensemble distribution, bucket probabilities vs market prices, signal table |
| **Signals** | Ranked list of all detected edges across all markets |
| **Trades** | Paper trade log, open positions, cumulative P&L chart |
| **Settings** | Strategy parameters (bankroll, edge threshold, Kelly fraction, spread inflation, etc.) |
| **Log** | Real-time activity feed showing every action the bot takes |

## Strategy Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Bankroll | $100 | Starting paper-trade capital |
| Min Edge | 5% | Minimum absolute edge to trigger signal |
| Spread Inflation | 1.3x | Multiplier on ensemble standard deviation (EMOS calibration proxy) |
| Max Positions | 5 | Maximum simultaneous open trades |
| Max Position % | 10% | Max single trade as % of bankroll |
| Max Entry Price | 25¢ | Only buy YES below this price |
| Kelly Fraction | 0.25 | Quarter-Kelly for safety |
| Model Agreement | 3° | Max allowed GFS-ECMWF mean difference |
| Scan Interval | 300s | Auto-scan every 5 minutes |
| Auto Trade | OFF | Toggle automatic paper-trade execution |

## Safety Features

- **Resolved market detection**: Markets where any bucket hits 95%+ or target date has passed are flagged ❌ and excluded from signals
- **Settled bucket filtering**: Individual buckets at 95%+ or below 0.5% are skipped
- **Position limits**: Max 5 simultaneous positions, max 10% bankroll per trade
- **Stop loss**: Auto-exits at 50% loss of entry price
- **Take profit**: Auto-exits at 85¢
- **Rate limiting**: 300ms pause between API calls, retry with backoff

## How Edge Detection Works

1. Fetch 82 ensemble forecast members for target city + date
2. Fit Gaussian distribution: μ = ensemble mean, σ = ensemble std × spread inflation
3. Compute P(bucket) = CDF(upper bound + 0.5) - CDF(lower bound - 0.5)
4. Edge = model probability - market price
5. Signal fires when edge > threshold AND models agree within 3°

## Data Sources

- **Market data**: Polymarket Gamma API (real-time prices)
- **GFS ensemble**: Open-Meteo API (31 members, 0.25° resolution)
- **ECMWF ensemble**: Open-Meteo API (51 members, 0.25° resolution)
- **Resolution source**: Weather Underground airport METAR observations

## Switching to Live Trading

This dashboard is paper-trade only. To go live, you would need:
1. A Polymarket account with USDC on Polygon
2. The `py-clob-client` Python library for order execution
3. Your wallet's private key for API authentication
4. Modify the paper-trade functions to call the CLOB API

**Paper-trade for at least 2 weeks (30+ trades) before risking real money.**

## File Structure

```
weather-bot/
├── package.json          # Dependencies
├── vite.config.js        # Vite config with Polymarket API proxy
├── index.html            # Entry HTML
├── README.md             # This file
└── src/
    ├── main.jsx          # React entry
    └── Dashboard.jsx     # Complete dashboard (all logic + UI)
```

## Troubleshooting

**"No weather markets found"**
- Check that Polymarket has active temperature markets at [polymarket.com/browse](https://polymarket.com/browse?topic=weather)
- The Gamma API might be temporarily down — check the Log tab for error details
- The Vite proxy handles CORS in dev mode; if you're running without Vite, CORS may block requests

**Ensemble data shows 0 members**
- The target date may be too far in the future (max 16 days for GFS, 10 for ECMWF)
- Open-Meteo may be temporarily slow — the bot retries up to 3 times

**Stale prices**
- Market prices come from the Gamma API snapshot, not real-time WebSocket
- Prices update on each scan (default: every 5 minutes)
- Reduce scan interval in Settings for more frequent updates
