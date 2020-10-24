import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import Loader from 'react-loader-spinner';
import ReactTooltip from 'react-tooltip';
import { Row, Col } from 'react-bootstrap';

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';
import * as actions from '../../../../ducks/actions';
import { SERVER_ROOT_URL } from '../../../../common/constants';

const TickersLoadError = ({ fetchData, handleRemoveCard }) => (
  <>
    <MDBCardTitle className={style.title}>
      <Row>
        <Col xs={4} xl={3}>
          <center>
            <img src={process.env.PUBLIC_URL + '/error.png'} alt='error...' className='pt-2' />
          </center>
        </Col>
        <Col xs={8} xl={9} className='mt-4'>
          <h2>Holey moley! This really sucks ...</h2>
          <hr />
          <p className={style.text}>We're really sorry, it looks like there is something wrong in our server.<br />
        To reload page, <span className={`text-primary ${style.span}`} onClick={fetchData}>click here</span>.
        </p>
        </Col>
      </Row>
      <FontAwesomeIcon
        icon={faTimes}
        className={style.icon}
        data-tip='Remove Card'
        onClick={handleRemoveCard}
      />
    </MDBCardTitle>
  </>
);

const TickersIsLoading = () => (
  <div className={style.spinner}>
    <Loader type='ThreeDots' color='#2BAD60' height='100' width='100' />
  </div>
);

const SelectTicker = ({ ticker, tickers, handleSelectTicker, handleRemoveCard }) => (
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
      value={ticker}
      options={tickers}
      onChange={handleSelectTicker}
      className='my-4'
    />
  </>
);

const Settings = ({ cardId, ticker, removeCard, handleSelectTicker }) => {

  const [tickers, setTickers] = useState([]);
  const [tickersIsLoading, setTickersIsLoading] = useState(false);
  const [tickersLoadError, setTickersLoadError] = useState(false);

  const fetchData = () => {
    setTickersIsLoading(true);
    setTickersLoadError(false);
    axios
      .get(`http://${SERVER_ROOT_URL}/api/get_tickers`)
      .then(response => {
        setTickers(response.data);
        setTickersIsLoading(false);
      }, () => {
        setTickersIsLoading(false);
        setTickersLoadError(true);
      })
  }
  useEffect(fetchData, []);

  const handleRemoveCard = () => removeCard(cardId);

  if (tickersLoadError) {
    return (
      <TickersLoadError
        fetchData={fetchData}
        handleRemoveCard={handleRemoveCard}
      />
    );
  } else if (tickersIsLoading) {
    return (
      <TickersIsLoading />
    );
  } else {
    return (
      <SelectTicker
        ticker={ticker}
        tickers={tickers}
        handleSelectTicker={handleSelectTicker}
        handleRemoveCard={handleRemoveCard}
      />
    );
  }
};

const mapDispatchToProps = dispatch => ({
  removeCard: cardId => dispatch(actions.removeCard(cardId))
})

export default connect(undefined, mapDispatchToProps)(Settings);