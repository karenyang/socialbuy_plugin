"use strict";

const mongoose = require('mongoose');

var ObjectID = mongoose.Types.ObjectId;

const productSchema = new mongoose.Schema(
    {
        product_title: String,   
        product_summary: String,
        product_by: String,     //Amazon
        product_link: String,   //url
        product_cost: Number,   //float
        product_imgurl: String, //url for img
        buyer_list: { type: [ObjectID], default: [] }, //user ids
        liker_list: { type: [ObjectID], default: [] }, //user ids
        product_variation_names: [String],
        product_variation_imgurls: [String]
    },
    { timestamps: true }
);

productSchema.index({
    "product_title": 'text',
    "product_variation_names": 'text',
    "product_summary": 'text',
}, {
    name: "text-index",
    weights: {
        product_title: 10,
        product_variation_names: 2,
        product_summary: 3,
    }
});

var Product = mongoose.model('Product', productSchema);

module.exports = Product;
