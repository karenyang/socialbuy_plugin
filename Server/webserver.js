// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// *************************************************************
// Configure
// *************************************************************
const express = require('express');
const app = express();
var session = require('express-session');

var bodyParser = require('body-parser');
var passwordsalt = require('./utils/passwordsalt.js');
var async = require('async');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: 'user_id',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// *************************************************************
// Server API
// *************************************************************

app.post('/user/add_products', function (request, response) {
    console.log('server receives GET request /user/add_product ');
    if (request.session.user_id) {
        console.log('request.session.user_id: ', request.session.user_id);

        let products = request.body.data;

        User.findOne({
            _id: request.session.user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
            }
            if (user === null) {
                console.error('User with username:' + request.session.user_name + ' not found.');
                response.status(401).send('User not found.');
                return;
            }
            // fetch comments for each photo
            console.log("products: ", products);

            for (let i = 0; i < products.length; i++) {
                let item = products[i];
                user.product_list.push(item.product_link);
                user.save();
                // add product if it is not product list, add user to products' buyer list if it is already there
                // Object.assign(item, {"buyer_list": [request.session.user_id]});
                // console.log("item's buyer_list:", item.buyer_list );
                Product.findOne({
                    'product_link': item.product_link
                }, function (err, product) {
                    if (err) {
                        console.error(err);
                    }
                    if (product) {
                        console.log("product existed: ", product);
                        if (!product.buyer_list.includes(user._id)){
                            product.buyer_list.push(user._id);
                            product.save();
                        }
                        if (!user.product_list.includes(product.product_link)) {
                            user.product_list.push(product.product_link);
                        }
                        console.log("Add buyer to an existing product, " + product.product_title);
                    }
                    else {
                        Object.assign(item, { "buyer_list": [request.session.user_id] });
                        Product.create(item,
                            function (err, newProduct) {
                                if (err) {
                                    console.error(err);
                                }
                                console.log("new newProduct created, ", newProduct);
                            })
                    }
                })
            }
            response.status(200).send("Success in adding products");
            return;
        })
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }
});



app.get('/user/info', function (request, response) {
    console.log('server receives GET request /user/info');
    if (request.session.user_id) {
        let output = {
            user_id: request.session.user_id,
            user_name: request.session.user_name,
        };
        console.log('Session already active, bypass Login.');
        response.status(200).send(JSON.stringify(output));

    } else {
        response.status(201).send("No user in session cookie.");
    }
});


app.post('/admin/login', function (request, response) {
    console.log('server receives POST request /admin/login : ', request.body);
    const user_name = request.body.user_name;
    User.findOne({
        user_name: user_name
    }, function (err, user) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            console.error('User with user_name:' + user_name + ' not found');
            response.status(250).send('User of this user_name not registered: ' + user_name);
            return;
        }
        if (!passwordsalt.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
            console.error('Wrong password');
            response.status(250).send('Wrong password');
            return;
        }
        request.session.user_id = user._id;
        request.session.user_name = user_name;
        delete request.body.password; //make it safe

        let output = {
            user_id: user._id,
            user_name: user_name,
        };

        response.status(200).send(JSON.stringify(output));
    });
    return;

});


// logout
app.post('/admin/logout', function (request, response) {
    if (request.session) {
        console.log('Destroying session');
        request.session.destroy(
            function (err) {
                console.error(err);
            });
        response.clearCookie("user_id");
        response.clearCookie("user_name");
        response.status(200).send("Logged out.");
    } else {
        console.error("Not user is logged in.");
        response.status(400).send("Not user is logged in.");
    }
    return;
});


app.post('/admin/register', function (request, response) {
    const newUser = request.body;
    console.log('receive request for new user', newUser)
    if (!newUser) {
        response.status(250).send("New User cannot be empty.");
        return;
    }
    if (!newUser.user_name) {
        response.status(250).send("user_name cannot be empty string.");
        return;
    }
    if (!newUser.password) {
        response.status(250).send("Password cannot be empty string.");
        return;
    }
    let passwordEntry = passwordsalt.makePasswordEntry(newUser.password); // add salt and make hash
    Object.assign(newUser, {
        salt: passwordEntry.salt,
        password_digest: passwordEntry.hash,
    });
    delete newUser.password; //delete the password

    User.findOne({
        'user_name': newUser.user_name
    },
        function (err, user) {
            if (user !== null) {
                console.log("User already existed before register");
                response.status(250).send('user_name already exists');
            } else {
                User.create(newUser,
                    function (err, userObj) {
                        if (err) {
                            response.status(500).send(JSON.stringify(err));
                        }
                        console.log("new userObj created, ", userObj);
                        userObj.save();
                        response.status(200).send('New user registered');
                    })
            }
        })

});


app.listen(8080, function () {
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
const Product = require('./schema/product.js');

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
