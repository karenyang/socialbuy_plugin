import React from 'react';
import {
    Typography,
} from '@material-ui/core';
import './Login.css';
import {
    Link
} from 'react-router-dom';
import icon from '../../assets/img/icon-34.png';



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

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <form onSubmit={this.handleSubmit}>
                    <div style={{ margin: "5px" }}>
                        <img src={icon} alt="icon" width="40" height="40" style={{ padding: 5 }} />
                        <h1>Login</h1>
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
                        <input type="submit" value="Submit" />
                    </div>
                </form>
                <Link to="/admin/register" className="btn btn-primary">Create new account</Link>
            </div>
        );
    }
}

export default Login;
