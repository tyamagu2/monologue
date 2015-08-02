import React from 'react';
import HashTagStore from '../stores/HashTagStore';
import HashTagListItem from './HashTagListItem';

export default class HashTagSection extends React.Component {
  constructor() {
    super();

    this.state = this._getStateFromStore();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div className="hash-tag-section">
        <h3 className="hash-tag-header">Hash Tag</h3>
        {this.state.hashTags.map(hashTag => <HashTagListItem hashTag={hashTag} />)}
      </div>
    );
  }

  _getStateFromStore() {
    return {
      hashTags: HashTagStore.getAllForCurrentJournal()
    };
  }

  _onChange() {
    this.setState(this._getStateFromStore());
  }
}
