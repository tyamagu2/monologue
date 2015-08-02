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

let _todos = {
  1: [
    { id: 1, text: 'Try rails 5.0', created_at: getCreatedAt(), done: false }
  ],
  2: [
    { id: 2, text: 'Finish deploy script', created_at:  getCreatedAt(), done: false }
  ],
  3: [
    { id: 3, text: 'Email to Paul', created_at: getCreatedAt(), done: false },
    { id: 4, text: 'Call John', created_at: getCreatedAt(), done: true },
    { id: 5, text: 'Finish css', created_at: getCreatedAt(), done: false },
    { id: 6, text: 'Deploy', created_at: getCreatedAt(), done: false }
  ],
  4: [],
  5: [],
  6: []
};

let _nextId = 7;

class ToDoStore extends BaseStore {
  constructor() {
    super();
  }

  getAllForJournal(journalId) {
    return _todos[journalId];
  }

  getAllForCurrentJournal() {
    return this.getAllForJournal(JournalStore.getCurrentId());
  }

  onNewJournal(journalId) {
    _todos[journalId] = [];
  }
}

let _ToDoStore = new ToDoStore();

_ToDoStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.type) {
  case ActionTypes.CLICK_JOURNAL:
    AppDispatcher.waitFor([JournalStore.dispatchToken]);
    break;

  case ActionTypes.CREATE_TODO:
    let todo = {
      id: _nextId++,
      text: action.text,
      created_at: getCreatedAt(),
      done: false
    }
    _todos[action.journalId].push(todo)
    break;

  default:
    return;
  }

  _ToDoStore.emitChange();
});

export default _ToDoStore;
