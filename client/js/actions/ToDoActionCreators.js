import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export default {
  completeToDo: function (todoId, journalId) {
    AppDispatcher.dispatch({
      type: ActionTypes.COMPLETE_TODO,
      todoId: todoId,
      journalId: journalId
    })
  },
  undoToDo: function (todoId, journalId) {
    AppDispatcher.dispatch({
      type: ActionTypes.UNDO_TODO,
      todoId: todoId,
      journalId: journalId
    })
  },

};
