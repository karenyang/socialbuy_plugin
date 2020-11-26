import React, {
    Component
} from 'react';

import {
    Grid,
    Typography,
    Divider,
    CardActionArea,
    CardContent,
} from '@material-ui/core';


class OthersProductCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: this.props.product,
        }
        console.log("OthersProductCard state: ", this.state);
    }


    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    onClickProduct(product) {
        if (this.props.onClickProduct !== undefined) {
            console.log("HIIIIIIII")
            this.props.onClickProduct(product);
        }
        else {
            console.log("product clicked.", product.product_title);
            chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
                function (res) {
                    console.log("Page opened for product: ", product.product_title);
                }
            );
        }

    }

    render() {
        const product = this.state.product;
        return (
            <div key={product._id} style={{ padding: "5px", display: "flex", alignItems: "center" }}>
                <Grid container spacing={0}  >
                    <Grid item xs={12}>
                        <CardActionArea style={{ display: "flex" }} onClick={() => { this.onClickProduct(product) }}>
                            <Grid container spacing={0}  >
                                <Grid item xs={4}>
                                    <img alt={product.product_title} src={product.product_imgurl} style={{ maxWidth: "100px", maxHeight: "100px" }} />
                                </Grid>
                                <Grid item xs={8}>
                                    <CardContent >
                                        <Typography gutterBottom variant="body2" component="h5">
                                            {this.cropTitle(product.product_title)}
                                        </Typography>

                                        {/* <Typography variant="body2" color="textSecondary" component="p">
                                            ${product.product_cost}
                                        </Typography> */}

                                        {product.friends_bought_list.length > 0 &&
                                            <Typography variant="body2" color="textSecondary" component="p" style={{ "fontSize": 12 }}>
                                                purchased by {product.friends_bought_list.map((friend) => { return friend.user_name }).join(", ")}
                                            </Typography>
                                        }

                                        {product.friends_liked_list.length > 0 &&
                                            <Typography variant="body2" color="textSecondary" component="p" style={{ "fontSize": 12 }}>
                                                liked by {product.friends_liked_list.map((friend) => { return friend.user_name }).join(", ")}
                                            </Typography>
                                        }

                                    </CardContent>
                                </Grid>

                            </Grid>

                        </CardActionArea>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider variant="middle" />
                    </Grid>
                </Grid>

            </div>
        )
    }
}

export default OthersProductCard;
