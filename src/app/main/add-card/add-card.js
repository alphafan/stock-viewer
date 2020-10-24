import React from 'react';
import { connect } from 'react-redux';
import { MDBCard, MDBCardBody } from 'mdbreact';

import * as actions from '../../../ducks/actions';
import style from './style.module.css';

const AddCard = ({ addCard }) => (
  <MDBCard className={style.card} onClick={() => addCard()}>
    <MDBCardBody className={style.body}>
      <span className={style.span}>&#43;</span>
    </MDBCardBody>
  </MDBCard>
);

const mapDispatchToProps = dispatch => ({
  addCard: () => dispatch(actions.addCard())
})

export default connect(undefined, mapDispatchToProps)(AddCard);