import React from 'react';
import HashTagSection from './HashTagSection'
import ToDoSection from './ToDoSection'

export default class JournalInfoSection extends React.Component {
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
      <div className="journal-info-section scroll-box">
        <HashTagSection />
        <ToDoSection />
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
