import React, { Component } from 'react';
import icon from '../../assets/img/icon-34.png';
import './Greetings.css';


class GreetingComponent extends Component {
  state = {
    name: 'User',
  };

  render() {
    return (
      <div>
        <img class="topleft" src={icon} alt="extension icon" />
        <p>Welcome to Social Buy Plugin!</p>
      </div>
    );
  }
}

export default GreetingComponent;
