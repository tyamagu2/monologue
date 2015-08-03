import React from 'react';
import ToDoStore from '../stores/ToDoStore';
import ToDoListItem from './ToDoListItem';

export default class ToDoSection extends React.Component {
  constructor() {
    super();

    this.state = this._getStateFromStore();

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    ToDoStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    ToDoStore.removeChangeListener(this._onChange);
  }

  render() {
    return (
      <div className="todo-section">
        <h3 className="todo-header">ToDo</h3>
        <ul>
          {this.state.todos.map(todo => <ToDoListItem todo={todo} key={todo.id} />)}
        </ul>
      </div>
    );
  }

  _getStateFromStore() {
    return {
      todos: ToDoStore.getAllForCurrentJournal()
    };
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
