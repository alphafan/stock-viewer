import React from 'react';
import IntradayChart from './intraday-chart';

const MainCardBody = ({ symbol }) => {
  return (
    <>
      <IntradayChart symbol={symbol} />
    </>
  );
};

export default MainCardBody;