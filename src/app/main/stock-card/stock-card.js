import React, { useState } from 'react';
import { connect } from 'react-redux';
import { MDBCard, MDBCardBody } from 'mdbreact';

import MainCard from './main-card';
import SelectTicker from './select-ticker';
import * as actions from '../../../ducks/actions';
import style from './style.module.css';
import { SELECT_TICKER_PAGE, MAIN_CARD_PAGE, SETTINGS_PAGE } from '../../../common/constants';
import Settings from './settings';

const StockCard = ({ card: { cardId }, removeCard }) => {

  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [pageId, setPageId] = useState(SELECT_TICKER_PAGE);

  const handleSelectTicker = opt => {
    setName(opt.label);
    setSymbol(opt.value);
    setPageId(MAIN_CARD_PAGE);
  };
  const handleSettingsIconClicked = () => {
    setPageId(SETTINGS_PAGE);
  };
  const handleBackToMainIconClicker = () => {
    setPageId(MAIN_CARD_PAGE);
  };
  const handleRemoveCard = () => {
    removeCard(cardId);
  };

  let Page;

  if (pageId === SELECT_TICKER_PAGE) {
    Page = (
      <SelectTicker
        symbol={symbol}
        handleSelectTicker={handleSelectTicker}
        handleRemoveCard={handleRemoveCard}
      />
    );
  } else if (pageId === MAIN_CARD_PAGE) {
    Page = (
      <MainCard
        name={name}
        symbol={symbol}
        handleSettingsIconClicked={handleSettingsIconClicked}
      />
    );
  } else if (pageId === SETTINGS_PAGE) {
    Page = (
      <Settings
        symbol={symbol}
        handleRemoveCard={handleRemoveCard}
        handleBackToMainIconClicker={handleBackToMainIconClicker}
      />
    );
  }

  return (
    <MDBCard className={style.card}>
      <MDBCardBody className={style.body}>
        {Page}
      </MDBCardBody>
    </MDBCard>
  );
}

const mapDispatchToProps = dispatch => ({
  removeCard: cardId => dispatch(actions.removeCard(cardId))
})

export default connect(undefined, mapDispatchToProps)(StockCard);