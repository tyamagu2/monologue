import React from 'react';
import JournalStore from '../stores/JournalStore';
import JournalListItem from './JournalListItem';

export default class JournalSection extends React.Component {
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
      <div className="journal-section">
        <div className="journal-list-wrapper">
          <ul className="journal-list">
            {this.state.journals.map(journal => (<JournalListItem key={journal.id} journal={journal} currentJournalId={this.state.currentJournalId} />))}
          </ul>
        </div>
      </div>
    );
  }

  _getStateFromStore() {
    return {
      journals: JournalStore.getAll(),
      currentJournalId: JournalStore.getCurrentId()
    };
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
