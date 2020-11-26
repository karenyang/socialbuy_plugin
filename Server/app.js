// Do this as the first thing so that any code reading it knows the right env.
// process.env.BABEL_ENV = 'development';
// process.env.NODE_ENV = 'development';

// *************************************************************
// Configure
// *************************************************************
const express = require('express');
const dotenv = require('dotenv');
console.log(dotenv.config({ path: "./Server/.env" }));

const app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var passwordsalt = require('./utils/passwordsalt.js');
var async = require('async');

var User = require('./schema/user.js');
var Product = require('./schema/product.js');

var mongoose = require('mongoose');
var ObjectID = mongoose.Types.ObjectId;

console.log("process.env", process.env.NODE_ENV)

mongoose.Promise = require('bluebird');
const db = process.env.NODE_ENV === "production" ? process.env.PROD_DB : process.env.DEV_DB;
console.log("process.env DB", db);

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))
    .catch(err => {
        console.log(err);
    })


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

            let product_result = Product.aggregate([
                {
                    $match: {
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
                        _id: 1, product_title: 1, product_link: 1, product_cost: 1, product_imgurl: 1,
                        bought_friends_id_list: { $setIntersection: ['$buyer_list', user.friends_list] },
                        liked_friends_id_list: { $setIntersection: ['$liker_list', user.friends_list] },
                        createdAt: 1,
                    }
                },
                { $sort: { "createdAt": -1 } },
            ]).exec();

            product_result.then(function (items) {
                //console.log("fetched products: ", items);
                let queries = [];
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    queries.push(User.aggregate([
                        {
                            $match: {
                                $or: [
                                    { "_id": { "$in": item.bought_friends_id_list } },
                                    { "_id": { "$in": item.liked_friends_id_list } },

                                ]
                            },
                        },
                        {
                            $project: {
                                _id: 1, email: 1, user_name: 1, profile_img: 1,
                                bought: { "$in": ["$_id", item.bought_friends_id_list] },
                                liked: { "$in": ["$_id", item.liked_friends_id_list] },
                            }
                        }
                    ]).exec());
                    //console.log("Done with querying a item's friend details: ", i);
                }

                Promise.all(queries).then((friend_details) => {
                    //console.log("friend_details are: ", friend_details);
                    for (let i = 0; i < items.length; i++) {
                        items[i].friends_bought_list = [];
                        items[i].friends_liked_list = [];
                        for (let j = 0; j < friend_details[i].length; j++) {
                            const friend_detail = friend_details[i][j];
                            if (friend_detail.bought) {
                                items[i].friends_bought_list.push(friend_detail);
                            }
                            if (friend_detail.liked) {
                                items[i].friends_liked_list.push(friend_detail);
                            }
                        }

                    }
                    let output = {
                        user_name: user.user_name,
                        friends_productlist: items,
                    }
                    console.log("fetch friends_productlist list: ", items);
                    response.status(200).send(JSON.stringify(output));
                })
            });

        }
        )
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
                        _id: 1, email: 1, user_name: 1, profile_img: 1,
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
                        _id: 1, email: 1, user_name: 1, profile_img: 1,
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
    console.log('server receives POST request /deletefriend ', request.body, request.params);
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
                    if (idx1 === -1) {
                        console.error('user with id:' + user._id + " not found in the tobe deletetd friends's friend list");
                        // response.status(421).send('User not found.');
                        // return;
                    }
                    else {
                        friend.friends_list.splice(idx1, 1);
                        friend.save();
                    }


                    const idx2 = user.friends_list.indexOf(ObjectID(friend_id));
                    if (idx2 === -1) {
                        console.error('friend with id:' + friend_id + " not found in the user's friend list");
                        // response.status(421).send('User not found.');
                        // return;
                    }
                    else {
                        user.friends_list.splice(idx2, 1);
                        user.save();
                    }


                    const idx3 = friend.friend_requests_list.indexOf(ObjectID(user._id));
                    if (idx3 === -1) {
                        console.error('user with id:' + user._id + " not found in the tobe deletetd friends's friend_requests_list");

                    }
                    else {
                        friend.friend_requests_list.splice(idx3, 1);
                        friend.save();
                    }

                    const idx4 = user.friend_requests_list.indexOf(ObjectID(friend_id));
                    if (idx4 === -1) {
                        console.error('friend with id:' + user._id + " not found in the to user's friend_requests_list");
                        
                    }
                    else {
                        user.friend_requests_list.splice(idx4, 1);
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

app.post('/unfollowfriend/:user_id', function (request, response) {
    console.log('server receives POST request /unfollowfriend ', request.body, request.params);
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
                   
                    const idx2 = user.friends_list.indexOf(ObjectID(friend_id));
                    if (idx2 === -1) {
                        console.error('friend with id:' + friend_id + " not found in the user's friend list");
                        // response.status(421).send('User not found.');
                        // return;
                    }
                    else {
                        user.friends_list.splice(idx2, 1);
                        user.save();
                    }

                    const idx4 = user.friend_requests_list.indexOf(ObjectID(friend_id));
                    if (idx4 === -1) {
                        console.error('friend with id:' + user._id + " not found in the user's friend_requests_list");
                        
                    }
                    else {
                        user.friend_requests_list.splice(idx4, 1);
                        user.save();
                    }

                    console.log( user.user_name + "Unfollowed friend ", friend.user_name);
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
                        // friend.friends_list.push(ObjectID(user._id)); //in follower mode, this should already be added.
                    }
                    else{
                        // if i do not accept, blocks this person from following me
                        const idx1 = friend.friends_list.indexOf(user._id);
                        if (idx1 === -1) {
                            console.error('user with id:' + user._id + "not found in the sender's friend list");
                        }
                        else {
                            friend.friends_list.splice(idx1, 1);
                        }

                    }
                    // remove from friend's friend_requests_list no matter whether accepts or not 
                    const idx = friend.friend_requests_list.indexOf(user._id);
                    if (idx === -1) {
                        console.error('user with id:' + user._id + "not found in the sender's friend request list");
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
                    user.friends_list.push(ObjectID(friend._id)); // One line change from friend -> Follower model!!! 
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
    console.log('server receives Get request /search ',request.body );
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
            if (search_category === 'user') {
                let user_result = User.aggregate([
                    {
                        $match: {
                            // $text: { $search: search_key },  //match with string query.
                            "user_name": { $regex: search_key, $options: "ix" }, //use regex is better
                        }
                    },
                    {
                        $project: {
                            _id: 1, user_name: 1, email: 1,
                            is_followed_by_me: { "$in": ["$_id", user.friends_list] },
                            is_follows_me: { "$in": [ user._id, "$friends_list"] },
                            is_self: { "$eq": ["$_id", user._id] },
                            num_mutual_friends: { $size: { $setIntersection: ["$friends_list", user.friends_list] } },
                        }
                    },
                    {
                        $sort: {
                            mutual_friends: -1,
                            is_followed_by_me: -1,
                            is_follows_me: -1,
                            is_self: -1,
                        }
                    }
                ]).exec();

                user_result.then(function (results) {
                    let output = {
                        user_name: user.user_name,
                        results: results
                    }
                    console.log("Found friend: ", results);
                    response.status(200).send(JSON.stringify(output));
                    return;

                });
            }

            else {
                let search_string = search_key;
                if (search_category !== null && search_category != "product") {
                    search_string = search_key.concat(" " + search_category);
                }
                console.log("search string is: ", search_string);
                let user_list = user.friends_list;
                if(request.body.is_recommendation === false){
                    user_list = user.friends_list.concat(ObjectID(user_id)); //include user themselves to be searchable
                }
                let product_result = Product.aggregate([
                    {
                        $match: {
                            $text: { $search: search_string },  //match with string query.
                            $expr: {
                                $gt: [
                                    {
                                        $sum: [
                                            { $size: { $setIntersection: ['$liker_list', user_list] } }, //liker or buyer has my friends in it
                                            { $size: { $setIntersection: ['$buyer_list', user_list] } }
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
                            bought_friends_id_list: { $setIntersection: ['$buyer_list', user_list] },
                            liked_friends_id_list: { $setIntersection: ['$liker_list', user_list] }
                        }
                    },
                    {
                        $match: { score: { $gt: 6.3 } }
                    },
                    { $sort: { score: { $meta: "textScore" } } },

                ]).exec();

                product_result.then(function (items) {

                    // console.log("fetched products: ", items);
                    let queries = [];
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        queries.push(User.aggregate([
                            {
                                $match: {
                                    $or: [
                                        { "_id": { "$in": item.bought_friends_id_list } },
                                        { "_id": { "$in": item.liked_friends_id_list } },

                                    ]
                                },
                            },
                            {
                                $project: {
                                    _id: 1, email: 1, user_name: 1, profile_img: 1,
                                    bought: { "$in": ["$_id", item.bought_friends_id_list] },
                                    liked: { "$in": ["$_id", item.liked_friends_id_list] },
                                }
                            }
                        ]).exec());
                        console.log("Done with querying a item's friend details: ", i);
                    }
                    Promise.all(queries).then((friend_details) => {
                        console.log("friend_details are: ", friend_details);
                        for (let i = 0; i < items.length; i++) {
                            items[i].friends_bought_list = [];
                            items[i].friends_liked_list = [];
                            for (let j = 0; j < friend_details[i].length; j++) {
                                const friend_detail = friend_details[i][j];
                                if (friend_detail.bought) {
                                    items[i].friends_bought_list.push(friend_detail);
                                }
                                if (friend_detail.liked) {
                                    items[i].friends_liked_list.push(friend_detail);
                                }
                            }

                        }

                        let output = {
                            user_name: user.user_name,
                            results: items,
                        }
                        console.log("search results are: ", items);
                        response.status(200).send(JSON.stringify(output));
                    })
                }

                )
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

            let product_result = Product.aggregate([
                {
                    $match: {
                        "product_link": { "$in": user.liked_product_list },
                    }
                },
                {
                    $project: {
                        _id: 1, product_title: 1, product_link: 1, product_cost: 1, product_imgurl: 1,
                        bought_friends_id_list: { $setIntersection: ['$buyer_list', user.friends_list] },
                        liked_friends_id_list: { $setIntersection: ['$liker_list', user.friends_list] },
                        createdAt: 1,
                    }
                },
                { $sort: { "createdAt": -1 } },
            ]).exec();

            product_result.then(function (items) {
                // console.log("fetched products: ", items);
                let queries = [];
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    queries.push(User.aggregate([
                        {
                            $match: {
                                $or: [
                                    { "_id": { "$in": item.bought_friends_id_list } },
                                    { "_id": { "$in": item.liked_friends_id_list } },

                                ]
                            },
                        },
                        {
                            $project: {
                                _id: 1, email: 1, user_name: 1, profile_img: 1,
                                bought: { "$in": ["$_id", item.bought_friends_id_list] },
                                liked: { "$in": ["$_id", item.liked_friends_id_list] },
                            }
                        }
                    ]).exec());
                    console.log("Done with querying a item's friend details: ", i);
                }

                Promise.all(queries).then((friend_details) => {
                    // console.log("friend_details are: ", friend_details);
                    for (let i = 0; i < items.length; i++) {
                        items[i].friends_bought_list = [];
                        items[i].friends_liked_list = [];
                        for (let j = 0; j < friend_details[i].length; j++) {
                            const friend_detail = friend_details[i][j];
                            if (friend_detail.bought) {
                                items[i].friends_bought_list.push(friend_detail);
                            }
                            if (friend_detail.liked) {
                                items[i].friends_liked_list.push(friend_detail);
                            }
                        }

                    }

                    let output = {
                        user_name: user.user_name,
                        liked_product_list: items,
                    }
                    // console.log("fetch liked product list: ", items);
                    response.status(200).send(JSON.stringify(output));
                })
            });
        })
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

            let product_result = Product.aggregate([
                {
                    $match: {
                        "product_link": { "$in": user.bought_product_list },
                    }
                },
                {
                    $project: {
                        _id: 1, product_title: 1, product_link: 1, product_cost: 1, product_imgurl: 1,
                        bought_friends_id_list: { $setIntersection: ['$buyer_list', user.friends_list] },
                        liked_friends_id_list: { $setIntersection: ['$liker_list', user.friends_list] },
                        createdAt: 1,
                    }
                },
                { $sort: { "createdAt": -1 } },
            ]).exec();

            product_result.then(function (items) {
                // console.log("fetched products: ", items);
                let queries = [];
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    queries.push(User.aggregate([
                        {
                            $match: {
                                $or: [
                                    { "_id": { "$in": item.bought_friends_id_list } },
                                    { "_id": { "$in": item.liked_friends_id_list } },

                                ]
                            },
                        },
                        {
                            $project: {
                                _id: 1, email: 1, user_name: 1, profile_img: 1,
                                bought: { "$in": ["$_id", item.bought_friends_id_list] },
                                liked: { "$in": ["$_id", item.liked_friends_id_list] },
                            }
                        }
                    ]).exec());
                    console.log("Done with querying a item's friend details: ", i);
                }

                Promise.all(queries).then((friend_details) => {
                    console.log("friend_details are: ", friend_details);
                    for (let i = 0; i < items.length; i++) {
                        items[i].friends_bought_list = [];
                        items[i].friends_liked_list = [];
                        for (let j = 0; j < friend_details[i].length; j++) {
                            const friend_detail = friend_details[i][j];
                            if (friend_detail.bought) {
                                items[i].friends_bought_list.push(friend_detail);
                            }
                            if (friend_detail.liked) {
                                items[i].friends_liked_list.push(friend_detail);
                            }
                        }
                    }

                    let output = {
                        user_name: user.user_name,
                        bought_product_list: items,
                    }
                    // console.log("fetch bought product list: ", items);
                    response.status(200).send(JSON.stringify(output));
                })
            });
        })
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
    console.log('server receives POST request /delete_liked_product ', request.body);
    let user_id = request.params.user_id;
    if (user_id) {
        console.log('user_id: ', user_id);
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
            
            if("product_id" in request.body){
                let product_id = request.body["product_id"];
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
            }
            else if ("product_link" in request.body){
                let product_link = request.body["product_link"];

                Product.findOne({
                    product_link: product_link,
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
            }
            
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
                    // console.log("product existed: ", product.product_title);
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
                            // console.log("new newProduct created, ", newProduct.product_title);
                        });
                    // console.log("Add product to an user's liked product list,  user:", user.user_name, " product: ", item.product_title);

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
    // console.log('server receives POST request /add_bought_products ');
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
                    else {
                        if (product) {
                            // console.log("product existed: ", product.product_title);
                            if (!product.buyer_list.includes(user_id)) {
                                product.buyer_list.push(user_id);
                                product.save();
                                // console.log("Add buyer to an existing product,  user:", user.user_name, " product: ", product.product_title);

                            }
                            if (!user.bought_product_list.includes(product.product_link)) {
                                user.bought_product_list.push(product.product_link);
                                console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", product.product_title);
                            }
                            callback(null);
                        }
                        else {
                            Object.assign(item, { "buyer_list": [user_id] });
                            user.bought_product_list.push(item.product_link);
                            //console.log("Add product to an user's  product list,  user:", user.user_name, " product: ", item.product_title);

                            Product.create(item,
                                function (err, newProduct) {
                                    if (err) {
                                        callback(err);
                                    }
                                    else {
                                        console.log("new newProduct created, ", newProduct.product_title);
                                        callback(null);
                                    }
                                })

                        }
                    }

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


app.get('/userinfo/:user_id/:friend_id', function (request, response) {
    console.log('server receives GET request /user_info ', request.params);
    let user_id = request.params.user_id;
    let friend_id = request.params.friend_id;

    User.findOne({
        _id: user_id,
    }, function (err, user) {
        if (err) {
            console.error(err);
            response.status(422).send(err);
        }
        User.findOne({
            _id: friend_id,
        }, function (err, friend) {
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
                user_id: friend_id,
                email: friend.email,
                user_name: friend.user_name,
                profile_img: friend.profile_img,
                is_follows_me: friend.friends_list.includes(user_id),
                is_followed_by_me: user.friends_list.includes(friend_id),
            };
            console.log("get /user_info: ", output);
            response.status(200).send(JSON.stringify(output));
        });
    }
    )

});

app.post('/userinfo/:user_id', function (request, response) {
    console.log('server receives POST request /user_info ', request.body);
    let user_id = request.params.user_id;
    let new_userinfo = request.body;
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
        Object.assign(user, new_userinfo);
        user.save();
        console.log("updated after post /user_info: ", user);
        let output = {
            user_id: user_id,
            email: user.email,
            user_name: user.user_name,
            profile_img: user.profile_img,
        };
        response.status(200).send(JSON.stringify(output));
    });
});

