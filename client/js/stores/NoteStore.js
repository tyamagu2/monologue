import BaseStore from './BaseStore';
import JournalStore from './JournalStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let getCreatedAt = function () {
  let hour = (new Date()).getHours();
  let minute = (new Date()).getMinutes();

  if (minute < 10) {
    return hour + ':0' + minute;
  } else {
    return hour + ':' + minute;
  }
}

let _notes = {
  1: [
    { id: 1, text: 'Inspite of all that may be', created_at: getCreatedAt() }
  ],
  2: [
    { id: 2, text: 'You, you know, you know my name', created_at:  getCreatedAt() }
  ],
  3: [
    { id: 3, text: 'Stuck inside these four walls', created_at: getCreatedAt() },
    { id: 4, text: 'Sent inside forever', created_at: getCreatedAt() },
    { id: 5, text: 'Never seeing no one', created_at: getCreatedAt() },
    { id: 6, text: 'Nice again', created_at: getCreatedAt() }
  ],
  4: [],
  5: [],
  6: []
};

let _nextId = 7;

class NoteStore extends BaseStore {
  constructor() {
    super();
  }

  getAllForJournal(journalId) {
    return _notes[journalId];
  }

  getAllForCurrentJournal() {
    return this.getAllForJournal(JournalStore.getCurrentId());
  }

  onNewJournal(journalId) {
    _notes[journalId] = [];
  }
}

let _NoteStore = new NoteStore();

_NoteStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.type) {
  case ActionTypes.CLICK_JOURNAL:
    AppDispatcher.waitFor([JournalStore.dispatchToken]);
    break;

  case ActionTypes.CREATE_NOTE:
    let note = {
      id: _nextId++,
      text: action.text,
      created_at: getCreatedAt()
    }
    _notes[action.journalId].push(note)
    break;

  default:
    return;
  }

  _NoteStore.emitChange();
});

export default _NoteStore;
