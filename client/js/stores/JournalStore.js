import BaseStore from './BaseStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _journals = [
  { id: 1, title: 'Squint' },
  { id: 2, title: 'Zanmai' },
  { id: 3, title: 'April' },
  { id: 4, title: 'August' },
  { id: 5, title: 'Cellar' },
  { id: 6, title: 'Shung' }
];

let _currentId = 1;

class JournalStore extends BaseStore {
  constructor() {
    super();
  }

  getAll() {
    return _journals;
  }

  getCurrentId() {
    return _currentId;
  }

  getCurrent() {
    for (let index = 0; index < _journals.length; index++) {
      let journal = _journals[index];

      if (journal.id == this.getCurrentId()) {
        return journal;
      }
    }
  }
}

let _JournalStore = new JournalStore();

_JournalStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.type) {
  case ActionTypes.CLICK_JOURNAL:
    if (_currentId == action.journalId) { return; }

    _currentId = action.journalId;
    break;

  default:
    return;
  }

  _JournalStore.emitChange();
});

export default _JournalStore;
