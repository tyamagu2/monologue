import React from 'react';

export default class HashTagSection extends React.Component {
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
      <div className="hash-tag-section">
        HashTag
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