app.post('/admin/login', function (request, response) {
    console.log('server receives POST request /admin/login : ', request.body);
    const email = request.body.email;

    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            console.error('User with email:' + email + ' not found');
            response.status(250).send('User of this email not registered: ' + email);
            return;
        }
        if (!passwordsalt.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
            console.error('Wrong password');
            response.status(250).send('Wrong password');
            return;
        }
        request.session.user_id = user._id;
        request.session.user_name = user.user_name;
        request.session.email = user.email;
        delete request.body.password; //make it safe

        let output = {
            user_id: user._id,
            user_name: user.user_name,
            email: email,
            received_friend_requests: user.received_friend_requests,
        };
        response.status(200).send(JSON.stringify(output));
    });
    return;

});

app.post('/admin/fblogin', function (request, response) {
    console.log('server receives POST request /admin/fblogin : ', request.body);
    const fb_id = request.body.fb_id; //unique id form Facebook 

    User.findOne({
        fb_id: fb_id
    }, function (err, user) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            // create an account in database
            const newUser = request.body; //email, name, fb_id, fb_access_token, friends
            console.log("about to create new user: ", newUser);
            User.create(newUser,
                function (err, userObj) {
                    if (err) {
                        response.status(500).send(JSON.stringify(err));
                        return;
                    }
                    console.log("new userObj created, ", userObj);
                    if (userObj.email !== "kaiyuany03@gmail.com") {
                        User.findOne({
                            "email": "kaiyuany03@gmail.com"
                        },
                            function (err, karen) {
                                if (err) {
                                    console.err("Error adding friends with karen");
                                }
                                if (karen !== null) {
                                    karen.friends_list.push(userObj._id);
                                    userObj.friends_list.push(karen._id);
                                    karen.save();
                                    userObj.save();
                                    console.log("Added friends with Karen");
                                }
                                request.session.user_id = userObj._id;
                                request.session.user_name = userObj.user_name;
                                request.session.email = userObj.email;

                                let output = {
                                    user_id: userObj._id,
                                    user_name: userObj.user_name,
                                    email: userObj.email,
                                    received_friend_requests: [],
                                };
                                response.status(200).send(JSON.stringify(output));
                                return;
                            }
                        )
                    }
                })
        }
        else {
            console.log("found user: ", user);
            request.session.user_id = user._id;
            request.session.user_name = user.user_name;
            request.session.email = user.email;

            let output = {
                user_id: user._id,
                user_name: user.user_name,
                email: user.email,
                received_friend_requests: user.received_friend_requests,
            };
            response.status(200).send(JSON.stringify(output));
        }

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
        response.clearCookie("email");
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
        'email': newUser.email
    },
        function (err, user) {
            if (user !== null) {
                console.log("Email has already been used for registration.");
                response.status(250).send('Email already exists');
            } else {
                User.create(newUser,
                    function (err, userObj) {
                        if (err) {
                            response.status(500).send(JSON.stringify(err));
                        }
                        userObj.profile_img = "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png";  // default profile img
                        console.log("new userObj created, ", userObj);
                        if (userObj.email !== "kaiyuany03@gmail.com") {
                            User.findOne({
                                "email": "kaiyuany03@gmail.com"
                            },
                                function (err, karen) {
                                    if (err) {
                                        console.err("Error adding friends with karen");
                                    }
                                    if (karen !== null) {
                                        karen.friends_list.push(userObj._id);
                                        userObj.friends_list.push(karen._id);
                                        karen.save();
                                        userObj.save();
                                        console.log("Added friends with Karen");
                                    }
                                    response.status(200).send('New user registered');

                                }
                            )
                        }
                    })


            }
        });

});


app.listen(8080, function () {
    console.log('App started on Port: 8080 ');
});

