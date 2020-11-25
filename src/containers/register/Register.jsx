import React from 'react';

import {
    Link
} from 'react-router-dom';
import './Register.css';
import {
    Button,
} from '@material-ui/core';
import icon from '../../assets/img/icon-34.png';
import FacebookIcon from '@material-ui/icons/Facebook';



class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            user_name: "",
            password: "",
            new_email: "",
            new_user_name: "",
            new_password: "",
            new_password_repeat: "",
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
            email: this.state.new_email,
            user_name: this.state.new_user_name,
            password: this.state.new_password,
        };

        // clear the register form
        this.setState({
            new_email: "",
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

    onClickFBLogin = () => {
        const app_id = "189391966126165";
        const redirect_uri = encodeURIComponent(chrome.identity.getRedirectURL("TasteMaker") + "/greetings");
        console.log("redirect_uri is: ", redirect_uri);
        const url = 'https://www.facebook.com/v9.0/dialog/oauth?' +
            'client_id=' + app_id +
            '&redirect_uri=' + redirect_uri +
            '&scope=email,user_friends' +
            '&response_type=token';
        console.log("url for FB login is: ", url);
        let history = this.props.history;
        let fb_access_token = null;
        const onLoggedIn = this.props.onLoggedIn;
        chrome.identity.launchWebAuthFlow(
            {
                "url": url,
                "interactive": true,
            },
            function (redirectUri) {
                if (chrome.runtime.lastError) {
                    console.log(new Error(chrome.runtime.lastError));
                    return;
                }
                console.log("After launchWebAuthFlow: ", redirectUri);
                fb_access_token = new URL(redirectUri).hash.toString().split('#access_token=')[1].split('&')[0];
                console.log("fb_access_token: ", fb_access_token);
                chrome.runtime.sendMessage({ type: "onFacebookLogin", data: { "fb_access_token": fb_access_token } },
                    function (res) {
                        console.log('onFacebookLogin receives reply from backgroumd: ', res.data);
                        if (res.status === 200) {
                            console.log("onFacebookLogin succeeded. Proceed.");
                            onLoggedIn({ "email": res.data.email, "user_name": res.data.user_name, "user_id": res.data.user_id });
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
                        return true;

                    });
            });
    }
    render() {
        console.log("render register page now. ")

        return (
            <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <img src={icon} alt="icon" width="40" height="40" style={{ padding: 5, marginBottom: 60 }} />

                <Button variant="contained" color="primary" onClick={this.onClickFBLogin} style={{ textTransform: "none", fontSize: 18, marginTop: 20, marginBottom: 30 }}>
                    <FacebookIcon style={{ padding: 5 }} />
                            Continue with Facebook
                </Button>

                <form onSubmit={this.handleRegister}>
                    <div style={{ margin: "10px" }}>
                        <h2>Sign up with Email</h2>
                    </div>
                    <div style={{ margin: "5px" }}>
                        <label>Email: </label>
                        <input
                            type="email"
                            name="new_email"
                            placeholder="Enter Email"
                            value={this.state.new_email}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>
                    <div style={{ margin: "5px" }}>
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
                    <div style={{ margin: "5px" }}>
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
                    <div style={{ margin: "5px" }}>
                        <label>Repeat Password: </label>
                        <input
                            type="password"
                            name="new_password_repeat"
                            placeholder="Repeat Password"
                            value={this.state.new_password_repeat}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>
                    <input type="submit" value="Register" style={{ fontSize: 15, padding: 8, paddingLeft: 20, paddingRight: 20 }} />
                </form>
                <p>Already a member?</p>
                <Link to="/admin/login" className="btn btn-primary">Log In</Link>
            </div>
        );
    }



}

export default Register;
