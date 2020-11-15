import React, {
    Component
} from 'react';

import {
    Grid,
    Typography,
    Divider,
    CardActionArea,
    CardContent,
    IconButton,
    CardActions,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';


// my product card is relatively simpler than others' product card. You might not need to see the price, but and you have the right to delete, and {future} see how much influence you have
class OthersProductCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: this.props.product,
            delete_func: this.props.delete_func,
        }
        console.log(this.state);
    }

    onDelete(product_id) {
        this.props.delete_func(product_id);
    }

    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    onClickProduct(product) {
        console.log("product clicked.", product.product_title);
        chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
            function (res) {
                console.log("Page opened for product: ", product.product_title);
            }
        );
    }

    render() {
        const product = this.state.product;
        return (
            <div key={product._id} style={{ padding: "5px", displya:"flex", alignItems: "center"}}>
                <Grid container spacing={2}  >
                    <Grid item xs={4}>
                        <CardActionArea>
                            <img alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                        </CardActionArea>
                    </Grid>
                    <Grid item xs={7}>
                        <CardContent >
                            <Typography gutterBottom variant="body2" component="h5">
                                {this.cropTitle(product.product_title)}
                            </Typography>

                            <Typography variant="body2" color="textSecondary" component="p">
                                ${product.product_cost}
                            </Typography>

                            {product.friends_bought.length > 0 &&
                                <Typography variant="body2" color="textSecondary" component="p">
                                    purchased by {product.friends_bought.join(', ')}
                                </Typography>
                            }

                            {product.friends_liked.length > 0 &&
                                <Typography variant="body2" color="textSecondary" component="p">
                                    liked by {product.friends_liked.join(', ')}
                                </Typography>
                            }
                        </CardContent>
                    </Grid>
                </Grid>
                <Divider />
            </div>
        )
    }
}

export default OthersProductCard;
