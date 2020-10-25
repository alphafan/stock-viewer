import json
import logging
import time
from threading import Thread

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from yahoo_fin import stock_info as si

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
io = SocketIO(app, cors_allowed_origins="*")

# ticker id to thread mapping
THREAD_POOL = {}
SESSION_TO_TICKER = {}


class LiveQuoteThread(Thread):

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
                data = self._parse_yahoo_quote(quote)
                io.emit('live-quote-{}'.format(self.ticker), json.dumps(data))
            finally:
                time.sleep(self.pause)

    @staticmethod
    def _parse_yahoo_quote(quote):
        return {
            'price': round(quote['Quote Price'], 3),
            'bid': round(float(quote['Bid'].split(' x ')[0]), 3),
            'ask': round(float(quote['Ask'].split(' x ')[0]), 3),
            'open': round(quote['Open'], 3),
            'prevClose': round(quote['Previous Close'], 3),
            'change': round(quote['Quote Price']-quote['Previous Close'], 3),
            'changePercentage': round((quote['Quote Price']-quote['Previous Close'])/quote['Previous Close'] * 100, 3),
            'low': round(float(quote['Day\'s Range'].split(' - ')[0]), 3),
            'high': round(float(quote['Day\'s Range'].split(' - ')[1]), 3),
            'bidVolume': round(float(quote['Bid'].split(' x ')[1]), 3),
            'askVolume': round(float(quote['Ask'].split(' x ')[1]), 3),
            'marketStatus': 'Market Close'
        }


@app.route('/api/get_tickers')
def get_tickers():
    data = [
        {'label': 'Xiaomi Corp', 'value': '1810.HK'},
        {'label': 'MicroPort Corp', 'value': '0853.HK'},
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


@io.on('disconnect')
def disconnect():
    global THREAD_POOL, SESSION_TO_TICKER

    if request.sid in SESSION_TO_TICKER:
        ticker = SESSION_TO_TICKER.pop(request.sid)
        if ticker not in SESSION_TO_TICKER.values():
            thread = THREAD_POOL.pop(ticker)
            thread.join()


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
