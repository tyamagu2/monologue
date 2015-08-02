import React from 'react';

export default class HashTagListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let hashTag = this.props.hashTag;

    return (
      <li className="hash-tag">
        <a href="#">{hashTag.text}</a>
      </li>
    );
  }
}
