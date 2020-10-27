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
      user_id: this.props.user_id,
    }
    console.log(this.state);
  }

  componentDidUpdate(prevProps) {
		if (prevProps.user_name !== this.props.user_name) {
			this.setState({
				user_name: this.props.user_name
			});
    }
    if (prevProps.user_id !== this.props.user_id) {
			this.setState({
				user_id: this.props.user_id
			});
		}
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
