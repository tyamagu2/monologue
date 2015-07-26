import React from 'react';

export default class NoteListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let note = this.props.note;

    return (
      <li className="note">
        {note.text}
      </li>
    );
  }
}
