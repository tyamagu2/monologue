import React from 'react';
import MonologueApp from './components/MonologueApp';
window.React = React; // export for dev tools

React.render(
  <MonologueApp />,
  document.getElementById('app')
);
