import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Paper,
    Divider,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import OthersProductCard from '../modules/others_product_card';


const icon_url = "https://i.ibb.co/1rgS6hX/icon-noborder.png"
class RecommendationBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: this.props.recommendated_products,
            close: false,
            search_key: this.props.search_key,
        }
    }

    componentDidMount = () => {
        chrome.runtime.sendMessage({ type: "onGAEvent", data: { "category": "RecommendationBox", "action": "Activated", "tag": this.state.search_key } },
            function (res) {
                if (res.status !== 200) {
                    console.error("onGAEvent failed.");
                }
            }
        );
    }
    onClickProduct = (product) => {
        chrome.runtime.sendMessage({ type: "onGAEvent", data: { "category": "RecommendationBox", "action": "ClickProduct", "tag": product.product_link } },
            function (res) {
                if (res.status !== 200) {
                    console.error("onGAEvent failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
            function (res) {
                console.log("Page opened for product: ", product.product_title);
            }
        );
    }

    render() {
        if (this.state.close) {
            return {};
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
                            Endorsed by friends
                        </Typography>
                        <Paper style={{ maxHeight: 400, width: 400, overflowY: 'auto', overflowX: "hidden", margin: 0 }}>
                            {
                                this.state.products.map((product) => (
                                    <OthersProductCard key={product._id} product={product} onClickProduct={this.onClickProduct}/>
                                ))
                            }
                        </Paper>
                    </Grid>
                </Grid>
            </ Paper>
        );
    }
}

export default RecommendationBox;