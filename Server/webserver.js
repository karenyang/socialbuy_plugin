// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';


// *************************************************************
// Server Side API
// *************************************************************
const express = require('express');
const app = express();
var session = require('express-session');

var bodyParser = require('body-parser');
var passwordsalt = require('./passwordsalt.js');
var User = require('./schema/user.js');



var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/socialbuy_plugin', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});


app.use(express.static(__dirname));
app.use(session({
	secret: 'secretKey',
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.json());


app.post('/admin/login', function(request, response) {
    console.log('server receives POST request /admin/login : ', request.body);
	const user_name = request.body.user_name;
    User.findOne({
		user_name: user_name
	}, function(err, user) {
		if (err) {
			response.status(500).send(JSON.stringify(err));
			return;
		}
		if (!user) {
			console.error('User with user_name:' + user_name + ' not found.');
			response.status(400).send('User of this user_name not registered: ' + user_name);
			return;
		}
		if (!passwordsalt.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
			console.error('Wrong password');
			response.status(400).send('Wrong password.');
			return;
		}
		request.session.user_id = user._id;
		request.session.user_name = user_name;
		delete request.body.password; //make it safe

		let output = {
			_id: user._id,
			user_name: user_name,
		};
		response.status(200).send(JSON.stringify(output));
	});
	return;

});

app.post('/admin/register', function(request, response) {
    const newUser = request.body;
	// console.log('receive request for new user', newUser)
	if (!newUser) {
		response.status(400).send("New User cannot be empty.");
		return;
	}
	if (!newUser.user_name) {
		response.status(400).send("user_name cannot be empty string.");
		return;
	}
	if (!newUser.password) {
		response.status(400).send("Password cannot be empty string.");
		return;
	}

	let passwordEntry = passwordsalt.makePasswordEntry(newUser.password); // add salt and make hash
	Object.assign(newUser, {
		salt: passwordEntry.salt,
		password_digest: passwordEntry.hash
	});
	delete newUser.password; //delete the password

	User.findOne({
			'user_name': newUser.user_name
		},
		function(err, user) {
			if (user) {
				response.status(400).send('user_name already exists: ' + user_name);
				return;
			} else {
				User.create(newUser,
					function(err, userObj) {
						if (err) {
							response.status(500).send(JSON.stringify(err));
						}
						// console.log("new userObj created, ", userObj)
						userObj.save()
						response.status(200).send('New user registered');
						return;
					})
			}
		})

});


app.listen(8080, function() {
    console.log('App started on Port: 8080 ');
});





// *************************************************************
// Webpack dev server
// *************************************************************

var WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('./env'),
  path = require('path');

var options = config.chromeExtensionBoilerplate || {};
var excludeEntriesToHotReload = options.notHotReload || [];

for (var entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack-dev-server/client?http://localhost:' + env.PORT,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
);

delete config.chromeExtensionBoilerplate;

var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(__dirname, '../build'),
  sockPort: env.PORT,
  port: env.PORT,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  disableHostCheck: true,
});

server.listen(env.PORT);
