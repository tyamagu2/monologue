import BaseStore from './BaseStore';
import JournalStore from './JournalStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _hashTags = {
  1: [
    { id: 1, journalId: 1, text: 'tokyo' }
  ],
  2: [
    { id: 2, journalId: 2, text: 'ruby' }
  ],
  3: [
    { id: 3, journalId: 3, text: 'beatles' },
    { id: 4, journalId: 3, text: 'RubyOnRails' },
    { id: 5, journalId: 3, text: 'flux' },
    { id: 6, journalId: 3, text: 'LiverpoolFC' }
  ],
  4: [],
  5: [],
  6: []
};

let _nextId = 7;

class HashTagStore extends BaseStore {
  constructor() {
    super();
  }

  getAllForJournal(journalId) {
    return _hashTags[journalId];
  }

  getAllForCurrentJournal() {
    return this.getAllForJournal(JournalStore.getCurrentId());
  }

  onNewJournal(journalId) {
    _hashTagss[journalId] = [];
  }
}

let _HashTagStore = new HashTagStore();

_HashTagStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.type) {
  case ActionTypes.CLICK_JOURNAL:
    AppDispatcher.waitFor([JournalStore.dispatchToken]);
    break;

  case ActionTypes.CREATE_HASH_TAG:
    let hashTag = {
      id: _nextId++,
      journalId: action.journalId,
      text: action.text
    }
    _hashTags[action.journalId].push(hashTag)
    break;

  default:
    return;
  }

  _HashTagStore.emitChange();
});

export default _HashTagStore;
