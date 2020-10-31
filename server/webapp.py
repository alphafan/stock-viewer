from flask import Flask, jsonify
from flask_cors import CORS

from constants import LABEL_AND_VALUES

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)


@app.route('/api/get_tickers')
def get_tickers():
    return jsonify(LABEL_AND_VALUES)