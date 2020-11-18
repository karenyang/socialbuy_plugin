import axios from 'axios';
import './content.styles.css';
import SideBox from "../../containers/sidebox/sidebox";
import RecommendationBox from "../../containers/recommendationbox/recommendationbox";
import fetchLikedProductInfo from './modules/fetch_product';
import React from 'react';
import ReactDOM from "react-dom";


console.log("================================================================================================");
var url = window.location.href;

console.log('Current URL: ', url);


if (url.includes('amazon.com/gp/cart')) {
    if (document.getElementsByName("proceedToRetailCheckout") !== null) {
        console.log("Grabbing all products in cart...");
        let domain = "www.amazon.com";
        let img_query_string = " > div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a";
        let content = document.querySelectorAll("#activeCartViewForm > div.a-row.a-spacing-mini.sc-list-body.sc-java-remote-feature >  div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
        let scrap_product_pages_promises = [];
        let products = [];
        let items = [];
        for (let i = 0; i < content.length - 1; i++) { //content.length - 1 because last block is alexa ads
            let product = content[i];
            // console.log('product ', i);
            // console.log(product.innerText.split("\n"));
            let cleanedUpValues = product.innerText.split("\n");
            let item = {};
            item.product_title = cleanedUpValues[0];
            // console.log("product_title: ", item.product_title)
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
            // console.log("product_imgurl:  ", item.product_imgurl);
            item.product_by = "Amazon";
            items.push(item);
            scrap_product_pages_promises.push(axios.get(item.product_link.split('amazon.com')[1]));
        }
        Promise.all(scrap_product_pages_promises).then((responses) => {
            console.log("responses: ", responses.length);
            for (let i = 0; i < responses.length; i++) {
                products.push(fetchMoreBoughtProductInfo(responses[i], items[i]));
            }
            setStorageItem("soonWillBuyProducts", products);
        })



        // let checkout_button = document.getElementsByName("proceedToRetailCheckout")[0];

        // checkout_button.addEventListener("click", function () {
        //     console.log(
        //         "Clicked Check Out Button. Adding products in cart to bought"
        //     )
        //     chrome.runtime.sendMessage({ type: "soonWillBuyProducts", data: soonWillBuyProducts },
        //         function (response) {
        //             console.log('this is the response from the background page for the soonWillBuyProducts Event: ', response);
        //             if (response.status === 200) {
        //                 console.log("soonWillBuyProducts succeeded.", response.data);
        //             } else {
        //                 console.log("soonWillBuyProducts failed.", response.data);
        //             }
        //             soonWillBuyProducts = []; //clear
        //         });

        // });
    }

}
else if (url.includes('amazon.com/s?k=')) {
    console.log("Searching from URL  .....");
    searchFromUrl();
}
else if (url.includes('amazon.com/gp/buy/')) {
    if (!url.includes('amazon.com/gp/buy/thankyou/')) {
        let buy_button = document.querySelector("#submitOrderButtonId > span > input");
        let soonWillBuyProducts = getStorageItem("soonWillBuyProducts")
        console.log("Before buy soonWillBuyProducts: ", soonWillBuyProducts);

        buy_button.addEventListener("click", function () {
            console.log(
                "Clicked Place Your Order Button. Adding products in page to bought List"
            )
            // choose now because people might have deleted things right before 
            let products_checkout = document.querySelectorAll("#spc-orders > div > div > div.a-row.shipment > div > div > div > div> div > div > div.a-row > div > div > div.a-fixed-left-grid-col.item-details-right-column.a-col-right > div.a-row.breakword > span")
            console.log("products_checkout: ", products_checkout);
            let data = []
            if (products_checkout !== null) {
                let product_names = [];
                product_names = Array.from(products_checkout).map((a) => a.innerText);
                if (product_names.length > 0) {
                    for (let i = 0; i < soonWillBuyProducts.length; i++) {
                        if (product_names.includes(soonWillBuyProducts[i].product_title)) {
                            data.push(soonWillBuyProducts[i]);
                        }
                    }
                    chrome.runtime.sendMessage({ type: "soonWillBuyProducts", data: data },
                        function (response) {
                            console.log('this is the response from the background page for the soonWillBuyProducts Event: ', response);
                            if (response.status === 200) {
                                console.log("soonWillBuyProducts succeeded.", response.data);
                            } else {
                                console.log("soonWillBuyProducts failed.", response.data);
                            }
                            window.localStorage.clear();
                        });
                }
            }
        });
    }
}
else if (url.includes('amazon.com/') && !url.includes('amazon.com/gp/huc') && !url.includes('amazon.com/gp/css')) { //on a product page: Creating the side box
    console.log("Adding side box .....");
    let product = fetchLikedProductInfo();
    console.log("fetched product: ", product);
    ReactDOM.render(
        <SideBox product={product} />,
        document.body.appendChild(document.createElement("DIV"))
    )


    // if user buy now, 
    document.getElementById("buy-now-button").addEventListener("click", function () {
        console.log(
            "Clicked Buy Now Button. Count this as buying for now"
        )
        chrome.runtime.sendMessage({ type: "soonWillBuyProducts", data: [product] },
            function (response) {
                console.log('Sidebox: is the response from the background page for the soonWillBuyProducts  Event', response.data);
                if (response.status === 200) {
                    console.log("soonWillBuyProducts", " succeeded.", response.data);
                } else {
                    console.log("soonWillBuyProducts", " failed.", response.data);
                }
            }
        );

    });
    // if user add to card , add it to soonWillBuyProducts
    document.getElementById("add-to-cart-button").addEventListener("click", function () {
        console.log(
            "Clicked Add to Cart Button."
        )
        let soonWillBuyProducts = getStorageItem("soonWillBuyProducts")
        soonWillBuyProducts.push(product);
        setStorageItem("soonWillBuyProducts", soonWillBuyProducts);
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
    console.log("setStorage", data, JSON.stringify(data));
    window.localStorage.setItem(message_type, JSON.stringify(data));
}

function getStorageItem(message_type) {
    return JSON.parse(window.localStorage.getItem(message_type));
}
