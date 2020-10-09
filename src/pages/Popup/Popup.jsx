import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/greetings/Greetings';
import LoginRegister from '../../containers/loginRegister/LoginRegister';

import './Popup.css';

const Popup = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Greetings />
        <LoginRegister/>
      </header>
    </div>
  );
};

export default Popup;
