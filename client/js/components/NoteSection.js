import React from 'react';
import AppStore from '../stores/AppStore';
import NoteStore from '../stores/NoteStore';
import JournalStore from '../stores/JournalStore';
import NoteListItem from './NoteListItem';
import NoteForm from './NoteForm';

export default class NoteSection extends React.Component {
  constructor() {
    super();

    this.state = this._getStateFromStore();

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    AppStore.addChangeListener(this._onChange);
    NoteStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange);
    NoteStore.removeChangeListener(this._onChange);
  }

  componentDidUpdate() {
    this._scrollToBottom();
  }

  render() {
    return (
      <div className="note-section">
        <div className="note-section-header">{this.state.journal.title}</div>
        <div className="note-list-wrapper scroll-box">
          <ul className="note-list" ref="noteList">
            {this.state.notes.map(note => (<NoteListItem key={note.id} note={note} />))}
          </ul>
        </div>
        <NoteForm journalId={this.state.journal.id}/>
      </div>
    );
  }

  _getStateFromStore() {
    return {
      notes: NoteStore.getAllForCurrentJournalWithCurrentHashTag(),
      journal: JournalStore.getCurrent()
    };
  }

  _scrollToBottom() {
    let list = this.refs.noteList.getDOMNode();
    list.scrollTop = list.scrollHeight;
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
