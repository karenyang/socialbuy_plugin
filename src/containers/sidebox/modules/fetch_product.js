import axios from 'axios';


var url = window.location.href;

function fetchLikedProductInfo() {
    let item = {};

    if (url.includes('amazon.com/')) {
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
                    console.log("Just finished grabbing liked product: ", item);
                })
            .catch(
                error => {
                    console.log(error);
                });
            console.log("Returning item product: ", item);
            return item;

    }
}

export default fetchLikedProductInfo;
