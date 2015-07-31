import React from 'react';
import Navigation from './Navigation';
import JournalSection from './JournalSection';
import NoteSection from './NoteSection';
import JournalInfoSection from './JournalInfoSection';

export default class MonologueApp extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className="monologue-app">
        <Navigation />
        <div className="main-container">
          <JournalSection />
          <NoteSection />
          <JournalInfoSection />
        </div>
      </div>
    );
  }
}
