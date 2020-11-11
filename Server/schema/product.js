"use strict";

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;


const productSchema = new mongoose.Schema(
    {
        product_title: String,
        product_summary: String,
        product_by: String,
        product_link: String,
        product_cost: Number,
        product_imgurl: String,
        buyer_list: { type: [String], default: [] }, //user ids
        liker_list: { type: [String], default: [] }, //user ids

        product_variation_names: [String], 
        product_variation_imgurls: [String]
    },
    { timestamps: true }
);


var Product = mongoose.model('Product', productSchema);

module.exports = Product;
