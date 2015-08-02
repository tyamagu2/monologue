import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export default {
  createNote: function (text, journalId) {
    let _text = text;
    let hashTagRegExp = /(?:^|\s)(#[^\s]+)(?:\s|$)/;
    let hashTagMatches = null;
    let hashTags = [];

    while ((hashTagMatches = hashTagRegExp.exec(_text))) {
      hashTags.push(hashTagMatches[1]);

      AppDispatcher.dispatch({
        type: ActionTypes.CREATE_HASH_TAG,
        text: hashTagMatches[1],
        journalId: journalId
      });

      _text = _text.replace(hashTagMatches[0], '');
    }

    AppDispatcher.dispatch({
      type: ActionTypes.CREATE_NOTE,
      text: text,
      journalId: journalId,
      hashTags: hashTags
    })

    let todoMatches = text.match(/^TODO: (.+)/)
    if (todoMatches) {
      AppDispatcher.dispatch({
        type: ActionTypes.CREATE_TODO,
        text: todoMatches[1],
        journalId: journalId
      });
    }
  }
};
