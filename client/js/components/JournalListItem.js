import React from 'react';
import cx from 'react/lib/cx';
import JournalActionCreators from '../actions/JournalActionCreators';

export default class JournalListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let journal = this.props.journal;

    return (
      <li
        className={cx({
          'journal': true,
          'active': journal.id === this.props.currentJournalId
        })}
        onClick={this._onClick.bind(this)}
      >
        {journal.title}
      </li>
    );
  }

  _onClick() {
    JournalActionCreators.clickJournal(this.props.journal.id);
  }
}
