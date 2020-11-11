import axios from 'axios';
import './content.styles.css';
import SideBox from "../../containers/sidebox/sidebox";
import React from 'react';
import ReactDOM from "react-dom";


console.log("================================================================================================");
var url = window.location.href;
console.log('In Content script started.');
console.log('Current URL: ', url);

let onBoughtProductsToBeAdded = [];
let onLikedProductsToBeAdded = null; 
let toggle_like = false;

if (url.includes('amazon.com/gp/cart')) {
    let domain = "www.amazon.com";
    let img_query_string = " > div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a";
    let content = document.querySelectorAll("#activeCartViewForm > div.a-row.a-spacing-mini.sc-list-body.sc-java-remote-feature >  div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
    // console.log("content: " , content);

    for (let i = 0; i < content.length - 1; i++) { //content.length - 1 because last block is alexa ads
        let product = content[i];
        console.log('product ', i);
        console.log(product.innerText.split("\n"));
        let cleanedUpValues = product.innerText.split("\n");
        let item = {};
        item.product_title = cleanedUpValues[0];
        console.log("product_title: ", item.product_title)
        let cost_str = cleanedUpValues[cleanedUpValues.length - 1];
        cost_str = cost_str.substring(1);
        item.product_cost = parseFloat(cost_str);
        console.log("product_cost: ", item.product_cost);

        let img = document.querySelector("#" + product.id + img_query_string);
        item.product_link = "https://" + domain + img.getAttribute("href");
        if (item.product_link.includes("ref=")) {
            item.product_link = item.product_link.split('ref=')[0];
        }
        console.log("product_link:  ", item.product_link);
        item.product_imgurl = img.firstElementChild.getAttribute("src");
        console.log("product_imgurl:  ", item.product_imgurl);
        item.product_by = "Amazon";
        fetchMoreBoughtProductInfo(item);
    }
}
else if (url.includes('amazon.com/s?k=')) {
    const query_url = new URL(url);
    const key = query_url.searchParams.get('k');
    const category = query_url.searchParams.get('i');
    console.log( "Amazon search query: ", key, ", category: ", category);

}
else if (url.includes('amazon.com/')) {//Creating Elements
    console.log("Adding button .....");
    //Appending to DOM 
    ReactDOM.render(
        <SideBox />,
        document.body.appendChild(document.createElement("DIV"))
      )
      

}

function fetchLikedProductInfo(item) {
    if (url.includes('amazon.com/')) {
        let item = {};
        item.product_title = document.querySelector("#productTitle").innerText;
        console.log("product_title: ", item.product_title)
        let cost_str = "";
        if (document.querySelector("#priceblock_ourprice") == null){
            cost_str = document.querySelector("#priceblock_saleprice").innerText;
        } else {
            cost_str =  document.querySelector("#priceblock_ourprice").innerText;
        }
        cost_str = cost_str.substring(1);
        item.product_cost = parseFloat(cost_str);
        console.log("product_cost: ", item.product_cost);
        item.product_link = url;
        if (item.product_link.includes("ref=")) {
            item.product_link = item.product_link.split('ref=')[0];
        }
        console.log("product_link:  ", item.product_link);
        item.product_imgurl = document.querySelector("#main-image-container > ul > li.image.item.itemNo0.maintain-height.selected > span > span > div > img").src;
        
        console.log("product_imgurl:  ", item.product_imgurl);
        item.product_by = "Amazon";

        axios.get(item.product_link.split('amazon.com')[1])
            .then(
                response => {
                    let page = document.createElement('html');
                    page.innerHTML = response.data;
                    let summary_list = page.querySelectorAll("#feature-bullets > ul > li > span");
                    let product_summary = "";
                    for (let i = 0; i < summary_list.length; i++) {
                        if (!summary_list[i].innerHTML.includes("</")) {
                            product_summary = product_summary.concat(summary_list[i].innerHTML);
                        }
                    }
                    item.product_summary = product_summary;
                    // console.log("product_summary: ", product_summary);
                    let variation_imgs = page.querySelectorAll("button > div > div > img");
                    let product_variation_names = [];
                    let product_variation_imgurls = [];
                    for (let i = 0; i < variation_imgs.length; i++) {
                        let imgurl = variation_imgs[i].getAttribute('src');
                        let name = variation_imgs[i].getAttribute('alt');
                        product_variation_names.push(name);
                        product_variation_imgurls.push(imgurl);
                    }
                    // console.log('product_variations: ',product_variations);
                    item.product_variation_names = product_variation_names;
                    item.product_variation_imgurls = product_variation_imgurls;
                    onLikedProductsToBeAdded = item;
                    console.log("Just added liked product: ", onLikedProductsToBeAdded);

                })
            .catch(
                error => {
                    console.log(error);
                });
    }
}

function fetchMoreBoughtProductInfo(item) {
    if (url.includes('amazon.com/gp/cart')) {
        axios.get(item.product_link.split('amazon.com')[1])
            .then(
                response => {
                    let page = document.createElement('html');
                    page.innerHTML = response.data;
                    let summary_list = page.querySelectorAll("#feature-bullets > ul > li > span");
                    let product_summary = "";
                    for (let i = 0; i < summary_list.length; i++) {
                        if (!summary_list[i].innerHTML.includes("</")) {
                            product_summary = product_summary.concat(summary_list[i].innerHTML);
                        }
                    }
                    item.product_summary = product_summary;
                    // console.log("product_summary: ", product_summary);
                    let variation_imgs = page.querySelectorAll("button > div > div > img");
                    let product_variation_names = [];
                    let product_variation_imgurls = [];
                    for (let i = 0; i < variation_imgs.length; i++) {
                        let imgurl = variation_imgs[i].getAttribute('src');
                        let name = variation_imgs[i].getAttribute('alt');
                        product_variation_names.push(name);
                        product_variation_imgurls.push(imgurl);
                    }
                    // console.log('product_variations: ',product_variations);
                    item.product_variation_names = product_variation_names;
                    item.product_variation_imgurls = product_variation_imgurls;
                    onBoughtProductsToBeAdded.push(item);

                })
            .catch(
                error => {
                    console.log(error);
                });
    }
}

setInterval(function () {

    if (onBoughtProductsToBeAdded.length > 0) {
        sendToBackground("onBoughtProductsToBeAdded", onBoughtProductsToBeAdded);
    }
    console.log("onLikedProductsToBeAdded && toggle_like", onLikedProductsToBeAdded, toggle_like);
    if (onLikedProductsToBeAdded !== null && toggle_like) {
        sendToBackground("onLikedProductsToBeAdded", onLikedProductsToBeAdded);
        console.log("about to send to background the liked products", onLikedProductsToBeAdded)
    }
},
    5000); //update every 5 sec

function sendToBackground(eventName, eventData, callback) {
    console.log("sending to background.");
    chrome.runtime.sendMessage({ type: eventName, data: eventData },
        function (response) {
            console.log('this is the response from the background page for the ' + eventName + ' Event: ', response);
            if (response.status === 200) {
                console.log(eventName, " succeeded.", response.data);
            } else {
                console.log(eventName, " failed.", response.data);
            }
            onBoughtProductsToBeAdded = []; //clear
            onLikedProductsToBeAdded = null; //clear

        }
    );
}


console.log("================================================================================================");
