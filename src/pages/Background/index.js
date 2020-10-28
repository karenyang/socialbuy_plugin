import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';
import axios from "axios";


console.log('This is the background page.');

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        switch (message.type) {
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
                            console.log("background successfully sent product data to database, ", res.data );
                        }
                        else {
                            console.error("background failed to sent product data to database, ", res.data);
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    });
                break;
            default:
                console.log('couldnt find matching case');
        }
    },
);
