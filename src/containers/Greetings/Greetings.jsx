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
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import './Greetings.css';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        marginTop: 20,
    },
    paper: {
        color: theme.palette.text.secondary,
        width: 400,
    },
}));


class Greetings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: this.props.user_name,
            user_id: this.props.user_id,
            self_product_list: [],
            product_expanded: {},
        }
        console.log(this.state);
    }


    updateSelfProductList = (product_list) => {
        let product_expanded = []
        for (let i = 0; i < product_list.length; i++) {
            const product = product_list[i];
            product_expanded[product._id] = false;
        }
        this.setState({
            self_product_list: product_list,
            product_expanded: product_expanded,
        });
        console.log("State product list updated: ", this.state);
    }

    componentDidMount = () => {
        const updateSelfProductList = this.updateSelfProductList;
        chrome.runtime.sendMessage({ type: "onLoadSelfProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfProductList succeeded.");
                    updateSelfProductList(res.data.product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
                }
            }
        );
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.user_name !== this.props.user_name) {
            if (this.props.user_name === "") {
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_name: this.props.user_name
            });
        }
        if (prevProps.user_id !== this.props.user_id) {
            if (this.props.user_id === "") {
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_id: this.props.user_id
            });
            const updateSelfProductList = this.updateSelfProductList;
            chrome.runtime.sendMessage({ type: "onLoadSelfProductList" },
                function (res) {
                    console.log('Greetings receives reply from background for onLoadSelfProductList ', res.data);
                    if (res.status === 200) {
                        console.log("onLoadSelfProductList succeeded.");
                        updateSelfProductList(res.data.product_list);
                    }
                    else {
                        console.error(res.data + ", onLoadSelfProductList failed.");
                    }
                }
            );
        }

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

    onDeleteProduct(product_id) {
        console.log("product to be delete has id", product_id);
        let new_self_product_list = this.state.self_product_list.filter(item => item['_id'] !== product_id);
        let new_product_expanded = this.state.product_expanded;
        delete new_product_expanded[product_id];
        this.setState({
            self_product_list: new_self_product_list,
            product_expanded: new_product_expanded,
        });
    }

    render() {
        const classes = this.props;
        return (
            <div className="container">
                <Grid container spacing={3} >
                    <Grid item xs={3}>
                        <img class="topleft" src={icon} alt="extension icon" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" color="inherit" style={{ "fontSize": 20 }}>
                            Welcome! {this.state.user_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Button onClick={this.props.onLogOut} style={{ "fontSize": 10 }}>
                            Log Out
				        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper style={{ maxHeight: 540, width: 400, overflow: 'auto' }}>
                            {
                                this.state.self_product_list.map((product) => (
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
                                                </CardContent>

                                                <CardActions>
                                                    <IconButton aria-label="add to favorites">
                                                        <FavoriteIcon style={{ fontSize: 20 }}/>
                                                    </IconButton>
                                                    <IconButton aria-label="share">
                                                        <ShareIcon style={{ fontSize: 20 }} />
                                                    </IconButton>
                                                    {
                                                        this.is_expanded(product._id) ?
                                                            <IconButton
                                                                className={classes.expand}
                                                                onClick={() => this.onCollapesClick(product._id)}
                                                                aria-expanded={true}
                                                                aria-label="show less"
                                                            >
                                                                <ExpandLessIcon style={{ fontSize: 20 }}/>
                                                            </IconButton>
                                                            :
                                                            <IconButton
                                                                className={classes.expandOpen}
                                                                onClick={() => this.onExpandClick(product._id)}
                                                                aria-expanded={false}
                                                                aria-label="show more"
                                                            >
                                                                <ExpandMoreIcon style={{ fontSize: 20 }}/>
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
                                            <Grid item xs={1}>
                                                <CardActions>
                                                    <IconButton
                                                        style={{padding: 0, height: 18,  width: 18}} 
                                                        iconStyle={{width: 18, height: 18}}
                                                        onClick={() => this.onDeleteProduct(product._id)}
                                                    >
                                                        <DeleteIcon style={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </CardActions>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))
                            }
                        </Paper>
                    </Grid>
                </Grid>


            </div >
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Greetings);
