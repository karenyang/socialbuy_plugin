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


		axios.post('/admin/login', request, {
				headers: {
					'content-type': 'application/json',
				}
			})
			.then(res => {
				if (res.status === 200) {
					this.setState({
						user_id: res.data._id
					});
					let redirect_path = "/users/" + res.data._id.toString();
					this.props.onLoggedIn({
						_id: res.data._id,
						user_name: this.state.user_name,
						first_name: res.data.first_name,
						last_name: res.data.last_name,
					})
					this.props.history.push(redirect_path);
				}
				else{
					throw(new Error(res.data));
				}
			})
			.catch(err => {
					console.error(err);
					alert(err.response.data);
				}
			)
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
							placeholder="Enter Username"
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
						<input type="submit" value="Submit"/>
					</div>
				</form>
			</div>
			<p>Create new account?</p>

			<Link to="/admin/register" className="btn btn-primary">Sign Up</Link>
		</div>
		);
		}
}

export default Login;
