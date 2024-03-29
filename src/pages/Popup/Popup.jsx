import React from 'react';
import logo from '../../assets/img/logo.svg';
import {
    HashRouter, Route, Switch, Redirect, withRouter,
} from 'react-router-dom';

import Greetings from '../../containers/greetings/Greetings';
import Register from '../../containers/register/Register';
import Login from '../../containers/login/Login';
import FriendInfoPage from '../../containers/friendinfo_page/friendinfo_page';
import './Popup.css';



class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: "",
            user_id: "",
            done_fetch: false,
            current_tab: 0,
        };
    }

    componentDidMount = () => {
        console.log("[Popup] sending /user/info request to background");
        let onLoggedIn = this.onLoggedIn;
        chrome.runtime.sendMessage({ type: "onPopupInit" },
            function (response) {
                console.log('this is the response from the background page for onPopupInit message', response);
                if (response === undefined || response === null) {
                    console.log("Not logged in before. Need login or register");
                    onLoggedIn({
                        user_id: "",
                        user_name: "",
                    });
                }
                else if (response.user_id) {
                    console.log("Already logged in before");
                    onLoggedIn({
                        user_id: response.user_id,
                        user_name: response.user_name,
                    });
                }
            });
    }

    onLoggedIn = (data) => {
        this.setState({
            email: data.email,
            user_name: data.user_name,
            user_id: data.user_id,
            done_fetch: true,
        });
        console.log("State set to, ", this.state);
    }

    reset_state = () => {
        this.setState({
            email: "",
            user_name: "",
            user_id: "",
            done_fetch: true,
        });
        console.log("State reset to, ", this.state);
    }
 
    render() {
        console.log("done fetch? ", this.state.done_fetch);
        return (
            this.state.done_fetch === true ?
                (<HashRouter>
                    <div className="App">                        
                        <Switch>
                            <Route path="/greetings/:tab_id/"
                                render={(props) => <Greetings {...props} email={this.state.email} user_name={this.state.user_name} user_id={this.state.user_id} />}
                            />
                            <Route path="/admin/register"
                                render={(props) => <Register {...props} onLoggedIn={this.onLoggedIn}/>}
                            />
                            <Route path="/admin/login"
                                render={(props) => <Login {...props} onLoggedIn={this.onLoggedIn} />}
                            />
                            <Route path="/users/:user_id/"
                                render={(props) => <FriendInfoPage {...props}/>}
                            />
                            {this.state.user_id ?
                                <Redirect to={"/greetings/" + this.state.current_tab} />
                                :
                                <Redirect to="/admin/register" />
                            }
                        </Switch>
                    </div>
                </HashRouter>)
                :
                (null)
        );
    }
};

export default Popup;
