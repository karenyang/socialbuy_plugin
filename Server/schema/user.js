"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');
var ObjectID = mongoose.Types.ObjectId;
// create a schema for User
var userSchema = new mongoose.Schema({
    // email: String, //unique login name
    email: String, 
    user_name: String,
    password_digest: String,  //the digest of user set password
    salt: String,  //8byte hex string salt to concat to the user set password
    profile_img: String, //url to the photo
    bought_product_list: [String], //product urls, need to be fetched 
    liked_product_list: [String], //product urls, need to be fetched 
    friends_list: [ObjectID], // friends ids, need to be fetched 
    friend_requests_list: [ObjectID],  // requested friends ids, need to be fetched  
},
    { timestamps: true }
);

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
