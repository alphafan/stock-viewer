import * as types from './types';
import { uniqueCardId } from '../common/utils';

export const addCard = () => ({
  type: types.ADD_CARD,
  payload: {
    cardId: uniqueCardId()
  }
});

export const removeCard = cardId => ({
  type: types.REMOVE_CARD,
  payload: {
    cardId
  }
});