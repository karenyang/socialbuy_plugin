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
var ObjectID = mongoose.Types.ObjectId;

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


app.get('/friends_productlist/:user_id', function (request, response) {
    console.log('server receives Get request /friends_productlist/ ');
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
                response.status(421).send('User not found.');
                return;
            }
            let products = [];
            let product_links = [];

            async.each(user.friends_list, function (friend_id, callback) {
                User.findOne({
                    _id: friend_id,
                }, async function (err, friend) {
                    if (err) {
                        callback(err);
                    }
                    if (friend === null) {
                        callback('friend with id:' + friend_id + ' not found.');
                    }
                    else {
                        for (let i = 0; i < friend.bought_product_list.length; i++) {
                            if (friend.bought_product_list[i] in product_links) {
                                products[product_links.indexOf(friend.bought_product_list[i])].bought.push(friend.user_name);
                                // products[product_links.indexOf(friend.bought_product_list[i])].liked.push(friend.user_name);
                            }
                            else {
                                product_links.push(friend.bought_product_list[i]);
                                await Product.findOne({
                                    product_link: friend.bought_product_list[i]
                                }, function (err, product) {
                                    if (err) {
                                        callback(err);
                                    }
                                    products.push({
                                        product: product,
                                        bought: [friend.user_name],
                                        liked: [],
                                    });

                                });
                                // console.log("added a product link to product lists: ", products.length)
                            }
                        }
                        for (let i = 0; i < friend.liked_product_list.length; i++) {
                            if (friend.liked_product_list[i] in product_links) {
                                products[product_links.indexOf(friend.liked_product_list[i])].liked.push(friend.user_name);
                                // products[product_links.indexOf(friend.bought_product_list[i])].liked.push(friend.user_name);
                            }
                            else {
                                product_links.push(friend.liked_product_list[i]);
                                await Product.findOne({
                                    product_link: friend.liked_product_list[i]
                                }, function (err, product) {
                                    if (err) {
                                        callback(err);
                                    }
                                    products.push({
                                        product: product,
                                        bought: [],
                                        liked: [friend.user_name]
                                    });

                                });
                                // console.log("added a product link to product lists: ", products.length)
                            }
                        }
                        callback(null);
                    }
                });
            }, function (err) {
                if (err) {
                    console.error("Failed to fetch user's products list");
                    response.status(400).send("Failed to fetch user's products list ");
                } else {
                    products.sort((a, b) => b.liked.length + 2 * b.bought.length > a.liked.length + 2 * a.bought.length ? 1 : -1);
                    console.log("Done fetching product lists: length=", products.length);
                    let output = {
                        "user_name": user.user_name,
                        "friends_productlist": products,
                    }
                    response.status(200).send(JSON.stringify(output));
                }
            });
        });
    }
});

app.get('/friendslist/:user_id', function (request, response) {
    console.log('server receives Get request /friendslist ');
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
                response.status(421).send('User not found.');
                return;
            }
            User.aggregate([
                {
                    $match: {
                        "_id": { "$in": user.friends_list },
                    }
                },
                {
                    $project: {
                        _id: 1, user_name: 1, profile_img: 1,
                        mutual_friends: { $setIntersection: ["$friends_list", user.friends_list] },
                    }
                }
            ]).exec(function (err, friends_list) {
                if (err) {
                    console.log("Error Finding Friends " + err)
                };
                let output = {
                    user_name: user.user_name,
                    friends_list: friends_list,
                }
                console.log("found friends: ", friends_list);
                response.status(200).send(JSON.stringify(output));
            });
        });
    }
});

app.get('/receivedfriendrequests/:user_id', function (request, response) {
    console.log('server receives Get request /receivedfriendrequests ');
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
                response.status(421).send('User not found.');
                return;
            }
            User.aggregate([
                {
                    $match: {
                        friend_requests_list: ObjectID(user_id), // my id is in their friends request list
                    }
                },
                {
                    $project: {
                        _id: 1, user_name: 1, profile_img: 1,
                        mutual_friends: { $setIntersection: ["$friends_list", user.friends_list] },
                    }
                }
            ]).exec(function (err, received_friend_requests) {
                if (err) {
                    console.log("Error Finding Friends " + err)
                };
                let output = {
                    user_name: user.user_name,
                    received_friend_requests: received_friend_requests,
                }
                console.log("found friend requests: ", received_friend_requests);
                response.status(200).send(JSON.stringify(output));
            });
        });
    }
});


