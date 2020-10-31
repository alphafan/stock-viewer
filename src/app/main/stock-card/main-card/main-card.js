import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import MainCardTitle from './main-card-title';
import { SERVER_ROOT_URL } from '../../../../common/constants';
import Loading from '../../../../common/components/loading';

const MainCard = ({ ticker, symbol, handleSettingsIconClicked }) => {

  const [quote, setQuote] = useState({});
  const [socket, setSocket] = useState(null);
  const [socketIsLoading, setSocketIsLoading] = useState(false);

  const fetchLiveQuote = () => {
    if (!socket) {
      setSocketIsLoading(true);
      setSocket(io.connect(`${SERVER_ROOT_URL}`), { reconnection: false });
    } else {
      socket.emit('get-live-data', ticker);
      socket.on(`live-data-${ticker}`, response => {
        setQuote(JSON.parse(response));
        setSocketIsLoading(false);
      });
      return () => {
        socket.disconnect();
        setSocket(null);
      };
    }
  };

  useEffect(fetchLiveQuote, [socket, ticker]);

  if (socketIsLoading) {
    return (
      <Loading />
    );
  } else {
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
}

export default MainCard;