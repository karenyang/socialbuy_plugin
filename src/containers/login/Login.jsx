import React from 'react';

import './Login.css';
import {
    Link
} from 'react-router-dom';
import {
    Button,
} from '@material-ui/core';
import icon from '../../assets/img/icon-34.png';
import FacebookIcon from '@material-ui/icons/Facebook';



class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            user_id: "",
        };
    }

    componentDidMount = () => {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-184044017-1', 'auto');
        ga('set', 'checkProtocolTask', null);
        ga('send', 'pageview', "login");
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

    onClickFBLogin = () => {
        const app_id = "189391966126165";
        // const redirect_uri = encodeURIComponent(chrome.identity.getRedirectURL("TasteMaker") + "/greetings");
        const redirect_uri = encodeURIComponent("https://www.facebook.com/connect/login_success.html");

        console.log("redirect_uri is: ", redirect_uri);
        const url = 'https://www.facebook.com/v9.0/dialog/oauth?' +
            'client_id=' + app_id +
            '&redirect_uri=' + redirect_uri +
            '&scope=email' +
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
        return (
            <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <img src={icon} alt="icon" width="40" height="40" style={{ padding: 5, marginBottom: 60 }} />

                {/* <Button variant="contained" color="primary" onClick={this.onClickFBLogin} style={{ textTransform: "none", fontSize: 18, marginTop: 20, marginBottom: 30}}>
                    <FacebookIcon style={{ padding: 5 }} />
                        Log in with Facebook
                </Button> */}


                <form onSubmit={this.handleSubmit}>

                    <div style={{ margin: "10px" }}>
                        <h2>Log in with Email</h2>
                    </div>

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
                        <input type="submit" value="Log in" style={{fontSize: 15, padding: 8, paddingLeft: 20, paddingRight:20}}/>
                    </div>
                </form>
                <Link to="/admin/register" className="btn btn-primary">Create new account</Link>
            </div>
        );
    }
}

export default Login;
