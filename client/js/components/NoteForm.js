import React from 'react';
import NoteActionCreators from '../actions/NoteActionCreators';

const ENTER_KEY_CODE = 13;

export default class NoteForm extends React.Component {
  constructor() {
    super();

    this.state = { text: '' };
  }

  render() {
    return (
      <div className="note-form-container">
        <textarea
          className="note-form"
          name="note"
          value={this.state.text}
          onChange={this._onChange.bind(this)}
          onKeyDown={this._onKeyDown.bind(this)}
        />
      </div>
    );
  }

  _onChange(e) {
    this.setState({ text: e.target.value });
  }

  _onKeyDown(e) {
    if (e.keyCode !== ENTER_KEY_CODE) { return; }

    event.preventDefault();

    let text = this.state.text.trim();

    if (text) {
      NoteActionCreators.createNote(text, this.props.journalId);
    }

    this.setState({ text: '' });
  }
}
