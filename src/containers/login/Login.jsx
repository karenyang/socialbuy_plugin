import React from 'react';
import {
    Typography,
} from '@material-ui/core';
import './Login.css';
import axios from 'axios';

import {
    Link
} from 'react-router-dom';



class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: "",
            password: "",
            user_id: "",
        };
    }

    handleInputChange = (event) => {
        const {
            value,
            name
        } = event.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let request = {
            user_name: this.state.user_name,
            password: this.state.password,
        };

        this.setState({
            user_name: "",
            password: "",
        });

        let history = this.props.history;
        let onLoggedIn = this.props.onLoggedIn;
        chrome.runtime.sendMessage({ type: "onLogin", data: request },
            function (res) {
                console.log('Login receives reply from backgroumd: ', res.data);
                if (res.status === 200) {
                    console.log("Login succeeded. Proceed.");
                    onLoggedIn({"user_name": res.data.user_name, "user_id": res.data.user_id});
                    let redirect_path = "/greetings";
                    history.push(redirect_path);
                } else if (res.status === 250) {
                    console.error(res);
                    alert(res.data + ", please try again.");
                    throw new Error(res.data);
                } else {
                    alert(res.data + ", register failed for other reasons. Please try again.");
                    throw new Error(res.data);
                }
            });
    }

    render() {
        return (
            <div className="container">
                <div className='login-form'>
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <h1>Login</h1>
                        </div>
                        <div>
                            <label>Username: </label>
                            <input
                                type="text"
                                name="user_name"
                                placeholder="Enter Login Name"
                                value={this.state.user_name}
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password: </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter Password"
                                value={this.state.password}
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <input type="submit" value="Submit" />
                        </div>
                    </form>
                </div>
                <Link to="/admin/register" className="btn btn-primary">Create new account</Link>
            </div>
        );
    }
}

export default Login;
