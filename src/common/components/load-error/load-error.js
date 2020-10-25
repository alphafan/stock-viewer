import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Row, Col } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';

const LoadError = ({ fetchData, handleRemoveCard }) => (
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
      <ReactTooltip effect='solid' />
    </MDBCardTitle>
  </>
);

export default LoadError;