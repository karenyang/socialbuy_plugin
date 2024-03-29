import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Paper,
    Button,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import MyProductCard from '../modules/my_product_card';


const icon_url = "https://i.ibb.co/1rgS6hX/icon-noborder.png"
class ChoiceBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: this.props.products,
            close: false,
            shared_products: this.props.products, //initially everything is checked
        }

    }

    componentDidMount = () => {
        chrome.runtime.sendMessage({ type: "onGAEvent", data: { "category": "ChoiceBox", "action": "Activated", "tag": "none" } },
            function (res) {
                if (res.status !== 200) {
                    console.error("onGAEvent failed.");
                }
            }
        );
    }

    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    handleCheckBox = (product, checked) => {
        let action = checked ? "ProductUnCheck" : "ProductCheck"
        chrome.runtime.sendMessage({ type: "onGAEvent", data: { "category": "ChoiceBox", "action": action, "tag": product_link } },
            function (res) {
                if (res.status !== 200) {
                    console.error("onGAEvent failed.");
                }
            }
        )
        let new_shared_products = this.state.shared_products;
        // if it will be checked and not shared already,  share it.
        if (checked && !this.state.shared_products.includes(product)) {
            new_shared_products.push(product)
            this.setState({
                shared_products: new_shared_products
            })
        }
        // if it will be unchecked and shared already, unshare it.
        else if (!checked && this.state.shared_products.includes(product)) {
            let idx = new_shared_products.indexOf(product);
            new_shared_products.splice(idx, 1);
            this.setState({
                shared_products: new_shared_products
            })
        }
        console.log("updated shared_products", this.state.shared_products);
    }

    updateState = (name, value) => {
        this.setState({
            [name]: value,
        })
    }
    onClickShareButton = () => {
        chrome.runtime.sendMessage({ type: "onGAEvent", data: { "category": "ChoiceBox", "action": "SharePurchase", "tag": this.state.products.length.toString() } },
            function (res) {
                if (res.status !== 200) {
                    console.error("onGAEvent failed.");
                }
            }
        )
        // console.log("BEFORE: this.state.products", this.state.products);
        // console.log("BEFORE: this.state.shared_products", this.state.shared_products);


        const updateState = this.updateState;
        chrome.runtime.sendMessage({ type: "onBoughtProductsToBeAdded", data: this.state.shared_products},
            function (response) {
                console.log('this is the response from the background page for the onBoughtProductsToBeAdded Event: ', response);
                if (response.status === 200) {
                    console.log("onBoughtProductsToBeAdded succeeded.", response.data);
                    updateState("close", true);
                    window.localStorage.setItem("LastPurchase", []);
                } else {
                    console.log("onBoughtProductsToBeAdded failed.", response.data);
                }

            });
    }

    render() {
        if (this.state.close) {
            return null;
        }

        return (
            <Paper style={{
                padding: 2, margin: 'auto', display: "flex", alignItems: "center", zIndex: 285, maxWidth: 400,
                position: "fixed", top: "1px", right: "50px"
            }} >
                <Grid container spacing={0} alignItems="center" justify="center" >
                    <Grid item xs={2}>
                        <img src={icon_url} alt="icon" width="32" height="32" style={{ padding: 5 }} />
                    </Grid>
                    <Grid item xs={8}>
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton
                            onClick={() => this.setState({ close: true })}
                        >
                            <CloseIcon style={{ fontSize: 15 }} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Typography variant="h4" color="inherit" style={{ "fontSize": 16, "paddingTop": 5, "paddingBottom": 10 }}>
                            Share your purchases with friends
                        </Typography>
                        <Paper style={{ maxHeight: 400, width: 380, overflowY: 'auto', overflowX: "hidden", margin: 0 }}>
                            {
                                this.state.products.map((product) => (
                                    <MyProductCard key={product.product_link} product={product} is_bought={true} show_checkbox={true} checkbox_func={this.handleCheckBox} />
                                ))
                            }
                        </Paper>
                    </Grid>
                    <Grid item xs={12} align="center">
                        {!this.props.logged_in ?
                            <Typography gutterBottom variant="body2" component="h5" style={{marginTop: "10px", padding: "5px" }}>
                                To share your purchase, log into TasteMaker.
                            </Typography>
                            :
                            <Button variant="contained" color="primary" onClick={this.onClickShareButton} style={{ paddingLeft: 100, paddingRight: 100, margin: 20, textTransform: "none" }} >
                                Share
                            </Button>
                        }

                    </Grid>


                </Grid>
            </ Paper>
        );
    }
}

ChoiceBox.defaultProps = {
    logged_in: true,
    products: [],
};

export default ChoiceBox;