app.post('/deletefriend/:user_id', function (request, response) {
    console.log('server receives POST request /deletefriend ',request.body, request.params);
    const friend_id = request.body.friend_id;
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
                console.log("could not find user", user_id)
                response.status(421).send('User with id:' + user_id + ' not found.');
                return;
            }
            User.findOne({
                _id: friend_id,
            }, function (err, friend) {
                if (friend === null) {
                    console.log("could not find friend_id", friend_id)

                    response.status(421).send('Friend with id:' + friend_id + ' not found.');
                    return;
                }
                else {                    
                    const idx1 = friend.friends_list.indexOf(ObjectID(user._id));
                    if (idx1=== -1) {
                        console.error('user with id:' + user._id + " not found in the tobe deletetd friends's friend list");
                        response.status(421).send('User not found.');
                        return;
                    }
                    else {
                        friend.friends_list.splice(idx1, 1);
                        friend.save();
                    }

                    const idx2 = user.friends_list.indexOf(ObjectID(friend_id));
                    if (idx2 === -1) {
                        console.error('friend with id:' + friend_id + " not found in the user's friend list");
                        response.status(421).send('User not found.');
                        return;
                    }
                    else {
                        user.friends_list.splice(idx2, 1);
                        user.save();
                    }


                    console.log("Delete friendship reqeust between ", user.user_name, " and ", friend.user_name);
                    response.status(200).send("success");
                    return;
                }

            });

        });
    }
});


app.post('/respondfriendrequest/:user_id', function (request, response) {
    console.log('server receives Get request /respondfriendrequest ');
    const friend_username = request.body.friend_username;
    const is_accept_friend = request.body.is_accept_friend; //boolean

    console.log('friend_username: ', friend_username);
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
                response.status(421).send('User not found.');
                return;
            }
            User.findOne({
                user_name: friend_username,
            }, function (err, friend) {
                if (user === null) {
                    response.status(201).send('User not found.');
                    return;
                }
                else {
                    console.log("Will respondfriendrequest a friend: ", friend_username, is_accept_friend);
                    if (is_accept_friend) { //both add
                        user.friends_list.push(ObjectID(friend._id));
                        friend.friends_list.push(ObjectID(user._id));
                    }
                    // remove from friend's friend_requests_list no matter whether accepts or not 
                    const idx = friend.friend_requests_list.indexOf(user._id);
                    if (idx === -1) {
                        console.error('user with id:' + user._id + "not found in the sender's friend request list");
                        response.status(421).send('User not found.');
                        return;
                    }
                    else {
                        friend.friend_requests_list.splice(idx, 1);
                    }
                    friend.save();
                    user.save();
                    console.log("responded a friend reqeust between ", user._id, " and ", friend._id);
                    console.log("their current friendlist should have each other: ", user.friends_list, " and ", friend.friends_list);
                    console.log("their current friend request list should not have each other: ", user.friend_requests_list, " and ", friend.friend_requests_list);
                    response.status(200).send(user.friends_list);
                    return;
                }

            });

        });
    }
});

app.post('/requestfriend/:user_id', function (request, response) {
    console.log('server receives Get request /requestfriend ');
    const friend_username = request.body.friend_username;
    console.log('friend_username: ', friend_username);
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
                response.status(421).send('User not found.');
                return;
            }
            User.findOne({
                user_name: friend_username,
            }, function (err, friend) {
                if (user === null) {
                    response.status(201).send('User not found.');
                    return;
                }
                else {
                    console.log("Will send a request for friend: ", friend_username);
                    // user.friends_list.push(ObjectID(friend._id));
                    user.friend_requests_list.push(ObjectID(friend._id));
                    user.save();
                    console.log("requested a friend: ", user.friends_list);
                    response.status(200).send(user.friends_list);
                    return;
                }

            });

        });
    }
});

app.post('/search/:user_id', function (request, response) {
    console.log('server receives Get request /search ');
    const search_category = request.body.search_category;
    const search_key = request.body.search_key;
    console.log('search_category: ', search_category, "search_key: ", search_key);
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
                response.status(421).send('User not found.');
                return;
            }
            if (search_category === 'friends') {
                User.findOne({
                    user_name: search_key,
                }, function (err, friend) {
                    if (friend === null) {
                        response.status(201).send('friend not found.');
                        return;
                    }
                    else {
                        let result = {};
                        result["user_name"] = friend.user_name;
                        result["is_friend"] = user.friends_list.includes(friend._id); //whether is already friend or is users themselves;
                        result["is_self"] = user.user_name === friend.user_name; //whether is already friend or is users themselves;
                        result["is_sent_friend_reqeust"] = user.friend_requests_list.includes(friend._id); //whether i have sent friend request to others
                        result["is_received_friend_reqeust"] = friend.friend_requests_list.includes(user._id); //whether others have sent friend request to me
                        let output = {
                            user_name: user.user_name,
                            results: [result]
                        }

                        console.log("Found a friend: ", result);
                        response.status(200).send(JSON.stringify(output));
                        return;
                    }

                });
            }
            else {
                let search_string = search_key;
                if (search_category !== null) {
                    search_string = search_key.concat(" " + search_category);
                }
                console.log("search string is: ", search_string);
                Product.aggregate([
                    {
                        $match: {
                            $text: { $search: search_string },  //match with string query.
                            $expr: {
                                $gt: [
                                    {
                                        $sum: [
                                            { $size: { $setIntersection: ['$liker_list', user.friends_list] } }, //liker or buyer has my friends in it
                                            { $size: { $setIntersection: ['$buyer_list', user.friends_list] } }
                                        ]
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1, product_title: 1, product_cost: 1, product_link: 1, product_imgurl: 1,
                            score: { $meta: "textScore" },
                        }
                    },
                    {
                        $match: { score: { $gt: 6.0 } }
                    }
                ]).exec(function (err, items) {
                    if (err) {
                        console.log("Error Finding Query " + err)
                    };

                    let output = {
                        user_name: user.user_name,
                        results: items,
                    }
                    console.log("search results are: ", items);
                    response.status(200).send(JSON.stringify(output));
                });
            }
        });
    }
});


