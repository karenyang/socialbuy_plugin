import React from 'react';
import logo from '../../assets/img/logo.svg';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
// import {
//   Grid, Paper
// } from '@material-ui/core';

import Greetings from '../../containers/greetings/Greetings';
import Register from '../../containers/register/Register';
import Login from '../../containers/login/Login';

import './Popup.css';

class Popup extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			user_name: "testuser",
			user_id: "",
		};
	}

  onLoggedIn = (data) => {
    this.setState({
        user_name: data.username,
        user_id: data._id,
    });
  }

  isLoggedIn = () => {
    if (this.state.user_id != "") {
      return true;
    }
    return false;
  }

  render() {
    return (
      <HashRouter>
        <div className="App">
            <Switch>
              <Route path="/admin/register"
                      render={(props) => <Register {...props} />}
                   />
              <Route path="/admin/login"
                     render={(props) => <Login {...props} onLoggedIn={this.onLoggedIn}/>}
                  />
            {this.isLoggedIn()?
              <Greetings user_name={this.state.user_name}/>
              :
              <Redirect to="/admin/register"/>}
            </Switch>
        </div>

      </HashRouter>
    );
  }
};

export default Popup;
