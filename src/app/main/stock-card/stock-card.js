import React, { useState } from 'react';
import { MDBCard, MDBCardBody } from 'mdbreact';

import Settings from './settings';
import MainCard from './main-card';
import style from './style.module.css';

const StockCard = ({ card: { cardId } }) => {

  const [ticker, setTicker] = useState();
  const [symbol, setSymbol] = useState();
  const [pageId, setPageId] = useState('Settings');

  const handleSelectTicker = opt => {
    setTicker(opt.value);
    setSymbol(opt.label);
    setPageId('Main');
  };
  const handleSettingsIconClicked = () => {
    setPageId('Settings');
  };

  return (
    <MDBCard className={style.card}>
      <MDBCardBody className={style.body}>
        {pageId === 'Settings' ?
          <Settings
            cardId={cardId}
            ticker={ticker}
            handleSelectTicker={handleSelectTicker}
          />
          :
          <MainCard
            ticker={ticker}
            symbol={symbol}
            handleSettingsIconClicked={handleSettingsIconClicked}
          />
        }
      </MDBCardBody>
    </MDBCard>
  );
}

export default StockCard;