import axios from 'axios';
import './content.styles.css';

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
    img.width = 56 ;
    img.height = 56;
    img.style.position = "relative";

    img.alt = "icon img";
    
    img.style.zIndex = 288;
    img.style.transition = "transform 0.3s";
    img.style.transitionTimingFunction = "ease-in-out";

    let imgContainer = document.createElement("div");
    imgContainer.className = "imgcontainer"
    imgContainer.style.display = "inline-block";
    imgContainer.style.position = "fixed";
    imgContainer.style.top = "200px";
    imgContainer.style.right = "0px";
    imgContainer.style.margin = "0px";
    imgContainer.style.background = 'white';

    imgContainer.appendChild(img);

    let hiddenbox = document.createElement("div");
    
    let likeicon = document.createElement("img");
    likeicon.src = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg";
    likeicon.width = 40;
    likeicon.height = 40;
    likeicon.style.position = "absolute";
    likeicon.style.top = "0px";
    likeicon.style.right = "8px";
    likeicon.style.margin = "0px";
    likeicon.style.backgroundColor = "white";
    likeicon.opacity = 0.5;
    likeicon.style.zIndex = 285;
    hiddenbox.append(likeicon);

    let imgLabel =  document.createElement("p");
    imgLabel.innerText = "Like";
    imgLabel.style.color = "pink";
    imgLabel.style.fontSize = "10px";
    imgLabel.style.position = "absolute";
    imgLabel.style.top = "35px";
    imgLabel.style.right = "18px";
    imgLabel.style.margin = "0px";
    imgLabel.style.zIndex = 286;

    hiddenbox.append(imgLabel);

    imgContainer.appendChild(hiddenbox);

    
    imgContainer.addEventListener("mouseover",function(){
        img.style.transform = "translate(-50px, 0px)";  
        this.style.cursor = 'pointer';
    });

    imgContainer.addEventListener("click", function(){
        if (toggle_like){
            likeicon.src = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg"; //pink
            imgLabel.innerText = "Like";
            imgLabel.style.color = "pink";
            imgLabel.style.right = "18px";
        } else {
            likeicon.src = "https://crissov.github.io/unicode-proposals/img/2764_emojitwo.svg"; //red
            imgLabel.innerText = "Added";
            imgLabel.style.color = "#FFE4E1";
            imgLabel.style.right = "12px";
            fetchLikedProductInfo();
        }
        toggle_like = !toggle_like;

        console.log("Do I like it? ", toggle_like);
                
    });
    

    imgContainer.addEventListener("mouseleave",function(){
        img.style.transform = "translate(0px, 0px)";
    });

    imgContainer.appendChild(imgLabel);
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
