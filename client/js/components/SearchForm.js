import React from 'react';

export default class Navigation extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="search-bar">
        <form role="search">
          <input type="search" placeholder="Enter Search" />
          <button type="submit">
            <img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/search-icon.png" alt="Search Icon" />
          </button>
        </form>
      </div>
    );
  }
}
