import React from 'react';
import {
	Typography,
} from '@material-ui/core';
import './Register.css';
import axios from 'axios';

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
			isRegister: true,
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

		axios.post('http://localhost:8080/admin/register', request, {
				headers: {
					'content-type': 'application/json',
				}
			})
			.then(res => {
				console.log('Register receives reply from server: ', res.data);
				// if (res.status === 200) {
				// 	alert("Registered succeeded. You can log in now.");
				// } else if (res.status === 400) {
				// 	alert(res.data + " Please try again.");
				// 	throw new Error(res.data);
				// } else {
				// 	alert(res.data + " Register failed for other reasons. Please try again.");
				// 	throw new Error(res.data);
				// }
			})
			.catch(err => {
				console.error(err)
				if (err.response.status === 400) {
					console.error("Register failed. Please try again.");
				} else {
					console.error("Register failed for other reasons. Please try again.");
				}
			})
	}


	onClickLogIn = () => {
		console.log("clicked login");
		this.setState({isRegister: false});
	}


	render() {
		return (
		<div className="container">
			{this.state.isRegister ?
				(<div className='register-form'>
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
						<input type="submit" value="Continue"/>
					</form>
					<p>Already a member?</p>
					<Link to="/admin/login" className="btn btn-primary">Log In</Link>
				</div>)
				:
				<Login/>
			}
		</div>
		);
		}



}

export default Register;
