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
import axios from "axios";

const parseUrl = require('parseurl');


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
        // const app_secret = "eeed321129d37dc3a1c82df523f55728";
        // const redirect_uri = encodeURIComponent(chrome.identity.getRedirectURL("TasteMaker"));
        // const redirect_uri = "https://www.facebook.com/connect/login_success.html";
        const redirect_uri = "https://tastemaker.mailchimpsites.com/";
        console.log("redirect_uri is: ", redirect_uri);
        // const state_param = "state_param";
        const url = 'https://www.facebook.com/v9.0/dialog/oauth?' +
        "client_id=" + app_id +
        "&display=popup" + 
        // "&response_type=token" +
        "&access_type=online" +
        "&scope=public_profile,user_friends,email" + 
        "&redirect_uri=" + redirect_uri;

        console.log("url for FB login is: ", url);

        let access_token = null;
        chrome.identity.launchWebAuthFlow(
            {
                "url": url,
                "interactive": true,
            },
            function (redirectUri) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    return;
                }
                console.log("response: ", redirectUri);
                // Upon success the response is appended to redirectUri, e.g.
                // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
                //     &refresh_token={value}
                // or:
                // https://{app_id}.chromiumapp.org/provider_cb#code={value}
                const response = new URL(redirectUri).searchParams.toString().split("&").reduce((previous, current) => { const [key, value] = current.split("="); previous[key] = value; return previous }, {})
                console.log("response: ", response);
                if (response.hasOwnProperty('access_token')) {
                    access_token = response.access_token;
                    console.log("Got access_token: ", access_token);
                }
                else if (response.hasOwnProperty('code')) {
                    console.log("Got code: ", response.code);
                    access_token = exchangeCodeForToken(response.code);
                }

                function exchangeCodeForToken(code) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET',
                        // 'https://www.facebook.com/dialog/oauth?'+
                        'https://graph.facebook.com/v9.0/oauth/access_token?' +
                        'client_id=' + app_id +
                        '&redirect_uri=' + redirectUri +
                        '&client_secret=' + app_secret +
                        '&code=' + code);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.onload = function () {
                        if (this.status === 200) {
                            var response = JSON.parse('"' + this.responseText + '"');
                            access_token = response.substring(0, response.indexOf('&'));
                            console.log("access_token: ", access_token);
                        }
                    };
                    xhr.send();
                }
                

                // callback(null, access_token);
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
