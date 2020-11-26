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


if (userInfo !== null) {
    console.log("grabbing friend requests.")
    axios.get(DOMAIN + 'receivedfriendrequests/' + userInfo.user_id)
        .then(res => {
            printResponse('onLoadFriendRequestsList', res);
            const friend_requests = res.data.received_friend_requests;
            num_requests = friend_requests.length;
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


chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (userInfo == null) {
            userInfo = getStorageItem('user');
        }
        switch (message.type) {
            case "onPopupInit":
                console.log("onPopupInit");
                sendResponse(userInfo);
                if (userInfo !== undefined) {
                    axios.get(DOMAIN + 'receivedfriendrequests/' + userInfo.user_id)
                        .then(res => {
                            printResponse('onLoadFriendRequestsList', res);
                            const friend_requests = res.data.received_friend_requests;
                            num_requests = friend_requests.length;
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
                        num_requests = friend_requests.length;
                        console.log("there are friend requests:", num_requests, friend_requests);
                        if (num_requests > 0) {
                            chrome.browserAction.setBadgeText({ text: num_requests.toString() });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                return true;

            case "onFacebookLogin":
                console.log("About to onFacebookLogin", message.data);
                const fb_access_token = message.data.fb_access_token;
                if (fb_access_token !== undefined) {
                    window.localStorage.setItem("FB_access_token", fb_access_token);
                    const get_user_info = "https://graph.facebook.com/me?fields=name,email,picture&access_token=" + fb_access_token;
                    axios.get(get_user_info)
                        .then(res => {
                            console.log('get_user_info from fb_access_token', res.data);
                            let request = {
                                email: res.data.email ? res.data.email : "",
                                fb_id: res.data.id,
                                fb_access_token: fb_access_token,
                                user_name: res.data.name,
                                profile_img: res.data.picture.data.url,
                            };
                            console.log('request:', request);


                            axios.post(DOMAIN + 'admin/fblogin', request, {
                                headers: {
                                    'content-type': 'application/json',
                                }
                            })
                                .then(res => {
                                    userInfo = null;
                                    window.localStorage.clear();
                                    printResponse('onFacebookLogin', res);
                                    setStorageItem('user', res.data);
                                    sendResponse(res);
                                    // upon login, check whether there are new friend requests.
                                    let friend_requests = res.data.received_friend_requests;
                                    num_requests = friend_requests.length;
                                    console.log("there are friend requests:", num_requests, friend_requests);
                                    if (num_requests > 0) {
                                        chrome.browserAction.setBadgeText({ text: num_requests.toString() });
                                    }
                                    return true;
                                })
                                .catch(err => {
                                    console.error(err);
                                })
                        })
                        .catch(err => {
                            console.error(err)
                        });

                }

                return true;

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
                console.log("Background about to Delete Self Liked Product: ", message.data);
                let request = { "product_id": message.data };
                if (message.data.includes("https://wwww")) {
                    request = { "product_link": message.data };
                }
                if (userInfo === null || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post(DOMAIN + 'delete_liked_product/' + userInfo.user_id, request)
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
                    axios.get(DOMAIN + 'friendslist/' + userInfo.user_id)
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

function getStorageItem(message_type) {
    return JSON.parse(window.localStorage.getItem(message_type));
}
