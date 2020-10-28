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
                        } else{
                            console.log(res);
                            sendResponse(res);
                        }
                    }).catch(
                        error => {
                            console.log(error);
                        });
                return true;
                break;
            case 'productsToBeAdded':
                console.log("Background about to send product data to background: ", message.data);
                let request = {
                    data: message.data,
                };
                axios.post('http://localhost:8080/user/add_products', request, {
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
            break;
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
