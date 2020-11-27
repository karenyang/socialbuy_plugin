import axios from 'axios';
import './content.styles.css';
import SideBox from "../../containers/sidebox/sidebox";
import ChoiceBox from "../../containers/choicebox/choicebox";

import RecommendationBox from "../../containers/recommendationbox/recommendationbox";
import fetchLikedProductInfo from './modules/fetch_product';
import React from 'react';
import ReactDOM from "react-dom";


console.log("================================================================================================");
var url = window.location.href;
console.log('Current URL: ', url);


if (url.includes('www.amazon.com/gp/cart')) {
    if (document.getElementsByName("proceedToRetailCheckout") !== null) {
        chrome.runtime.sendMessage({ type: "onHandleProductsInCart", data: document.URL },
            function (response) {
                console.log('this is the response from the background page for onHandleProductsInCart: ', response);
            }
        );
    }
}

else if (url.includes('www.amazon.com/s?k=')) {
    console.log("Searching from URL  .....");
    searchFromUrl();
}

else if (url.includes('www.amazon.com/gp/buy/thankyou/')) {
    chrome.runtime.sendMessage({ type: "onPurchaseDone" },
        function (response) {
            console.log('this is the response from the background page for onPurchaseDone: ', response);
            
            if (response === "User have not logged in"){
                ReactDOM.render(
                    <ChoiceBox logged_in={false} />,
                    document.body.appendChild(document.createElement("DIV"))
                )
            }
            else{
                if (response.length > 0) {
                    ReactDOM.render(
                        <ChoiceBox products={response} />,
                        document.body.appendChild(document.createElement("DIV"))
                    )
                }
            }
            
        }
    );
}

else if (url.includes('www.amazon.com/gp/buy/')) {
    const after_placing_order_func = function () {
        console.log(
            "Clicked Place Your Order Button. Adding products in page to bought List"
        )
        chrome.runtime.sendMessage({ type: "onClickPlaceOrder", data: document.URL },
            function (response) {
                console.log('this is the response from the background page for onClickPlaceOrder: ', response);
            }
        );

    }
    let buy_button = document.querySelector("#submitOrderButtonId > span > input");
    let buy_button_bottom = document.querySelector("#bottomSubmitOrderButtonId > span > input");
    buy_button.addEventListener("click", after_placing_order_func);
    buy_button_bottom.addEventListener("click", after_placing_order_func);

    // buy_button.addEventListener("mouseover",after_placing_order_func);
    // buy_button_bottom.addEventListener("mouseover", () => {
    //     chrome.runtime.sendMessage({ type: "onPurchaseDone" },
    //         function (response) {
    //             console.log('this is the response from the background page for onPurchaseDone: ', response);
    //             const last_purchase_products = response;
    //             console.log("onPurchaseDone succeeded.", last_purchase_products);
    //             if (last_purchase_products.length > 0) {
    //                 ReactDOM.render(
    //                     <ChoiceBox products={last_purchase_products} />,
    //                     document.body.appendChild(document.createElement("DIV"))
    //                 )
    //             }

    //         }
    //     );
    // });

    document.addEventListener('DOMNodeInserted', (e) => {
        if (e.target.id === 'subtotals') {
            console.log("DOMNodeInserted", e.target);
            buy_button = document.querySelector("#submitOrderButtonId > span > input");
            buy_button_bottom = document.querySelector("#bottomSubmitOrderButtonId > span > input");
            buy_button.addEventListener("click", after_placing_order_func);
            buy_button_bottom.addEventListener("click", after_placing_order_func);
        }
    });

}
else if (url.includes('www.amazon.com/') && !url.includes('amazon.com/gp/huc') &&
    !url.includes('amazon.com/gp/css') && !url.includes('amazon.com/gp/yourstore') &&
    (url.includes("ref=") || url.includes("/gp/product") || url.includes("/dp/"))) { //on a product page: Creating the side box

    console.log("Adding side box .....");

    ReactDOM.render(
        <SideBox />,
        document.body.appendChild(document.createElement("DIV"))
    )

    document.getElementById("buy-now-button").addEventListener("click", function () {
        chrome.runtime.sendMessage({ type: "onClickBuyNow", data: document.URL },
            function (response) {
                console.log('this is the response from the background page for onClickBuyNow: ', response);
            }
        );
    });
    // if user add to cart, add it to soonWillBuyProducts
    document.getElementById("add-to-cart-button").addEventListener("click", function () {
        console.log("add to cart clicked")
        chrome.runtime.sendMessage({ type: "onClickAddToCart", data: document.URL },
            function (response) {
                console.log('this is the response from the background page for onClickAddToCart: ', response);
            }
        );
    });

    document.addEventListener('DOMNodeInserted', (e) => {
        if (e.target.id === "buybox") {
            console.log("DOMNodeInserted", e.target);
            document.getElementById("buy-now-button").addEventListener("click", function () {
                chrome.runtime.sendMessage({ type: "onClickBuyNow", data: document.URL },
                    function (response) {
                        console.log('this is the response from the background page for onClickBuyNow: ', response);
                    }
                );
            });
            // if user add to cart, add it to soonWillBuyProducts
            document.getElementById("add-to-cart-button").addEventListener("click", function () {
                console.log("add to cart clicked")
                chrome.runtime.sendMessage({ type: "onClickAddToCart", data: document.URL },
                    function (response) {
                        console.log('this is the response from the background page for onClickAddToCart: ', response);
                    }
                );
            });

        }
    });
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
        is_recommendation: true,
    }
    chrome.runtime.sendMessage({ type: "onHandleSearch", data: query },
        function (response) {
            console.log('this is the response from the background page for onHandleSearch: ', response);
            if (response.status === 200) {
                console.log("onHandleSearch succeeded.", response.data);
                if (response.data.results.length > 0) {
                    ReactDOM.render(
                        <RecommendationBox recommendated_products={response.data.results} search_key={key} />,
                        document.body.appendChild(document.createElement("DIV"))
                    )
                }
            } else {
                console.log("onHandleSearch failed.", response.data);
            }
        }
    );
}

function fetchMoreBoughtProductInfo(response, item) {
    let page = document.createElement('html');
    page.innerHTML = response.data;
    let summary_list = page.querySelectorAll("#feature-bullets > ul > li > span");
    let product_summary = "";
    for (let i = 0; i < summary_list.length; i++) {
        if (!summary_list[i].innerHTML.includes("</")) {
            product_summary = product_summary.concat(summary_list[i].innerHTML);
        }
    }
    console.log("item", item);
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
    // console.log('product_variations: ', product_variation_names);
    item.product_variation_names = product_variation_names;
    item.product_variation_imgurls = product_variation_imgurls;
    return item;

}

function setStorageItem(message_type, data) {
    console.log("setStorage: ", message_type, " : ", data, JSON.stringify(data));
    window.localStorage.setItem(message_type, JSON.stringify(data));
}

function getStorageItem(message_type) {
    if (message_type == "soonWillBuyProducts") {
        let soonWillBuyProducts = JSON.parse(window.localStorage.getItem(message_type));
        if (soonWillBuyProducts === "" || soonWillBuyProducts === "[]" || soonWillBuyProducts === null) {
            soonWillBuyProducts = [];
        }
        return soonWillBuyProducts;
    }
    return JSON.parse(window.localStorage.getItem(message_type));
}
