import React from 'react';

import './Login.css';
import {
    Link
} from 'react-router-dom';
import {
    Typography,
    Card,
} from '@material-ui/core';
import icon from '../../assets/img/icon-34.png';
import FacebookLogin from 'react-facebook-login';
import FacebookLoginWithButton from 'react-facebook-login';

const parseUrl = require('parseurl')


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
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
            email: this.state.email,
            password: this.state.password,
        };

        this.setState({
            email: "",
            password: "",
        });

        let history = this.props.history;
        let onLoggedIn = this.props.onLoggedIn;
        chrome.runtime.sendMessage({ type: "onLogin", data: request },
            function (res) {
                console.log('Login receives reply from backgroumd: ', res.data);
                if (res.status === 200) {
                    console.log("Login succeeded. Proceed.");
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
            });
    }

    // responseFacebook = (response) => {
    //     console.log(response);
    // }
    // facebookButtonClicked = () => {
    //     console.log("clicked");
    // }

    onClickFBLogin = () => {
        // redirect to https://www.facebook.com/v9.0/dialog/oauth?
        // client_id={app-id}
        // &redirect_uri={redirect-uri}
        // &state={state-param}
        const app_id = "189391966126165";
        // const redirect_uri = encodeURIComponent(chrome.identity.getRedirectURL("TasteMaker"));
        const redirect_uri = "https://www.facebook.com/connect/login_success.html";
        console.log("redirect_uri is: ", redirect_uri);
        const redirectRe = new RegExp(redirect_uri + '[#\?](.*)');
        const state_param = "state_param";
        const url = `https://www.facebook.com/v9.0/dialog/oauth?client_id=${app_id}&redirect_uri=${redirect_uri}&state=${state_param}`;
        console.log("url for FB login is: ", url);
       


        chrome.identity.launchWebAuthFlow(
            {
                "url": url,
                "interactive": true,
            },
            function (redirectUri) {
                if (chrome.runtime.lastError) {
                    callback(new Error(chrome.runtime.lastError));
                    return;
                }
                const response = parseUrl(redirectUri);
                console.log("redirectUri: ", redirectUri);
                access_token = response[`#access_token`];
                callback(null, access_token);
            });



    }
    render() {
        return (
            <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                <form onSubmit={this.handleSubmit}>
                    <div style={{ margin: "5px" }}>
                        <img src={icon} alt="icon" width="40" height="40" style={{ padding: 5 }} />
                        <h1>Login</h1>
                    </div>

                    <button onClick={this.onClickFBLogin}>
                        FB Login
                    </button>
                    {/* <FacebookLoginWithButton
                        appId="189391966126165"
                        autoLoad={true}
                        fields="name,email,picture"
                        scope="public_profile,user_friends"
                        callback={this.responseFacebook}
                        onClick={this.facebookButtonClicked}
                        icon="fa-facebook" /> */}


                    <div style={{ margin: "5px" }}>
                        <label>Email: </label>
                        <input
                            type="text"
                            name="email"
                            placeholder="Enter Email"
                            value={this.state.email}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>
                    <div style={{ margin: "5px" }}>
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
                <Link to="/admin/register" className="btn btn-primary">Create new account</Link>
            </div>
        );
    }
}

export default Login;
