import React, {
  Component
} from 'react';
import icon from '../../assets/img/icon-34.png';
import './Greetings.css';


class Greetings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_name: this.props.user_name,
    }
    console.log(this.state);
  }

  render() {
    return (
      <div>
        <img class="topleft" src={icon} alt="extension icon" />
        <p>Welcome! {this.state.user_name} </p>
      </div>
    );
  }
}

export default Greetings;
