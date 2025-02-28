import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Pages} from './config/Router';

function App() {
  return (
    <Router>
      <div>
        <Pages />
      </div>
    </Router>
  );
}

export default App;
