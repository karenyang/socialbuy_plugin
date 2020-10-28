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
    console.log('server receives GET request /user/add_product');
    if (request.session.user_id) {
        let products = request.body;
        User.findOne({
            user_id: request.session.user_id,
        }, function (err, user) {
            if (!user) {
                console.error('User with username:' + request.session.user_name + ' not found .');
                response.status(400).send('User not found');
                return;
            }

            // fetch comments for each photo
            async.each(products, function (product, callback) {
                let newProduct = new Product();
                Object.assign(newProduct, product);
                // add product if it is not product list, add user to products' buyer list if it is already there
                Product.findOne({
                    'product_link': newProduct.product_link
                }, function (err, product) {
                    if (err) {
                        // Query returned an error.  We pass it back to the browser with an Internal Service
                        // Error (500) error code.
                        console.error('Server error in /user/add_products', err);
                        response.status(500).send(JSON.stringify(err));
                        return;
                    }
                    if (product) {
                        response.status(400).send('product_link already exists: ' + product.product_link);
                        let new_buyer_list = product.buyer_list;
                        new_buyer_list.push(request.session.user_id);
                        Object.assign(product, { "buyer_list": new_buyer_list }); //add current user to buyer list
                        product.save();
                    } else {
                        let new_buyer_list = [];
                        new_buyer_list.push(request.session.user_id);
                        Object.assign(newProduct, { "buyer_list": new_buyer_list }); //add current user to buyer list
                        Product.create(newProduct,
                            function (err, productObj) {
                                if (err) {
                                    response.status(500).send(JSON.stringify(err));
                                }
                                console.log("new productObj created: ", productObj)
                                productObj.save()
                            })
                    }
                })

            },
                function (err) { //callback
                    if (err) {
                        console.error(err);
                        response.status(500).send(JSON.stringify(err));
                    }
                    else{
                        response.status(200).send("Processed all products from user " + request.session.user_name);
                    }
                });
        });

        // for (let i = 0; i < products.length; i++) {
        //     let newProduct = new Product();
        //     Object.assign(newProduct, products[i]);
        //     // add product if it is not product list, add user to products' buyer list if it is already there

        //     Product.findOne({
        //         'product_link': newProduct.product_link
        //     }, function (err, product) {
        //         if (err) {
        //             // Query returned an error.  We pass it back to the browser with an Internal Service
        //             // Error (500) error code.
        //             console.error('Server error in /user/add_products', err);
        //             response.status(500).send(JSON.stringify(err));
        //             return;
        //         }
        //         if (product) {
        //             response.status(400).send('product_link already exists: ' + product.product_link);
        //             let new_buyer_list = product.buyer_list;
        //             new_buyer_list.push(request.session.user_id);
        //             Object.assign(product, { "buyer_list": new_buyer_list }); //add current user to buyer list
        //             product.save();
        //             response.status(200).send('Product existed. Add user to buyer list');
        //         } else {
        //             let new_buyer_list = [];
        //             new_buyer_list.push(request.session.user_id);
        //             Object.assign(newProduct, { "buyer_list": new_buyer_list }); //add current user to buyer list
        //             Product.create(newProduct,
        //                 function (err, productObj) {
        //                     if (err) {
        //                         response.status(500).send(JSON.stringify(err));
        //                     }
        //                     console.log("new productObj created: ", productObj)
        //                     productObj.save()
        //                     response.status(200).send('New product added');
        //                 })
        //         }
        //     })
        // }

        let output = {
            user_id: request.session.user_id,
        };

        response.status(200).send(JSON.stringify(output));
    } else {
        response.status(400).send('Not logged in yet.');
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
        function (err, user) {
            if (user) {
                response.status(400).send('user_name already exists: ' + user_name);
                return;
            } else {
                User.create(newUser,
                    function (err, userObj) {
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
