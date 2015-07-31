import React from 'react';

export default class ToDoSection extends React.Component {
  constructor() {
    super();

    this.state = this._getStateFromStore();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div className="to-do-section">
        ToDo
      </div>
    );
  }

  _getStateFromStore() {
    return {};
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
