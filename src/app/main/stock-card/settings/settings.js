import React from 'react';
import ReactTooltip from 'react-tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import { MDBCardTitle } from 'mdbreact';

import style from './style.module.css';

const Settings = ({ handleRemoveCard, handleBackToMainIconClicker }) => {
  return (
    <>
      <MDBCardTitle className={style.title}>
        Settings
        <div>
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={style.icon}
            data-tip='Back To Main'
            onClick={handleBackToMainIconClicker}
            style={{marginRight: '10px'}}
          />
          <FontAwesomeIcon
            icon={faTimes}
            className={style.icon}
            data-tip='Remove Card'
            onClick={handleRemoveCard}
          />
        </div>
        <ReactTooltip effect='solid' />
      </MDBCardTitle>
      <hr />
    </>
  )
};

export default Settings;