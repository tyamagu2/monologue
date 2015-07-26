import React from 'react';
import JournalSection from './JournalSection';
import NoteSection from './NoteSection';

export default class MonologueApp extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className="monologue-app">
        <JournalSection />
        <NoteSection />
      </div>
    );
  }
}
