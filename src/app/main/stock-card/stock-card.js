import React, { useState } from 'react';
import { connect } from 'react-redux';
import { MDBCard, MDBCardBody } from 'mdbreact';

import Settings from './settings';
import MainCard from './main-card';
import * as actions from '../../../ducks/actions';
import style from './style.module.css';

const StockCard = ({ card: { cardId }, removeCard }) => {

  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [pageId, setPageId] = useState('Settings');

  const handleSelectTicker = opt => {
    setName(opt.label);
    setSymbol(opt.value);
    setPageId('Main');
  };
  const handleSettingsIconClicked = () => {
    setPageId('Settings');
  };
  const handleRemoveCard = () => {
    removeCard(cardId);
  }

  return (
    <MDBCard className={style.card}>
      <MDBCardBody className={style.body}>
        {pageId === 'Settings' ?
          <Settings
            symbol={symbol}
            handleSelectTicker={handleSelectTicker}
            handleRemoveCard={handleRemoveCard}
          />
          :
          <MainCard
            name={name}
            symbol={symbol}
            handleSettingsIconClicked={handleSettingsIconClicked}
          />
        }
      </MDBCardBody>
    </MDBCard>
  );
}
const mapDispatchToProps = dispatch => ({
  removeCard: cardId => dispatch(actions.removeCard(cardId))
})

export default connect(undefined, mapDispatchToProps)(StockCard);