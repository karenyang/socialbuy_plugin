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

app.get('/user_productlist/:user_id', function (request, response) {
    console.log('server receives Get request /user_productlist/ ');

    let user_id = request.params.user_id;
    if (user_id) {
        console.log('request.session.user_id: ', user_id);
        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(401).send('User not found.');
                return;
            }
            let product_list = [];
            const product_links = user.product_list;
            console.log("Number of  products links: ", product_links.length, product_links);
            async.each(product_links, function(link, callback) {
                Product.findOne({
                    product_link: link,
                }, function (err, product) {
                    if (err) {
                        callback(err);
                    }
                    if (product === null) {
                        callback('product with product_link:' + link + ' not found.');
                    }
                    else {
                        product_list.push(product);
                        callback(null);
                    }
                });
            }, function (err) {
                if (err) {
                    console.error("Failed to fetch user's product list");
                    response.status(400).send("Failed to fetch user's product list ");
                } else {
                    console.log("Done fetching all product lists.");
                    let output = {
                        "user_name": user.user_name,
                        "product_list": product_list,
                    }
                    response.status(200).send(JSON.stringify(output));
                }
            });
            // for (let i = 0; i < product_links.length; i++){
            //     console.log("Finding prouct with link: ", product_links[i]);
            //     Product.findOne({
            //         product_link: product_links[i],
            //     }, function (err, product){
            //         if (err) {
            //             console.error(err);
            //         }
            //         if (product === null) {
            //             console.error('product with product_link:' + product_links[i] + ' not found.');
            //         }
            //         else{
            //             console.log("Found product: ", product);
            //             product_list.push(product);
            //         }
            //     });
            // }
            // let output = {
            //     "user_name": user.user_name,
            //     "product_list": product_list,
            // }

            // response.status(200).send(JSON.stringify(output));
            // return;

        });
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }

});

app.post('/add_products/:user_id', function (request, response) {
    console.log('server receives POST request /add_product ');
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
        let products = request.body;
        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(401).send('User not found.');
                return;
            }
            // fetch comments for each photo
            console.log("products: ", products);

            async.each(products, function (item ,callback) {
                user.product_list.push(item.product_link);
                user.save();
                Product.findOne({
                    'product_link': item.product_link
                }, function (err, product) {
                    if (err) {
                        callback(err);
                    }
                    if (product !== null) {
                        console.log("product existed: ", product.product_title);
                        if (!product.buyer_list.includes(user_id)) {
                            product.buyer_list.push(user_id);
                            product.save();
                            console.log("Add buyer to an existing product,  user:", user.user_name, " product: ", product.product_title);

                        }
                        if (!user.product_list.includes(product.product_link)) {
                            user.product_list.push(product.product_link);
                            console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", product.product_title);
                        }
                    }
                    else {
                        Object.assign(item, { "buyer_list": [user_id] });
                        Product.create(item,
                            function (err, newProduct) {
                                if (err) {
                                    callback(err);
                                }
                                console.log("new newProduct created, ", newProduct.product_title);
                            })
                    }
                    callback(null);
                })
            }, function (err){
                if (err) {
                    console.error(err);
                    response.status(400).send(err);
                } else {
                    console.log("Done adding all products from page");
                    response.status(200).send("Success in adding products");
                }
            });

            // for (let i = 0; i < products.length; i++) {
            //     let item = products[i];
            //     user.product_list.push(item.product_link);
            //     user.save();
            //     // add product if it is not product list, add user to products' buyer list if it is already there
            //     Product.findOne({
            //         'product_link': item.product_link
            //     }, function (err, product) {
            //         if (err) {
            //             console.error(err);
            //         }
            //         if (product !== null) {
            //             console.log("product existed: ", product);
            //             if (!product.buyer_list.includes(user._id)) {
            //                 product.buyer_list.push(user._id);
            //                 product.save();
            //                 console.log("Add buyer to an existing product,  user:", user.user_name, " product: ", product.product_title);

            //             }
            //             if (!user.product_list.includes(product.product_link)) {
            //                 user.product_list.push(product.product_link);
            //                 console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", product.product_title);
            //             }
            //         }
            //         else {
            //             Object.assign(item, { "buyer_list": [user_id] });
            //             Product.create(item,
            //                 function (err, newProduct) {
            //                     if (err) {
            //                         console.error(err);
            //                     }
            //                     console.log("new newProduct created, ", newProduct);
            //                 })
            //         }
            //     })
            // }
            // response.status(200).send("Success in adding products");
            // return;
        })
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
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