app.get('/user_liked_product_list/:user_id', function (request, response) {
    console.log('server receives Get request /user_liked_product_list/ ');

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
                response.status(421).send('User not found.');
                return;
            }

            Product.aggregate([
                {
                    $match: {
                        "product_link": { "$in": user.liked_product_list },
                    }
                },
                {
                    $project: {
                        _id: 1, product_title: 1, product_link: 1, product_cost: 1, product_imgurl: 1,
                    }
                },
                { $sort: { createdAt: 1 } },
            ])
                .exec(function (err, liked_product_list) {
                    if (err) {
                        console.error("Failed to fetch user's product list");
                        response.status(400).send("Failed to fetch user's product list ");
                    } else {
                        console.log("Done fetching all product lists.");
                        let output = {
                            "user_name": user.user_name,
                            "liked_product_list": liked_product_list,
                        }
                        response.status(200).send(JSON.stringify(output));
                    }
                });
        });
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }

});

app.get('/user_bought_product_list/:user_id', function (request, response) {
    console.log('server receives Get request /user_bought_product_list/ ');

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
                response.status(421).send('User not found.');
                return;
            }
            Product.aggregate([
                {
                    $match: {
                        "product_link": { "$in": user.bought_product_list },
                    }
                },
                {
                    $project: {
                        _id: 1, product_title: 1, product_link: 1, product_cost: 1, product_imgurl: 1,
                    }
                },
                { $sort: { createdAt: 1 } },
            ])
                .exec(function (err, bought_product_list) {
                    if (err) {
                        console.error("Failed to fetch user's product list");
                        response.status(400).send("Failed to fetch user's product list ");
                    } else {
                        console.log("Done fetching all product lists.");
                        let output = {
                            "user_name": user.user_name,
                            "bought_product_list": bought_product_list,
                        }
                        response.status(200).send(JSON.stringify(output));
                    }
                });
        });
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }

});


app.post('/delete_bought_product/:user_id', function (request, response) {
    console.log('server receives POST request /delete_product ');
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
        let product_id = request.body["product_id"];
        console.log('product_id: ', request.body);

        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
                response.status(422).send(err);
            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(421).send('User not found.');
                return;
            }
            Product.findOne({
                _id: product_id,
            }, function (err, product) {
                if (err) {
                    console.error(err);
                    response.status(422).send(err);
                    return;
                }
                if (product === null) {
                    console.error('Product with id:' + product_id + ' not found.');
                    response.status(421).send('Product not found.');
                    return;
                }
                const idx1 = user.bought_product_list.indexOf(product.product_link);
                if (idx1 === -1) {
                    console.error('Product with id:' + product_id + ' not found in user product list');
                    response.status(421).send('Product not found in user product list');
                    return;
                }
                user.bought_product_list.splice(idx1, 1);
                user.save()
                const idx2 = product.buyer_list.indexOf(user._id);
                if (idx2 === -1) {
                    console.error('user with id:' + user._id + ' not found in  product buyer list');
                    response.status(421).send('User not found in product buyer list');
                    return;
                }
                product.buyer_list.splice(idx2, 1);
                product.save();
                response.status(200).send('Success in deleting the product');
            });
        });
    } else {
        response.status(400).send('Not logged in yet.');
        return;
    }
});

