import React, {
    Component
} from 'react';
import {
    Typography,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
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
            if (this.props.user_name === ""){
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_name: this.props.user_name
            });
        }
        if (prevProps.user_id !== this.props.user_id) {
            if (this.props.user_id === ""){
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_id: this.props.user_id
            });
        }
    }

    render() {
        return (
            <div className="container">
                <img class="topleft" src={icon} alt="extension icon" />
                <Typography variant="h5" color="inherit">
                    Welcome! {this.state.user_name}
                </Typography>
                <Button variant="h5" className="bottom" onClick={this.props.onLogOut}>
                    Log Out
				</Button>
            </div>
        );
    }
}

export default Greetings;
