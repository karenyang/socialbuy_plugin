import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import axios from "axios";
// import { response } from 'express';


console.log('This is the background page.');

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        switch (message.type) {
            case "onPopupInit":
                axios.get('http://localhost:8080/user/info').then(
                    res => {
                        if (res.status === 200 && res.data.user_id !== "") {
                            console.log("Already logged in. server response data: ", res.data, res.data.user_name, res.data.user_id);
                            sendResponse(res);
                        } else {
                            console.log(res);
                            sendResponse(res);
                        }
                    }).catch(
                        error => {
                            console.log(error);
                        });
                return true;
            case "onRegister":
                console.log("About to register: ", message.data);
                axios.post('http://localhost:8080/admin/register', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        console.log('Background onRegister receives reply from server: ', res.data);
                        if (res.status === 200) {
                            console.log("Registered succeeded. Proceed.");
                            sendResponse(res);
                        } else {
                            console.error(res);
                            sendResponse(res);
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    })
                return true;
            case "onLogin":
                console.log("About to register: ", message.data);
                axios.post('http://localhost:8080/admin/login', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        console.log('Background onLogin receives reply from server: ', res.data);
                        if (res.status === 200) {
                            console.log("Login succeeded. Proceed.");
                            sendResponse(res);
                        } else {
                            console.error(res);
                            sendResponse(res);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                return true;
            case 'productsToBeAdded':
                console.log("Background about to send product data to background: ", message.data);
                axios.post('http://localhost:8080/user/add_products', message.data, {
                    headers: {
                        'content-type': 'application/json',
                    }
                })
                    .then(res => {
                        if (res.status === 200) {
                            console.log("background successfully sent product data to database, ", res.data);
                            sendResponse(res);
                        }
                        else {
                            console.error("background failed to sent product data to database, ", res.data);
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    });
                return true;
            default:
                console.log('couldnt find matching case');
        }
    },
);




// function setStorageItem(varName, data) {
//     console.log('varName: ', varName);
//     if (varName !== 'searchPageData') {
//         console.log('data', data);
//         window.localStorage.setItem(varName, JSON.stringify(data));
//     }
// }

// function getStorageItem(varName) {
//     return JSON.parse(localStorage.getItem(varName));
// }
