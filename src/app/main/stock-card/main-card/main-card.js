import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import MainCardTitle from './main-card-title';
import { SERVER_ROOT_URL } from '../../../../common/constants';
import Loading from '../../../../common/components/loading';

const MainCard = ({ symbol, name, handleSettingsIconClicked }) => {

  const [socket, setSocket] = useState(null);
  const [quote, setQuote] = useState({});
  const [quoteIsLoading, setQuoteIsLoading] = useState(false);

  const fetchLiveQuote = () => {
    if (!socket) {
      setQuoteIsLoading(true);
      setSocket(io.connect(`${SERVER_ROOT_URL}`), { reconnection: false });
    } else {
      socket.emit('get-live-data', symbol);
      socket.on(`quote-data-${symbol}`, response => {
        setQuote(JSON.parse(response));
        setQuoteIsLoading(false);
      });
      return () => {
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      };
    }
  };

  useEffect(fetchLiveQuote, [socket, symbol]);

  if (quoteIsLoading) {
    return (
      <Loading />
    );
  } else {
    return (
      <>
        <MainCardTitle
          symbol={symbol}
          name={name}
          quote={quote}
          handleSettingsIconClicked={handleSettingsIconClicked}
        />
        <hr />
      </>
    );
  }
}

export default MainCard;