app.post('/delete_liked_product/:user_id', function (request, response) {
    console.log('server receives POST request /delete_liked_product ');
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
        let product_id = request.body["product_id"];
        console.log('product_id: ', request.body);

        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
                response.status(422).send(err);
            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(421).send('User not found.');
                return;
            }
            Product.findOne({
                _id: product_id,
            }, function (err, product) {
                if (err) {
                    console.error(err);
                    response.status(422).send(err);
                    return;
                }
                if (product === null) {
                    console.error('Product with id:' + product_id + ' not found.');
                    response.status(421).send('Product not found.');
                    return;
                }
                const idx1 = user.liked_product_list.indexOf(product.product_link);
                if (idx1 === -1) {
                    console.error('Product with id:' + product_id + ' not found in user liked product list');
                    response.status(421).send('Product not found in user liked product list');
                    return;
                }
                user.liked_product_list.splice(idx1, 1);
                user.save()
                const idx2 = product.liker_list.indexOf(user._id);
                if (idx2 === -1) {
                    console.error('user with id:' + user._id + ' not found in  product liker list');
                    response.status(421).send('User not found in product liker list');
                    return;
                }
                product.liker_list.splice(idx2, 1);
                product.save();
                response.status(200).send('Success in deleting the liked product');
            });
        });
    } else {
        response.status(400).send('Not logged in yet.');
        return;
    }
});

app.post('/add_liked_products/:user_id', function (request, response) {
    console.log('server receives POST request /add_liked_products ');
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
        let item = request.body;
        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
                response.status(422).send(err);
            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(421).send('User not found.');
                return;
            }
            Product.findOne({
                'product_link': item.product_link
            }, function (err, product) {
                if (err) {
                }
                if (product) {
                    console.log("product existed: ", product.product_title);
                    if (!product.liker_list.includes(user_id)) {
                        product.liker_list.push(user_id);
                        product.save();
                        console.log("Add liker to an existing product,  user:", user.user_name, " product: ", product.product_title);

                    }
                    if (!user.liked_product_list.includes(product.product_link)) {
                        user.liked_product_list.push(product.product_link);
                        user.save()
                        console.log("Add product to an user's liked product list,  user:", user.user_name, " product: ", product.product_title);
                    }
                }
                else {
                    user.liked_product_list.push(item.product_link);
                    console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", item.product_title);
                    user.save();
                    Object.assign(item, { "liker_list": [user_id] });
                    Product.create(item,
                        function (err, newProduct) {
                            if (err) {
                            }
                            console.log("new newProduct created, ", newProduct.product_title);
                        });
                    console.log("Add product to an user's liked product list,  user:", user.user_name, " product: ", item.product_title);

                }
                let output = {
                    "user_name": user.user_name,
                    "liked_product_list": item.product_title,
                }
                response.status(200).send(JSON.stringify(output));
            })
        })
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }
});

app.post('/add_bought_products/:user_id', function (request, response) {
    console.log('server receives POST request /add_bought_products ');
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
        let products = request.body;
        User.findOne({
            _id: user_id,
        }, function (err, user) {
            if (err) {
                console.error(err);
                response.status(422).send(err);

            }
            if (user === null) {
                console.error('User with id:' + user_id + ' not found.');
                response.status(421).send('User not found.');
                return;
            }
            // console.log("products: ", products);

            async.each(products, function (item, callback) {
                Product.findOne({
                    'product_link': item.product_link
                }, function (err, product) {
                    if (err) {
                        callback(err);
                    }
                    if (product) {
                        console.log("product existed: ", product.product_title);
                        if (!product.buyer_list.includes(user_id)) {
                            product.buyer_list.push(user_id);
                            product.save();
                            console.log("Add buyer to an existing product,  user:", user.user_name, " product: ", product.product_title);

                        }
                        if (!user.bought_product_list.includes(product.product_link)) {
                            user.bought_product_list.push(product.product_link);
                            console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", product.product_title);
                        }
                    }
                    else {
                        Object.assign(item, { "buyer_list": [user_id] });
                        user.bought_product_list.push(item.product_link);
                        console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", item.product_title);

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
            }, function (err) {
                if (err) {
                    console.error(err);
                    response.status(400).send(err);
                } else {
                    user.save();
                    console.log("Done adding all products from page");
                    response.status(200).send("Success in adding bought products");
                }
                return;
            });
        })
    }
    else {
        response.status(400).send('Not logged in yet.');
        return;
    }
});


app.get('/userinfo/:user_id', function (request, response) {
    console.log('server receives GET request /user_info ');
    let user_id = request.params.user_id;
    User.findOne({
        _id: user_id,
    }, function (err, user) {
        if (err) {
            console.error(err);
            response.status(422).send(err);

        }
        if (user === null) {
            console.error('User with id:' + user_id + ' not found.');
            response.status(421).send('User not found.');
            return;
        }
        // console.log("products: ", products);
        let output = {
            user_id: user_id,
            user_name: user.user_name,
            profile_img: user.profile_img,
        };
        console.log("get /user_info: ", output);
        response.status(200).send(JSON.stringify(output));
    });
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
                        userObj.profile_img = "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png";  // default profile img
                        userObj.save();
                        console.log("new userObj created, ", userObj);

                        response.status(200).send('New user registered');
                    })
            }
        });

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