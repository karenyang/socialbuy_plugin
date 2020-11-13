"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');
var ObjectID = mongoose.Types.ObjectId;
// create a schema for User
var userSchema = new mongoose.Schema({
    user_name: String,  //unique login name
    password_digest: String,  //the digest of user set password
    salt: String,  //8byte hex string salt to concat to the user set password
    bought_product_list: [String], //product urls 
    liked_product_list: [String], //product urls 
    friends_list: [ObjectID], // friends ids 
    friend_requests_list: [ObjectID],  // requested friends ids 
    profile_img: String //url to the photo
},
    { timestamps: true }
);

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
