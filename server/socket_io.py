import json
import math
import time
from threading import Thread, Lock

import pandas as pd
import yfinance as yf
from flask import request
from flask_socketio import SocketIO
from yahoo_fin import stock_info as si

from constants import MILL_NAMES
from webapp import app

io = SocketIO(app, cors_allowed_origins="*")

_threads = dict()   # symbol to thread mapping
_sessions = dict()  # session id to symbols


class LiveDataThread(Thread):

    def __init__(self, symbol, pause=1):
        super().__init__()
        self.symbol = symbol
        self.pause = pause
        self.lock = Lock()

    def run(self):
        while True:
            self.lock.acquire()
            global _threads
            if self.symbol not in _threads:
                print('Killing thread for {}'.format(self.symbol))
                raise SystemExit
            self.lock.release()
            try:
                minutes, quotes = self.download_live_data()
                self.emit_data(self.symbol, minutes, quotes)
            except:
                print('Error fetching data for {}'.format(self.symbol))
            finally:
                time.sleep(self.pause)

    def download_live_data(self):
        minutes = yf.download(
            self.symbol,
            period='1d',
            interval='1m'
        )
        quotes = si.get_quote_table(
            self.symbol,
            dict_result=True
        )
        return minutes, quotes

    def emit_data(self, symbol, minutes, quotes):
        data = self.get_quote_data(minutes, quotes)
        if all(not pd.isnull(val) and not pd.isna(val) for val in data.values()):
            print('emitting {}'.format(data))
            data = json.dumps(data)
            io.emit('live-data-{}'.format(symbol), data)

    def get_quote_data(self, minutes, quotes):
        price = round(list(minutes['Close'])[-1], 3)
        open = self._parse_float(quotes['Open'])
        prev_close = self._parse_float(quotes['Previous Close'])
        high = max(self._parse_float(quotes['Day\'s Range'].split(' - ')[1]), price)
        low = min(self._parse_float(quotes['Day\'s Range'].split(' - ')[0]), price)
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
        return data

    @staticmethod
    def _parse_float(value, precision=3):
        if isinstance(value, str):
            return round(float(value.replace(',', '')), precision)
        return round(value, precision)

    @staticmethod
    def _millify(n):
        n = float(n)
        mill_idx = max(0, min(len(MILL_NAMES) - 1,
                              int(math.floor(0 if n == 0 else math.log10(abs(n)) / 3))))

        return '{:.2f}{}'.format(n / 10 ** (3 * mill_idx), MILL_NAMES[mill_idx])


@io.on('connect')
def connect():
    print('{} connect to socket'.format(request.sid))


@io.on('get-live-data')
def get_live_data(symbol):
    global _sessions, _threads

    _sessions[request.sid] = symbol

    if symbol not in _threads:
        thread = LiveDataThread(symbol)
        _threads[symbol] = thread
        thread.start()


@io.on('disconnect')
def disconnect():
    global _sessions, _threads

    if request.sid in _sessions:
        symbol = _sessions.pop(request.sid)
        print('{} disconnect from socket'.format(request.sid))

        if symbol not in _sessions.values():
            thread = _threads.pop(symbol)
            if thread:
                thread.join()
