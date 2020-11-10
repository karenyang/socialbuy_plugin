import axios from 'axios';
import './content.styles.css';

console.log("================================================================================================");
var url = window.location.href;
console.log('In Content script started.');
console.log('Current URL: ', url);

let onBoughtProductsToBeAdded = [];
let onLikedProductsToBeAdded = []
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
        item.product_link = domain + img.getAttribute("href");
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
else if (url.includes('amazon.com/')) {//Creating Elements
    console.log("Adding button .....");
    let img = document.createElement("img");
    img.src = "https://lh3.googleusercontent.com/7RD2Vgs9Xpieti3nKf9IWQeq8nd7hIR_-zVdwHdzw87CsDT_TfstQSunauqnbWjgqA1WjhI=s85";
    img.width = 50 ;
    img.height = 50;

    img.alt = "icon img";
    
    var t = document.createTextNode("Like123");
    img.appendChild(t);

    // let imgLabel = document.createElement("p");
    // imgLabel.innerHTML = "Like123label";
    // imgLabel.style.position = "absolute";
    // imgLabel.style.top = "0px";
    // imgLabel.style.left = "0px";
    // imgLabel.style.margin = "0px";

    let imgContainer = document.createElement("div");
    imgContainer.className = "imgcontainer"
    imgContainer.style.display = "inline-block";
    imgContainer.style.position = "fixed";
    imgContainer.style.top = "300px";
    imgContainer.style.right = "0px";
    imgContainer.style.margin = "0px";
    imgContainer.appendChild(img);

    let likeicon = document.createElement("img");
    likeicon.src = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg";
    likeicon.width = 38;
    likeicon.height = 38;
    likeicon.style.position = "absolute";
    likeicon.style.top = "0px";
    likeicon.style.right = "0px";
    likeicon.style.margin = "6px";
    likeicon.opacity = 0.5;

    
    imgContainer.addEventListener("mouseover",function(){
        img.style.opacity = 0.5; 
        this.style.cursor = 'pointer';
        imgContainer.appendChild(likeicon);
    });

    imgContainer.addEventListener("click", function(){
        if (toggle_like){
            likeicon.src = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg"; //pink
            
        } else {
            likeicon.src = "https://crissov.github.io/unicode-proposals/img/2764_emojitwo.svg"; //red
        }
        toggle_like = !toggle_like;
        console.log("Do I like it? ", toggle_like);
        
        fetchLikedProductInfo();
        
    });
    

    imgContainer.addEventListener("mouseleave",function(){
        img.style.opacity = 1; 
        imgContainer.removeChild(likeicon);

    });

    // imgContainer.appendChild(imgLabel);
    imgContainer.style.zIndex = '289';
    //Appending to DOM 
    document.body.appendChild(imgContainer);
}

function fetchLikedProductInfo(item) {
    if (url.includes('amazon.com/')) {
        // let product = content[i];
        // console.log('product ', i);
        // console.log(product.innerText.split("\n"));
        // let cleanedUpValues = product.innerText.split("\n");
        
        let item = {};
        item.product_title = document.querySelector("#productTitle").innerText;
        console.log("product_title: ", item.product_title)
        let cost_str = document.querySelector("#priceblock_ourprice").innerText;
        cost_str = cost_str.substring(1);
        item.product_cost = parseFloat(cost_str);
        console.log("product_cost: ", item.product_cost);
        item.product_link = url;
        if (item.product_link.includes("ref=")) {
            item.product_link = item.product_link.split('ref=')[0];
        }
        console.log("product_link:  ", item.product_link);
        item.product_imgurl = document.querySelector("#landingImage").src;
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
                    onLikedProductsToBeAdded.push(item);
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

setTimeout(function () {
    if (onBoughtProductsToBeAdded.length > 0) {
        sendToBackground("onBoughtProductsToBeAdded", onBoughtProductsToBeAdded);
    }
    if (onLikedProductsToBeAdded.length > 0 && toggle_like) {
        // sendToBackground("onLikedProductsToBeAdded", onLikedProductsToBeAdded);
        console.log("about to send to background the liked products", onLikedProductsToBeAdded)
    }
},
    7000); //update every 7 sec

function sendToBackground(eventName, eventData, callback) {
    console.log("sending to background.");
    chrome.runtime.sendMessage({ type: eventName, data: eventData },
        function (response) {
            console.log('this is the response from the background page for the ' + eventName + ' Event: ', response);
            if (response.status === 200) {
                console.log("add_product succeeded.", response.data);
                onBoughtProductsToBeAdded = []; //clear
            } else {
                console.log("add_product failed.", response.data);
            }

        }
    );
}


console.log("================================================================================================");
