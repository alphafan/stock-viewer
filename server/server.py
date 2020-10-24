from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from yahoo_fin import stock_info as si

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)


@app.route('/api/get_tickers')
def get_tickers():
    data = [
        {'label': 'Xiaomi Corp', 'value': '1810.HK'},
        {'label': 'MicroPort Corp', 'value': '0853.HK'},
    ]
    return jsonify(data)


@app.route('/api/get_live_quote', methods=['POST'])
def get_live_quote():
    ticker = json.loads(request.data)['ticker']
    quote = si.get_quote_table(ticker)
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
    data = {
        'price': round(quote['Quote Price'], 3),
        'bid': round(float(quote['Bid'].split(' x ')[0]), 3),
        'ask': round(float(quote['Ask'].split(' x ')[0]), 3),
        'open': round(quote['Open'], 3),
        'prevClose': round(quote['Previous Close'], 3),
        'change': round(quote['Quote Price'] - quote['Previous Close'], 3),
        'changePercentage': round((quote['Quote Price'] - quote['Previous Close']) / quote['Previous Close'] * 100, 3),
        'low': round(float(quote['Day\'s Range'].split(' - ')[0]), 3),
        'high': round(float(quote['Day\'s Range'].split(' - ')[1]), 3),
        'bidVolume': round(float(quote['Bid'].split(' x ')[1]), 3),
        'askVolume': round(float(quote['Ask'].split(' x ')[1]), 3),
        'marketStatus': 'Market Close'
    }
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
