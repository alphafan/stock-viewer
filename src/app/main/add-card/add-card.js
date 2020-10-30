import React from 'react';
import { connect } from 'react-redux';
import { MDBCard, MDBCardBody } from 'mdbreact';

import * as actions from '../../../ducks/actions';
import * as selectors from '../../../ducks/selectors';
import style from './style.module.css';
import { MAX_CARDS } from '../../../common/constants';

const AddCard = ({ addCard, cards }) => (
  <>
    {
      cards.length < MAX_CARDS &&
      <MDBCard className={style.card} onClick={() => addCard()}>
        <MDBCardBody className={style.body}>
          <span className={style.span}>&#43;</span>
        </MDBCardBody>
      </MDBCard>
    }
  </>
);

const mapStateToProps = state => ({
  cards: selectors.getCards(state)
});

const mapDispatchToProps = dispatch => ({
  addCard: () => dispatch(actions.addCard())
})

export default connect(mapStateToProps, mapDispatchToProps)(AddCard);