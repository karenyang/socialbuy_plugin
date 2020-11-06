import React from 'react';
import './Register.css';

import {
    Link
} from 'react-router-dom';

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: "",
            password: "",
            new_user_name: "",
            new_password: "",
            new_password_repeat: "",
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

    handleRegister = (event) => {
        event.preventDefault();
        if (this.state.new_password !== this.state.new_password_repeat) {
            alert("Two password input are not the same. Please try again.");
            this.setState({
                new_password: "",
                new_password_repeat: "",
            });
            return;
        }

        let request = {
            user_name: this.state.new_user_name,
            password: this.state.new_password,
        };

        // clear the register form
        this.setState({
            new_user_name: "",
            new_password: "",
            new_password_repeat: "",

        });
        let history = this.props.history;
        chrome.runtime.sendMessage({ type: "onRegister", data: request },
            function (res) {
                console.log('Register receives reply from background: ', res.data);
                if (res.status === 200) {
                    console.log("Registered succeeded. Proceed.");
                    let redirect_path = "/admin/login";
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


    onClickLogIn = () => {
        console.log("clicked login");
        this.setState({ isRegister: false });
    }


    render() {
        console.log("render register page now. ")

        return (
            <div className="container">
                <div className='register-form'>
                    <form onSubmit={this.handleRegister}>
                        <div>
                            <h1>Join Us</h1>
                        </div>
                        <div>
                            <label>Username: </label>
                            <input
                                type="text"
                                name="new_user_name"
                                placeholder="Enter Username"
                                value={this.state.new_user_name}
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password: </label>
                            <input
                                type="password"
                                name="new_password"
                                placeholder="Enter Password"
                                value={this.state.new_password}
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Repeat Password: </label>
                            <input
                                type="password"
                                name="new_password_repeat"
                                placeholder="Repeat Above Password"
                                value={this.state.new_password_repeat}
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <input type="submit" value="Continue" />
                    </form>
                    <p>Already a member?</p>
                    <Link to="/admin/login" className="btn btn-primary">Log In</Link>
                </div>

            </div>
        );
    }



}

export default Register;
