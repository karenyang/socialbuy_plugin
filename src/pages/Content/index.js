import axios from 'axios';
import './content.styles.css';
import SideBox from "../../containers/sidebox/sidebox";
import RecommendationBox from "../../containers/recommendationbox/recommendationbox";

import React from 'react';
import ReactDOM from "react-dom";


console.log("================================================================================================");
var url = window.location.href;
console.log('In Content script started.');
console.log('Current URL: ', url);

let onBoughtProductsToBeAdded = [];


if (url.includes('amazon.com/gp/cart')) {
    if (document.getElementsByName("proceedToRetailCheckout") !== null) {
        console.log("Grabbing all products in cart...");
        grabAllProductsInCart();
        let checkout_button = document.getElementsByName("proceedToRetailCheckout")[0];

        checkout_button.addEventListener("click", function () {
            console.log(
                "Clicked Check Out Button. Adding products in cart to bought"
            )
            chrome.runtime.sendMessage({ type: "onBoughtProductsToBeAdded", data: onBoughtProductsToBeAdded },
                function (response) {
                    console.log('this is the response from the background page for the onBoughtProductsToBeAdded Event: ', response);
                    if (response.status === 200) {
                        console.log("onBoughtProductsToBeAdded succeeded.", response.data);
                    } else {
                        console.log("onBoughtProductsToBeAdded failed.", response.data);
                    }
                    onBoughtProductsToBeAdded = []; //clear
                });
            
        });
    }

}
else if (url.includes('amazon.com/s?k=')) {
    console.log("Searching from URL  .....");
    searchFromUrl();
}
else if (url.includes('amazon.com/') && !url.includes('amazon.com/gp/buy')) { //on a product page: Creating the side box
    console.log("Adding side box .....");

    ReactDOM.render(
        <SideBox />,
        document.body.appendChild(document.createElement("DIV"))
    )
}


console.log("================================================================================================");

function searchFromUrl() {
    const query_url = new URL(url);
    const key = query_url.searchParams.get('k');
    const category = query_url.searchParams.get('i');
    console.log("Amazon search query: ", key, ", category: ", category);
    let query = {
        search_key: key,
        search_category: category,
    }
    chrome.runtime.sendMessage({ type: "onHandleSearch", data: query },
        function (response) {
            console.log('this is the response from the background page for onHandleSearch: ', response);
            if (response.status === 200) {
                console.log("onHandleSearch succeeded.", response.data);
                if (response.data.results.length > 0) {
                    ReactDOM.render(
                        <RecommendationBox recommendated_products={response.data.results} />,
                        document.body.appendChild(document.createElement("DIV"))
                    )
                }
            } else {
                console.log("onHandleSearch failed.", response.data);
            }
        }
    );
}

function grabAllProductsInCart() {
    let domain = "www.amazon.com";
    let img_query_string = " > div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a";
    let content = document.querySelectorAll("#activeCartViewForm > div.a-row.a-spacing-mini.sc-list-body.sc-java-remote-feature >  div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
    for (let i = 0; i < content.length - 1; i++) { //content.length - 1 because last block is alexa ads
        let product = content[i];
        console.log('product ', i);
        console.log(product.innerText.split("\n"));
        let cleanedUpValues = product.innerText.split("\n");
        let item = {};
        item.product_title = cleanedUpValues[0];
        console.log("product_title: ", item.product_title)
        let cost_str = cleanedUpValues.filter(value => value.startsWith("$"))[0];
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

// setInterval(function () {
//     if (onBoughtProductsToBeAdded.length > 0) {
//         sendToBackground("onBoughtProductsToBeAdded", onBoughtProductsToBeAdded);
//     }
// },
//     5000); //update every 5 sec

// function sendToBackground(eventName, eventData, callback) {
//     console.log("sending to background.");
//     chrome.runtime.sendMessage({ type: eventName, data: eventData },
//         function (response) {
//             console.log('this is the response from the background page for the ' + eventName + ' Event: ', response);
//             if (response.status === 200) {
//                 console.log(eventName, " succeeded.", response.data);
//             } else {
//                 console.log(eventName, " failed.", response.data);
//             }
//             onBoughtProductsToBeAdded = []; //clear
//         }
//     );
// }

