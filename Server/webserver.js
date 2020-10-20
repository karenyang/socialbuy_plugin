// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

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
  // sockPort: env.PORT,
  // port: env.PORT,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  disableHostCheck: true,
});

server.listen(env.PORT);
// // Do this as the first thing so that any code reading it knows the right env.
// process.env.BABEL_ENV = 'development';
// process.env.NODE_ENV = 'development';
//
//
// var express = require('express');
// var app = express();
//
// var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');
// var async = require('async');
// // Load the Mongoose schema for User, Product?
// // var User = require('./schema/user.js');
//
// var session = require('express-session');
// // var bodyParser = require('body-parser');
// // var fs = require("fs");
// // var multer = require('multer');
// var passwordsalt = require('./passwordsalt.js');
//
//
// const webpackDevMiddleware = require('webpack-dev-middleware');
//   webpack = require('webpack'),
//   config = require('../webpack.config'),
//   env = require('./env'),
//   path = require('path');
// var options = config.chromeExtensionBoilerplate || {};
// var excludeEntriesToHotReload = options.notHotReload || [];
//
//
// for (var entryName in config.entry) {
//   if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
//     config.entry[entryName] = [
//       'webpack-dev-server/client?http://localhost:' + env.PORT,
//       'webpack/hot/dev-server',
//     ].concat(config.entry[entryName]);
//   }
// }
//
// config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
//   config.plugins || []
// );
//
// delete config.chromeExtensionBoilerplate;
//
// var compiler = webpack(config);
//
// app.use(new webpackDevMiddleware(compiler, {
//   hot: true,
//   contentBase: path.join(__dirname, '../build'),
//   sockPort: env.PORT,
//   port: env.PORT,
//   headers: {
//     'Access-Control-Allow-Origin': '*',
//   },
//   disableHostCheck: true,
// }));
//
// // Handle Login
// app.post('/admin/login', function(request, response) {
//     console.log('Got /admin/login POST request: ', request);
//     response.status(200).send("GET res sent from webpack dev server to /admin/login POST request");
//
// 	// const login_name = request.body.login_name;
// 	// User.findOne({
// 	// 	login_name: login_name
// 	// }, function(err, user) {
// 	// 	if (err) {
// 	// 		response.status(500).send(JSON.stringify(err));
// 	// 		return;
// 	// 	}
// 	// 	if (!user) {
// 	// 		console.error('User with login_name:' + login_name + ' not found.');
// 	// 		response.status(400).send('User with login_name not registered');
// 	// 		return;
// 	// 	}
// 	// 	if (!cs142password.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
// 	// 		console.error('Wrong password');
// 	// 		response.status(400).send('Wrong password.');
// 	// 		return;
// 	// 	}
// 	// 	request.session.user_id = user._id;
// 	// 	request.session.login_name = login_name;
// 	// 	delete request.body.password;
//     //
// 	// 	let output = {
// 	// 		_id: user._id,
// 	// 		first_name: user.first_name,
// 	// 		last_name: user.last_name,
// 	// 	};
// 	// 	response.cookie('user_id', user._id)
// 	// 	response.status(200).send(JSON.stringify(output));
// 	// });
// 	// return;
// });
//
//
// // Handle register
// app.post('/user', function(request, response) {
//     console.log('Got /user POST request: ', request);
//     response.status(200),send("GET res sent from webpack dev server to /user request");
//
// 	// const login_name = request.body.login_name;
// 	// User.findOne({
// 	// 	login_name: login_name
// 	// }, function(err, user) {
// 	// 	if (err) {
// 	// 		response.status(500).send(JSON.stringify(err));
// 	// 		return;
// 	// 	}
// 	// 	if (!user) {
// 	// 		console.error('User with login_name:' + login_name + ' not found.');
// 	// 		response.status(400).send('User with login_name not registered');
// 	// 		return;
// 	// 	}
// 	// 	if (!cs142password.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
// 	// 		console.error('Wrong password');
// 	// 		response.status(400).send('Wrong password.');
// 	// 		return;
// 	// 	}
// 	// 	request.session.user_id = user._id;
// 	// 	request.session.login_name = login_name;
// 	// 	delete request.body.password;
//     //
// 	// 	let output = {
// 	// 		_id: user._id,
// 	// 		first_name: user.first_name,
// 	// 		last_name: user.last_name,
// 	// 	};
// 	// 	response.cookie('user_id', user._id)
// 	// 	response.status(200).send(JSON.stringify(output));
// 	// });
// 	// return;
// });
//
//
//
//
//
//
//
//
//
//
//
//
// app.listen(env.PORT, '127.0.0.1', () => {
//   console.log(' Starting server on http://localhost:' + env.PORT);
// });
