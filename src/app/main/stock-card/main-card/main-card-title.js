import React from 'react';
import ReactTooltip from 'react-tooltip';
import FlashChange from '@avinlab/react-flash-change';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';

const colorClass = (a, b) => a > b ? style.green : a < b ? style.red : '';

const MainCardTitle = ({ name, symbol, quote, handleSettingsIconClicked }) => {
  const { price, prevClose, open, high, low, volume,
    marketStatus, lastUpdate, change, changePercentage } = quote;
  return (
    <MDBCardTitle className={style.title}>
      <table>
        <tbody>
          <tr>
            <td className={style.larger}>
              <b>{`${symbol} ${name}`}</b>
              {
                price !== undefined &&
                <FlashChange
                  value={price}
                  flashClassName='flashing'
                  compare={(prevProps, nextProps) => {
                    return prevProps.quote && nextProps.quote &&
                      nextProps.quote.price !== prevProps.quote.price;
                  }}
                >
                  <b className={colorClass(price, prevClose)}>
                    {price.toFixed(3)} <FontAwesomeIcon icon={price >= prevClose ? faLongArrowAltUp : faLongArrowAltDown} />
                  </b>
                </FlashChange>
              }
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
                {`${marketStatus} ${lastUpdate && (new Date(lastUpdate)).toLocaleTimeString()}`}
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
};

export default MainCardTitle;