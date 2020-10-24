import { combineReducers } from 'redux';

import * as types from './types';

const INITIAL_STATE_CARDS = {
  cards: []
};

const cardsReducer = (state = INITIAL_STATE_CARDS, { type, payload }) => {
  switch (type) {
    case types.ADD_CARD:
      const card = { cardId: payload.cardId };
      return {
        ...state,
        cards: [...state.cards, card]
      }
    case types.REMOVE_CARD:
      return {
        ...state,
        cards: state.cards.filter(card => card.cardId !== payload.cardId)
      }
    default:
      return state;
  }
};

const reducer = combineReducers({
  cards: cardsReducer
});

export default reducer;