import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import axios from "axios";
// import { response } from 'express';


console.log('This is the background page.');

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        let userInfo = getStorageItem('user');
        console.log('getStorageItem user: ', userInfo);
        switch (message.type) {
            case "onPopupInit":
                sendResponse(userInfo);
                return true;

            case "onRegister":
                console.log("About to register: ", message.data);
                axios.post('http://localhost:8080/admin/register', message.data, {
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
                axios.post('http://localhost:8080/admin/login', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        window.localStorage.clear();
                        printResponse('onLogin', res);
                        setStorageItem('user', res.data);
                        sendResponse(res);
                    })
                    .catch(err => {
                        console.error(err);
                    })
                return true;

            case "onLogout":
                axios.post('http://localhost:8080/admin/logout')
                    .then(res => {
                        printResponse('onLogout', res);
                        sendResponse(res);
                    })
                    .catch(err => {
                        console.error(err)
                    })
                window.localStorage.clear();
                return true;

            case 'productsToBeAdded':
                if (userInfo === undefined || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("Background about to send product data to background: ", message.data);
                    console.log("current user id", userInfo.user_id);
                    axios.post('http://localhost:8080/add_products/' + userInfo.user_id, message.data, {
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                        .then(res => {
                            printResponse('productsToBeAdded', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;
            case "onLoadSelfProductList":
                console.log("Background about to get LoadSelfProductList data from background: ");
                if (userInfo === undefined || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);

                    axios.get('http://localhost:8080/user_productlist/' + userInfo.user_id)
                        .then(res => {
                            printResponse('onLoadSelfProductList', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;
            case "onClickProduct":
                console.log("Background about to open a new tab: ", message.data);
                chrome.tabs.create({ url: "http://" + message.data });
                return true;

            case "onDeleteSelfProduct":
                console.log("Background about to Delete Self Product: ", message.data);
                if (userInfo === undefined || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post('http://localhost:8080/delete_product/' + userInfo.user_id, { "product_id": message.data })
                        .then(res => {
                            printResponse('onDeleteSelfProduct', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            case "onHandleSearch":
                console.log("Background about to Handle Search: ", message.data);
                if (userInfo === undefined || userInfo.user_id === undefined) {
                    console.log("User have not logged in");
                    sendResponse("User have not logged in");
                } else {
                    console.log("current user id", userInfo.user_id);
                    axios.post('http://localhost:8080/search/' + userInfo.user_id, message.data)
                        .then(res => {
                            printResponse('onHandleSearch', res);
                            sendResponse(res);
                        })
                        .catch(err => {
                            console.error(err)
                        });
                }
                return true;

            default:
                console.log('couldnt find matching case');
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
    console.log("setStorage", data);
    window.localStorage.setItem(message_type, JSON.stringify(data));
}

function getStorageItem(message_type) {
    return JSON.parse(window.localStorage.getItem(message_type));
}
