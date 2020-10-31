import json
import logging
import math
import time
from threading import Thread

import yfinance as yf
from flask import request
from flask_socketio import SocketIO
from yahoo_fin import stock_info as si

from webapp import app

io = SocketIO(app, cors_allowed_origins="*")

# ticker id to thread mapping
THREAD_POOL = {}
SESSION_TO_TICKER = {}

TICKERS = ['1810.HK', '0853.HK', 'TSLA']


class LiveQuoteThread(Thread):
    millnames = ['', 'k', ' m', ' b', ' t']

    def __init__(self, ticker, pause=1):
        super().__init__()
        self.ticker = ticker
        self.pause = pause

    def run(self):
        self.get_live_quote()

    def get_live_quote(self):
        while True:
            global THREAD_POOL
            if self.ticker not in THREAD_POOL:
                raise SystemExit
            try:
                quote = si.get_quote_table(self.ticker)
                minutes = yf.download(self.ticker, period='1d', interval='1m')
                data = self._parse_yahoo_quote(quote, minutes)
                io.emit('live-quote-{}'.format(self.ticker), json.dumps(data))
            finally:
                time.sleep(self.pause)

    def _parse_yahoo_quote(self, quote, minutes):
        price = round(list(minutes['Close'])[-1], 3)
        open = self._parse_float(quote['Open'])
        prev_close = self._parse_float(quote['Previous Close'])
        high = max(self._parse_float(quote['Day\'s Range'].split(' - ')[1]), price)
        low = min(self._parse_float(quote['Day\'s Range'].split(' - ')[0]), price)
        volume = self._millify(minutes['Volume'].sum())
        change = price - prev_close
        change_percentage = self._parse_float(change / prev_close * 100, 2)
        market_status = 'Market Close'
        last_update = str(list(minutes.index)[-1])
        data = {
            'price': price,
            'open': open,
            'low': low,
            'high': high,
            'prevClose': prev_close,
            'change': change,
            'changePercentage': change_percentage,
            'volume': str(volume),
            'marketStatus': market_status,
            'lastUpdate': last_update
        }
        print(data)
        return data

    @staticmethod
    def _parse_float(value, precision=3):
        if isinstance(value, str):
            return round(float(value.replace(',', '')), precision)
        return round(value, precision)

    def _millify(self, n):
        n = float(n)
        millidx = max(0, min(len(self.millnames) - 1,
                             int(math.floor(0 if n == 0 else math.log10(abs(n)) / 3))))

        return '{:.2f}{}'.format(n / 10 ** (3 * millidx), self.millnames[millidx])


@io.on('connect')
def connect():
    logging.info('Someone connect to socket, session id:', request.sid)


@io.on('get-live-quote')
def get_live_quote(ticker):
    global THREAD_POOL, SESSION_TO_TICKER

    session_id = request.sid
    SESSION_TO_TICKER[session_id] = ticker

    if ticker not in THREAD_POOL:
        thread = LiveQuoteThread(ticker)
        THREAD_POOL[ticker] = thread
        thread.start()

    print('Current THREAD_POOL', THREAD_POOL)
    print('Current SESSION_TO_TICKER', SESSION_TO_TICKER)


@io.on('disconnect')
def disconnect():
    global THREAD_POOL, SESSION_TO_TICKER

    if request.sid in SESSION_TO_TICKER:
        ticker = SESSION_TO_TICKER.pop(request.sid)
        if ticker not in SESSION_TO_TICKER.values():
            thread = THREAD_POOL.pop(ticker)
            thread.join()

    print('Current THREAD_POOL', THREAD_POOL)
    print('Current SESSION_TO_TICKER', SESSION_TO_TICKER)