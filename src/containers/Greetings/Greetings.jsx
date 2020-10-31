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
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        marginTop: 20,
    },
    paper: {
        color: theme.palette.text.secondary,
        width: 400,
        maxHeight: 450,
        overflow: 'auto',
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
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
        for (let i = 0; i < product_list.length; i++){
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

    handleExpandClick = (product_id) => {
        console.log('Expand Clicked');
        let new_product_expanded = this.state.product_expanded;
        Object.assign(new_product_expanded, {product_id: !new_product_expanded[product_id]}); //toggle
        this.setState({
            product_expanded: new_product_expanded
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
                        <Typography variant="h5" color="inherit">
                            Welcome! {this.state.user_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Button className="button" onClick={this.props.onLogOut}>
                            Log Out
				        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper style={classes.paper}>
                            {
                                this.state.self_product_list.map((product) => (
                                    <Card key={product._id} m={50}>
                                        <Grid container spacing={3} >
                                            <Grid item xs={4}>
                                                <CardActionArea>
                                                    <img alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                                                </CardActionArea>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <CardContent >
                                                    <Typography gutterBottom variant="body2" component="h5">
                                                        {(product.product_title)}
                                                    </Typography>

                                                    <Typography variant="body2" color="textSecondary" component="p">
                                                        ${product.product_cost}
                                                    </Typography>
                                                </CardContent>

                                                <CardActions disableSpacing>
                                                    <IconButton aria-label="add to favorites">
                                                        <FavoriteIcon />
                                                    </IconButton>
                                                    <IconButton aria-label="share">
                                                        <ShareIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        className={clsx(classes.expand, {
                                                            [classes.expandOpen]: this.state.product_expanded[product._id],
                                                        })}
                                                        onClick={this.handleExpandClick}
                                                        aria-expanded={this.state.product_expanded[product._id]}
                                                        aria-label="show more"
                                                    >
                                                        <ExpandMoreIcon />
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


            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Greetings);
