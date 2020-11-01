import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import { chartOptions } from './chart-helper';
import { SERVER_ROOT_URL, GROUPING_UNITS } from '../../../../../../common/constants';
import Loading from '../../../../../../common/components/loading';
import * as style from './style.module.css';

const Controller = ({ groupUnit, setGroupUnit }) => {
  return (
    <div className={style.controller}>
      <span className={style.label}>
        Grouping
      </span>
      {
        GROUPING_UNITS.map(
          unit => (
            <span
              key={unit}
              className={groupUnit === unit ? style.active : style.disabled}
              onClick={() => setGroupUnit(unit)}
            >
              {unit}m
            </span>
          )
        )
      }
    </div>
  )
};

const Chart = ({ symbol, intradayData, groupUnit }) => (
  <HighchartsReact
    highcharts={Highcharts}
    constructorType={'stockChart'}
    options={chartOptions(symbol, intradayData, groupUnit)}
  />
);

const IntradayChart = ({ symbol }) => {

  const [socket, setSocket] = useState(null);
  const [intradayData, setIntradayData] = useState([]);
  const [intradayDataIsLoading, setIntradayDataIsLoading] = useState(false);
  const [groupUnit, setGroupUnit] = useState(5);

  const fetchLiveData = () => {
    if (!socket) {
      setIntradayDataIsLoading(true);
      setSocket(io.connect(`${SERVER_ROOT_URL}`), { reconnection: false });
    } else {
      socket.emit('get-live-data', symbol);
      socket.on(`intraday-data-${symbol}`, response => {
        setIntradayData(JSON.parse(response));
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

  console.log(intradayData);

  return (
    <>
      <Controller
        groupUnit={groupUnit}
        setGroupUnit={setGroupUnit}
      />
      <Chart
        symbol={symbol}
        intradayData={intradayData}
        groupUnit={groupUnit}
      />
    </>
  );
};

export default IntradayChart;