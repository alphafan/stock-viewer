import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown, faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons';

import style from './style.module.css';

const MainCardLivePrice = ({ quote }) => {
  const { quotePrice, prevClosePrice } = quote;
  return (
    <>
      {
        quotePrice &&
        <>
          <h3 className={quotePrice >= prevClosePrice ? style.green : style.red}>
            {quotePrice.toFixed(3)} <FontAwesomeIcon icon={quotePrice >= prevClosePrice ? faLongArrowAltUp : faLongArrowAltDown} />
          </h3>
          <p className={quotePrice >= prevClosePrice ? style.green : style.red}>
            {quotePrice >= prevClosePrice ? '+' : ''}
            {(quotePrice - prevClosePrice).toFixed(3)} {quotePrice >= prevClosePrice ? '+' : ''}
            {((quotePrice - prevClosePrice) / prevClosePrice * 100).toFixed(2)} %
          </p>
        </>
      }
    </>
  );
};

export default MainCardLivePrice;