import React from 'react';

export default class Navigation extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <header className="navigation" role="banner">
        <div className="navigation-wrapper">
          <a href="javascript:void(0)" className="logo">
            <img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/placeholder_logo_1.png" alt="Logo Image" />
          </a>
          <a href="javascript:void(0)" className="navigation-menu-button" id="js-mobile-menu">MENU</a>
          <nav role="navigation">
            <ul id="js-navigation-menu" className="navigation-menu show">
              <li className="nav-link"><a href="javascript:void(0)">Products</a></li>
            </ul>
          </nav>
          <div className="navigation-tools">
            <div className="search-bar">
              <form role="search">
                <input type="search" placeholder="Enter Search" />
                <button type="submit">
                  <img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/search-icon.png" alt="Search Icon" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
