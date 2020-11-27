import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import axios from "axios";


console.log("Process ENV", process.env.NODE_ENV);
const DOMAIN = process.env.NODE_ENV === "production" ? "http://ec2-54-153-92-137.us-west-1.compute.amazonaws.com:8080/" : "http://localhost:8080/";
const TASTEMAKER_URL = "https://tastemaker.mailchimpsites.com/";
console.log('DOMAIN: ', DOMAIN);
let num_requests = 0;
let userInfo = getStorageItem('user');
console.log('INITIAL getStorageItem user: ', userInfo);
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });


console.log("Done Creating Google Analytics .... ");

if (userInfo !== null) {
    console.log("grabbing friend requests.")
    axios.get(DOMAIN + 'receivedfriendrequests/' + userInfo.user_id)
        .then(res => {
            printResponse('onLoadFriendRequestsList', res);
            const friend_requests = res.data.received_friend_requests;
            num_requests = friend_requests !== undefined ? friend_requests.length : num_requests;
            console.log("there are friend request:", num_requests, friend_requests);
            if (num_requests > 0) {
                chrome.browserAction.setBadgeText({ text: num_requests.toString() });
            } else {
                chrome.browserAction.setBadgeText({ text: "" });
            }
        })
        .catch(err => {
            console.error(err)
        });
}

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-184044017-1', 'auto');
ga('set', 'checkProtocolTask', null);
// ga('send', 'pageview', "userinfo_page");

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete') {
//         chrome.tabs.query({ active: true }, function (tabs) {
//             const msg = "URL changes notice from background.";
//             chrome.tabs.sendMessage(tabs[0].id, { type: "onTabChange", data: msg });
//         })
//     }
// });


chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (userInfo == null) {
            userInfo = getStorageItem('user');
        }
        switch (message.type) {
            case "onGAEvent":
                console.log("onGAEvent", message.data);
                ga("send", "event", message.data.category, message.data.action, message.data.tag);
                return true;

            case "onPopupInit":
                console.log("onPopupInit");
                sendResponse(userInfo);
                if (userInfo !== undefined) {
                    axios.get(DOMAIN + 'receivedfriendrequests/' + userInfo.user_id)
                        .then(res => {
                            printResponse('onLoadFriendRequestsList', res);
                            const friend_requests = res.data.received_friend_requests;
                            num_requests = friend_requests !== undefined ? friend_requests.length : num_requests;
                            console.log("there are friend request:", num_requests, friend_requests);
                            if (num_requests > 0) {
                                chrome.browserAction.setBadgeText({ text: num_requests.toString() });
                            } else {
                                chrome.browserAction.setBadgeText({ text: "" });
                            }
                        })
                        .catch(err => {
                            console.error(err)
                        });
                    return true;
                }


            case "onRegister":
                console.log("About to register: ", message.data);
                axios.post(DOMAIN + 'admin/register', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        printResponse('onRegister', res);
                        sendResponse(res);
                    })
                    .catch(err => {
                        console.error(err)
                    })
                return true;

            case "onLogin":
                console.log("About to login: ", message.data);
                axios.post(DOMAIN + 'admin/login', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        userInfo = null;
                        window.localStorage.clear();
                        printResponse('onLogin', res);
                        setStorageItem('user', res.data);
                        sendResponse(res);
                        // upon login, check whether there are new friend requests.
                        let friend_requests = res.data.received_friend_requests;
                        num_requests = friend_requests !== undefined ? friend_requests.length : num_requests;
                        console.log("there are friend requests:", num_requests, friend_requests);
                        if (num_requests > 0) {
                            chrome.browserAction.setBadgeText({ text: num_requests.toString() });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                return true;

            // case "onFacebookLogin":
            //     console.log("About to onFacebookLogin", message.data);
            //     const fb_access_token = message.data.fb_access_token;
            //     if (fb_access_token !== undefined) {
            //         window.localStorage.setItem("FB_access_token", fb_access_token);
            //         const get_user_info = "https://graph.facebook.com/me?fields=name,email,picture&access_token=" + fb_access_token;
            //         axios.get(get_user_info)
            //             .then(res => {
            //                 console.log('get_user_info from fb_access_token', res.data);
            //                 let request = {
            //                     email: res.data.email ? res.data.email : "",
            //                     fb_id: res.data.id,
            //                     fb_access_token: fb_access_token,
            //                     user_name: res.data.name,
            //                     profile_img: res.data.picture.data.url,
            //                 };
            //                 console.log('request:', request);


            //                 axios.post(DOMAIN + 'admin/fblogin', request, {
            //                     headers: {
            //                         'content-type': 'application/json',
            //                     }
            //                 })
            //                     .then(res => {
            //                         userInfo = null;
            //                         window.localStorage.clear();
            //                         printResponse('onFacebookLogin', res);
            //                         setStorageItem('user', res.data);
            //                         sendResponse(res);
            //                         // upon login, check whether there are new friend requests.
            //                         let friend_requests = res.data.received_friend_requests;
            //                         num_requests = friend_requests !== undefined ? friend_requests.length : num_requests;
            //                         console.log("there are friend requests:", num_requests, friend_requests);
            //                         if (num_requests > 0) {
            //                             chrome.browserAction.setBadgeText({ text: num_requests.toString() });
            //                         }
            //                         return true;
            //                     })
            //                     .catch(err => {
            //                         console.error(err);
            //                     })
            //             })
            //             .catch(err => {
            //                 console.error(err)
            //             });

            //     }

            //     return true;

            case "onLogout":
                axios.post(DOMAIN + 'admin/logout')
                    .then(res => {
                        printResponse('onLogout', res);
                        sendResponse(res);
                        window.localStorage.clear();
                        userInfo = null;
                        num_requests = 0;
                        chrome.browserAction.setBadgeText({ text: "" });

                    })
                    .catch(err => {
                        console.error(err)
                    })
                return true;

            case "onLoadUserInfo":
                console.log("Background about to get onLoadUserInfo data from background: ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    let user_id = userInfo.user_id;
                    let friend_id = "";
                    if (message.data) { //if specify a different user_id than self
                        friend_id = message.data;
                    }
                    axios.get(DOMAIN + 'userinfo/' + user_id + "/" + friend_id)
                        .then(res => {
                            printResponse('onLoadUserInfo', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onUploadUserInfo":
                console.log("Background about to get onLoadUserInfo data from background: ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    let user_id = userInfo.user_id;
                    axios.post(DOMAIN + 'userinfo/' + user_id, message.data, {
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                        .then(res => {
                            printResponse('onLoadUserInfo', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case 'onBoughtProductsToBeAdded':
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("ChoiceBox about to send product data to background: ", message.data);
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'add_bought_products/' + userInfo.user_id, message.data, {
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                        .then(res => {
                            printResponse('onBoughtProductsToBeAdded', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLikedProductsToBeAdded":
                console.log("Background about to Handle onLikedProductsToBeAdded. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("Background about to send product data to background: ", message.data);
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'add_liked_products/' + userInfo.user_id, message.data, {
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                        .then(res => {
                            printResponse('onLikedProductsToBeAdded', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLoadUserBoughtProductList":
                console.log("Background about to get LoadSelfProductList data from background: ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    let user_id = userInfo.user_id;
                    if (message.data) { //if specify a different user_id than self
                        user_id = message.data;
                    }
                    axios.get(DOMAIN + 'user_bought_product_list/' + user_id)
                        .then(res => {
                            printResponse('onLoadUserBoughtProductList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLoadUserLikedProductList":
                console.log("Background about to get onLoadUserLikedProductList data from background: ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    let user_id = userInfo.user_id;
                    if (message.data) { //if specify a different user_id than self
                        user_id = message.data;
                    }
                    axios.get(DOMAIN + 'user_liked_product_list/' + user_id)
                        .then(res => {
                            printResponse('onLoadUserLikedProductList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onClickProduct":
                console.log("Background about to open a new tab: ", message.data);
                chrome.tabs.create({ url: message.data });
                return true;

            case "onClickApp":
                console.log("Background about to open app in a tab: ", TASTEMAKER_URL);
                chrome.tabs.create({ url: TASTEMAKER_URL });
                return true;

            case "onDeleteSelfBoughtProduct":

                console.log("Background about to Delete Self Bought Product: ", message.data);
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'delete_bought_product/' + userInfo.user_id, { "product_id": message.data })
                        .then(res => {
                            printResponse('onDeleteSelfBoughtProduct', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onDeleteSelfLikedProduct":
                console.log("Background about to Delete Self Liked Product: with message data", message.data);

                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    console.log("delete_liked_product with reqeust", message.data);
                    axios.post(DOMAIN + 'delete_liked_product/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onDeleteSelfLikedProduct', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onHandleSearch":
                console.log("Background about to Handle Search: ", message.data);
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'search/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onHandleSearch', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onRequestFriend":
                console.log("Background about to Handle onRequestFriend: ", message.data);
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'requestfriend/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onRequestFriend', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLoadFriendsList":
                console.log("Background about to Handle onLoadFriendsList. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    let user_id = userInfo.user_id;
                    if (message.data) { //if specify a different user_id than self
                        user_id = message.data;
                    }
                    axios.get(DOMAIN + 'friendslist/' + user_id)
                        .then(res => {
                            printResponse('onLoadFriendsList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLoadFriendRequestsList":
                console.log("Background about to Handle onLoadFriendRequestsList. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.get(DOMAIN + 'receivedfriendrequests/' + userInfo.user_id)
                        .then(res => {
                            printResponse('onLoadFriendRequestsList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onLoadFriendsProductList":
                console.log("Background about to Handle onLoadFriendsProductList. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.get(DOMAIN + 'friends_productlist/' + userInfo.user_id)
                        .then(res => {
                            printResponse('onLoadFriendsProductList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onHandleFriendRequest":
                console.log("Background about to Handle onHandleFriendRequest. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'respondfriendrequest/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onHandleFriendRequest', res);
                            sendResponse(res);
                            num_requests = num_requests - 1;
                            if (num_requests > 0) {
                                chrome.browserAction.setBadgeText({ text: num_requests.toString() });
                            } else {
                                chrome.browserAction.setBadgeText({ text: "" });
                            }
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onDeleteFriend":
                console.log("Background about to Handle onDeleteFriend. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'deletefriend/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onDeleteFriend', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onUnfollowFriend":
                console.log("Background about to Handle onUnfollowFriend. ");
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not lpogged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'unfollowfriend/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onUnfollowFriend', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onHandleProductsInCart":
                axios.get(message.data)
                    .then(res => {
                        let page = document.createElement('html');
                        page.innerHTML = res.data;
                        console.log("Grabbing all products in cart...");
                        let domain = "www.amazon.com";
                        let img_query_string = " > div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a";
                        let content = page.querySelectorAll("#activeCartViewForm > div.a-row.a-spacing-mini.sc-list-body.sc-java-remote-feature >  div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
                        console.log('content ', content);

                        let scrap_product_pages_promises = [];
                        let products = [];
                        let items = [];
                        for (let i = 0; i < content.length - 1; i++) { //content.length - 1 because last block is alexa ads
                            let product = content[i];
                            let cleanedUpValues = product.innerText.split(/\n+/).map(p => p.trim()).filter(Boolean);
                            // cleanedUpValues = cleanedUpValues.filter(p => p.trim().length !== 0).map;
                            console.log("cleanedUpValues", cleanedUpValues);

                            let item = {};
                            item.product_title = cleanedUpValues[0];

                            //console.log("product_title: ", item.product_title)
                            let cost_str = cleanedUpValues.filter(value => value.startsWith("$"))[0];
                            cost_str = cost_str.substring(1);
                            item.product_cost = parseFloat(cost_str);
                            console.log("product_cost: ", item.product_cost);

                            let img = page.querySelector("#" + product.id + img_query_string);
                            item.product_link = "https://" + domain + img.getAttribute("href");
                            if (item.product_link.includes("ref=")) {
                                item.product_link = item.product_link.split('ref=')[0];
                            }
                            console.log("product_link:  ", item.product_link);
                            item.product_imgurl = img.firstElementChild.getAttribute("src");
                            console.log("product_imgurl:  ", item.product_imgurl);
                            item.product_by = "Amazon";
                            items.push(item);
                            scrap_product_pages_promises.push(axios.get(item.product_link));
                        }
                        Promise.all(scrap_product_pages_promises).then((responses) => {
                            console.log("responses: ", responses.length);
                            for (let i = 0; i < responses.length; i++) {
                                products.push(fetchMoreBoughtProductInfoFromCart(responses[i], items[i]));
                            }
                            setStorageItem("soonWillBuyProducts", products);
                            sendResponse("success");
                        });
                    });
                return true;

            case "onClickBuyNow":
                axios.get(message.data)
                    .then(res => {
                        let item = fetchProductInfoFromPage(res);
                        if (!getStorageItem("LastPurchase").includes(item)) {
                            setStorageItem("LastPurchase", [item]);
                        }
                        sendResponse(item);
                    });
                return true;

            case "onClickAddToCart":
                axios.get(message.data)
                    .then(res => {
                        let item = fetchProductInfoFromPage(res);
                        if (!getStorageItem("soonWillBuyProducts").includes(item)) {
                            appendStorageItem("soonWillBuyProducts", [item]);
                        }
                        sendResponse(getStorageItem("soonWillBuyProducts"));
                    });
                return true;

            case "onClickPlaceOrder":
                axios.get(message.data)
                    .then(res => {
                        console.log("res", res);
                        fetchPreCheckoutProducts(res);
                        sendResponse(getStorageItem("LastPurchase"));
                    });
                return true;

            case "onPurchaseDone":
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                }
                console.log("onPurchaseDone received");
                let items = getStorageItem("LastPurchase");
                sendResponse(items);
                return true;

            default:
                console.log('couldnt find matching case for ', message.type);
        }
    },
);


function printResponse(message_type, res) {
    console.log("Background case " + message_type + " receives reply from server: ", res.data);
    if (res.status === 200) {
        console.log(message_type + " succeeded. Proceed.");
    } else {
        console.error(res);
    }
}

function setStorageItem(message_type, data) {
    console.log("setStorage", message_type, ":", data);
    window.localStorage.setItem(message_type, JSON.stringify(data));
}
function appendStorageItem(message_type, data) {
    console.log("appendStorageItem", message_type, " + ", data);
    let list = getStorageItem(message_type);
    list = list.concat(data);
    setStorageItem(message_type, list);
    console.log("appendStorageItem", message_type, " -> ", list);
}


function getStorageItem(message_type) {
    if (message_type == "LastPurchase" || message_type === "soonWillBuyProducts") {
        if (window.localStorage.getItem(message_type) === null || window.localStorage.getItem(message_type) === undefined) {
            return [];
        }
    }
    return JSON.parse(window.localStorage.getItem(message_type));
}

function fetchPreCheckoutProducts(res) {
    console.log("fetchPreCheckoutProducts ...");
    let page = document.createElement('html');
    page.innerHTML = res.data;
    const soonWillBuyProducts = getStorageItem("soonWillBuyProducts");
    //console.log("soonWillBuyProducts BEFORE", soonWillBuyProducts);
    let products_checkout = page.querySelectorAll("#spc-orders > div > div > div.a-row.shipment > div > div > div > div> div > div > div.a-row > div > div > div.a-fixed-left-grid-col.item-details-right-column.a-col-right > div.a-row.breakword > span");
    let items = [];
    if (products_checkout !== null && products_checkout !== []) {
        let product_names = [];
        product_names = Array.from(products_checkout).map((a) => a.innerText.trim());
        //console.log("product_names: ", product_names);
        if (product_names.length > 0) {
            for (let i = 0; i < soonWillBuyProducts.length; i++) {
                for (let j = 0; j < product_names.length; j++) {
                    if (product_names[j].includes(soonWillBuyProducts[i].product_title.substring(0, 40))) {
                        items.push(soonWillBuyProducts[i]);
                        console.log("Data added:", soonWillBuyProducts[i].product_title)
                    }
                }
            }
        }
    }
    setStorageItem("LastPurchase", items);
    setStorageItem("soonWillBuyProducts", []);
}

function fetchProductInfoFromPage(res) {
    console.log("fetchProductInfoFromPage ...");
    let item = {}
    let page = document.createElement('html');
    page.innerHTML = res.data;
    item.product_title = page.querySelector("#productTitle").innerText.trim();
    //console.log("product_title: ", item.product_title)
    let cost_str = "";
    if (page.querySelector("#priceblock_dealprice") !== null) {
        cost_str = page.querySelector("#priceblock_dealprice").innerText;
    } else if (page.querySelector("#priceblock_saleprice") !== null) {
        cost_str = page.querySelector("#priceblock_saleprice").innerText;
    } else if (page.querySelector("#priceblock_ourprice") !== null) {
        cost_str = page.querySelector("#priceblock_ourprice").innerText;
    } else if (page.querySelector("#price") !== null) {
        cost_str = page.querySelector("#price").innerText;
    }

    cost_str = cost_str.substring(1);
    item.product_cost = parseFloat(cost_str);
    //console.log("product_cost: ", item.product_cost);
    item.product_link = res.config.url;
    if (item.product_link.includes("ref=")) {
        item.product_link = item.product_link.split('ref=')[0];
    }
    //console.log("product_link:  ", item.product_link);

    let img_element = page.querySelector("#main-image-container > ul > li.image.item.itemNo0.maintain-height.selected > span > span > div > img");
    if (img_element != null) {
        item.product_imgurl = img_element.src;
    } else if (page.querySelector("#imgBlkFront") != null) {
        img_element = page.querySelector("#imgBlkFront");
        item.product_imgurl = img_element.src;
    } else {
        img_element = page.getElementsByClassName('a-dynamic-image')[0];
        item.product_imgurl = img_element.src;
    }

    //console.log("product_imgurl:  ", item.product_imgurl);
    item.product_by = "Amazon";

    let summary_list = page.querySelectorAll("#feature-bullets > ul > li > span");
    let product_summary = "";
    for (let i = 0; i < summary_list.length; i++) {
        if (!summary_list[i].innerHTML.includes("</")) {
            product_summary = product_summary.concat(summary_list[i].innerHTML.trim());
        }
    }
    item.product_summary = product_summary;
    //console.log("product_summary: ", product_summary);
    let variation_imgs = page.querySelectorAll("button > div > div > img");
    let product_variation_names = [];
    let product_variation_imgurls = [];
    for (let i = 0; i < variation_imgs.length; i++) {
        let imgurl = variation_imgs[i].getAttribute('src');
        let name = variation_imgs[i].getAttribute('alt');
        product_variation_names.push(name);
        product_variation_imgurls.push(imgurl);
    }
    //console.log('product_variations: ',product_variations);
    item.product_variation_names = product_variation_names;
    item.product_variation_imgurls = product_variation_imgurls;
    //console.log("Just finished grabbing product info: ", item);
    return item;
}

function fetchMoreBoughtProductInfoFromCart(response, item) {
    let page = document.createElement('html');
    page.innerHTML = response.data;
    let summary_list = page.querySelectorAll("#feature-bullets > ul > li > span");
    let product_summary = "";
    for (let i = 0; i < summary_list.length; i++) {
        if (!summary_list[i].innerHTML.includes("</")) {
            product_summary = product_summary.concat(summary_list[i].innerHTML);
        }
    }
    //console.log("item", item);
    item.product_summary = product_summary;
    //console.log("product_summary: ", product_summary);
    let variation_imgs = page.querySelectorAll("button > div > div > img");
    let product_variation_names = [];
    let product_variation_imgurls = [];
    for (let i = 0; i < variation_imgs.length; i++) {
        let imgurl = variation_imgs[i].getAttribute('src');
        let name = variation_imgs[i].getAttribute('alt');
        product_variation_names.push(name);
        product_variation_imgurls.push(imgurl);
    }
    //console.log('product_variations: ', product_variation_names);
    item.product_variation_names = product_variation_names;
    item.product_variation_imgurls = product_variation_imgurls;
    return item;

}
