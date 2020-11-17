// // Do this as the first thing so that any code reading it knows the right env.
// // process.env.BABEL_ENV = 'development';
// // process.env.NODE_ENV = 'development';

// *************************************************************
// Webpack dev server
// *************************************************************
var WebpackDevServer = require('webpack-dev-server'),
    webpack = require('webpack'),
    config = require('../webpack.config'),
    env = require('./env'),
    path = require('path');
const Product = require('./schema/product.js');
const { promises } = require('dns');
const dotenv = require('dotenv');
console.log(dotenv.config({ path: "./Server/.env" }));

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

