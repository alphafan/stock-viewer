import React from 'react';

import MainCardTitle from './main-card-title';
import MainCardBody from './main-card-body';

const MainCard = ({ symbol, name, handleSettingsIconClicked }) => (
  <>
    <MainCardTitle
      symbol={symbol}
      name={name}
      handleSettingsIconClicked={handleSettingsIconClicked}
    />
    <hr />
    <MainCardBody 
      symbol={symbol}
    />
  </>
);

export default MainCard;