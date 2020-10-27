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
import axios from 'axios';

import './Popup.css';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_name: "",
      user_id: "",
    };
  }


  onLoggedIn = (data) => {
    this.setState({
      user_name: data.user_name,
      user_id: data.user_id,
    });
    
  }

  isLoggedIn = () => {
    console.log("Inside isLonggedIn, ", this.state.user_id);
    if (this.state.user_id && this.state.user_id != "") {
      console.log("Inside isLonggedIn, should render greetings for ", this.state.user_name);
      return true;
    }
    return false;
    
  }

  onLogOut = () => {
    console.log("about to log out");
    axios.post('http://localhost:8080/admin/logout')
      .then(res => {
        if (res.status === 200) {
          this.setState({
            user_id: "",
            username: "",
          });
        }
        else {
          alert(res.data);
          throw (new Error(res.data));
        }
      })
      .catch(err => {
        console.error(err)
      })
  }


  render() {
    return (
      <HashRouter>
        <div className="App">
          <Switch>
            <Route path="/admin/register"
              render={(props) => <Register {...props} onLoggedIn={this.onLoggedIn} />}
            />
            <Route path="/admin/login"
              render={(props) => <Login {...props} onLoggedIn={this.onLoggedIn} />}
            />
            <Route path="/greetings"
              render={(props) => <Greetings {...props} user_name={this.state.user_name} user_id={this.state.user_id} onLogOut={this.onLogOut} />}
            />
            {this.isLoggedIn() ?
              <Redirect to= "/greetings"/>
              :
              <Redirect to="/admin/register" />
            }
          </Switch>
        </div>

      </HashRouter>
    );
  }
};

export default Popup;
