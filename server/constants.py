import yfinance as yf


SYMBOLS = ['1810.HK', '0853.HK', 'TSLA']
TICKERS = {
    symbol: yf.Ticker(symbol)
    for symbol in SYMBOLS
}
LABEL_AND_VALUES = [
    {'label': ticker.info['shortName'],
     'value': symbol}
    for symbol, ticker in sorted(TICKERS.items())
]

MILL_NAMES = ['', 'k', ' m', ' b', ' t']