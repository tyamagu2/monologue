import React from 'react';

export default class ToDoListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let todo = this.props.todo;

    return (
      <li className="todo">
        <label>
          <input type="checkbox" checked={todo.done ? "checked" : "" } />
          {todo.text}
        </label>
      </li>
    );
  }
}
