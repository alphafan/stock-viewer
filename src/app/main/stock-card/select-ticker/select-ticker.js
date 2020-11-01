import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';
import { SERVER_ROOT_URL } from '../../../../common/constants';
import LoadError from '../../../../common/components/load-error';
import Loading from '../../../../common/components/loading';

const SelectTicker = ({ symbol, handleRemoveCard, handleSelectTicker }) => {

  const [tickers, setTickers] = useState([]);
  const [tickersIsLoading, setTickersIsLoading] = useState(false);
  const [tickersLoadError, setTickersLoadError] = useState(false);

  const fetchData = () => {
    setTickersIsLoading(true);
    setTickersLoadError(false);
    axios
      .get(`${SERVER_ROOT_URL}/api/get_tickers`)
      .then(response => {
        setTickers(response.data);
        setTickersIsLoading(false);
      }, () => {
        setTickersIsLoading(false);
        setTickersLoadError(true);
      })
  }
  useEffect(fetchData, []);

  if (tickersLoadError) {
    return (
      <LoadError
        fetchData={fetchData}
        handleRemoveCard={handleRemoveCard}
      />
    );
  } else if (tickersIsLoading) {
    return (
      <Loading />
    );
  } else {
    return (
      <>
        <MDBCardTitle className={style.title}>
          Select a stock...
        <FontAwesomeIcon
            icon={faTimes}
            className={style.icon}
            data-tip='Remove Card'
            onClick={handleRemoveCard}
          />
          <ReactTooltip effect='solid' />
        </MDBCardTitle>
        <hr />
        <Select
          isClearable
          value={symbol}
          options={tickers}
          onChange={handleSelectTicker}
          className='my-4'
        />
      </>
    );
  }
};

export default SelectTicker;