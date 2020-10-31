import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import { SERVER_ROOT_URL } from '../../../../../../common/constants';
import Loading from '../../../../../../common/components/loading';

const parseData = row => ({
  ...row,
  date: Date.parse(row.date)
});

const Chart = ({ data }) => {
  return (
    <>
      {`${data}`}
    </>
  );
};

const IntradayChart = ({ symbol }) => {

  const [socket, setSocket] = useState(null);
  const [intradayData, setIntradayData] = useState([]);
  const [intradayDataIsLoading, setIntradayDataIsLoading] = useState(false);

  const fetchLiveData = () => {
    if (!socket) {
      setIntradayDataIsLoading(true);
      setSocket(io.connect(`${SERVER_ROOT_URL}`), { reconnection: false });
    } else {
      socket.emit('get-live-data', symbol);
      socket.on(`intraday-data-${symbol}`, response => {
        setIntradayData(JSON.parse(response).map(parseData));
        setIntradayDataIsLoading(false);
      });
      return () => {
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      };
    }
  };

  useEffect(fetchLiveData, [socket, symbol]);

  if (intradayDataIsLoading) {
    return (
      <div style={{ height: '430px' }}>
        <Loading />
      </div>
    );
  }

  return (
    <Chart data={intradayData} />
  );
};

export default IntradayChart;