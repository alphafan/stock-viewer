import React, { useState, useEffect } from 'react';
import axios from 'axios';

import MainCardTitle from './main-card-title';
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
    </>
  );
}

export default MainCard;