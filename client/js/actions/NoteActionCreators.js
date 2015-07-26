import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export default {
  createNote: function (text, journalId) {
    AppDispatcher.dispatch({
      type: ActionTypes.CREATE_NOTE,
      text: text,
      journalId: journalId
    })
  }
};
