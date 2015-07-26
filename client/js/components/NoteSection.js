import React from 'react';
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
    NoteStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    NoteStore.removeChangeListener(this._onChange);
  }

  componentDidUpdate() {
    this._scrollToBottom();
  }

  render() {
    return (
      <div className="note-section">
        <ul className="note-list" ref="noteList">
          {this.state.notes.map(note => (<NoteListItem key={note.id} note={note} />))}
        </ul>
        <NoteForm journalId={this.state.journalId}/>
      </div>
    );
  }

  _getStateFromStore() {
    return {
      notes: NoteStore.getAllForCurrentJournal(),
      journalId: JournalStore.getCurrentId()
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
