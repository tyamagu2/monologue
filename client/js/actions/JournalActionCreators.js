import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export default {
  clickJournal: function (journalId) {
    AppDispatcher.dispatch({
      type: ActionTypes.CLICK_JOURNAL,
      journalId: journalId
    })
  }
};
