import React from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';

import AddCard from './add-card';
import StockCard from './stock-card';
import * as selectors from '../../ducks/selectors';

const Main = ({ cards }) => (
  <Container fluid>
    <Row>
      {cards.map(card =>
        <Col xl={6} key={card.cardId} >
          <StockCard card={card} />
        </Col>
      )}
      <Col xl={6}>
        <AddCard />
      </Col>
    </Row>
  </Container>
);

const mapStateToProps = state => ({
  cards: selectors.getCards(state)
});

export default connect(mapStateToProps)(Main);