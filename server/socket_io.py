import json
import math
import time
import traceback
from threading import Thread, Lock
import datetime

import pandas as pd
import pandas_market_calendars
import pytz
import yfinance as yf
from dateutil.parser import parse
from flask import request
from flask_socketio import SocketIO
from yahoo_fin import stock_info as si

from constants import MILL_NAMES, TICKERS
from webapp import app

io = SocketIO(app, cors_allowed_origins="*")

_threads = dict()   # symbol to thread mapping
_sessions = dict()  # session id to symbols

nyse = pandas_market_calendars.get_calendar('NYSE')
hkex = pandas_market_calendars.get_calendar('HKEX')


class LiveDataThread(Thread):

    def __init__(self, symbol, pause=10):
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
                # emit quote data
                quote_data = self.get_quote_data(minutes, quotes)
                self.emit_quote_data(quote_data)
                # emit intraday data
                intraday_data = self.get_intraday_data(minutes)
                self.emit_intraday_data(intraday_data)
            except:
                print('Emitting data error \n{}'.format(traceback.format_exc()))
            finally:
                time.sleep(self.pause)

    # ----------------------------------------------------------------------------
    # Download live data
    # ----------------------------------------------------------------------------

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

    # ----------------------------------------------------------------------------
    # Emit live quote data
    # ----------------------------------------------------------------------------

    def get_quote_data(self, minutes, quotes):
        price = round(list(minutes['Close'])[-1], 3)
        open = self._parse_float(quotes['Open'])
        prev_close = self._parse_float(quotes['Previous Close'])
        high = max(self._parse_float(quotes['Day\'s Range'].split(' - ')[1]), price)
        low = min(self._parse_float(quotes['Day\'s Range'].split(' - ')[0]), price)
        volume = self._millify(minutes['Volume'].sum())
        change = price - prev_close
        change_percentage = self._parse_float(change / prev_close * 100, 2)
        last_update = self._utc_datetime_str(list(minutes.index)[-1])
        data = {
            'price': price,
            'open': open,
            'low': low,
            'high': high,
            'prevClose': prev_close,
            'change': change,
            'changePercentage': change_percentage,
            'volume': str(volume),
            'marketStatus': self._get_market_status(),
            'lastUpdate': last_update
        }
        return data

    def emit_quote_data(self, data):
        if all(not pd.isnull(val) and not pd.isna(val) for val in data.values()):
            print('emitting quote data {}'.format(data))
            data = json.dumps(data)
            io.emit('quote-data-{}'.format(self.symbol), data)

    # ----------------------------------------------------------------------------
    # Emit live quote data
    # ----------------------------------------------------------------------------

    def get_intraday_data(self, minutes):
        columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        minutes = minutes[columns]
        for col in columns:
            minutes[col] = [self._parse_float(val) for val in list(minutes[col])]
        minutes['date'] = [self._utc_datetime_str(val) for val in list(minutes.index)]
        columns = {col: col.lower() for col in columns}
        minutes = minutes.rename(columns=columns)
        return [row for row in minutes.T.to_dict().values()]

    def emit_intraday_data(self, data):
        if all(not pd.isnull(val) and not pd.isna(val)
               for row in data for val in row.values()):
            print('emitting intraday data {}'.format(self.symbol))
            data = json.dumps(data)
            io.emit('intraday-data-{}'.format(self.symbol), data)

    # ----------------------------------------------------------------------------
    # Utility functions
    # ----------------------------------------------------------------------------

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

    @staticmethod
    def _utc_datetime_str(dt):
        return str(parse(str(dt)).astimezone(pytz.utc))

    def _get_market_status(self):
        ticker = TICKERS.get(self.symbol)
        currency = ticker.info['currency']
        now = datetime.datetime.utcnow().replace(tzinfo=pytz.utc)
        today = str(now.date())
        if currency == 'USD':
            schedule = nyse.schedule(start_date=today, end_date=today, tz='UTC')
            if len(schedule) == 1 and schedule['market_open'][today].replace(tzinfo=pytz.utc) <= now \
                    <= schedule['market_close'][today].replace(tzinfo=pytz.utc):
                return 'M. Open'
            return 'M. Close'
        elif currency == 'HKD':
            schedule = hkex.schedule(start_date=today, end_date=today, tz='UTC')
            if len(schedule) == 1:
                if schedule['market_open'][today].replace(tzinfo=pytz.utc) <= now \
                        <= schedule['break_start'][today].replace(tzinfo=pytz.utc):
                    return 'M. Open'
                elif schedule['break_start'][today].replace(tzinfo=pytz.utc) <= now \
                        <= schedule['break_end'][today].replace(tzinfo=pytz.utc):
                    return 'M. Break'
                elif schedule['break_end'][today].replace(tzinfo=pytz.utc) <= now \
                        <= schedule['break_end'][today].replace(tzinfo=pytz.utc):
                    return 'M. Open'
            return 'M. Close'


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
