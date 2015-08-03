import React from 'react';
import classNames from 'classnames';
import JournalActionCreators from '../actions/JournalActionCreators';

export default class JournalListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let journal = this.props.journal;

    return (
      <li
        className={classNames({
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
