import React from 'react';
import ReactTooltip from 'react-tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';

const MainCardTitle = ({ ticker, symbol, quote, handleSettingsIconClicked }) => {
  const { price, prevClose, change, changePercentage } = quote;
  return (
    <MDBCardTitle className={style.title}>
      <table>
        <tr>
          <td>
            <span>{`${ticker} ${symbol}`}</span>
            {
              price &&
              <span className={price >= prevClose ? style.green : style.red}>
                {price.toFixed(3)} <FontAwesomeIcon icon={price >= prevClose ? faLongArrowAltUp : faLongArrowAltDown} />
              </span>
            }
          </td>
        </tr>
        <tr>
          <td>
            <span className={style.grey}>Market Close</span>
            {
              change !== undefined &&
              <span className={price >= prevClose ? style.green : style.red}>
                {price >= prevClose ? '+' : ''} {change.toFixed(3)} {price >= prevClose ? '+' : ''} {changePercentage.toFixed(2)} %
            </span>
            }
          </td>
        </tr>
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