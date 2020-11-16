import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Paper,
    Divider,
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import "./recommendationpage.css"
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';


const icon_url = "https://lh3.googleusercontent.com/1IJ60N360-Z6JxbS77UnKYPug2JmjXd40vX0-PRkT1VbjB4GGxLF1gfXMCiPs09Hj-2Lfo8=s85";

class RecommendationBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            close: false,
        }
    }

    componentDidMount = () => {
        console.log("RecommendationBox: this.props", this.props);
        this.setState({
            products: this.props.recommendated_products,
        });

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
        if (this.state.close) {
            return {};
        }
        return (
            <div style={{ display: "inline-block", position: "fixed", top: "5px", right: "50px", margin: "0px", zIndex: 285, backgroundColor: "white" }} >
                <Paper style={{ maxHeight: 420, width: 300, overflow: 'auto' }}>
                    <Grid container spacing={0} justify="center">
                        <Grid item xs={3}>
                            <img src={icon_url} alt="icon" width="32" height="32" style={{ padding: 5 }} />
                        </Grid>
                        <Grid item xs={7}>
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton
                                onClick={() => this.setState({close: true})}
                            >
                                <CloseIcon style={{ fontSize: 15 }} />
                            </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h1" style={{ "fontSize": 16, "paddingTop": 5, "paddingBottom": 5 }}>
                                Endorsed by friends
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            {
                                this.state.products.map((product) => (
                                    <div style={{ padding: "10px" }}>
                                        <Grid container spacing={2}  >
                                            <Grid item xs={5}>
                                                <CardActionArea>
                                                    <img className="productimage" alt={product.product_title} src={product.product_imgurl} onClick={() => { this.onClickProduct(product) }} />
                                                </CardActionArea>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <CardContent style={{ padding: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Typography gutterBottom variant="body2" component="h5" style={{ "fontSize": 12 }}>
                                                        {this.cropTitle(product.product_title)}
                                                    </Typography>

                                                    <Typography variant="body2" color="textSecondary" component="p" style={{ "fontSize": 10 }}>
                                                        ${product.product_cost}
                                                    </Typography>

                                                    {product.friends_bought_list.length > 0  && 
                                                    <Typography variant="body2" color="textSecondary" component="p" style={{ "fontSize": 10 }}>
                                                        purchased by {product.friends_bought_list.map((friend) => { return friend.user_name}).join(", ")}
                                                    </Typography>
                                                }

                                                { product.friends_liked_list.length > 0  && 
                                                    <Typography variant="body2" color="textSecondary" component="p" style={{ "fontSize": 10 }}>
                                                        liked by {product.friends_liked_list.map((friend) => { return friend.user_name}).join(", ")}
                                                    </Typography>
                                                }
                                                </CardContent>
                                            </Grid>
                                        </Grid>
                                        <Divider variant="inset" />
                                    </div>
                                ))
                            }
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

export default RecommendationBox;