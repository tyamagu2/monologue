import BaseStore from './BaseStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _currentHashTag = '';

class AppStore extends BaseStore {
  constructor() {
    super();
  }

  getCurrentHashTag() {
    return _currentHashTag;
  }
}

let _AppStore = new AppStore();

_AppStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.type) {
  case ActionTypes.CHANGE_CURRENT_HASH_TAG:
    _currentHashTag = action.hashTag;
    break;

  default:
    return;
  }

  _AppStore.emitChange();
});

export default _AppStore;
