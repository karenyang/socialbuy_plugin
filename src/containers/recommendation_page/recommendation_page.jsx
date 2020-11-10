import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import DeleteIcon from '@material-ui/icons/Delete';

class RecommmendationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // user_name: this.props.user_name,
            // user_id: this.props.user_id,
            search_value: "",
            self_bought_product_list: [],
            friends_product_list: [],
            product_expanded: {},
            search_result: "",
            tab: 0,
        }
        console.log(this.state);
    }

    updateFriendsProductList = (friends_product_list) => {
        let product_expanded = [];
        let product_objs = [];
        let friends_bought = [];
        let friends_liked = [];
        for (let i = 0; i < friends_product_list.length; i++) {
            let product = friends_product_list[i].product;
            product.friends_bought = friends_product_list[i].bought;
            product.friends_liked = friends_product_list[i].liked;
            product_objs.push(product);
            product_expanded[product._id] = false;
        }
        this.setState({
            friends_product_list: product_objs,
            product_expanded: product_expanded,
        });
        console.log("State product list updated: ", this.state);

    }

    componentDidMount = () => {
        const updateFriendsProductList = this.updateFriendsProductList;
        chrome.runtime.sendMessage({ type: "onLoadFriendsProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadFriendsProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsProductList succeeded.");
                    updateFriendsProductList(res.data.friends_productlist);
                }
                else {
                    console.error(res.data + ", onLoadFriendsProductList failed.");
                }
            }
        );
    }

    onClickProduct(product) {
        console.log("product clicked.", product.product_title);
        chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
            function (res) {
                console.log("Page opened for product: ", product.title);
            }
        );
    }


    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    is_expanded = (product_id) => {
        return this.state.product_expanded[product_id];
    }

    onExpandClick(product_id) {
        console.log('Expand Clicked');
        let new_product_expanded = this.state.product_expanded;
        if (new_product_expanded[product_id] == true) {
            console.error("Should not be able to click expand is already expanded.");
        }
        new_product_expanded[product_id] = true; //toggle
        this.setState({
            product_expanded: new_product_expanded
        });
        console.log("state update to", this.state);
    }

    onCollapesClick(product_id) {
        console.log('Collapse Clicked');
        let new_product_expanded = this.state.product_expanded;
        if (new_product_expanded[product_id] == false) {
            console.error("Should not be able to click expand is already expanded.");
        }
        new_product_expanded[product_id] = false; //toggle
        this.setState({
            product_expanded: new_product_expanded
        });
        console.log("state update to", this.state);
    }

    handleInputChange = (event) => {
        const {
            value,
            name
        } = event.target;
        this.setState({
            [name]: value
        });
    }

    handleSearch = (event) => {
        if (event.key === 'Enter') {
            console.log('Searching for: ', event.target.value);
            chrome.runtime.sendMessage({ type: "onHandleSearch", data: { "search_category": "friends", "search_key": event.target.value } },
                function (res) {
                    console.log('Greetings receives reply from background for onHandleSearch ', res.data);
                    if (res.status === 200) {
                        this.setState({ search_result: res.data });
                    }
                    else {
                        this.setState({ search_result: "" });
                    }
                }
            );
        }
    }
    render() {
        return (
            <Grid container spacing={0} alignItems="center" >
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" />
                </Grid>
                <Grid item xs={10}>

                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h4" color="inherit" style={{ "fontSize": 16, "paddingTop": 5, "paddingBottom": 5 }}>
                        What's popular
                        </Typography>
                    <Paper style={{ maxHeight: 540, width: 400, overflow: 'auto' }}>
                        {
                            this.state.friends_product_list.map((product) => (
                                <Card key={product._id}>
                                    <Grid container spacing={0}  >
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

                                                <Typography variant="body2" color="textSecondary" component="p">
                                                    purchased by {product.friends_bought.join(', ')}
                                                </Typography>
                                            </CardContent>

                                            <CardActions>
                                                <IconButton aria-label="add to favorites">
                                                    <FavoriteIcon style={{ fontSize: 20 }} />
                                                </IconButton>
                                                <IconButton aria-label="share">
                                                    <ShareIcon style={{ fontSize: 20 }} />
                                                </IconButton>
                                                {
                                                    this.is_expanded(product._id) ?
                                                        <IconButton
                                                            onClick={() => this.onCollapesClick(product._id)}
                                                            aria-expanded={true}
                                                            aria-label="show less"
                                                        >
                                                            <ExpandLessIcon style={{ fontSize: 20 }} />
                                                        </IconButton>
                                                        :
                                                        <IconButton
                                                            onClick={() => this.onExpandClick(product._id)}
                                                            aria-expanded={false}
                                                            aria-label="show more"
                                                        >
                                                            <ExpandMoreIcon style={{ fontSize: 20 }} />
                                                        </IconButton>
                                                }
                                            </CardActions>
                                            <Collapse in={this.is_expanded(product._id)} timeout="auto" unmountOnExit>
                                                <CardContent>
                                                    <Typography paragraph>Product Summary:</Typography>
                                                    <Typography paragraph>
                                                        {product.product_summary}
                                                    </Typography>
                                                    <Typography paragraph>Product Reviews:</Typography>
                                                    <Typography paragraph>
                                                        To be added.
                                                        </Typography>

                                                </CardContent>
                                            </Collapse>
                                        </Grid>

                                    </Grid>
                                </Card>
                            ))
                        }
                    </Paper>
                </Grid>
            </Grid>

        );
    }
}

export default RecommmendationPage;
