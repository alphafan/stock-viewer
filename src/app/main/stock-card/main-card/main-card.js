import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';

import MainCardTitle from './main-card-title';
import MainCardLivePrice from './main-card-live-price';
import { SERVER_ROOT_URL } from '../../../../common/constants';

const MainCard = ({ ticker, symbol, handleSettingsIconClicked }) => {

  const [quote, setQuote] = useState({});

  useEffect(() => {
    async function fetchLiveQuote() {
      const result = await axios.post(`http://${SERVER_ROOT_URL}/api/get_live_quote`, { ticker });
      setQuote(result.data);
    }
    const interval = setInterval(() => {
      fetchLiveQuote();
    }, 1000);
    return () => clearInterval(interval);
  }, [ticker]);
  
  return (
    <>
      <MainCardTitle
        ticker={ticker}
        symbol={symbol}
        quote={quote}
        handleSettingsIconClicked={handleSettingsIconClicked}
      />
      <hr />
      <Row>
        <Col xs={10}>

        </Col>
        <Col xs={2}>
          <MainCardLivePrice quote={quote} />
        </Col>
      </Row>
    </>
  );
}

export default MainCard;