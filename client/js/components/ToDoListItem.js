import React from 'react';
import ToDoActionCreators from '../actions/ToDoActionCreators';

export default class ToDoListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let todo = this.props.todo;

    return (
      <li className="todo">
        <label>
          <input type="checkbox" checked={todo.done} onChange={this._onChange.bind(this)}/>
          {todo.text}
        </label>
      </li>
    );
  }

  _onChange() {
    let todo = this.props.todo;

    if (todo.done) {
      ToDoActionCreators.undoToDo(todo.id, todo.journalId);
    } else {
      ToDoActionCreators.completeToDo(todo.id, todo.journalId);
    }
  }
}
