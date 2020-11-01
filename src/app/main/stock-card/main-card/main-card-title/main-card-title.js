import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import FlashChange from '@avinlab/react-flash-change';
import io from 'socket.io-client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import { SERVER_ROOT_URL } from '../../../../../common/constants';
import Loading from '../../../../../common/components/loading';
import style from './style.module.css';

const colorClass = (a, b) => a > b ? style.green : a < b ? style.red : '';

const LivePrice = ({ price, prevClose }) => (
  <>
    {
      price !== undefined &&
      <FlashChange
        value={price}
        flashClassName='flashing'
        compare={(prevProps, nextProps) => {
          return nextProps.price !== prevProps.price;
        }}
      >
        <b className={colorClass(price, prevClose)}>
          {price.toFixed(3)} <FontAwesomeIcon icon={price >= prevClose ? faLongArrowAltUp : faLongArrowAltDown} />
        </b>
      </FlashChange>
    }
  </>
);

const MainCardTitle = ({ name, symbol, handleSettingsIconClicked }) => {

  const [socket, setSocket] = useState(null);
  const [quote, setQuote] = useState({});
  const [quoteIsLoading, setQuoteIsLoading] = useState(false);

  const fetchLiveData = () => {
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

  useEffect(fetchLiveData, [socket, symbol]);

  const { price, prevClose, open, high, low, volume,
    marketStatus, lastUpdate, change, changePercentage } = quote;

  if (quoteIsLoading) {
    return (
      <MDBCardTitle style={{ height: '35px' }}>
        <Loading />
      </MDBCardTitle>
    );
  } else {
    return (
      <MDBCardTitle className={style.title}>
        <table>
          <tbody>
            <tr>
              <td className={style.larger}>
                <b>{`${symbol} ${name}`}</b>
                <LivePrice
                  price={price}
                  prevClose={prevClose}
                />
              </td>
              <td>
                <span className={style.grey}>High:</span>
                {
                  high !== undefined &&
                  <b className={colorClass(high, prevClose)}>
                    {high.toFixed(3)}
                  </b>
                }
              </td>
              <td>
                <span className={style.grey}>Open:</span>
                {
                  open !== undefined &&
                  <b className={colorClass(open, prevClose)}>
                    {open.toFixed(3)}
                  </b>
                }
              </td>
            </tr>
            <tr>
              <td className={style.smaller}>
                <span className={style.grey}>
                  {`${marketStatus} ${lastUpdate && (new Date(lastUpdate)).toLocaleString()}`}
                </span>
                {
                  change !== undefined &&
                  <span className={colorClass(change, 0)}>
                    {price >= prevClose ? '+' : ''} {change.toFixed(3)} {price >= prevClose ? '+' : ''} {changePercentage.toFixed(2)} %
              </span>
                }
              </td>
              <td>
                <span className={style.grey}>Low:</span>
                {
                  low !== undefined &&
                  <b className={colorClass(low, prevClose)}>
                    {low.toFixed(3)}
                  </b>
                }
              </td>
              <td>
                <span className={style.grey}>P. Close:</span>
                {
                  prevClose !== undefined &&
                  <b>
                    {prevClose.toFixed(3)}
                  </b>
                }
              </td>
              <td>
                <span className={style.grey}>Vol. :</span>
                {
                  volume !== undefined &&
                  <b>
                    {volume}
                  </b>
                }
              </td>
            </tr>
          </tbody>
        </table>
        <FontAwesomeIcon
          icon={faCog}
          className={style.icon}
          data-tip='Settings'
          onClick={handleSettingsIconClicked}
        />
        <ReactTooltip effect='solid' />
      </MDBCardTitle>
    );
  }
};

export default MainCardTitle;