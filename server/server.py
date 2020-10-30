import json
import logging
import time
from threading import Thread

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from yahoo_fin import stock_info as si
import math
import yfinance as yf

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
io = SocketIO(app, cors_allowed_origins="*")

# ticker id to thread mapping
THREAD_POOL = {}
SESSION_TO_TICKER = {}


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


@app.route('/api/get_tickers')
def get_tickers():
    data = [
        {'label': 'Xiaomi Corp', 'value': '1810.HK'},
        {'label': 'MicroPort Corp', 'value': '0853.HK'},
        {'label': 'Tesla, Inc. ', 'value': 'TSLA'},
    ]
    return jsonify(data)


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


if __name__ == '__main__':
    io.run(app, debug=True)
    # http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    # http_server.serve_forever()

    # print(quote)
    # data = {'1y Target Est': 17.65,
    #         '52 Week Range': '8.350 - 26.950',
    #         'Ask': '21.850 x 0',
    #         'Avg. Volume': 201858700.0,
    #         'Beta (5Y Monthly)': 1.51,
    #         'Bid': '21.800 x 0',
    #         "Day's Range": '21.550 - 22.550',
    #         'EPS (TTM)': '-',
    #         'Earnings Date': 'Aug 26, 2020',
    #         'Ex-Dividend Date': '-',
    #         'Forward Dividend & Yield': 'N/A (N/A)',
    #         'Market Cap': '667.771B',
    #         'Open': 22.35,
    #         'PE Ratio (TTM)': '-',
    #         'Previous Close': 22.35,
    #         'Quote Price': 21.850000381469727,
    #         'Volume': 89578040.0}
