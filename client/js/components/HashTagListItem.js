import React from 'react';
import AppActionCreators from '../actions/AppActionCreators';

export default class HashTagListItem extends React.Component {
  constructor() {
    super();
  }

  render() {
    let hashTag = this.props.hashTag;

    return (
      <li className="hash-tag">
        <a href="#" onClick={this._onClick.bind(this)}>{hashTag.text}</a>
      </li>
    );
  }

  _onClick() {
    AppActionCreators.clickHashTag(this.props.hashTag.text);
  }
}
