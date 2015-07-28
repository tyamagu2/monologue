import React from 'react';

export default class NoteListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let note = this.props.note;

    return (
      <li className="note">
        <div className="note-time">
          {note.created_at}
        </div>
        <div className="note-text">{note.text}</div>
      </li>
    );
  }
}
