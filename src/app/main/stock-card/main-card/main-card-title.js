import React from 'react';
import ReactTooltip from 'react-tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';

const MainCardTitle = ({ ticker, symbol, quote, handleSettingsIconClicked }) => {
  const { marketStatus, price, prevClose, open, high, low, change, changePercentage } = quote;
  return (
    <MDBCardTitle className={style.title}>
      <table>
        <tbody>
          <tr>
            <td className={style.larger}>
              <b>{`${ticker} ${symbol}`}</b>
              {
                price !== undefined &&
                <b className={price > prevClose ? style.green : price < prevClose ? style.red : ''}>
                  {price.toFixed(3)} <FontAwesomeIcon icon={price >= prevClose ? faLongArrowAltUp : faLongArrowAltDown} />
                </b>
              }
            </td>
            <td>
              <span className={style.grey}>High:</span>
              {
                high !== undefined &&
                <b className={high > prevClose ? style.green : high < prevClose ? style.red : ''}>
                  {high.toFixed(3)}
                </b>
              }
            </td>
            <td>
              <span className={style.grey}>Open:</span>
              {
                open !== undefined &&
                <b className={open > prevClose ? style.green : open < prevClose ? style.red : ''}>
                  {open.toFixed(3)}
                </b>
              }
            </td>
          </tr>
          <tr>
            <td className={style.smaller}>
              <span className={style.grey}>{marketStatus}</span>
              {
                change !== undefined &&
                <span className={price > prevClose ? style.green : price < prevClose ? style.red : ''}>
                  {price >= prevClose ? '+' : ''} {change.toFixed(3)} {price >= prevClose ? '+' : ''} {changePercentage.toFixed(2)} %
            </span>
              }
            </td>
            <td>
              <span className={style.grey}>Low:</span>
              {
                low !== undefined &&
                <b className={low > prevClose ? style.green : low < prevClose ? style.red : ''}>
                  {low.toFixed(3)}
                </b>
              }
            </td>
            <td>
              <span className={style.grey}>Prev Close:</span>
              {
                prevClose !== undefined &&
                <b>
                  {prevClose.toFixed(3)}
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