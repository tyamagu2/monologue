import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export default {
  clickHashTag: function (hashTag) {
    AppDispatcher.dispatch({
      type: ActionTypes.CHANGE_CURRENT_HASH_TAG,
      hashTag: hashTag
    })
  }
};
