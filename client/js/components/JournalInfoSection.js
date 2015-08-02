import React from 'react';
import JournalStore from '../stores/JournalStore';
import HashTagSection from './HashTagSection'
import ToDoSection from './ToDoSection'

export default class JournalInfoSection extends React.Component {
  constructor() {
    super();

    this.state = this._getStateFromStore();

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    JournalStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    JournalStore.removeChangeListener(this._onChange);
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
    return { journalId: JournalStore.getCurrentId() };
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
