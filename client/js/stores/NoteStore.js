import BaseStore from './BaseStore';
import JournalStore from './JournalStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _notes = {
  1: [
    { id: 1, text: 'Inspite of all that may be' }
  ],
  2: [
    { id: 2, text: 'You, you know, you know my name' }
  ],
  3: [
    { id: 3, text: 'Stuck inside these four walls' },
    { id: 4, text: 'Sent inside forever' },
    { id: 5, text: 'Never seeing no one' },
    { id: 6, text: 'Nice again' }
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
      date: new Date(),
      text: action.text
    }
    _notes[action.journalId].push(note)
    break;

  default:
    return;
  }

  _NoteStore.emitChange();
});

export default _NoteStore;
